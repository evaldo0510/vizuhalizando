
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { AnalysisResult } from "../types";

const analysisSchema = {
  type: Type.OBJECT,
  properties: {
    quality_check: {
      type: Type.OBJECT,
      properties: {
        valid: { type: Type.BOOLEAN },
        reason: { type: Type.STRING },
        accuracy_estimate: { type: Type.INTEGER }
      },
      required: ["valid", "accuracy_estimate"],
      propertyOrdering: ["valid", "reason", "accuracy_estimate"]
    },
    genero: { type: Type.STRING },
    formato_rosto_detalhado: { type: Type.STRING },
    biotipo: { type: Type.STRING },
    analise_facial: { type: Type.STRING },
    analise_pele: { type: Type.STRING },
    tom_pele_detectado: { type: Type.STRING },
    analise_corporal: { type: Type.STRING },
    paleta_cores: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          hex: { type: Type.STRING },
          nome: { type: Type.STRING }
        },
        propertyOrdering: ["hex", "nome"]
      }
    },
    visagismo: {
      type: Type.OBJECT,
      properties: {
        cabelo: { 
          type: Type.OBJECT, 
          properties: { estilo: { type: Type.STRING }, detalhes: { type: Type.STRING }, motivo: { type: Type.STRING } },
          propertyOrdering: ["estilo", "detalhes", "motivo"]
        },
        barba_ou_make: { 
          type: Type.OBJECT, 
          properties: { estilo: { type: Type.STRING }, detalhes: { type: Type.STRING }, motivo: { type: Type.STRING } },
          propertyOrdering: ["estilo", "detalhes", "motivo"]
        },
        acessorios: { type: Type.ARRAY, items: { type: Type.STRING } }
      },
      propertyOrdering: ["cabelo", "barba_ou_make", "acessorios"]
    },
    otica: {
      type: Type.OBJECT,
      properties: { armacao: { type: Type.STRING }, material: { type: Type.STRING }, detalhes: { type: Type.STRING }, motivo: { type: Type.STRING } },
      propertyOrdering: ["armacao", "material", "detalhes", "motivo"]
    },
    sugestoes_roupa: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          titulo: { type: Type.STRING },
          detalhes: { type: Type.STRING },
          ocasiao: { type: Type.STRING },
          motivo: { type: Type.STRING },
          visagismo_sugerido: { type: Type.STRING },
          termos_busca: { type: Type.STRING }
        },
        propertyOrdering: ["titulo", "detalhes", "ocasiao", "motivo", "visagismo_sugerido", "termos_busca"]
      }
    }
  },
  required: ['quality_check', 'genero', 'formato_rosto_detalhado', 'biotipo', 'analise_facial', 'paleta_cores', 'sugestoes_roupa'],
  propertyOrdering: ['quality_check', 'genero', 'formato_rosto_detalhado', 'biotipo', 'analise_facial', 'analise_pele', 'tom_pele_detectado', 'analise_corporal', 'paleta_cores', 'visagismo', 'otica', 'sugestoes_roupa']
};

export const analyzeImageWithGemini = async (
  base64Images: string[], 
  metrics: { height: string, weight: string },
  environment?: string,
  preferences?: any,
  userId?: string,
  allowLowQuality: boolean = false
): Promise<AnalysisResult> => {
  // CRITICAL: Always create a fresh instance to use the most up-to-date API key
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const mainImage = base64Images[0].includes(',') ? base64Images[0].split(',')[1] : base64Images[0];

  const qualityInstruction = allowLowQuality 
    ? "A foto possui baixa qualidade. Utilize extrapolação neural para estimar proporções."
    : "A foto deve ser nítida para diagnóstico preciso.";

  const prompt = `Você é um Master Visagista de luxo. 
  Analise a imagem considerando: Altura: ${metrics.height}m, Peso: ${metrics.weight}kg.
  Objetivo: ${environment || 'Elegância e Harmonia'}.
  ${qualityInstruction}
  
  Retorne um diagnóstico em JSON seguindo o esquema fornecido.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: {
        parts: [
          { text: prompt },
          { inlineData: { mimeType: 'image/jpeg', data: mainImage } }
        ]
      },
      config: {
        responseMimeType: 'application/json',
        responseSchema: analysisSchema,
        temperature: 0.1,
        thinkingConfig: { thinkingBudget: 32768 }
      }
    });

    const text = response.text;
    if (!text) throw new Error("A API retornou uma resposta vazia.");
    return JSON.parse(text.trim()) as AnalysisResult;
  } catch (err: any) {
    console.error("Gemini Analysis Error Detail:", err);
    
    // Check for specific API Key invalidation from Google response
    if (err.message?.includes("API key not valid") || err.status === 400 || (err.details && JSON.stringify(err.details).includes("API_KEY_INVALID"))) {
        throw new Error("AUTH_INVALID_KEY");
    }
    
    throw err;
  }
};

export const generateVisualEdit = async (
  base64Image: string, 
  type: string, 
  title: string, 
  details: string, 
  context: string, 
  extra: string
): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const cleanBase64 = base64Image.includes(',') ? base64Image.split(',')[1] : base64Image;
  
  const prompt = `
    LUXURY PHOTOGRAPHY. PHOTO-REALISTIC.
    TASK: Wear this outfit: ${title}.
    DETAILS: ${details}.
    IDENTITY: Preserve face features 100% exactly as original.
    CONTEXT: ${context}.
  `;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { text: prompt },
          { inlineData: { mimeType: 'image/jpeg', data: cleanBase64 } }
        ]
      },
      config: {
        imageConfig: { aspectRatio: "3:4" }
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData?.data) {
        return part.inlineData.data;
      }
    }
    
    throw new Error("Falha na geração visual.");
  } catch (err: any) {
    if (err.message?.includes("API key not valid") || err.status === 400) {
        throw new Error("AUTH_INVALID_KEY");
    }
    throw err;
  }
};
