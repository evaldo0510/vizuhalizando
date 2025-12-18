
import React, { useState, useMemo, useEffect } from 'react';
import { 
  X, CheckCircle2, Lock, Sparkles, CreditCard, 
  Scissors, Palette, Glasses, Shirt, Info, ArrowRight,
  Filter, Sun, ThumbsUp, ThumbsDown,
  Download, Wand2, Loader2, UserCheck, Tag, BookOpen,
  Zap, ZoomIn, Maximize2, Move, FileImage, Check
} from 'lucide-react';
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import type { AnalysisResult, OutfitSuggestion } from '../types';
import { generateVisualEdit } from '../services/geminiService';
import { Logo } from '../Logo';

interface VisagismAnalysisProps {
  result: AnalysisResult;
  isPremium: boolean;
  userImage?: string;
  userName?: string;
  onUpgrade: () => void;
  onClose: () => void;
  onDownloadPDF: () => void;
  onFeedback?: (outfitIdx: number, feedback: 'like' | 'dislike' | null) => void;
}

type OccasionFilter = 'Todas' | 'Trabalho' | 'Casual' | 'Festa';

export const VisagismAnalysis: React.FC<VisagismAnalysisProps> = ({ 
  result, 
  isPremium, 
  userImage,
  userName,
  onUpgrade, 
  onClose,
  onDownloadPDF,
  onFeedback
}) => {
  const [occasionFilter, setOccasionFilter] = useState<OccasionFilter>('Todas');
  const [localOutfits, setLocalOutfits] = useState<OutfitSuggestion[]>(Array.isArray(result?.sugestoes_roupa) ? result.sugestoes_roupa : []);
  const [generatingLookIdx, setGeneratingLookIdx] = useState<number | null>(null);
  const [expandedLook, setExpandedLook] = useState<OutfitSuggestion | null>(null);
  const [isProcessingDownload, setIsProcessingDownload] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  useEffect(() => {
    if (result?.sugestoes_roupa) {
      setLocalOutfits(Array.isArray(result.sugestoes_roupa) ? result.sugestoes_roupa : []);
    }
  }, [result]);

  const handleDownloadImage = async (imageSrc: string, format: 'png' | 'jpeg') => {
    setIsProcessingDownload(true);
    try {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = imageSrc;

      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error("Falha ao criar contexto do canvas");

      if (format === 'jpeg') {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      ctx.drawImage(img, 0, 0);

      const dataUrl = canvas.toDataURL(`image/${format}`, 1.0);
      
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `vizu-look-${Date.now()}.${format === 'jpeg' ? 'jpg' : 'png'}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 2000);
    } catch (error) {
      console.error("Erro no download:", error);
      alert("Não foi possível processar a imagem para download.");
    } finally {
      setIsProcessingDownload(false);
    }
  };

  const handleVirtualTryOn = async (idx: number, outfit: OutfitSuggestion) => {
    if (!isPremium || !userImage || !Array.isArray(localOutfits)) return;
    setGeneratingLookIdx(idx);
    try {
      const base64Clean = userImage.split(',')[1] || userImage;
      const generatedBase64 = await generateVisualEdit(
        base64Clean,
        'outfit',
        outfit.titulo,
        `Estilo: ${outfit.visagismo_sugerido}. Biotipo: ${result.biotipo || 'Padrão'}`,
        {}
      );
      const updated = [...localOutfits];
      if (updated[idx]) {
        updated[idx].generatedImage = `data:image/png;base64,${generatedBase64}`;
        setLocalOutfits(updated);
      }
    } catch (error) {
      console.error("Erro no provador virtual:", error);
    } finally {
      setGeneratingLookIdx(null);
    }
  };

  const filteredLooks = useMemo(() => {
    if (!Array.isArray(localOutfits)) return [];
    return localOutfits.filter((look) => {
      if (!look) return false;
      return !look.ocasiao || occasionFilter === 'Todas' || look.ocasiao.toLowerCase().includes(occasionFilter.toLowerCase());
    }).map((look) => {
        const originalIdx = localOutfits.findIndex(l => l === look);
        return { ...look, originalIdx };
    });
  }, [localOutfits, occasionFilter]);

  if (!result) return null;

  return (
    <div className="w-full max-w-4xl bg-white rounded-[40px] shadow-2xl border border-slate-100 overflow-hidden animate-fade-in mb-12 flex flex-col relative">
      
      {/* MODAL DE VISUALIZAÇÃO AMPLIADA - Z-INDEX ALTÍSSIMO */}
      {expandedLook && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-0 md:p-10 animate-fade-in">
           <div className="absolute inset-0 bg-brand-graphite/95 backdrop-blur-2xl" onClick={() => setExpandedLook(null)}></div>
           <div className="relative w-full h-full md:h-[90vh] max-w-6xl bg-black md:rounded-[48px] overflow-hidden shadow-3xl border border-white/10 flex flex-col md:flex-row">
              <button 
                onClick={() => setExpandedLook(null)} 
                className="absolute top-6 right-6 z-[10001] p-4 bg-white/10 text-white hover:bg-brand-gold hover:text-brand-graphite rounded-full transition-all backdrop-blur-md"
              >
                <X size={28} />
              </button>
              
              <div className="flex-1 bg-slate-900 relative h-[60vh] md:h-auto overflow-hidden">
                 <TransformWrapper initialScale={1} minScale={1} maxScale={8}>
                    <TransformComponent wrapperClass="w-full h-full cursor-zoom-in" contentClass="w-full h-full">
                       <img src={expandedLook.generatedImage} className="w-full h-full object-contain" alt="Look Ampliado" />
                    </TransformComponent>
                 </TransformWrapper>
                 <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-4 px-8 py-4 bg-black/40 backdrop-blur-xl rounded-full border border-white/10 text-white/80 text-[11px] font-bold uppercase tracking-[0.2em] shadow-2xl">
                    <Move size={16} className="animate-pulse" /> Use zoom e arraste para explorar a textura
                 </div>
              </div>

              <div className="w-full md:w-96 p-10 bg-brand-graphite flex flex-col justify-center border-l border-white/5 space-y-8 h-[40vh] md:h-auto overflow-y-auto">
                 <div>
                    <h4 className="text-brand-gold text-[10px] font-bold uppercase tracking-[0.4em] mb-4">Mapeamento Digital</h4>
                    <h3 className="text-3xl font-serif font-bold text-white leading-tight">{expandedLook.titulo}</h3>
                 </div>
                 
                 <div className="space-y-6">
                    <div className="p-5 bg-white/5 rounded-2xl border border-white/5">
                       <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-2">Composição IA</p>
                       <p className="text-slate-200 text-sm leading-relaxed">{expandedLook.detalhes}</p>
                    </div>
                    <div className="p-5 bg-brand-gold/5 rounded-2xl border border-brand-gold/10">
                       <p className="text-brand-gold text-[10px] font-bold uppercase tracking-widest mb-2">Visagismo Aplicado</p>
                       <p className="text-brand-gold/90 text-sm italic">"{expandedLook.visagismo_sugerido}"</p>
                    </div>
                 </div>

                 <div className="space-y-3 pt-4">
                    <p className="text-white/40 text-[9px] font-bold uppercase tracking-widest px-2">Opções de Download</p>
                    <div className="grid grid-cols-2 gap-3">
                        <button 
                            onClick={() => handleDownloadImage(expandedLook.generatedImage!, 'png')}
                            disabled={isProcessingDownload}
                            className="flex items-center justify-center gap-2 py-4 bg-white/10 hover:bg-white/20 text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all"
                        >
                            {downloadSuccess ? <Check size={16} className="text-green-400" /> : <FileImage size={16} />} PNG
                        </button>
                        <button 
                            onClick={() => handleDownloadImage(expandedLook.generatedImage!, 'jpeg')}
                            disabled={isProcessingDownload}
                            className="flex items-center justify-center gap-2 py-4 bg-white/10 hover:bg-white/20 text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all"
                        >
                            {downloadSuccess ? <Check size={16} className="text-green-400" /> : <FileImage size={16} />} JPG
                        </button>
                    </div>
                 </div>

                 <button 
                   onClick={() => setExpandedLook(null)} 
                   className="w-full py-5 bg-white text-brand-graphite rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-brand-gold transition-all shadow-xl"
                 >
                   Fechar Visualização
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* Header Analysis */}
      <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-brand-gold/10 rounded-2xl flex items-center justify-center text-brand-gold shadow-sm">
             <UserCheck size={24}/>
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-brand-graphite leading-tight">Dossiê de Estilo</h2>
            <p className="text-[10px] md:text-xs text-slate-400 font-bold uppercase tracking-[0.2em] mt-1">Análise Exclusiva para {userName}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {isPremium && (
            <button onClick={onDownloadPDF} className="hidden sm:flex items-center gap-2 px-6 py-3 bg-brand-graphite text-brand-gold rounded-2xl text-xs font-bold hover:scale-105 transition-all shadow-xl">
              <Download size={16} /> EXPORTAR PDF
            </button>
          )}
          <button onClick={onClose} className="p-3 hover:bg-red-50 hover:text-red-500 rounded-full transition-all"><X size={24}/></button>
        </div>
      </div>

      <div className="p-6 md:p-8 space-y-12 overflow-y-auto max-h-[80vh] custom-scrollbar">
        {/* Biometria & Cores */}
        <section className="grid md:grid-cols-2 gap-8">
          <div className="bg-slate-50 p-6 md:p-8 rounded-[32px] border border-slate-100 shadow-inner">
            <div className="flex items-center gap-3 mb-6">
              <span className="p-2 bg-white rounded-xl shadow-sm"><Sparkles className="text-brand-gold" size={20}/></span>
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">Biometria Facial</h3>
            </div>
            <div className="space-y-4">
               <div>
                 <p className="font-bold text-xl md:text-2xl text-brand-graphite">{result.formato_rosto_detalhado || "Análise Facial"}</p>
                 <p className="text-[10px] text-brand-gold font-bold uppercase tracking-widest mt-1">Biotipo: {result.biotipo || "Padrão"}</p>
               </div>
               <p className="text-sm text-slate-600 leading-relaxed text-justify">{result.analise_facial}</p>
            </div>
          </div>

          <div className="bg-slate-50 p-6 md:p-8 rounded-[32px] border border-slate-100 shadow-inner">
            <div className="flex items-center gap-3 mb-6">
              <span className="p-2 bg-white rounded-xl shadow-sm"><Palette className="text-brand-gold" size={20}/></span>
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">Cromática & Subtom</h3>
            </div>
            <div className="flex flex-wrap gap-3 mb-4">
              {Array.isArray(result.paleta_cores) && result.paleta_cores.map((color, i) => (
                <div key={i} className="group relative">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl border-4 border-white shadow-md transform hover:rotate-6 transition-transform" style={{ backgroundColor: color?.hex || '#CCCCCC' }} />
                </div>
              ))}
            </div>
            <div className="mb-4">
               <span className="px-3 py-1 bg-white text-brand-graphite border border-brand-gold/20 rounded-full text-[10px] font-bold uppercase tracking-widest">
                  Subtom: {result.tom_pele_detectado || "Detectando..."}
               </span>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed text-justify">{result.analise_pele}</p>
          </div>
        </section>

        {/* Looks Section */}
        <section className="space-y-10">
           <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
             <div>
               <h3 className="font-serif text-3xl font-bold text-brand-graphite">Curadoria de Looks</h3>
               <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-2">Harmonização Inteligente Vizu AI</p>
             </div>
             
             <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200 overflow-x-auto whitespace-nowrap">
                {['Todas', 'Trabalho', 'Casual', 'Festa'].map((f) => (
                  <button key={f} onClick={() => setOccasionFilter(f as OccasionFilter)} className={`px-5 py-2.5 rounded-xl text-[10px] font-bold transition-all ${occasionFilter === f ? 'bg-white text-brand-graphite shadow-md' : 'text-slate-400 hover:text-slate-600'}`}>{f}</button>
                ))}
             </div>
           </div>

           <div className="grid md:grid-cols-2 gap-8 relative">
              {!isPremium && (
                <div className="absolute inset-0 z-20 bg-white/40 backdrop-blur-md rounded-[48px] flex flex-col items-center justify-center p-8 text-center animate-fade-in border-4 border-dashed border-slate-100">
                    <div className="w-20 h-20 bg-brand-graphite text-brand-gold rounded-full flex items-center justify-center mb-6 shadow-2xl animate-bounce">
                        <Lock size={32} />
                    </div>
                    <h4 className="text-2xl font-serif font-bold text-brand-graphite mb-3">Liberar Provador Virtual</h4>
                    <p className="text-sm text-slate-500 mb-8 max-w-xs">Acesse a tecnologia de projeção de imagem 3D para ver cada look aplicado diretamente sobre sua foto.</p>
                    <button onClick={onUpgrade} className="px-10 py-5 bg-brand-gold text-brand-graphite rounded-3xl font-bold shadow-2xl hover:scale-105 transition-all flex items-center gap-3">
                        <Sparkles size={20} /> ASSINAR AGORA
                    </button>
                </div>
              )}

               {filteredLooks.map((look, idx) => (
                 <div key={idx} className="bg-white rounded-[40px] border border-slate-100 flex flex-col group hover:border-brand-gold/30 transition-all hover:shadow-2xl overflow-hidden shadow-sm relative">
                    {generatingLookIdx === look.originalIdx && (
                      <div className="absolute inset-0 z-50 bg-brand-graphite/90 backdrop-blur-2xl flex flex-col items-center justify-center p-8 text-center animate-fade-in rounded-[40px]">
                        <div className="relative mb-8">
                          <div className="absolute inset-0 bg-brand-gold/20 rounded-full animate-ping"></div>
                          <Loader2 size={64} className="text-brand-gold animate-spin relative z-10" />
                          <Sparkles size={24} className="text-white absolute inset-0 m-auto animate-pulse" />
                        </div>
                        <h4 className="font-serif text-2xl text-white font-bold mb-2 italic">Refinando Tecidos...</h4>
                        <p className="text-[10px] text-brand-gold font-bold uppercase tracking-[0.4em] animate-pulse">Inteligência Generativa de Luxo</p>
                      </div>
                    )}

                    <div className="p-8 flex-1">
                        {look.generatedImage ? (
                          <div 
                            onClick={() => setExpandedLook(look)}
                            className="aspect-[3/4] rounded-3xl overflow-hidden mb-6 relative bg-slate-900 shadow-2xl border-4 border-slate-50 cursor-pointer group/img"
                          >
                             <img src={look.generatedImage} className="w-full h-full object-cover animate-fade-in group-hover/img:scale-105 transition-transform duration-700" />
                             <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/img:opacity-100 transition-opacity flex flex-col items-center justify-center p-6 text-center">
                                <div className="p-4 bg-white/20 backdrop-blur-xl rounded-full text-white mb-4 shadow-2xl">
                                   <Maximize2 size={32}/>
                                </div>
                                <span className="text-white text-[11px] font-bold uppercase tracking-[0.2em]">Toque para Visualizar em Alta</span>
                             </div>
                             
                             <div className="absolute bottom-6 left-6 right-6 p-4 bg-brand-graphite/90 backdrop-blur-md rounded-2xl border border-white/10 flex justify-between items-center shadow-2xl">
                                <span className="text-[10px] text-brand-gold font-bold uppercase tracking-widest flex items-center gap-2"><Sparkles size={12}/> Gerado com IA</span>
                                <button onClick={(e) => {
                                   e.stopPropagation();
                                   const updated = [...localOutfits];
                                   if (updated[look.originalIdx]) {
                                     updated[look.originalIdx].generatedImage = undefined;
                                     setLocalOutfits(updated);
                                   }
                                }} className="text-white/60 hover:text-red-400 transition-colors p-1"><X size={18}/></button>
                             </div>
                          </div>
                        ) : (
                          <div className="flex flex-col gap-6">
                            <div className="flex items-center gap-4">
                              <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center text-brand-gold shadow-inner border border-slate-100">
                                <Shirt size={32}/>
                              </div>
                              <div className="flex-1">
                                  <h5 className="font-bold text-xl text-slate-800 mb-1">{look.titulo}</h5>
                                  <div className="flex flex-wrap gap-2">
                                    <span className="text-[9px] font-bold text-brand-gold border border-brand-gold/30 px-3 py-1 rounded-full uppercase tracking-widest">{look.ocasiao}</span>
                                    {look.estacao && (
                                      <span className="text-[9px] font-bold text-slate-400 border border-slate-200 px-3 py-1 rounded-full uppercase tracking-widest flex items-center gap-1">
                                        <Sun size={10}/> {look.estacao}
                                      </span>
                                    )}
                                  </div>
                              </div>
                            </div>
                            <p className="text-xs text-slate-500 leading-relaxed text-justify line-clamp-3">{look.detalhes}</p>
                          </div>
                        )}
                        
                        {isPremium && !look.generatedImage && (
                          <button 
                            disabled={generatingLookIdx !== null}
                            onClick={() => handleVirtualTryOn(look.originalIdx, look)}
                            className="w-full mt-6 py-5 bg-brand-graphite text-white rounded-[24px] text-sm font-bold flex items-center justify-center gap-3 hover:bg-brand-gold hover:text-brand-graphite transition-all active:scale-95 shadow-xl group"
                          >
                            <Wand2 size={18} className="group-hover:rotate-12 transition-transform" /> VER LOOK EM MIM
                          </button>
                        )}
                    </div>
                 </div>
               ))}
           </div>
        </section>
      </div>
      
      <div className="bg-brand-graphite p-10 text-center">
        <div className="flex items-center justify-center gap-3 opacity-20 grayscale invert mb-4">
          <Logo className="w-6 h-6" />
          <span className="font-serif text-xl font-bold text-white tracking-tight">VizuHalizando Pro v3.1</span>
        </div>
        <p className="text-[9px] text-white/20 font-bold uppercase tracking-[0.5em]">Experience the future of personal image</p>
      </div>
    </div>
  );
};
