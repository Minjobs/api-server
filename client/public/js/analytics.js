/**
 * 📊 MURDOO K - Analytics Manager
 */
const Analytics = {
    // 1. 안전 장치 (gtag 호출)
    log: (eventName, params) => {
        if (typeof window.gtag !== 'undefined') {
            window.gtag('event', eventName, params);
            console.log(`📡 [GA4] ${eventName}:`, params); 
        } else {
            console.warn(`⚠️ [GA4 Blocked] ${eventName}`);
        }
    },

    // 2. 로그인 (home.html)
    trackLogin: () => {
        Analytics.log('login', { method: 'Line' });
    },

    // 3. 페이지 조회 (input.html, love.html, gacha.html)
    trackViewService: (serviceName) => {
        Analytics.log('view_item', {
            currency: 'THB',
            value: 30, // 대략적인 가치 (1코인=15바트 가정)
            items: [{ item_id: serviceName, item_name: serviceName }]
        });
    },

    // 4. 분석/뽑기 버튼 클릭 (결제 시도)
    trackBeginCheckout: (serviceName) => {
        Analytics.log('begin_checkout', {
            currency: 'THB', 
            value: 30,
            items: [{ item_id: serviceName, item_name: serviceName }]
        });
    },

    // 5. 실제 코인 사용 완료 (매출 발생 - 가장 중요!)
    trackSpendCoin: (serviceName, coins) => {
        Analytics.log('spend_virtual_currency', {
            value: coins,
            virtual_currency_name: 'Gold Coin',
            item_name: serviceName
        });
    },

    // 6. 결과 공유 (result 페이지들)
    trackShare: (serviceName) => {
        Analytics.log('share', {
            method: 'native_share',
            content_type: 'fortune_result',
            item_id: serviceName
        });
    }
};

// 전역 사용 설정
window.Analytics = Analytics;
