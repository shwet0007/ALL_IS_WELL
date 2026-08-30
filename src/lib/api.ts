/// <reference types="vite/client" />

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const ACCESS_TOKEN_KEY = 'aal_access_token';

export function getAccessToken() {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function setAccessToken(token: string) {
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
}

export function clearAccessToken() {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
}

// Helper to get auth token
const getAuthToken = async (): Promise<string | null> => {
    return getAccessToken();
};

// Generic API request helper
async function apiRequest<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const token = await getAuthToken();

    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(error.error || error.message || `HTTP ${response.status}`);
    }

    return response.json();
}

// Groq API Client
export const groqAPI = {
    chat: async (prompt: string, language: string = 'en', userProfile?: any) => {
        const response = await apiRequest<{ response: string }>('/api/groq/chat', {
            method: 'POST',
            body: JSON.stringify({ prompt, language, userProfile }),
        });
        return response.response;
    },

    generateSchedule: async (userProfile: any) => {
        const response = await apiRequest<{ schedule: any[] }>('/api/groq/schedule', {
            method: 'POST',
            body: JSON.stringify({ userProfile }),
        });
        return response.schedule;
    },

    generateDiet: async (userProfile: any) => {
        const response = await apiRequest<{ diet: any[] }>('/api/groq/diet', {
            method: 'POST',
            body: JSON.stringify({ userProfile }),
        });
        return response.diet;
    },

    generateBabyDiet: async (userProfile: any) => {
        const response = await apiRequest<{ babyDiet: string }>('/api/groq/baby-diet', {
            method: 'POST',
            body: JSON.stringify({ userProfile }),
        });
        return response.babyDiet;
    },

    getDiseaseAwareness: async (prompt: string, language: string = 'en', userProfile?: any) => {
        const response = await apiRequest<{ response: string }>('/api/groq/disease-awareness', {
            method: 'POST',
            body: JSON.stringify({ prompt, language, userProfile }),
        });
        return response.response;
    },

    getVaccineSuggestions: async (userProfile?: any) => {
        const response = await apiRequest<{ vaccines: { vaccine: string; dueDate: string }[] }>(
            '/api/groq/vaccine-suggestions',
            {
                method: 'POST',
                body: JSON.stringify({ userProfile }),
            }
        );
        return response.vaccines;
    },

    getPregnancyCheckups: async (userProfile?: any) => {
        const response = await apiRequest<{ checkups: { checkup: string; dueDate: string }[] }>(
            '/api/groq/pregnancy-checkups',
            {
                method: 'POST',
                body: JSON.stringify({ userProfile }),
            }
        );
        return response.checkups;
    },
};

// Sarvam API Client
export const sarvamAPI = {
    speechToText: async (audioData: string, language: string = 'en-IN') => {
        const response = await apiRequest<{ transcript: string }>('/api/sarvam/speech-to-text', {
            method: 'POST',
            body: JSON.stringify({ audioData, language }),
        });
        return response.transcript;
    },

    textToSpeech: async (text: string, language: string = 'en-IN', speaker: string = 'meera') => {
        const response = await apiRequest<{ audio: string }>('/api/sarvam/text-to-speech', {
            method: 'POST',
            body: JSON.stringify({ text, language, speaker }),
        });
        return response.audio;
    },
};

// User API Client
export const userAPI = {
    getProfile: async () => {
        const response = await apiRequest<{ profile: any }>('/api/users/profile', {
            method: 'GET',
        });
        return response.profile;
    },

    updateProfile: async (profileData: any) => {
        const response = await apiRequest<{ success: boolean; message: string }>(
            '/api/users/profile',
            {
                method: 'PUT',
                body: JSON.stringify(profileData),
            }
        );
        return response;
    },

    getDiaryEntries: async () => {
        const response = await apiRequest<{ entries: any[] }>('/api/users/diary', {
            method: 'GET',
        });
        return response.entries;
    },

    addDiaryEntry: async (entryData: any) => {
        const response = await apiRequest<{ success: boolean; id: string }>('/api/users/diary', {
            method: 'POST',
            body: JSON.stringify(entryData),
        });
        return response;
    },
};

export default {
    groq: groqAPI,
    sarvam: sarvamAPI,
    user: userAPI,
};
