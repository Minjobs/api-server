import express from 'express';
import { verifyApiKey } from '../middlewares/apiKeyMiddleware.js';
import * as userController from '../controllers/userController.js';

const router = express.Router();

// 모든 유저 관련 API는 API Key가 있어야만 작동함
router.use(verifyApiKey);

router.get('/profile', userController.getProfile);
router.post('/use-coin', userController.useCoin);

export default router;
