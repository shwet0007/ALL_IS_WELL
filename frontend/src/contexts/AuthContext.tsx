import React, { createContext, useContext, useEffect, useState } from 'react';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    signOut,
    onAuthStateChanged,
    User
} from 'firebase/auth';
import { auth, googleProvider, messaging } from '@/lib/firebase';
import { getToken } from 'firebase/messaging';
import { getUserProfile, UserProfile, updateFcmToken } from '@/lib/db';

interface AuthContextType {
    currentUser: User | null;
    userProfile: UserProfile | null;
    loading: boolean;
    signup: (email: string, password: string) => Promise<any>;
    login: (email: string, password: string) => Promise<any>;
    loginWithGoogle: () => Promise<any>;
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
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    function signup(email: string, password: string) {
        return createUserWithEmailAndPassword(auth, email, password);
    }

    function login(email: string, password: string) {
        return signInWithEmailAndPassword(auth, email, password);
    }

    function loginWithGoogle() {
        return signInWithPopup(auth, googleProvider);
    }

    function logout() {
        return signOut(auth);
    }

    async function refreshProfile() {
        if (currentUser) {
            try {
                const profile = await getUserProfile(currentUser.uid);
                setUserProfile(profile);
            } catch (error) {
                console.error("Error refreshing profile:", error);
            }
        }
    }

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            console.log("Auth State Changed:", user ? user.uid : "No User");
            setLoading(true); // Start loading while we fetch profile
            setCurrentUser(user);

            if (user) {
                try {
                    console.log("Fetching profile for:", user.uid);
                    const profile = await getUserProfile(user.uid);
                    console.log("Profile fetched:", profile);
                    setUserProfile(profile);
                } catch (error) {
                    console.error("Error fetching profile:", error);
                    setUserProfile(null);
                }
            } else {
                setUserProfile(null);
            }
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const value = {
        currentUser,
        userProfile,
        loading,
        signup,
        login,
        loginWithGoogle,
        logout,
        refreshProfile
    };

    // Request Notification Permission and register FCM
    const registerNotifications = async () => {
        if (!currentUser) return;
        try {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                const token = await getToken(messaging, {
                    vapidKey: 'BLz4JpUCuDvqjLLO3aBOijWOZ3JripPe1mHXj27C3-Md-vZrnhA8aG7uxV7jCpcSDV6TYzGEfvjXrQTeORqDULA'
                });
                if (token) {
                    console.log('✅ FCM Token generated:', token);
                    await updateFcmToken(token);
                    console.log('✅ FCM Token saved to backend');
                } else {
                    console.warn('⚠️ No FCM token received. Check Firebase Cloud Messaging configuration.');
                }
            } else {
                console.log('ℹ️ Notification permission denied by user');
            }
        } catch (error: any) {
            // Don't show error for FCM configuration issues - it's optional
            if (error?.code === 'messaging/token-subscribe-failed') {
                console.warn('⚠️ FCM not configured. To enable push notifications:');
                console.warn('1. Go to Firebase Console → Project Settings → Cloud Messaging');
                console.warn('2. Enable Cloud Messaging API in Google Cloud Console');
                console.warn('3. The app will work fine without push notifications');
            } else {
                console.error('Error registering notifications:', error);
            }
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
