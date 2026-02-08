import express from 'express';
import * as loveController from '../controllers/loveController.js';
import { verifyToken } from '../middlewares/authMiddleware.js';
import { verifyApiKey } from '../middlewares/apiKeyMiddleware.js';

const router = express.Router();

router.use(verifyApiKey);

// [POST] /api/love/analyze
router.post('/analyze', verifyToken, loveController.analyzeLove);

// [추가] [GET] /api/love/result/:id - 저장된 결과 조회 👈 이 부분이 없어서 에러가 났던 겁니다!
router.get('/result/:id', loveController.getLoveResult); 

export default router;
