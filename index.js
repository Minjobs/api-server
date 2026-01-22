import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import mysql from 'mysql2/promise';
import axios from 'axios';
import jwt from 'jsonwebtoken';

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
app.get('/callback', async (req, res) => {
    console.log('--- [STEP 1] 콜백 도달 확인 ---');
    const { code } = req.query;
    console.log('수신된 인증 코드:', code);

    if (!code) {
        console.log('코드 없음: 라인 인증 실패');
        return res.status(400).send('인증 코드가 없습니다.');
    }

    try {
        console.log('--- [STEP 2] 라인 토큰 요청 시작 ---');
        const tokenRes = await axios.post('https://api.line.me/oauth2/v2.1/token', new URLSearchParams({
            grant_type: 'authorization_code',
            code,
            redirect_uri: process.env.LINE_CALLBACK_URL,
            client_id: process.env.LINE_CHANNEL_ID,
            client_secret: process.env.LINE_CHANNEL_SECRET
        }), { 
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            timeout: 5000 // 5초 안에 응답 안 오면 강제 종료 (무한 로딩 방지)
        });

        console.log('--- [STEP 3] 토큰 획득 성공 ---');

        const userRes = await axios.get('https://api.line.me/v2/profile', {
            headers: { Authorization: `Bearer ${tokenRes.data.access_token}` }
        });

        console.log('--- [STEP 4] 유저 정보 획득:', userRes.data.displayName);

        // JWT 생성 및 쿠키 설정
        const accessToken = jwt.sign(
            { id: userRes.data.userId, name: userRes.data.displayName, img: userRes.data.pictureUrl },
            process.env.JWT_SECRET || 'mallgo_secret',
            { expiresIn: '7d' }
        );

        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        console.log('--- [STEP 5] 로그인 완료, 리다이렉트 ---');
        return res.redirect('/'); // 여기서 응답을 보내야 로딩이 끝납니다.

    } catch (err) {
        console.error('--- [ERROR] 에러 발생 ---');
        console.error(err.response?.data || err.message);
        return res.status(500).send('로그인 처리 중 오류가 발생했습니다.');
    }
});

// 서버측 index.js (express)
app.get('/api/auth/me', (req, res) => {
    const token = req.cookies.accessToken; // 쿠키에서 JWT 추출
    if (!token) return res.json({ isLoggedIn: false });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        res.json({ isLoggedIn: true, user: decoded });
    } catch (err) {
        res.json({ isLoggedIn: false });
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
