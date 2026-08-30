import { config } from '../config/env';

export interface UserProfile {
    name?: string;
    role?: 'pregnant' | 'mother' | 'doctor';
    age?: string | number;
    height?: string | number;
    weight?: string | number;
    bloodGroup?: string;
    medicalConditions?: {
        diabetes?: boolean;
        bp?: boolean;
        thyroid?: boolean;
        anemia?: boolean;
        asthma?: boolean;
        other?: string;
    };
    pregnancyStartDate?: string;
    trimester?: string;
    highRisk?: boolean;
    previousComplications?: string;
    babyDob?: string;
    babyName?: string;
    babyGender?: string;
    deliveryType?: string;
    feedingPreference?: string;
    birthWeight?: string | number;
    babyHealthConditions?: string;
    babyAllergies?: string;
    lifestyle?: {
        sleep?: string;
        activity?: string;
        diet?: string;
        allergies?: string;
    };
}

const buildUserContextString = (profile: UserProfile | null | undefined): string => {
    if (!profile) return '';

    const parts: string[] = [];

    if (profile.name) parts.push(`User Name: ${profile.name}`);
    if (profile.role) {
        parts.push(`Role: ${profile.role === 'pregnant' ? 'Pregnant Woman' : profile.role === 'mother' ? 'New Mother' : 'Doctor'}`);
    }

    if (profile.age) parts.push(`Age: ${profile.age} years`);
    if (profile.height && profile.weight) {
        parts.push(`Height: ${profile.height}cm, Weight: ${profile.weight}kg`);
    }
    if (profile.bloodGroup) parts.push(`Blood Group: ${profile.bloodGroup}`);

    if (profile.medicalConditions) {
        const conditions: string[] = [];
        if (profile.medicalConditions.diabetes) conditions.push('Diabetes');
        if (profile.medicalConditions.bp) conditions.push('High BP');
        if (profile.medicalConditions.thyroid) conditions.push('Thyroid');
        if (profile.medicalConditions.anemia) conditions.push('Anemia');
        if (profile.medicalConditions.asthma) conditions.push('Asthma');
        if (profile.medicalConditions.other) conditions.push(profile.medicalConditions.other);
        if (conditions.length > 0) {
            parts.push(`Medical Conditions: ${conditions.join(', ')}`);
        }
    }

    if (profile.role === 'pregnant') {
        if (profile.pregnancyStartDate) parts.push(`LMP Date: ${profile.pregnancyStartDate}`);
        if (profile.trimester) parts.push(`Trimester: ${profile.trimester}`);
        if (profile.highRisk) parts.push(`⚠️ HIGH RISK PREGNANCY - Extra care needed`);
        if (profile.previousComplications) parts.push(`Previous Complications: ${profile.previousComplications}`);
    } else if (profile.role === 'mother') {
        if (profile.babyDob) parts.push(`Baby DOB: ${profile.babyDob}`);
        if (profile.babyGender) parts.push(`Baby Gender: ${profile.babyGender}`);
        if (profile.deliveryType) parts.push(`Delivery: ${profile.deliveryType}`);
        if (profile.feedingPreference) parts.push(`Feeding: ${profile.feedingPreference}`);
    }

    if (profile.lifestyle) {
        if (profile.lifestyle.sleep) parts.push(`Sleep Quality: ${profile.lifestyle.sleep}`);
        if (profile.lifestyle.activity) parts.push(`Activity Level: ${profile.lifestyle.activity}`);
        if (profile.lifestyle.diet) parts.push(`Diet: ${profile.lifestyle.diet}`);
        if (profile.lifestyle.allergies) parts.push(`Allergies: ${profile.lifestyle.allergies}`);
    }

    return parts.join('\n');
};

