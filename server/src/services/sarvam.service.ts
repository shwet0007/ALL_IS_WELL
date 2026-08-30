import { config } from '../config/env';

export const speechToText = async (
    audioData: string,
    language: string = 'en-IN'
): Promise<string> => {
    const response = await fetch('https://api.sarvam.ai/speech-to-text', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${config.sarvamApiKey}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            audio: audioData,
            language_code: language,
        })
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Sarvam API Error: ${response.status} - ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    return data.transcript || '';
};

export const textToSpeech = async (
    text: string,
    language: string = 'en-IN',
    speaker: string = 'meera'
): Promise<string> => {
    const response = await fetch('https://api.sarvam.ai/text-to-speech', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${config.sarvamApiKey}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            text,
            language_code: language,
            speaker,
            pitch: 0,
            pace: 1.0,
            loudness: 1.5,
            speech_sample_rate: 8000,
            enable_preprocessing: true,
            model: 'bulbul:v1'
        })
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Sarvam API Error: ${response.status} - ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    return data.audio || '';
};
