import { api } from './api';

export interface UserProfile {
    id?: number;
    uid?: string;
    name: string;
    email: string;
    role: 'pregnant' | 'mother' | 'doctor';
    language: string;
    age?: string;
    height?: string;
    weight?: string;
    bloodGroup?: string;

    emergencyContact: {
        name: string;
        phone: string;
    };

    medicalConditions?: {
        diabetes: boolean;
        bp: boolean;
        thyroid: boolean;
        anemia: boolean;
        asthma: boolean;
        other?: string;
    };

    joinCode?: string;
    assignedDoctorId?: string;
    pregnancyStartDate?: string;
    trimester?: string;
    previousComplications?: string;
    highRisk?: boolean;

    babyDob?: string;
    babyName?: string;
    babyGender?: string;
    babyBloodGroup?: string;
    deliveryType?: 'normal' | 'c-section';
    birthWeight?: string;
    premature?: boolean;
    feedingPreference?: 'breast' | 'formula' | 'mixed';
    babyAllergies?: string;
    babyHealthConditions?: string;
    pediatricianName?: string;
    pediatricianContact?: string;

    specialization?: string;
    clinicName?: string;

    lifestyle?: {
        sleep?: 'good' | 'average' | 'poor';
        activity?: 'low' | 'medium' | 'high';
        diet?: 'veg' | 'non-veg' | 'mixed';
        allergies?: string;
    };

    dietPreferences?: {
        mother?: {
            dietType: 'veg' | 'non-veg' | 'eggetarian' | 'vegan';
            restrictions: string[];
            allergies: string[];
            mealPattern: string;
            waterIntake: string;
        };
        baby?: {
            feedingType: 'breast' | 'formula' | 'mixed';
            allergies: string[];
            solidFoodStarted: boolean;
            weaningStyle?: 'traditional' | 'blw';
        };
    };

    doctorRoomId?: string;
    doctorId?: string;
    doctorName?: string;

    profileCompleted: boolean;
    createdAt?: any;
}

export const generateJoinCode = (name: string) => {
    const cleanName = name.replace(/[^a-zA-Z]/g, '').toUpperCase().substring(0, 4);
    const random = Math.floor(1000 + Math.random() * 9000);
    return `DR-${cleanName}-${random}`;
};

export const createUserProfile = async (userId: string, data: Omit<UserProfile, 'profileCompleted' | 'createdAt'>) => {
    try {
        const response = await api.put('/users/profile', data);
        return true;
    } catch (error) {
        console.error('Error creating user profile:', error);
        throw error;
    }
};

export const getUserProfile = async (userId: string) => {
    try {
        const response = await api.get('/users/profile');
        return response.profile;
    } catch (error) {
        console.error('Error fetching user profile:', error);
        return null;
    }
};

export const getPublicProfile = async (userId: string) => {
    try {
        const response = await api.get(`/users/profile/${userId}`);
        return response.profile;
    } catch (error) {
        console.error('Error fetching public profile:', error);
        return null;
    }
};

export const getConnectedPatients = async (doctorId: string) => {
    // This needs a specific backend route or filter. For now returning empty.
    // In a real app, the backend would filter users where doctorId == current user.
    return [];
};

export const updateUserProfile = async (userId: string, data: Partial<UserProfile>) => {
    try {
        await api.put('/users/profile', data);
        return true;
    } catch (error) {
        console.error('Error updating user profile:', error);
        throw error;
    }
};

export const updateFcmToken = async (fcmToken: string, timezone: string = Intl.DateTimeFormat().resolvedOptions().timeZone) => {
    try {
        await api.put('/users/fcm-token', { fcmToken, timezone });
        return true;
    } catch (error) {
        console.error('Error updating FCM token:', error);
        return false;
    }
};

// --- Schedule Services ---
export interface ScheduleItem {
    id: string;
    title: string;
    time: string;
    type: 'feeding' | 'sleep' | 'medication' | 'checkup' | 'vaccination' | 'other';
    completed: boolean;
    date?: string;
    note?: string;
}

export const getSchedule = async (userId: string) => {
    try {
        const response = await api.get('/users/schedule');
        return response.items.map((item: any) => ({
            ...item,
            id: item.id
        }));
    } catch (error) {
        console.error('Error fetching schedule:', error);
        return [];
    }
};

export const addScheduleItem = async (userId: string, item: Omit<ScheduleItem, 'id'>) => {
    try {
        const response = await api.post('/users/schedule', item);
        const newItem = response.item;
        return { ...newItem, id: newItem.id };
    } catch (error) {
        console.error('Error adding schedule item:', error);
        throw error;
    }
};

