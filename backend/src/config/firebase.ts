import admin from 'firebase-admin';
import { config } from './env';

// Initialize Firebase Admin SDK
let serviceAccount;

try {
    serviceAccount = require(config.firebaseServiceAccountPath);
} catch (error) {
    console.warn("Firebase Service Account file not found at:", config.firebaseServiceAccountPath);
    console.warn("Attempting to use Environment Variables or Application Default Credentials...");
}

const firebaseConfig = serviceAccount ? {
    credential: admin.credential.cert(serviceAccount)
} : {
    credential: admin.credential.applicationDefault()
};

try {
    admin.initializeApp(firebaseConfig);
} catch (e) {
    console.error("Firebase Initialization Failed:", e);
}

export const auth = admin.auth();

export const storage = admin.storage();

export default admin;
