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
// .env의 주소 끝이 /callback 이라면 여기 주소도 /callback 이어야 합니다.
app.get('/callback', async (req, res) => {
    const { code } = req.query;

    try {
        // [A] Access Token 발급 요청
        const tokenRes = await axios.post('https://api.line.me/oauth2/v2.1/token', new URLSearchParams({
            grant_type: 'authorization_code',
            code,
            redirect_uri: process.env.LINE_CALLBACK_URL,
            client_id: process.env.LINE_CHANNEL_ID,
            client_secret: process.env.LINE_CHANNEL_SECRET
        }), { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });

        // [B] 사용자 프로필 정보 요청
        const userRes = await axios.get('https://api.line.me/v2/profile', {
            headers: { Authorization: `Bearer ${tokenRes.data.access_token}` }
        });

        const { userId, displayName, pictureUrl } = userRes.data;

        // [C] DB 저장 (이미 있으면 무시, 없으면 삽입 - Upsert 로직)
        await db.query(`
            INSERT INTO users (line_id, user_name, profile_img) 
            VALUES (?, ?, ?) 
            ON DUPLICATE KEY UPDATE user_name = ?, profile_img = ?`,
            [userId, displayName, pictureUrl, displayName, pictureUrl]
        );

        // 로그인 후 메인으로 리다이렉트
        res.redirect('/'); 

    } catch (err) {
        console.error('Error:', err.response?.data || err.message);
        res.status(500).send('Login Failed');
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
