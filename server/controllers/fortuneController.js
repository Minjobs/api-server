import { v4 as uuidv4 } from 'uuid';
import OpenAI from 'openai';
import db from '../config/db.js';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

import { v4 as uuidv4 } from 'uuid';
import OpenAI from 'openai';
import db from '../config/db.js';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const analyzeFortune = async (req, res) => {
    try {
        const { type, realName, nickName, birthDate, birthTime, gender } = req.body;
        const line_user_id = req.user.userId;

        // [1] 성격 사주 전용 7대 섹터 정의 (타입이 personality일 때)
        const personalitySectors = {
            summary: "운명을 관통하는 한 줄 평 (บทสรุปแห่งโชคชะตา)",
            outward: "겉으로 보이는 기질과 사회적 이미지 (ตัวตนภายนอกและภาพลักษณ์ทางสังคม)",
            inward: "본인만 아는 깊은 내면의 심리와 본능 (จิตวิญญาณภายในและสัญชาตญาณที่ซ่อนอยู่)",
            strengths: "하늘이 준 강력한 무기/장점 (จุดแข็งและพรสวรรค์ที่สวรรค์ประทาน)",
            weaknesses: "살면서 다듬어야 할 부분/단점 (จุดอ่อนที่ต้องขัดเกลาและระวัง)",
            cautions: "반드시 피해야 할 상황이나 사고방식/주의사항 (สิ่งที่ต้องหลีกเลี่ยงและข้อควรระวัง)",
            boosters: "운을 상승시키는 행운의 요소/색상, 아이템 등 (เคล็ดลับเสริมดวงชะตา สี และไอเทมนำโชค)"
        };

        // [2] GPT-4o-mini 시스템 프롬프트 구성
        const systemPrompt = `
            당신은 세계적인 명성을 가진 사주가 '머두 K (Murdoo K)'입니다. 
            사용자의 정보를 바탕으로 유료 서비스 수준의 매우 상세하고 깊이 있는 성격 분석을 한국과 태국식 사주를 결합하여 제공하세요.

            [수행 지침]
            1. 언어: 반드시 태국어(Thai)로 작성할 것.
            2. 톤: 신비롭고 전문적이며 유저에게 통찰력을 주는 말투를 사용할 것.
            3. 분량: 각 섹터별 내용은 최소 400자 이상으로 매우 상세하게 작성하여 유저가 결제 가치를 느끼게 할 것.
            4. 형식: 반드시 아래의 JSON 구조를 엄격히 지킬 것.
            5. 한국식 사주와 태국식 사주를 조화롭게 결합하여 사주결과를 줄 것.

            [JSON 구조]
            {
                "summary": "성격 한 줄 요약 (최대 100자)",
                "outward": "겉모습에 관한 사주 상세 분석 내용 (400자 이상)",
                "inward": "속마음에 관한 사주 상세 분석 내용 (400자 이상)",
                "strengths": "장점에 관한 사주 상세 분석 내용 (400자 이상)",
                "weaknesses": 단점에 관한 사주 상세 분석 내용 (400자 이상)",
                "cautions": "조심해야하는 부분에 관한 상세 분석 내용 (400자 이상)",
                "boosters": "행운 가이드에 관한 상세 분석 내용 (400자 이상)"
            }
        `;

        const userPrompt = `
            - 이름: ${realName} (${nickName})
            - 생년월일: ${birthDate}
            - 태어난 시간: ${birthTime}
            - 성별: ${gender}
            - 분석 타입: 성격 및 기질 분석
            
            위 정보를 바탕으로 'summary, outward, inward, strengths, weaknesses, cautions, boosters' 7개 항목을 분석해줘.
        `;

        // [3] AI 요청 (JSON Mode)
        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt }
            ],
            response_format: { type: "json_object" }
        });

        const fortuneData = JSON.parse(completion.choices[0].message.content);
        const resultId = uuidv4();

        // [4] DB 저장 (detail_data 컬럼에 JSON 형태로 6개 섹터 저장)
        const { summary, ...details } = fortuneData;

        await db.execute(
            `INSERT INTO fortune_results 
            (result_id, line_user_id, fortune_type, summary_text, detail_data) 
            VALUES (?, ?, ?, ?, ?)`,
            [
                resultId, 
                line_user_id, 
                type, 
                summary, 
                JSON.stringify(details) // summary를 제외한 나머지 6개 섹터가 들어감
            ]
        );

        res.json({ resultId });

    } catch (err) {
        console.error('❌ 분석 및 저장 실패:', err);
        res.status(500).json({ error: 'Failed to analyze fortune' });
    }
};


// 특정 결과 조회 컨트롤러
export const getFortuneResult = async (req, res) => {
    try {
        const { id } = req.params;
        
        // result_id로 데이터 조회
        const [rows] = await db.execute(
            `SELECT * FROM fortune_results WHERE result_id = ?`, 
            [id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Result not found' });
        }

        const result = rows[0];

        // MySQL의 JSON 타입은 이미 객체로 반환될 수도 있지만, 
        // 환경에 따라 문자열일 수 있으므로 체크 후 파싱합니다.
        if (typeof result.detail_data === 'string') {
            result.detail_data = JSON.parse(result.detail_data);
        }

        // 프론트엔드에 필요한 데이터만 정제해서 전송
        res.json({
            fortune_type: result.fortune_type,
            summary: result.summary_text,
            details: result.detail_data // 성격, 재물 등 타입에 따른 JSON 객체
        });
    } catch (err) {
        console.error('❌ 결과 조회 실패:', err);
        res.status(500).json({ error: 'Database error' });
    }
};
