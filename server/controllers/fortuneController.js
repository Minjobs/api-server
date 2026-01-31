import OpenAI from 'openai';
import db from '../config/db.js';

// 클라이언트가 ID를 보내므로 서버에서 uuid 라이브러리는 더 이상 필요 없으나, 
// 다른 용도가 없다면 수입 구문을 제거해도 됩니다.
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * 1. [POST] /api/fortune/analyze
 * 클라이언트에서 생성한 resultId를 받아 AI 분석 후 DB 저장
 */
export const analyzeFortune = async (req, res) => {
    console.log("--- [START] 사주 분석 시작 ---");
    try {
        // [핵심] 클라이언트가 생성해서 보낸 resultId를 Body에서 받습니다.
        const { resultId, type, realName, nickName, birthDate, birthTime, gender } = req.body;
        const line_user_id = req.user.userId;

        console.log(`📥 요청 데이터 수신: [ID: ${resultId}] [Type: ${type}]`);

        // [1] GPT-4o-mini System Prompt
        const systemPrompt = `
            You are 'Murdoo K', a mystical and highly professional master of astrology. 
            Analyze the user's fate by perfectly integrating Korean Saju (Four Pillars of Destiny) and Thai Astrology.

            [Operational Guidelines]
            1. Language: MUST write exclusively in Thai.
            2. Tone: Mystical, deep, and authoritative (Premium service quality).
            3. Length: Each sector should be very detailed and insightful (approx. 500-700 characters in Thai). Do not exceed 800 characters per sector to avoid technical errors.
            4. Style: Provide specific spiritual guidance, not just generic traits.
            5. Address: Use "คุณ" to refer to the user.

            [JSON Structure - STRICT]
            {
                "summary": "One-line essence of fate (Thai)",
                "outward": "Deep analysis of external personality and social mask (Thai)",
                "inward": "Hidden instincts and internal psychological world (Thai)",
                "strengths": "Celestial talents and powerful advantages (Thai)",
                "weaknesses": "Spiritual lessons and traits to improve (Thai)",
                "cautions": "Specific situations and mindsets to avoid (Thai)",
                "boosters": "Lucky colors, items, and directions with reasoning (Thai)"
            }
        `;

        // [2] GPT-4o-mini User Prompt
        const userPrompt = `
            [User Data]
            - Name: ${realName} (Nickname: ${nickName})
            - Birth: ${birthDate} at ${birthTime}
            - Gender: ${gender}
            
            [Request]
            Please provide a premium-grade personality analysis following the 7-sector JSON structure. 
            Combine the logical 5-elements theory of Saju with the celestial movements of Thai Astrology.
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

        console.log("✅ AI 응답 수신 성공");

        const fortuneData = JSON.parse(completion.choices[0].message.content);
        const { summary, ...details } = fortuneData;

        // [3] DB 저장 (클라이언트에서 받은 resultId를 PK로 사용)
        console.log(`💾 데이터베이스 저장 시도... (ID: ${resultId})`);
        
        await db.execute(
            `INSERT INTO fortune_results 
            (result_id, line_user_id, fortune_type, summary_text, detail_data) 
            VALUES (?, ?, ?, ?, ?)`,
            [
                resultId, 
                line_user_id, 
                type, 
                summary, 
                JSON.stringify(details)
            ]
        );

        console.log("🎉 저장 완료! 클라이언트로 응답을 보냅니다.");
        res.json({ resultId });

    } catch (err) {
        console.error('❌ 분석 실패 상세 로그:', err);
        // 클라이언트가 보낸 resultId가 이미 DB에 있을 경우(중복 요청) 에러가 날 수 있으나, 
        // 멱등성(Idempotency)을 보장하는 측면에서 안전장치가 됩니다.
        res.status(500).json({ error: 'Failed to analyze fortune', message: err.message });
    }
};

/**
 * 2. [GET] /api/fortune/result/:id
 * 특정 result_id에 해당하는 결과를 조회 (폴링 및 결과 출력용)
 */
export const getFortuneResult = async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`🔍 결과 조회 요청: ${id}`);
        
        const [rows] = await db.execute(
            `SELECT * FROM fortune_results WHERE result_id = ?`, 
            [id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Result not found' });
        }

        const result = rows[0];

        // detail_data 파싱
        if (typeof result.detail_data === 'string') {
            result.detail_data = JSON.parse(result.detail_data);
        }

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

/**
 * 3. [GET] /api/fortune/history
 * 유저 본인의 모든 사주 기록을 최신순으로 가져옵니다.
 */
export const getFortuneHistory = async (req, res) => {
    console.log("--- [START] 히스토리 조회 시작 ---");
    try {
        const line_user_id = req.user.userId; // 인증 미들웨어에서 가져온 유저 ID

        // 최신순(created_at DESC)으로 result_id, 타입, 요약문, 생성일자만 추출
        const [rows] = await db.execute(
            `SELECT result_id, fortune_type, summary_text, created_at 
             FROM fortune_results 
             WHERE line_user_id = ? 
             ORDER BY created_at DESC`,
            [line_user_id]
        );

        console.log(`✅ 조회 완료: ${rows.length}건의 기록 발견`);
        
        // 데이터가 없어도 빈 배열([])을 반환하여 프론트엔드 에러를 방지합니다.
        res.json(rows);

    } catch (err) {
        console.error('❌ 히스토리 조회 실패:', err);
        res.status(500).json({ error: 'Database error', message: err.message });
    }
};
