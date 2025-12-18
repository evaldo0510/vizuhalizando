
import { GoogleGenAI } from "@google/genai";

export const generatePromoVideo = async (prompt: string): Promise<string> => {
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

    return `${downloadLink}&key=${process.env.API_KEY}`;
  } catch (error: any) {
    console.error("Erro na geração de vídeo Veo:", error);
    throw new Error(error.message || "Erro ao gerar vídeo promocional.");
  }
};
