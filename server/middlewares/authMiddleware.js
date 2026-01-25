import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => {
    const publicPaths = ['/login', '/css', '/js', '/api/auth/line', '/api/auth/callback', '/favicon.ico'];
    const isPublic = publicPaths.some(path => req.path.startsWith(path));
    if (isPublic) return next();

    // 1. 서버가 쿠키를 아예 받았는지 확인
    console.log(`--- [검문] ${req.path} 접속 시도 ---`);
    console.log('받은 쿠키 전체:', req.cookies);

    const token = req.cookies?.auth_token;

    if (!token) {
        console.log('❌ 결과: 쿠키(auth_token)가 아예 없습니다. 로그인 페이지로 보냅니다.');
        return res.redirect('/login');
    }

    try {
        // 2. 토큰 검증 시도
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        console.log('✅ 결과: 인증 성공! 유저 ID:', decoded.userId);
        next();
    } catch (err) {
        // 3. 왜 검증에 실패했는지 에러 메시지 출력
        console.log('❌ 결과: 토큰 검증 실패! 이유:', err.message);
        res.clearCookie('auth_token');
        return res.redirect('/login');
    }
};
