const express = require('express');
const axios = require('axios'); // 라인 API 호출용
const app = express();

app.use(express.json());
app.use(express.static('public'));

// 라인 개발자 콘솔에서 발급받은 액세스 토큰
const LINE_ACCESS_TOKEN = 'iLGaO8NZlJODIJo6RmxWTIdWOmNw/6ckK+dtqViykIKqc9al42E2GAKUSIorh6Mnod/2+XrcuZxWW5RCILcaksUEivG4mEl5ep5BhOtSbfYRiwNCoCkOVmTXswoc+B/9c9S+Fu7FQNjyNkQcsBU0aAdB04t89/1O/w1cDnyilFU=';

app.post('/api/fortune', async (req, res) => {
    const { userId, birthDate, birthTime, gender } = req.body;

    console.log(`사용자 ${userId}의 사주 정보 수신:`, { birthDate, birthTime, gender });

    try {
        // 1. 라인 Push Message API 호출 (서버가 사용자에게 메시지 전송)
        await axios.post('https://api.line.me/v2/bot/message/push', {
            to: userId,
            messages: [
                {
                    type: 'text',
                    text: 'กำลังวิเคราะห์ดวงชะตาของคุณ โปรดรอสักครู่ครับ 🔮\n(머두 K가 당신의 사주를 분석 중입니다. 잠시만 기다려 주세요.)'
                }
            ]
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${LINE_ACCESS_TOKEN}`
            }
        });

        // 2. 여기서 진짜 사주 분석 로직(AI 등)을 시작하면 됩니다.
        
        res.status(200).send('OK');
    } catch (error) {
        console.error('라인 메시지 전송 실패:', error.response.data);
        res.status(500).send('Error');
    }
});

app.listen(3000, () => console.log('머두 K 서버 가동 중 (Port 3000)'));