export const getChatCompletion = async (
    prompt: string,
    language: string = 'en',
    userProfile?: UserProfile | null,
    currentPage?: string
): Promise<string> => {
    const userContextStr = buildUserContextString(userProfile);

    const systemPrompt = `You are "Aal is Well", a compassionate and wise maternal health companion and website guide. Think of yourself as a knowledgeable elder sister or a supportive guide for pregnant women and new mothers.

CORE PERSONA & ROLE:
- Name: "Aal is Well"
- Vibe: Warm, comforting, optimistic, and grounded. Use gentle language.
- Role: You are both a health awareness assistant and a website guide. 
- GUIDE DUTIES: If the user asks about the website or what to do, explain the current page features and guide them.
${currentPage ? `- CURRENT PAGE: The user is currently on the "${currentPage}" page.` : ''}

CRITICAL SAFETY RULES (NON-NEGOTIABLE):
- NO DIAGNOSIS: You are an AI, not a doctor. Never diagnose medical conditions.
- EMERGENCY RED FLAGS: If the user mentions bleeding, severe pain, reduced baby movement, high fever, or vision changes, you MUST immediately tell them to contact their doctor or go to the hospital. Do not just offer home remedies for these.

INTERACTION STYLE:
- Empathy First: Always validate the user's feelings first.
- Actionable Advice: Give practical, safe tips.
- Brevity: Keep answers under 150 words.
- Context Awareness: Use the current page and user profile to tailor your guide advice. For example, if they are on the Dashboard, mention the Daily Check-in or Chat features.

Current User Language: ${language === 'hi' ? 'Hindi (हिंदी) - RESPOND IN DEVANAGARI SCRIPT' : language === 'ta' ? 'Tamil (தமிழ்) - RESPOND IN TAMIL SCRIPT' : language === 'te' ? 'Telugu - RESPOND IN TELUGU SCRIPT' : language === 'kn' ? 'Kannada - RESPOND IN KANNADA SCRIPT' : language === 'ml' ? 'Malayalam - RESPOND IN MALAYALAM SCRIPT' : language === 'bn' ? 'Bengali - RESPOND IN BENGALI SCRIPT' : language === 'gu' ? 'Gujarati - RESPOND IN GUJARATI SCRIPT' : language === 'mr' ? 'Marathi - RESPOND IN MARATHI SCRIPT' : language === 'pa' ? 'Punjabi - RESPOND IN PUNJABI SCRIPT' : 'English'}

${userContextStr ? `USER PROFILE CONTEXT:\n${userContextStr}\n\nIMPORTANT: Use this context to personalize your responses.` : ''}

IMPORTANT INSTRUCTION: 
- Output ONLY in the specific language requested above.
- Do not translate the system instructions, just follow them to generate the response.`;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${config.groqApiKey}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: prompt }
            ],
            model: 'llama-3.3-70b-versatile',
            temperature: 0.7,
            max_tokens: 250,
        })
    });

    if (!response.ok) {
        const errorData: any = await response.json();
        throw new Error(`Groq API Error: ${response.status} - ${JSON.stringify(errorData)}`);
    }

    const data: any = await response.json();
    return data.choices[0]?.message?.content || "I'm not sure how to respond to that.";
};

export const generateSchedule = async (userProfile: UserProfile): Promise<any[]> => {
    const userContextStr = buildUserContextString(userProfile);

    const prompt = `Based on the following user profile, generate a personalized daily schedule with 5-7 activities.

USER PROFILE:
${userContextStr}

REQUIREMENTS:
- Create a realistic daily schedule appropriate for their role (${userProfile.role})
- Include times in 24-hour format (HH:MM)
- Consider their medical conditions and lifestyle
- For pregnant women: include prenatal vitamins, rest periods, gentle exercise, hydration reminders
- For new mothers: include feeding times, baby care, self-care, rest
- Respect their activity level and sleep quality
- If they have specific conditions (diabetes, BP, etc.), include relevant monitoring/medication reminders

OUTPUT FORMAT (JSON array):
[
  {
    "title": "Activity name",
    "time": "HH:MM",
    "type": "feeding|sleep|medication|checkup|other",
    "note": "Brief helpful note"
  }
]

IMPORTANT: Return ONLY the JSON array, no additional text.`;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${config.groqApiKey}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            messages: [
                { role: 'system', content: 'You are a maternal health expert creating personalized daily schedules. Always respond with valid JSON only.' },
                { role: 'user', content: prompt }
            ],
            model: 'llama-3.3-70b-versatile',
            temperature: 0.8,
            max_tokens: 800,
        })
    });

    if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
    }

    const data: any = await response.json();
    const content = data.choices[0]?.message?.content || '[]';

    const jsonMatch = content.match(/\[[\s\S]*\]/);
    const jsonStr = jsonMatch ? jsonMatch[0] : content;

    return JSON.parse(jsonStr);
};

