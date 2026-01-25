import express from 'express';
import cookieParser from 'cookie-parser';
import path from 'path';
import 'dotenv/config';

import viewRoutes from './routes/viewRoutes.js';
import apiRoutes from './routes/apiRoutes.js';
import { verifyToken } from './middlewares/authMiddleware.js';

const app = express();
const __dirname = path.resolve();

app.use(express.json());
app.use(cookieParser());

// 1. 정적 파일 (CSS, JS) 서빙
app.use(express.static(path.join(__dirname, 'client/public')));

// 2. 전역 미들웨어 (모든 요청 시 JWT 검문)
app.use(verifyToken);

// 3. 라우터 연결
app.use('/', viewRoutes);    // 페이지 이동 관련
app.use('/api', apiRoutes);  // 데이터 요청 관련

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
