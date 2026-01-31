import Omise from 'omise';
import db from '../config/db.js';

// 환경변수에 저장된 키 사용
const omise = Omise({
    publicKey: process.env.OMISE_PUBLIC_KEY,
    secretKey: process.env.OMISE_SECRET_KEY
});

/**
 * [POST] /api/payment/checkout
 * 유저가 선택한 상품으로 PromptPay QR 코드를 생성합니다.
 */
export const createCheckout = async (req, res) => {
    const { coinAmount, bahtAmount } = req.body;
    const line_user_id = req.user.userId; // 미들웨어에서 추출

    try {
        // 1. 오미세 'Source' 생성 (결제 수단 정의)
        const source = await omise.sources.create({
            type: 'promptpay',
            amount: bahtAmount * 100, // 오미세는 Satang 단위(1/100)를 사용하므로 *100 필수
            currency: 'thb'
        });

        // 2. 'Charge' 생성 (실제 결제 요청)
        const charge = await omise.charges.create({
            amount: bahtAmount * 100,
            currency: 'thb',
            source: source.id,
            metadata: {
                line_user_id: line_user_id,
                coinAmount: coinAmount
            }
        });

        // 3. 유저에게 QR 이미지 주소 반환
        // PromptPay의 경우 scannable_code 내에 이미지 주소가 담겨 있습니다.
        const qrUrl = charge.source.scannable_code.image.download_uri;
        res.json({ qrUrl, chargeId: charge.id });

    } catch (err) {
        console.error('❌ 결제 생성 에러:', err);
        res.status(500).json({ error: 'Failed to create payment' });
    }
};

/**
 * [POST] /api/payment/webhook
 * 오미세 서버가 결제 완료를 알릴 때 호출됩니다 (자동 지급 핵심)
 */
export const handleWebhook = async (req, res) => {
    const event = req.body;

    // 결제가 성공적으로 완료된 이벤트인지 확인
    if (event.key === 'charge.complete' && event.data.status === 'successful') {
        const { line_user_id, coinAmount } = event.data.metadata;

        try {
            console.log(`💰 결제 성공 확인: 유저(${line_user_id})에게 ${coinAmount}코인 지급 중...`);
            
            // DB 코인 업데이트
            await db.execute(
                `UPDATE users SET coins = coins + ? WHERE line_user_id = ?`,
                [coinAmount, line_user_id]
            );

            // 처리 완료 응답 (200을 보내야 오미세가 재전송을 멈춤)
            res.sendStatus(200);
        } catch (err) {
            console.error('❌ 코인 지급 DB 에러:', err);
            res.sendStatus(500);
        }
    } else {
        res.sendStatus(200); // 관심 없는 이벤트도 일단 성공 응답
    }
};
