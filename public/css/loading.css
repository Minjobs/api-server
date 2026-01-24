/* 1. 전체 배경: 더 깊고 어두운 심연의 느낌 */
#loading-overlay {
    position: fixed;
    top: 0; left: 0;
    width: 100%; height: 100%;
    /* 단순 단색이 아닌 중앙으로 집중되는 그라데이션 */
    background: radial-gradient(circle at center, #0A192F 20%, #000000 100%);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    z-index: 9999;
    transition: opacity 0.5s ease;
    overflow: hidden; /* 파티클이 화면 밖으로 나가는 것 방지 */
}

/* 2. 아우라: 불안정하게 일렁이는 마력의 장 */
.mystic-aura {
    position: absolute;
    width: 160px; /* 크기 증가 */
    height: 160px;
    border-radius: 50%;
    /* 황금빛과 붉은빛이 섞인 강렬한 글로우 */
    background: radial-gradient(circle, rgba(212, 175, 55, 0.3) 0%, rgba(249, 217, 118, 0.1) 50%, transparent 80%);
    box-shadow: 0 0 30px rgba(212, 175, 55, 0.2), inset 0 0 30px rgba(212, 175, 55, 0.2);
    /* 주문을 외우듯 불규칙하게 떨리는 애니메이션 */
    animation: spell-flicker 3s infinite alternate-reverse;
}

/* 3. 메인 마법진 (스피너): 주문이 집약되는 중앙 핵 */
.mystic-spinner {
    width: 90px;
    height: 90px;
    position: relative;
    /* 테두리 대신 빛나는 고리들로 표현 */
    border-radius: 50%;
    box-shadow: 
        0 0 10px #D4AF37, /* 내부 핵 */
        inset 0 0 15px #F9D976; /* 내부 광원 */
    animation: rune-spin-clockwise 4s linear infinite;
}

/* 바깥쪽 고대 문자 고리 (가상) */
.mystic-spinner::before {
    content: '';
    position: absolute;
    top: -15px; left: -15px; right: -15px; bottom: -15px;
    border-radius: 50%;
    /* 점선으로 고대 문자(룬) 느낌 표현 */
    border: 3px dashed rgba(212, 175, 55, 0.6);
    border-top-color: #F9D976;
    border-bottom-color: #F9D976;
    /* 반대 방향으로 천천히 회전 */
    animation: rune-spin-counter 7s linear infinite;
}

/* 안쪽 에너지 고리 */
.mystic-spinner::after {
    content: '';
    position: absolute;
    top: 10px; left: 10px; right: 10px; bottom: 10px;
    border-radius: 50%;
    border: 2px solid transparent;
    border-left-color: #fff;
    border-right-color: #F9D976;
    filter: blur(1px);
    /* 빠르게 회전하며 에너지 방출 */
    animation: rune-spin-clockwise 2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
}

/* 4. 텍스트: 마력이 깃든 글자 */
#loading-text {
    margin-top: 40px; /* 간격 조정 */
    color: #F9D976;
    font-size: 1.1rem;
    font-weight: bold;
    letter-spacing: 3px;
    text-transform: uppercase;
    /* 글자 자체가 빛을 내뿜는 효과 */
    text-shadow: 0 0 10px rgba(212, 175, 55, 0.8), 0 0 20px rgba(212, 175, 55, 0.4);
    animation: text-pulse 2s ease-in-out infinite alternate;
    z-index: 1; /* 아우라 위에 표시 */
}

/* --- 애니메이션 정의 --- */

/* 시계 방향 회전 */
@keyframes rune-spin-clockwise {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

/* 반시계 방향 회전 */
@keyframes rune-spin-counter {
    0% { transform: rotate(360deg) scale(1.05); }
    50% { transform: rotate(180deg) scale(0.95); }
    100% { transform: rotate(0deg) scale(1.05); }
}

/* 주문 시전 시 불규칙한 마력의 떨림 */
@keyframes spell-flicker {
    0% { opacity: 0.4; transform: scale(1) translateY(0); filter: brightness(1); }
    20% { opacity: 0.6; transform: scale(1.1) translateY(-2px); filter: brightness(1.2); }
    40% { opacity: 0.3; transform: scale(0.9) translateY(1px); filter: brightness(0.9); }
    60% { opacity: 0.7; transform: scale(1.15) translateY(-3px); filter: brightness(1.3); }
    80% { opacity: 0.5; transform: scale(1.05) translateY(-1px); filter: brightness(1.1); }
    100% { opacity: 0.8; transform: scale(1.2) translateY(-4px); filter: brightness(1.4); }
}

/* 텍스트 숨쉬기 효과 */
@keyframes text-pulse {
    from { opacity: 0.7; letter-spacing: 3px; }
    to { opacity: 1; letter-spacing: 4px; }
}
