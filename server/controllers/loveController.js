import OpenAI from 'openai';
import db from '../config/db.js';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// [중복 방지] 현재 분석이 진행 중인 요청을 추적하는 메모리 맵
const activeLoveJobs = new Map();

/**
 * 1. [POST] /api/love/analyze
 * 한국식 사주(오행)를 기반으로 한자 없이 태국어로 궁합 분석
 */
export const analyzeLove = async (req, res) => {
    const { resultId, me, partner, relationship } = req.body;
    const line_user_id = req.user.userId;

    console.log(`--- [Love] 분석 시작 (ID: ${resultId}) ---`);

    try {
        // [1] DB 중복 체크 (이미 결과가 있는지)
        const [existing] = await db.execute(
            `SELECT result_id FROM fortune_results WHERE result_id = ?`,
            [resultId]
        );

        if (existing.length > 0) {
            console.log("♻️ 이미 존재하는 결과입니다.");
            return res.json({ resultId, status: 'already_done' });
        }

        // [2] 진행 중 중복 체크 (GPT 호출 중인지)
        if (activeLoveJobs.has(resultId)) {
            console.log("⏳ 현재 같은 ID로 분석이 진행 중입니다.");
            return res.status(202).json({ message: 'Still calculating your love destiny...' });
        }

        activeLoveJobs.set(resultId, true);

        // [3] 시스템 프롬프트 설정 (한자 배제, 자연의 원리로 설명)
        const systemPrompt = `
            You are 'Master Murdoo K', the leading expert in "Korean Saju" (ศาสตร์ 4 เสาหลักแห่งดวงชะตา). 
            Your mission is to analyze love compatibility using only the principles of Korean Saju.

            [Operational Guidelines]
            1. Language: MUST write exclusively in Thai (ภาษาไทย).
            2. No Hanja: Do NOT use any Chinese characters (Hanja). Translate them into easy-to-understand Thai terms based on the 5 Elements (Wood, Fire, Earth, Metal, Water).
            3. Accessibility: Explain the harmony of destiny as a natural flow (e.g., "Like water nourishing a tree" or "Like sun warming the earth") so that Thai users can understand intuitively.
            4. Addressing: Use "คุณ" for the user and reference the partner's nickname naturally.
            5. Context: Provide deeply personalized advice based on their current relationship status: ${relationship}.
        `;

        const userPrompt = `
            [Korean Saju Destiny Data]
            - User (Me): Name: ${me.name}, Birth: ${me.birth}, Time: ${me.time}
            - Partner: Name: ${partner.name}, Birth: ${partner.birth}, Time: ${partner.time}
            - Current Relationship Status: ${relationship}

            [Request]
            Analyze how the 'Energy of Nature' (the 5 Elements: Wood, Fire, Earth, Metal, Water) from their Korean birth pillars interact with each other. 
            Focus on their spiritual sync, energy flow, and future path. 
            Provide the analysis in the specified JSON schema format.
        `;

        // [4] OpenAI Structured Outputs 요청
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

        // [5] DB 저장 (fortune_results 테이블 공용 사용)
        console.log(`💾 결과 저장 중... (ID: ${resultId})`);
        await db.execute(
            `INSERT IGNORE INTO fortune_results 
            (result_id, line_user_id, fortune_type, summary_text, detail_data) 
            VALUES (?, ?, ?, ?, ?)`,
            [
                resultId, 
                line_user_id, 
                'love', 
                `โชคชะตาความรักของคุณกับ ${partner.name} คือ ${loveResult.score} คะแนน`,
                JSON.stringify(loveResult)
            ]
        );

        res.json({ resultId });

    } catch (err) {
        console.error('❌ 분석 에러:', err);
        res.status(500).json({ error: 'Analysis failed', message: err.message });
    } finally {
        activeLoveJobs.delete(resultId); // 작업 완료 후 맵에서 삭제
    }
};
