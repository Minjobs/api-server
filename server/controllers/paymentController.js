import db from '../config/db.js';
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

        // 핵심: pending 상태가 아니면 접근 거부
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
export const verifySlip = async (req, res) => {
    const { transactionId } = req.body;
    const slipFile = req.file; // multer를 통해 들어온 이미지 파일

    if (!slipFile) return res.status(400).json({ error: 'No slip image uploaded' });

    try {
        // 1. 주문 정보 가져오기
        const [orderRows] = await db.execute(`SELECT * FROM payment_transactions WHERE id = ?`, [transactionId]);
        if (orderRows.length === 0) return res.status(404).json({ error: 'Invalid transaction' });
        const order = orderRows[0];

        // 2. SlipOK API 호출 (영수증 분석 요청)
        const formData = new FormData();
        formData.append('files', slipFile.buffer, { filename: slipFile.originalname });

        const slipRes = await axios.post('https://api.slipok.com/api/line/apikey/YOUR_SLIPOK_BRANCH_ID', formData, {
            headers: {
                ...formData.getHeaders(),
                'x-lib-apikey': process.env.SLIPOK_API_KEY // 환경변수에서 키 관리
            }
        });

        const slipData = slipRes.data;

        if (!slipData.success) {
            return res.status(400).json({ error: 'ไม่สามารถตรวจสอบสลิปได้ (영수증을 인식할 수 없습니다)' });
        }

        const { transRef, amount, receiver } = slipData.data;

        // 3. 보안 체크 (Anti-Fraud)
        // A. 중복 사용 확인 (transRef가 이미 DB에 있는지)
        const [dupCheck] = await db.execute(`SELECT id FROM payment_transactions WHERE trans_ref = ?`, [transRef]);
        if (dupCheck.length > 0) {
            return res.status(400).json({ error: 'สลิปนี้ถูกใช้งานแล้ว (이미 사용된 영수증입니다)' });
        }

        // B. 금액 일치 확인
        if (parseFloat(amount) !== parseFloat(order.baht_amount)) {
            return res.status(400).json({ error: 'ยอดเงินไม่ถูกต้อง (입금 금액이 일치하지 않습니다)' });
        }

        // C. 수취인 확인 (선택사항: 내 계좌가 맞는지)
        // if (receiver.name !== "YOUR_ACCOUNT_NAME") { ... }

        // 4. 최종 승인: 코인 지급 및 상태 업데이트
        // 트랜잭션을 사용하여 안정적으로 처리
        const connection = await db.getConnection();
        await connection.beginTransaction();

        try {
            // 유저 코인 추가
            await connection.execute(
                `UPDATE users SET coins = coins + ? WHERE line_user_id = ?`,
                [order.coin_amount, order.line_user_id]
            );

            // 주문 상태 업데이트
            await connection.execute(
                `UPDATE payment_transactions SET status = 'success', trans_ref = ? WHERE id = ?`,
                [transRef, transactionId]
            );

            await connection.commit();
            res.json({ success: true, message: 'Payment verified and coins added' });
        } catch (innerErr) {
            await connection.rollback();
            throw innerErr;
        } finally {
            connection.release();
        }

    } catch (err) {
        console.error('Verification Error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};
