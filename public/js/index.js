import { createApp, ref, onMounted } from 'https://unpkg.com/vue@3/dist/vue.esm-browser.js';
import { homepage_view } from './pages/homepage/homepage_view.js';
import { profile_view } from './pages/profile/profile_view.js';

const RootComponent = {
    components: {
        'home-page': homepage_view,
        'profile-page': profile_view
    },
    setup() {
        // 초기 경로 설정 (끝에 /가 붙는 경우 등을 대비해 정제)
        const getPath = () => window.location.pathname;
        const currentPath = ref(getPath());

        // URL 변경 함수
        const navigateTo = (path) => {
            if (window.location.pathname !== path) {
                window.history.pushState({}, '', path);
                currentPath.value = path;
                console.log(`Mapsd to: ${path}`);
            }
        };

        // 브라우저 뒤로가기 감지 및 초기화
        onMounted(() => {
            window.onpopstate = () => {
                currentPath.value = getPath();
            };
            console.log("MallGo SPA Router 가동 중...");
        });

        return { currentPath, navigateTo };
    },
    template: `
        <div>
            <home-page 
                v-if="currentPath === '/' || currentPath === '/home'" 
                @go-profile="navigateTo('/profile')" 
            />
            
            <profile-page 
                v-else-if="currentPath === '/profile'" 
                :onBack="() => navigateTo('/home')" 
            />

            <div v-else class="min-h-screen flex flex-col items-center justify-center p-6 text-center">
                <h1 class="text-4xl font-black text-slate-200 mb-4">404</h1>
                <p class="text-slate-500 mb-8">페이지를 찾을 수 없습니다.</p>
                <button @click="navigateTo('/home')" class="px-6 py-3 bg-indigo-600 text-white rounded-2xl font-bold">
                    홈으로 돌아가기
                </button>
            </div>
        </div>
    `
};

createApp(RootComponent).mount('#app');
