import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/check', (req, res) => res.json({ status: "ok" }));

// [수정 포인트] '*' 대신 '(.*)'를 사용합니다.
app.get('(.*)', (req, res) => {
    if (!req.path.includes('.')) {
        res.sendFile(path.join(__dirname, 'public', 'index.html'));
    } else {
        res.status(404).send('File Not Found');
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ 서버 가동 중: http://localhost:${PORT}`);
});
