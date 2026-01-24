import express from 'express';
import axios from 'axios';
import path from 'path';
import { fileURLToPath } from 'url';
import OpenAI from 'openai'; // OpenAI 라이브러리 추가

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// --- 설정값 (본인의 것으로 교체하세요) ---
const LINE_ACCESS_TOKEN = 'iLGaO8NZlJODIJo6RmxWTIdWOmNw/6ckK+dtqViykIKqc9al42E2GAKUSIorh6Mnod/2+XrcuZxWW5RCILcaksUEivG4mEl5ep5BhOtSbfYRiwNCoCkOVmTXswoc+B/9c9S+Fu7FQNjyNkQcsBU0aAdB04t89/1O/w1cDnyilFU=';
// ------------------------------------

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/api/fortune', async (req, res) => {
    const { userId, birthDate, birthTime, gender } = req.body;

    // 1. 즉시 "분석 중" 메시지 전송 (사용자를 기다리게 하지 않기 위함)
    try {
        await sendLineMessage(userId, 'กำลังวิเคราะห์ดวงชะตาของคุณ โปรดรอสักครู่ครับ 🔮\n(머두 K가 당신의 사주를 분석 중입니다. 잠시만 기다려 주세요.)');
        res.status(200).json({ status: 'success' }); // 웹창은 바로 닫아줍니다.
    } catch (err) {
        console.error('초기 메시지 전송 실패:', err);
        return res.status(500).json({ status: 'error' });
    }

    // 2. 배경에서 ChatGPT에게 사주 분석 요청 (비동기 처리)
    try {
        const prompt = `
            You are a professional Thai fortune teller (Mor Doo). 
            Based on the following information, provide a detailed and mystical fortune-telling in Thai.
            - Birth Date: ${birthDate}
            - Birth Time: ${birthTime}
            - Gender: ${gender}
            
            The tone should be encouraging, professional, and slightly mysterious. 
            Focus on career, love, and health for the near future.
            Please answer only in Thai language.
        `;

        const completion = await openai.chat.completions.create({
            model: "gpt-4o", // 혹은 "gpt-3.5-turbo"
            messages: [{ role: "system", content: "You are a famous Thai fortune teller named 'Mor Doo K'." },
                       { role: "user", content: prompt }],
        });

        const fortuneResult = completion.choices[0].message.content;

        // 3. 분석 완료된 결과를 다시 라인으로 전송
        await sendLineMessage(userId, `✨ 결과가 도착했습니다! ✨\n\n${fortuneResult}`);
        console.log(`[분석 완료] 유저 ${userId}에게 사주 결과 전송 완료`);

    } catch (error) {
        console.error('AI 분석 또는 결과 전송 에러:', error);
        await sendLineMessage(userId, '죄송합니다. 분석 중에 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    }
});

// 라인 메시지 전송 함수 (중복 코드 방지)
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
    console.log(`머두 K AI 서버 가동 중 (Port ${port})`);
});
