import express from 'express';
import cookieParser from 'cookie-parser';
import path from 'path';
import 'dotenv/config';

import { verifyToken } from './middlewares/authMiddleware.js';
import viewRoutes from './routes/viewRoutes.js';
import apiRoutes from './routes/apiRoutes.js';

const app = express();
const __dirname = path.resolve();

app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'client/public')));

// [핵심] 모든 요청은 검문소(미들웨어)를 먼저 통과함
app.use(verifyToken);

app.use('/', viewRoutes);
app.use('/api', apiRoutes);

app.listen(3000, () => console.log("✨ Murdoo K 서버 가동 중..."));
