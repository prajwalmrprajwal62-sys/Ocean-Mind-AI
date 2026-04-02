import { GoogleGenAI, Type } from "@google/genai";
import { getGeminiApiKey } from '../lib/env';

const getAI = () => {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    throw new Error('Missing GEMINI_API_KEY. Add it to .env or .env.local and restart the app.');
  }

  return new GoogleGenAI({ apiKey });
};

export const analyzeMarineImage = async (base64Image: string) => {
  const ai = getAI();
  const model = ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: [
      {
        parts: [
          { text: `Analyze this marine/coastal image for pollution. 
          Identify:
          1. Type: (Plastic litter, fishing gear, oil spill, natural debris, or other)
          2. Severity: (Low: 1-10 items, Medium: 11-50 items or near sensitive zone, High: 50+ items or toxic/chemical)
          3. Confidence: (0-100 percentage)
          4. Quantity Estimate: (Approximate number of items)
          5. Description: (Brief 1-line summary)
          
          Return a JSON object with these keys: type, severity, confidence, quantity, description.` },
          { inlineData: { mimeType: "image/jpeg", data: base64Image } }
        ]
      }
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          type: { type: Type.STRING },
          severity: { type: Type.STRING },
          confidence: { type: Type.NUMBER },
          quantity: { type: Type.STRING },
          description: { type: Type.STRING }
        },
        required: ["type", "severity", "confidence", "quantity", "description"]
      }
    }
  });

  const response = await model;
  return JSON.parse(response.text || "{}");
};

export const analyzeMarineWildlife = async (base64Image: string) => {
  const ai = getAI();
  const model = ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: [
      {
        parts: [
          { text: `Identify the marine species in this image and assess its condition (Healthy, Injured, Entangled, Stranded, Deceased). 
          Identify the animal type (Turtle, Mammal, Fish, Bird, Other). 
          Provide a brief description of the situation.
          
          Return a JSON object with these keys: species, condition, animalType, confidence, description.` },
          { inlineData: { mimeType: "image/jpeg", data: base64Image } }
        ]
      }
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          species: { type: Type.STRING },
          condition: { type: Type.STRING },
          animalType: { type: Type.STRING },
          confidence: { type: Type.NUMBER },
          description: { type: Type.STRING }
        },
        required: ["species", "condition", "animalType", "confidence", "description"]
      }
    }
  });

  const response = await model;
  return JSON.parse(response.text || "{}");
};

export const getOceanMindAdvice = async (userStats: any) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-3.1-flash-lite-preview",
    contents: `Based on these user stats: ${JSON.stringify(userStats)}, give 3 concrete, low-friction suggestions to improve their marine impact score. Keep it short and encouraging.`,
  });
  return response.text;
};

export const computePersonalImpactScore = (wasteLogs: any[], reports: any[]) => {
  let score = 70; // Base score
  
  // Waste impact
  const recentLogs = wasteLogs.slice(-7);
  recentLogs.forEach(log => {
    if (log.plasticCount > 5) score -= 2;
    if (log.recycledCount > 2) score += 3;
  });

  // Reporting impact
  score += reports.length * 5;

  return Math.min(100, Math.max(0, score));
};

export const computeRegionScores = (reports: any[]) => {
  const pollutionCount = reports.filter(r => r.type === 'pollution').length;
  const biodiversityCount = reports.filter(r => r.type === 'biodiversity').length;
  
  const pollutionIndex = Math.min(100, pollutionCount * 10);
  const biodiversityRisk = Math.max(0, 100 - (biodiversityCount * 15));
  const coastalHealthScore = Math.max(0, 100 - (pollutionIndex * 0.6) - (biodiversityRisk * 0.4));

  return {
    pollutionIndex,
    biodiversityRisk,
    coastalHealthScore
  };
};
