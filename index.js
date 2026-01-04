require('dotenv').config();
const express = require('express');
const axios = require('axios');
const mysql = require('mysql2/promise');
const app = express();

const PORT = 3000;

const session = require('express-session');

app.use(session({
    secret: 'my-secret-key', // 암호화에 사용될 키 (나중에 .env로 옮기세요)
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, httpOnly: true } // httpOnly는 자바스크립트 탈취 방지
}));

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
            // ... 로그인 로직 수행 후
const lineUserId = profileRes.data.userId;

// URL에 담아 보내는 대신, 세션에 저장합니다.
req.session.user = {
    lineId: lineUserId,
    name: profileRes.data.displayName
};

// 이제 목적지로 이동할 때 ID를 붙이지 않습니다.
res.redirect('/profile'); 

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


app.get('/signup', (req, res) => {
    const { lineId, name } = req.query;
    res.send(`
        <h1>회원가입</h1>
        <form action="/signup" method="POST">
            <input type="hidden" name="lineId" value="${lineId}">
            <p>닉네임: <input type="text" name="nickname" value="${name}"></p>
            <p>이메일: <input type="email" name="email"></p>
            <p>전화번호: <input type="text" name="phone"></p>
            <button type="submit">회원가입 완료</button>
        </form>
    `);
});

app.use(express.urlencoded({ extended: true })); // POST 데이터 해석용

app.post('/signup', async (req, res) => {
    const { lineId, nickname, email, phone } = req.body;
    
    try {
        // DB에 저장
        await db.execute(
            'INSERT INTO users (line_user_id, nickname, email, phone) VALUES (?, ?, ?, ?)',
            [lineId, nickname, email, phone]
        );
        // 완료 후 프로필로 이동
        res.redirect(`/profile?userId=${lineId}`);
    } catch (error) {
        res.send('회원가입 저장 실패');
    }
});

app.get('/profile', async (req, res) => {
    // 세션에 정보가 없으면 로그인 안 한 것으로 간주
    if (!req.session.user) {
        return res.send('<script>alert("로그인이 필요합니다."); location.href="/";</script>');
    }

    // URL 파라미터(?userId=...)가 아니라 세션에서 꺼내옵니다.
    const myLineId = req.session.user.lineId;

    try {
        const [rows] = await db.execute('SELECT * FROM users WHERE line_user_id = ?', [myLineId]);
        const user = rows[0];

        res.send(`
            <h1>안전한 내 프로필</h1>
            <p>닉네임: ${user.nickname}</p>
            <p>이메일: ${user.email}</p>
            <p><strong>URL을 보세요. 당신의 ID가 보이지 않습니다!</strong></p>
        `);
    } catch (error) {
        res.status(500).send("데이터 로드 실패");
    }
});

app.listen(PORT, () => {
    console.log(`서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
});
