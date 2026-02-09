import OpenAI from 'openai';
import db from '../config/db.js';
import { GACHA_ASSET } from '../utils/promptTemplates.js';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * 1. [POST] /api/gacha/analyze
 * 뽑기 전용 분석 로직 (1코인 차감)
 */
export const analyzeGacha = async (req, res) => {
    const { resultId, birthDate } = req.body;
    const line_user_id = req.user.userId;

    console.log(`--- [Gacha] 분석 시작 (ID: ${resultId}) ---`);

    try {
        // [1] 코인 잔액 확인 (가차는 1코인)
        const [userRows] = await db.execute(
            `SELECT coins FROM users WHERE line_user_id = ?`,
            [line_user_id]
        );

        if (userRows.length === 0 || userRows[0].coins < 1) {
            console.log(`⚠️ 코인 부족: ${line_user_id}`);
            return res.status(403).json({ error: 'INSUFFICIENT_COINS' });
        }

        // [2] GPT 분석 요청 (GACHA_ASSET 활용)
        const birthYear = birthDate.split('-')[0];
        const { system, user } = GACHA_ASSET.getPrompts(birthYear);

        console.log("🤖 GPT 가차 분석 중...");
        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: system },
                { role: "user", content: user }
            ],
            response_format: {
                type: "json_schema",
                json_schema: GACHA_ASSET.schema
            },
            temperature: 0.8
        });

        const gachaResult = JSON.parse(completion.choices[0].message.content);

        // [3] DB 저장 및 코인 차감 (트랜잭션)
        const conn = await db.getConnection();
        try {
            await conn.beginTransaction();

            // 결과 저장 (fortune_type을 'gacha'로 고정)
            await conn.execute(
                `INSERT INTO fortune_results 
                (result_id, line_user_id, fortune_type, detail_data) 
                VALUES (?, ?, ?, ?)`,
                [resultId, line_user_id, 'gacha', JSON.stringify(gachaResult)]
            );

            // 코인 1개 차감
            await conn.execute(
                `UPDATE users SET coins = coins - 1 WHERE line_user_id = ?`,
                [line_user_id]
            );

            await conn.commit();
            console.log(`✅ 가차 완료 (1코인 차감): ${resultId}`);
            res.json({ resultId });

        } catch (dbErr) {
            await conn.rollback();
            throw dbErr;
        } finally {
            conn.release();
        }

    } catch (err) {
        console.error('❌ 가차 분석 에러:', err);
        res.status(500).json({ error: 'Gacha analysis failed', message: err.message });
    }
};

/**
 * 2. [GET] /api/gacha/result/:id
 * 가차 결과 상세 조회
 */
export const getGachaResult = async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await db.execute(
            `SELECT * FROM fortune_results WHERE result_id = ? AND fortune_type = 'gacha'`, 
            [id]
        );

        if (rows.length === 0) return res.status(404).json({ error: 'Result not found' });

        const details = typeof rows[0].detail_data === 'string' 
            ? JSON.parse(rows[0].detail_data) 
            : rows[0].detail_data;

        res.json(details);
    } catch (err) {
        res.status(500).json({ error: 'Fetch failed' });
    }
};
