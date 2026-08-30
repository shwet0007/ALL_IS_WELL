import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

interface Config {
    port: number;
    nodeEnv: string;
    groqApiKey: string;
    sarvamApiKey: string;
    firebaseServiceAccountPath: string;
    allowedOrigins: string[];
}

const getEnvVar = (key: string, defaultValue?: string): string => {
    const value = process.env[key] || defaultValue;
    if (!value) {
        throw new Error(`Missing required environment variable: ${key}`);
    }
    return value;
};

export const config: Config = {
    port: parseInt(process.env.PORT || '3001', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
    groqApiKey: getEnvVar('GROQ_API_KEY'),
    sarvamApiKey: getEnvVar('SARVAM_API_KEY'),
    firebaseServiceAccountPath: path.resolve(
        process.cwd(),
        getEnvVar('FIREBASE_SERVICE_ACCOUNT_PATH', '../aal-is-well-2a625-firebase-adminsdk-fbsvc-5878f386ec.json')
    ),
    allowedOrigins: (process.env.ALLOWED_ORIGINS || 'http://localhost:5173').split(','),
};
