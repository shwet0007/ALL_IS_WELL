import { initializeApp, type FirebaseApp } from "firebase/app";
import { getStorage, type FirebaseStorage } from "firebase/storage";
import { getMessaging, isSupported, type Messaging } from "firebase/messaging";

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const hasFirebaseConfig = Object.values(firebaseConfig).every(Boolean);

function initializeFirebaseApp(): FirebaseApp | null {
    if (!hasFirebaseConfig) return null;

    try {
        return initializeApp(firebaseConfig);
    } catch (error) {
        console.warn("Firebase client initialization failed:", error);
        return null;
    }
}

export const app = initializeFirebaseApp();
export const storage: FirebaseStorage | null = app ? getStorage(app) : null;

export async function getFirebaseMessaging(): Promise<Messaging | null> {
    if (!app) return null;

    const supported = await isSupported().catch(() => false);
    return supported ? getMessaging(app) : null;
}
