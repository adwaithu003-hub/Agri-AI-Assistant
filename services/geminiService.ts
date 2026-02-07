
import { GoogleGenAI, Type } from "@google/genai";

export const analyzePlantDisease = async (base64Image: string, userQuery?: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const promptText = `
    You are an advanced agricultural intelligence system. Analyze the provided plant image.
    
    Task:
    1. Identify the plant (Common and Scientific name).
    2. Diagnose the Disease, Pest, or Nutrient Deficiency.
    3. Assess Severity and Health Score.
    4. List detailed Symptoms.
    5. List Prevention methods.
    6. Recommend specific Organic treatments.
    7. Recommend specific Chemical treatments (include active ingredients or common product names).

    ${userQuery ? `User specifically asked: "${userQuery}"` : ''}

    Provide the output in the following STRICT template:
    
    PLANT_NAME: [Common Name] ([Scientific Name])
    DIAGNOSIS: [Disease/Deficiency Name]
    SEVERITY: [High / Medium / Low]
    HEALTH_SCORE: [0-100]
    
    SYMPTOMS:
    - [Symptom 1]
    - [Symptom 2]
    
    PREVENTION:
    - [Prevention 1]
    - [Prevention 2]
    
    ORGANIC_TREATMENT:
    - [Organic 1]
    - [Organic 2]
    
    CHEMICAL_TREATMENT:
    - [Chemical 1]
    - [Chemical 2]
    
    IMPORTANT: Do not use markdown formatting like ** or ###. Use plain text lists with hyphens (-).
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
        { text: promptText }
      ]
    }
  });
  return response.text;
};

export const analyzeNutrientDeficiency = async (base64Image: string, additionalContext?: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const promptText = `
    You are an agricultural intelligence system specialized in plant nutrient analysis. 
    Analyze the provided plant leaf/stem image and based on any provided context to identify possible nutrient deficiencies based on visual symptoms.

    Context Provided by User: "${additionalContext || 'None provided'}"

    Examine characteristics such as leaf color variation, interveinal chlorosis, edge scorching, spots, vein discoloration, leaf deformation, and growth patterns.

    Determine the most likely nutrient deficiency among the following: Nitrogen (N), Phosphorus (P), Potassium (K), Magnesium (Mg), Iron (Fe), or indicate No visible deficiency if the leaf appears healthy.

    Estimate the severity level of the detected deficiency as Low, Moderate, or High based on the extent of affected leaf area.

    If additional context such as soil test data or plant growth stage is provided, use it to improve diagnostic accuracy.

    Provide the output in the following STRICT format:

    Detected Nutrient Deficiency: [Name or "No visible deficiency"]

    Severity Level: [Low/Moderate/High]

    Health Score: [0-100]

    Visual Indicators Observed:
    - [Symptom 1]
    - [Symptom 2]

    Recommended Corrective Measures:
    - [Measure 1]
    - [Measure 2]

    IMPORTANT: Do not use markdown formatting like ** or ###. Keep the format clean and consistent with the template above.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
        { text: promptText }
      ]
    }
  });
  return response.text;
};

export const answerDiseaseDoubt = async (question: string, currentContext?: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `You are the FloraGuard Plant Expert. 
    ${currentContext ? `Context of diagnosis: ${currentContext}` : ''}
    User Question: "${question}"
    
    Provide a helpful, scientific, yet easy-to-understand answer. 
    IMPORTANT: Do NOT use markdown stars (**), hashes (###). Use plain text.`
  });
  return response.text;
};

export const translateText = async (text: string, targetLanguage: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Translate the following agricultural advice into ${targetLanguage}. 
    Ensure the translation is accurate, uses common agricultural terminology for that language, and maintains a helpful tone.
    Do NOT use markdown stars (**).
    
    Text to translate: "${text}"`
  });
  return response.text;
};

export const translateAnalysis = async (text: string, targetLanguage: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Translate the content of this agricultural report to ${targetLanguage}.
    CRITICAL INSTRUCTION: You must KEEP all the structural headers and labels in ENGLISH exactly as they are in the original text. Only translate the descriptive content/values.
    
    Headers to keep in English (if present): 
    - PLANT_NAME:
    - DIAGNOSIS:
    - SEVERITY:
    - HEALTH_SCORE:
    - SYMPTOMS:
    - PREVENTION:
    - ORGANIC_TREATMENT:
    - CHEMICAL_TREATMENT:
    - Detected Nutrient Deficiency:
    - Severity Level:
    - Health Score:
    - Visual Indicators Observed:
    - Recommended Corrective Measures:

    Original Text:
    "${text}"`
  });
  return response.text;
};

export const analyzeSoil = async (reportText: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Based on this soil report text: "${reportText}", recommend 3-5 crops that would give the best yield. Explain why for each crop and provide basic planting tips. Do NOT use markdown stars or hashes.`
  });
  return response.text;
};

export const analyzeSoilImage = async (base64Image: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
        { 
          text: `Extract the soil parameters (pH, Nitrogen, Phosphorus, Potassium, etc.) from this report image. 
          Based on these values, recommend 3-5 crops that would give the best yield in this soil. 
          Explain why for each crop and provide basic planting tips. 
          IMPORTANT: Do NOT use markdown stars (**) or hashes (###). Use plain, clean text only.`
        }
      ]
    }
  });
  return response.text;
};

export const getGardenCareGuide = async (plantName: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Provide a comprehensive garden care guide for "${plantName}". Include:
    1. Ideal potting mixture ratio
    2. Watering requirements (frequency and amount)
    3. Sunlight needs
    4. Flowering season
    5. Possible diseases and pest attacks
    6. Fertilizer schedule (time period and type)
    Format the output with clear headings. Do NOT use markdown stars or hashes.`
  });
  return response.text;
};

export const chatWithAI = async (message: string, history: { role: 'user' | 'model', parts: { text: string }[] }[]) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const chat = ai.chats.create({
    model: 'gemini-3-flash-preview',
    history: history,
    config: {
      systemInstruction: "You are AgriIntel, an expert agricultural and gardening assistant. Provide helpful, accurate, and concise advice. Do NOT use markdown stars (**), hashes (###), or other symbols. Chat like a friendly WhatsApp assistant."
    }
  });
  
  const response = await chat.sendMessage({ message });
  return response.text;
};

export const predictWeatherHazards = async (temp: number, humidity: number, condition: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Current weather: Temperature ${temp}°C, Humidity ${humidity}%, Condition: ${condition}. 
    Based on this data, assess the risks of Flood, Drought, or Cyclone in the region. Do NOT use markdown stars or hashes.`
  });
  return response.text;
};

export const detectWildAnimals = async (base64Image: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
        { 
          text: `Identify if there are any wild animals in this image that could harm a crop field (e.g. Elephant, Wild Boar, Tiger, Deer, Monkey). 
          If found, return exactly: "ALERT: [Animal Name] detected!". 
          If no harmful wild animals are found, return: "Status: Clear". 
          Provide a very brief explanation (1 sentence) of the threat level if an animal is found.`
        }
      ]
    }
  });
  return response.text;
};
