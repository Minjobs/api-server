import axios from 'axios';
import jwt from 'jsonwebtoken';
import querystring from 'querystring';
import * as userService from '../services/userService.js';

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

export const logout = (req, res) => {
    // 1. 쿠키 삭제 (설정할 때와 동일한 도메인/경로 옵션을 주는 것이 안전합니다)
    res.clearCookie('auth_token', {
        path: '/',
        domain: '.murdoo-k.com' // 쿠키 설정 시 domain을 넣었다면 여기서도 똑같이 맞춰야 삭제됩니다.
    });

    console.log('👋 로그아웃 완료: 쿠키를 삭제하고 로그인 페이지로 이동합니다.');
    
    // 2. 로그인 페이지로 리다이렉트
    res.redirect('/login');
};


// [중요] JWT_SECRET이 없으면 서버 실행 단계에서 미리 에러를 내주는 것이 좋습니다.
const SECRET = process.env.JWT_SECRET;

export const handleCallback = async (req, res) => {
    const { code } = req.query;

    if (!code) {
        return res.status(400).send('Authorization code is missing');
    }

    try {
        // 1. LINE 액세스 토큰 발급 요청
        const tokenParams = new URLSearchParams({
            grant_type: 'authorization_code',
            code,
            redirect_uri: process.env.LINE_CALLBACK_URL,
            client_id: process.env.LINE_CHANNEL_ID,
            client_secret: process.env.LINE_CHANNEL_SECRET
        });

        const tokenRes = await axios.post('https://api.line.me/oauth2/v2.1/token', 
            tokenParams.toString(), 
            { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
        );

        const { access_token } = tokenRes.data;

        // 2. LINE 유저 프로필 정보 가져오기
        const profileRes = await axios.get('https://api.line.me/v2/profile', {
            headers: { 'Authorization': `Bearer ${access_token}` }
        });
        const { userId, displayName } = profileRes.data;

        // 3. LINE 친구 추가 상태 확인 (보상 지급용)
        const friendshipRes = await axios.get('https://api.line.me/friendship/v1/status', {
            headers: { 'Authorization': `Bearer ${access_token}` }
        });
        const isFriend = friendshipRes.data.friendFlag; // true 또는 false

        // 4. [Service Layer] DB 저장 및 이벤트 로직 실행
        // (가입 처리 + 친구 추가 보상 체크를 한 번에 수행)
        const userResult = await userService.handleUserLogin(userId, displayName, isFriend);

        // 5. JWT 토큰 생성
        const token = jwt.sign(
            { userId, name: displayName }, 
            process.env.JWT_SECRET, 
            { expiresIn: '7d' }
        );

        // 6. 쿠키 설정 (보안 옵션 적용)
        res.cookie('auth_token', token, {
            httpOnly: true,
            secure: true, // HTTPS 환경 필수
            sameSite: 'lax',
            domain: '.murdoo-k.com', // 서브도메인 간 공유 시 설정
            path: '/',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7일
        });

        console.log(`✅ 유저 로그인 완료: ${displayName} (신규여부: ${userResult.isNew})`);
        res.redirect('/home');

    } catch (err) {
        console.error('❌ LINE 로그인 처리 실패:', err.response?.data || err.message);
        res.status(500).send('Authentication Error');
    }
};
