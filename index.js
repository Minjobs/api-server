const express = require('express');
const path = require('path');
const mysql = require('mysql2'); // 설치한 라이브러리 불러오기
const app = express();
// index.js 상단에 추가
require('dotenv').config(); 

const express = require('express');
const mysql = require('mysql2');
const path = require('path');

const app = express();

// 이제 하드코딩된 정보 대신 process.env를 사용합니다.
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
});

db.connect((err) => {
    if (err) console.error('DB 연결 실패:', err);
    else console.log('MySQL 연결 성공! (환경 변수 사용 중) 🚀');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`서버 작동 중: ${PORT}`));


// --- 페이지 라우팅 ---
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'shop.html'));
});

app.get('/product/:id', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'detail.html'));
});

// --- API (실제 DB에서 데이터 가져오기) ---

// 2. 전체 상품 목록 API
app.get('/api/products', (req, res) => {
    const sql = "SELECT * FROM products"; // 모든 상품 조회 쿼리
    db.query(sql, (err, results) => {
        if (err) return res.status(500).send(err);
        res.json(results);
    });
});

// 3. 특정 상품 상세 API
app.get('/api/products/:id', (req, res) => {
    const sql = "SELECT * FROM products WHERE id = ?"; // 특정 ID 조회 쿼리
    db.query(sql, [req.params.id], (err, result) => {
        if (err) return res.status(500).send(err);
        if (result.length > 0) {
            res.json(result[0]);
        } else {
            res.status(404).send("상품 없음");
        }
    });
});

// [Admin] 셀러 어드민 로그인 페이지
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin_login.html'));
});

// [Admin] 셀러 어드민 메인 대시보드 (로그인 후 이동할 곳)
app.get('/admin/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin_dashboard.html'));
});

// [API] 새로운 상품 등록
app.get('/api/admin/add-product', (req, res) => {
    // 실제로는 POST를 써야 하지만, 우선 테스트를 위해 GET으로 흐름만 잡습니다.
    // 나중에 정식으로 바꿀게요!
    const { name, price, desc, img } = req.query;
    const sql = "INSERT INTO products (name, price, desc_text, img) VALUES (?, ?, ?, ?)";
    
    db.query(sql, [name, price, desc, img], (err, result) => {
        if (err) return res.status(500).json(err);
        res.json({ message: "상품 등록 성공!", id: result.insertId });
    });
});


app.listen(PORT, () => {
    console.log(`서버 실행 중: http://localhost:${PORT}`);
});
