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
    mongoUri: string;
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
        getEnvVar('FIREBASE_SERVICE_ACCOUNT_PATH', './service-account.json')
    ),
    allowedOrigins: (process.env.ALLOWED_ORIGINS || 'http://localhost:5173,http://localhost:8080,http://localhost:8081').split(','),
    mongoUri: getEnvVar('MONGODB_URI', 'mongodb://localhost:27017/aal-is-well'),
};
