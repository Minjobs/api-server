import jwt from 'jsonwebtoken';

/**
 * 인증이 필요 없는 공개 경로 목록
 * 정적 파일(css, js) 및 로그인 관련 경로 포함
 */
const PUBLIC_PATHS = [
    '/login',
    '/api/auth/line',
    '/api/auth/callback',
    '/css',
    '/js',
    '/favicon.ico'
];

export const verifyToken = (req, res, next) => {
    // 1. 공개 경로 확인 (startsWith를 사용하여 하위 경로까지 포괄)
    const isPublic = PUBLIC_PATHS.some(path => req.path.startsWith(path));
    if (isPublic) return next();

    // 2. 쿠키에서 토큰 추출
    const token = req.cookies?.auth_token;

    // 3. 토큰이 없는 경우 로그인 페이지로 강제 이동
    if (!token) {
        return res.redirect('/login');
    }

    try {
        // 4. 토큰 검증 및 유저 정보 복호화
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // 5. 다음 미들웨어나 라우터에서 사용할 수 있도록 req 객체에 저장
        req.user = decoded;
        next();
    } catch (err) {
        // 6. 토큰이 유효하지 않은 경우 (만료, 위조 등) 쿠키 삭제 후 로그인 이동
        res.clearCookie('auth_token');
        return res.redirect('/login');
    }
};
