// index.js 수정
const express = require('express');
const app = express();
const path = require('path');

// 'public' 폴더 내의 파일들을 자동으로 서빙합니다.
app.use(express.static('public')); 

app.listen(3000, () => {
    console.log('Server is running on http://43.201.250.81:3000');
});
