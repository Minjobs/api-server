// /public/js/pages/homepage/homepage_view_model.js
import { ref } from 'https://unpkg.com/vue@3/dist/vue.esm-browser.js';

export function useCounter() {
    const count = ref(0);
    
    const increment = () => {
        count.value++;
        if (window.navigator.vibrate) window.navigator.vibrate(10);
    };

    const decrement = () => {
        if (count.value > 0) count.value--;
        if (window.navigator.vibrate) window.navigator.vibrate(5);
    };

    return { count, increment, decrement };
}

export function useMalls() {
    const malls = ref([
        { id: 1, name: 'pop! 스토어', subdomain: 'pop', icon: '✨' },
        { id: 2, name: '유니크 샵', subdomain: 'unique', icon: '🚀' }
    ]);

    return { malls };
}
