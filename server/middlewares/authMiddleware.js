import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => {
    const token = req.cookies.auth_token;

    // 1. 검사 제외 대상 (로그인 페이지, 정적 자산, 로그인 API)
    const publicPaths = ['/login', '/css', '/js', '/api/auth/login'];
    const isPublic = publicPaths.some(path => req.path.startsWith(path));

    if (isPublic) return next();

    // 2. 토큰이 없는 경우 -> 로그인 페이지로 이동
    if (!token) {
        console.log(`[미인증 접속] ${req.path} -> /login 리다이렉트`);
        return res.redirect('/login');
    }

    try {
        // 3. 토큰 검증
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // 다음 로직에서 사용할 수 있게 저장
        next();
    } catch (err) {
        // 토큰이 가짜거나 만료된 경우 쿠키 삭제 후 로그인 이동
        res.clearCookie('auth_token');
        return res.redirect('/login');
    }
};
