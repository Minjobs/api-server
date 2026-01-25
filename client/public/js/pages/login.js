/**
 * login.js - 머두 K 로그인 페이지 로직 (수정본)
 */
document.addEventListener('DOMContentLoaded', () => {
    const loginBtn = document.getElementById('lineLoginBtn');
    const loadingOverlay = document.getElementById('loadingOverlay');

    if (loginBtn) {
        loginBtn.addEventListener('click', (e) => {
            // 1. 기본 이동 동작을 일단 막습니다.
            e.preventDefault();

            // 2. 로딩 표시를 띄웁니다.
            if (loadingOverlay) {
                loadingOverlay.classList.remove('hidden');
            }

            // 3. 0.1초 뒤에 명시적으로 API 경로로 이동시킵니다.
            const targetUrl = e.currentTarget.getAttribute('href');
            console.log("운명의 문으로 이동 중: ", targetUrl);
            
            setTimeout(() => {
                window.location.href = targetUrl;
            }, 100); 
        });
    }
});
