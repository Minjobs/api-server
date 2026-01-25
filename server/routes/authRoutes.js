import express from 'express';
import { redirectToLine, handleCallback } from '../controllers/authController.js';

const router = express.Router();

router.get('/line', redirectToLine);     // 사용자가 로그인 버튼 누르면 가는 곳
router.get('/callback', handleCallback); // 라인이 인증 후 돌아오는 곳

export default router;
