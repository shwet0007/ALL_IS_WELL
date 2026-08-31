import { storage } from './firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { api } from './api';

export type MoodType = 'Happy' | 'Neutral' | 'Tired' | 'Anxious' | 'Unwell';

export interface DiaryEntry {
    id?: string;
    userId: string;
    date: string; // Format: YYYY-MM-DD
    mood: MoodType;
    text?: string;
    imageUrls?: string[];
    medicalConditions?: string[];
    isMilestone?: boolean;
    milestoneTitle?: string;
    milestoneCategory?: string;
    milestoneDescription?: string;
    createdAt?: any;
    updatedAt?: any;
}

// Helper to get today's date string YYYY-MM-DD
export const getTodayDateString = () => {
    return new Date().toISOString().split('T')[0];
};

/**
 * Upload an image to Firebase Storage
 */
export const uploadDiaryImage = async (file: File, userId: string): Promise<string> => {
    if (!userId) {
        throw new Error("User ID is missing. Please ensure you are logged in.");
    }

    if (file.size > 3 * 1024 * 1024) {
        throw new Error("File size exceeds 3MB limit.");
    }

    try {
        if (!storage) {
            throw new Error("Firebase Storage is not configured.");
        }

        const path = `diary_images/${userId}/${Date.now()}_${file.name}`;
        const storageRef = ref(storage, path);
        await uploadBytes(storageRef, file);
        const url = await getDownloadURL(storageRef);
        return url;
    } catch (error: any) {
        console.error("Error uploading image:", error);
        throw new Error("Image upload failed: " + error.message);
    }
};

/**
 * Save or Update a Diary Entry
 */
export const saveDiaryEntry = async (userId: string, entry: Omit<DiaryEntry, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    if (!userId) {
        throw new Error("User ID is missing. Please log in again.");
    }

    const today = getTodayDateString();

    if (entry.date > today) {
        throw new Error("Cannot create entries for future dates.");
    }

    if (entry.imageUrls && entry.imageUrls.length > 3) {
        throw new Error("Maximum 3 images allowed.");
    }

    const response = await api.post('/users/diary', entry);
    return response;
};

/**
 * Get a specific entry by date
 */
export const getDiaryEntryByDate = async (userId: string, date: string): Promise<DiaryEntry | null> => {
    const entries = await getDiaryEntries(userId);
    return entries.find(e => e.date === date) || null;
};

/**
 * Get all diary entries for a user, ordered by date desc
 */
export const getDiaryEntries = async (userId: string): Promise<DiaryEntry[]> => {
    const response = await api.get('/users/diary');
    return response.entries;
};

/**
 * Delete a diary entry
 */
export const deleteDiaryEntry = async (userId: string, dateOrId: string) => {
    // We'll use the date for deletion in our new backend API
    const date = dateOrId.includes('-') ? dateOrId : dateOrId; // Simplification
    await api.delete(`/users/diary/${date}`);
};
