const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;

// 1. 미들웨어 설정
app.use(express.json()); // JSON 데이터를 주고받기 위함
app.use(express.static(path.join(__dirname, 'public'))); // public 폴더의 정적 파일(이미지 등) 허용

// [가짜 데이터] 나중에 MySQL DB 연결할 부분입니다.
const products = [
    { id: 1, name: "오버핏 블레이저", price: 59000, desc: "홍대 감성의 깔끔한 핏", img: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=500" },
    { id: 2, name: "나이키 에어포스", price: 129000, desc: "어디에나 잘 어울리는 클래식", img: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500" }
];

// --- 라우팅 (페이지 이동) ---

// 2. 홈 페이지 (상품 목록)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'shop.html'));
});

// 3. 상세 페이지 주소 설정
// 중요: /product/:id 라고 적으면 /product/1, /product/2 모두 이곳으로 옵니다.
app.get('/product/:id', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'detail.html'));
});

// --- API (데이터 전송) ---

// 4. 특정 상품의 정보만 JSON으로 주는 API
app.get('/api/products/:id', (req, res) => {
    const productId = parseInt(req.params.id);
    const product = products.find(p => p.id === productId);

    if (product) {
        res.json(product);
    } else {
        res.status(404).send("상품을 찾을 수 없습니다.");
    }
});

app.listen(PORT, () => {
    console.log(`달란트 서버가 http://localhost:${PORT} 에서 실행 중입니다!`);
});
