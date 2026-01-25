import db from '../config/db.js';

export const getProfile = async (req, res) => {
    try {
        // authMiddleware(verifyToken)에서 넘겨준 userId 사용
        const userId = req.user.userId;

        const [rows] = await db.execute(
            `SELECT 
                display_name, real_name, user_nickname, 
                birth_date, birth_time, gender, 
                coins, total_readings, is_friend_event_done, created_at 
             FROM users WHERE line_user_id = ?`,
            [userId]
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: '유저를 찾을 수 없습니다.' });
        }

        res.json(rows[0]);
    } catch (err) {
        console.error('❌ 프로필 조회 에러:', err.message);
        res.status(500).json({ message: '서버 에러가 발생했습니다.' });
    }
};
