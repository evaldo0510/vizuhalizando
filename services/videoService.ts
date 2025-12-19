
import { GoogleGenAI } from "@google/genai";

export const generatePromoVideo = async (prompt: string): Promise<string> => {
  const aiStudio = typeof window !== 'undefined' ? (window as any).aistudio : undefined;

  // Verifica se o usuário precisa selecionar uma chave paga para o Veo
  if (aiStudio) {
    const hasKey = await aiStudio.hasSelectedApiKey();
    if (!hasKey) {
      await aiStudio.openSelectKey();
    }
  }

  // Sempre cria uma nova instância para garantir que pegue a chave mais recente do process.env
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
    if (!downloadLink) throw new Error("Falha ao gerar o vídeo promocional.");

    return `${downloadLink}&key=${process.env.API_KEY}`;
  } catch (error: any) {
    console.error("Erro na geração de vídeo Veo:", error);
    
    // Se a entidade não foi encontrada ou erro 404, solicita nova chave
    if (error.message?.includes("Requested entity was not found.") || error.status === 404) {
      if (aiStudio) {
        await aiStudio.openSelectKey();
      }
      throw new Error("Seu projeto não possui acesso ao modelo Veo. Verifique o faturamento no Google AI Studio.");
    }
    
    throw new Error(error.message || "Ocorreu um erro ao gerar seu vídeo.");
  }
};
