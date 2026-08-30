import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const API_KEY = process.env.VITE_GEMINI_API_KEY;

const genAI = new GoogleGenerativeAI(API_KEY);

async function main() {
    try {
        // This is a workaround if listModels isn't directly exposed on the main class in older docs, 
        // but in newer SDKs generally:
        // Actually typically one makes a fetch request or uses the experimental 'model' or 'listModels' if available.
        // Let's try to just use valid fetch since we have the key.

        // The endpoint: https://generativelanguage.googleapis.com/v1beta/models?key=API_KEY
        const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.models) {
            console.log("AVAILABLE MODELS:");
            // Write to file to avoid encoding issues
            const fs = await import('fs');
            fs.writeFileSync('models.json', JSON.stringify(data.models, null, 2));
            data.models.forEach(m => console.log(m.name));
        } else {
            console.log("ERROR LISTING MODELS:", JSON.stringify(data, null, 2));
        }

    } catch (error) {
        console.error("Fatal error:", error);
    }
}

main();
