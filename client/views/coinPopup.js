// 파일명: public/coinPopup.js

/**
 * 코인 부족 팝업을 띄우는 공용 함수
 * 사용법: HTML에 이 파일을 연결하고 showCoinAlert() 호출
 */
function showCoinAlert() {
    // 1. SweetAlert2가 로드되지 않았을 경우를 대비한 방어 코드
    if (typeof Swal === 'undefined') {
        alert("Coin Alert Library is missing. Please add SweetAlert2 CDN.");
        return;
    }

    // 2. 마스터 무당 K 테마 스타일 강제 주입 (CSS 파일 수정 없이도 적용되도록)
    if (!document.getElementById('coin-popup-style')) {
        const style = document.createElement('style');
        style.id = 'coin-popup-style';
        style.innerHTML = `
            .swal2-popup { 
                font-family: 'Kanit', sans-serif !important; 
                border-radius: 25px !important; 
                border: 2px solid #ffd700 !important; 
                background: #1a1a1a !important; 
                color: white !important;
                box-shadow: 0 0 30px rgba(255, 215, 0, 0.15) !important;
            }
            .swal2-title { color: #ffd700 !important; font-size: 1.4rem !important; }
            .swal2-html-container { color: #ddd !important; font-weight: 300 !important; opacity: 0.9; }
            .swal2-confirm { 
                background: linear-gradient(135deg, #ffd700, #f57c00) !important; 
                color: black !important; 
                font-weight: 800 !important; 
                border-radius: 15px !important;
                padding: 12px 24px !important;
                box-shadow: 0 5px 15px rgba(255, 124, 0, 0.4) !important;
            }
            .swal2-cancel { 
                background: transparent !important; 
                color: #aaa !important; 
                text-decoration: underline !important;
            }
            .swal2-icon.swal2-warning { border-color: #ffd700 !important; color: #ffd700 !important; }
        `;
        document.head.appendChild(style);
    }

    // 3. 팝업 실행 (화면 중앙 정렬, 스크롤 잠금은 라이브러리가 자동 처리)
    Swal.fire({
        title: 'เหรียญไม่พอ',
        html: 'คุณต้องการเหรียญเพิ่มเติม<br>เพื่อเปิดดูคำทำนายนี้',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'ไปที่ร้านค้า (เติมเหรียญ)',
        cancelButtonText: 'ไว้วันหลัง',
        reverseButtons: false, 
        focusConfirm: false,
        backdrop: `rgba(0,0,0,0.85)` // 배경 어둡게
    }).then((result) => {
        if (result.isConfirmed) {
            window.location.href = '/shop'; // 상점 페이지로 이동
        }
    });
}
