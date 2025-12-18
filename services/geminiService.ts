
import { GoogleGenAI, Type } from "@google/genai";
import { db } from "./database";
import type { AnalysisResult, UserPreferences, UserMetrics } from "../types";

const sanitizeInput = (text: string): string => {
    if (!text) return "";
    return text.replace(/[<>]/g, "").slice(0, 500);
};

/**
 * Cleans the string returned by Gemini to ensure it's valid JSON.
 * Removes markdown blocks (```json ... ```) and any leading/trailing whitespace.
 */
const cleanJsonString = (raw: string): string => {
  return raw.replace(/```json/g, "").replace(/```/g, "").trim();
};

export const resizeBase64Image = (base64Str: string, maxWidth: number = 768, quality: number = 0.85): Promise<string> => {
    return new Promise((resolve) => {
        if (typeof window === 'undefined') {
            resolve(base64Str);
            return;
        }
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = base64Str.startsWith('data:') ? base64Str : `data:image/jpeg;base64,${base64Str}`;
        img.onload = () => {
            let width = img.width;
            let height = img.height;
            if (width <= maxWidth) {
                resolve(base64Str.split(',')[1] || base64Str);
                return;
            }
            const ratio = maxWidth / width;
            width = maxWidth;
            height = height * ratio;
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.drawImage(img, 0, 0, width, height);
                resolve(canvas.toDataURL('image/jpeg', quality).split(',')[1]);
            } else resolve(base64Str.split(',')[1] || base64Str);
        };
        img.onerror = () => resolve(base64Str.split(',')[1] || base64Str);
    });
};

export const analyzeImageWithGemini = async (
  base64Images: string[],
  metrics: UserMetrics,
  context?: string,
  preferences?: UserPreferences,
  userId?: string
): Promise<AnalysisResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const optimizedImages = await Promise.all(
      base64Images.map(img => resizeBase64Image(img))
  );

  const safeContext = sanitizeInput(context || 'Estilo Geral');
  const safeFavColors = sanitizeInput(preferences?.favoriteColors || 'Cores que harmonizem');
  const safeAvoidItems = sanitizeInput(preferences?.avoidItems || 'Nenhum');
  const safeStyles = preferences?.favoriteStyles?.map(s => sanitizeInput(s)).join(", ") || "Casual Elegante";

  let feedbackContext = "";
  if (userId) {
    feedbackContext = await db.getUserFeedbackSummary(userId);
  }

  const prompt = `
    Atue como um Master Visagista Digital e Consultor de Imagem Premium.
    Analise a biometria facial, estrutura óssea e o subtom de pele das imagens enviadas.
    
    DETECÇÃO DE PELE: 
    Identifique nuances complexas como tons 'Oliva', 'Pardo Oliva' e 'Negro Oliva'. Determine se o subtom é quente, frio ou neutro-oliva.
    
    REQUISITOS TÉCNICOS OBRIGATÓRIOS NO JSON:
    1. No objeto 'visagismo', para 'cabelo' e 'barba_ou_make', inclua:
       - 'produtos': Array de strings com nomes genéricos de produtos de alta qualidade.
       - 'tecnicas': Array de strings detalhando técnicas profissionais de aplicação.
    2. Identifique o Gênero com precisão.
    3. Sugira 'sugestoes_roupa' com 'estacao' e 'estilo'.

    Contexto do Usuário: ${safeContext}.
    Métricas Corporais: Altura ${metrics.height}m, Peso ${metrics.weight}kg.
    Preferências de Estilo: ${safeStyles}.
    Cores Favoritas: ${safeFavColors}.
    Evitar: ${safeAvoidItems}.
    
    ${feedbackContext}

    Retorne estritamente JSON válido seguindo a interface AnalysisResult.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: {
        parts: [
          ...optimizedImages.map(data => ({ inlineData: { mimeType: "image/jpeg", data } })),
          { text: prompt }
        ]
      },
      config: { 
        responseMimeType: "application/json",
        thinkingConfig: { thinkingBudget: 4000 }
      }
    });

    const text = response.text;
    if (!text) throw new Error("A Inteligência Artificial não retornou uma resposta válida.");
    
    const cleanedJson = cleanJsonString(text);
    return JSON.parse(cleanedJson) as AnalysisResult;
  } catch (error: any) {
    console.error("Gemini Analysis Error:", error);
    throw new Error(`Falha na análise biométrica: ${error.message || "Tente novamente com melhor iluminação."}`);
  }
};

export const generateVisualEdit = async (
    base64Image: string,
    type: string,
    prompt: string,
    visagismoParams: string,
    options: any,
    userRefinement?: string
): Promise<string> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const safeRefinement = sanitizeInput(userRefinement || "");
    
    const finalPrompt = `
        High-end luxury fashion photography, cinematic lighting, 8k resolution.
        The person in the provided image is now wearing: ${prompt}. 
        Styling context: ${visagismoParams}. 
        User notes: ${safeRefinement}.
        CRITICAL: Maintain the EXACT facial features, skin tone, hair color, and body posture of the person in the original photo. Only change the clothing and environmental styling.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-image",
            contents: {
              parts: [
                { inlineData: { data: base64Image, mimeType: "image/jpeg" } },
                { text: finalPrompt }
              ]
            },
            config: { 
              imageConfig: { aspectRatio: "9:16" } 
            }
        });

        const generatedPart = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
        if (!generatedPart || !generatedPart.inlineData) throw new Error("A imagem não pôde ser gerada no momento.");
        
        return generatedPart.inlineData.data;
    } catch (error: any) {
        console.error("Generation Error:", error);
        throw new Error(`Erro no provador virtual: ${error.message || "O serviço está temporariamente indisponível."}`);
    }
};
