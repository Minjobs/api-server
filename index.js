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