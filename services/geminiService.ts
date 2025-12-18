 
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, StoreLocation } from "../types";

const analysisSchema: any = {
  type: Type.OBJECT,
  properties: {
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
  required: ['genero', 'formato_rosto_detalhado', 'biotipo', 'analise_facial', 'paleta_cores', 'sugestoes_roupa']
};

export const analyzeImageWithGemini = async (base64Image: string, metrics: { height: string, weight: string }): Promise<AnalysisResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `Atue como Teodoro, o mestre supremo de visagismo e consultoria de imagem para o mercado Triple-A.
  Dados Biométricos: Altura ${metrics.height}m, Peso ${metrics.weight}kg.
  
  TAREFAS:
  1. Analise tecnicamente a estrutura óssea facial e o biotipo corporal pela foto.
  2. Determine o subtom de pele exato para coloração pessoal.
  3. REGRA INVIOLÁVEL: Sugira exatamente 10 looks completos, variando entre Business Elite, Casual Luxo, Gala, e Weekend Avant-Garde.
  
  Retorne os dados estritamente no formato JSON para processamento sistêmico.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        { text: prompt },
        { inlineData: { mimeType: 'image/jpeg', data: base64Image.split(',')[1] } }
      ]
    },
    config: {
      responseMimeType: 'application/json',
      responseSchema: analysisSchema
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

export const editImageWithGemini = async (base64Image: string, lookDetails: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // O "CÓDIGO" DA IMAGEM PERFEITA (EDITORIAL MASTER PROMPT)
  const masterPrompt = `
    PHOTOREALISTIC FASHION EDITORIAL RENDER (8K):
    1. IDENTITY LOCK: The person in the output MUST have the EXACT same face, eyes, bone structure, and skin texture as the provided image. NO CHANGES TO THE SUBJECT'S IDENTITY.
    2. MODEL POSING: Place the subject in a professional editorial model pose (high-fashion stance, confident gaze, leaning or walking).
    3. THE ATTIRE: Render the person wearing a luxury, perfectly-tailored version of this outfit: ${lookDetails}. Fabrics must show high-end texture (crease-free wool, organic silk, fine leather).
    4. STUDIO SETTING: Place them in a minimalist luxury Milan studio with soft shadow depth or a Parisian street at dawn.
    5. LIGHTING: Cinematic Rembrandt lighting with soft bounce. Professional color grading (Vogue/Harper's Bazaar style).
    6. GEAR: Shot on Phase One XF, 80mm lens, ultra-sharp focus on the subject with creamy bokeh background.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        { text: masterPrompt },
        { inlineData: { mimeType: 'image/jpeg', data: base64Image.split(',')[1] } }
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
    return `data:image/png;base64,${part.inlineData.data}`;
  }
  throw new Error("Falha ao esculpir a imagem editorial.");
};