import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import mysql from 'mysql2/promise';
import axios from 'axios';

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// DB 연결
const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
});

// 1. 라인 로그인 시작 (버튼 클릭 시 이동)
app.get('/api/auth/line', (req, res) => {
    const url = `https://access.line.me/oauth2/v2.1/authorize?response_type=code&client_id=${process.env.LINE_CHANNEL_ID}&redirect_uri=${process.env.LINE_CALLBACK_URL}&state=mallgo123&scope=profile%20openid`;
    res.redirect(url);
});

// 2. 라인 콜백 (라인에서 인증 후 돌아오는 곳)
// index.js 의 /callback 부분 수정
app.get('/callback', async (req, res) => {
    const { code, error, error_description } = req.query;

    // 라인에서 에러를 보낸 경우
    if (error) {
        console.error('라인 인증 에러:', error_description);
        return res.status(400).send(`인증 실패: ${error_description}`);
    }

    try {
        console.log('1. 인증 코드 수신:', code);

        const tokenRes = await axios.post('https://api.line.me/oauth2/v2.1/token', new URLSearchParams({
            grant_type: 'authorization_code',
            code,
            redirect_uri: process.env.LINE_CALLBACK_URL,
            client_id: process.env.LINE_CHANNEL_ID,
            client_secret: process.env.LINE_CHANNEL_SECRET
        }), { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });

        console.log('2. 토큰 발급 성공');

        const userRes = await axios.get('https://api.line.me/v2/profile', {
            headers: { Authorization: `Bearer ${tokenRes.data.access_token}` }
        });

        console.log('3. 유저 정보 획득:', userRes.data.displayName);

        // ... DB 저장 및 JWT 발급 로직
        // (생략)

    } catch (err) {
        // [중요] 에러의 상세 내용을 터미널에 출력합니다.
        console.error('--- 상세 에러 로그 ---');
        if (err.response) {
            console.error('Status:', err.response.status);
            console.error('Data:', err.response.data);
        } else {
            console.error('Message:', err.message);
        }
        res.status(500).send('LINE Login Failed (서버 로그를 확인하세요)');
    }
});


// SPA 라우팅 처리
app.use((req, res, next) => {
    if (!req.path.includes('.')) {
        res.sendFile(path.join(__dirname, 'public', 'index.html'));
    } else {
        next();
    }
});

app.listen(process.env.PORT, '0.0.0.0', () => {
    console.log(`🚀 서버 가동: http://43.201.250.81:${process.env.PORT}`);
});
