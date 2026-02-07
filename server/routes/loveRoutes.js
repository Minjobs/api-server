import express from 'express';
import * as loveController from '../controllers/loveController.js';

const router = express.Router();

// [POST] /api/love/analyze
router.post('/analyze', loveController.analyzeLove);

export default router;
