// public/js/pages/homepage/homepage_view.js
export const homepage_view = {
    template: `
        <div class="p-6">
            <div class="flex justify-between items-center">
                <h1 class="text-2xl font-black italic text-indigo-600">mallgo</h1>
                <button @click="$emit('go-profile')" class="p-2 bg-slate-100 rounded-full">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                </button>
            </div>
            </div>
    `
};
