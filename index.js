import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = 3000;

// 1. 미들웨어 설정
app.use(express.json());

// 2. 정적 파일 서비스 (이미지, JS, CSS 등)
// 브라우저가 /js/index.js 등을 요청하면 public 폴더에서 찾아 보냅니다.
app.use(express.static(path.join(__dirname, 'public')));

// 3. API 라우트 예시
app.get('/api/check', (req, res) => {
    res.json({ status: "ok", message: "MallGo API is running" });
});

// 4. SPA 라우팅 설정 (중요!)
// Express 5의 PathError를 피하기 위해 '/:splat*' 형식을 사용합니다.
app.get('/:splat*', (req, res) => {
    // 요청 경로에 '.'이 포함되어 있지 않으면 (확장자가 없는 페이지 요청이면)
    // 무조건 index.html을 보내서 프론트엔드 라우터가 처리하게 합니다.
    if (!req.path.includes('.')) {
        res.sendFile(path.join(__dirname, 'public', 'index.html'));
    } else {
        // 만약 확장자가 있는데 위 static에서 못 찾았다면 404를 보냅니다.
        res.status(404).send('File Not Found');
    }
});

// 5. 서버 실행 (0.0.0.0으로 설정하여 외부 접속 허용)
app.listen(PORT, '0.0.0.0', () => {
    console.log(`
    🚀 MallGo 서버가 성공적으로 가동되었습니다!
    ------------------------------------------
    - 로컬 접속: http://localhost:${PORT}
    - 모든 경로가 index.html로 연결됩니다 (SPA 모드)
    ------------------------------------------
    `);
});
