export const login_view = {
    template: `
        <div class="min-h-screen flex items-center justify-center bg-slate-50">
            <div class="w-full max-w-sm bg-white p-10 rounded-[3rem] shadow-xl text-center">
                <h1 class="text-4xl font-black text-indigo-600 mb-8 italic">mallgo</h1>
                
                <a href="/api/auth/line" 
                   class="flex items-center justify-center gap-3 w-full py-4 bg-[#06C755] text-white font-bold rounded-2xl hover:opacity-90 transition-all shadow-lg shadow-green-100">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/4/41/LINE_logo.svg" class="w-6 h-6 invert">
                    LINE으로 로그인
                </a>
            </div>
        </div>
    `
};
