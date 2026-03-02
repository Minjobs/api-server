Import db from '../config/db.js';
import axios from 'axios';
import FormData from 'form-data';

/**
 * [1] 결제 의도 생성 (shop.html 호출)
 */
export const createIntent = async (req, res) => {
    try {
        const { coinAmount, bahtAmount } = req.body;
        const transactionId = `ORD-${Date.now()}`;
        
        await db.execute(
            `INSERT INTO payment_transactions (id, line_user_id, coin_amount, baht_amount, status) 
            VALUES (?, ?, ?, ?, 'pending')`,
            [transactionId, req.user.userId, coinAmount, bahtAmount]
        );
        res.json({ transactionId });
    } catch (err) {
        console.error('Intent Error:', err);
        res.status(500).json({ error: 'Failed to create payment intent' });
    }
};

/**
 * [2] 결제 상세 정보 조회 (checkout.html 호출)
 */
export const getDetail = async (req, res) => {
    try {
        const [rows] = await db.execute(
            `SELECT * FROM payment_transactions WHERE id = ?`, 
            [req.params.id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: 'ORDER_NOT_FOUND', message: '주문을 찾을 수 없습니다.' });
        }

        const order = rows[0];

        if (order.status !== 'pending') {
            return res.status(403).json({ 
                error: 'INVALID_STATUS', 
                message: '이미 완료되었거나 취소된 주문입니다.',
                status: order.status 
            });
        }

        res.json(order);
    } catch (err) {
        res.status(500).json({ error: 'SERVER_ERROR' });
    }
};

/**
 * [3] 영수증 검증 및 코인 자동 지급 (핵심 로직)
 */
// ... (createIntent, getDetail 생략)

export const verifySlip = async (req, res) => {
    const { transactionId } = req.body;
    const slipFile = req.file;

    console.log(`\n--- [시작] 결제 검증 (ID: ${transactionId}) ---`);

    if (!slipFile) {
        console.error("❌ 에러: 파일이 전송되지 않았습니다.");
        return res.status(400).json({ code: 'NO_FILE', error: '영수증 파일을 업로드해주세요.' });
    }

    try {
        // [1] DB 주문 정보 확인
        const [orders] = await db.execute(`SELECT * FROM payment_transactions WHERE id = ?`, [transactionId]);
        if (orders.length === 0) {
            console.error(`❌ 에러: DB에 주문번호 ${transactionId} 가 없습니다.`);
            return res.status(404).json({ code: 'NOT_FOUND', error: '주문을 찾을 수 없습니다.' });
        }
        const order = orders[0];
        console.log(`✅ [1단계] DB 주문 확인 성공. 기대 금액: ${order.baht_amount} THB`);

        // [2] SlipOK API 호출
        console.log(`📡 [2단계] SlipOK API 요청 전송 중...`);
        const formData = new FormData();
        formData.append('files', slipFile.buffer, { filename: 'slip.jpg' });
        formData.append('log', 'false'); 
        formData.append('amount', order.baht_amount);

        const slipRes = await axios.post(
            `https://api.slipok.com/api/line/apikey/${process.env.SLIPOK_BRANCH_ID}`, 
            formData, 
            { headers: { ...formData.getHeaders(), 'x-authorization': process.env.SLIPOK_API_KEY } }
        );

        const slipData = slipRes.data;
        console.log(`📥 SlipOK 응답 데이터:`, JSON.stringify(slipData, null, 2));

        if (!slipData.success) {
            console.error(`❌ 에러: SlipOK 분석 실패. 코드: ${slipData.code}, 메시지: ${slipData.message}`);
            return res.status(400).json({ code: `SLIPOK_${slipData.code}`, error: slipData.message });
        }

        const { transRef, amount, receiver } = slipData.data;

        // [3] 수취인 이름 체크 (가장 유력한 에러 지점)
        // [주의] SlipOK의 receiver.name은 영어인 경우가 많습니다! 
        const OWNER_NAME_THAI = "THANYAPHAT M";
        
        console.log(`🧐 [3단계] 이름 대조 시작`);
        console.log(`- 영수증상 수취인(English): [${receiver.name}]`);
        console.log(`- 영수증상 수취인(Thai): [${receiver.displayName}]`);
        console.log(`- 설정된 기준 이름: [${OWNER_NAME_THAI}]`);

        // 만약 영어 name 필드에 태국어 이름을 비교하면 무조건 false가 납니다.
        // displayName과 name 중 어디에 태국어가 들어오는지 로그로 꼭 확인하세요!
        if (!receiver.displayName.includes(OWNER_NAME_THAI) && !receiver.name.includes(OWNER_NAME_THAI)) {
            console.error(`❌ 에러: 수취인 이름 불일치!`);
            return res.status(400).json({ code: 'INVALID_RECEIVER', error: '수취인이 올바르지 않습니다.' });
        }
        console.log(`✅ [3단계] 이름 대조 통과!`);

        // [4] 금액 체크
        console.log(`🧐 [4단계] 금액 대조 시작: 영수증(${amount}) vs 주문(${order.baht_amount})`);
        if (parseFloat(amount) !== parseFloat(order.baht_amount)) {
            console.error(`❌ 에러: 금액 불일치!`);
            return res.status(400).json({ code: 'AMOUNT_MISMATCH', error: '입금 금액이 다릅니다.' });
        }
        console.log(`✅ [4단계] 금액 대조 통과!`);

        // [5] 트랜잭션 및 코인 지급
        const connection = await db.getConnection();
        await connection.beginTransaction();

        try {
            console.log(`🏦 [5단계] DB 트랜잭션 시작 (Atomic Update)`);
            const [result] = await connection.execute(
                `UPDATE payment_transactions SET status = 'success', trans_ref = ? WHERE id = ? AND status = 'pending'`,
                [transRef, transactionId]
            );

            if (result.affectedRows === 0) {
                console.warn(`⚠️ 경고: 이미 처리된 주문이거나 상태가 pending이 아님.`);
                await connection.rollback();
                return res.status(400).json({ code: 'ALREADY_PROCESSED', error: '이미 처리된 주문입니다.' });
            }

            console.log(`💰 [6단계] 코인 지급 중... 유저ID: ${order.line_user_id}, 수량: ${order.coin_amount}`);
            await connection.execute(
                `UPDATE users SET coins = coins + ? WHERE line_user_id = ?`,
                [order.coin_amount, order.line_user_id]
            );

            await connection.commit();
            console.log(`🎉 [완료] 결제 및 코인 지급이 최종 성공했습니다!`);
            res.json({ success: true });

        } catch (innerErr) {
            console.error(`❌ DB 트랜잭션 에러:`, innerErr);
            await connection.rollback();
            throw innerErr;
        } finally {
            connection.release();
        }

    } catch (err) {
        const apiError = err.response?.data;
        console.error(`🚨 심각한 서버 에러:`, apiError || err.message);
        
        if (apiError?.code === 1009) {
            return res.status(503).json({ code: 'BANK_MAINTENANCE', error: '은행 점검 중' });
        }
        res.status(500).json({ code: 'SERVER_ERROR', error: '서버 오류' });
    }
};
