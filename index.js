import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/check', (req, res) => res.json({ status: "ok" }));

// [수정] 따옴표 없는 정규표현식 /.*/ 을 사용하여 모든 경로를 낚아챕니다.
// 이렇게 하면 Express v5에서도 파라미터 이름 에러가 나지 않습니다.
app.get(/.*/, (req, res) => {
    if (!req.path.includes('.')) {
        res.sendFile(path.join(__dirname, 'public', 'index.html'));
    } else {
        res.status(404).send('File Not Found');
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ 서버 가동 중: http://localhost:${PORT}`);
});
