import express from 'express'; // 👈 소문자로 수정
import cookieParser from 'cookie-parser';
import path from 'path';
import 'dotenv/config';

// 라우트 임포트
import viewRoutes from './routes/viewRoutes.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import fortuneRoutes from './routes/fortuneRoutes.js';

const app = express();
const __dirname = path.resolve();

app.use(express.json());
app.use(cookieParser());

// --- [이미지/CSS 정적 파일 경로 설정] ---
// client/public 폴더 안에 background.jpg와 logo.png를 넣어두세요.
app.use(express.static(path.join(__dirname, 'client/public')));

// HTML 파일들이 있는 폴더 설정
app.use(express.static(path.join(__dirname, 'client/views')));

// --- [API 및 라우트 설정] ---
app.use('/', viewRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/fortune', fortuneRoutes);

// --- [404 처리] ---
app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, 'client/views/404.html'));
});

app.listen(3000, () => console.log("🚀 Murdoo K 서버 가동 중... http://localhost:3000"));
