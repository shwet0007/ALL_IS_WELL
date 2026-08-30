// Sarvam AI API Service - SECURE VERSION (calls backend, not Sarvam directly)
// Backend handles API keys securely

import { api } from './api';

export interface SarvamSTTResponse {
    transcript: string;
}

export interface SarvamTTSResponse {
    audio: string; // Base64 encoded audio
}

/**
 * Convert speech to text using Sarvam AI (via backend proxy)
 * @param audioBlob - Audio blob from microphone recording
 * @param language - Language code (default: 'hi-IN' for Hindi, 'en-IN' for English)
 */
export const speechToText = async (
    audioBlob: Blob,
    language: string = 'hi-IN'
): Promise<string> => {
    try {
        // Convert blob to base64
        const base64Audio = await blobToBase64(audioBlob);

        const data: SarvamSTTResponse = await api.post('/sarvam/speech-to-text', {
            audioData: base64Audio,
            language,
        });
        return data.transcript;
    } catch (error) {
        console.error('Error in speech-to-text:', error);
        throw error;
    }
};

/**
 * Convert text to speech using Sarvam AI (via backend proxy)
 * @param text - Text to convert to speech
 * @param language - Language code (default: 'hi-IN' for Hindi)
 * @param speaker - Speaker voice (default: 'anushka' for female voice)
 */
export const textToSpeech = async (
    text: string,
    language: string = 'hi-IN',
    speaker: string = 'anushka'
): Promise<string> => {
    try {
        console.log('TTS Request:', { text, language, speaker });

        const data: SarvamTTSResponse = await api.post('/sarvam/text-to-speech', {
            text,
            language,
            speaker,
        });
        console.log('TTS Response Data received');

        return data.audio;
    } catch (error) {
        console.error('Error in text-to-speech:', error);
        throw error;
    }
};

/**
 * Helper: Convert Blob to Base64
 */
const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64String = (reader.result as string).split(',')[1]; // Remove data:audio/wav;base64, prefix
            resolve(base64String);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
};

/**
 * Play base64 encoded audio
 * @param base64Audio - Base64 encoded audio string
 */
export const playAudio = (base64Audio: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        try {
            console.log('Playing audio, base64 length:', base64Audio.length);
            console.log('Base64 start:', base64Audio.substring(0, 50));

            // Strip data URI prefix if present
            let cleanBase64 = base64Audio;
            if (base64Audio.includes(',')) {
                cleanBase64 = base64Audio.split(',')[1];
            }

            // Convert base64 to Blob
            const binaryString = window.atob(cleanBase64);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }

            // Log Magic Bytes
            const magic = String.fromCharCode(bytes[0], bytes[1], bytes[2], bytes[3]);
            console.log('Audio magic bytes:', magic);
            const blob = new Blob([bytes], { type: 'audio/wav' });
            const url = URL.createObjectURL(blob);

            const audio = new Audio();
            audio.src = url;
            audio.preload = 'auto';

            audio.onended = () => {
                console.log('Audio playback completed');
                URL.revokeObjectURL(url);
                resolve();
            };

            audio.onerror = (e) => {
                console.error('Audio playback error details:', {
                    error: audio.error,
                    networkState: audio.networkState,
                    readyState: audio.readyState,
                    src: audio.src
                });
                URL.revokeObjectURL(url);
                reject(new Error(`Failed to play audio: ${audio.error?.message || 'Format not supported'}`));
            };

            audio.onloadeddata = () => {
                console.log('Audio data loaded successfully');
            };

            audio.play().then(() => {
                console.log('Audio playback started');
            }).catch((err) => {
                console.error('Audio play() failed:', err);
                URL.revokeObjectURL(url);
                reject(err);
            });
        } catch (error) {
            console.error('Error creating audio element:', error);
            reject(error);
        }
    });
};

/**
 * Record audio from microphone
 * @param maxDuration - Maximum recording duration in milliseconds (default: 60000 = 1 minute)
 */
export const recordAudio = (maxDuration: number = 60000): Promise<Blob> => {
    return new Promise(async (resolve, reject) => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            const audioChunks: Blob[] = [];

            mediaRecorder.ondataavailable = (event) => {
                audioChunks.push(event.data);
            };

            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
                stream.getTracks().forEach(track => track.stop());
                resolve(audioBlob);
            };

            mediaRecorder.onerror = (error) => {
                stream.getTracks().forEach(track => track.stop());
                reject(error);
            };

            mediaRecorder.start();

            // Auto-stop after max duration
            setTimeout(() => {
                if (mediaRecorder.state === 'recording') {
                    mediaRecorder.stop();
                }
            }, maxDuration);

            // Store reference to stop manually
            (mediaRecorder as any)._stopRecording = () => {
                if (mediaRecorder.state === 'recording') {
                    mediaRecorder.stop();
                }
            };

            // Return the recorder so it can be stopped manually
            resolve(mediaRecorder as any);
        } catch (error) {
            console.error('Error accessing microphone:', error);
            reject(error);
        }
    });
};
