import { v4 as uuidv4 } from 'uuid';
import OpenAI from 'openai';
import db from '../config/db.js';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const analyzeFortune = async (req, res) => {
    try {
        const { type, realName, nickName, birthDate, birthTime, gender } = req.body;
        const line_user_id = req.user.userId;

        // [A] 카테고리별 맞춤 프롬프트
        const promptTemplates = {
            personality: `Analyze personality for ${realName}, born ${birthDate} ${birthTime}. Format: Summary(1 line) then Content. Language: Thai.`,
            wealth: `Analyze wealth luck for ${realName}, born ${birthDate}. Format: Summary(1 line) then Content. Language: Thai.`,
            romance: `Analyze love life for ${realName}, gender ${gender}, born ${birthDate}. Format: Summary(1 line) then Content. Language: Thai.`
        };

        // [B] OpenAI 호출
        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: "system", content: "You are 'Murdoo K', a master of Korean & Thai astrology." },
                { role: "user", content: promptTemplates[type] }
            ],
        });

        const fullResponse = completion.choices[0].message.content;
        const [summary, ...contentParts] = fullResponse.split('\n');
        const content = contentParts.join('\n').trim();
        const resultId = uuidv4(); // 무작위 PK 생성

        // [C] DB 저장
        await db.execute(
            `INSERT INTO fortune_results (result_id, line_user_id, fortune_type, summary, content) 
             VALUES (?, ?, ?, ?, ?)`,
            [resultId, line_user_id, type, summary.substring(0, 255), content]
        );

        res.json({ resultId });

    } catch (err) {
        console.error('❌ 분석 에러:', err);
        res.status(500).json({ error: 'Failed to analyze fortune' });
    }
};

export const getFortuneResult = async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await db.execute(
            `SELECT * FROM fortune_results WHERE result_id = ? AND line_user_id = ?`,
            [id, req.user.userId] // 본인 결과만 보게끔 보안 강화
        );

        if (rows.length === 0) return res.status(404).json({ error: 'Result not found' });
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: 'Database error' });
    }
};
