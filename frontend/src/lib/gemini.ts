const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
    console.error("Missing VITE_GEMINI_API_KEY in environment variables.");
}

export const getGeminiResponse = async (
    prompt: string,
    language: string = 'en'
): Promise<string> => {
    if (!API_KEY) {
        console.error("API Key is missing");
        return "Error: API Key is missing. Please configure VITE_GEMINI_API_KEY.";
    }

    try {
        // Using direct REST API to avoid SDK versioning issues
        // Model: gemini-2.0-flash which we confirmed is available
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

        const systemPrompt = `You are "Aal is Well", a supportive, empathetic, and knowledgeable maternal and infant health assistant. 
    Your role is to comfort and guide pregnant women and new mothers.
    
    Guidelines:
    - Tone: Warm, reassuring, respectful, and calm.
    - Safety: ALWAYS advise consulting a doctor for medical emergencies, severe pain, or bleeding. Do not diagnose.
    - Content: Provide general health tips, diet suggestions, sleep advice, and emotional support.
    - Brevity: Keep responses concise (under 100 words) and easy to read.
    
    Current User Language: ${language === 'hi' ? 'Hindi' : language === 'es' ? 'Spanish' : 'English'}
    Instruction: Respond ONLY in the user's selected language.`;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: `${systemPrompt}\n\nUser: ${prompt}\nAssistant:`
                    }]
                }],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 200,
                }
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`API Error: ${response.status} - ${JSON.stringify(errorData)}`);
        }

        const data = await response.json();

        // Parse response
        if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts) {
            return data.candidates[0].content.parts[0].text;
        } else {
            console.error("Unexpected API response structure:", data);
            return "I'm creating a response, but it seems to have gotten lost. Please ask again.";
        }

    } catch (error: any) {
        console.error("Gemini API Request Failed:", error);
        return `Connection Issue: ${error.message}`;
    }
};
