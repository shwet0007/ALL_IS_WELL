import { UserProfile } from './db';
import { groqAPI } from './api';

interface UserContext {
    profile?: UserProfile | null;
}

// Main chat function - now uses backend API
export const getGroqResponse = async (
    prompt: string,
    language: string = 'en',
    userContext?: UserContext,
    currentPage?: string
): Promise<string> => {
    try {
        return await groqAPI.chat(prompt, language, userContext?.profile, currentPage);
    } catch (error: any) {
        console.error("Groq API Request Failed:", error);
        return `Connection Issue: ${error.message}`;
    }
};

// Generate Personalized Daily Schedule - now uses backend API
export const generatePersonalizedSchedule = async (
    userProfile: UserProfile | null
): Promise<any[]> => {
    if (!userProfile) {
        throw new Error("User profile is required");
    }

    try {
        return await groqAPI.generateSchedule(userProfile);
    } catch (error: any) {
        console.error("Schedule generation failed:", error);
        throw error;
    }
};

// Generate Personalized Diet Plan - now uses backend API
export const generatePersonalizedDiet = async (
    userProfile: UserProfile | null
): Promise<any[]> => {
    if (!userProfile) {
        throw new Error("User profile is required");
    }

    try {
        return await groqAPI.generateDiet(userProfile);
    } catch (error: any) {
        console.error("Diet generation failed:", error);
        throw error;
    }
};

// Generate Personalized Baby Diet Plan - now uses backend API
export const generateBabyDietPlan = async (
    userProfile: UserProfile | null
): Promise<string> => {
    if (!userProfile || userProfile.role !== 'mother') {
        throw new Error("Valid mother profile is required");
    }

    try {
        return await groqAPI.generateBabyDiet(userProfile);
    } catch (error: any) {
        console.error("Baby diet generation failed:", error);
        throw error;
    }
};

// Generate Disease Awareness Response - now uses backend API
export const getDiseaseAwarenessResponse = async (
    prompt: string,
    language: string = 'en',
    userProfile: UserProfile | null
): Promise<string> => {
    try {
        return await groqAPI.getDiseaseAwareness(prompt, language, userProfile);
    } catch (error: any) {
        console.error("Disease awareness response failed:", error);
        throw error;
    }
};

// Generate AI Vaccine Suggestions - now uses backend API
export const getVaccineSuggestions = async (
    userProfile: UserProfile | null
): Promise<{ vaccine: string; dueDate: string }[]> => {
    try {
        return await groqAPI.getVaccineSuggestions(userProfile);
    } catch (error: any) {
        console.error("Vaccine suggestions failed:", error);
        throw error;
    }
};

// Generate AI Pregnancy Checkup Suggestions - now uses backend API
export const getPregnancyCheckupSuggestions = async (
    userProfile: UserProfile | null
): Promise<{ checkup: string; dueDate: string }[]> => {
    try {
        return await groqAPI.getPregnancyCheckups(userProfile);
    } catch (error: any) {
        console.error("Pregnancy checkup suggestions failed:", error);
        throw error;
    }
};
