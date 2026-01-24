const express = require('express');
const axios = require('axios');
const path = require('path');
const app = express();
const port = 3000;

/**
 * 1. 설정 및 미들웨어
 */
app.use(express.json()); // JSON 데이터를 읽기 위한 설정

// public 폴더 내의 정적 파일(이미지, CSS 등)을 자동으로 서빙합니다.
app.use(express.static(path.join(__dirname, 'public')));

// 라인 Messaging API 채널 액세스 토큰 (본인의 토큰으로 교체 필수)
const LINE_ACCESS_TOKEN = 'iLGaO8NZlJODIJo6RmxWTIdWOmNw/6ckK+dtqViykIKqc9al42E2GAKUSIorh6Mnod/2+XrcuZxWW5RCILcaksUEivG4mEl5ep5BhOtSbfYRiwNCoCkOVmTXswoc+B/9c9S+Fu7FQNjyNkQcsBU0aAdB04t89/1O/w1cDnyilFU=';

/**
 * 2. 라우팅 (경로 설정)
 */

// 사용자가 https://murdoo-k.com/ 에 접속했을 때 index.html을 보여줍니다.
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 사용자가 사주 정보를 제출했을 때 실행되는 API
app.post('/api/fortune', async (req, res) => {
    const { userId, birthDate, birthTime, gender } = req.body;

    console.log(`[데이터 수신] ID: ${userId}, 날짜: ${birthDate}, 시간: ${birthTime}, 성별: ${gender}`);

    try {
        // 라인 Messaging API - Push Message 전송
        await axios.post('https://api.line.me/v2/bot/message/push', {
            to: userId,
            messages: [
                {
                    type: 'text',
                    text: 'กำลังวิเคราะห์ดวงชะตาของคุณ โปรดรอสักครู่ครับ 🔮'
                    // 해석: 당신의 사주를 분석 중입니다. 잠시만 기다려 주세요.
                }
            ]
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${LINE_ACCESS_TOKEN}`
            }
        });

        console.log('라인 메시지 전송 완료!');
        res.status(200).json({ status: 'success' });

    } catch (error) {
        console.error('에러 발생:', error.response ? error.response.data : error.message);
        res.status(500).json({ status: 'error', message: '메시지 전송 실패' });
    }
});

/**
 * 3. 서버 가동
 */
app.listen(port, () => {
    console.log(`=========================================`);
    console.log(`머두 K(หมอดู케) 서버 가동 중!`);
    console.log(`포트 번호: ${port}`);
    console.log(`파일 경로: ${path.join(__dirname, 'public', 'index.html')}`);
    console.log(`=========================================`);
});
