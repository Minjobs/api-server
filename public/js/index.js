import { createApp, ref, onMounted } from 'https://unpkg.com/vue@3/dist/vue.esm-browser.js';
import { homepage_view } from './pages/homepage/homepage_view.js';
import { profile_view } from './pages/profile/profile_view.js';

const RootComponent = {
    components: {
        'home-page': homepage_view,
        'profile-page': profile_view
    },
    setup() {
        const currentPath = ref(window.location.pathname);

        // URL 변경 함수 (새로고침 없이 URL만 바꿈)
        const navigateTo = (path) => {
            window.history.pushState({}, '', path);
            currentPath.value = path;
        };

        // 브라우저 뒤로가기/앞으로가기 버튼 감지
        onMounted(() => {
            window.onpopstate = () => {
                currentPath.value = window.location.pathname;
            };
        });

        return { currentPath, navigateTo };
    },
    template: `
        <div>
            <home-page v-if="currentPath === '/' || currentPath === '/home'" 
                       @go-profile="navigateTo('/profile')" />
            
            <profile-page v-if="currentPath === '/profile'" 
                          :onBack="() => navigateTo('/home')" />
        </div>
    `
};

createApp(RootComponent).mount('#app');
