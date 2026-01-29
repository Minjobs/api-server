<!DOCTYPE html>
<html lang="th">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MURDOO K - เสี่ยงทายธง 5 สี</title>
    <link href="https://fonts.googleapis.com/css2?family=Kanit:wght@300;400;500;700&family=Nanum+Myeongjo:wght@700;800&display=swap" rel="stylesheet">
    <style>
        :root {
            --bg-overlay: rgba(0, 0, 0, 0.38);
            --point-gold: #ffd700;
            --text-white: #ffffff;
            --border-line: rgba(200, 200, 200, 0.8);
            --obang-red: #d32f2f;
            --obang-blue: #1976d2;
            --obang-yellow: #fbc02d;
            --obang-white: #f5f5f5;
            --obang-black: #212121;
        }

        body {
            margin: 0; padding: 0;
            background-color: #f5f5f5;
            font-family: 'Kanit', sans-serif;
            color: var(--text-white);
            min-height: 100vh;
            display: flex; justify-content: center; align-items: center;
            overflow: hidden;
        }

        .background-overlay {
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            z-index: -1;
            background-image: url('background.jpg'); 
            background-size: cover; background-position: center;
            opacity: 0.8; 
        }

        .background-blur {
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            z-index: -2;
            backdrop-filter: blur(7px) brightness(0.8);
        }

        .container {
            width: 90%; max-width: 460px;
            background-color: var(--bg-overlay);
            border-radius: 30px;
            padding: 30px 20px 40px 20px;
            box-sizing: border-box;
            backdrop-filter: blur(10px);
            border: 3px solid var(--border-line);
            text-align: center;
            position: relative;
        }

        .header-title h1 { font-size: 1.6rem; margin: 0; color: var(--point-gold); font-family: 'Nanum Myeongjo', serif; }
        .header-title p { font-size: 1rem; margin: 8px 0 30px 0; opacity: 0.9; font-weight: 300; }

        /* --- [깃발 무대 영역] --- */
        .flag-stage {
            height: 320px; /* 깃발 2줄을 담기 위해 높이 증가 */
            position: relative;
            margin-bottom: 30px;
            display: flex; flex-direction: column; justify-content: center; gap: 30px;
            transition: all 0.5s ease;
        }

        /* 깃발 줄 (Row) */
        .flag-row {
            display: flex; justify-content: center; gap: 25px;
            width: 100%;
        }

        /* 깃발 공통 스타일 (CSS로 깃발 모양 구현) */
        .flag {
            width: 70px; height: 100px;
            /* 오른쪽 끝이 갈라진 깃발 모양 */
            clip-path: polygon(0 0, 100% 0, 85% 50%, 100% 100%, 0 100%);
            box-shadow: 2px 2px 10px rgba(0,0,0,0.3);
            position: relative;
            transition: all 0.8s cubic-bezier(0.25, 0.8, 0.25, 1); /* 부드럽고 묵직한 움직임 */
        }
        /* 깃대 표현 (선택 사항) */
        .flag::before {
            content: ''; position: absolute; left: -4px; top: 0;
            width: 4px; height: 100%; background: rgba(255,255,255,0.5);
            border-radius: 2px;
        }

        /* 색상 적용 */
        .f-red { background-color: var(--obang-red); }
        .f-blue { background-color: var(--obang-blue); }
        .f-yellow { background-color: var(--obang-yellow); }
        .f-white { background-color: var(--obang-white); color: #333; } /* 흰색 깃발은 깃대 색 조정 */
        .f-white::before { background: rgba(0,0,0,0.2); }
        .f-black { background-color: var(--obang-black); }


        /* --- [애니메이션: 합치기 & 회전] --- */
        /* 1. 합쳐지는 상태 */
        .flag-stage.merging .flag-row { display: none; } /* 기존 줄 레이아웃 숨김 */
        .flag-stage.merging .flag {
            position: absolute;
            top: 50%; left: 50%;
            /* 중앙으로 이동하며 겹침 */
            transform: translate(-50%, -50%) scale(1.1) !important; 
            margin: 0;
            box-shadow: none; opacity: 0.9;
        }
        
        /* 2. 회전하는 상태 (합쳐진 후) */
        .flag-stage.spinning {
            animation: spin-flags 0.3s linear infinite; /* 빠르게 회전 */
        }
        @keyframes spin-flags {
            from { transform: rotate(0deg) scale(0.9); }
            to { transform: rotate(360deg) scale(0.9); }
        }


        /* --- [결과 화면] --- */
        #result-display {
            display: none;
            flex-direction: column; align-items: center;
            animation: popIn 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        .result-flag {
            width: 140px; height: 200px;
            clip-path: polygon(0 0, 100% 0, 85% 50%, 100% 100%, 0 100%);
            box-shadow: 0 10px 30px rgba(0,0,0,0.4);
            margin-bottom: 25px;
        }
        .result-title { font-size: 1.8rem; font-weight: 700; color: var(--point-gold); margin-bottom: 5px; }
        .result-desc { font-size: 1.1rem; opacity: 0.9; margin-bottom: 25px; font-weight: 300; }

        #pickBtn {
            background: linear-gradient(135deg, var(--point-gold), #f57c00);
            color: white; border: none; padding: 15px 45px; border-radius: 30px;
            font-size: 1.2rem; font-weight: 700; cursor: pointer;
            box-shadow: 0 5px 15px rgba(0,0,0,0.3);
            transition: transform 0.2s, box-shadow 0.2s; font-family: 'Kanit', sans-serif;
        }
        #pickBtn:hover { box-shadow: 0 8px 20px rgba(255, 215, 0, 0.4); }
        #pickBtn:active { transform: scale(0.96); }

        @keyframes popIn { from { opacity: 0; transform: scale(0.5); } to { opacity: 1; transform: scale(1); } }
        .hidden { display: none !important; }
    </style>
</head>
<body>

    <div class="background-overlay"></div>
    <div class="background-blur"></div>

    <main class="container">
        <div class="header-title">
            <h1>เสี่ยงทายธง 5 สี</h1>
            <p>อธิษฐานแล้วกดปุ่มเพื่อเลือกธง</p>
        </div>

        <div class="flag-stage" id="flagStage">
            <div class="flag-row top-row">
                <div class="flag f-red" style="transform: rotate(-5deg);"></div>
                <div class="flag f-blue"></div>
                <div class="flag f-yellow" style="transform: rotate(5deg);"></div>
            </div>
            <div class="flag-row bottom-row">
                <div class="flag f-white" style="transform: rotate(-3deg);"></div>
                <div class="flag f-black" style="transform: rotate(3deg);"></div>
            </div>
        </div>

        <div id="result-display">
            <div class="result-flag" id="finalFlag"></div>
            <div class="result-title" id="resultTitle"></div>
            <div class="result-desc" id="resultDesc"></div>
            <button onclick="location.reload()" style="background:rgba(255,255,255,0.15); color:#fff; border:1px solid rgba(255,255,255,0.5); padding:10px 30px; border-radius:25px; cursor:pointer; font-family:'Kanit'; transition:0.2s;">ลองอีกครั้ง</button>
        </div>

        <button id="pickBtn" onclick="startPicking()">เสี่ยงทาย</button>
    </main>

    <script>
        const flags = [
            { color: 'var(--obang-red)', title: 'ธงแดง (홍기)', desc: 'โชคลาภและความสำเร็จกำลังมาเยือน' },
            { color: 'var(--obang-blue)', title: 'ธงน้ำเงิน (청기)', desc: 'ระวังอุปสรรค แต่จะผ่านไปได้' },
            { color: 'var(--obang-yellow)', title: 'ธงเหลือง (황기)', desc: 'ความรักและความสุขสมหวัง' },
            { color: 'var(--obang-white)', title: 'ธงขาว (백기)', desc: 'สุขภาพแข็งแรง จิตใจผ่องใส' },
            { color: 'var(--obang-black)', title: 'ธงดำ (흑기)', desc: 'การเริ่มต้นใหม่ หรือการเปลี่ยนแปลง' }
        ];

        function startPicking() {
            const stage = document.getElementById('flagStage');
            const btn = document.getElementById('pickBtn');
            const resultDisplay = document.getElementById('result-display');
            const finalFlag = document.getElementById('finalFlag');
            const resultTitle = document.getElementById('resultTitle');
            const resultDesc = document.getElementById('resultDesc');

            btn.classList.add('hidden');

            // 1. 합치기 시작 (깃발들이 중앙으로 모임)
            stage.classList.add('merging');

            setTimeout(() => {
                // 2. 회전 시작 (모인 깃발들이 회전)
                stage.classList.add('spinning');

                setTimeout(() => {
                    // 3. 결과 도출 및 표시
                    stage.classList.add('hidden');
                    const win = flags[Math.floor(Math.random() * flags.length)];
                    
                    finalFlag.style.backgroundColor = win.color;
                    // 흰색 깃발일 경우 깃대 색상 조정
                    if (win.color === 'var(--obang-white)') {
                        finalFlag.classList.add('f-white');
                    } else {
                        finalFlag.classList.remove('f-white');
                    }

                    resultTitle.innerText = win.title;
                    resultDesc.innerText = win.desc;
                    
                    resultDisplay.style.display = 'flex';
                }, 2500); // 2.5초간 회전 후 결과 표시

            }, 800); // 0.8초간 합쳐지는 애니메이션
        }
    </script>
</body>
</html>
