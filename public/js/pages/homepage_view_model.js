// /public/js/pages/homepage/homepage_view.js
import { homepage_view_model } from './homepage_view_model.js';

export const homepage_view = {
    ...homepage_view_model,
    template: `
        <div class="min-h-screen flex flex-col items-center p-6 animate__animated animate__fadeIn">
            <header class="w-full max-w-md flex justify-between items-center mb-10">
                <h1 class="text-2xl font-black text-slate-800 tracking-tighter">mallgo</h1>
                <div class="bg-indigo-600 px-3 py-1 rounded-full text-[10px] font-bold text-white shadow-lg">PRO</div>
            </header>

            <div class="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl shadow-indigo-100 p-10 flex flex-col items-center mb-10 border border-white">
                <div class="text-7xl font-black text-slate-900 mb-8 tracking-tighter">{{ count }}</div>
                <button @click="increment" 
                        class="w-24 h-24 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-500 flex items-center justify-center text-3xl shadow-xl shadow-indigo-200 active:scale-90 transition-all">
                    🚀
                </button>
            </div>

            <div class="w-full max-w-md space-y-4">
                <h2 class="font-bold text-slate-400 text-xs uppercase tracking-widest px-2 font-mono">my shops</h2>
                <div v-for="mall in malls" :key="mall.id" 
                     class="bg-white/70 backdrop-blur-md p-5 rounded-3xl flex items-center justify-between border border-white shadow-sm hover:shadow-md transition-shadow">
                    <div class="flex items-center gap-4">
                        <div class="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-xl shadow-inner">{{ mall.icon }}</div>
                        <div>
                            <div class="font-bold text-slate-800">{{ mall.name }}</div>
                            <div class="text-[10px] text-slate-400 font-mono">{{ mall.subdomain }}.mallgo.shop</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `
};
