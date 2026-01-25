import express from 'express';
import path from 'path';
const router = express.Router();
const __dirname = path.resolve();

// 각 주소에 맞게 HTML 파일을 보내줍니다.
router.get('/', (req, res) => res.sendFile(path.join(__dirname, 'client/views/index.html')));
router.get('/login', (req, res) => res.sendFile(path.join(__dirname, 'client/views/login.html')));
router.get('/home', (req, res) => res.sendFile(path.join(__dirname, 'client/views/home.html')));
router.get('/profile', (req, res) => res.sendFile(path.join(__dirname, 'client/views/profile.html')));

export default router;
