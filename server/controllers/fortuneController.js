import OpenAI from 'openai';
import db from '../config/db.js';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * 1. [POST] /api/fortune/analyze
 * 서버에서 코인 잔액을 직접 검증하고, 분석 성공 시에만 코인을 차감합니다.
 */
export const analyzeFortune = async (req, res) => {
    console.log("--- [START] 보안 검사 및 사주 분석 시작 ---");
    try {
        const { resultId, type, realName, nickName, birthDate, birthTime, gender } = req.body;
        const line_user_id = req.user.userId; // 미들웨어(verifyToken)에서 추출된 보안 ID

        // [STEP 1] 항목별 필요 코인 설정 (요청받은 type 문자열 기준)
        let requiredCoins = 1; // 기본값 (gacha 등)
        if (['saju', 'personality', 'wealth', 'romance'].includes(type)) {
            requiredCoins = 2; // 사주 관련 항목은 2개
        }

        console.log(`🔍 유저(${line_user_id}) 코인 검사 중... 필요 코인: ${requiredCoins}`);

        // [STEP 2] DB에서 유저의 실제 코인 잔액 조회 (F12 조작 방지)
        const [userRows] = await db.execute(
            `SELECT coins FROM users WHERE line_user_id = ?`,
            [line_user_id]
        );

        if (userRows.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        const currentCoins = userRows[0].coins;

        // [STEP 3] 코인 부족 시 즉시 차단 (AI 호출 전)
        if (currentCoins < requiredCoins) {
            console.log(`🚫 코인 부족 실패: 보유 ${currentCoins} / 필요 ${requiredCoins}`);
            return res.status(403).json({ 
                code: "INSUFFICIENT_COINS", 
                message: "เหรียญไม่พอ กรุณาเติมเหรียญก่อนใช้งาน" 
            });
        }

        // [STEP 4] GPT-4o-mini 분석 요청
        console.log("🤖 GPT-4o-mini 분석 요청 중...");
        const systemPrompt = `
            You are 'Murdoo K', a mystical master of astrology. 
            Analyze fate by integrating Korean Saju and Thai Astrology.
            Language: Thai. Style: Premium.
            Format: JSON (summary, outward, inward, strengths, weaknesses, cautions, boosters).
        `;

        const userPrompt = `Data: ${realName}(${nickName}), ${birthDate} ${birthTime}, ${gender}. Type: ${type}`;

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
        const { summary, ...details } = fortuneData;

        // [STEP 5] DB 트랜잭션 처리 (결과 저장 + 코인 차감을 동시에)
        console.log("💾 결과 저장 및 코인 차감 진행...");
        
        // 1. 결과 저장
        await db.execute(
            `INSERT INTO fortune_results 
            (result_id, line_user_id, fortune_type, summary_text, detail_data) 
            VALUES (?, ?, ?, ?, ?)`,
            [resultId, line_user_id, type, summary, JSON.stringify(details)]
        );

        // 2. 코인 차감
        await db.execute(
            `UPDATE users SET coins = coins - ? WHERE line_user_id = ?`,
            [requiredCoins, line_user_id]
        );

        console.log(`🎉 성공: [ID: ${resultId}] ${requiredCoins}코인이 차감되었습니다.`);
        res.json({ resultId });

    } catch (err) {
        console.error('❌ 서버 내부 에러:', err);
        res.status(500).json({ error: 'Failed to analyze fortune', message: err.message });
    }
};

/**
 * 2. [GET] /api/fortune/result/:id
 * 결과 조회 (기존 로직 동일)
 */
export const getFortuneResult = async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await db.execute(`SELECT * FROM fortune_results WHERE result_id = ?`, [id]);
        if (rows.length === 0) return res.status(404).json({ error: 'Result not found' });

        const result = rows[0];
        if (typeof result.detail_data === 'string') result.detail_data = JSON.parse(result.detail_data);

        res.json({
            fortune_type: result.fortune_type,
            summary: result.summary_text,
            details: result.detail_data
        });
    } catch (err) {
        console.error('❌ 결과 조회 실패:', err);
        res.status(500).json({ error: 'Database error' });
    }
};
