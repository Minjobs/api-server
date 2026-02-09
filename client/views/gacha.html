<!DOCTYPE html>
<html lang="th">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MURDOO K - GACHA</title>
    <link href="https://fonts.googleapis.com/css2?family=Kanit:wght@300;400;500;700&family=Nanum+Myeongjo:wght@700;800&display=swap" rel="stylesheet">
    <style>
        :root {
            --machine-red: #d32f2f;
            --machine-dark: #1a1a1a;
            --point-gold: #ffd700;
            --glass-shine: rgba(255, 255, 255, 0.2);
        }

        body {
            margin: 0; padding: 0; background: #050505;
            font-family: 'Kanit', sans-serif; color: white;
            display: flex; flex-direction: column; align-items: center;
            overflow: hidden; height: 100vh;
        }

        .background-overlay {
            position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: -1;
            background: radial-gradient(circle at center, #1e272e 0%, #000 100%);
        }

        /* --- [뽑기 기계 본체] --- */
        .gacha-machine {
            position: relative; width: 300px; margin-top: 8vh;
            animation: floating 3s ease-in-out infinite;
        }

        @keyframes floating { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-15px); } }

        /* 유리 탱크 */
        .glass-tank {
            width: 220px; height: 220px; background: rgba(255, 255, 255, 0.05);
            border: 6px solid #444; border-radius: 50% 50% 10% 10%;
            margin: 0 auto; position: relative; overflow: hidden;
            backdrop-filter: blur(2px); border-bottom: none;
        }
        .glass-shine {
            position: absolute; top: 20%; left: 15%; width: 40px; height: 80px;
            background: var(--glass-shine); border-radius: 50%; transform: rotate(20deg);
        }

        /* 기계 몸체 */
        .machine-base {
            width: 260px; height: 240px; background: var(--machine-red);
            border-radius: 20px; margin: -10px auto 0; position: relative;
            box-shadow: inset 0 -10px 20px rgba(0,0,0,0.6), 0 15px 40px rgba(0,0,0,0.8);
            display: flex; flex-direction: column; align-items: center; z-index: 2;
        }

        /* 투입구 & 레버 */
        .lever-zone {
            width: 90px; height: 90px; background: #222; border: 4px solid var(--point-gold);
            border-radius: 50%; margin-top: 20px; display: flex; justify-content: center; align-items: center;
            cursor: pointer; transition: transform 0.2s;
        }
        .lever-bar { width: 60px; height: 12px; background: var(--point-gold); border-radius: 6px; transition: 0.6s ease-in-out; }
        .lever-zone.spinning .lever-bar { transform: rotate(360deg); }

        /* 입력창 */
        .year-input-wrap { margin-top: 15px; width: 80%; text-align: center; }
        .year-input {
            width: 100%; background: #000; border: 2px solid #555; border-radius: 10px;
            padding: 10px; color: var(--point-gold); font-size: 1.3rem; font-weight: 800;
            text-align: center; outline: none; font-family: 'Kanit';
        }

        /* --- [뽑기 공 연출 레이어] --- */
        .effect-layer {
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.9); display: none;
            justify-content: center; align-items: center; z-index: 9999;
        }

        .lucky-ball {
            width: 60px; height: 60px; border-radius: 50%;
            background: radial-gradient(circle at 30% 30%, #ffd700, #b8860b);
            box-shadow: 0 0 40px rgba(255, 215, 0, 0.6);
            transform: scale(0.1); opacity: 0;
        }

        /* 기획하신 '다가오는 공' 애니메이션 */
        .lucky-ball.zoom-in {
            animation: zoomAndFill 2.6s cubic-bezier(0.85, 0, 0.15, 1) forwards;
        }

        @keyframes zoomAndFill {
            0% { transform: scale(0.1) rotate(0deg); opacity: 0; }
            15% { opacity: 1; transform: scale(1) rotate(180deg); }
            85% { transform: scale(15) rotate(720deg); opacity: 1; }
            100% { transform: scale(40); opacity: 1; background: white; }
        }

        .loading-msg {
            position: absolute; bottom: 15%; width: 100%; text-align: center;
            color: var(--point-gold); font-size: 1.2rem; font-weight: 500;
        }

        .ball-deco { position: absolute; width: 45px; height: 45px; border-radius: 50%; opacity: 0.8; }
    </style>
</head>
<body>

    <div class="background-overlay"></div>

    <h1 style="font-family: 'Nanum Myeongjo'; color: var(--point-gold); margin-top: 40px; letter-spacing: 3px;">GACHA FORTUNE</h1>

    <div class="gacha-machine">
        <div class="glass-tank">
            <div class="glass-shine"></div>
            <div class="ball-deco" style="background: #f1c40f; bottom: 10px; left: 20px; transform: rotate(10deg);"></div>
            <div class="ball-deco" style="background: #e74c3c; bottom: 5px; left: 70px; transform: rotate(-15deg);"></div>
            <div class="ball-deco" style="background: #ecf0f1; bottom: 12px; right: 20px;"></div>
            <div class="ball-deco" style="background: #3498db; bottom: 40px; left: 45px;"></div>
        </div>

        <div class="machine-base">
            <div class="year-input-wrap">
                <input type="number" id="birthYear" class="year-input" placeholder="YYYY" min="1940" max="2026">
                <p style="font-size: 0.8rem; margin-top: 8px; opacity: 0.8;">ระบุปีเกิดของคุณ (YYYY)</p>
            </div>

            <div class="lever-zone" id="spinBtn">
                <div class="lever-bar"></div>
            </div>
            <p style="color: var(--point-gold); font-weight: 700; margin-top: 15px; font-size: 1.1rem;">หมุนเพื่อดูดวง</p>
        </div>
    </div>

    <div class="effect-layer" id="overlay">
        <div class="lucky-ball" id="ball"></div>
        <div class="loading-msg" id="msg">กำลังดึงโชคชะตาของคุณ...</div>
    </div>

    <script>
        const API_KEY = 'wodmfjc8202oj4tnguf9wo2k2jrnjdwow0011k2k2n3nfnnfndsiow901o2kkemrx999dej3j';

        function generateUUID() {
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
                const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
        }

        const spinBtn = document.getElementById('spinBtn');
        const overlay = document.getElementById('overlay');
        const ball = document.getElementById('ball');
        const birthYear = document.getElementById('birthYear');

        spinBtn.addEventListener('click', async () => {
            const year = birthYear.value;
            if (!year || year < 1930 || year > 2026) {
                alert("กรุณาระบุปีเกิดให้ถูกต้อง (1930-2026)");
                return;
            }

            const resultId = generateUUID();
            
            // 1. 레버 스핀 효과
            spinBtn.classList.add('spinning');

            // 2. 애니메이션 레이어 활성화
            setTimeout(() => {
                overlay.style.display = 'flex';
                ball.classList.add('zoom-in');
            }, 600);

            // 3. 서버 분석 요청
            const payload = {
                resultId: resultId,
                type: 'gacha', // 뽑기 전용 타입
                realName: 'GachaUser',
                nickName: 'LuckyOne',
                birthDate: `${year}-01-01`,
                birthTime: 'unknown',
                gender: 'unisex'
            };

            try {
                const response = await fetch('/api/fortune/analyze', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'x-api-key': API_KEY },
                    body: JSON.stringify(payload)
                });

                if (response.ok) {
                    // 애니메이션 완료(2.6초)에 맞춰 결과 페이지로 이동
                    setTimeout(() => {
                        window.location.href = `/result/gacha/${resultId}`;
                    }, 2500);
                } else {
                    throw new Error("Failed");
                }
            } catch (err) {
                alert("เกิดข้อผิดพลาดในการเชื่อมต่อ 서버 오류가 발생했습니다.");
                location.reload();
            }
        });
    </script>
</body>
</html>
