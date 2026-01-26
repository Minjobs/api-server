// profile.js

document.addEventListener('DOMContentLoaded', async () => {
    console.log("🔮 วิหารกำลังดึงข้อมูลดวงดาวของคุณ...");

    const API_KEY = 'wodmfjc8202oj4tnguf9wo2k2jrnjdwow0011k2k2n3nfnnfndsiow901o2kkemrx999dej3j'; // .env 설정값과 일치해야 함

    try {
        // 프로필 정보 요청
        const response = await fetch('/api/user/profile', {
            method: 'GET',
            headers: {
                'x-api-key': API_KEY,
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const data = await response.json();
            renderProfile(data);
        } else if (response.status === 401 || response.status === 403) {
            alert('เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่ (세션 만료)');
            window.location.href = '/login';
        } else {
            throw new Error('Failed to fetch profile');
        }

    } catch (err) {
        console.error('❌ Profile Load Error:', err);
        showErrorState();
    }
});

/**
 * 데이터를 화면 요소에 뿌려주는 함수
 */
function renderProfile(data) {
    // 텍스트 내용 업데이트 (데이터가 없으면 태국어로 '정보 없음' 표시)
    document.getElementById('userCoins').textContent = `${data.coins || 0} COINS`;
    document.getElementById('displayName').textContent = data.display_name || '-';
    document.getElementById('realName').textContent = data.real_name || 'ยังไม่มีข้อมูล';
    document.getElementById('birthDate').textContent = data.birth_date || 'ยังไม่มีข้อมูล';
    document.getElementById('birthTime').textContent = data.birth_time || 'ยังไม่มีข้อมูล';
    document.getElementById('gender').textContent = formatGender(data.gender);
    document.getElementById('totalReadings').textContent = `${data.total_readings || 0} ครั้ง`;
}

/**
 * 성별 영문 값을 태국어로 변환해주는 헬퍼
 */
function formatGender(gender) {
    const genderMap = {
        'male': 'ชาย (Male)',
        'female': 'หญิง (Female)',
        'tom': 'ทอม (Tom)',
        'ladyboy': 'กะเทย (Kathoey)',
        'gay': 'เกย์ (Gay)',
        'lesbian': 'เลสเบี้ยน (Lesbian)',
        'other': 'อื่นๆ (Other)'
    };
    return genderMap[gender] || 'ยังไม่มีข้อมูล';
}

/**
 * 에러 발생 시 UI 처리
 */
function showErrorState() {
    const values = document.querySelectorAll('.value');
    values.forEach(el => el.textContent = 'Error');
    alert('ไม่สามารถโหลดข้อมูลได้ กรุณาลองใหม่ภายหลัง');
}
