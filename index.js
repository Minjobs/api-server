import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = 3000;

app.use(express.json());

// [중요] 정적 파일 서비스를 최상단에 배치
// 브라우저가 /js/index.js를 요청하면 실제 파일을 찾아줍니다.
app.use(express.static(path.join(__dirname, 'public')));

// API 라우트
app.get('/api/check', (req, res) => res.json({ status: "ok" }));

// [수정] SPA 라우팅 설정
// 정적 파일(.js, .css 등)이 아닌 일반 경로 요청일 때만 index.html을 보냅니다.
app.get('*', (req, res) => {
    // 요청 경로에 '.'이 없다면(확장자가 없다면) 페이지 요청으로 간주
    if (!req.path.includes('.')) {
        res.sendFile(path.join(__dirname, 'public', 'index.html'));
    } else {
        // 확장자가 있는데 위 static에서 못 찾은 경우 404
        res.status(404).send('File Not Found');
    }
});

app.listen(PORT, () => {
    console.log(`✅ 서버 가동 중: http://localhost:${PORT}`);
});
