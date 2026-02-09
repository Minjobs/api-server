import express from 'express';
import cookieParser from 'cookie-parser';
import path from 'path'; // 👈 추가 필요!
import 'dotenv/config';

import { verifyToken } from './middlewares/authMiddleware.js';
import viewRoutes from './routes/viewRoutes.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import fortuneRoutes from './routes/fortuneRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import loveRoutes from './routes/loveRoutes.js';
import gachaRoutes from './routes/gachaRoutes.js';

const app = express();
const __dirname = path.resolve(); // 👈 ES 모듈에서 __dirname 설정

app.use(express.json());
app.use(cookieParser());
app.use(express.static('client/public'));

// 만약 HTML 파일과 이미지가 모두 현재 폴더(루트)에 있다면 아래와 같이 설정
app.use(express.static(path.join(__dirname, 'client/views'))); 

// 1. 로그인 관련 및 API 라우트를 검문소 앞에 배치하거나 

app.use('/', viewRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/user',userRoutes);
app.use('/api/fortune', fortuneRoutes); // /api/fortune/analyze 등으로 접속 가능
app.use('/api/love', loveRoutes); // /궁합운 api
app.use('/api/payment', paymentRoutes); // /api/fortune/analyze 등으로 접속 가능
app.use('/api/gacha', gachaRoutes);

// [중요] 모든 라우트 뒤에 위치해야 합니다.
app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, 'client/views/404.html'));
});

// 수정된 부분: server 변수 선언 ✅
const server = app.listen(3000, () => console.log("🚀 Murdoo K 서버 가동 중..."));

// 사주 분석 AI 연산 시간이 길 수 있으므로 타임아웃 3분 설정
server.timeout = 180000; 
