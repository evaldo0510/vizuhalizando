
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult } from "../types";

const analysisSchema: any = {
  type: Type.OBJECT,
  properties: {
    quality_check: {
      type: Type.OBJECT,
      properties: {
        valid: { type: Type.BOOLEAN },
        reason: { type: Type.STRING },
        accuracy_estimate: { type: Type.INTEGER }
      },
      required: ["valid", "accuracy_estimate"]
    },
    genero: { type: Type.STRING, enum: ["Masculino", "Feminino"] },
    formato_rosto_detalhado: { type: Type.STRING, enum: ['Oval', 'Redondo', 'Quadrado', 'Retangular', 'Triangular', 'Triângulo Invertido', 'Hexagonal', 'Coração'] },
    biotipo: { type: Type.STRING },
    analise_facial: { type: Type.STRING },
    analise_pele: { type: Type.STRING },
    tom_pele_detectado: { type: Type.STRING, enum: ['Quente', 'Frio', 'Neutro', 'Oliva'] },
    analise_corporal: { type: Type.STRING },
    paleta_cores: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          hex: { type: Type.STRING },
          nome: { type: Type.STRING }
        }
      }
    },
    visagismo: {
      type: Type.OBJECT,
      properties: {
        cabelo: { type: Type.OBJECT, properties: { estilo: { type: Type.STRING }, detalhes: { type: Type.STRING }, motivo: { type: Type.STRING } } },
        barba_ou_make: { type: Type.OBJECT, properties: { estilo: { type: Type.STRING }, detalhes: { type: Type.STRING }, motivo: { type: Type.STRING } } },
        acessorios: { type: Type.ARRAY, items: { type: Type.STRING } }
      }
    },
    otica: {
      type: Type.OBJECT,
      properties: { armacao: { type: Type.STRING }, material: { type: Type.STRING }, detalhes: { type: Type.STRING }, motivo: { type: Type.STRING } }
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
        }
      }
    }
  },
  required: ['quality_check', 'genero', 'formato_rosto_detalhado', 'biotipo', 'analise_facial', 'paleta_cores', 'sugestoes_roupa']
};

export const analyzeImageWithGemini = async (
  base64Images: string[], 
  metrics: { height: string, weight: string },
  environment?: string,
  preferences?: any,
  userId?: string
): Promise<AnalysisResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const mainImage = base64Images[0].includes(',') ? base64Images[0].split(',')[1] : base64Images[0];

  const prompt = `Atue como um consultor de visagismo de luxo e mestre em colorimetria.
  Dados Biométricos: Altura ${metrics.height}m, Peso ${metrics.weight}kg.
  Contexto: ${environment || 'Geral'}.
  
  TAREFAS:
  1. Analise tecnicamente a estrutura óssea facial e o biotipo corporal.
  2. Determine o subtom de pele exato. 
  3. REGRA CROMÁTICA: Na paleta de cores, os nomes das cores devem seguir o padrão: "Nome da Cor (By Teodoro)".
  4. Sugira exatamente 10 looks completos e luxuosos.
  
  Retorne em JSON. SEJA INSTANTÂNEO.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        { text: prompt },
        { inlineData: { mimeType: 'image/jpeg', data: mainImage } }
      ]
    },
    config: {
      responseMimeType: 'application/json',
      responseSchema: analysisSchema,
      thinkingConfig: { thinkingBudget: 0 } // Velocidade máxima sem delays de raciocínio
    }
  });

  if (response.text) {
    const data = JSON.parse(response.text);
    return {
        ...data,
        id: crypto.randomUUID(),
        date: new Date().toISOString()
    } as AnalysisResult;
  }
  throw new Error("Erro na consultoria técnica.");
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
  const lookDetails = `${title}: ${details}. ${context}. ${extra}`;

  const masterPrompt = `
    ULTRA-REALISTIC PHOTOREALISTIC FASHION RENDER (8K):
    Subject MUST have the EXACT facial features and eyes as the provided image.
    Dynamic model pose, high-luxury tailoring for: ${lookDetails}.
    Luxury Studio environment, Cinematic lighting, Phase One XF quality.
    NO DISTORTIONS, NATURAL TEXTURES.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        { text: masterPrompt },
        { inlineData: { mimeType: 'image/jpeg', data: cleanBase64 } }
      ]
    },
    config: {
        imageConfig: { aspectRatio: "3:4" }
    }
  });

  const part = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
  if (part?.inlineData) {
    return part.inlineData.data;
  }
  throw new Error("Falha ao esculpir a imagem editorial.");
};
