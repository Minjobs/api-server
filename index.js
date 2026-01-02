const express = require('express');
const path = require('path');
const mysql = require('mysql2'); // 설치한 라이브러리 불러오기
const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// 1. MySQL 연결 설정 (본인 정보에 맞게 수정 필수!)
const db = mysql.createConnection({
    host: 'localhost',
    user: 'api_user',            // 보통 root
    password: 'password123', // MySQL 설치 시 설정한 비밀번호
    database: 'api_db'  // 사용할 데이터베이스 이름
});

db.connect((err) => {
    if (err) {
        console.error('DB 연결 실패:', err);
        return;
    }
    console.log('MySQL 연결 성공! 🚀');
});

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

app.listen(PORT, () => {
    console.log(`서버 실행 중: http://localhost:${PORT}`);
});
