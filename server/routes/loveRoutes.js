import express from 'express';
import * as loveController from '../controllers/loveController.js';
import { authenticateUser } from '../middleware/auth.js'; // 로그인 확인 미들웨어

const router = express.Router();

// [POST] /api/love/analyze
router.post('/analyze', authenticateUser, loveController.analyzeLove);

export default router;
