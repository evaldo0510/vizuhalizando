
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
    // Use significantly higher res (1024px) for generation source to maintain identity detail
    const optimizedImage = await resizeBase64Image(base64Image, 1024, 0.9);

    // Construct a STRICT prompt for IDENTITY PRESERVATION (Virtual Try-On) with ZOOM and EYE focus
    let finalPrompt = `
        Task: Photorealistic Virtual Try-On (Inpainting).
        Output: A high-fashion photograph of the person in the input image wearing a specific new outfit.
        
        CRITICAL IDENTITY CONSTRAINTS (DO NOT VIOLATE):
        1. FACE & HEAD: You must preserve the person's facial features, skin texture, hair, and expression EXACTLY as they are in the source image. DO NOT HALLUCINATE NEW FACES or change the person's ethnicity/age.
        2. EYES (CRITICAL): Ensure the eyes are perfectly defined, symmetric, and realistic. Maintain the original iris color and gaze direction. Do NOT produce blurry, distorted, or 'dead' eyes.
        3. SKIN: Do NOT smooth the skin excessively; keep natural texture and imperfections.
        
        FRAMING & ZOOM:
        - If the original image is a distant full-body shot, crop/zoom in slightly to a MEDIUM SHOT (Waist-Up or Knees-Up) to maximize facial resolution and outfit detail.
        - If the original is already a close-up, maintain the framing.
        - Ensure the face is in sharp focus.
        
        OUTFIT DESCRIPTION:
        ${prompt}
        
        STYLE & SETTING:
        - Style: High-end editorial photography, realistic textures, 8k resolution.
        - Lighting: Soft, flattering studio lighting to enhance eye reflections.
        - Visagism note: Respect these grooming details if visible: ${visagismoParams}.
        
        WARNING: If you cannot preserve the identity 100%, do not generate a completely different person. The priority is the person's identity over the outfit detail.
    `;

    if (userRefinement) {
        finalPrompt += `
        ADJUSTMENT REQUEST:
        The user wants to modify the previous result: "${userRefinement}".
        Apply this change while strictly maintaining the identity constraints defined above.
        `;
    }

    try {
        const response = await client.models.generateContent({
            model: "gemini-2.5-flash-image", // Fallback to Flash Image to fix 403 Permission error
            contents: {
                parts: [
                    { inlineData: { mimeType: "image/jpeg", data: optimizedImage } },
                    { text: finalPrompt }
                ]
            },
            config: {
                // gemini-2.5-flash-image settings
            }
        });

        const candidates = response.candidates;
        if (candidates && candidates.length > 0) {
            for (const part of candidates[0].content.parts) {
                if (part.inlineData && part.inlineData.data) {
                    return part.inlineData.data;
                }
            }
        }
        
        throw new Error("No image generated");
    } catch (error) {
        console.error("Generation Error:", error);
        throw new Error("Não foi possível gerar a visualização. Tente novamente.");
    }
};
