import OpenAI from 'openai';
import db from '../config/db.js';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// [중복 방지] 현재 분석이 진행 중인 요청을 추적하는 메모리 맵
const activeLoveJobs = new Map();

/**
 * 1. [POST] /api/love/analyze
 * DB 컬럼명(line_user_id) 반영 및 summary_text 제거 버전
 */
export const analyzeLove = async (req, res) => {
    const { resultId, me, partner, relationship } = req.body;
    
    // 유저 인증 정보 확인
    if (!req.user || !req.user.userId) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    const line_user_id = req.user.userId;

    console.log(`--- [Love] 분석 시작 (ID: ${resultId}) ---`);

    try {
        // [수정 1] 유저 코인 잔액 확인 (user_id -> line_user_id)
        const [userRows] = await db.execute(
            `SELECT coins FROM users WHERE line_user_id = ?`,
            [line_user_id]
        );

        if (userRows.length === 0 || userRows[0].coins < 2) {
            console.log(`⚠️ 코인 부족: ${line_user_id}`);
            return res.status(403).json({ error: 'INSUFFICIENT_COINS' });
        }

        // [기존 1] DB 중복 체크
        const [existing] = await db.execute(
            `SELECT result_id FROM fortune_results WHERE result_id = ?`,
            [resultId]
        );

        if (existing.length > 0) {
            console.log("♻️ 이미 존재하는 결과입니다.");
            return res.json({ resultId, status: 'already_done' });
        }

        // [기존 2] 진행 중 중복 체크
        if (activeLoveJobs.has(resultId)) {
            console.log("⏳ 현재 같은 ID로 분석이 진행 중입니다.");
            return res.status(202).json({ message: 'Still calculating...' });
        }

        activeLoveJobs.set(resultId, true);

        // [기존 3] 시스템 프롬프트 (수정 없음)
        const systemPrompt = `
            You are 'Master Murdoo K', the leading expert in "Korean Saju" (ศาสตร์ 4 เสาหลักแห่งดวงชะตา). 
            Your mission is to analyze love compatibility using only the principles of Korean Saju.
            1. Language: MUST write exclusively in Thai (ภาษาไทย).
            2. No Hanja: Do NOT use any Chinese characters (Hanja). Translate them into easy-to-understand Thai terms.
            3. Context: Provide deeply personalized advice based on status: ${relationship}.
        `;

        const userPrompt = `
            [Korean Saju Destiny Data]
            - User (Me): Name: ${me.name}, Birth: ${me.birth}, Time: ${me.time}
            - Partner: Name: ${partner.name}, Birth: ${partner.birth}, Time: ${partner.time}
            - Current Relationship Status: ${relationship}
            Analyze energy flow and paths.
        `;

        // [기존 4] OpenAI Structured Outputs 요청
        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [{ role: "system", content: systemPrompt }, { role: "user", content: userPrompt }],
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
            }
        });

        const loveResult = JSON.parse(completion.choices[0].message.content);

        // [수정 5] DB 저장 및 코인 차감 (summary_text 제거 및 line_user_id 적용)
        const conn = await db.getConnection();
        try {
            await conn.beginTransaction();

            // 결과 저장 (summary_text 컬럼 제외)
            await conn.execute(
                `INSERT IGNORE INTO fortune_results 
                (result_id, line_user_id, fortune_type, detail_data) 
                VALUES (?, ?, ?, ?)`,
                [
                    resultId, 
                    line_user_id, 
                    'love', 
                    JSON.stringify(loveResult)
                ]
            );

            // 코인 2개 차감 (user_id -> line_user_id)
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
