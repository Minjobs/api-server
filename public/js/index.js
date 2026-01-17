import { createApp } from 'https://unpkg.com/vue@3/dist/vue.esm-browser.js';
import { HomePageView } from './pages/HomePage/HomePageView.js';

// HomePageView를 루트로 앱 시작
const app = createApp(HomePageView);
app.mount('#app');
