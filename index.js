const express = require('express');
const path = require('path');
const app = express();

// JSON 데이터를 읽기 위한 설정
app.use(express.json());
// public 폴더 안의 정적 파일(이미지, CSS 등) 허용
app.use(express.static('public'));

// [Route 1] 홈 페이지 (상품 목록)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'shop.html'));
});

// [Route 2] 상세 페이지 (주소에 ID가 포함됨)
// :id는 변수입니다. /product/1, /product/2 모두 이 라우트로 들어옵니다.
app.get('/product/:id', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'detail.html'));
});

// [API] 상품 데이터를 주는 통로
app.get('/api/products/:id', (req, res) => {
    const productId = req.params.id;
    // 실제로는 여기서 DB 조회를 합니다. 일단은 성공 메시지만 보낼게요.
    res.json({
        id: productId,
        name: productId == 1 ? "오버핏 블레이저" : "나이키 에어포스",
        price: productId == 1 ? 59000 : 129000,
        desc: "달란트가 추천하는 이번 시즌 최고의 아이템입니다."
    });
});

app.listen(3000, () => { console.log('서버 실행 중: http://localhost:3000'); });
