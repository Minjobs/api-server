// public/js/index.js
import { createApp, ref, onMounted } from 'https://unpkg.com/vue@3/dist/vue.esm-browser.js';
import { homepage_view } from './pages/homepage/homepage_view.js';
import { profile_view } from './pages/profile/profile_view.js';
import { login_view } from './pages/login/login_view.js'; // 로그인 뷰 임포트

const RootComponent = {
    components: {
        'home-page': homepage_view,
        'profile-page': profile_view,
        'login-page': login_view
    },
    setup() {
        const currentPath = ref(window.location.pathname);
        const isLoggedIn = ref(false); // 로그인 상태 관리 (나중에 API로 체크)

        const navigateTo = (path) => {
            window.history.pushState({}, '', path);
            currentPath.value = path;
        };

        onMounted(() => {
            window.onpopstate = () => {
                currentPath.value = window.location.pathname;
            };
        });

        return { currentPath, navigateTo, isLoggedIn };
    },
    template: `
        <div>
            <login-page v-if="currentPath === '/login'" />
            
            <template v-else>
                <home-page v-if="currentPath === '/' || currentPath === '/home'" 
                           @go-profile="navigateTo('/profile')" />
                
                <profile-page v-if="currentPath === '/profile'" 
                              :onBack="() => navigateTo('/home')" />
            </template>
        </div>
    `
};

createApp(RootComponent).mount('#app');