export const updateScheduleItem = async (userId: string, itemId: string, updates: Partial<ScheduleItem>) => {
    try {
        await api.patch(`/users/schedule/${itemId}`, updates);
        return true;
    } catch (error) {
        console.error('Error updating schedule item:', error);
        throw error;
    }
};

export const deleteScheduleItem = async (userId: string, itemId: string) => {
    try {
        await api.delete(`/users/schedule/${itemId}`);
        return true;
    } catch (error) {
        console.error('Error deleting schedule item:', error);
        throw error;
    }
};

export const clearSchedule = async (userId: string) => {
    // Not explicitly implemented in backend yet, could be a loop or batch delete
    return true;
};

// --- Diet Plan Services ---
export const saveDietPlanProgress = async (userId: string, date: string, sections: any[]) => {
    // Placeholder until diet progress has a dedicated Spring endpoint.
    return true;
}

export const getDietPlanProgress = async (userId: string) => {
    return null;
}

// --- Checkup Services ---
export interface Checkup {
    id: string;
    date: string;
    type: 'pregnancy' | 'baby';
    note?: string;
    status: 'scheduled' | 'completed' | 'cancelled' | 'pending';
    scheduledBy: string;
    patientId: string;
    patientName: string;
    isUrgent?: boolean;
}

export const scheduleCheckup = async (patientId: string, checkup: Omit<Checkup, 'id' | 'patientId' | 'patientName' | 'scheduledBy' | 'status'>) => {
    try {
        await api.post('/users/checkups', { ...checkup, patientId });
        return true;
    } catch (error) {
        console.error('Error scheduling checkup:', error);
        throw error;
    }
};

export const requestAppointment = async (checkup: { date: string, type: 'pregnancy' | 'baby', note?: string, isUrgent?: boolean }) => {
    try {
        await api.post('/users/checkups/request', checkup);
        return true;
    } catch (error) {
        console.error('Error requesting appointment:', error);
        throw error;
    }
};

export const getPatientCheckups = async (patientId: string) => {
    try {
        const response = await api.get('/users/checkups');
        return response.checkups;
    } catch (error) {
        console.error('Error fetching patient checkups:', error);
        return [];
    }
};

export const getDoctorCheckups = async (doctorId: string) => {
    try {
        const response = await api.get('/users/checkups');
        return response.checkups;
    } catch (error) {
        console.error('Error fetching doctor checkups:', error);
        return [];
    }
};

export const updateCheckupStatus = async (checkupId: string, status: 'scheduled' | 'completed' | 'cancelled') => {
    // Needs backend put/patch route for checkup status
    return true;
};

// --- Doctor Room Functions ---
export const createDoctorRoom = async (doctorId: string, doctorName: string): Promise<string> => {
    return "000000"; // Placeholder, real implementation should use backend
};

export const getDoctorRoom = async (doctorId: string) => {
    return null;
};

export const findDoctorByRoomCode = async (roomCode: string) => {
    return null;
};

export const joinDoctorRoom = async (patientId: string, doctorId: string, doctorName: string) => {
    try {
        await api.put('/users/profile', { doctorId, doctorName });
    } catch (error) {
        console.error('Error joining doctor room:', error);
        throw error;
    }
};

export const isPatientConnected = async (patientId: string) => {
    const profile = await getUserProfile(patientId);
    return !!(profile?.doctorId);
};

// --- Medical Reports & Doctor Notes ---
export interface MedicalReport {
    id: string;
    date: string;
    fileName: string;
    fileUrl: string;
    doctorName: string;
    remarks?: string;
    patientId: string;
}

export interface DoctorNote {
    id: string;
    date: string;
    content: string;
    doctorName: string;
    patientId: string;
    priority?: 'normal' | 'high';
}

export const addMedicalReport = async (report: Omit<MedicalReport, 'id'>) => {
    try {
        const response = await api.post('/users/reports', report);
        return response.report;
    } catch (error) {
        console.error('Error adding medical report:', error);
        throw error;
    }
};

export const getMedicalReports = async (patientId: string) => {
    try {
        const response = await api.get('/users/reports');
        return response.reports;
    } catch (error) {
        console.error('Error fetching medical reports:', error);
        return [];
    }
};

export const getDoctorNotes = async (patientId: string) => {
    try {
        const response = await api.get('/users/notes');
        return response.notes;
    } catch (error) {
        console.error('Error fetching doctor notes:', error);
        return [];
    }
};

export const deleteMedicalReport = async (reportId: string) => {
    try {
        await api.delete(`/users/reports/${reportId}`);
        return true;
    } catch (error) {
        console.error('Error deleting medical report:', error);
        throw error;
    }
};

// --- Resources ---
export interface PregnancyResource {
    id: string;
    title: string;
    description: string;
    type: 'video' | 'article' | 'podcast' | 'audio' | 'live';
    category: string;
    url: string;
    thumbnail?: string;
    duration?: string;
    isLocked?: boolean;
}

