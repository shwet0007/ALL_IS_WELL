import React, { createContext, useContext, useEffect, useState } from 'react';
import { getToken } from 'firebase/messaging';
import { getFirebaseMessaging } from '@/lib/firebase';
import { api, clearAccessToken, getAccessToken, setAccessToken } from '@/lib/api';
import { getUserProfile, UserProfile, updateFcmToken } from '@/lib/db';

interface AppUser {
    uid: string;
    email: string | null;
    displayName?: string | null;
}

interface AuthApiResponse {
    accessToken: string;
    user: UserProfile & {
        id?: number;
        uid?: string;
    };
}

interface AuthContextType {
    currentUser: AppUser | null;
    userProfile: UserProfile | null;
    loading: boolean;
    signup: (email: string, password: string) => Promise<AuthApiResponse>;
    login: (email: string, password: string) => Promise<AuthApiResponse>;
    logout: () => Promise<void>;
    refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    function resetAuthState() {
        localStorage.removeItem('userRole');
        setCurrentUser(null);
        setUserProfile(null);
    }

    async function signup(email: string, password: string) {
        const response = await api.post('/auth/register', { email, password });
        applyAuthResponse(response);
        return response;
    }

    async function login(email: string, password: string) {
        const response = await api.post('/auth/login', { email, password });
        applyAuthResponse(response);
        return response;
    }

    async function logout() {
        try {
            await api.post('/auth/logout', {});
        } catch {
            // Stateless JWT logout is handled by clearing the token on the client.
        } finally {
            clearAccessToken();
            resetAuthState();
        }
    }

    async function refreshProfile() {
        if (!getAccessToken()) return;
        try {
            const profile = await getUserProfile('current');
            if (profile) {
                setUserProfile(profile);
                setCurrentUser(toCurrentUser(profile));
                if (profile.role) {
                    localStorage.setItem('userRole', profile.role);
                }
            } else {
                clearAccessToken();
                resetAuthState();
            }
        } catch (error) {
            console.warn('Profile refresh failed:', error);
            clearAccessToken();
            resetAuthState();
        }
    }

    function applyAuthResponse(response: AuthApiResponse) {
        setAccessToken(response.accessToken);
        setUserProfile(response.user);
        setCurrentUser(toCurrentUser(response.user));
        if (response.user?.role) {
            localStorage.setItem('userRole', response.user.role);
        }
    }

    function toCurrentUser(profile: AuthApiResponse['user'] | UserProfile): AppUser {
        const typedProfile = profile as AuthApiResponse['user'];
        const id = typedProfile.uid || String(typedProfile.id || '');
        return {
            uid: id,
            email: profile.email || null,
            displayName: profile.name || null
        };
    }

    useEffect(() => {
        async function bootstrap() {
            setLoading(true);
            try {
                if (!getAccessToken()) {
                    resetAuthState();
                    return;
                }

                const profile = await getUserProfile('current');
                if (profile) {
                    setUserProfile(profile);
                    setCurrentUser(toCurrentUser(profile));
                    if (profile.role) {
                        localStorage.setItem('userRole', profile.role);
                    }
                } else {
                    clearAccessToken();
                    resetAuthState();
                }
            } catch (error) {
                console.warn('Auth bootstrap failed:', error);
                clearAccessToken();
                resetAuthState();
            } finally {
                setLoading(false);
            }
        }

        bootstrap();
    }, []);

    const value = {
        currentUser,
        userProfile,
        loading,
        signup,
        login,
        logout,
        refreshProfile
    };

    // Request Notification Permission and register FCM
    const registerNotifications = async () => {
        if (!currentUser) return;
        try {
            const messaging = await getFirebaseMessaging();
            if (!messaging || !('Notification' in window)) return;

            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                const token = await getToken(messaging, {
                    vapidKey: 'BLz4JpUCuDvqjLLO3aBOijWOZ3JripPe1mHXj27C3-Md-vZrnhA8aG7uxV7jCpcSDV6TYzGEfvjXrQTeORqDULA'
                });
                if (token) {
                    await updateFcmToken(token);
                }
            }
        } catch (error) {
            console.warn('Push notification registration failed:', error);
        }
    };

    useEffect(() => {
        if (currentUser && userProfile && userProfile.role !== 'doctor') {
            registerNotifications();
        }
    }, [currentUser, userProfile?.role]);

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}
