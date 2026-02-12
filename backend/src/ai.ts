import { GoogleGenAI, Schema, Type } from "@google/genai";
import { z } from "zod";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const aiResponseSchema = z.object({
  category: z.enum(["BILLING", "TECHNICAL", "FEATURE_REQUEST"]),
  sentiment: z.number().min(1).max(10),
  urgency: z.enum(["HIGH", "MEDIUM", "LOW"]),
  draft: z.string(),
});

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
      model: "gemini-3-flash-preview",
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

                **Handling Edge Cases & Ambiguity:**
                1. **Spam/Gibberish/Unclear**: If the input is nonsense, spam, or too vague to classify, set Category="TECHNICAL", Urgency="LOW", and draft a polite response asking for clarification.
                2. **Mixed Intent**: If the ticket covers multiple topics (e.g. bug + billing), prioritize the **highest urgency** issue. (e.g. Blocking Bug > Minor Refund).
                3. **Safety**: Do not generate harmful content. If the user is abusive, remain professional and neutral.

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

    const rawJson = JSON.parse(response.text || "{}");
    return aiResponseSchema.parse(rawJson);
  } catch (error: any) {
    console.error(
      "Error generating AI response:",
      JSON.stringify(error, null, 2),
    );
    throw error;
  }
}
