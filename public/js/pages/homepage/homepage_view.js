import { homepage_view_model } from './homepage_view_model.js';

export const homepage_view = {
    ...homepage_view_model,
    template: `
        <div class="min-h-screen flex flex-col items-center p-6 animate__animated animate__fadeIn">
            <header class="w-full max-w-md flex justify-between items-center mb-10">
                <h1 class="text-2xl font-black text-indigo-600 tracking-tighter">mallgo</h1>
                <div class="bg-indigo-100 px-3 py-1 rounded-full text-[10px] font-bold text-indigo-600">PREMIUM</div>
            </header>

            <div class="w-full max-w-md bg-white rounded-[3rem] shadow-2xl shadow-indigo-100 p-10 flex flex-col items-center mb-10 border border-white">
                <span class="text-slate-400 text-xs font-bold uppercase tracking-widest mb-4">Total Clicks</span>
                <div class="text-7xl font-black text-slate-900 mb-8 tracking-tighter">{{ count }}</div>
                <button @click="increment" 
                        class="w-24 h-24 rounded-full bg-indigo-600 flex items-center justify-center text-3xl shadow-xl shadow-indigo-200 active:scale-90 transition-all">
                    🚀
                </button>
            </div>

            <div class="w-full max-w-md">
                <h2 class="font-bold text-slate-800 text-sm mb-4 px-2 tracking-tight">내 쇼핑몰 목록</h2>
                <div class="space-y-3">
                    <div v-for="mall in malls" :key="mall.id" 
                         class="bg-white p-4 rounded-2xl flex items-center justify-between shadow-sm border border-slate-50">
                        <div class="flex items-center gap-4">
                            <div class="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-xl">{{ mall.icon }}</div>
                            <div>
                                <div class="font-bold text-slate-800 text-sm">{{ mall.name }}</div>
                                <div class="text-[10px] text-slate-400 font-mono">{{ mall.subdomain }}.mallgo.shop</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `
};
