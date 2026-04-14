import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = "AIzaSyCesDni8dIbRNEEpnoqb0NeGjQMb8ndj-8";
const genAI = new GoogleGenerativeAI(API_KEY);

async function listModels() {
  try {
    console.log("Fetching models...");
    // The SDK doesn't have a direct listModels, we have to use the REST API via fetch or similar
    // Or try a few variations to see what works
    const models = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-pro", "gemini-1.5-flash-latest"];
    
    for (const m of models) {
      try {
        const model = genAI.getGenerativeModel({ model: m });
        const result = await model.generateContent("test");
        console.log(`✓ Model "${m}" is AVAILABLE`);
      } catch (e) {
        console.log(`✗ Model "${m}" is NOT available: ${e.message}`);
      }
    }
  } catch (error) {
    console.error("ListModels failed:", error);
  }
}

listModels();
