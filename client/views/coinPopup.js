/**
 * 코인 부족 팝업을 띄우는 공용 함수 (심플 & 컴팩트 디자인)
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
            /* 팝업 박스 스타일: 사이즈 대폭 축소 */
            .swal2-popup { 
                font-family: 'Kanit', sans-serif !important; 
                border-radius: 20px !important; 
                border: 2px solid #ffd700 !important; 
                background: #1a1a1a !important; 
                color: white !important;
                box-shadow: 0 0 20px rgba(255, 215, 0, 0.1) !important;
                
                /* 🔥 핵심: 너비 고정 및 패딩 축소 */
                width: 280px !important; 
                padding: 20px 15px !important;
            }
            
            /* 제목 스타일 */
            .swal2-title { 
                color: #ffd700 !important; 
                font-size: 1.3rem !important; /* 폰트 줄임 */
                margin-top: 5px !important; 
            }
            
            /* 본문 텍스트 스타일 */
            .swal2-html-container { 
                color: #ddd !important; 
                font-weight: 300 !important; 
                opacity: 0.9; 
                font-size: 0.9rem !important; /* 폰트 줄임 */
                margin: 10px 0 15px 0 !important;
            }
            
            /* 버튼 공통 스타일 */
            .swal2-confirm { 
                background: linear-gradient(135deg, #ffd700, #f57c00) !important; 
                color: black !important; 
                font-weight: 800 !important; 
                border-radius: 12px !important;
                padding: 10px 0 !important; /* 버튼 높이 축소 */
                box-shadow: 0 4px 10px rgba(255, 124, 0, 0.3) !important;
                width: 100% !important; 
                font-size: 0.95rem !important;
                margin: 0 !important;
            }
            
            .swal2-cancel { 
                background: transparent !important; 
                color: #888 !important; 
                text-decoration: underline !important;
                margin-top: 8px !important;
                font-size: 0.8rem !important;
                padding: 5px !important;
            }
            
            /* 버튼 컨테이너 여백 축소 */
            .swal2-actions { 
                width: 100%; 
                margin-top: 10px !important;
            }

            /* 코인 아이콘 스타일 */
            .swal2-icon.swal2-custom-icon {
                border: none !important; 
                font-size: 3.5rem !important; /* 아이콘 크기 약간 축소 */
                margin: 10px auto 0 auto !important;
            }
        `;
        document.head.appendChild(style);
    }

    // 3. 팝업 실행
    Swal.fire({
        iconHtml: '🪙', 
        customClass: {
            icon: 'swal2-custom-icon'
        },
        title: 'เหรียญไม่พอ',
        html: 'คุณต้องการเหรียญเพิ่มเติม<br>เพื่อเปิดดูคำทำนายนี้',
        showCancelButton: true,
        confirmButtonText: 'ไปที่ร้านค้า (เติมเหรียญ)',
        cancelButtonText: 'ไว้วันหลัง',
        reverseButtons: false, 
        focusConfirm: false,
        backdrop: `rgba(0,0,0,0.85)` 
    }).then((result) => {
        if (result.isConfirmed) {
            window.location.href = '/shop';
        }
    });
}