export const getPregnancyResources = async () => {
    return []; // Placeholder
};

export const toggleResourceBookmark = async (userId: string, resourceId: string, isBookmarked: boolean) => {
    return true; // Placeholder
};

export const getSavedResources = async (userId: string) => {
    return []; // Placeholder
};

export const seedResources = async () => {
    return; // Placeholder
};

// --- Food Tracker ---
export const addFoodIntroEntry = async (userId: string, entry: any) => {
    return { id: 'temp' }; // Placeholder
};

export const getFoodIntroHistory = async (userId: string) => {
    return []; // Placeholder
};

export const deleteFoodIntroEntry = async (userId: string, entryId: string) => {
    return true; // Placeholder
};

// --- Baby Diet ---
export const saveBabyDietPlan = async (userId: string, planData: any) => {
    return true; // Placeholder
};

export const getBabyDietPlan = async (userId: string) => {
    return null; // Placeholder
};

// --- Daily Health Check-In Services ---

export interface DailyCheckupResponses {
    physical: string;
    mental: string;
    lifestyle: string;
    babyRelated?: string;
}

export const getDailyCheckupStatus = async () => {
    try {
        const response = await api.get('/users/daily-checkup/status');
        return response;
    } catch (error) {
        console.error('Error fetching checkup status:', error);
        return { completed: false };
    }
};

export const submitDailyCheckup = async (responses: DailyCheckupResponses) => {
    try {
        const response = await api.post('/users/daily-checkup', { responses });
        return response;
    } catch (error) {
        console.error('Error submitting daily checkup:', error);
        throw error;
    }
};
// --- Advanced Analytics & Reporting Services ---

export interface AdvancedDashboardData {
    consistencyScore: number;
    consistencyLabel: string;
    moodTrends: Array<{ date: string, score: number, label: string }>;
    kpis: {
        routine: { value: number, trend: string, status: string };
        completion: { value: number, trend: string };
    };
}

export const getAdvancedDashboardData = async (): Promise<AdvancedDashboardData | null> => {
    try {
        const response = await api.get('/analytics/dashboard-advanced');
        return response;
    } catch (error) {
        console.error('Error fetching advanced dashboard data:', error);
        return null;
    }
};

export const getMonthlyReport = async (month: string) => {
    try {
        const response = await api.get(`/analytics/monthly-report/${month}`);
        return response.report;
    } catch (error) {
        console.error('Error fetching monthly report:', error);
        return null;
    }
};

export const getAchievements = async () => {
    try {
        const response = await api.get('/analytics/achievements');
        return response.achievements;
    } catch (error) {
        console.error('Error fetching achievements:', error);
        return [];
    }
};

// --- Reminder Services ---
export interface Reminder {
    id: string;
    userId: string;
    sourceType: 'schedule' | 'doctor' | 'vaccine' | 'medicine';
    sourceId: string;
    title: string;
    time: string;
    date: string;
    babyMessage?: string;
    sent: boolean;
}

export const getReminders = async (userId: string) => {
    try {
        const response = await api.get('/reminders/active');
        return response.reminders.map((r: any) => ({
            ...r,
            id: r.id
        }));
    } catch (error) {
        console.error('Error fetching reminders:', error);
        return [];
    }
};

export const updateReminderStatus = async (reminderId: string, sent: boolean) => {
    try {
        await api.patch(`/reminders/${reminderId}`, { sent });
        return true;
    } catch (error) {
        console.error('Error updating reminder status:', error);
        return false;
    }
};

// --- Notification Services ---
export interface Notification {
    id: string;
    userId: string;
    title: string;
    message?: string;
    sourceType: 'schedule' | 'doctor' | 'vaccine' | 'medicine' | 'system';
    sourceId: string;
    isRead: boolean;
    createdAt: string;
}

export const getNotifications = async () => {
    try {
        const response = await api.get('/notifications');
        return response.notifications.map((n: any) => ({
            ...n,
            id: n.id
        }));
    } catch (error) {
        console.error('Error fetching notifications:', error);
        return [];
    }
};

export const getUnreadNotificationCount = async () => {
    try {
        const response = await api.get('/notifications/unread-count');
        return response.count;
    } catch (error) {
        console.error('Error fetching unread count:', error);
        return 0;
    }
};

export const markNotificationRead = async (id: string) => {
    try {
        await api.patch(`/notifications/${id}/read`, {});
        return true;
    } catch (error) {
        console.error('Error marking notification read:', error);
        return false;
    }
};

export const markAllNotificationsRead = async () => {
    try {
        await api.patch('/notifications/read-all', {});
        return true;
    } catch (error) {
        console.error('Error marking all notifications read:', error);
        return false;
    }
};
