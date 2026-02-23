/**
 * [Asset] Love Compatibility (연애 궁합)
 * 각 항목별 상세 분석(400자 이상) 및 세부 점수화 반영
 */
export const LOVE_ASSET = {
    // 1. Function to generate prompts for AI (English version)
    getPrompts: (relationship, me, partner) => {
        return {
            system: `
                You are a professional **'Korean Saju Expert'** (사주를 보는 사람) who is highly skilled in the traditional Four Pillars of Destiny. 
                Your task is to provide a premium love compatibility analysis for Thai users based on their Saju data.

                [Year System Instruction - CRITICAL]
                - The birth dates provided in the data are in the **Buddhist Era (B.E. / พ.ศ.)**.
                - You MUST convert the Buddhist Era years to Western Era (A.D.) by subtracting 543 (e.g., B.E. 2541 = A.D. 1998) before calculating the Saju pillars and the 5 Elements.
                - All metaphysical calculations must be based on the converted A.D. year to ensure the accuracy of Korean Saju principles.

                [Operational Guidelines]
                1. Language: You MUST write the final output exclusively in **Thai (ภาษาไทย)**.
                2. No Hanja: Do NOT use Chinese characters. Translate them into Thai terms based on the 5 Elements (Wood: ไม้, Fire: ไฟ, Earth: ดิน, Metal: ทอง, Water: น้ำ).
                3. Accessibility: Explain harmony using natural flow metaphors (e.g., "Water nourishing a tree") to make it intuitive for Thai users.
                4. Addressing: Use "คุณ" for the user and refer to the partner's nickname naturally.
                5. Context: Provide deeply personalized advice tailored to their current relationship status: ${relationship}.
                6. Quality & Volume: This is a premium paid service. Each text section (chemistry, strengths, challenges, status_advice, future, boosters) MUST be very detailed and contain **AT LEAST 400 characters** to ensure high value for the customer.
            `,
            user: `
                [Korean Saju Destiny Data - Years in Buddhist Era (พ.ศ.)]
                - User (Me): Name: ${me.name}, Birth (B.E.): ${me.birth}, Time: ${me.time}
                - Partner: Name: ${partner.name}, Birth (B.E.): ${partner.birth}, Time: ${partner.time}
                - Current Relationship Status: ${relationship}

                [Request]
                1. Convert the B.E. years to A.D. and analyze the interaction of their 5 Elements based on authentic Korean Saju principles.
                2. Focus on spiritual synchronicity, energy flow, and their future path as a couple.
                3. Provide a quality score (0-100) for each individual section.
                4. Return the analysis strictly following the provided JSON schema.
            `
        };
    },

    // 2. JSON Schema for OpenAI Structured Outputs
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
                    description: "Overall harmony and energy flow analysis (Min 400 chars, in Thai)" 
                },
                chemistry_score: { type: "number" },
                strengths: { 
                    type: "string", 
                    description: "Positive aspects and strengths of the couple (Min 400 chars, in Thai)" 
                },
                strengths_score: { type: "number" },
                challenges: { 
                    type: "string", 
                    description: "Potential conflicts or lessons to learn (Min 400 chars, in Thai)" 
                },
                challenges_score: { type: "number" },
                status_advice: { 
                    type: "string", 
                    description: "Tailored advice based on current status (Min 400 chars, in Thai)" 
                },
                status_advice_score: { type: "number" },
                future: { 
                    type: "string", 
                    description: "Predicted future path (Min 400 chars, in Thai)" 
                },
                future_score: { type: "number" },
                boosters: { 
                    type: "string", 
                    description: "Lucky items, colors, or actions (Min 400 chars, in Thai)" 
                },
                boosters_score: { type: "number" }
            },
            required: [
                "score", "chemistry", "chemistry_score", "strengths", "strengths_score", 
                "challenges", "challenges_score", "status_advice", "status_advice_score", 
                "future", "future_score", "boosters", "boosters_score"
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
/**
 * [Asset] Gacha Fortune (오늘의 운세 - 불기 기반 정밀 사주 분석)
 * 불기(B.E.) 연도를 서기(A.D.)로 변환하여 한국 사주 일진을 분석합니다.
 */
export const GACHA_ASSET = {
    getPrompts: (yearBE, thaiDate) => {
        return {
            system: `
                You are 'Master Murdoo K', the most authoritative Korean Saju (Hyeong-myeong-hak) master in Thailand. 
                
                [Core Mission]
                Provide a premium daily fortune report for: ${thaiDate}.
                The user's birth year is Buddhist Era ${yearBE} (พ.ศ. ${yearBE}).

                [Crucial Analysis Instructions]
                1. Year Conversion: First, convert the Buddhist Era ${yearBE} to Western Era (A.D.) by subtracting 543 (e.g., 2541 B.E. = 1998 A.D.).
                2. Saju Analysis: Perform a deep Korean Saju analysis based on the converted Western year (${yearBE}-543) and today's energy (${thaiDate}).
                3. Lucky Numbers: Recommend exactly 3 lucky numbers between 1 and 1000 based on the user's cosmic elements (Wood, Fire, Earth, Metal, Water) for today.
                4. Quality: Every text section MUST be at least 400 characters. 
                5. Language: Strictly Thai (ภาษาไทย). Maintain a mystical and highly professional tone.
            `,
            user: `
                [Target Data]
                - Today's Date: ${thaiDate}
                - Birth Year: B.E. ${yearBE} (Please convert to A.D. for Saju calculation)

                [Request]
                Reveal today's destiny. Explain the cosmic flow and provide 3 specific lucky numbers between 1 and 1000.
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
                    description: "Recommended lucky colors, directions, and items." 
                },
                // ✅ 행운의 숫자 3개를 위한 배열 타입으로 변경
                lucky_numbers: { 
                    type: "array", 
                    items: { type: "number" },
                    description: "3 specific lucky numbers between 1 and 1000 based on Saju." 
                },
                taboo: { 
                    type: "string", 
                    description: "One specific action or thing to strictly avoid today." 
                }
            },
            required: [
                "summary", "today_luck", "today_luck_score", "zodiac_advice", 
                "action_plan", "cautions", "lucky_items", "lucky_numbers", "taboo"
            ],
            additionalProperties: false
        }
    }
};

// ✅ [추가] 사주 분석용 자산
export const SAJU_ASSET = {
    getPrompts: (realName, nickName, birthDate, birthTime, gender) => {
        return {
            system: `
                You are 'Master Murdoo K', a mystical and highly professional master of astrology. 
                Analyze the user's fate by perfectly integrating Korean Saju (Four Pillars of Destiny) and Thai Astrology.

                [Operational Guidelines]
                1. Language: MUST write exclusively in Thai (ภาษาไทย).
                2. Tone: Mystical, deep, and authoritative. Use "คุณ" to refer to the user.
                3. Length: Each detail section (outward, inward, strengths, etc.) MUST be detailed (approx. 400-600 characters).
                4. Analysis: Calculate the Saju based on the provided birth data and interpret the Five Elements (Wood, Fire, Earth, Metal, Water).
            `,
            user: `
                [User Data]
                - Name: ${realName} (Nickname: ${nickName})
                - Birth: ${birthDate} at ${birthTime}
                - Gender: ${gender}
                
                [Request]
                Provide a premium-grade personality and destiny analysis in Thai.
                Follow the defined JSON structure strictly.
            `
        };
    },

    schema: {
        name: "saju_analysis_report",
        strict: true, // ✅ 엄격한 스키마 준수 모드
        schema: {
            type: "object",
            properties: {
                summary: { 
                    type: "string", 
                    description: "One-line essence of the user's fate in Thai." 
                },
                outward: { 
                    type: "string", 
                    description: "Analysis of external personality and how others see the user (Min 400 chars)." 
                },
                inward: { 
                    type: "string", 
                    description: "Deep analysis of internal character, mindset, and true self (Min 400 chars)." 
                },
                strengths: { 
                    type: "string", 
                    description: "Detailed explanation of the user's strong points based on Saju (Min 400 chars)." 
                },
                weaknesses: { 
                    type: "string", 
                    description: "Detailed explanation of weaknesses and areas to improve (Min 400 chars)." 
                },
                cautions: { 
                    type: "string", 
                    description: "Specific warnings or things to be careful about in life (Min 400 chars)." 
                },
                boosters: { 
                    type: "string", 
                    description: "Lucky items, colors, or habits that boost the user's fortune (Min 400 chars)." 
                }
            },
            required: [
                "summary", "outward", "inward", 
                "strengths", "weaknesses", "cautions", "boosters"
            ],
            additionalProperties: false // ✅ 필수: 다른 필드 생성 금지
        }
    }
};