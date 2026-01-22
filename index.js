import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import mysql from 'mysql2/promise';
import axios from 'axios';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser'; // [추가] 쿠키 해석 도구

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// 미들웨어 설정
app.use(express.json());
app.use(cookieParser()); // [추가] 반드시 라우터들보다 위에 있어야 합니다!
app.use(express.static(path.join(__dirname, 'public')));

// DB 연결
const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
});

// 1. 라인 로그인 시작
app.get('/api/auth/line', (req, res) => {
    const url = `https://access.line.me/oauth2/v2.1/authorize?response_type=code&client_id=${process.env.LINE_CHANNEL_ID}&redirect_uri=${process.env.LINE_CALLBACK_URL}&state=mallgo123&scope=profile%20openid`;
    res.redirect(url);
});

// 2. 라인 콜백
app.get('/callback', async (req, res) => {
    const { code } = req.query;
    if (!code) return res.status(400).send('인증 코드가 없습니다.');

    try {
        // [A] 토큰 요청
        const tokenRes = await axios.post('https://api.line.me/oauth2/v2.1/token', new URLSearchParams({
            grant_type: 'authorization_code',
            code,
            redirect_uri: process.env.LINE_CALLBACK_URL,
            client_id: process.env.LINE_CHANNEL_ID,
            client_secret: process.env.LINE_CHANNEL_SECRET
        }), { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });

        // [B] 유저 정보 요청
        const userRes = await axios.get('https://api.line.me/v2/profile', {
            headers: { Authorization: `Bearer ${tokenRes.data.access_token}` }
        });

        const { userId, displayName, pictureUrl } = userRes.data;

        // [C] DB 저장 (실무형 Upsert)
        await db.query(`
            INSERT INTO users (line_id, user_name, profile_img) 
            VALUES (?, ?, ?) 
            ON DUPLICATE KEY UPDATE user_name = ?, profile_img = ?`,
            [userId, displayName, pictureUrl, displayName, pictureUrl]
        );

        // [D] JWT 생성
        const accessToken = jwt.sign(
            { id: userId, name: displayName, img: pictureUrl },
            process.env.JWT_SECRET || 'mallgo_secret',
            { expiresIn: '7d' }
        );

        // [E] 쿠키 설정 (path: '/' 필수)
        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: false, // HTTP 환경
            sameSite: 'lax',
            path: '/',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        console.log(`--- ${displayName}님 로그인 성공 ---`);
        return res.redirect('/'); 

    } catch (err) {
        console.error('Login Error:', err.response?.data || err.message);
        return res.status(500).send('로그인 처리 중 오류 발생');
    }
});

// 3. 현재 로그인 정보 확인 API
app.get('/api/auth/me', (req, res) => {
    // [중요] cookieParser가 있어야 req.cookies를 읽을 수 있습니다.
    const token = req.cookies?.accessToken; 
    
    if (!token) {
        return res.json({ isLoggedIn: false });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'mallgo_secret');
        res.json({ isLoggedIn: true, user: decoded });
    } catch (err) {
        res.clearCookie('accessToken');
        res.json({ isLoggedIn: false });
    }
});

// 4. 로그아웃 API
app.post('/api/auth/logout', (req, res) => {
    res.clearCookie('accessToken');
    res.json({ success: true });
});

// SPA 라우팅 처리
app.use((req, res, next) => {
    if (!req.path.includes('.')) {
        res.sendFile(path.join(__dirname, 'public', 'index.html'));
    } else {
        next();
    }
});

app.listen(process.env.PORT || 3000, '0.0.0.0', () => {
    console.log(`🚀 서버 가동: http://43.201.250.81:${process.env.PORT || 3000}`);
});
