// middlewares/apiKeyMiddleware.js
export const verifyApiKey = (req, res, next) => {
    const apiKey = req.headers['x-api-key'];
    
    // 이 로그가 PM2에 찍히는지 확인하세요!
    console.log(`📡 [보안검사] 클라이언트가 보낸 키: ${apiKey}`);
    console.log(`📡 [보안검사] 서버가 가진 키: ${process.env.INTERNAL_API_KEY}`);

    if (!apiKey || apiKey !== process.env.INTERNAL_API_KEY) {
        console.error('❌ [보안검사] API Key 불일치로 차단됨!');
        return res.status(403).json({ message: 'Forbidden' });
    }
    
    console.log('✅ [보안검사] API Key 통과!');
    next();
};
