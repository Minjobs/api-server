/**
 * 코인 부족 팝업을 띄우는 공용 함수
 * 사용법: HTML에 이 파일을 연결하고 showCoinAlert() 호출
 */
function showCoinAlert() {
    // 1. 라이브러리 로드 확인
    if (typeof Swal === 'undefined') {
        alert("Coin Alert Library is missing. Please add SweetAlert2 CDN.");
        return;
    }

    // 2. 스타일 주입 (CSS 수정 없이 적용되도록)
    if (!document.getElementById('coin-popup-style')) {
        const style = document.createElement('style');
        style.id = 'coin-popup-style';
        style.innerHTML = `
            /* 팝업 박스 스타일 */
            .swal2-popup { 
                font-family: 'Kanit', sans-serif !important; 
                border-radius: 25px !important; 
                border: 2px solid #ffd700 !important; 
                background: #1a1a1a !important; 
                color: white !important;
                box-shadow: 0 0 40px rgba(255, 215, 0, 0.15) !important;
            }
            
            /* 제목 및 본문 */
            .swal2-title { color: #ffd700 !important; font-size: 1.5rem !important; margin-top: 10px !important; }
            .swal2-html-container { color: #ddd !important; font-weight: 300 !important; opacity: 0.9; }
            
            /* 버튼 스타일 */
            .swal2-confirm { 
                background: linear-gradient(135deg, #ffd700, #f57c00) !important; 
                color: black !important; 
                font-weight: 800 !important; 
                border-radius: 15px !important;
                padding: 14px 24px !important;
                box-shadow: 0 5px 15px rgba(255, 124, 0, 0.4) !important;
                width: 100% !important; /* 버튼 꽉 채우기 */
                margin: 10px 0 0 0 !important;
            }
            .swal2-cancel { 
                background: transparent !important; 
                color: #aaa !important; 
                text-decoration: underline !important;
                margin-top: 10px !important;
                font-size: 0.9rem !important;
            }
            .swal2-actions { flex-direction: column; width: 100%; padding: 0 20px 20px 20px; box-sizing: border-box; }

            /* 🔥 [핵심] 코인 아이콘 스타일 */
            .swal2-icon { 
                border-color: #ffd700 !important; /* 테두리 금색 */
                color: #ffd700 !important; 
                font-size: 1.2rem !important;
            }
            /* 기본 애니메이션 제거하고 코인 강조 */
            .swal2-icon.swal2-custom-icon {
                border: none !important; /* 테두리 제거 */
                font-size: 4rem !important; /* 이모지 크기 키우기 */
                margin-bottom: 0 !important;
            }
        `;
        document.head.appendChild(style);
    }

    // 3. 팝업 실행
    Swal.fire({
        iconHtml: '🪙', // 🔥 경고 아이콘(!) 대신 코인 이모지 사용
        customClass: {
            icon: 'swal2-custom-icon' // 위에서 정의한 CSS 적용
        },
        title: 'เหรียญไม่พอ',
        html: 'คุณต้องการเหรียญเพิ่มเติม<br>เพื่อเปิดดูคำทำนายนี้',
        showCancelButton: true,
        confirmButtonText: 'ไปที่ร้านค้า (เติมเหรียญ)',
        cancelButtonText: 'ไว้วันหลัง',
        reverseButtons: false, 
        focusConfirm: false,
        backdrop: `rgba(0,0,0,0.85)` // 배경 어둡게
    }).then((result) => {
        if (result.isConfirmed) {
            window.location.href = '/shop';
        }
    });
}
