// /public/js/pages/profile/profile_view_model.js
import { ref } from 'https://unpkg.com/vue@3/dist/vue.esm-browser.js';

export function useProfile() {
    const user = ref({
        name: '관리자님',
        email: 'admin@mallgo.shop',
        plan: 'Premium Plan'
    });

    const logout = () => {
        alert('로그아웃 되었습니다.');
        location.reload(); // 단순화를 위한 새로고침
    };

    return { user, logout };
}
