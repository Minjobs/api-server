/**
 * [Asset] Love Compatibility (연애 궁합)
 * 각 항목별 상세 분석(400자 이상) 및 세부 점수화 반영
 */
export const LOVE_ASSET = {
    // 1. AI에게 전달할 지시문(Prompt) 생성 함수
    getPrompts: (relationship, me, partner) => {
        return {
            system: `
                You are 'Master Murdoo K', the leading expert in "Korean Saju" (ศาสตร์ 4 เสาหลักแห่งดวงชะตา). 
                Your mission is to analyze love compatibility using only the principles of Korean Saju.

                [Operational Guidelines]
                1. Language: MUST write exclusively in Thai (ภาษาไทย).
                2. No Hanja: Do NOT use any Chinese characters. Translate them into Thai terms based on the 5 Elements (Wood: ไม้, Fire: ไฟ, Earth: ดิน, Metal: ทอง, Water: น้ำ).
                3. Accessibility: Explain the harmony as a natural flow (e.g., "Like water nourishing a tree") so it's intuitive for Thai users.
                4. Addressing: Use "คุณ" for the user and reference the partner's nickname naturally.
                5. Context: Provide deeply personalized advice based on their current status: ${relationship}.
                6. Quality & Volume: This is a premium paid service. Each qualitative text section (chemistry, strengths, challenges, status_advice, future, boosters) MUST be very detailed and contain AT LEAST 400 characters to provide high value to the customer.
            `,
            user: `
                [Korean Saju Destiny Data]
                - User (Me): Name: ${me.name}, Birth: ${me.birth}, Time: ${me.time}
                - Partner: Name: ${partner.name}, Birth: ${partner.birth}, Time: ${partner.time}
                - Current Relationship Status: ${relationship}

                [Request]
                Analyze how their 5 Elements interact. Focus on spiritual sync, energy flow, and their future path. 
                Provide a score (0-100) for each individual section to reflect its specific quality.
                Provide the analysis strictly following the JSON schema.
            `
        };
    },

    // 2. OpenAI Structured Outputs용 JSON 스키마
    schema: {
        name: "love_compatibility_analysis",
        strict: true,
        schema: {
            type: "object",
            properties: {
                score: { 
                    type: "number", 
                    description: "Overall compatibility score from 0 to 100" 
                },
                chemistry: { 
                    type: "string", 
                    description: "Overall harmony and energy flow analysis (Min 400 chars)" 
                },
                chemistry_score: { type: "number" },
                strengths: { 
                    type: "string", 
                    description: "Positive aspects and strengths of the couple (Min 400 chars)" 
                },
                strengths_score: { type: "number" },
                challenges: { 
                    type: "string", 
                    description: "Potential conflicts or lessons to learn (Min 400 chars)" 
                },
                challenges_score: { type: "number" },
                status_advice: { 
                    type: "string", 
                    description: "Tailored advice based on their current relationship status (Min 400 chars)" 
                },
                status_advice_score: { type: "number" },
                future: { 
                    type: "string", 
                    description: "Predicted future path of the relationship (Min 400 chars)" 
                },
                future_score: { type: "number" },
                boosters: { 
                    type: "string", 
                    description: "Lucky items, colors, or actions to improve luck (Min 400 chars)" 
                },
                boosters_score: { type: "number" }
            },
            required: [
                "score", 
                "chemistry", "chemistry_score", 
                "strengths", "strengths_score", 
                "challenges", "challenges_score", 
                "status_advice", "status_advice_score", 
                "future", "future_score", 
                "boosters", "boosters_score"
            ],
            additionalProperties: false
        }
    }
};

/**
 * [Asset] Gacha Fortune (오늘의 운세 뽑기)
 * 한국 사주 + 띠 + 오행의 기운을 태국어로 쉽게 풀이
 */
/**
 * [Asset] Gacha Fortune (오늘의 운세 - 태국 현지 날짜 최적화)
 * 한국 사주(명리학)의 일진(日辰)과 태국 유저의 친숙한 요소를 결합
 */
/**
 * [Asset] Gacha Fortune (오늘의 운세 - 태국 불기 연도 최적화)
 * 사용자의 생년을 불기(B.E.)로 인식하여 한국 사주와 결합합니다.
 */
export const GACHA_ASSET = {
    // 💡 날짜(thaiDate)와 불기 연도(year)를 받아 AI에게 전달합니다.
    getPrompts: (year, thaiDate) => {
        return {
            system: `
                You are 'Master Murdoo K', the most famous and trusted Korean Saju (Hyeong-myeong-hak) expert in Thailand. 
                
                [Core Mission]
                Provide a premium, highly detailed "Daily Fortune Report" for the specific date: ${thaiDate}.
                The user's birth year is Buddhist Era ${year} (พ.ศ. ${year}).

                [Analytical Framework]
                1. Daily Cosmic Energy (Il-jin): Analyze the energy of ${thaiDate} (e.g., Water Tiger, Gold Dragon, etc.) and its interaction with the user's birth year (B.E.) ${year}.
                2. The 5 Elements (Wu Xing): Explain how the flow of Wood, Fire, Earth, Metal, and Water affects the user today.
                3. Korean Zodiac (12 Animals): Provide specific advice based on their zodiac sign for this specific date.
                4. Quality Control: This is a paid service. Every text section (today_luck, zodiac_advice, action_plan, cautions) MUST be at least 400 characters long.
                5. Language: Strictly Thai (ภาษาไทย). Use a mystical yet practical and encouraging tone.
            `,
            user: `
                [Target Data]
                - Today's Thai Date: ${thaiDate}
                - User's Birth Year: Buddhist Era ${year} (พ.ศ. ${year})

                [Request]
                Please reveal the destiny secrets for today. 
                Explain why today is special for someone born in B.E. ${year} and give clear, actionable guidance.
                Provide the analysis strictly following the JSON schema.
            `
        };
    },

    schema: {
        name: "daily_gacha_fortune_report",
        strict: true,
        schema: {
            type: "object",
            properties: {
                summary: { 
                    type: "string", 
                    description: "A short, punchy summary of today's fate." 
                },
                today_luck: { 
                    type: "string", 
                    description: "Deep analysis of the cosmic energy flow between the user and today's date (Min 400 chars)." 
                },
                today_luck_score: { 
                    type: "number", 
                    description: "Luck score for today from 1 to 100." 
                },
                zodiac_advice: { 
                    type: "string", 
                    description: "Specific luck analysis for the user's zodiac sign today (Min 400 chars)." 
                },
                action_plan: { 
                    type: "string", 
                    description: "Step-by-step practical advice on how to spend today (Min 400 chars)." 
                },
                cautions: { 
                    type: "string", 
                    description: "Warnings and things to be careful about today (Min 400 chars)." 
                },
                lucky_items: { 
                    type: "string", 
                    description: "Recommended lucky colors, directions, and specific items (e.g., wallet, crystal, etc.)." 
                },
                lucky_number: { 
                    type: "number", 
                    description: "A single lucky number for today (1-99)." 
                },
                taboo: { 
                    type: "string", 
                    description: "One specific action or thing to strictly avoid today." 
                }
            },
            required: [
                "summary", "today_luck", "today_luck_score", "zodiac_advice", 
                "action_plan", "cautions", "lucky_items", "lucky_number", "taboo"
            ],
            additionalProperties: false
        }
    }
};
