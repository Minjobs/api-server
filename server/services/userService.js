import db from '../config/db.js';

export const registerUser = async (userId, displayName) => {
    const [rows] = await db.execute('SELECT line_user_id FROM users WHERE line_user_id = ?', [userId]);

    if (rows.length === 0) {
        await db.execute(
            `INSERT INTO users (line_user_id, display_name, coins) VALUES (?, ?, ?)`,
            [userId, displayName, 1]
        );
        return { isNew: true };
    }
    return { isNew: false };
};
