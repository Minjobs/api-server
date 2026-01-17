import { createApp } from 'https://unpkg.com/vue@3/dist/vue.esm-browser.js';
import { homepage_view } from './pages/homepage/homepage_view.js';

const app = createApp(homepage_view);
app.mount('#app');
