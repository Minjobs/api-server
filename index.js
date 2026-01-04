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
    user: 'root',
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


app.listen(PORT, () => {
    console.log(`서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
});
