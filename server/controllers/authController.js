import axios from 'axios';
import jwt from 'jsonwebtoken';
import querystring from 'querystring';

export const redirectToLine = (req, res) => {
  console.log("로그인 시작");
    const baseURL = 'https://access.line.me/oauth2/v2.1/authorize';
    const params = new URLSearchParams({
        response_type: 'code',
        client_id: process.env.LINE_CHANNEL_ID,
        redirect_uri: process.env.LINE_CALLBACK_URL,
        state: 'random_state_string',
        scope: 'profile openid',
        // 👇 이 한 줄을 추가하세요!
        bot_prompt: 'aggressive' // 'normal' 또는 'aggressive' 사용 가능
    });

    res.redirect(`${baseURL}?${params.toString()}`);
};



export const handleCallback = async (req, res) => {
  console.log('콜백 받음.');
    const { code } = req.query; // 라인이 보내준 일회용 코드

    try {
        // 2. 코드를 액세스 토큰으로 교환
        const tokenResponse = await axios.post('https://api.line.me/oauth2/v2.1/token', 
            querystring.stringify({
                grant_type: 'authorization_code',
                code,
                redirect_uri: process.env.LINE_CALLBACK_URL,
                client_id: process.env.LINE_CHANNEL_ID,
                client_secret: process.env.LINE_CHANNEL_SECRET
            }), 
            { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
        );

        const { access_token } = tokenResponse.data;

        // 3. 토큰으로 유저 프로필 가져오기
        const profileRes = await axios.get('https://api.line.me/v2/profile', {
            headers: { 'Authorization': `Bearer ${access_token}` }
        });
        
        const userId = profileRes.data.userId;

        // 4. 머두 K 전용 JWT 발행 및 쿠키 저장
        const token = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
// handleCallback.js 내 쿠키 설정 부분
res.cookie('auth_token', token, {
    httpOnly: true,     // JS로 쿠키 탈취 방지 (보안)
    secure: true,       // https 환경이라면 반드시 true여야 함
    sameSite: 'lax',    // 라인 서버에서 우리 서버로 리다이렉트될 때 쿠키 전달 보장
    domain: '.murdoo-k.com', // 👈 앞에 .을 붙이면 www 유무와 상관없이 작동합니다.
    path: '/',          // 모든 경로(/home, /profile 등)에서 이 쿠키를 읽을 수 있게 함
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7일 유지
});

        // 5. 로그인 성공 후 홈으로 이동!
        res.redirect('/home');
    } catch (err) {
        console.error('라인 로그인 실패:', err.response?.data || err.message);
        res.status(500).send('인증 과정에서 오류가 발생했습니다.');
    }
};
