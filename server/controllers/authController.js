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

// [중요] JWT_SECRET이 없으면 서버 실행 단계에서 미리 에러를 내주는 것이 좋습니다.
const SECRET = process.env.JWT_SECRET;

export const handleCallback = async (req, res) => {
    console.log('--- [1] LINE 콜백 진입 ---');
    
    // 디버깅용: Secret이 제대로 로드되었는지 확인 (보안상 길이나 일부만 출력)
    if (!SECRET) {
        console.error('❌ 에러: JWT_SECRET이 환경 변수에 설정되지 않았습니다!');
        return res.status(500).send('서버 설정 오류');
    }

    const { code } = req.query; 
    if (!code) return res.status(400).send('인증 코드가 없습니다.');

    try {
        // [2] 액세스 토큰 교환
        const params = new URLSearchParams({
            grant_type: 'authorization_code',
            code,
            redirect_uri: process.env.LINE_CALLBACK_URL,
            client_id: process.env.LINE_CHANNEL_ID,
            client_secret: process.env.LINE_CHANNEL_SECRET
        });

        const tokenResponse = await axios.post('https://api.line.me/oauth2/v2.1/token', 
            params.toString(), 
            { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
        );

        const { access_token } = tokenResponse.data;

        // [3] 프로필 정보 획득
        const profileRes = await axios.get('https://api.line.me/v2/profile', {
            headers: { 'Authorization': `Bearer ${access_token}` }
        });
        
        const { userId, displayName } = profileRes.data;
        console.log(`✅ [프로필 획득] Name: ${displayName}`);

        // [4] 토큰 발행 (반드시 .env의 SECRET 사용)
        // 여기서 쓰이는 SECRET이 미들웨어의 jwt.verify(token, process.env.JWT_SECRET)과 같아야 합니다.
        const token = jwt.sign(
            { userId, name: displayName }, 
            SECRET, 
            { expiresIn: '7d' }
        );

        // [5] 쿠키 설정
        res.cookie('auth_token', token, {
            httpOnly: true,
            secure: true, // HTTPS 사용 시 true
            sameSite: 'lax',
            domain: '.murdoo-k.com', 
            path: '/',
            maxAge: 7 * 24 * 60 * 60 * 1000 
        });

        console.log('✅ [완료] 쿠키 발급 및 /리다이렉트');
        res.redirect('/');

    } catch (err) {
        console.error('❌ 인증 에러:', err.response?.data || err.message);
        res.status(500).send('인증 실패');
    }
};
