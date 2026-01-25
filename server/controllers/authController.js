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
    console.log('--- [1] LINE 콜백 진입 ---');
    const { code } = req.query; 

    if (!code) {
        console.error('❌ 인증 코드가 없습니다.');
        return res.status(400).send('인증 코드가 누락되었습니다.');
    }

    try {
        // [2] 액세스 토큰 교환 (URLSearchParams 방식 사용으로 invalid_request 해결)
        console.log('--- [2] 토큰 교환 시도 중... ---');
        
        const params = new URLSearchParams();
        params.append('grant_type', 'authorization_code');
        params.append('code', code);
        params.append('redirect_uri', process.env.LINE_CALLBACK_URL);
        params.append('client_id', process.env.LINE_CHANNEL_ID);
        params.append('client_secret', process.env.LINE_CHANNEL_SECRET);

        const tokenResponse = await axios.post('https://api.line.me/oauth2/v2.1/token', 
            params.toString(), // 문자열로 변환하여 전송
            { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
        );

        const { access_token } = tokenResponse.data;
        console.log('✅ [3] 토큰 교환 성공!');

        // [4] 유저 프로필 가져오기
        console.log('--- [4] 프로필 정보 요청 중... ---');
        const profileRes = await axios.get('https://api.line.me/v2/profile', {
            headers: { 'Authorization': `Bearer ${access_token}` }
        });
        
        const userId = profileRes.data.userId;
        const userName = profileRes.data.displayName; // 사용자 이름도 가져올 수 있습니다.
        console.log(`✅ [5] 프로필 획득 성공 (ID: ${userId}, Name: ${userName})`);

        // [6] 머두 K 전용 JWT 발행
        const token = jwt.sign(
            { userId, name: userName }, 
            process.env.JWT_SECRET, 
            { expiresIn: '7d' }
        );

        // [7] 쿠키 설정 (도메인 및 보안 옵션 최적화)
        res.cookie('auth_token', token, {
            httpOnly: true,     // 보안: JS 접근 불가
            secure: true,       // HTTPS 환경 필수
            sameSite: 'lax',    // 리다이렉트 시 쿠키 유지
            domain: '.murdoo-k.com', // 도메인 앞에 점(.) 확인
            path: '/',          // 모든 경로에서 사용 가능
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7일
        });

        console.log('✅ [6] 쿠키 설정 완료, /home으로 이동합니다.');
        
        // [8] 최종 이동
        res.redirect('/home');

    } catch (err) {
        // 상세 에러 로깅
        console.error('❌ 에러 발생 지점:', err.response?.data || err.message);
        
        if (err.response) {
            console.error('상세 에러 내용:', JSON.stringify(err.response.data, null, 2));
        }
        
        res.status(500).send('인증 과정에서 오류가 발생했습니다.');
    }
};
