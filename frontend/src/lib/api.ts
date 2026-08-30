import { auth } from './firebase';

const BASE_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api`;

async function getAuthHeader() {
    const user = auth.currentUser;
    if (!user) return {};
    const token = await user.getIdToken();
    return { 'Authorization': `Bearer ${token}` };
}

export const api = {
    async get(endpoint: string) {
        const headers = await getAuthHeader();
        const response = await fetch(`${BASE_URL}${endpoint}`, {
            headers: {
                ...headers,
                'Content-Type': 'application/json'
            }
        });
        if (!response.ok) {
            const error = await response.json().catch(() => ({ error: 'Request failed' }));
            throw new Error(error.error || error.message || 'API request failed');
        }
        return response.json();
    },

    async post(endpoint: string, data: any) {
        const headers = await getAuthHeader();
        const response = await fetch(`${BASE_URL}${endpoint}`, {
            method: 'POST',
            headers: {
                ...headers,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        if (!response.ok) {
            const error = await response.json().catch(() => ({ error: 'Request failed' }));
            throw new Error(error.error || error.message || 'API request failed');
        }
        return response.json();
    },

    async put(endpoint: string, data: any) {
        const headers = await getAuthHeader();
        const response = await fetch(`${BASE_URL}${endpoint}`, {
            method: 'PUT',
            headers: {
                ...headers,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        if (!response.ok) {
            const error = await response.json().catch(() => ({ error: 'Request failed' }));
            throw new Error(error.error || error.message || 'API request failed');
        }
        return response.json();
    },

    async patch(endpoint: string, data: any) {
        const headers = await getAuthHeader();
        const response = await fetch(`${BASE_URL}${endpoint}`, {
            method: 'PATCH',
            headers: {
                ...headers,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        if (!response.ok) {
            const error = await response.json().catch(() => ({ error: 'Request failed' }));
            throw new Error(error.error || error.message || 'API request failed');
        }
        return response.json();
    },

    async delete(endpoint: string) {
        const headers = await getAuthHeader();
        const response = await fetch(`${BASE_URL}${endpoint}`, {
            method: 'DELETE',
            headers: {
                ...headers,
                'Content-Type': 'application/json'
            }
        });
        if (!response.ok) {
            const error = await response.json().catch(() => ({ error: 'Request failed' }));
            throw new Error(error.error || error.message || 'API request failed');
        }
        return response.json();
    },

    async upload(endpoint: string, formData: FormData) {
        const headers = await getAuthHeader();
        // Do NOT set Content-Type header when sending FormData
        const response = await fetch(`${BASE_URL}${endpoint}`, {
            method: 'POST',
            headers: {
                ...headers
            },
            body: formData
        });
        if (!response.ok) {
            const error = await response.json().catch(() => ({ error: 'Request failed' }));
            throw new Error(error.error || error.message || 'API request failed');
        }
        return response.json();
    }
};

// Groq API Client - Adapted to use api helper
export const groqAPI = {
    chat: async (prompt: string, language: string = 'en', userProfile?: any, currentPage?: string) => {
        const response = await api.post('/groq/chat', { prompt, language, userProfile, currentPage });
        return response.response;
    },

    generateSchedule: async (userProfile: any) => {
        const response = await api.post('/groq/schedule', { userProfile });
        return response.schedule;
    },

    generateDiet: async (userProfile: any) => {
        const response = await api.post('/groq/diet', { userProfile });
        return response.diet;
    },

    generateBabyDiet: async (userProfile: any) => {
        const response = await api.post('/groq/baby-diet', { userProfile });
        return response.babyDiet;
    },

    getDiseaseAwareness: async (prompt: string, language: string = 'en', userProfile?: any) => {
        const response = await api.post('/groq/disease-awareness', { prompt, language, userProfile });
        return response.response;
    },

    getVaccineSuggestions: async (userProfile?: any) => {
        const response = await api.post('/groq/vaccine-suggestions', { userProfile });
        return response.vaccines;
    },

    getPregnancyCheckups: async (userProfile?: any) => {
        const response = await api.post('/groq/pregnancy-checkups', { userProfile });
        return response.checkups;
    },
};

// Sarvam API Client - Adapted to use api helper
export const sarvamAPI = {
    speechToText: async (audioData: string, language: string = 'en-IN') => {
        const response = await api.post('/sarvam/speech-to-text', { audioData, language });
        return response.transcript;
    },

    textToSpeech: async (text: string, language: string = 'en-IN', speaker: string = 'meera') => {
        const response = await api.post('/sarvam/text-to-speech', { text, language, speaker });
        return response.audio;
    },
};

export default {
    groq: groqAPI,
    sarvam: sarvamAPI,
    api // Export generic api too
};

