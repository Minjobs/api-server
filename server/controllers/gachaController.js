import OpenAI from 'openai';
import db from '../config/db.js';
import { GACHA_ASSET } from '../utils/promptTemplates.js';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * 1. [POST] /api/gacha/analyze
 * 태국 현지 날짜 및 불기(B.E.) 연도 기반 오늘의 운세 분석 및 코인 차감
 */
export const analyzeGacha = async (req, res) => {
    const { resultId, birthDate } = req.body; 
    
    const line_user_id = req.user ? req.user.userId : null;

    console.log(`\n==========================================`);
    console.log(`🎰 [Gacha Analyze] 요청 수신`);
    console.log(`🆔 Result ID: ${resultId}`);
    console.log(`👤 Line User ID: ${line_user_id}`);
    console.log(`==========================================`);

    if (!line_user_id) {
        return res.status(401).json({ error: 'UNAUTHORIZED', message: '로그인이 필요합니다.' });
    }

    try {
        // [Step 1] 보여주기용 날짜 (JSON 저장용)
        const thaiDate = new Intl.DateTimeFormat('th-TH', {
            dateStyle: 'full',
            timeZone: 'Asia/Bangkok',
        }).format(new Date());

        // [Step 2] 코인 확인
        const [userRows] = await db.execute(
            `SELECT coins FROM users WHERE line_user_id = ?`,
            [line_user_id]
        );

        if (userRows.length === 0) {
            return res.status(404).json({ error: 'USER_NOT_FOUND' });
        }

        if (userRows[0].coins < 1) {
            return res.status(403).json({ error: 'INSUFFICIENT_COINS' });
        }

        // [Step 3] AI 분석
        const birthYearBE = birthDate.split('-')[0];
        const { system, user } = GACHA_ASSET.getPrompts(birthYearBE, thaiDate);

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
        gachaResult.analysis_date = thaiDate; 
        gachaResult.user_year_be = birthYearBE;
        
        console.log("✅ AI 분석 완료");

        // [Step 4] DB 저장 (트랜잭션)
        const conn = await db.getConnection();
        
        try {
            await conn.beginTransaction();

            // 1. 결과 저장 (created_at 생략 -> DB가 알아서 태국 시간 입력)
            await conn.execute(
                `INSERT INTO fortune_results 
                (result_id, line_user_id, fortune_type, detail_data) 
                VALUES (?, ?, ?, ?)`,
                [resultId, line_user_id, 'gacha', JSON.stringify(gachaResult)]
            );

            // 2. 코인 차감 AND 횟수 증가 (✅ 여기가 수정된 부분입니다!)
            await conn.execute(
                `UPDATE users 
                 SET coins = coins - 1, total_readings = total_readings + 1 
                 WHERE line_user_id = ?`,
                [line_user_id]
            );

            await conn.commit();
            console.log("🏁 트랜잭션 완료 (코인 차감, 횟수 증가, 태국 시간 저장)");
            res.json({ resultId });

        } catch (dbErr) {
            await conn.rollback();
            console.error("❌ DB Error:", dbErr);
            throw dbErr;
        } finally {
            conn.release();
        }

    } catch (err) {
        console.error('🔥 Process Failed:', err);
        res.status(500).json({ error: 'GACHA_PROCESS_FAILED', message: err.message });
    }
};

/**
 * 2. [GET] /api/gacha/result/:id
 * (이 부분은 기존과 동일)
 */
export const getGachaResult = async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await db.execute(
            `SELECT * FROM fortune_results WHERE result_id = ? AND fortune_type = 'gacha'`, 
            [id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: 'RESULT_NOT_FOUND' });
        }

        const details = typeof rows[0].detail_data === 'string' 
            ? JSON.parse(rows[0].detail_data) 
            : rows[0].detail_data;

        res.json(details);
    } catch (err) {
        console.error('❌ Result Get Error:', err);
        res.status(500).json({ error: 'DATABASE_ERROR' });
    }
};
