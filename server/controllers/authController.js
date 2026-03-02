import axios from 'axios';
import jwt from 'jsonwebtoken';
import crypto from 'crypto'; // 보안 문자열 생성을 위해 추가
import * as userService from '../services/userService.js';

/**
 * 1. 라인 로그인 페이지로 리다이렉트
 */
export const redirectToLine = (req, res) => {
    console.log("🔮 운명의 문(로그인)을 엽니다...");
    
    // 보안을 위해 고정된 문자열 대신 랜덤 state 생성
    const state = crypto.randomBytes(16).toString('hex');
    
    const baseURL = 'https://access.line.me/oauth2/v2.1/authorize';
    const params = new URLSearchParams({
        response_type: 'code',
        client_id: process.env.LINE_CHANNEL_ID,
        redirect_uri: process.env.LINE_CALLBACK_URL,
        state: state, // 이제 진짜 무작위 키가 들어갑니다.
        scope: 'profile openid',
        bot_prompt: 'aggressive' // 친구 추가를 강력하게 권장
    });

    res.redirect(`${baseURL}?${params.toString()}`);
};

/**
 * 2. 로그아웃 처리
 */
export const logout = (req, res) => {
    res.clearCookie('auth_token', {
        path: '/',
        domain: '.murdoo-k.com'
    });

    console.log('👋 로그아웃 완료: 신전을 떠납니다.');
    res.redirect('/login');
};

/**
 * 3. 라인 인증 콜백 처리
 */
export const handleCallback = async (req, res) => {
    const { code } = req.query;

    if (!code) {
        return res.status(400).send('인증 코드가 증발했습니다.');
    }

    try {
        // [A] 토큰 교환 (코드 -> 액세스 토큰)
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

        // [B] 프로필 정보 획득 (pictureUrl 추출 포함)
        const profileRes = await axios.get('https://api.line.me/v2/profile', {
            headers: { 'Authorization': `Bearer ${access_token}` }
        });
        
        // 라인에서 제공하는 pictureUrl을 명확히 가져옵니다.
        const { userId, displayName, pictureUrl } = profileRes.data;

        // [C] 친구 추가 상태 확인 (에러 방어 로직 적용)
        let isFriend = false;
        try {
            const friendshipRes = await axios.get('https://api.line.me/friendship/v1/status', {
                headers: { 'Authorization': `Bearer ${access_token}` }
            });
            isFriend = friendshipRes.data.friendFlag;
        } catch (friendErr) {
            // 친구 상태 확인 실패 시 경고 로그만 남기고 로그인은 계속 진행합니다.
            console.warn('⚠️ 친구 상태 확인 불가:', friendErr.response?.data?.message || friendErr.message);
        }

        // [D] DB 저장 (pictureUrl을 profile_img로 저장하도록 userService 호출)
        const userResult = await userService.handleUserLogin(userId, displayName, pictureUrl, isFriend);

        // [E] JWT 생성 (요청하신 대로 userId만 포함하여 최소화)
        const token = jwt.sign(
            { userId }, 
            process.env.JWT_SECRET, 
            { expiresIn: '7d' }
        );

        // [F] 쿠키 설정
        // 로컬 테스트 시 쿠키가 안 구워진다면 domain 부분을 주석 처리하고 테스트하세요.
        res.cookie('auth_token', token, {
            httpOnly: true,
            secure: true, // HTTPS 필수
            sameSite: 'lax',
            domain: '.murdoo-k.com', 
            path: '/',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        console.log(`✅ 로그인 및 데이터 동기화 완료: ${displayName}`);
        
        // 최종 목적지로 유저를 인도합니다.
        res.redirect('/');

    } catch (err) {
        console.error('❌ 최종 로그인 처리 실패:', err.response?.data || err.message);
        res.status(500).send('서버 내부 인증 에러가 발생했습니다.');
    }
};
