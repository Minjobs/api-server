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
export const GACHA_ASSET = {
    getPrompts: (year) => {
        return {
            system: `
                You are 'Master Murdoo K', the most trusted Korean Saju expert in Thailand. 
                Your mission is to provide a "Daily Fortune Scroll" based on the user's birth year: ${year}.

                [Core Analysis Logic]
                1. Korean Saju & 5 Elements: Analyze today's energy (Wood, Fire, Earth, Metal, Water) and how it interacts with the user's birth year.
                2. Zodiac Animal (12 Animals): Incorporate the characteristics and luck of their specific Zodiac sign for today.
                3. Quality: This is a premium paid service. Each text section MUST be detailed (AT LEAST 400 characters) to ensure the user feels the value.
                4. Tone: Mystical but practical. Use friendly Thai "คุณ" and explain Saju terms as natural metaphors (e.g., "Today your energy is like a strong tree in a storm").
                5. Language: Strictly Thai (ภาษาไทย). No Chinese characters (Hanja).
            `,
            user: `
                [User Info]
                - Birth Year: ${year}
                
                [Request]
                Please reveal the destiny for TODAY. 
                1. How is the energy flow between their birth year and today's cosmic energy?
                2. What is the specific advice for their Zodiac sign?
                3. What should they avoid and how should they act to maximize their luck?
                
                Provide the analysis strictly following the JSON schema.
            `
        };
    },

    schema: {
        name: "daily_gacha_fortune",
        strict: true,
        schema: {
            type: "object",
            properties: {
                summary: { 
                    type: "string", 
                    description: "A punchy one-line summary of today's luck." 
                },
                today_luck: { 
                    type: "string", 
                    description: "Detailed analysis of today's overall luck and energy flow (Min 400 chars)." 
                },
                today_luck_score: { type: "number" },
                cautions: { 
                    type: "string", 
                    description: "Specific things to watch out for or avoid today (Min 400 chars)." 
                },
                action_plan: { 
                    type: "string", 
                    description: "Practical advice on how to behave and mindsets to keep (Min 400 chars)." 
                },
                zodiac_advice: { 
                    type: "string", 
                    description: "Special luck advice based on their Korean Zodiac animal (Min 400 chars)." 
                },
                lucky_items: { 
                    type: "string", 
                    description: "Recommendations for lucky colors, directions, and specific items for today." 
                },
                lucky_number: { type: "number" },
                taboo: { 
                    type: "string", 
                    description: "One specific action or thing to strictly avoid today." 
                }
            },
            required: [
                "summary", "today_luck", "today_luck_score", "cautions", 
                "action_plan", "zodiac_advice", "lucky_items", "lucky_number", "taboo"
            ],
            additionalProperties: false
        }
    }
};
