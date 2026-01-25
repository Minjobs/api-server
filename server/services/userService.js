import db from '../config/db.js';

export const handleUserLogin = async (userId, displayName, isFriend) => {
    try {
        // 1. 기존 유저 조회
        const [rows] = await db.execute(
            'SELECT line_user_id, is_friend_event_done FROM users WHERE line_user_id = ?', 
            [userId]
        );

        let isNew = false;

        if (rows.length === 0) {
            // [신규 유저] 최초 등록 (기본 코인 1개)
            await db.execute(
                `INSERT INTO users (line_user_id, display_name, coins) VALUES (?, ?, ?)`,
                [userId, displayName, 1]
            );
            isNew = true;
        }

        // 2. 친구 추가 보상 체크 (중복 지급 방지)
        // 현재 친구 상태이고, 아직 이벤트를 받지 않은 경우만 지급
        const userStatus = rows[0] || { is_friend_event_done: 0 };
        
        if (isFriend && userStatus.is_friend_event_done === 0) {
            console.log(`🎁 ${displayName}님 친구추가 보상 코인 1개 지급`);
            await db.execute(
                `UPDATE users SET coins = coins + 1, is_friend_event_done = 1 WHERE line_user_id = ?`,
                [userId]
            );
        }

        return { isNew };
    } catch (err) {
        console.error('Database Error in userService:', err.message);
        throw err;
    }
};
