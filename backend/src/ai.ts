import { GoogleGenAI, Schema, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const schema: Schema = {
  type: Type.OBJECT,
  properties: {
    category: {
      type: Type.STRING,
      title: "Category",
      enum: ["BILLING", "TECHNICAL", "FEATURE_REQUEST"],
      description: "The category of the ticket",
    },
    sentiment: {
      type: Type.INTEGER,
      title: "Sentiment",
      description: "Score from 1 (angry) to 10 (happy)",
      minimum: 1,
      maximum: 10,
    },
    urgency: {
      type: Type.STRING,
      title: "Urgency",
      enum: ["HIGH", "MEDIUM", "LOW"],
      description: "The urgency of the ticket",
    },
    draft: {
      type: Type.STRING,
      title: "Draft",
      description: "The draft response to the ticket",
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
      model: "gemini-2.5-pro",

      contents: [
        {
          role: "user",
          parts: [
            {
              text: `
                You are an expert customer support triage AI.
                Analyze the ticket content and extract the following:
                - Category: BILLING, TECHNICAL, or FEATURE_REQUEST.
                - Urgency: HIGH (blocking/critical impact), MEDIUM (standard issue/disturbing), LOW (minor/cosmetic/question).
                - Sentiment: 1 to 10 scale.
                  - 1-2: Angry, hostile, threatening.
                  - 3-5: Frustrated, annoyed, negative.
                  - 6-7: Neutral, factual.
                  - 8-10: Happy, grateful, praising.
                - Draft: A helpful, empathetic, and professional response draft.

                Examples:
                Input: "I love this tool! It saved me so much time. Just wondering if you have a dark mode?"
                Output: {"category": "FEATURE_REQUEST", "urgency": "LOW", "sentiment": 9, "draft": "..."}

                Input: "I can't log in and I have a presentation in 10 minutes! Fix this NOW!"
                Output: {"category": "TECHNICAL", "urgency": "HIGH", "sentiment": 1, "draft": "..."}

                Input: "How do I update my credit card?"
                Output: {"category": "BILLING", "urgency": "LOW", "sentiment": 6, "draft": "..."}
                      
                Analyze the following customer ticket:\n\n"${content}"`,
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
