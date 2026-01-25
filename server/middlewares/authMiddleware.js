import jwt from 'jsonwebtoken';

const PUBLIC_PATHS = [
    '/login',
    '/api/auth/line',
    '/api/auth/callback',
    '/css',
    '/js',
    '/favicon.ico'
];

export const verifyToken = (req, res, next) => {
    const token = req.cookies?.auth_token;

    // ✨ [추가된 로직] 이미 로그인된 사용자가 로그인 페이지에 접근할 때
    if (req.path === '/login' && token) {
        try {
            // 토큰이 진짜 유효한지 검사
            jwt.verify(token, process.env.JWT_SECRET);
            // 유효하다면 로그인 페이지 대신 홈으로 강제 이동
            return res.redirect('/home');
        } catch (err) {
            // 토큰이 가짜거나 만료되었다면 쿠키를 지우고 로그인 페이지를 보여줌
            res.clearCookie('auth_token');
        }
    }

    // 1. 공개 경로 확인
    const isPublic = PUBLIC_PATHS.some(path => req.path.startsWith(path));
    if (isPublic) return next();

    // 2. 토큰이 없는 경우 (공개 경로가 아닐 때)
    if (!token) {
        return res.redirect('/login');
    }

    try {
        // 3. 토큰 검증 및 유저 정보 복호화
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        // 4. 검증 실패 시 쿠키 삭제 후 로그인 이동
        res.clearCookie('auth_token');
        return res.redirect('/login');
    }
};
