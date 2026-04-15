const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function listModels() {
    try {
        // For listing models, we don't need a specific model instance.
        // Actually, the SDK doesn't have a direct 'listModels' on the main class in all versions.
        // But we can try to instantiate a model and see if it works, or just try a standard one.

        // Instead of listing (which might require different scopes), let's just try to generate content with a few common model names.
        const candidates = ["gemini-1.5-flash", "gemini-pro", "gemini-1.0-pro", "models/gemini-1.5-flash-latest"];

        for (const modelName of candidates) {
            console.log(`Testing model: ${modelName}...`);
            try {
                const model = genAI.getGenerativeModel({ model: modelName });
                const result = await model.generateContent("Hello");
                const response = await result.response;
                console.log(`✅ SUCCESS: ${modelName} works! Response: ${response.text()}`);
                return; // Found a working one
            } catch (error) {
                console.log(`❌ FAILED: ${modelName} - ${error.message}`);
            }
        }
    } catch (error) {
        console.error("Critical Error", error);
    }
}

listModels();