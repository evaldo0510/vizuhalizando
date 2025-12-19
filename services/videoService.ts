
import { GoogleGenAI } from "@google/genai";

// Fixed: Removed the global declaration that conflicted with environment-provided types.
// Used safe type casting to interact with the platform-injected window.aistudio object.
export const generatePromoVideo = async (prompt: string): Promise<string> => {
  // Check if API key selection is needed for Veo models
  const aiStudio = typeof window !== 'undefined' ? (window as any).aistudio : undefined;

  if (aiStudio) {
    const hasKey = await aiStudio.hasSelectedApiKey();
    if (!hasKey) {
      await aiStudio.openSelectKey();
      // Proceed assuming selection was successful as per instructions
    }
  }

  // Always create a new instance right before making an API call to ensure latest API key is used
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    let operation = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: prompt,
      config: {
        numberOfVideos: 1,
        resolution: '1080p',
        aspectRatio: '16:9'
      }
    });

    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 10000));
      operation = await ai.operations.getVideosOperation({ operation: operation });
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!downloadLink) throw new Error("Falha ao obter link do vídeo.");

    // The download link requires the API key for authorization when fetching the MP4 bytes
    return `${downloadLink}&key=${process.env.API_KEY}`;
  } catch (error: any) {
    console.error("Erro na geração de vídeo Veo:", error);
    
    // Specifically handle the 404 error by prompting for key selection again as per instructions
    if (error.message?.includes("Requested entity was not found.") || (error.status === 404)) {
      if (aiStudio) {
        await aiStudio.openSelectKey();
      }
      throw new Error("Por favor, selecione uma chave de API válida com faturamento ativo para usar o Veo.");
    }
    
    throw new Error(error.message || "Erro ao gerar vídeo promocional.");
  }
};
