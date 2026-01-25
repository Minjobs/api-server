import express from 'express';
import * as userController from '../controllers/userController.js';
import { verifyApiKey } from '../middlewares/apiKeyMiddleware.js'; // เช็คชื่อไฟล์ให้ถูกนะครับ
// ถ้า verifyToken อยู่ใน authMiddleware ให้ import มาด้วย
import { verifyToken } from '../middlewares/authMiddleware.js'; 

const router = express.Router();

// ใช้ verifyApiKey กับทุก request ใน router นี้
router.use(verifyApiKey);

// ดึงข้อมูล Profile (ต้องผ่านทั้ง API Key และ Token)
router.get('/profile', verifyToken, userController.getProfile);

// หักเหรียญ
router.post('/use-coin', verifyToken, userController.useCoin);

export default router;
