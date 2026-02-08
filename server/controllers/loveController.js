import OpenAI from 'openai';
import db from '../config/db.js';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// [중복 방지] 현재 분석이 진행 중인 요청을 추적하는 메모리 맵
const activeLoveJobs = new Map();

/**
 * 1. [POST] /api/love/analyze
 * DB 컬럼명(line_user_id) 반영 및 분석/차감 로직 통합
 */
export const analyzeLove = async (req, res) => {
    const { resultId, me, partner, relationship } = req.body;
    
    // 유저 인증 정보 확인 (req.user.userId가 DB의 line_user_id와 매칭됨)
    if (!req.user || !req.user.userId) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    const line_user_id = req.user.userId;

    console.log(`--- [Love] 분석 시작 (ID: ${resultId}) ---`);

    try {
        // [1] 유저 코인 잔액 확인 (user_id -> line_user_id로 수정)
        const [userRows] = await db.execute(
            `SELECT coins FROM users WHERE line_user_id = ?`,
            [line_user_id]
        );

        if (userRows.length === 0 || userRows[0].coins < 2) {
            console.log(`⚠️ 코인 부족: ${line_user_id}`);
            return res.status(403).json({ error: 'INSUFFICIENT_COINS' });
        }

        // [2] DB 중복 체크 (이미 결과가 있는지)
        const [existing] = await db.execute(
            `SELECT result_id FROM fortune_results WHERE result_id = ?`,
            [resultId]
        );

        if (existing.length > 0) {
            console.log("♻️ 이미 존재하는 결과입니다.");
            return res.json({ resultId, status: 'already_done' });
        }

        // [3] 진행 중 중복 체크 (GPT 호출 중인지)
        if (activeLoveJobs.has(resultId)) {
            console.log("⏳ 현재 같은 ID로 분석이 진행 중입니다.");
            return res.status(202).json({ message: 'Still calculating...' });
        }

        activeLoveJobs.set(resultId, true);

        // [4] 시스템 프롬프트 설정 (기존 로직 유지)
        const systemPrompt = `
            You are 'Master Murdoo K', the leading expert in "Korean Saju". 
            Your mission is to analyze love compatibility using only the principles of Korean Saju.
            1. Language: MUST write exclusively in Thai (ภาษาไทย).
            2. No Hanja: Translate 5 Elements into Thai terms (Wood, Fire, Earth, Metal, Water).
            3. Context: Provide deeply personalized advice based on status: ${relationship}.
        `;

        const userPrompt = `
            [Korean Saju Destiny Data]
            - User (Me): Name: ${me.name}, Birth: ${me.birth}, Time: ${me.time}
            - Partner: Name: ${partner.name}, Birth: ${partner.birth}, Time: ${partner.time}
            - Current Relationship Status: ${relationship}
            Provide a detailed analysis in Thai using JSON schema.
        `;

        // [5] OpenAI Structured Outputs 요청
        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt }
            ],
            response_format: {
                type: "json_schema",
                json_schema: {
                    name: "love_compatibility_analysis",
                    strict: true,
                    schema: {
                        type: "object",
                        properties: {
                            score: { type: "number" },
                            chemistry: { type: "string" },
                            strengths: { type: "string" },
                            challenges: { type: "string" },
                            status_advice: { type: "string" },
                            future: { type: "string" },
                            boosters: { type: "string" }
                        },
                        required: ["score", "chemistry", "strengths", "challenges", "status_advice", "future", "boosters"],
                        additionalProperties: false
                    }
                }
            },
            temperature: 0.7
        });

        const loveResult = JSON.parse(completion.choices[0].message.content);

        // [6] DB 저장 및 코인 차감 (트랜잭션)
        const conn = await db.getConnection();
        try {
            await conn.beginTransaction();

            // 결과 저장 (summary_text 컬럼 제외)
            await conn.execute(
                `INSERT IGNORE INTO fortune_results 
                (result_id, line_user_id, fortune_type, detail_data) 
                VALUES (?, ?, ?, ?)`,
                [resultId, line_user_id, 'love', JSON.stringify(loveResult)]
            );

            // 코인 2개 차감 (user_id -> line_user_id로 수정)
            await conn.execute(
                `UPDATE users SET coins = coins - 2 WHERE line_user_id = ?`,
                [line_user_id]
            );

            await conn.commit();
            console.log(`✅ 분석 완료 및 코인 차감 성공: ${resultId}`);
            res.json({ resultId });

        } catch (dbErr) {
            await conn.rollback();
            throw dbErr;
        } finally {
            conn.release();
        }

    } catch (err) {
        console.error('❌ 분석 에러:', err);
        res.status(500).json({ error: 'Analysis failed', message: err.message });
    } finally {
        activeLoveJobs.delete(resultId);
    }
};

export const getLoveResult = async (req, res) => {
    try {
        const { id } = req.params;
        const line_user_id = req.user.userId; // 본인 결과만 보게 하려면 필요

        console.log(`🔍 궁합 결과 조회 요청: ${id}`);

        const [rows] = await db.execute(
            `SELECT * FROM fortune_results WHERE result_id = ?`, 
            [id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Result not found' });
        }

        const result = rows[0];

        // detail_data 파싱 (JSON 타입이면 바로 사용, 문자열이면 JSON.parse)
        const details = typeof result.detail_data === 'string' 
            ? JSON.parse(result.detail_data) 
            : result.detail_data;

        // 프론트엔드(love_result.html)가 기대하는 데이터 구조로 반환
        res.json(details);

    } catch (err) {
        console.error('❌ 결과 조회 실패:', err);
        res.status(500).json({ error: 'Database error' });
    }
};