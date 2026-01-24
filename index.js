import 'dotenv/config';
import express from 'express';
import axios from 'axios';
import path from 'path';
import { fileURLToPath } from 'url';
import OpenAI from 'openai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

// 환경 변수에서 키 가져오기
const LINE_ACCESS_TOKEN = process.env.LINE_ACCESS_TOKEN;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

/**
 * 1. 메인 페이지 연결
 */
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

/**
 * 2. 사주 분석 API
 */
app.post('/api/fortune', async (req, res) => {
    const { userId, birthDate, birthTime, gender } = req.body;

    console.log(`[데이터 수신] ID: ${userId}, 날짜: ${birthDate}, 시간: ${birthTime}, 성별: ${gender}`);

    try {
        // [A] 즉시 "분석 중" 메시지 전송
        await sendLineMessage(userId, 'กำลังวิเคราะห์ดวงชะตาของคุณ โปรดรอสักครู่ครับ 🔮\n(머두 K가 당신의 사주를 분석 중입니다. 잠시만 기다려 주세요.)');
        
        // 프론트엔드(웹창)에는 즉시 응답 성공을 보냄
        res.status(200).json({ status: 'success' });

        // [B] 배경에서 AI 분석 시작 (시간이 걸리는 작업)
        const prompt = `
            You are a professional Thai fortune teller named 'Mor Doo K'. 
            Based on the following user info, provide a mystical and detailed fortune-telling in Thai.
            - Birth Date: ${birthDate}
            - Birth Time: ${birthTime}
            - Gender: ${gender}
            
            1. Analyze personality.
            2. Predict Career and Wealth for the next 3 months.
            3. Predict Love and Health.
            4. Suggest a lucky color or item.
            
            Answer in Thai language only. Use a respectful and professional tone (use 'ครับ').
        `;

        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: "You are a professional Thai fortune teller named Mor Doo K." },
                { role: "user", content: prompt }
            ],
            temperature: 0.7,
        });

        const fortuneResult = completion.choices[0].message.content;

        // [C] 분석 완료 후 유저에게 다시 메시지 전송
        await sendLineMessage(userId, `🔮 คำทำนายของคุณมาถึงแล้วครับ!\n\n${fortuneResult}\n\nขอให้เป็นวันที่ดีครับ!`);
        console.log(`[분석 완료] 유저 ${userId}에게 전송 성공`);

    } catch (error) {
        console.error('에러 발생:', error.response ? error.response.data : error.message);
        // 에러 발생 시 유저에게 알림
        if (userId) {
            await sendLineMessage(userId, 'ขออภัยครับ เกิดข้อผิดพลาดในการวิเคราะห์ดวงชะตา กรุณาลองใหม่ภายหลัง (오류가 발생했습니다. 잠시 후 다시 시도해 주세요.)');
        }
    }
});

/**
 * 3. LINE 메시지 전송 공통 함수
 */
async function sendLineMessage(userId, text) {
    await axios.post('https://api.line.me/v2/bot/message/push', {
        to: userId,
        messages: [{ type: 'text', text: text }]
    }, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${LINE_ACCESS_TOKEN}`
        }
    });
}

app.listen(port, () => {
    console.log(`=========================================`);
    console.log(`머두 K(หมอดูเค) AI 서버 가동 중! (Port: ${port})`);
    console.log(`=========================================`);
});
