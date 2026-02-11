import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const schema = {
  type: "OBJECT",
  properties: {
    category: {
      type: "STRING",
      enum: ["BILLING", "TECHNICAL", "FEATURE_REQUEST"],
    },
    sentiment: {
      type: "INTEGER",
    },
    urgency: {
      type: "STRING",
      enum: ["HIGH", "MEDIUM", "LOW"],
    },
    draft: {
      type: "STRING",
    },
  },
  required: ["category", "sentiment", "urgency", "draft"],
};

export async function triageTicket(content: string) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not set");
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `Analyze the following customer ticket and provide triage data:\n\n"${content}"`,
            },
          ],
        },
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    });

    console.log("AI Response:", response.text);
    return JSON.parse(response.text || "{}");
  } catch (error: any) {
    console.error("Error calling Gemini API:", JSON.stringify(error, null, 2));
    throw error;
  }
}
