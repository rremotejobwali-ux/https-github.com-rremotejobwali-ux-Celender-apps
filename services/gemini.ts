import { GoogleGenAI, Type } from "@google/genai";
import { AIParseResult } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const parseNaturalLanguageEvent = async (input: string, referenceDate: Date): Promise<AIParseResult> => {
  if (!apiKey) {
    console.warn("No API Key provided for Gemini");
    return null;
  }

  try {
    const prompt = `
      Current Reference Date: ${referenceDate.toISOString()} (${referenceDate.toLocaleString()})
      User Input: "${input}"
      
      Extract the event details from the user input relative to the reference date.
      If no specific time is given, assume a default duration of 1 hour.
      If 'tomorrow' or 'next friday' is used, calculate the exact ISO date based on the reference date.
      Return the result in JSON format.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: "Short title of the event" },
            start: { type: Type.STRING, description: "ISO 8601 Start Date Time" },
            end: { type: Type.STRING, description: "ISO 8601 End Date Time" },
            description: { type: Type.STRING, description: "Additional details if any" },
            location: { type: Type.STRING, description: "Location if specified" },
          },
          required: ["title", "start", "end"],
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as AIParseResult;
    }
    return null;

  } catch (error) {
    console.error("Error parsing event with Gemini:", error);
    return null;
  }
};