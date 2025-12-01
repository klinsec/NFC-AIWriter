import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateNfcContent = async (prompt: string): Promise<{
    type: 'text' | 'json' | 'url';
    content: string;
    explanation: string;
}> => {
  try {
    const model = 'gemini-2.5-flash';
    const systemInstruction = `
      You are an expert in NFC technology and NDEF records. 
      Your goal is to interpret a user's request and generate the specific string or JSON content 
      that should be written to an NFC tag to accomplish their goal.

      Examples:
      User: "Make a tag that connects to WiFi 'Home' with password '1234'"
      Output Content: WIFI:T:WPA;S:Home;P:1234;;

      User: "Open instagram for user 'elonmusk'"
      Output Content: https://instagram.com/elonmusk

      User: "A vcard for John Doe, phone 555-0199"
      Output Content: BEGIN:VCARD\nVERSION:2.1\nN:Doe;John\nTEL;home:555-0199\nEND:VCARD
    `;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            type: {
              type: Type.STRING,
              enum: ["text", "json", "url"],
              description: "The type of the NFC record",
            },
            content: {
              type: Type.STRING,
              description: "The actual string content to write to the tag",
            },
            explanation: {
              type: Type.STRING,
              description: "A very short explanation of what this tag will do",
            },
          },
          required: ["type", "content", "explanation"],
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");

    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini Error:", error);
    throw new Error("Failed to generate NFC content.");
  }
};