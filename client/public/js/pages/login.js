/**
 * login.js - 머두 K 로그인 페이지 로직
 */
document.addEventListener('DOMContentLoaded', () => {
    const loginBtn = document.getElementById('lineLoginBtn');
    const loadingOverlay = document.getElementById('loadingOverlay');

    if (loginBtn) {
        loginBtn.addEventListener('click', (e) => {
            // 1. 버튼 여러 번 클릭 방지 및 로딩 표시
            // 실제로 페이지가 이동하기 전 찰나의 순간에 "입장 중"임을 알립니다.
            if (loadingOverlay) {
                loadingOverlay.classList.remove('hidden');
            }

            // 참고: <a> 태그의 href로 인해 자동으로 /api/auth/line으로 이동합니다.
            console.log("운명의 문으로 이동 중...");
        });
    }
});
