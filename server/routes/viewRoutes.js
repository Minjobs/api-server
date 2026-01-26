import express from 'express';
import path from 'path';
import { verifyToken } from '../middlewares/authMiddleware.js'; // 미들웨어 불러오기

const router = express.Router();
const __dirname = path.resolve();

// 🔓 누구나 접근 가능
router.get('/',(req, res) => res.sendFile(path.join(__dirname, 'client/views/home.html')));
router.get('/login', (req, res) => res.sendFile(path.join(__dirname, 'client/views/login.html')));

// 🔐 로그인한 사람만 접근 가능 (verifyToken 추가)
// router.get('/home', verifyToken, (req, res) => res.sendFile(path.join(__dirname, 'client/views/home.html')));
router.get('/profile', verifyToken, (req, res) => res.sendFile(path.join(__dirname, 'client/views/profile.html')));
router.get('/personality', verifyToken, (req, res) => res.sendFile(path.join(__dirname, 'client/views/personality.html')));

export default router;
