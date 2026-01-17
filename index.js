import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// API 테스트용
app.get('/api/check', (req, res) => res.json({ status: "ok" }));

// 모든 경로(*)에 대해 index.html을 반환 (SPA 설정)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`✅ 서버 가동 중: http://localhost:${PORT}`);
});


const PORT = 3000;
app.listen(PORT, () => {
    console.log(`✅ 서버 가동 중: http://localhost:${PORT}`);
});