export const generateDiet = async (userProfile: UserProfile): Promise<any[]> => {
    const userContextStr = buildUserContextString(userProfile);

    const prompt = `Based on the following user profile, generate a personalized daily diet plan with 6 meal sections.

USER PROFILE:
${userContextStr}

REQUIREMENTS:
- Create 6 sections: Early Morning, Breakfast, Mid-Morning, Lunch, Evening Snack, Dinner
- Each section should have 2-4 food items
- Consider their role (${userProfile.role}), medical conditions, and diet preference (${userProfile.lifestyle?.diet || 'mixed'})
- Respect allergies: ${userProfile.lifestyle?.allergies || 'none'}
- For pregnant women: emphasize folic acid, iron, calcium, protein
- For mothers: focus on lactation-friendly foods if breastfeeding
- If diabetic: low glycemic index foods
- If anemic: iron-rich foods
- If BP issues: low sodium options

OUTPUT FORMAT (JSON array):
[
  {
    "id": "early-morning",
    "title": "Early Morning",
    "time": "06:00 - 07:00",
    "items": [
      {"id": "1", "text": "Food item with brief benefit", "icon": "Milk|Apple|UtensilsCrossed|Soup|Salad|Cookie|Sandwich|Coffee"}
    ],
    "color": "bg-orange-50"
  }
]

Use these colors in order: bg-orange-50, bg-green-50, bg-blue-50, bg-purple-50, bg-pink-50, bg-yellow-50

IMPORTANT: Return ONLY the JSON array, no additional text.`;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${config.groqApiKey}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            messages: [
                { role: 'system', content: 'You are a maternal nutrition expert creating personalized diet plans. Always respond with valid JSON only.' },
                { role: 'user', content: prompt }
            ],
            model: 'llama-3.3-70b-versatile',
            temperature: 0.8,
            max_tokens: 1200,
        })
    });

    if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
    }

    const data: any = await response.json();
    const content = data.choices[0]?.message?.content || '[]';

    const jsonMatch = content.match(/\[[\s\S]*\]/);
    const jsonStr = jsonMatch ? jsonMatch[0] : content;

    return JSON.parse(jsonStr);
};

export const generateBabyDiet = async (userProfile: UserProfile): Promise<string> => {
    if (userProfile.role !== 'mother') {
        throw new Error('Valid mother profile is required');
    }

    const userContextStr = buildUserContextString(userProfile);
    const babyAgeStr = userProfile.babyDob
        ? `${Math.floor(Math.abs(new Date().getTime() - new Date(userProfile.babyDob).getTime()) / (1000 * 60 * 60 * 24 * 7))} weeks`
        : 'unknown age';

    const prompt = `Based on the following profile, generate a comprehensive DATA-DRIVEN baby diet and nutrition plan.
      
USER PROFILE:
${userContextStr}
BABY AGE: ${babyAgeStr}

REQUIREMENTS:
- Focus specifically on the baby's nutrition needs.
- If the baby is under 6 months, emphasize breastfeeding or formula and preparation for solids.
- If 6+ months, provide a detailed food introduction schedule (purees, soft solids).
- Address specific baby conditions: ${userProfile.babyHealthConditions || 'none'}.
- Respect baby allergies: ${userProfile.babyAllergies || 'none'}.
- Consider delivery type (${userProfile.deliveryType}) and birth weight (${userProfile.birthWeight}kg) for gut health and growth.
- Provide a structured daily meal plan in Markdown format.
- Include a "Food Introduction Strategy" section for new parents.
- Add a "Safety Precautions" section (choking hazards, etc.).

OUTPUT FORMAT: Markdown only.
Include sections like:
# Daily Nutrition Plan for ${userProfile.babyName || 'Your Baby'}
## Current Phase: [e.g. Exclusive Breastfeeding / Early Solids]
## Daily Meal Schedule
## Food Introduction Strategy
## Health & Safety Tips

IMPORTANT: Be compassionate and evidence-based.`;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${config.groqApiKey}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            messages: [
                { role: 'system', content: 'You are an infant nutrition and pediatric diet specialist. Respond in professional yet supportive Markdown.' },
                { role: 'user', content: prompt }
            ],
            model: 'llama-3.3-70b-versatile',
            temperature: 0.7,
            max_tokens: 1500,
        })
    });

    if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
    }

    const data: any = await response.json();
    return data.choices[0]?.message?.content || 'Failed to generate plan.';
};

