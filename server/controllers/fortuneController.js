import { v4 as uuidv4 } from 'uuid';
import OpenAI from 'openai';
import db from '../config/db.js';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const analyzeFortune = async (req, res) => {
    try {
        const { type, realName, nickName, birthDate, birthTime, gender } = req.body;
        const line_user_id = req.user.userId;

        // [1] 머두 K님이 요청하신 섹터 명칭 그대로 정의
        const configs = {
            personality: {
                // 이 Key들이 그대로 JSON 데이터의 필드명이 됩니다.
                sectors: [
                    "outward_features", // 겉으로 보이는 특징
                    "inward_features",  // 내면의 특징
                    "strengths",       // 장점
                    "weaknesses",      // 단점
                    "cautions"         // 조심해야할 점
                ],
                instruction: "วิเคราะห์ลักษณะภายนอก, ลักษณะภายใน, จุดแข็ง, จุดอ่อน และสิ่งที่ควรระวัง"
            },
            // 재물과 연애는 섹터 이름이 다를 수 있으므로 확장 가능하게 배치
            wealth: {
                sectors: ["cash_flow", "career_luck", "lucky_timing", "wealth_tips"],
                instruction: "วิเคราะห์การไหลเวียนของเงิน, ดวงการงาน, ช่วงเวลาโชคลาภ และเคล็ดลับความรวย"
            },
            romance: {
                sectors: ["love_style", "soulmate_type", "romance_timing", "love_advice"],
                instruction: "วิเคราะห์สไตล์ความรัก, ลักษณะเนื้อคู่, ช่วงเวลาพบรัก และคำแนะนำความรัก"
            }
        };

        const config = configs[type] || configs.personality;

        // [2] GPT-4o-mini 전용 시스템 프롬프트 (JSON 틀 고정)
        const systemPrompt = `
            You are 'Murdoo K', a master astrologer. 
            Provide a very detailed analysis in Thai.
            
            RULES:
            1. Response MUST be a JSON object.
            2. Each sector content MUST be at least 400 characters long (Detailed enough for a paid service).
            3. Use professional and mystical tone.

            JSON Structure:
            {
                "summary": "요약본 (One impactful line)",
                ${config.sectors.map(s => `"${s}": "분석 내용 (Min 400 chars)"`).join(",\n")}
            }
        `;

        const userPrompt = `
            Name: ${realName} (${nickName}), Birth: ${birthDate} ${birthTime}, Gender: ${gender}
            Type: ${type}. Please perform a deep analysis: ${config.instruction}.
        `;

        // [3] AI 요청
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

        // [4] DB 저장 (detail_data 컬럼에 요약을 제외한 나머지 객체 삽입)
        const { summary, ...details } = fortuneData;

        await db.execute(
            `INSERT INTO fortune_results 
            (result_id, line_user_id, fortune_type, summary_text, detail_data) 
            VALUES (?, ?, ?, ?, ?)`,
            [resultId, line_user_id, type, summary, JSON.stringify(details)]
        );

        res.json({ resultId });

    } catch (err) {
        console.error('❌ 분석 오류:', err);
        res.status(500).json({ error: 'Failed to analyze fortune' });
    }
};
