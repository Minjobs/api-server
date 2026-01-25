import mysql from 'mysql2/promise'; // promise 버전을 사용해야 async/await가 가능합니다.
import 'dotenv/config';

// 1. 커넥션 풀 설정
const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10, // 동시에 유지할 최대 연결 수
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0
});

// 2. 연결 테스트 (서버 실행 시 한 번 확인)
const testConnection = async () => {
    try {
        const connection = await db.getConnection();
        console.log('✅ 데이터베이스 연결 성공! (MySQL)');
        connection.release(); // 사용 후 반드시 반환
    } catch (err) {
        console.error('❌ 데이터베이스 연결 실패:', err.message);
    }
};

testConnection();

export default db;
