import { v4 as uuidv4 } from 'uuid';
import OpenAI from 'openai';
import db from '../config/db.js';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const analyzeFortune = async (req, res) => {
    console.log("--- [START] 사주 분석 시작 ---");
    try {
        const { type, realName, nickName, birthDate, birthTime, gender } = req.body;
        const line_user_id = req.user.userId;

        // [1] 시스템 프롬프트 수정: 글자 수를 현실적으로 조정 (섹션당 약 500~700자)
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

        // [2] 유저 프롬프트 수정: 데이터 구조화
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
            // 타임아웃 방지를 위해 약간의 여유를 둠
            temperature: 0.7 
        });

        console.log("✅ AI 응답 수신 성공");

        const fortuneData = JSON.parse(completion.choices[0].message.content);
        const resultId = uuidv4();

        const { summary, ...details } = fortuneData;

        // [3] DB 저장 시 에러 핸들링 강화
        console.log("💾 데이터베이스 저장 시도...");
        
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

        console.log("🎉 저장 완료! Result ID:", resultId);
        res.json({ resultId });

    } catch (err) {
        console.error('❌ 분석 실패 상세 로그:', err);
        // 에러가 발생해도 클라이언트가 무한 로딩에 빠지지 않게 응답을 보냅니다.
        res.status(500).json({ error: 'Failed to analyze fortune', message: err.message });
    }
};


// 특정 결과 조회 컨트롤러
export const getFortuneResult = async (req, res) => {
    try {
        const { id } = req.params;
        
        // result_id로 데이터 조회
        const [rows] = await db.execute(
            `SELECT * FROM fortune_results WHERE result_id = ?`, 
            [id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Result not found' });
        }

        const result = rows[0];

        // MySQL의 JSON 타입은 이미 객체로 반환될 수도 있지만, 
        // 환경에 따라 문자열일 수 있으므로 체크 후 파싱합니다.
        if (typeof result.detail_data === 'string') {
            result.detail_data = JSON.parse(result.detail_data);
        }

        // 프론트엔드에 필요한 데이터만 정제해서 전송
        res.json({
            fortune_type: result.fortune_type,
            summary: result.summary_text,
            details: result.detail_data // 성격, 재물 등 타입에 따른 JSON 객체
        });
    } catch (err) {
        console.error('❌ 결과 조회 실패:', err);
        res.status(500).json({ error: 'Database error' });
    }
};
