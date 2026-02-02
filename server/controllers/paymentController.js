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
export const verifySlip = async (req, res) => {
    const { transactionId } = req.body;
    const slipFile = req.file;

    if (!slipFile) return res.status(400).json({ error: '영수증 파일을 업로드해주세요.' });

    try {
        // 1. DB에서 주문 정보 확인
        const [orders] = await db.execute(`SELECT * FROM payment_transactions WHERE id = ?`, [transactionId]);
        if (orders.length === 0) return res.status(404).json({ error: '주문을 찾을 수 없습니다.' });
        const order = orders[0];

        // 2. SlipOK API 호출 준비
        const formData = new FormData();
        formData.append('files', slipFile.buffer, { filename: 'slip.jpg' });
        
        // [문서 반영] log: true 설정 시 SlipOK 내부 DB에 기록하여 중복 검사를 수행함
        formData.append('log', 'true');
        
        // [문서 반영] amount를 함께 보내면 API가 영수증 금액과 직접 대조함
        formData.append('amount', order.baht_amount);

        const slipRes = await axios.post(
            `https://api.slipok.com/api/line/apikey/${process.env.SLIPOK_BRANCH_ID}`, 
            formData, 
            {
                headers: {
                    ...formData.getHeaders(),
                    'x-authorization': process.env.SLIPOK_API_KEY // 문서 권장 헤더
                }
            }
        );

        const slipData = slipRes.data;

        // [핵심] API 응답 분석: 요청 성공 여부와 영수증 유효성(QR 분석) 동시 확인
        if (!slipData.success || !slipData.data.success) {
            return res.status(400).json({ 
                error: slipData.message || '인식할 수 없는 영수증입니다. 사진을 다시 찍어주세요.' 
            });
        }

        const { transRef, amount } = slipData.data;

        // 3. 보안 검증 (Anti-Fraud)
        // A. 로컬 DB 중복 사용 확인 (2중 방어)
        const [dupCheck] = await db.execute(`SELECT id FROM payment_transactions WHERE trans_ref = ?`, [transRef]);
        if (dupCheck.length > 0) {
            return res.status(400).json({ error: '이미 사용된 영수증입니다.' });
        }

        // B. 금액 일치 확인 (API가 해주지만 한번 더 검증)
        if (parseFloat(amount) !== parseFloat(order.baht_amount)) {
            return res.status(400).json({ error: '입금 금액이 주문 금액과 일치하지 않습니다.' });
        }

        // 4. 트랜잭션 시작
        const connection = await db.getConnection();
        await connection.beginTransaction();

        try {
            // [Atomic Update] status가 'pending'인 경우만 업데이트 허용 (동시 클릭 방지)
            const [result] = await connection.execute(
                `UPDATE payment_transactions 
                 SET status = 'success', trans_ref = ? 
                 WHERE id = ? AND status = 'pending'`,
                [transRef, transactionId]
            );

            if (result.affectedRows === 0) {
                await connection.rollback();
                return res.status(400).json({ error: '이미 처리된 주문이거나 유효하지 않은 요청입니다.' });
            }

            // 코인 지급
            await connection.execute(
                `UPDATE users SET coins = coins + ? WHERE line_user_id = ?`,
                [order.coin_amount, order.line_user_id]
            );

            await connection.commit();
            res.json({ success: true, message: '지급 완료!' });

        } catch (innerErr) {
            await connection.rollback();
            throw innerErr;
        } finally {
            connection.release();
        }

    } catch (err) {
        // [장애 대응] 1009 에러(은행 시스템 장애) 전용 처리
        const apiError = err.response?.data;
        console.error('SlipOK API Error:', apiError || err.message);

        if (apiError && apiError.code === 1009) {
            return res.status(503).json({ 
                error: '현재 태국 은행 시스템 장애로 조회가 지연되고 있습니다. 15분 후 다시 시도해 주세요.' 
            });
        }

        res.status(500).json({ error: '결제 확인 중 서버 오류가 발생했습니다.' });
    }
};
