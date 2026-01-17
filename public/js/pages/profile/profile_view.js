// /public/js/pages/profile/profile_view.js
import { useProfile } from './profile_view_model.js';

export const profile_view = {
    props: ['onBack'], // 부모로부터 뒤로가기 함수를 받음
    setup(props) {
        const { user, logout } = useProfile();
        return { user, logout, onBack: props.onBack };
    },
    template: `
        <div class="min-h-screen bg-slate-50 p-6 animate__animated animate__fadeInRight">
            <header class="flex items-center mb-10">
                <button @click="onBack" class="text-2xl mr-4">←</button>
                <h1 class="text-xl font-bold text-slate-800">내 프로필</h1>
            </header>

            <div class="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 mb-6 text-center">
                <div class="w-20 h-20 bg-indigo-100 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl">👤</div>
                <h2 class="text-2xl font-black text-slate-800">{{ user.name }}</h2>
                <p class="text-slate-400 text-sm mb-6">{{ user.email }}</p>
                <div class="inline-block bg-indigo-600 text-white text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-widest">
                    {{ user.plan }}
                </div>
            </div>

            <button @click="logout" class="w-full py-4 bg-white text-red-500 font-bold rounded-2xl border border-red-100 shadow-sm">
                로그아웃
            </button>
        </div>
    `
};
