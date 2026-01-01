//acode에서 수정함
require('dotenv').config();
const mysql = require('mysql2');

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

db.connect((err) => {
  if (err) {
    console.error('DB 연결 실패:', err);
    return;
  }
  console.log('MySQL 연결 성공 ✅');
});

require('dotenv').config();

const express = require('express');
const app = express();

app.use(express.json());

app.get('/', (req, res) => {
  res.send('API 서버 실행 중 🚀');
});

app.listen(3000, () => {
  console.log('서버가 3000번 포트에서 실행 중');
});

//유저 리스트 다 가져오기.
app.get('/users', (req, res) => {
  db.query('SELECT id, name FROM users', (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});

// POST /users : 새로운 유저 추가
app.post('/users', (req, res) => {
  const { name } = req.body;  // 브라우저/앱에서 보낸 데이터
  if (!name) return res.status(400).json({ error: 'name이 필요합니다.' });

  db.query('INSERT INTO users (name) VALUES (?)', [name], (err, results) => {
    if (err) return res.status(500).json(err);

    res.json({
      message: '유저 추가 성공 ✅',
      id: results.insertId,
      name
    });
  });
});