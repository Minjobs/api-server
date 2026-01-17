import { ref } from 'https://unpkg.com/vue@3/dist/vue.esm-browser.js';

export const homepage_view_model = {
    setup() {
        const count = ref(0);
        const malls = ref([
            { id: 1, name: 'pop! 스토어', subdomain: 'pop', icon: '✨' },
            { id: 2, name: '유니크 샵', subdomain: 'unique', icon: '🚀' }
        ]);

        const increment = () => {
            count.value++;
            if (window.navigator.vibrate) window.navigator.vibrate(10);
        };

        return { count, malls, increment };
    }
};
