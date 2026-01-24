const Loading = {
    show: function(text = "กำลังติดต่อกับดวงดาว...") {
        if (document.getElementById('loading-overlay')) return;

        const overlay = document.createElement('div');
        overlay.id = 'loading-overlay';
        overlay.innerHTML = `
            <div class="mystic-aura"></div>
            <div class="mystic-spinner"></div>
            <div id="loading-text">${text}</div>
        `;
        document.body.appendChild(overlay);
    },
    hide: function() {
        const overlay = document.getElementById('loading-overlay');
        if (overlay) {
            overlay.style.opacity = '0';
            setTimeout(() => overlay.remove(), 500); // 페이드아웃 후 제거
        }
    }
};