export const getDiseaseAwareness = async (
    prompt: string,
    language: string = 'en',
    userProfile: UserProfile | null
): Promise<string> => {
    const userContextStr = buildUserContextString(userProfile);

    const systemPrompt = `You are "Pediatric Expert Assistant", a specialized AI for infant disease awareness and prevention.
      
CORE RESPONSIBILITIES:
1. Provide information on common infant diseases (Jaundice, Colic, RSV, Hand-Foot-Mouth, etc.).
2. List symptoms, standard precautions, and prevention strategies.
3. CRITICAL: Identify "Doctor-Consult Indicators" or "Emergency Red Flags" for every condition mentioned.
4. Maintain a supportive but medically responsible tone.

SAFETY RULES:
- IMPORTANT: You provide AWARENESS, not DIAGNOSIS. Always use phrases like "This could be a sign of..." or "Parents often observe...".
- ALWAYS recommend consulting a pediatrician for active symptoms.
- If the prompt mentions high fever (>100.4F in infants), difficulty breathing, or lethargy, lead with "EMERGENCY: Contact your doctor immediately."

User Language: ${language}
${userContextStr ? `USER CONTEXT:\n${userContextStr}` : ''}

Respond in ${language === 'hi' ? 'Hindi (हिंदी)' : language === 'ta' ? 'Tamil (தமிழ்)' : 'English'}. Keep responses structured with bullet points for symptoms and precautions.`;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${config.groqApiKey}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: prompt }
            ],
            model: 'llama-3.3-70b-versatile',
            temperature: 0.6,
            max_tokens: 1000,
        })
    });

    if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
    }

    const data: any = await response.json();
    return data.choices[0]?.message?.content || 'Failed to get info.';
};

export const getVaccineSuggestions = async (
    userProfile: UserProfile | null
): Promise<{ vaccine: string; dueDate: string }[]> => {
    const babyDob = userProfile?.babyDob || new Date().toISOString();
    const babyName = userProfile?.babyName || 'the baby';

    const systemPrompt = `You are a "Vaccination Specialist AI".
      Based on the baby's Date of Birth (DOB), suggest the standard Indian immunization schedule (UIP).
      Return ONLY a JSON array of objects with "vaccine" (name) and "dueDate" (YYYY-MM-DD).
      
      Baby DOB: ${babyDob}
      Baby Name: ${babyName}
      
      SCHEDULE TO FOLLOW:
      - Birth: BCG, OPV 0, Hep B 0
      - 6 Weeks: OPV 1, Pentavalent 1, Rotavirus 1, IPV 1, PCV 1
      - 10 Weeks: OPV 2, Pentavalent 2, Rotavirus 2
      - 14 Weeks: OPV 3, Pentavalent 3, Rotavirus 3, IPV 2, PCV 2
      - 9 Months: MR 1, JE 1, Vitamin A
      
      Format only as JSON. No extra text.`;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${config.groqApiKey}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: 'Generate vaccine schedule.' }
            ],
            model: 'llama-3.3-70b-versatile',
            temperature: 0.1,
            response_format: { type: 'json_object' }
        })
    });

    if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
    }

    const data: any = await response.json();
    const content = data.choices[0]?.message?.content || '{}';
    const parsed = JSON.parse(content);

    return parsed.vaccines || parsed.schedule || (Array.isArray(parsed) ? parsed : []);
};

export const getPregnancyCheckups = async (
    userProfile: UserProfile | null
): Promise<{ checkup: string; dueDate: string }[]> => {
    const lmp = userProfile?.pregnancyStartDate || new Date().toISOString();
    const userName = userProfile?.name || 'the user';

    const systemPrompt = `You are a "Maternal Health Assistant".
      Based on the user's Last Menstrual Period (LMP) / Pregnancy Start Date, suggest a standard Antenatal Care (ANC) schedule.
      Include key checkups: First Booking (8-10 weeks), 1st Ultrasound (11-14 weeks), Anomaly Scan (18-22 weeks), 24-28 Week checkup, 32-34 Week checkup, 36 Week, 38 Week, and EDD (40 weeks).
      Return ONLY a JSON array of objects with "checkup" (name) and "dueDate" (YYYY-MM-DD).
      
      LMP Date: ${lmp}
      User Name: ${userName}
      
      Format only as JSON. No extra text. Ensure all dates are calculated correctly based on the LMP.`;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${config.groqApiKey}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: 'Generate pregnancy checkup schedule.' }
            ],
            model: 'llama-3.3-70b-versatile',
            temperature: 0.1,
            response_format: { type: 'json_object' }
        })
    });

    if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
    }

    const data: any = await response.json();
    const content = data.choices[0]?.message?.content || '{}';
    const parsed = JSON.parse(content);

    return parsed.checkups || parsed.schedule || (Array.isArray(parsed) ? parsed : []);
};

