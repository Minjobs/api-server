import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = 3000; // 변수 선언을 위로 올리는 것이 안전합니다.

// 1. 정적 파일 서비스 (js, css, 이미지 등)
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// 2. API 라우트 (정적 파일 서비스 뒤, SPA 설정 앞에 위치해야 함)
app.get('/api/check', (req, res) => res.json({ status: "ok" }));

// 3. 모든 경로(*)에 대해 index.html을 반환 (SPA 라우팅 핵심)
// 이 설정 덕분에 /profile, /home 어디서 새로고침해도 에러가 나지 않습니다.
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`✅ 서버 가동 중: http://localhost:${PORT}`);
});
