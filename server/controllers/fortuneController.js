import OpenAI from 'openai';
import db from '../config/db.js';
import { SAJU_ASSET } from '../utils/promptTemplates.js'; // ✅ 가져오기

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * 1. [POST] /api/fortune/analyze
 * 사주 분석 및 결과 저장 (SAJU_ASSET 활용)
 */
export const analyzeFortune = async (req, res) => {
    console.log("--- [START] 사주 분석 시작 ---");
    
    const line_user_id = req.user ? req.user.userId : null;
    const { resultId, type, realName, nickName, birthDate, birthTime, gender } = req.body;
    
    // ✅ 가격 설정
    const COST = 3; 

    console.log(`📥 요청 데이터: [ID: ${resultId}] [User: ${line_user_id}]`);

    if (!line_user_id) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const conn = await db.getConnection();

    try {
        // --- [Step 1] 코인 잔액 확인 ---
        const [userRows] = await conn.execute(
            `SELECT coins FROM users WHERE line_user_id = ?`,
            [line_user_id]
        );

        if (userRows.length === 0) {
            return res.status(404).json({ error: 'USER_NOT_FOUND' });
        }

        const currentCoins = userRows[0].coins;
        console.log(`💰 보유 코인: ${currentCoins} / 필요 코인: ${COST}`);

        if (currentCoins < COST) {
            console.warn(`⚠️ 코인 부족!`);
            conn.release();
            return res.status(403).json({ error: 'INSUFFICIENT_COINS' });
        }

        // --- [Step 2] AI 분석 요청 (SAJU_ASSET 활용) ---
        // ✅ 템플릿에서 프롬프트 가져오기
        const { system, user } = SAJU_ASSET.getPrompts(realName, nickName, birthDate, birthTime, gender);

        console.log("🤖 GPT-4o-mini 분석 요청 중...");
        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: system },
                { role: "user", content: user }
            ],
            // ✅ Structured Outputs (JSON Schema) 적용
            response_format: {
                type: "json_schema",
                json_schema: SAJU_ASSET.schema
            },
            temperature: 0.7 
        });

        const fortuneData = JSON.parse(completion.choices[0].message.content);

        // --- [Step 3] 트랜잭션 시작 (DB 저장 + 코인 차감) ---
        await conn.beginTransaction();

        // 1. 결과 저장
        await conn.execute(
            `INSERT INTO fortune_results 
            (result_id, line_user_id, fortune_type, detail_data) 
            VALUES (?, ?, ?, ?)`,
            [resultId, line_user_id, type, JSON.stringify(fortuneData)]
        );

        // 2. 코인 차감
        await conn.execute(
            `UPDATE users SET coins = coins - ? WHERE line_user_id = ?`,
            [COST, line_user_id]
        );

        await conn.commit();
        console.log("🎉 사주 분석 완료 및 저장 성공");
        
        res.json({ resultId });

    } catch (err) {
        await conn.rollback();
        console.error('❌ 분석 실패 상세 로그:', err);
        res.status(500).json({ error: 'Failed to analyze fortune', message: err.message });
    } finally {
        conn.release();
    }
};

/**
 * 2. [GET] /api/fortune/result/:id
 * 결과 조회 (변경 없음)
 */
export const getFortuneResult = async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await db.execute(
            `SELECT * FROM fortune_results WHERE result_id = ?`, 
            [id]
        );

        if (rows.length === 0) return res.status(404).json({ error: 'Result not found' });

        const result = rows[0];
        const details = typeof result.detail_data === 'string' 
            ? JSON.parse(result.detail_data) 
            : result.detail_data;

        res.json({
            fortune_type: result.fortune_type,
            summary: details.summary,
            details: details
        });
    } catch (err) {
        res.status(500).json({ error: 'Database error' });
    }
};

/**
 * 3. [GET] /api/fortune/history
 * 기록 조회 (변경 없음)
 */
export const getFortuneHistory = async (req, res) => {
    try {
        const line_user_id = req.user.userId;
        const [rows] = await db.execute(
            `SELECT result_id, fortune_type, detail_data, created_at 
             FROM fortune_results 
             WHERE line_user_id = ? 
             ORDER BY created_at DESC`,
            [line_user_id]
        );

        const history = rows.map(row => {
            const details = typeof row.detail_data === 'string' ? JSON.parse(row.detail_data) : row.detail_data;
            return {
                result_id: row.result_id,
                fortune_type: row.fortune_type,
                summary: details.summary || "ดูดวงส่วนตัว",
                created_at: row.created_at
            };
        });

        res.json(history);
    } catch (err) {
        res.status(500).json({ error: 'Database error', message: err.message });
    }
};

export const getFortuneHistory = async (req, res) => {
    try {
        const line_user_id = req.user.userId;
        const [rows] = await db.execute(
            `SELECT result_id, fortune_type, detail_data, created_at 
             FROM fortune_results 
             WHERE line_user_id = ? 
             ORDER BY created_at DESC`,
            [line_user_id]
        );

        const history = rows.map(row => {
            const details = typeof row.detail_data === 'string' ? JSON.parse(row.detail_data) : row.detail_data;
            return {
                result_id: row.result_id,
                fortune_type: row.fortune_type,
                summary: details.summary || "ดูดวงส่วนตัว",
                created_at: row.created_at
            };
        });

        res.json(history);
    } catch (err) {
        res.status(500).json({ error: 'Database error', message: err.message });
    }
};
