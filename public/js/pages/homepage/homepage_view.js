// /public/js/pages/homepage/homepage_view.js
import { useCounter, useMalls } from './homepage_view_model.js';

export const homepage_view = {
    setup() {
        // 실무 방식: 사용할 로직 모듈들을 여기서 조립합니다.
        const { count, increment, decrement } = useCounter();
        const { malls } = useMalls();

        // 템플릿(HTML)에서 사용할 변수와 함수만 명시적으로 반환
        return {
            count,
            increment,
            decrement,
            malls
        };
    },
    template: `
        <div class="min-h-screen bg-slate-50 flex flex-col items-center p-6 animate__animated animate__fadeIn">
            <header class="w-full max-w-md flex justify-between items-center mb-10">
                <h1 class="text-2xl font-black text-indigo-600 tracking-tighter italic">mallgo</h1>
                <button class="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center border border-slate-100">
                    👤
                </button>
            </header>

            <div class="w-full max-w-md bg-white rounded-[2.5rem] shadow-xl shadow-indigo-100/50 p-10 flex flex-col items-center mb-10 border border-white">
                <span class="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-4">Live Insights</span>
                <div class="text-8xl font-black text-slate-900 mb-10 tracking-tighter">{{ count }}</div>
                
                <div class="flex gap-3 w-full">
                    <button @click="decrement" class="flex-1 h-16 rounded-2xl bg-slate-50 text-slate-400 text-xl font-bold hover:bg-slate-100 active:scale-95 transition-all border border-slate-100">
                        −
                    </button>
                    <button @click="increment" class="flex-[2] h-16 rounded-2xl bg-indigo-600 text-white text-xl font-bold shadow-lg shadow-indigo-200 active:scale-95 transition-all">
                        ＋
                    </button>
                </div>
            </div>

            <div class="w-full max-w-md">
                <div class="flex justify-between items-end mb-5 px-2">
                    <h2 class="font-black text-slate-800 text-lg tracking-tight">My Stores</h2>
                    <span class="text-indigo-600 text-xs font-bold">Manage All</span>
                </div>
                <div class="space-y-3">
                    <div v-for="mall in malls" :key="mall.id" 
                         class="bg-white p-5 rounded-[1.5rem] flex items-center justify-between shadow-sm border border-slate-100 hover:border-indigo-200 transition-colors group">
                        <div class="flex items-center gap-4">
                            <div class="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-xl group-hover:scale-110 transition-transform tracking-tighter">
                                {{ mall.icon }}
                            </div>
                            <div>
                                <div class="font-bold text-slate-800 text-sm tracking-tight">{{ mall.name }}</div>
                                <div class="text-[10px] text-slate-400 font-mono tracking-tighter">{{ mall.subdomain }}.mallgo.shop</div>
                            </div>
                        </div>
                        <div class="text-slate-300">→</div>
                    </div>
                </div>
            </div>
        </div>
    `
};
