import axios from 'axios';
import jwt from 'jsonwebtoken';
import querystring from 'querystring';

export const redirectToLine = (req, res) => {
    console.log("ID:", process.env.LINE_CHANNEL_ID); // 확인용
    console.log("URL:", process.env.LINE_CALLBACK_URL); // 확인용

    const baseURL = 'https://access.line.me/oauth2/v2.1/authorize';
    const params = querystring.stringify({
        response_type: 'code',
        client_id: process.env.LINE_CHANNEL_ID,
        redirect_uri: process.env.LINE_CALLBACK_URL,
        state: 'random_state_string',
        scope: 'profile openid'
    });
    
    const finalURL = `${baseURL}?${params}`;
    console.log("최종 리다이렉트 URL:", finalURL);
    res.redirect(finalURL);
};


export const handleCallback = async (req, res) => {
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
        res.cookie('auth_token', token, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 });

        // 5. 로그인 성공 후 홈으로 이동!
        res.redirect('/home');
    } catch (err) {
        console.error('라인 로그인 실패:', err.response?.data || err.message);
        res.status(500).send('인증 과정에서 오류가 발생했습니다.');
    }
};
