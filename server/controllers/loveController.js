import OpenAI from 'openai';
import db from '../config/db.js';
import { LOVE_ASSET } from '../utils/promptTemplates.js'; // 👈 에셋 임포트

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// [중복 방지] 현재 분석이 진행 중인 요청을 추적하는 메모리 맵
const activeLoveJobs = new Map();

/**
 * 1. [POST] /api/love/analyze
 * LOVE_ASSET을 사용하여 AI 분석 및 코인 차감 진행
 */
export const analyzeLove = async (req, res) => {
    const { resultId, me, partner, relationship } = req.body;
    
    // 유저 인증 정보 확인
    if (!req.user || !req.user.userId) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    const line_user_id = req.user.userId;

    console.log(`--- [Love] 분석 시작 (ID: ${resultId}) ---`);

    try {
        // [1] 유저 코인 잔액 확인
        const [userRows] = await db.execute(
            `SELECT coins FROM users WHERE line_user_id = ?`,
            [line_user_id]
        );

        if (userRows.length === 0 || userRows[0].coins < 2) {
            console.log(`⚠️ 코인 부족: ${line_user_id}`);
            return res.status(403).json({ error: 'INSUFFICIENT_COINS' });
        }

        // [2] DB 중복 체크
        const [existing] = await db.execute(
            `SELECT result_id FROM fortune_results WHERE result_id = ?`,
            [resultId]
        );

        if (existing.length > 0) {
            return res.json({ resultId, status: 'already_done' });
        }

        // [3] 진행 중 중복 체크
        if (activeLoveJobs.has(resultId)) {
            return res.status(202).json({ message: 'Still calculating...' });
        }

        activeLoveJobs.set(resultId, true);

        // --- [4] AI 분석 요청 (LOVE_ASSET 활용) ---
        const { system, user } = LOVE_ASSET.getPrompts(relationship, me, partner);

        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: system },
                { role: "user", content: user }
            ],
            response_format: {
                type: "json_schema",
                json_schema: LOVE_ASSET.schema // 👈 에셋에 정의된 고퀄리티 스키마 적용
            },
            temperature: 0.7
        });

        const loveResult = JSON.parse(completion.choices[0].message.content);
        // ------------------------------------------

        // [5] DB 저장 및 코인 차감 (트랜잭션)
        const conn = await db.getConnection();
        try {
            await conn.beginTransaction();

            // 결과 저장 (세부 점수들이 포함된 loveResult 전체가 JSON으로 저장됨)
            await conn.execute(
                `INSERT IGNORE INTO fortune_results 
                (result_id, line_user_id, fortune_type, detail_data) 
                VALUES (?, ?, ?, ?)`,
                [resultId, line_user_id, 'love', JSON.stringify(loveResult)]
            );

            // 코인 2개 차감
            await conn.execute(
                `UPDATE users SET coins = coins - 2 WHERE line_user_id = ?`,
                [line_user_id]
            );

            await conn.commit();
            console.log(`✅ 분석 완료 및 코인 차감 성공: ${resultId}`);
            res.json({ resultId });

        } catch (dbErr) {
            await conn.rollback();
            throw dbErr;
        } finally {
            conn.release();
        }

    } catch (err) {
        console.error('❌ 분석 에러:', err);
        res.status(500).json({ error: 'Analysis failed', message: err.message });
    } finally {
        activeLoveJobs.delete(resultId);
    }
};

/**
 * 2. [GET] /api/love/result/:id
 */
export const getLoveResult = async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await db.execute(
            `SELECT * FROM fortune_results WHERE result_id = ?`, 
            [id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Result not found' });
        }

        const result = rows[0];
        const details = typeof result.detail_data === 'string' 
            ? JSON.parse(result.detail_data) 
            : result.detail_data;

        res.json(details);

    } catch (err) {
        console.error('❌ 결과 조회 실패:', err);
        res.status(500).json({ error: 'Database error' });
    }
};
