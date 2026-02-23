import OpenAI from 'openai';
import db from '../config/db.js';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * 1. [POST] /api/fortune/analyze
 * 수정사항: 코인 잔액 확인 및 트랜잭션(차감+저장) 적용
 */
export const analyzeFortune = async (req, res) => {
    console.log("--- [START] 사주 분석 시작 ---");
    
    // Passport 인증 미들웨어 통과 후 req.user에 userId가 있다고 가정
    const line_user_id = req.user ? req.user.userId : null;
    const { resultId, type, realName, nickName, birthDate, birthTime, gender } = req.body;
    
    // ✅ 가격 설정 (사주 분석 코인 비용)
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

        // ❌ 코인 부족 시 403 리턴
        if (currentCoins < COST) {
            console.warn(`⚠️ 코인 부족!`);
            conn.release();
            return res.status(403).json({ error: 'INSUFFICIENT_COINS' });
        }

        // --- [Step 2] AI 분석 요청 ---
        const systemPrompt = `
            You are 'Murdoo K', a mystical and highly professional master of astrology. 
            Analyze the user's fate by perfectly integrating Korean Saju (Four Pillars of Destiny) and Thai Astrology.

            [Operational Guidelines]
            1. Language: MUST write exclusively in Thai.
            2. Tone: Mystical, deep, and authoritative.
            3. Length: Each sector detailed (approx. 500-700 characters).
            4. Address: Use "คุณ" to refer to the user.

            [JSON Structure - STRICT]
            {
                "summary": "One-line essence of fate (Thai)",
                "outward": "...",
                "inward": "...",
                "strengths": "...",
                "weaknesses": "...",
                "cautions": "...",
                "boosters": "..."
            }
        `;

        const userPrompt = `
            [User Data]
            - Name: ${realName} (Nickname: ${nickName})
            - Birth: ${birthDate} at ${birthTime}
            - Gender: ${gender}
            
            [Request]
            Premium-grade personality analysis in Thai following the 7-sector JSON structure.
        `;

        console.log("🤖 GPT-4o-mini 분석 요청 중...");
        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt }
            ],
            response_format: { type: "json_object" },
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

        await conn.commit(); // ✅ 커밋
        console.log("🎉 사주 분석 완료 및 저장 성공");
        
        res.json({ resultId });

    } catch (err) {
        await conn.rollback(); // ❌ 에러 시 롤백
        console.error('❌ 분석 실패 상세 로그:', err);
        res.status(500).json({ error: 'Failed to analyze fortune', message: err.message });
    } finally {
        conn.release();
    }
};

// ... (getFortuneResult, getFortuneHistory는 기존과 동일하므로 생략하거나 그대로 두시면 됩니다)
/**
 * 2. [GET] /api/fortune/result/:id
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
