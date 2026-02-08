import OpenAI from 'openai';
import db from '../config/db.js';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * 1. [POST] /api/fortune/analyze
 * 수정사항: summary_text 컬럼 제거 및 detail_data 통합 저장
 */
export const analyzeFortune = async (req, res) => {
    console.log("--- [START] 사주 분석 시작 ---");
    try {
        const { resultId, type, realName, nickName, birthDate, birthTime, gender } = req.body;
        const line_user_id = req.user.userId;

        console.log(`📥 요청 데이터 수신: [ID: ${resultId}] [Type: ${type}]`);

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

        // [핵심 수정] summary를 포함한 전체 데이터를 JSON으로 저장
        console.log(`💾 데이터베이스 저장 시도... (ID: ${resultId})`);
        
        await db.execute(
            `INSERT INTO fortune_results 
            (result_id, line_user_id, fortune_type, detail_data) 
            VALUES (?, ?, ?, ?)`,
            [
                resultId, 
                line_user_id, 
                type, 
                JSON.stringify(fortuneData) // summary가 이 안에 포함됨
            ]
        );

        console.log("🎉 사주 분석 완료 및 저장 성공");
        res.json({ resultId });

    } catch (err) {
        console.error('❌ 분석 실패 상세 로그:', err);
        res.status(500).json({ error: 'Failed to analyze fortune', message: err.message });
    }
};

/**
 * 2. [GET] /api/fortune/result/:id
 * 수정사항: summary_text 대신 detail_data 내의 summary 필드 반환
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
            summary: details.summary, // JSON 데이터에서 추출
            details: details         // 전체 데이터 전달
        });
    } catch (err) {
        res.status(500).json({ error: 'Database error' });
    }
};

/**
 * 3. [GET] /api/fortune/history
 * 수정사항: summary_text 컬럼 제거에 따른 쿼리 수정
 */
export const getFortuneHistory = async (req, res) => {
    try {
        const line_user_id = req.user.userId;

        // summary_text 컬럼이 없으므로, 대신 detail_data에서 필요한 정보를 프론트에서 파싱해야 함
        // 혹은 필요한 요약만 가져오고 싶다면 쿼리에서 JSON_EXTRACT 사용 가능
        const [rows] = await db.execute(
            `SELECT result_id, fortune_type, detail_data, created_at 
             FROM fortune_results 
             WHERE line_user_id = ? 
             ORDER BY created_at DESC`,
            [line_user_id]
        );

        // 결과 리스트 가공 (JSON 내의 summary만 추출해서 반환)
        const history = rows.map(row => {
            const details = typeof row.detail_data === 'string' ? JSON.parse(row.detail_data) : row.detail_data;
            return {
                result_id: row.result_id,
                fortune_type: row.fortune_type,
                summary: details.summary || "ดูดวงส่วนตัว", // 기본 태국어 문구
                created_at: row.created_at
            };
        });

        res.json(history);

    } catch (err) {
        res.status(500).json({ error: 'Database error', message: err.message });
    }
};
