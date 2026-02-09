import express from 'express';
import path from 'path';
import { verifyToken } from '../middlewares/authMiddleware.js'; // 미들웨어 불러오기

const router = express.Router();
const __dirname = path.resolve();

// 🔓 누구나 접근 가능
router.get('/',(req, res) => res.sendFile(path.join(__dirname, 'client/views/home.html')));
router.get('/login', (req, res) => res.sendFile(path.join(__dirname, 'client/views/login.html')));

// 🔐 로그인한 사람만 접근 가능 (verifyToken 추가)
// router.get('/home', verifyToken, (req, res) => res.sendFile(path.join(__dirname, 'client/views/home.html')));
router.get('/profile', verifyToken, (req, res) => res.sendFile(path.join(__dirname, 'client/views/profile.html')));

//뽑기 페이지
router.get('/gacha', verifyToken, (req, res) => res.sendFile(path.join(__dirname, 'client/views/gacha.html')));

//오방기 페이지
router.get('/obanggi', verifyToken, (req, res) => res.sendFile(path.join(__dirname, 'client/views/obanggi.html')));
//사주 입력 페이지
router.get('/saju', verifyToken, (req, res) => res.sendFile(path.join(__dirname, 'client/views/saju.html')));
//상점 페이지
router.get('/shop', verifyToken, (req, res) => res.sendFile(path.join(__dirname, 'client/views/shop.html')));
//내가 본 사주 리스트 페이지
router.get('/history', verifyToken, (req, res) => res.sendFile(path.join(__dirname, 'client/views/history.html')));
//궁합 input 페이지
router.get('/input/love', verifyToken, (req, res) => res.sendFile(path.join(__dirname, 'client/views/love.html')));
//결제 페이지
router.get('/checkout/:id', verifyToken, (req, res) => res.sendFile(path.join(__dirname, 'client/views/checkout.html')));
// 성격, 재물, 연애 모두 같은 input-form.html을 보여줍니다.
router.get(['/personality', '/wealth', '/romance'], (req, res) => {
    res.sendFile(path.join(__dirname, 'client/views/input-form.html'));
});
// 결과 페이지 URL 처리
router.get('/result/:type/:id', (req, res) => {
    const { type, id } = req.params;

    // type이 love일 경우에만 love_result.html을 보여줍니다.
    if (type === 'love') {
        console.log(`💖 연애 궁합 결과 페이지 로드: ${id}`);
        res.sendFile(path.join(__dirname, 'client/views/love_result.html'));
    } 
    // 그 외의 경우 (일반 사주 등) 기존 결과 페이지를 보여줍니다.
    else {
        console.log(`🔮 일반 사주 결과 페이지 로드 (${type}): ${id}`);
        res.sendFile(path.join(__dirname, 'client/views/result.html'));
    }
});



export default router;
