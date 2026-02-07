import express from 'express';
import * as loveController from '../controllers/loveController.js';
import { verifyToken } from '../middlewares/authMiddleware.js';
import { verifyApiKey } from '../middlewares/apiKeyMiddleware.js';

const router = express.Router();

router.use(verifyApiKey);
router.use(verifyToken);

// [POST] /api/love/analyze
router.post('/analyze', loveController.analyzeLove);

export default router;
