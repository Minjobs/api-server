require('dotenv').config();
const express = require('express');
const axios = require('axios');
const app = express();

const PORT = 3000;

// 1. 로그인 버튼이 있는 메인 페이지
app.get('/', (req, res) => {
    // 라인 로그인 화면으로 보내는 URL 생성
    const lineAuthUrl = `https://access.line.me/oauth2/v2.1/authorize?` +
        `response_type=code` +
        `&client_id=${process.env.LINE_CHANNEL_ID}` +
        `&redirect_uri=${encodeURIComponent(process.env.LINE_CALLBACK_URL)}` +
        `&state=random_state_string` + // 보안을 위해 랜덤 문자열 권장
        `&scope=profile%20openid%20email`;
    
    res.send(`<a href="${lineAuthUrl}">라인으로 로그인하기</a>`);
});

// 2. 라인이 코드를 보내주는 Callback 경로
app.get('/callback', async (req, res) => {
    const code = req.query.code; // 라인이 보내준 일회성 코드

    try {
        // [A] 받은 코드로 'Access Token' 요청하기
        const tokenResponse = await axios.post('https://api.line.me/oauth2/v2.1/token', 
            new URLSearchParams({
                grant_type: 'authorization_code',
                code: code,
                redirect_uri: process.env.LINE_CALLBACK_URL,
                client_id: process.env.LINE_CHANNEL_ID,
                client_secret: process.env.LINE_CHANNEL_SECRET,
            }).toString(), 
            { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
        );

        const accessToken = tokenResponse.data.access_token;

        // [B] 받은 토큰으로 '사용자 프로필' 가져오기
        const profileResponse = await axios.get('https://api.line.me/v2/profile', {
            headers: { Authorization: `Bearer ${accessToken}` }
        });

        // 결과 출력 (실무에서는 여기서 DB에 저장하거나 세션을 만듭니다)
        console.log('사용자 정보:', profileResponse.data);
        res.json({
            message: "로그인 성공!",
            user: profileResponse.data
        });

    } catch (error) {
        console.error('로그인 에러:', error.response.data);
        res.status(500).send('로그인 처리 중 오류 발생');
    }
});

app.listen(PORT, () => {
    console.log(`서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
});
