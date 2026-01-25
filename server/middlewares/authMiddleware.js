export const verifyToken = (req, res, next) => {
    const token = req.cookies.auth_token;

    // 1. 검사 제외 대상 수정
    const publicPaths = [
        '/login', 
        '/css', 
        '/js', 
        '/api/auth/login', 
        '/api/auth/line', // 👈 라인 로그인 시작 경로 추가!
        '/api/auth/callback'
    ];
    
    // 만약 콜백 경로가 /api/auth/line/callback 이라면 
    // .startsWith('/api/auth/line') 덕분에 같이 통과됩니다.
    const isPublic = publicPaths.some(path => req.path.startsWith(path));

    if (isPublic) return next();

    // 2. 토큰이 없는 경우 -> 로그인 페이지로 이동
    if (!token) {
        console.log(`[미인증 접속] ${req.path} -> /login 리다이렉트`);
        return res.redirect('/login');
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        res.clearCookie('auth_token');
        return res.redirect('/login');
    }
};
