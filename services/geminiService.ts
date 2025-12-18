
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
  Dados Biométricos fornecidos pelo usuário: Altura ${metrics.height}m, Peso ${metrics.weight}kg.
  Contexto da consulta: ${environment || 'Geral'}.
  
  TAREFAS TÉCNICAS:
  1. Analise a imagem para identificar: Formato de Rosto, Biotipo Corporal (baseado em altura/peso e proporções visíveis) e Tom de Pele exato (Cromotipologia).
  2. Forneça uma análise detalhada sobre como o formato do rosto influencia a percepção da imagem do cliente.
  3. Crie uma paleta de 5 cores ideais, com nomes customizados usando a marca "By Teodoro" (ex: "Verde Esmeralda By Teodoro").
  4. Gere 10 sugestões de looks LUXUOSOS e completos que valorizem as características detectadas. 
  5. Para cada look, inclua uma justificativa visagista (motivo).
  
  IMPORTANTE: Se a imagem estiver embaçada, o campo quality_check.valid deve ser false, mas tente realizar uma extrapolação neural para os campos restantes.
  
  Retorne EXCLUSIVAMENTE em JSON seguindo o schema fornecido.`;

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
      responseSchema: analysisSchema
    }
  });

  if (response.text) {
    const data = JSON.parse(response.text);
    return data as AnalysisResult;
  }
  throw new Error("Falha na consultoria neural do Atelier.");
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
  const lookDetails = `${title}: ${details}. Contexto: ${context}. ${extra}`;

  // Prompt ultra-detalhado para o Gemini Flash Image garantir a semelhança facial
  const masterPrompt = `
    ULTRA-REALISTIC HIGH-FASHION EDITORIAL PHOTOGRAPHY (8K, Phase One XF).
    The person in the provided image MUST have their facial features, eyes, and expressions PRESERVED EXACTLY.
    TRANSFORM only the clothing and the environment.
    OUTFIT DESCRIPTION: ${lookDetails}.
    Maintain a luxury studio or high-end urban aesthetic. 
    Cinematic lighting, Rembrandt style. No skin artifacts.
    The resulting image must look like a professional brand campaign.
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
        imageConfig: { 
          aspectRatio: "3:4"
        }
    }
  });

  const part = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
  if (part?.inlineData) {
    return part.inlineData.data;
  }
  throw new Error("O Atelier não conseguiu esculpir a imagem editorial no momento.");
};
