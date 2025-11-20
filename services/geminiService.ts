
import { GoogleGenAI } from "@google/genai";

// Initialize the client with the API key directly from the environment variable as per guidelines.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateWittyEulogy = async (name: string, cause: string): Promise<string> => {
  if (!process.env.API_KEY) {
    return `Here lies ${name}. They died of ${cause}. The AI is offline, so insert your own joke here.`;
  }

  try {
    const prompt = `
      Write a very short, witty, cynical, and slightly dark humorous eulogy for "${name}" who died from "${cause}".
      The tone should be like a 8-bit RPG NPC or a bored funeral director.
      Maximum 50 words. Do not be overly offensive, just satirical.
      If the cause is abstract (e.g. "My motivation"), personify it.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "Rest in Peace. Words fail us, literally.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "The spirits are silent today (API Error). Rest in peace anyway.";
  }
};

export const generateTombstoneInscription = async (): Promise<string> => {
    if (!process.env.API_KEY) return "404: Life Not Found.";

    try {
        const prompt = "Write a funny, 10-word maximum epitaph for a random gravestone in a pixel art game.";
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text || "Here lies a bug.";
    } catch (e) {
        return "Connection to the afterlife timed out.";
    }
}
