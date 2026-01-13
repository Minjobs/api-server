const db = require('../models/db');

exports.createMall = async (req, res) => {
    const { mall_name, subdomain } = req.body;
    const userId = req.user.id; // 미들웨어에서 받은 유저 정보
    
    try {
        const [result] = await db.execute(
            'INSERT INTO Malls (user_id, mall_name, subdomain) VALUES (?, ?, ?)',
            [userId, mall_name, subdomain]
        );
        res.status(201).json({ success: true, mallId: result.insertId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
