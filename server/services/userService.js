import db from '../config/db.js';

export const handleUserLogin = async (userId, displayName, profileImg, isFriend) => {
    try {
        // 1. 기존 유저 조회 (profile_img도 함께 관리)
        const [rows] = await db.execute(
            'SELECT line_user_id, is_friend_event_done, coins FROM users WHERE line_user_id = ?', 
            [userId]
        );

        let isNew = false;

        if (rows.length === 0) {
            // [A] 신규 유저: 최초 등록 (기본 코인 0개, 프로필 이미지 포함)
            await db.execute(
                `INSERT INTO users (line_user_id, display_name, profile_img, coins) VALUES (?, ?, ?, ?)`,
                [userId, displayName, profileImg, 0]
            );
            isNew = true;
            console.log(`✨ 신규 신도 등록: ${displayName}`);
        } else {
            // [B] 기존 유저: 이름과 프로필 이미지를 최신 상태로 업데이트
            // 사용자가 라인에서 정보를 바꿨을 경우를 대비해 로그인 시마다 동기화합니다.
            await db.execute(
                `UPDATE users SET display_name = ?, profile_img = ? WHERE line_user_id = ?`,
                [displayName, profileImg, userId]
            );
        }

        // 2. 친구 추가 보상 체크 (중복 지급 방지)
        // 새로 가입했거나 기존 유저 중 이벤트를 아직 안 받은 경우
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
        console.error('❌ Database Error in userService:', err.message);
        throw err;
    }
};
