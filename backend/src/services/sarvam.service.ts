import { config } from '../config/env';
import axios from 'axios';
import FormData from 'form-data';

export const speechToText = async (
    audioData: string,
    language: string = 'en-IN'
): Promise<string> => {
    try {
        // Convert base64 to buffer
        const audioBuffer = Buffer.from(audioData, 'base64');

        // Create form data
        const formData = new FormData();
        formData.append('file', audioBuffer, {
            filename: 'audio.wav',
            contentType: 'audio/wav'
        });
        formData.append('language_code', language);

        const response = await axios.post('https://api.sarvam.ai/speech-to-text', formData, {
            headers: {
                'api-subscription-key': config.sarvamApiKey,
                ...formData.getHeaders()
            }
        });

        return response.data.transcript || '';
    } catch (error: any) {
        if (error.response) {
            throw new Error(`Sarvam API Error: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
        }
        throw error;
    }
};

export const textToSpeech = async (
    text: string,
    language: string = 'en-IN',
    speaker: string = 'meera' // Switching back to meera for stability test
): Promise<string> => {
    try {
        console.log(`[Sarvam] Requesting TTS for "${text.substring(0, 30)}..." in ${language} using ${speaker}`);
        const response = await axios.post('https://api.sarvam.ai/text-to-speech', {
            text,
            language_code: language,
            speaker,
            pitch: 0,
            pace: 1.0,
            loudness: 1.5,
            speech_sample_rate: 22050,
            enable_preprocessing: true,
            model: 'bulbul:v2'
        }, {
            headers: {
                'api-subscription-key': config.sarvamApiKey,
                'Content-Type': 'application/json',
            }
        });

        const audio = response.data.audio || response.data.audios?.[0] || response.data.base64_audio;

        if (audio) {
            console.log(`[Sarvam] TTS Successful, audio length: ${audio.length}`);
            return audio;
        } else {
            console.warn('[Sarvam] TTS response missing audio data. Response keys:', Object.keys(response.data));
            return '';
        }
    } catch (error: any) {
        if (error.response) {
            throw new Error(`Sarvam API Error: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
        }
        throw error;
    }
};
