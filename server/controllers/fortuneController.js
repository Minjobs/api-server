import { v4 as uuidv4 } from 'uuid';
import OpenAI from 'openai';
import db from '../config/db.js';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const analyzeFortune = async (req, res) => {
    try {
        const { type, realName, nickName, birthDate, birthTime, gender } = req.body;
        const line_user_id = req.user.userId;

        // [1] 성격 사주 전용 7대 섹터 정의 (타입이 personality일 때)
                const personalitySectors = {
            summary: "A one-line summary capturing the essence of personality and fate. (บทสรุปแห่งโชคชะตา)",
            outward: "External temperament and social image. (ตัวตนภายนอกและภาพลักษณ์ทางสังคม)",
            inward: "Deep inner psyche and instincts known only to oneself. (จิตวิญญาณภายในและสัญชาตญาณที่ซ่อนอยู่)",
            strengths: "Powerful weapons and strengths gifted by heaven. (จุดแข็งและพรสวรรค์ที่สวรรค์ประทาน)",
            weaknesses: "Aspects to refine and weaknesses to be mindful of. (จุดอ่อนที่ต้องขัดเกลาและระวัง)",
            cautions: "Situations or mindsets that must be avoided. (สิ่งที่ต้องหลีกเลี่ยงและข้อควรระวัง)",
            boosters: "Luck-boosting elements such as colors and items. (เคล็ดลับเสริมดวงชะตา สี และไอเทมนำโชค)"
        };

        // [2] GPT-4o-mini System Prompt (English)
        const systemPrompt = `
            You are 'Murdoo K', a world-renowned master astrologer. 
            Provide an extremely detailed and deep personality analysis for a premium paid service by harmoniously combining Korean Saju (Four Pillars of Destiny) and Thai Astrology.

            [Operational Guidelines]
            1. Language: MUST write the final content ONLY in Thai.
            2. Tone: Use a mystical, professional, and insightful tone that provides deep enlightenment to the user.
            3. Length: Each sector's content MUST be extremely detailed, with a minimum of 1000 characters, ensuring the user feels the value of the paid service.
            4. Pronoun: Always address the user as "คุณ" (You).
            5. Content: Harmoniously blend the logical analysis of Korean Saju with the spiritual insights of Thai Astrology.
            6. Format: Strictly adhere to the JSON structure provided below.

            [JSON Structure]
            {
                "summary": "One-line personality summary (Max 200 characters in Thai)",
                "outward": "Detailed astrological analysis of external traits (Min 1000 characters in Thai)",
                "inward": "Detailed astrological analysis of inner psyche (Min 1000 characters in Thai)",
                "strengths": "Detailed astrological analysis of strengths (Min 1000 characters in Thai)",
                "weaknesses": "Detailed astrological analysis of weaknesses (Min 1000 characters in Thai)",
                "cautions": "Detailed analysis of situations/mindsets to be careful of (Min 1000 characters in Thai)",
                "boosters": "Detailed guide on lucky elements, colors, and items (Min 1000 characters in Thai)"
            }
        `;

        const userPrompt = `
            - Real Name: ${realName} (${nickName})
            - Birth Date: ${birthDate}
            - Birth Time: ${birthTime}
            - Gender: ${gender}
            - Analysis Type: Personality and Temperament Analysis
            
            Based on the information above, please analyze the 7 items: 'summary, outward, inward, strengths, weaknesses, cautions, and boosters'.
        `;


        // [3] AI 요청 (JSON Mode)
        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt }
            ],
            response_format: { type: "json_object" }
        });

        const fortuneData = JSON.parse(completion.choices[0].message.content);
        const resultId = uuidv4();

        // [4] DB 저장 (detail_data 컬럼에 JSON 형태로 6개 섹터 저장)
        const { summary, ...details } = fortuneData;

        await db.execute(
            `INSERT INTO fortune_results 
            (result_id, line_user_id, fortune_type, summary_text, detail_data) 
            VALUES (?, ?, ?, ?, ?)`,
            [
                resultId, 
                line_user_id, 
                type, 
                summary, 
                JSON.stringify(details) // summary를 제외한 나머지 6개 섹터가 들어감
            ]
        );

        res.json({ resultId });

    } catch (err) {
        console.error('❌ 분석 및 저장 실패:', err);
        res.status(500).json({ error: 'Failed to analyze fortune' });
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
