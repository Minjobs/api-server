// public/js/index.js
import { createApp, ref, onMounted } from 'https://unpkg.com/vue@3/dist/vue.esm-browser.js';
import { homepage_view } from './pages/homepage/homepage_view.js';
import { profile_view } from './pages/profile/profile_view.js';
import { login_view } from './pages/loginpage/loginpage_view.js'; // 로그인 뷰 임포트

const RootComponent = {
    components: {
        'home-page': homepage_view,
        'profile-page': profile_view,
        'login-page': login_view
    },
    // public/js/index.js
setup() {
    const currentPath = ref(window.location.pathname);
    const isLoggedIn = ref(false);
    const user = ref(null);

    // [중요] 로그인 상태를 서버에 확인하는 함수
    const checkAuth = async () => {
        try {
            const res = await fetch('/api/auth/me');
            const data = await res.json();
            if (data.isLoggedIn) {
                isLoggedIn.value = true;
                user.value = data.user;
                return true;
            }
        } catch (e) { console.error("인증 체크 실패"); }
        isLoggedIn.value = false;
        return false;
    };

    // 프로필 버튼 클릭 시 실행할 로직
    const handleProfileClick = async () => {
        const authenticated = await checkAuth(); // 최신 로그인 상태 확인
        if (authenticated) {
            navigateTo('/profile');
        } else {
            alert('로그인이 필요한 서비스입니다.');
            navigateTo('/login');
        }
    };

    const navigateTo = (path) => {
        window.history.pushState({}, '', path);
        currentPath.value = path;
    };

    onMounted(checkAuth); // 페이지 로드 시 최초 1회 확인

    return { currentPath, navigateTo, isLoggedIn, user, handleProfileClick };
},
template: `
    <div>
        <login-page v-if="currentPath === '/login'" />
        
        <home-page v-if="currentPath === '/' || currentPath === '/home'" 
                   @go-profile="handleProfileClick" />
        
        <profile-page v-if="currentPath === '/profile'" 
                      :user="user"
                      :onBack="() => navigateTo('/home')" />
    </div>
`
};

createApp(RootComponent).mount('#app');
