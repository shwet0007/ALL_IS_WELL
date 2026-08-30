import admin from 'firebase-admin';
import { config } from './env';

// Initialize Firebase Admin SDK
const serviceAccount = require(config.firebaseServiceAccountPath);

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

export const auth = admin.auth();
export const db = admin.firestore();
export const storage = admin.storage();

export default admin;
