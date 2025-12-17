
import { GoogleGenAI, Schema } from "@google/genai";
import type { AnalysisResult, ImageQualityResult, UserPreferences, UserMetrics } from "../types";

// Initialize Gemini Client Lazily (Singleton Pattern)
let ai: GoogleGenAI | null = null;

const getAi = () => {
  if (!ai) {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
        throw new Error("API Key not found. Please check process.env.API_KEY");
    }
    try {
        ai = new GoogleGenAI({ apiKey });
    } catch (e) {
        console.error("Failed to initialize GoogleGenAI client:", e);
        throw new Error("Falha ao inicializar serviço de IA. Tente recarregar a página.");
    }
  }
  return ai;
};

// Helper: Resize Image Client-Side
// Optimized default to 512px for faster analysis
export const resizeBase64Image = (base64Str: string, maxWidth: number = 512, quality: number = 0.8): Promise<string> => {
    return new Promise((resolve) => {
        if (typeof window === 'undefined' || typeof document === 'undefined') {
            resolve(base64Str);
            return;
        }

        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = `data:image/jpeg;base64,${base64Str}`;
        
        img.onload = () => {
            try {
                let width = img.width;
                let height = img.height;
                
                if (width <= maxWidth) {
                    resolve(base64Str);
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
                    const resizedDataUrl = canvas.toDataURL('image/jpeg', quality);
                    resolve(resizedDataUrl.split(',')[1]);
                } else {
                    resolve(base64Str);
                }
            } catch (e) {
                console.warn("Image resize failed", e);
                resolve(base64Str);
            }
        };

        img.onerror = () => {
            console.warn("Image load failed for resize");
            resolve(base64Str);
        };
    });
};

export const analyzeImageWithGemini = async (
  base64Images: string[], // Changed to accept array
  metrics: UserMetrics,
  context?: string,
  preferences?: UserPreferences
): Promise<AnalysisResult> => {
  const client = getAi();
  
  // Resize all images in parallel
  const optimizedImages = await Promise.all(
      base64Images.map(img => resizeBase64Image(img))
  );

  // Construct preferences string
  let prefString = "";
  if (preferences) {
      if (preferences.favoriteStyles.length > 0) prefString += `Favorite Styles: ${preferences.favoriteStyles.join(", ")}. `;
      if (preferences.favoriteColors) prefString += `Favorite Colors: ${preferences.favoriteColors}. `;
      if (preferences.avoidItems) prefString += `ITEMS TO AVOID: ${preferences.avoidItems}. `;
  }

  // Construct image parts
  const imageParts = optimizedImages.map(data => ({
      inlineData: { mimeType: "image/jpeg", data: data }
  }));

  const prompt = `
    Analyze the provided image(s) for a high-end visagism and personal styling consultation (VizuHalizando AI), tailored for the Brazilian context.
    
    You have received ${imageParts.length} photo(s). 
    CRITICAL: Synthesize information from ALL photos provided (Front, Profile, Body, etc.) to create the most accurate assessment of head shape, body type, and hair texture.
    
    User Metrics: Height: ${metrics.height}m, Weight: ${metrics.weight}kg.
    Requested Environment/Occasion: ${context ? context.toUpperCase() : 'GENERAL STYLE ASSESSMENT'}.
    
    USER PREFERENCES (IMPORTANT): ${prefString}

    CRITICAL INSTRUCTION 1: Accurately identify the gender ("Masculino" or "Feminino").
    
    CRITICAL INSTRUCTION 2: SKIN TONE ANALYSIS (Brazilian Diversity).
    Pay close attention to the undertone. Identify if it is:
    - Quente (Warm): Golden, yellow, or orangey undertones.
    - Frio (Cool): Pink, reddish, or bluish undertones.
    - Neutro (Neutral): Balanced, hard to categorize.
    - Oliva (Olive): Greenish/grayish cast, common in Brazil (mix of warm and cool).
    
    CRITICAL INSTRUCTION 3: HAIR & VISAGISM.
    Based on the multi-angle view (if available), provide highly precise haircut recommendations. Consider cranial structure, hair density, and growth direction visible in the photos.
    Provide actionable advice including specific products (e.g., "Pomada Matte", "Leave-in Defrizante") and techniques (e.g., "Secagem com difusor").

    Output Structure (JSON):
    {
      "quality_check": { "valid": boolean, "reason": "string" },
      "genero": "Masculino" | "Feminino",
      "formato_rosto_detalhado": "string (ex: Oval, Quadrado)",
      "biotipo": "string (ex: Mesomorfo)",
      "analise_facial": "string",
      "analise_pele": "string (Detailed explanation of the detected sub-tone)",
      "tom_pele_detectado": "Quente" | "Frio" | "Neutro" | "Oliva",
      "analise_corporal": "string",
      "paleta_cores": [{ "hex": "string", "nome": "string" }],
      "visagismo": {
        "cabelo": { 
            "estilo": "string", 
            "detalhes": "string", 
            "motivo": "string",
            "produtos": ["string"],
            "tecnicas": ["string"]
        },
        "barba_ou_make": { "estilo": "string", "detalhes": "string", "motivo": "string" },
        "acessorios": ["string"]
      },
      "otica": { "armacao": "string", "material": "string", "detalhes": "string", "motivo": "string" },
      "sugestoes_roupa": [
        {
          "titulo": "string",
          "detalhes": "string",
          "ocasiao": "string",
          "motivo": "string",
          "visagismo_sugerido": "string",
          "estacao": "Primavera" | "Verão" | "Outono" | "Inverno" | "Atemporal",
          "termos_busca": "string",
          "ambientes": ["string"], 
          "components": [
            { 
              "peca": "string", 
              "loja": "string", 
              "link": "string",
              "preco_estimado": "string"
            }
          ]
        }
      ]
    }
    
    Generate 4 distinct outfit suggestions strictly tailored to the Occasion and Preferences.
    Ensure links are valid search URLs for Brazilian stores (Renner, Zara, Amaro, C&A).
  `;

  try {
    const response = await client.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          ...imageParts,
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json"
      }
    });

    const text = response.text; 
    if (!text) throw new Error("No response from AI");
    
    return JSON.parse(text) as AnalysisResult;
  } catch (error) {
    console.error("Analysis Error:", error);
    throw new Error("Erro ao analisar imagem. Tente novamente.");
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
    const client = getAi();
    
    // Construct a high-quality prompt for Imagen
    let finalPrompt = `
        Fashion photography shot, 8k resolution, highly detailed.
        Subject: A person wearing a stylish outfit.
        Outfit Description: ${prompt}.
        Style details: ${visagismoParams}.
        Lighting: Professional studio lighting, soft shadows.
        Context: High-end fashion lookbook.
    `;

    if (userRefinement) {
        finalPrompt += ` Note: ${userRefinement}.`;
    }

    try {
        // Use Imagen for image generation instead of Gemini Flash (which is for analysis/text)
        const response = await client.models.generateImages({
            model: "imagen-3.0-generate-001",
            prompt: finalPrompt,
            config: {
                numberOfImages: 1,
                aspectRatio: "9:16", // Portrait for outfit view
                outputMimeType: "image/jpeg"
            }
        });

        const generatedImage = response.generatedImages?.[0]?.image?.imageBytes;
        
        if (generatedImage) {
            return generatedImage;
        }
        
        throw new Error("Nenhuma imagem foi gerada.");
    } catch (error) {
        console.error("Generation Error:", error);
        throw new Error("Não foi possível gerar a visualização. Verifique se o modelo 'imagen-3.0-generate-001' está habilitado ou tente novamente.");
    }
};
