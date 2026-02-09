import express from 'express';
import * as gachaController from '../controllers/gachaController.js';
import { verifyToken } from '../middlewares/authMiddleware.js';
import { verifyApiKey } from '../middlewares/apiKeyMiddleware.js';

const router = express.Router();

router.use(verifyApiKey);

router.post('/analyze', verifyToken,gachaController.analyzeGacha);
router.get('/result/:id', gachaController.getGachaResult);

export default router;
