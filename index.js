require('dotenv').config();
const express = require('express');
const axios = require('axios');
const mysql = require('mysql2/promise');
const app = express();

const PORT = 3000;

// 미들웨어 설정
app.use(express.urlencoded({ extended: true }));

// DB 연결
const db = mysql.createPool({
    host: 'localhost', // EC2 내부라면 localhost가 정석
    user: 'appuser',
    password: 'password123!',
    database: 'client_db'
});

// [Route] 홈 페이지
app.get('/', (req, res) => {
    const lineAuthUrl = `https://access.line.me/oauth2/v2.1/authorize?` +
        `response_type=code` +
        `&client_id=${process.env.LINE_CHANNEL_ID}` +
        `&redirect_uri=${encodeURIComponent(process.env.LINE_CALLBACK_URL)}` +
        `&state=random_state_string` +
        `&scope=profile%20openid%20email`;
    
    res.send(`<a href="${lineAuthUrl}">라인으로 로그인하기</a>`);
});

// [Route] 콜백 처리 (핵심 로직)
app.get('/callback', async (req, res) => {
    const code = req.query.code;
    if (!code) return res.status(400).send('인증 코드가 없습니다.');

    try {
        // 1. 토큰 교환
        const tokenRes = await axios.post('https://api.line.me/oauth2/v2.1/token', 
            new URLSearchParams({
                grant_type: 'authorization_code',
                code: code,
                redirect_uri: process.env.LINE_CALLBACK_URL,
                client_id: process.env.LINE_CHANNEL_ID,
                client_secret: process.env.LINE_CHANNEL_SECRET,
            }).toString(),
            { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
        );

        // 2. 프로필 요청
        const profileRes = await axios.get('https://api.line.me/v2/profile', {
            headers: { Authorization: `Bearer ${tokenRes.data.access_token}` }
        });
        
        const lineUserId = profileRes.data.userId;

        // 3. DB 유저 확인
        const [rows] = await db.execute('SELECT * FROM users WHERE line_user_id = ?', [lineUserId]);

        if (rows.length > 0) {
            res.redirect(`/profile?userId=${lineUserId}`);
        } else {
            res.redirect(`/signup?lineId=${lineUserId}&name=${encodeURIComponent(profileRes.data.displayName)}`);
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('로그인 처리 실패');
    }
});

// ... 회원가입(GET/POST) 및 프로필(GET) 코드는 기존과 동일하게 유지

app.listen(PORT, () => {
    console.log(`서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
});
