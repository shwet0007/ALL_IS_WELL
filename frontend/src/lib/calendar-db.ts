import { api } from './api';

export type CalendarCategory = 'Note' | 'Health' | 'Baby Care';

export interface CalendarEvent {
    id: string;
    userId: string;
    date: string; // YYYY-MM-DD
    category: CalendarCategory;
    title: string;
    description?: string;
    createdAt?: any;
    updatedAt?: any;
}

/**
 * Add a new calendar event
 */
export const addCalendarEvent = async (userId: string, event: Omit<CalendarEvent, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    try {
        const response = await api.post('/users/calendar', event);
        return response.item;
    } catch (error) {
        console.error("Error adding calendar event:", error);
        throw error;
    }
};

/**
 * Update an existing calendar event
 */
export const updateCalendarEvent = async (eventId: string, updates: Partial<Omit<CalendarEvent, 'id' | 'userId' | 'createdAt'>>) => {
    try {
        await api.put(`/users/calendar/${eventId}`, updates);
    } catch (error) {
        console.error("Error updating calendar event:", error);
        throw error;
    }
};

/**
 * Delete a calendar event
 */
export const deleteCalendarEvent = async (eventId: string) => {
    try {
        await api.delete(`/users/calendar/${eventId}`);
    } catch (error) {
        console.error("Error deleting calendar event:", error);
        throw error;
    }
};

/**
 * Get events for a specific user.
 */
export const getUserCalendarEvents = async (userId: string) => {
    try {
        const response = await api.get('/users/calendar');
        return response.items;
    } catch (error) {
        console.error("Error fetching calendar events:", error);
        return [];
    }
};
