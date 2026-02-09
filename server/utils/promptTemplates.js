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
 * [Asset] Gacha Fortune (가차 운세 뽑기)
 * 뽑기 전용: 짧고 강렬한 요약 + 상세 분석 + 가차 전용 재미 요소
 */
export const GACHA_ASSET = {
    // 1. AI에게 전달할 지시문 생성 함수
    getPrompts: (year) => {
        return {
            system: `
                You are 'Murdoo K', the legendary gacha fortune master. 
                Your mission is to reveal the user's destiny for today based on their birth year: ${year}.

                [Operational Guidelines]
                1. Language: MUST write exclusively in Thai (ภาษาไทย).
                2. Tone: Mystical, exciting, and highly encouraging.
                3. Quality: This is a premium paid service. Each qualitative section MUST contain AT LEAST 400 characters of insightful analysis.
                4. Gacha Elements: Provide a "Lucky Number" (1-99) and a specific "Daily Taboo" (something to avoid today).
            `,
            user: `
                [Gacha Data]
                - Birth Year: ${year}
                
                [Request]
                Analyze the user's cosmic energy for today. 
                Explain how their birth year interacts with current celestial movements.
                Provide the analysis strictly following the JSON schema.
            `
        };
    },

    // 2. OpenAI Structured Outputs용 JSON 스키마
    schema: {
        name: "gacha_fortune_analysis",
        strict: true,
        schema: {
            type: "object",
            properties: {
                summary: { type: "string", description: "One-line essence of today's fate" },
                outward: { type: "string", description: "Today's social luck and external energy (Min 400 chars)" },
                inward: { type: "string", description: "Internal mindset and emotional guidance (Min 400 chars)" },
                strengths: { type: "string", description: "The most powerful luck factor for today (Min 400 chars)" },
                weaknesses: { type: "string", description: "Areas where energy is leaking (Min 400 chars)" },
                cautions: { type: "string", description: "Specific warnings for today (Min 400 chars)" },
                boosters: { type: "string", description: "How to maximize today's luck (Min 400 chars)" },
                lucky_number: { type: "number", description: "A lucky number for today (1-99)" },
                taboo: { type: "string", description: "One specific thing to avoid today (Thai)" }
            },
            required: [
                "summary", "outward", "inward", "strengths", "weaknesses", "cautions", "boosters", "lucky_number", "taboo"
            ],
            additionalProperties: false
        }
    }
};
