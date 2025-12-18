
import { GoogleGenAI } from "@google/genai";
import { db } from "./database";
import type { AnalysisResult, UserPreferences, UserMetrics } from "../types";

const sanitizeInput = (text: string): string => {
    if (!text) return "";
    return text.replace(/[<>]/g, "").slice(0, 500);
};

export const resizeBase64Image = (base64Str: string, maxWidth: number = 512, quality: number = 0.8): Promise<string> => {
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
  const safeFavColors = sanitizeInput(preferences?.favoriteColors || '');
  const safeAvoidItems = sanitizeInput(preferences?.avoidItems || '');
  const safeStyles = preferences?.favoriteStyles?.map(s => sanitizeInput(s)).join(", ") || "";

  // Busca histórico de feedback para refinar a IA
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
       - 'produtos': Array de strings com nomes genéricos de produtos (ex: "Pomada Matte Alta Fixação", "Sérum Iluminador").
       - 'tecnicas': Array de strings detalhando COMO aplicar (ex: "Secar o cabelo direcionando o ar de baixo para cima para volume").
    2. Identifique o Gênero com base na imagem.
    3. Sugira 'sugestoes_roupa' com 'estacao' e 'estilo'.

    Contexto: ${safeContext}.
    Métricas: Altura ${metrics.height}m.
    Preferências: Estilos (${safeStyles}), Cores (${safeFavColors}).
    
    ${feedbackContext}

    Retorne estritamente JSON no formato AnalysisResult.
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
      config: { responseMimeType: "application/json" }
    });

    const text = response.text;
    if (!text) throw new Error("IA não retornou dados.");
    return JSON.parse(text) as AnalysisResult;
  } catch (error) {
    console.error("Gemini Error:", error);
    throw new Error("Falha na análise. Verifique a iluminação e tente novamente.");
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
        High-end fashion photography, studio lighting.
        Person wearing: ${prompt}. 
        Style context: ${visagismoParams}. 
        Additional details: ${safeRefinement}.
        Maintain identity, facial features and the same pose.
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
            config: { imageConfig: { aspectRatio: "9:16" } }
        });

        const generatedPart = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
        if (!generatedPart) throw new Error("Imagem não gerada.");
        return generatedPart.inlineData!.data;
    } catch (error) {
        console.error("Generation Error:", error);
        throw new Error("Erro no processamento visual.");
    }
};
