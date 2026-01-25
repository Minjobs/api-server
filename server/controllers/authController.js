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
    console.log('1. 콜백 진입');
    const { code } = req.query;

    try {
        console.log('2. 토큰 교환 시도...');
        const tokenResponse = await axios.post('https://api.line.me/oauth2/v2.1/token', 
            // ... (기존 코드)
        );
        console.log('3. 토큰 교환 성공!');

        const { access_token } = tokenResponse.data;
        console.log('4. 프로필 요청 시도...');
        const profileRes = await axios.get('https://api.line.me/v2/profile', {
            headers: { 'Authorization': `Bearer ${access_token}` }
        });
        console.log('5. 프로필 획득 성공! userId:', profileRes.data.userId);

        // JWT 생성 및 쿠키 설정
        const token = jwt.sign({ userId: profileRes.data.userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
        
        res.cookie('auth_token', token, {
            httpOnly: true,
            secure: true, // https 환경이면 true
            sameSite: 'lax',
            domain: '.murdoo-k.com', // 도메인 앞에 점(.) 확인!
            path: '/'
        });
        console.log('6. 쿠키 설정 완료, /home으로 리다이렉트 합니다.');
        res.redirect('/home');

    } catch (err) {
        // 여기서 에러 로그가 찍히는지 꼭 보세요!
        console.error('❌ 에러 발생 지점:', err.response?.data || err.message);
        res.status(500).send('인증 실패');
    }
};
