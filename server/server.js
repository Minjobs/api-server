import express from 'express';
import cookieParser from 'cookie-parser';
import 'dotenv/config';

import { verifyToken } from './middlewares/authMiddleware.js';
import viewRoutes from './routes/viewRoutes.js';
import authRoutes from './routes/authRoutes.js';

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(express.static('client/public'));

// 검문소 미들웨어 (이전에 만든 것과 동일)
app.use(verifyToken);

// 라우트 연결
app.use('/', viewRoutes);
app.use('/api/auth', authRoutes); // /api/auth/line, /api/auth/callback

app.listen(3000, () => console.log("🚀 Murdoo K 서버 가동 중..."));
