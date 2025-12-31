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

app.get('/users', (req, res) => {
  db.query('SELECT id, name FROM users', (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});