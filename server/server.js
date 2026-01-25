import express from 'express';
import cookieParser from 'cookie-parser';
import path from 'path';
import 'dotenv/config';

import viewRoutes from './routes/viewRoutes.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';

const app = express();
const __dirname = path.resolve();

app.use(express.json());
app.use(cookieParser());
app.use(express.static('client/public'));

// 라우트 설정 (순서 중요)
app.use('/', viewRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes); // 앞에 / 꼭 확인!

app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, 'client/views/404.html'));
});

app.listen(3000, () => console.log("🚀 Murdoo K 서버 가동 중..."));
