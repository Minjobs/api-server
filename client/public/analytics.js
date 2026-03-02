/**
 * 📊 MURDOO K - Analytics Manager
 * 모든 GA4 이벤트를 여기서 중앙 관리합니다.
 */

const Analytics = {
    // 1. [초기화 확인] 안전 장치 (광고 차단 등으로 gtag가 없을 경우 대비)
    log: (eventName, params) => {
        if (typeof window.gtag !== 'undefined') {
            window.gtag('event', eventName, params);
            console.log(`📡 [GA4 Sent] ${eventName}:`, params); // 개발자 도구 확인용
        } else {
            console.warn(`⚠️ [GA4 Blocked] ${eventName} not sent.`);
        }
    },

    // 2. [로그인] 라인 로그인 버튼 클릭 시
    trackLogin: () => {
        Analytics.log('login', {
            method: 'Line'
        });
    },

    // 3. [페이지 조회] 사주/궁합/가챠 입력 페이지 진입 시
    trackViewService: (serviceName) => {
        // serviceName 예시: 'saju', 'love', 'gacha'
        Analytics.log('view_item', {
            currency: 'COIN',
            value: 2, // 서비스 가격
            items: [{
                item_id: `service_${serviceName}`,
                item_name: `${serviceName.toUpperCase()} Analysis`,
                item_category: 'Fortune Service'
            }]
        });
    },

    // 4. [분석 시작] 폼 다 채우고 버튼 눌렀을 때 (결제 시도)
    trackBeginCheckout: (serviceName) => {
        Analytics.log('begin_checkout', {
            currency: 'COIN',
            value: 2,
            items: [{
                item_id: `service_${serviceName}`,
                item_name: `${serviceName.toUpperCase()} Analysis`
            }]
        });
    },

    // 5. [결제 완료] 실제 코인이 차감되고 결과가 나왔을 때 (가장 중요 ⭐)
    trackSpendCoin: (serviceName, coins = 2) => {
        Analytics.log('spend_virtual_currency', {
            value: coins,
            virtual_currency_name: 'Gold Coin',
            item_name: `${serviceName.toUpperCase()} Analysis`
        });
    },

    // 6. [공유] 결과 페이지에서 공유하기 클릭 시
    trackShare: (serviceName, method = 'native') => {
        Analytics.log('share', {
            method: method,
            content_type: 'fortune_result',
            item_id: `service_${serviceName}`
        });
    },
    
    // 7. [에러] 코인 부족 등으로 실패했을 때
    trackError: (errorType, message) => {
        Analytics.log('exception', {
            description: `${errorType}: ${message}`,
            fatal: false
        });
    }
};

// 전역에서 쓸 수 있게 window에 등록
window.Analytics = Analytics;
