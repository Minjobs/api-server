const express = require('express');
const router = express.Router();
const mallController = require('../controllers/mallController');
const authMiddleware = require('../middlewares/auth');

// 쇼핑몰 리스트 조회 및 개설
router.get('/', authMiddleware, mallController.getMyMalls);
router.post('/create', authMiddleware, mallController.createMall);

module.exports = router;
