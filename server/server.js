import express from 'express';
import cookieParser from 'cookie-parser';
import path from 'path'; // 👈 추가 필요!
import 'dotenv/config';

import { verifyToken } from './middlewares/authMiddleware.js';
import viewRoutes from './routes/viewRoutes.js';
import authRoutes from './routes/authRoutes.js';

const app = express();
const __dirname = path.resolve(); // 👈 ES 모듈에서 __dirname 설정

app.use(express.json());
app.use(cookieParser());
app.use(express.static('client/public'));

// 1. 로그인 관련 및 API 라우트를 검문소 앞에 배치하거나 
// 2. 검문소를 거치게 하되, 404는 모든 라우트 실패 시 작동하게 합니다.
app.use(verifyToken);

app.use('/', viewRoutes);
app.use('/api/auth', authRoutes);

// [중요] 모든 라우트(viewRoutes 등) 뒤에 위치해야 합니다.
app.use((req, res) => {
    // 만약 파일 경로가 'client/views/404.html'이 맞다면 아래 코드가 작동합니다.
    res.status(404).sendFile(path.join(__dirname, 'client/views/404.html'));
});

app.listen(3000, () => console.log("🚀 Murdoo K 서버 가동 중..."));
