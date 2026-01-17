import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const PORT = 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. public 폴더를 정적 파일 경로로 지정
app.use(express.static(path.join(__dirname, 'public')));

// 2. JSON 파싱 (API용)
app.use(express.json());

// 3. 테스트 API
app.get('/api/status', (req, res) => {
    res.json({ status: "running", message: "MallGo Server is Live!" });
});

app.listen(PORT, () => {
    console.log(`
    🚀 MallGo Server Start!
    URL: http://localhost:${PORT}
    Root: ${__dirname}
    `);
});
