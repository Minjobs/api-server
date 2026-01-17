// /public/js/index.js
import { createApp, ref } from 'https://unpkg.com/vue@3/dist/vue.esm-browser.js';
import { homepage_view } from './pages/homepage/homepage_view.js';
import { profile_view } from './pages/profile/profile_view.js';

const RootComponent = {
    components: {
        'home-page': homepage_view,
        'profile-page': profile_view
    },
    setup() {
        const currentPage = ref('home'); // 현재 페이지 상태

        const navigateTo = (page) => {
            currentPage.value = page;
        };

        return { currentPage, navigateTo };
    },
    template: `
        <div>
            <home-page v-if="currentPage === 'home'" @go-profile="navigateTo('profile')" />
            <profile-page v-if="currentPage === 'profile'" :onBack="() => navigateTo('home')" />
        </div>
    `
};

createApp(RootComponent).mount('#app');
