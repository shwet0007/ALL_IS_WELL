import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const API_KEY = process.env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
    console.error("No API key found in env");
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(API_KEY);

async function listModels() {
    try {
        // For listing models, we might need a different method or just try to generate content with a known fallback
        // The SDK typically exposes a way to get model info, but let's just try to hit the API directly if SDK doesn't expose list easily in this version
        // Actually SDK has default export commonly. 
        // Let's try to just run a generation with a few common names and see which one succeeds.

        const modelsToTry = [
            "gemini-1.5-flash",
            "gemini-1.5-flash-001",
            "gemini-1.5-pro",
            "gemini-pro",
            "gemini-1.0-pro",
            "gemini-1.0-pro-latest"
        ];

        for (const modelName of modelsToTry) {
            console.log(`Testing model: ${modelName}...`);
            try {
                const model = genAI.getGenerativeModel({ model: modelName });
                const result = await model.generateContent("Hello");
                console.log(`SUCCESS: ${modelName} works!`);
                console.log(result.response.text());
                return;
            } catch (e) {
                console.log(`FAILED: ${modelName} - ${e.message.split('\n')[0]}`);
            }
        }
    } catch (error) {
        console.error("Fatal error:", error);
    }
}

listModels();
