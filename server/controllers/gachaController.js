import OpenAI from 'openai';
import db from '../config/db.js';
import { GACHA_ASSET } from '../utils/promptTemplates.js';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * 1. [POST] /api/gacha/analyze
 * 태국 현지 날짜 및 불기(B.E.) 연도 기반 오늘의 운세 분석 및 코인 차감
 */
export const analyzeGacha = async (req, res) => {
    const { resultId, birthDate } = req.body; // birthDate 예: "2541-01-01" (불기)
    
    // Passport/JWT 미들웨어를 통해 들어온 유저 정보 확인
    const line_user_id = req.user ? req.user.userId : null;

    // [로그] 요청 진입 확인 (불기 연도 확인)
    console.log(`\n==========================================`);
    console.log(`🎰 [Gacha Analyze] 요청 수신`);
    console.log(`🆔 Result ID: ${resultId}`);
    console.log(`👤 Line User ID: ${line_user_id}`);
    console.log(`🎂 Birth Year (B.E.): ${birthDate.split('-')[0]}`); 
    console.log(`==========================================`);

    if (!line_user_id) {
        console.error("❌ [Error] 유저 인증 정보가 없습니다. (req.user is null)");
        return res.status(401).json({ error: 'UNAUTHORIZED', message: '로그인이 필요합니다.' });
    }

    try {
        // --- [Step 1] 태국 현지 날짜 생성 (UTC+7, 불기 연도 적용) ---
        const thaiDate = new Intl.DateTimeFormat('th-TH', {
            dateStyle: 'full',
            timeZone: 'Asia/Bangkok',
        }).format(new Date());

        console.log(`📅 [Step 1] 태국 현지 날짜 생성 완료: ${thaiDate}`);

        // --- [Step 2] 유저 코인 잔액 조회 ---
        console.log("🔍 [Step 2] DB 코인 잔액 확인 중...");
        const [userRows] = await db.execute(
            `SELECT coins FROM users WHERE line_user_id = ?`,
            [line_user_id]
        );

        if (userRows.length === 0) {
            console.error(`❌ [Error] 유저를 찾을 수 없음: ${line_user_id}`);
            return res.status(404).json({ error: 'USER_NOT_FOUND' });
        }

        const currentCoins = userRows[0].coins;
        console.log(`💰 잔여 코인: ${currentCoins}`);

        if (currentCoins < 1) {
            console.warn(`⚠️ [Warn] 코인 부족: 현재 ${currentCoins}개`);
            return res.status(403).json({ error: 'INSUFFICIENT_COINS' });
        }

        // --- [Step 3] AI 분석 요청 (GACHA_ASSET 활용 - 불기 연도 전달) ---
        const birthYearBE = birthDate.split('-')[0]; // 유저가 선택한 불기 연도 (예: 2541)
        const { system, user } = GACHA_ASSET.getPrompts(birthYearBE, thaiDate);

        console.log(`🤖 [Step 3] AI(gpt-4o-mini) 분석 요청 전송... (Year: B.E. ${birthYearBE})`);
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
        // 결과 객체에 날짜 정보 및 사용자 불기 연도 추가
        gachaResult.analysis_date = thaiDate; 
        gachaResult.user_year_be = birthYearBE;
        
        console.log("✅ AI 분석 및 결과 파싱 성공");

        // --- [Step 4] DB 저장 및 코인 차감 (트랜잭션 처리) ---
        console.log("💾 [Step 4] DB 저장 및 코인 차감 시작...");
        const conn = await db.getConnection();
        
        try {
            await conn.beginTransaction();

            // 1. 결과 데이터 저장
            await conn.execute(
                `INSERT INTO fortune_results 
                (result_id, line_user_id, fortune_type, detail_data) 
                VALUES (?, ?, ?, ?)`,
                [resultId, line_user_id, 'gacha', JSON.stringify(gachaResult)]
            );

            // 2. 코인 1개 차감
            await conn.execute(
                `UPDATE users SET coins = coins - 1 WHERE line_user_id = ?`,
                [line_user_id]
            );

            await conn.commit();
            console.log("🏁 [Finish] 트랜잭션 커밋 완료. 가차 처리 성공!");
            res.json({ resultId });

        } catch (dbErr) {
            await conn.rollback();
            console.error("❌ [DB Error] 트랜잭션 오류로 롤백되었습니다:", dbErr);
            throw dbErr;
        } finally {
            conn.release();
        }

    } catch (err) {
        console.error('🔥 [Final Catch] 가차 분석 프로세스 실패:');
        console.error(`   - 메시지: ${err.message}`);
        console.error(`   - 스택: ${err.stack}`);
        
        res.status(500).json({ 
            error: 'GACHA_PROCESS_FAILED', 
            message: err.message 
        });
    }
};

/**
 * 2. [GET] /api/gacha/result/:id
 * 가차 결과 상세 조회
 */
export const getGachaResult = async (req, res) => {
    const { id } = req.params;
    console.log(`🔍 [Result Get] 조회 요청 ID: ${id}`);

    try {
        const [rows] = await db.execute(
            `SELECT * FROM fortune_results WHERE result_id = ? AND fortune_type = 'gacha'`, 
            [id]
        );

        if (rows.length === 0) {
            console.warn(`⚠️ [Result Get] 데이터를 찾을 수 없음: ${id}`);
            return res.status(404).json({ error: 'RESULT_NOT_FOUND' });
        }

        const details = typeof rows[0].detail_data === 'string' 
            ? JSON.parse(rows[0].detail_data) 
            : rows[0].detail_data;

        res.json(details);
    } catch (err) {
        console.error('❌ [Result Get Error]:', err);
        res.status(500).json({ error: 'DATABASE_ERROR' });
    }
};
