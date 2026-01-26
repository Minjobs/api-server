<!DOCTYPE html>
<html lang="th">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MEODU K - ข้อมูลของท่าน</title>
    <link href="https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@700&family=Niramit:wght@300;500;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="/css/profile.css">
    <style>
        /* 코인 섹션 아래 버튼을 위한 추가 스타일 */
        .history-link-btn {
            width: 100%;
            background: linear-gradient(45deg, #ffd700, #ffae00);
            color: #000;
            border: none;
            padding: 18px;
            border-radius: 20px;
            font-weight: 700;
            font-size: 1.1rem;
            margin-top: 15px;
            cursor: pointer;
            box-shadow: 0 5px 20px rgba(255, 215, 0, 0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            transition: 0.3s;
        }
        .history-link-btn:hover { transform: translateY(-3px); opacity: 0.9; }
        
        /* 인포 그리드 간격 조정 */
        .info-grid { margin-top: 30px; }
    </style>
    <script src="/js/pages/profile.js" defer></script>
</head>
<body>

    <div class="magic-background">
        <div class="magic-ring ring-1"></div>
        <div class="magic-ring ring-2"></div>
        <div class="magic-ring ring-3"></div>
    </div>

    <div class="container">
        <header>
            <div class="logo">✨ MEODU K</div>
            <button class="back-btn" onclick="location.href='/'">← กลับหน้าหลัก</button>
        </header>

        <main>
            <section class="glass-card">
                <h2>ข้อมูลโชคชะตา</h2>
                <p class="subtitle">เส้นทางดาวที่ถูกบันทึกไว้ในวิหาร</p>

                <div class="coin-section">
                    <span class="coin-icon">🔮</span>
                    <div class="coin-details">
                        <div class="label">เหรียญคงเหลือ (My Coins)</div>
                        <div class="value" id="userCoins">--</div>
                    </div>
                </div>

                <button class="history-link-btn" onclick="location.href='/history'">
                    📜 ดูประวัติการทำนายดวง (My Fortune History)
                </button>

                <div class="info-grid">
                    <div class="info-item">
                        <div class="label">ชื่อที่ใช้ในวิหาร (Line Name)</div>
                        <div class="value" id="displayName">-</div>
                    </div>
                    <div class="info-item">
                        <div class="label">จำนวนครั้งที่ดูดวง (Total Readings)</div>
                        <div class="value" id="totalReadings">0 ครั้ง</div>
                    </div>
                </div>

                <div class="button-group">
                    <button class="action-btn primary" onclick="location.href='/'">
                        ไปดูดวงเพิ่ม (ดูดวงใหม่)
                    </button>
                    <button class="action-btn secondary" onclick="location.href='/api/auth/logout'">
                        ออกจากวิหาร (Logout)
                    </button>
                </div>
            </section>
        </main>

        <footer>
            <p>© 2026 MEODU K. ลิขิตแห่งดวงดาว</p>
        </footer>
    </div>
</body>
</html>
