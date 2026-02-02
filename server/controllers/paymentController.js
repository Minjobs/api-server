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

// /**
// * [3] 영수증 검증 및 코인 자동 지급 (핵심 로직)
// */

// export const verifySlip = async (req, res) => {
//     const { transactionId } = req.body;
//     const slipFile = req.file; // multer로 들어온 이미지 파일

//     if (!slipFile) return res.status(400).json({ error: '영수증 파일을 업로드해주세요.' });

//     try {
//         // 1. DB에서 주문 정보(금액 등) 확인
//         const [orders] = await db.execute(`SELECT * FROM payment_transactions WHERE id = ?`, [transactionId]);
//         if (orders.length === 0) return res.status(404).json({ error: '주문을 찾을 수 없습니다.' });
//         const order = orders[0];

//         // 2. SlipOK API 호출 준비
//         const formData = new FormData();
//         formData.append('files', slipFile.buffer, { filename: 'slip.jpg' });

//         const slipRes = await axios.post(
//             `https://api.slipok.com/api/line/apikey/${process.env.SLIPOK_BRANCH_ID}`, 
//             formData, 
//             {
//                 headers: {
//                     ...formData.getHeaders(),
//                     'x-lib-apikey': process.env.SLIPOK_API_KEY
//                 }
//             }
//         );

//         const slipData = slipRes.data;

//         // [핵심] API 응답 분석
//         if (!slipData.success) {
//             return res.status(400).json({ error: '인식할 수 없는 영수증입니다. 사진을 다시 찍어주세요.' });
//         }

//         const { transRef, amount, receiver } = slipData.data;

//         // 3. 보안 검증 (Anti-Fraud)
//         // A. 중복 사용 확인 (가장 중요!)
//         const [dupCheck] = await db.execute(`SELECT id FROM payment_transactions WHERE trans_ref = ?`, [transRef]);
//         if (dupCheck.length > 0) {
//             return res.status(400).json({ error: '이미 사용된 영수증입니다.' });
//         }

//         // B. 금액 일치 확인 (소수점까지 정확히)
//         if (parseFloat(amount) !== parseFloat(order.baht_amount)) {
//             return res.status(400).json({ error: '입금 금액이 주문 금액과 일치하지 않습니다.' });
//         }

//         // C. 수취인 이름 확인 (여자친구분 계좌가 맞는지)
//         // const MY_NAME = "MISS THAI GIRL"; // 실제 영문 성함으로 수정
//         // if (receiver.name !== MY_NAME) return res.status(400).json({ error: '수취인 정보가 올바르지 않습니다.' });

//         // 4. 모든 검증 통과 -> 코인 지급 및 주문 완료 처리
//         const connection = await db.getConnection();
//         await connection.beginTransaction();

//         try {
//             // 유저 코인 추가
//             await connection.execute(
//                 `UPDATE users SET coins = coins + ? WHERE line_user_id = ?`,
//                 [order.coin_amount, order.line_user_id]
//             );

//             // 주문 상태 업데이트 (trans_ref 저장)
//             await connection.execute(
//                 `UPDATE payment_transactions SET status = 'success', trans_ref = ? WHERE id = ?`,
//                 [transRef, transactionId]
//             );

//             await connection.commit();
//             res.json({ success: true, message: '지급 완료!' });
//         } catch (innerErr) {
//             await connection.rollback();
//             throw innerErr;
//         } finally {
//             connection.release();
//         }

//     } catch (err) {
//         console.error('SlipOK API Error:', err.response?.data || err.message);
//         res.status(500).json({ error: '결제 확인 중 서버 오류가 발생했습니다.' });
//     }
// };
// 

export const verifySlip = async (req, res) => {
    const { transactionId } = req.body;
    const slipFile = req.file;

    // 테스트 모드에서는 파일이 있기만 하면 통과!
    if (!slipFile) return res.status(400).json({ error: '영수증 파일을 선택해주세요.' });

    console.log(`[TEST MODE] 주문번호 ${transactionId} 에 대한 가상 검증을 시작합니다.`);

    try {
        // 1. DB에서 주문 정보 가져오기 (금액 등을 확인하기 위함)
        const [orders] = await db.execute(`SELECT * FROM payment_transactions WHERE id = ?`, [transactionId]);
        if (orders.length === 0) return res.status(404).json({ error: '주문을 찾을 수 없습니다.' });
        const order = orders[0];

        // 2. SlipOK API 호출 생략 (가상의 성공 데이터 생성)
        const mockSlipData = {
            transRef: `MOCK-REF-${Date.now()}`, // 매번 새로운 고유번호 생성
            amount: order.baht_amount,          // 주문 금액과 동일하게 설정
            receiverName: "MISS THAI GIRL",
            success: true
        };

        console.log(`[TEST MODE] 가상 검증 성공: RefNo ${mockSlipData.transRef}`);

        // 3. DB 업데이트 로직 (이 부분은 실제 운영 환경과 동일하게 작동해야 함)
        const connection = await db.getConnection();
        await connection.beginTransaction();

        try {
            // 유저 코인 추가
            await connection.execute(
                `UPDATE users SET coins = coins + ? WHERE line_user_id = ?`,
                [order.coin_amount, order.line_user_id]
            );

            // 주문 상태 업데이트 (성공 처리)
            await connection.execute(
                `UPDATE payment_transactions SET status = 'success', trans_ref = ? WHERE id = ?`,
                [mockSlipData.transRef, transactionId]
            );

            await connection.commit();
            console.log(`[TEST MODE] 코인 지급 완료: +${order.coin_amount} Coins`);
            
            res.json({ 
                success: true, 
                message: '테스트 검증 완료 및 코인 지급 성공!',
                testMode: true 
            });

        } catch (innerErr) {
            await connection.rollback();
            throw innerErr;
        } finally {
            connection.release();
        }

    } catch (err) {
        console.error('Test Verification Error:', err);
        res.status(500).json({ error: '테스트 중 서버 에러 발생' });
    }
};
