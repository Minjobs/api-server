import db from '../config/db.js';

export const getProfile = async (req, res) => {
    try {
        const userId = req.user.userId;
        console.log(`🔍 [Profile API] 요청 유저 ID: ${userId}`);

        const [rows] = await db.execute(
            `SELECT display_name, real_name, user_nickname, 
                    birth_date, birth_time, gender, 
                    coins, total_readings 
             FROM users WHERE line_user_id = ?`,
            [userId]
        );

        // ✨ 핵심: DB에서 가져온 데이터를 터미널에 출력
        if (rows.length > 0) {
            console.log('✅ DB에서 가져온 유저 데이터:', JSON.stringify(rows[0], null, 2));
            res.json(rows[0]);
        } else {
            console.warn(`⚠️ 해당 유저를 DB에서 찾을 수 없음: ${userId}`);
            res.status(404).json({ message: 'User not found' });
        }

    } catch (err) {
        console.error('❌ 프로필 조회 DB 에러:', err.message);
        res.status(500).json({ message: 'Server Error' });
    }
};

// 코인 사용 함수 (이게 없어서 에러가 난 겁니다!)
export const useCoin = async (req, res) => {
    try {
        const userId = req.user.userId;
        console.log(`💰 [Coin API] ${userId} 유저의 코인 차감 시도`);
        
        // 여기에 실제 코인 차감 로직이 들어갈 예정입니다.
        // 일단 서버가 안 터지게 빈 응답이라도 보내줍니다.
        res.json({ message: "Coin logic is coming soon!" });
    } catch (err) {
        console.error('❌ 코인 차감 에러:', err.message);
        res.status(500).json({ message: 'Server Error' });
    }
};
