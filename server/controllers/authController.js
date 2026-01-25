import axios from 'axios';
import jwt from 'jsonwebtoken';

export const login = async (req, res) => {
    const { accessToken } = req.body;
    try {
        // 1. LINE 서버에 토큰 확인 요청
        const profileRes = await axios.get('https://api.line.me/v2/profile', {
            headers: { 'Authorization': `Bearer ${accessToken}` }
        });
        
        const userId = profileRes.data.userId;

        // 2. JWT 발급 (7일 유효)
        const token = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });

        // 3. 쿠키에 저장
        res.cookie('auth_token', token, { 
            httpOnly: true, 
            maxAge: 7 * 24 * 60 * 60 * 1000 
        });

        res.json({ success: true, userId });
    } catch (err) {
        res.status(401).json({ error: '인증에 실패했습니다.' });
    }
};
