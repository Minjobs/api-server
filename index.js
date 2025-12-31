const express = require('express');
const app = express();

// 기본 API
app.get('/', (req, res) => {
  res.send('서버 정상 작동 중 🚀');
});

// 서버 실행
app.listen(3000, () => {
  console.log('서버가 3000번 포트에서 실행 중');
});
