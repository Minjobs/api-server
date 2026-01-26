import express from 'express';
import * as fortuneController from '../controllers/fortuneController.js';
import { verifyToken } from '../middlewares/authMiddleware.js';
import { verifyApiKey } from '../middlewares/apiKeyMiddleware.js';

const router = express.Router();

// 보안을 위해 API KEY와 JWT 토큰을 모두 검사합니다.
router.use(verifyApiKey);
router.use(verifyToken);

// 1. [POST] /api/fortune/analyze - AI 분석 요청 및 DB 저장
router.post('/analyze', fortuneController.analyzeFortune);

// 2. [GET] /api/fortune/result/:id - 특정 사주 결과 조회
router.get('/result/:id', fortuneController.getFortuneResult);

export default router;
