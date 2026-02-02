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

    if (!slipFile) return res.status(400).json({ code: 'NO_FILE', error: '영수증 파일을 업로드해주세요.' });

    try {
        const [orders] = await db.execute(`SELECT * FROM payment_transactions WHERE id = ?`, [transactionId]);
        if (orders.length === 0) return res.status(404).json({ code: 'NOT_FOUND', error: '주문을 찾을 수 없습니다.' });
        const order = orders[0];

        const formData = new FormData();
        formData.append('files', slipFile.buffer, { filename: 'slip.jpg' });
        formData.append('log', 'true'); // 수취인 검증 활성화
        formData.append('amount', order.baht_amount);

        const slipRes = await axios.post(
            `https://api.slipok.com/api/line/apikey/${process.env.SLIPOK_BRANCH_ID}`, 
            formData, 
            { headers: { ...formData.getHeaders(), 'x-authorization': process.env.SLIPOK_API_KEY } }
        );

        const slipData = slipRes.data;

        // [1] SlipOK API 수준의 에러 처리
        if (!slipData.success) {
            // 1014: 수취인 불일치, 1009: 은행 장애 등
            return res.status(400).json({ 
                code: `SLIPOK_${slipData.code}`, 
                error: slipData.message 
            });
        }

        const { transRef, amount, receiver } = slipData.data;

        // [2] 수취인 이름 2중 체크 (Sawarin M)
        const OWNER_NAME = "thanyaphat mongkolrattanamani"; 
        if (!receiver.name.includes(OWNER_NAME)) {
            return res.status(400).json({ code: 'INVALID_RECEIVER', error: '수취인이 올바르지 않습니다.' });
        }

        // [3] 중복 확인
        const [dupCheck] = await db.execute(`SELECT id FROM payment_transactions WHERE trans_ref = ?`, [transRef]);
        if (dupCheck.length > 0) {
            return res.status(400).json({ code: 'DUPLICATE_SLIP', error: '이미 사용된 영수증입니다.' });
        }

        // [4] 트랜잭션 및 코인 지급
        const connection = await db.getConnection();
        await connection.beginTransaction();

        try {
            const [result] = await connection.execute(
                `UPDATE payment_transactions SET status = 'success', trans_ref = ? WHERE id = ? AND status = 'pending'`,
                [transRef, transactionId]
            );

            if (result.affectedRows === 0) {
                await connection.rollback();
                return res.status(400).json({ code: 'ALREADY_PROCESSED', error: '이미 처리된 주문입니다.' });
            }

            await connection.execute(
                `UPDATE users SET coins = coins + ? WHERE line_user_id = ?`,
                [order.coin_amount, order.line_user_id]
            );

            await connection.commit();
            res.json({ success: true });

        } catch (innerErr) {
            await connection.rollback();
            throw innerErr;
        } finally {
            connection.release();
        }

    } catch (err) {
        const apiError = err.response?.data;
        if (apiError?.code === 1009) {
            return res.status(503).json({ code: 'BANK_MAINTENANCE', error: '은행 점검 중' });
        }
        res.status(500).json({ code: 'SERVER_ERROR', error: '서버 오류' });
    }
};
