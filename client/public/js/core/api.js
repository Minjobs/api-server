const API = {
    // 로그인 요청 (액세스 토큰 전달)
    async login(accessToken) {
        const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ accessToken })
        });
        return await res.json();
    },

    // 운세 데이터 요청
    async getFortune(userData) {
        const res = await fetch('/api/fortune', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });
        return res.ok;
    }
};
