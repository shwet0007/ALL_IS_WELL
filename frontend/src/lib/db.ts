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

export const createUserProfile = async (userId: string, data: Omit<UserProfile, 'profileCompleted' | 'createdAt'>) => {
    try {
        await api.put('/users/profile', data);
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

export const getConnectedPatients = async (_doctorId?: string): Promise<UserProfile[]> => {
    try {
        const response = await api.get('/users/connected-patients');
        return response.patients || [];
    } catch (error) {
        console.error('Error fetching connected patients:', error);
        return [];
    }
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
    try {
        await api.delete('/users/schedule');
        return true;
    } catch (error) {
        console.error('Error clearing schedule:', error);
        throw error;
    }
};

// --- Diet Plan Services ---
export interface DietPlanProgress {
    date: string;
    sections: any[];
}

export const saveDietPlanProgress = async (userId: string, date: string, sections: any[]) => {
    try {
        const response = await api.put('/users/diet-progress', { date, sections });
        return response.progress;
    } catch (error) {
        console.error('Error saving diet plan progress:', error);
        throw error;
    }
};

export const getDietPlanProgress = async (userId: string): Promise<DietPlanProgress | null> => {
    try {
        const response = await api.get('/users/diet-progress');
        return response.progress || null;
    } catch (error) {
        console.error('Error fetching diet plan progress:', error);
        return null;
    }
};

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
    try {
        const response = await api.patch(`/users/checkups/${checkupId}/status`, { status });
        return response.checkup;
    } catch (error) {
        console.error('Error updating checkup status:', error);
        throw error;
    }
};

// --- Doctor Room Functions ---
export interface DoctorRoom {
    roomCode: string;
    doctorId: string;
    doctorName: string;
}

export const createDoctorRoom = async (_doctorId?: string, _doctorName?: string): Promise<string> => {
    const response = await api.post('/users/doctor-room', {});
    return response.room.roomCode;
};

export const getDoctorRoom = async (_doctorId?: string): Promise<DoctorRoom | null> => {
    const response = await api.get('/users/doctor-room');
    return response.room || null;
};

export const findDoctorByRoomCode = async (roomCode: string): Promise<DoctorRoom | null> => {
    try {
        const response = await api.get(`/users/doctor-room/${encodeURIComponent(roomCode)}`);
        return response.room || null;
    } catch (error) {
        console.error('Error finding doctor room:', error);
        return null;
    }
};

export const joinDoctorRoom = async (_patientId: string, doctorId: string, _doctorName: string) => {
    try {
        const response = await api.post('/users/doctor-request', { doctorId });
        return response.request;
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

export const getMedicalReports = async (patientId?: string) => {
    try {
        const query = patientId ? `?patientId=${encodeURIComponent(patientId)}` : '';
        const response = await api.get(`/users/reports${query}`);
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

// --- Food Tracker ---
export interface FoodIntroEntry {
    id: string;
    foodName: string;
    introductionDate: string;
    reaction: 'good' | 'bad' | 'gas' | 'constipation' | 'allergy' | 'rash';
    notes?: string;
}

export const addFoodIntroEntry = async (userId: string, entry: Omit<FoodIntroEntry, 'id'>) => {
    try {
        const response = await api.post('/users/food-intro', entry);
        return response.entry;
    } catch (error) {
        console.error('Error adding food introduction entry:', error);
        throw error;
    }
};

export const getFoodIntroHistory = async (userId: string): Promise<FoodIntroEntry[]> => {
    try {
        const response = await api.get('/users/food-intro');
        return response.entries || [];
    } catch (error) {
        console.error('Error fetching food introduction history:', error);
        return [];
    }
};

export const deleteFoodIntroEntry = async (userId: string, entryId: string) => {
    try {
        await api.delete(`/users/food-intro/${entryId}`);
        return true;
    } catch (error) {
        console.error('Error deleting food introduction entry:', error);
        throw error;
    }
};

// --- Baby Diet ---
export interface BabyDietPlanDoc {
    id?: string;
    plan: string;
    generatedAt: Date | string;
    babyAgeWeeks: number;
}

export const saveBabyDietPlan = async (userId: string, planData: BabyDietPlanDoc) => {
    try {
        const response = await api.put('/users/baby-diet-plan', planData);
        return response.plan;
    } catch (error) {
        console.error('Error saving baby diet plan:', error);
        throw error;
    }
};

export const getBabyDietPlan = async (userId: string): Promise<BabyDietPlanDoc | null> => {
    try {
        const response = await api.get('/users/baby-diet-plan');
        return response.plan || null;
    } catch (error) {
        console.error('Error fetching baby diet plan:', error);
        return null;
    }
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
