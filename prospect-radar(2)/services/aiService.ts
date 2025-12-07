
import { GoogleGenAI } from "@google/genai";
import { IntelResult, SkillRatings, IntelStats } from "../types";

// Initialize Gemini Client
// Note: In a real production app, API calls should be proxied through a backend to hide the key.
// For this single-file/demo architecture, we assume process.env.API_KEY is injected by the environment.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Default skills to fallback if parsing fails partially
const DEFAULT_SKILLS_FALLBACK: SkillRatings = {
  Skating: 50,
  Shooting: 50,
  Hands: 50,
  Passing: 50,
  Physicality: 50,
  IQ: 50,
  Defense: 50,
  Compete: 50
};

export const fetchPlayerIntel = async (name: string, league: string, country: string): Promise<IntelResult> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Perform a google search for the latest scouting reports, recent game performance stats, and news for ice hockey player "${name}" playing in the ${league} (${country}).
      
      I need you to extract data into a structured format AND provide a text summary.

      1. First, provide a comprehensive summary (max 300 words) covering:
         - Recent performance trends (last 5-10 games).
         - Notable strengths and weaknesses.
         - Draft stock movement.
      
      2. Then, at the very end of your response, strictly output a JSON code block (wrapped in \`\`\`json ... \`\`\`) containing:
         - "stats": The player's current season total GP, G, A, P (if found).
         - "skills": Estimated scouting grades (20-80 scale) for [Skating, Shooting, Hands, Passing, Physicality, IQ, Defense, Compete] based on the reports read. Be realistic. 50 is average, 80 is elite.

      The JSON block must look like this:
      {
        "stats": { "GP": 0, "G": 0, "A": 0, "P": 0 },
        "skills": { "Skating": 50, "Shooting": 50, "Hands": 50, "Passing": 50, "Physicality": 50, "IQ": 50, "Defense": 50, "Compete": 50 }
      }
      `,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const fullText = response.text || "No recent information found.";
    
    // Extract grounding sources
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources = chunks
      .map((c: any) => c.web ? { title: c.web.title, uri: c.web.uri } : null)
      .filter((s: any) => s !== null);

    // Parse JSON Block
    let suggestedSkills: SkillRatings | undefined;
    let foundStats: IntelStats | undefined;

    const jsonMatch = fullText.match(/```json\n([\s\S]*?)\n```/) || fullText.match(/```\n([\s\S]*?)\n```/);
    
    if (jsonMatch && jsonMatch[1]) {
        try {
            const data = JSON.parse(jsonMatch[1]);
            if (data.skills) suggestedSkills = { ...DEFAULT_SKILLS_FALLBACK, ...data.skills };
            if (data.stats) foundStats = data.stats;
        } catch (e) {
            console.warn("Failed to parse AI JSON block", e);
        }
    }

    // Clean text by removing the JSON block for display
    const cleanText = fullText.replace(/```json[\s\S]*```/, '').replace(/```[\s\S]*```/, '').trim();

    return { 
        text: cleanText, 
        sources, 
        suggestedSkills, 
        foundStats 
    };

  } catch (err) {
    console.error("AI Intel Error:", err);
    throw new Error("Failed to retrieve AI Intel. Please check your API key or connection.");
  }
};
