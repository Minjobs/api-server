import express from 'express';
import * as userController from '../controllers/userController.js';
import { verifyApiKey } from '../middlewares/apiKeyMiddleware.js'; // 파일명 확인!
import { verifyToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

// 모든 유저 API에 API Key 보안 적용
router.use(verifyApiKey);

// 1. 프로필 조회 (GET /api/user/profile)
router.get('/profile', verifyToken, userController.getProfile);


// 2. 코인 사용 (POST /api/user/use-coin)
router.post('/use-coin', verifyToken, userController.useCoin);

export default router;
