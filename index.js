import 'dotenv/config';
import express from 'express';
import axios from 'axios';
import path from 'path';
import { fileURLToPath } from 'url';
import OpenAI from 'openai';
import mysql from 'mysql2/promise';

// ES 모듈에서 __dirname 사용을 위한 설정
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

// 1. MySQL 연결 풀 (성능 및 안정성 확보)
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// 2. OpenAI 설정
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// 3. 미들웨어 설정
app.use(express.json());
// CSS, JS, 이미지 등 정적 파일은 public 폴더에서 서빙
app.use(express.static(path.join(__dirname, 'public')));

// --- [4. Clean URL 라우팅 설정] ---

// 루트 페이지 (중앙 관제)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 로그인 대문 페이지
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// 프로필 가입 페이지
app.get('/profile', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/pages/profile', 'profile_view.html'));
});

// 홈(사주 서비스) 페이지
app.get('/home', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'home_view.html'));
});

// 결제 페이지
app.get('/payment', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'payment_view.html'));
});

// --- [5. API 엔드포인트] ---

// 유저 등록 여부 확인 API
app.get('/api/check-user/:userId', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM users WHERE userId = ?', [req.params.userId]);
        res.json({ isRegistered: rows.length > 0, user: rows[0] || null });
    } catch (err) {
        console.error('DB 조회 에러:', err);
        res.status(500).json({ error: '데이터베이스 조회 실패' });
    }
});

// 신규 유저 등록 API
app.post('/api/register', async (req, res) => {
    const { userId, birthDate, birthTime, gender } = req.body;
    try {
        await pool.query(
            'INSERT INTO users (userId, birthDate, birthTime, gender) VALUES (?, ?, ?, ?)',
            [userId, birthDate, birthTime, gender]
        );
        res.json({ success: true });
    } catch (err) {
        console.error('DB 저장 에러:', err);
        res.status(500).json({ error: '유저 등록 실패' });
    }
});

// 사주 분석 및 라인 메시지 발송 API
app.post('/api/fortune', async (req, res) => {
    const { userId, birthDate, birthTime, gender } = req.body;

    try {
        // 1. 유저에게 대기 메시지 즉시 전송
        await sendLineMessage(userId, 'กำลังวิเคราะห์ดวงชะตาของคุณ โปรดรอสักครู่ครับ 🔮\n(당신의 운명을 분석 중입니다. 잠시만 기다려 주세요.)');
        
        // 2. 분석 시작 응답 (프론트엔드용)
        res.status(200).json({ status: 'processing' });

        // 3. OpenAI 분석 요청 (gpt-4o-mini 사용으로 가성비 확보)
        const prompt = `당신은 신비롭고 정중한 태국 점술가 'Mor Doo K'입니다. 
        생일: ${birthDate}, 시간: ${birthTime}, 성별: ${gender}인 사용자의 운세를 태국어로 상세하게 풀어주세요. 
        행운의 숫자나 색깔도 포함해 주세요.`;

        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [{ role: "system", content: "You are a professional and mystical Thai fortune teller." },
                       { role: "user", content: prompt }],
            temperature: 0.8,
        });

        const fortuneResult = completion.choices[0].message.content;

        // 4. 분석 결과 라인 전송
        await sendLineMessage(userId, `✨ คำทำนายของคุณมาถึงแล้วครับ! ✨\n\n${fortuneResult}\n\nขอให้เป็นวันที่ดีนะครับ! 🔮`);

    } catch (err) {
        console.error('Fortune API 에러:', err);
        // 에러 시 유저에게 알림
        await sendLineMessage(userId, '죄송합니다. 별의 계시를 읽는 중 오류가 발생했습니다. 다시 시도해 주세요.');
    }
});

// --- [6. 헬퍼 함수] ---

// 라인 메시지 전송 함수
async function sendLineMessage(userId, text) {
    try {
        await axios.post('https://api.line.me/v2/bot/message/push', {
            to: userId,
            messages: [{ type: 'text', text: text }]
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.LINE_ACCESS_TOKEN}`
            }
        });
    } catch (err) {
        console.error('라인 메시지 전송 에러:', err.response?.data || err.message);
    }
}

// 서버 가동
app.listen(port, () => {
    console.log(`
    -------------------------------------------
    ✨ Murdoo K 서버 가동 중 ✨
    주소: http://localhost:${port}
    각 페이지 접속: /login, /profile, /home, /payment
    -------------------------------------------
    `);
});
