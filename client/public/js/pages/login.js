document.getElementById('loginBtn').onclick = async () => {
    Loading.show("🔮 운명을 연결하는 중...");
    
    try {
        await liff.init({ liffId: "2008959346-MSTYfGPt" });
        
        // 1. 라인 로그인 실행
        if (!liff.isLoggedIn()) {
            liff.login();
            return;
        }

        // 2. 로그인 성공 시 액세스 토큰 획득
        const accessToken = liff.getAccessToken();

        // 3. 서버에 토큰 전달하여 JWT 쿠키 발급받기
        const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ accessToken })
        });

        if (res.ok) {
            // 4. 성공 시 메인 화면으로 이동
            window.location.href = "/";
        } else {
            alert("인증 실패");
        }
    } catch (err) {
        console.error(err);
        alert("오류 발생: " + err.message);
    } finally {
        Loading.hide();
    }
};
