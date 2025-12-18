
import React, { useState, useMemo } from 'react';
import { 
  X, CheckCircle2, Lock, Sparkles, CreditCard, 
  Scissors, Palette, Glasses, Shirt, Info, ArrowRight,
  Filter, Briefcase, Coffee, PartyPopper, LayoutGrid,
  Sun, Leaf, Snowflake, CloudRain, ThumbsUp, ThumbsDown,
  Download, Wand2, Loader2, UserCheck
} from 'lucide-react';
import type { AnalysisResult, OutfitSuggestion } from '../types';
import { generateVisualEdit } from '../services/geminiService';
import { Logo } from './Logo';

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
  const [localOutfits, setLocalOutfits] = useState<OutfitSuggestion[]>(result.sugestoes_roupa || []);
  const [generatingLookIdx, setGeneratingLookIdx] = useState<number | null>(null);

  const handleFeedbackClick = (idxInOriginal: number, feedback: 'like' | 'dislike') => {
    if (!onFeedback) return;
    const currentFeedback = localOutfits[idxInOriginal].feedback;
    const newFeedback = currentFeedback === feedback ? null : feedback;
    const updated = [...localOutfits];
    updated[idxInOriginal].feedback = newFeedback;
    setLocalOutfits(updated);
    onFeedback(idxInOriginal, newFeedback);
  };

  const handleVirtualTryOn = async (idx: number, outfit: OutfitSuggestion) => {
    if (!isPremium || !userImage) return;
    setGeneratingLookIdx(idx);
    try {
      const base64Clean = userImage.split(',')[1];
      const generatedBase64 = await generateVisualEdit(
        base64Clean,
        'outfit',
        outfit.titulo,
        `Estilo: ${outfit.visagismo_sugerido}. Biotipo: ${result.biotipo}`,
        {}
      );
      
      const updated = [...localOutfits];
      updated[idx].generatedImage = `data:image/png;base64,${generatedBase64}`;
      setLocalOutfits(updated);
    } catch (error) {
      console.error("Erro no provador virtual:", error);
    } finally {
      setGeneratingLookIdx(null);
    }
  };

  const filteredLooks = useMemo(() => {
    return localOutfits.filter((look) => {
      const matchOccasion = !look.ocasiao || occasionFilter === 'Todas' || 
        look.ocasiao.toLowerCase().includes(occasionFilter.toLowerCase());
      return matchOccasion;
    }).map((look) => {
        const originalIdx = localOutfits.findIndex(l => l === look);
        return { ...look, originalIdx };
    });
  }, [localOutfits, occasionFilter]);

  if (!result) return null;

  return (
    <div className="w-full max-w-4xl bg-white rounded-[40px] shadow-2xl border border-slate-100 overflow-hidden animate-fade-in mb-12 flex flex-col">
      {/* Header Premium */}
      <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-brand-gold/10 rounded-2xl flex items-center justify-center text-brand-gold shadow-sm">
             <UserCheck size={24}/>
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-brand-graphite leading-tight">Seu Dossiê Digital</h2>
            <p className="text-[10px] md:text-xs text-slate-400 font-bold uppercase tracking-[0.2em] mt-1">Identidade Visual de {userName}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {isPremium && (
            <button 
              onClick={onDownloadPDF}
              className="hidden sm:flex items-center gap-2 px-6 py-3 bg-brand-graphite text-brand-gold rounded-2xl text-xs font-bold hover:scale-105 transition-all shadow-xl"
            >
              <Download size={16} /> EXPORTAR PDF
            </button>
          )}
          <button onClick={onClose} className="p-3 hover:bg-red-50 hover:text-red-500 rounded-full transition-all"><X size={24}/></button>
        </div>
      </div>

      <div className="p-6 md:p-8 space-y-12 md:space-y-16 overflow-y-auto max-h-[80vh] custom-scrollbar">
        {/* Basic Analysis Card */}
        <section className="grid md:grid-cols-2 gap-8 md:gap-10">
          <div className="bg-slate-50 p-6 md:p-8 rounded-[32px] border border-slate-100 shadow-inner">
            <div className="flex items-center gap-3 mb-6">
              <span className="p-2 bg-white rounded-xl shadow-sm"><Sparkles className="text-brand-gold" size={20}/></span>
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">Biometria Facial</h3>
            </div>
            <div className="space-y-4">
               <div>
                 <p className="font-bold text-xl md:text-2xl text-brand-graphite">{result.formato_rosto_detalhado || "Analisado"}</p>
                 <p className="text-[10px] text-brand-gold font-bold uppercase tracking-widest mt-1">{result.biotipo || "Biotipo Padrão"}</p>
               </div>
               <p className="text-sm text-slate-600 leading-relaxed text-justify">{result.analise_facial}</p>
            </div>
          </div>

          <div className="bg-slate-50 p-6 md:p-8 rounded-[32px] border border-slate-100 shadow-inner">
            <div className="flex items-center gap-3 mb-6">
              <span className="p-2 bg-white rounded-xl shadow-sm"><Palette className="text-brand-gold" size={20}/></span>
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">Cromática Pessoal</h3>
            </div>
            <div className="flex flex-wrap gap-3 mb-6">
              {result.paleta_cores?.map((color, i) => (
                <div key={i} className="group relative flex flex-col items-center">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl border-4 border-white shadow-md transform hover:rotate-6 transition-transform" style={{ backgroundColor: color.hex }} />
                  <span className="text-[8px] font-bold text-slate-400 mt-2 uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity">{color.nome}</span>
                </div>
              ))}
            </div>
            <p className="text-sm text-slate-600 leading-relaxed text-justify">{result.analise_pele}</p>
          </div>
        </section>

        {/* Technical Harmonization (Premium) */}
        <section className="relative">
          <div className="flex items-center justify-between mb-8 md:mb-10">
            <div className="flex items-center gap-4">
              <h3 className="font-serif text-2xl md:text-3xl font-bold text-brand-graphite">Harmonização Técnica</h3>
              {isPremium && <CheckCircle2 className="text-green-500" size={20} />}
            </div>
            {!isPremium && (
              <span className="px-4 py-1.5 bg-brand-gold/10 text-brand-gold text-[10px] font-bold rounded-full border border-brand-gold/20 flex items-center gap-2">
                <Lock size={12} /> CONTEÚDO BLOQUEADO
              </span>
            )}
          </div>

          <div className={`grid md:grid-cols-3 gap-6 md:gap-8 transition-all duration-700 ${!isPremium ? 'blur-2xl pointer-events-none opacity-40 grayscale' : ''}`}>
            {/* Hair */}
            <div className="p-6 md:p-8 bg-white border border-slate-100 rounded-[32px] shadow-sm hover:shadow-xl transition-all group">
               <div className="w-10 h-10 md:w-12 md:h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-brand-gold mb-6 group-hover:bg-brand-gold group-hover:text-white transition-colors">
                 <Scissors size={24}/>
               </div>
               <h4 className="font-bold text-lg mb-3">Corte & Visagismo</h4>
               <p className="text-xs text-slate-500 leading-relaxed">
                 <span className="text-brand-graphite font-bold">{result.visagismo?.cabelo?.estilo || "Estilo Sugerido"}:</span> {result.visagismo?.cabelo?.motivo || "Análise de harmonia."}
               </p>
            </div>
            {/* Accessories */}
            <div className="p-6 md:p-8 bg-white border border-slate-100 rounded-[32px] shadow-sm hover:shadow-xl transition-all group">
               <div className="w-10 h-10 md:w-12 md:h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-brand-gold mb-6 group-hover:bg-brand-gold group-hover:text-white transition-colors">
                 <Glasses size={24}/>
               </div>
               <h4 className="font-bold text-lg mb-3">Óptica & Acessórios</h4>
               <p className="text-xs text-slate-500 leading-relaxed">
                 <span className="text-brand-graphite font-bold">{result.otica?.armacao || "Armação"}:</span> {result.otica?.motivo || "Foco no equilíbrio."}
               </p>
            </div>
            {/* Master Style */}
            <div className="p-6 md:p-8 bg-white border border-slate-100 rounded-[32px] shadow-sm hover:shadow-xl transition-all group">
               <div className="w-10 h-10 md:w-12 md:h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-brand-gold mb-6 group-hover:bg-brand-gold group-hover:text-white transition-colors">
                 <Shirt size={24}/>
               </div>
               <h4 className="font-bold text-lg mb-3">Arquétipo de Estilo</h4>
               <p className="text-xs text-slate-500 leading-relaxed">
                 Sugerimos uma base <span className="text-brand-graphite font-bold">{result.sugestoes_roupa?.[0]?.titulo || "Personalizada"}</span> para equilibrar suas linhas faciais.
               </p>
            </div>
          </div>

          {!isPremium && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-8 text-center bg-white/5 backdrop-blur-[4px] rounded-[40px]">
               <div className="w-20 h-20 md:w-24 md:h-24 bg-brand-graphite rounded-[32px] flex items-center justify-center text-brand-gold mb-8 shadow-2xl border-4 border-white animate-bounce">
                 <Lock size={40} />
               </div>
               <h4 className="text-2xl md:text-3xl font-serif font-bold text-brand-graphite mb-4">Desbloqueie seu Estudo Completo</h4>
               <button 
                 onClick={onUpgrade}
                 className="flex items-center gap-4 px-8 py-4 md:px-10 md:py-5 bg-brand-gold text-brand-graphite rounded-3xl font-bold shadow-2xl hover:scale-105 transition-all"
               >
                 <CreditCard size={24} />
                 <span>LIBERAR AGORA</span>
                 <ArrowRight size={20} />
               </button>
            </div>
          )}
        </section>

        {/* Curadoria Virtual (Try-On) */}
        <section className={`transition-all duration-700 ${!isPremium ? 'blur-xl opacity-30 pointer-events-none' : ''}`}>
           <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
             <div>
               <h3 className="font-serif text-2xl md:text-3xl font-bold text-brand-graphite">Curadoria de Looks</h3>
               <p className="text-[10px] md:text-xs text-slate-400 font-bold uppercase tracking-widest mt-2">Harmonização aplicada em tempo real</p>
             </div>
             
             {isPremium && (
               <div className="flex bg-slate-100 p-1 rounded-[24px] border border-slate-200 overflow-x-auto">
                  {['Todas', 'Trabalho', 'Casual', 'Festa'].map((f) => (
                    <button
                      key={f}
                      onClick={() => setOccasionFilter(f as OccasionFilter)}
                      className={`px-4 md:px-6 py-2 rounded-2xl text-[9px] md:text-[10px] font-bold transition-all whitespace-nowrap ${occasionFilter === f ? 'bg-white text-brand-graphite shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                      {f}
                    </button>
                  ))}
               </div>
             )}
           </div>

           {filteredLooks.length > 0 ? (
             <div className="grid md:grid-cols-2 gap-6 md:gap-8">
               {filteredLooks.map((look, idx) => (
                 <div key={idx} className="bg-white rounded-[40px] border border-slate-100 flex flex-col group hover:border-brand-gold/30 transition-all hover:shadow-2xl overflow-hidden shadow-sm">
                    <div className="p-6 md:p-8 flex-1">
                        {look.generatedImage ? (
                          <div className="aspect-[3/4] rounded-3xl overflow-hidden mb-6 relative bg-slate-900 shadow-2xl">
                             <img src={look.generatedImage} className="w-full h-full object-cover animate-fade-in" />
                             <div className="absolute bottom-4 left-4 right-4 p-3 bg-brand-graphite/90 backdrop-blur-md rounded-2xl border border-white/10 flex justify-between items-center">
                                <span className="text-[8px] md:text-[10px] text-brand-gold font-bold uppercase tracking-widest">Visualização em você</span>
                                <button onClick={() => {
                                   const updated = [...localOutfits];
                                   updated[look.originalIdx].generatedImage = undefined;
                                   setLocalOutfits(updated);
                                }} className="text-white hover:text-brand-gold transition-colors"><Info size={16}/></button>
                             </div>
                          </div>
                        ) : (
                          <div className="flex flex-col gap-4 md:gap-6">
                            <div className="flex items-center gap-4">
                              <div className="w-16 h-16 md:w-20 md:h-20 bg-slate-50 rounded-3xl flex items-center justify-center text-brand-gold shadow-inner border border-slate-100">
                                <Shirt size={32}/>
                              </div>
                              <div className="flex-1">
                                  <h5 className="font-bold text-lg md:text-xl text-slate-800 mb-1 leading-tight">{look.titulo}</h5>
                                  <span className="text-[8px] md:text-[9px] font-bold text-brand-gold border border-brand-gold/30 px-3 py-1 rounded-full uppercase tracking-widest">{look.ocasiao}</span>
                              </div>
                            </div>
                            <p className="text-xs text-slate-500 leading-relaxed text-justify line-clamp-4">{look.detalhes}</p>
                          </div>
                        )}
                        
                        {isPremium && !look.generatedImage && (
                          <button 
                            disabled={generatingLookIdx !== null}
                            onClick={() => handleVirtualTryOn(look.originalIdx, look)}
                            className="w-full mt-6 py-4 bg-brand-graphite text-white rounded-[24px] text-xs md:text-sm font-bold flex items-center justify-center gap-3 hover:bg-brand-gold transition-all disabled:opacity-50 active:scale-95 shadow-xl group"
                          >
                            {generatingLookIdx === look.originalIdx ? (
                              <><Loader2 size={18} className="animate-spin" /> PROCESSANDO...</>
                            ) : (
                              <><Wand2 size={18} /> VER EM MIM</>
                            )}
                          </button>
                        )}
                    </div>
                    
                    <div className="bg-slate-50/50 border-t border-slate-50 p-4 flex justify-between items-center px-6 md:px-8">
                        <span className="text-[8px] md:text-[9px] font-bold text-slate-400 uppercase tracking-widest">Feedback Estilo</span>
                        <div className="flex items-center gap-5">
                            <button onClick={() => handleFeedbackClick(look.originalIdx, 'like')} className={`transition-all hover:scale-125 ${look.feedback === 'like' ? 'text-brand-gold' : 'text-slate-300'}`}><ThumbsUp size={18} fill={look.feedback === 'like' ? 'currentColor' : 'none'} /></button>
                            <button onClick={() => handleFeedbackClick(look.originalIdx, 'dislike')} className={`transition-all hover:scale-125 ${look.feedback === 'dislike' ? 'text-red-400' : 'text-slate-300'}`}><ThumbsDown size={18} fill={look.feedback === 'dislike' ? 'currentColor' : 'none'} /></button>
                        </div>
                    </div>
                 </div>
               ))}
             </div>
           ) : (
             <div className="py-24 text-center bg-slate-50 rounded-[60px] border-2 border-dashed border-slate-200">
               <h4 className="font-bold text-slate-400 text-lg">Nenhum look disponível.</h4>
             </div>
           )}
        </section>
      </div>
      
      <div className="bg-brand-graphite p-8 md:p-10 text-center flex flex-col items-center gap-4">
        <div className="flex items-center gap-3 opacity-30 grayscale invert">
          <Logo className="w-5 h-5" />
          <span className="font-serif text-lg font-bold text-white tracking-tight">VizuHalizando AI</span>
        </div>
        <p className="text-[8px] md:text-[9px] text-white/20 font-bold uppercase tracking-[0.5em]">Consultoria de Imagem de Luxo • {new Date().getFullYear()}</p>
      </div>
    </div>
  );
};
