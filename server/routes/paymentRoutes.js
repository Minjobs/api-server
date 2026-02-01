import express from 'express';
import multer from 'multer';
import { createIntent, getDetail, verifySlip } from '../controllers/paymentController.js';
import { verifyToken } from '../middlewares/authMiddleware.js';
import { verifyApiKey } from '../middlewares/apiKeyMiddleware.js';

const router = express.Router();

// 이미지 메모리 스토리 설정 (용량이 작으므로 바로 처리)
const upload = multer({ storage: multer.memoryStorage() });

/**
 * 모든 결제 관련 API는 보안 미들웨어를 거칩니다.
 */

// 1. 결제 의도 생성
router.post('/intent', verifyApiKey, verifyToken, createIntent);

// 2. 결제 상세 정보 조회
router.get('/detail/:id', verifyApiKey, verifyToken, getDetail);

// 3. 영수증 검증 및 자동 코인 지급
// multer의 'upload.single('slip')'이 checkout.html의 formData.append('slip', ...)과 일치해야 함
router.post('/verify-slip', verifyApiKey, verifyToken, upload.single('slip'), verifySlip);

export default router;