export const generateDailyTask = async (
    userProfile: UserProfile | null
): Promise<string> => {
    const userContextStr = buildUserContextString(userProfile);

    // Default task if profile is missing
    if (!userProfile) {
        return "Task: Drink a glass of water and take 3 deep breaths.";
    }

    const prompt = `Generate ONE simple, non-medical, observation-based daily task for a ${userProfile.role === 'pregnant' ? 'pregnant woman' : 'new mother'}.
    
    USER PROFILE:
    ${userContextStr}
    
    REQUIREMENTS:
    - The task must be low-effort and awareness-focused (e.g., "Observe your baby's sleep pattern", "Notice how your back feels today").
    - NO medical advice.
    - NO diagnosis.
    - Keep it under 20 words.
    - Start with a verb.
    - Tone: Calm, encouraging, distinct.
    
    OUTPUT: Just the task text. No quotes.`;

    try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${config.groqApiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                messages: [
                    { role: 'system', content: 'You are a helpful wellness assistant. You generate single, simple daily observation tasks.' },
                    { role: 'user', content: prompt }
                ],
                model: 'llama-3.3-70b-versatile',
                temperature: 0.9,
                max_tokens: 50,
            })
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }

        const data: any = await response.json();
        const content = data.choices[0]?.message?.content || 'Take a moment to rest and breathe deeply.';
        return content.trim();

    } catch (error) {
        console.error("Groq Daily Task Error:", error);
        // Fallback tasks
        const fallbacks = [
            "Take 5 deep breaths and relax your shoulders.",
            "Drink a glass of water and notice how you feel.",
            "Step outside or look out a window for 2 minutes.",
            "Write down one thing you are grateful for today.",
            "Gentle stretch: Reach your arms up and breathe."
        ];
        return fallbacks[Math.floor(Math.random() * fallbacks.length)];
    }
};

export const generateBabyMessage = async (
    activityTitle: string,
    activityType: string,
    userProfile?: UserProfile | null
): Promise<string> => {
    const userContextStr = buildUserContextString(userProfile);
    const babyName = userProfile?.babyName || 'Mumma';

    const prompt = `Generate a CUTE and EMOTIONAL "baby-style" reminder message for the following activity.
    
    ACTIVITY: "${activityTitle}" (${activityType})
    BABY NAME/IDENTITY: ${babyName}
    USER CONTEXT:
    ${userContextStr}
    
    REQUIREMENTS:
    - Tone: Extremely cute, innocent, and emotional. It should sound like a baby talking to their mommy.
    - Style: Use baby talk words like "Mumma", "Wuv you", "Tummy", "Time for", etc.
    - Length: Short and sweet (under 20 words).
    - Emotional Hook: Focus on why this activity is important for the baby or how it makes the baby feel loved.
    - NO medical jargon.
    - NO professional advice.
    
    EXAMPLES:
    - "Mummaaa, my tummy is rumbling! Time for my yummy milk? Wuv you!"
    - "Dada, it's time for my sleepy-weepy time. Cuddle me close?"
    - "Mumma, time for my vitamin drops so I can grow big and strong like you!"
    
    OUTPUT: Just the message text. No quotes.`;

    try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${config.groqApiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                messages: [
                    { role: 'system', content: 'You are a sweet, innocent baby speaking to your mommy.' },
                    { role: 'user', content: prompt }
                ],
                model: 'llama-3.3-70b-versatile',
                temperature: 0.9,
                max_tokens: 60,
            })
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }

        const data: any = await response.json();
        const content = data.choices[0]?.message?.content || "";
        return content.trim().replace(/^"|"$/g, '');

    } catch (error) {
        console.error("Groq Baby Message Error:", error);
        return ""; // Return empty to allow fallback to hardcoded messages
    }
};
