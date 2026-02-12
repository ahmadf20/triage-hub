const { GoogleGenAI } = require("@google/genai");
require("dotenv").config();

async function listModels() {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  try {
    const response = await ai.models.list();
    console.log("Available models (iterating):");
    for await (const model of response) {
      console.log(`- ${model.name}`);
    }
  } catch (error) {
    console.error("Error listing models:", error);
  }
}

listModels();
