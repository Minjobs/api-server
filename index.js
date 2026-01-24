import 'dotenv/config';
import express from 'express';
import axios from 'axios';
import path from 'path';
import { fileURLToPath } from 'url';
import OpenAI from 'openai';
import mysql from 'mysql2/promise'; // MySQL 라이브러리 추가

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

// 1. MySQL 연결 풀 설정 (효율적인 연결 관리)
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

/**
 * [API 1] 유저 등록 여부 확인
 * 웹페이지 접속 시 LIFF에서 받은 userId로 호출합니다.
 */
app.get('/api/check-user/:userId', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM users WHERE userId = ?', [req.params.userId]);
        
        if (rows.length > 0) {
            res.json({ isRegistered: true, user: rows[0] });
        } else {
            res.json({ isRegistered: false });
        }
    } catch (error) {
        console.error('DB 조회 에러:', error);
        res.status(500).json({ error: '데이터베이스 조회 실패' });
    }
});

/**
 * [API 2] 신규 유저 등록
 * 프로필 입력 폼에서 데이터를 받아 DB에 저장합니다.
 */
app.post('/api/register', async (req, res) => {
    const { userId, birthDate, birthTime, gender } = req.body;
    try {
        await pool.query(
            'INSERT INTO users (userId, birthDate, birthTime, gender) VALUES (?, ?, ?, ?)',
            [userId, birthDate, birthTime, gender]
        );
        res.json({ success: true });
    } catch (error) {
        console.error('DB 저장 에러:', error);
        res.status(500).json({ error: '데이터 저장 실패' });
    }
});

/**
 * [API 3] 사주 분석 및 결과 전송 (기존 로직 유지)
 */
app.post('/api/fortune', async (req, res) => {
    const { userId, birthDate, birthTime, gender } = req.body;

    try {
        // 즉시 응답 후 비동기로 AI 분석 진행
        await sendLineMessage(userId, 'กำลังวิเคราะห์ดวงชะตาของคุณ โปรดรอสักครู่ครับ 🔮');
        res.status(200).json({ status: 'success' });

        const prompt = `You are a professional Thai fortune teller. Analyze for: Date ${birthDate}, Time ${birthTime}, Gender ${gender}. Answer in Thai.`;

        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [{ role: "user", content: prompt }],
        });

        const result = completion.choices[0].message.content;
        await sendLineMessage(userId, `✨ คำทำนายของคุณมาถึงแล้วครับ! ✨\n\n${result}\n\nขอให้เป็นวันที่ดีนะครับ!`);

    } catch (error) {
        console.error('API 에러:', error);
    }
});

async function sendLineMessage(userId, text) {
    await axios.post('https://api.line.me/v2/bot/message/push', {
        to: userId,
        messages: [{ type: 'text', text: text }]
    }, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.LINE_ACCESS_TOKEN}`
        }
    });
}

app.listen(port, () => {
    console.log(`서버 가동 중: http://localhost:${port}`);
});
