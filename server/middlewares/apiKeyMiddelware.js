export const verifyApiKey = (req, res, next) => {
    const apiKey = req.headers['x-api-key']; // 헤더에서 키 추출

    if (!apiKey || apiKey !== process.env.INTERNAL_API_KEY) {
        return res.status(403).json({ 
            message: 'Forbidden: Invalid or missing API Key' 
        });
    }
    next();
};
