import { v4 as uuidv4 } from 'uuid';
import OpenAI from 'openai';
import db from '../config/db.js';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const analyzeFortune = async (req, res) => {
    try {
        const { type, realName, nickName, birthDate, birthTime, gender } = req.body;
        const line_user_id = req.user.userId; // verifyToken에서 넘어온 ID

        // [A] 타입별 프롬프트 설정
        const prompts = {
            personality: `Analyze the personality of ${realName}(${nickName}), born on ${birthDate} at ${birthTime}, gender ${gender}. Based on Korean and Thai astrology. Respond in Thai.`,
            wealth: `Analyze the wealth and money luck of ${realName}, born on ${birthDate}. Respond in Thai.`,
            romance: `Analyze the love life and soulmate of ${realName}, gender ${gender}, born on ${birthDate}. Respond in Thai.`
        };

        // [B] ChatGPT 호출 (요약과 본문을 함께 요청)
        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: "system", content: "You are 'Murdoo K', a master of Korean & Thai astrology. Give a detailed analysis and a 1-line summary." },
                { role: "user", content: prompts[type] }
            ],
        });

        const fullContent = completion.choices[0].message.content;
        const summary = fullContent.split('\n')[0].substring(0, 100); // 첫 줄을 요약으로 사용 (예시)
        const resultId = uuidv4(); // 무작위 PK 생성

        // [C] DB 저장
        await db.execute(
            `INSERT INTO fortune_results (result_id, line_user_id, fortune_type, summary, content) 
             VALUES (?, ?, ?, ?, ?)`,
            [resultId, line_user_id, type, summary, fullContent]
        );

        // [D] 생성된 PK 반환
        res.json({ resultId });

    } catch (err) {
        console.error('❌ AI 분석 에러:', err.message);
        res.status(500).json({ error: 'AI 분석 중 오류가 발생했습니다.' });
    }
};

// 특정 결과 조회 API
export const getFortuneResult = async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await db.execute(
            `SELECT * FROM fortune_results WHERE result_id = ?`, [id]
        );
        
        if (rows.length === 0) return res.status(404).json({ error: '결과를 찾을 수 없습니다.' });
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: '데이터 조회 실패' });
    }
};
