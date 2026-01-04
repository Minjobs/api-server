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

// ... 앞선 설정 코드 생략 (mysql 라이브러리 추가 필요: npm install mysql2)
const mysql = require('mysql2/promise');

// DB 연결 설정
const db = mysql.createPool({
    host: 'localhost',
    user: 'api_user',
    password: 'password123',
    database: 'client_db'
});

app.get('/callback', async (req, res) => {
    try {
        // 1. 액세스 토큰 및 라인 프로필 가져오기 (이전 코드와 동일)
        const accessToken = /* 토큰 요청 로직 */;
        const profile = await axios.get('https://api.line.me/v2/profile', {
            headers: { Authorization: `Bearer ${accessToken}` }
        });
        
        const lineUserId = profile.data.userId;

        // 2. DB에서 기존 유저인지 확인
        const [rows] = await db.execute('SELECT * FROM users WHERE line_user_id = ?', [lineUserId]);

        if (rows.length > 0) {
            // [A] 기존 회원이면 -> 프로필 페이지로 이동 (데이터 전달)
            res.redirect(`/profile?userId=${lineUserId}`);
        } else {
            // [B] 신규 회원이면 -> 회원가입 페이지로 이동 (라인ID와 기본정보 전달)
            const initialName = profile.data.displayName;
            res.redirect(`/signup?lineId=${lineUserId}&name=${encodeURIComponent(initialName)}`);
        }
    } catch (error) {
        res.status(500).send('처리 중 오류 발생');
    }
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
    const userId = req.query.userId;
    const [rows] = await db.execute('SELECT * FROM users WHERE line_user_id = ?', [userId]);
    const user = rows[0];

    res.send(`
        <h1>내 프로필</h1>
        <p>닉네임: ${user.nickname}</p>
        <p>이메일: ${user.email}</p>
        <p>전화번호: ${user.phone}</p>
        <a href="/">홈으로</a>
    `);
});


app.listen(PORT, () => {
    console.log(`서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
});
