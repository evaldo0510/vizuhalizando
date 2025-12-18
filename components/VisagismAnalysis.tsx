
import React, { useState, useMemo } from 'react';
import { 
  X, CheckCircle2, Lock, Sparkles, CreditCard, 
  Scissors, Palette, Glasses, Shirt, Info, ArrowRight,
  Filter, Briefcase, Coffee, PartyPopper, LayoutGrid,
  Sun, Leaf, Snowflake, CloudRain, ThumbsUp, ThumbsDown,
  Download, Wand2, Loader2
} from 'lucide-react';
import type { AnalysisResult, OutfitSuggestion } from '../types';
import { generateVisualEdit } from '../services/geminiService';

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
type SeasonFilter = 'Todas' | 'Primavera' | 'Verão' | 'Outono' | 'Inverno';

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
  const [seasonFilter, setSeasonFilter] = useState<SeasonFilter>('Todas');
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
      const matchOccasion = occasionFilter === 'Todas' || 
        look.ocasiao.toLowerCase().includes(occasionFilter.toLowerCase());
      const matchSeason = seasonFilter === 'Todas' || 
        (look.estacao && look.estacao.toLowerCase().includes(seasonFilter.toLowerCase()));
      return matchOccasion && matchSeason;
    }).map((look) => {
        const originalIdx = localOutfits.findIndex(l => l === look);
        return { ...look, originalIdx };
    });
  }, [localOutfits, occasionFilter, seasonFilter]);

  return (
    <div className="w-full max-w-4xl bg-white rounded-[40px] shadow-2xl border border-slate-100 overflow-hidden animate-fade-in mb-12">
      {/* Header */}
      <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
        <div>
          <h2 className="text-3xl font-serif font-bold text-brand-graphite">Seu Dossiê Digital</h2>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-[0.2em] mt-1">Análise Baseada em Visagismo Científico</p>
        </div>
        <div className="flex items-center gap-2">
          {isPremium && (
            <button 
              onClick={onDownloadPDF}
              className="hidden sm:flex items-center gap-2 px-4 py-2 bg-brand-graphite text-brand-gold rounded-xl text-xs font-bold hover:scale-105 transition-all"
            >
              <Download size={14} /> EXPORTAR PDF
            </button>
          )}
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X/></button>
        </div>
      </div>

      <div className="p-8 space-y-12">
        {/* Basic Section */}
        <section className="grid md:grid-cols-2 gap-8">
          <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
            <h3 className="text-[10px] font-bold text-brand-gold uppercase tracking-[0.2em] mb-4">Biometria Facial</h3>
            <div className="flex items-center gap-4 mb-4">
               <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-brand-gold shadow-sm">
                 <Sparkles size={24}/>
               </div>
               <div>
                 <p className="font-bold text-lg">{result.formato_rosto_detalhado}</p>
                 <p className="text-xs text-slate-500">{result.biotipo}</p>
               </div>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">{result.analise_facial}</p>
          </div>

          <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
            <h3 className="text-[10px] font-bold text-brand-gold uppercase tracking-[0.2em] mb-4">Colorimetria Pessoal</h3>
            <div className="flex flex-wrap gap-2 mb-4">
              {result.paleta_cores?.map((color, i) => (
                <div key={i} className="group relative">
                  <div className="w-10 h-10 rounded-full border-2 border-white shadow-sm" style={{ backgroundColor: color.hex }} />
                  <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[8px] font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">{color.nome}</span>
                </div>
              ))}
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">{result.analise_pele}</p>
          </div>
        </section>

        {/* Premium Section: GATED */}
        <section className="relative">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-serif text-2xl font-bold">Diretrizes de Harmonização</h3>
            {!isPremium && (
              <span className="px-3 py-1 bg-brand-gold/10 text-brand-gold text-[10px] font-bold rounded-full border border-brand-gold/20 flex items-center gap-1">
                <Lock size={10} /> CONTEÚDO PREMIUM
              </span>
            )}
          </div>

          <div className={`grid md:grid-cols-3 gap-6 transition-all duration-700 ${!isPremium ? 'blur-md pointer-events-none select-none grayscale opacity-40' : ''}`}>
            {/* Hair */}
            <div className="p-6 bg-white border border-slate-100 rounded-3xl shadow-sm">
               <Scissors className="text-brand-gold mb-4" size={24}/>
               <h4 className="font-bold mb-2">Corte & Cor</h4>
               <p className="text-xs text-slate-500 leading-relaxed">{result.visagismo?.cabelo?.estilo}: {result.visagismo?.cabelo?.motivo}</p>
            </div>
            {/* Glasses */}
            <div className="p-6 bg-white border border-slate-100 rounded-3xl shadow-sm">
               <Glasses className="text-brand-gold mb-4" size={24}/>
               <h4 className="font-bold mb-2">Óptica Ideal</h4>
               <p className="text-xs text-slate-500 leading-relaxed">{result.otica?.armacao}: {result.otica?.motivo}</p>
            </div>
            {/* Style */}
            <div className="p-6 bg-white border border-slate-100 rounded-3xl shadow-sm">
               <Shirt className="text-brand-gold mb-4" size={24}/>
               <h4 className="font-bold mb-2">Estilo Dominante</h4>
               <p className="text-xs text-slate-500 leading-relaxed">{localOutfits[0]?.titulo || "Análise Pendente"}</p>
            </div>
          </div>

          {!isPremium && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-8 text-center bg-white/10 backdrop-blur-[2px] rounded-3xl">
               <div className="w-20 h-20 bg-brand-graphite rounded-full flex items-center justify-center text-brand-gold mb-6 shadow-2xl border-4 border-white">
                 <Lock size={32} />
               </div>
               <h4 className="text-2xl font-serif font-bold text-brand-graphite mb-2">Desbloqueie seu Visagismo Completo</h4>
               <button 
                 onClick={onUpgrade}
                 className="flex items-center gap-3 px-8 py-4 bg-brand-graphite text-brand-gold rounded-2xl font-bold shadow-2xl hover:scale-105 transition-all group"
               >
                 <CreditCard size={20} />
                 <span>Desbloquear Premium</span>
                 <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
               </button>
            </div>
          )}
        </section>

        {/* Look Suggestions */}
        <section className={`transition-all duration-700 ${!isPremium ? 'blur-sm opacity-30 pointer-events-none' : ''}`}>
           <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
             <div>
               <h3 className="font-serif text-2xl font-bold">Curadoria de Looks</h3>
               <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Sugestões personalizadas para seu biotipo</p>
             </div>
             
             {isPremium && (
               <div className="flex flex-wrap gap-3">
                 <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200">
                    {['Todas', 'Trabalho', 'Casual', 'Festa'].map((f) => (
                      <button
                        key={f}
                        onClick={() => setOccasionFilter(f as OccasionFilter)}
                        className={`px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all ${occasionFilter === f ? 'bg-white text-brand-graphite shadow-sm' : 'text-slate-400'}`}
                      >
                        {f}
                      </button>
                    ))}
                 </div>
               </div>
             )}
           </div>

           {filteredLooks.length > 0 ? (
             <div className="grid md:grid-cols-2 gap-6 animate-fade-in">
               {filteredLooks.map((look, idx) => (
                 <div key={idx} className="bg-slate-50 rounded-3xl border border-slate-100 flex flex-col group hover:border-brand-gold/30 transition-all hover:shadow-lg overflow-hidden">
                    <div className="p-6 flex-1">
                        {look.generatedImage ? (
                          <div className="aspect-[3/4] rounded-2xl overflow-hidden mb-4 relative bg-slate-200">
                             <img src={look.generatedImage} className="w-full h-full object-cover animate-fade-in" />
                             <div className="absolute top-2 right-2 bg-brand-gold text-white text-[8px] font-bold px-2 py-1 rounded-full">PROVADOR IA</div>
                          </div>
                        ) : (
                          <div className="flex gap-4 mb-4">
                            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center flex-shrink-0 text-brand-gold shadow-sm">
                              <Shirt size={28}/>
                            </div>
                            <div className="flex-1">
                                <h5 className="font-bold text-slate-800">{look.titulo}</h5>
                                <p className="text-[10px] font-bold text-brand-gold uppercase tracking-widest mb-2">{look.ocasiao}</p>
                                <p className="text-xs text-slate-500 leading-relaxed">{look.detalhes}</p>
                            </div>
                          </div>
                        )}
                        
                        {isPremium && !look.generatedImage && (
                          <button 
                            disabled={generatingLookIdx !== null}
                            onClick={() => handleVirtualTryOn(look.originalIdx, look)}
                            className="w-full py-3 bg-white border-2 border-brand-gold/20 text-brand-gold rounded-2xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-brand-gold hover:text-white transition-all disabled:opacity-50"
                          >
                            {generatingLookIdx === look.originalIdx ? (
                              <><Loader2 size={14} className="animate-spin" /> Processando Caimento...</>
                            ) : (
                              <><Wand2 size={14} /> PROVAR LOOK EM MIM</>
                            )}
                          </button>
                        )}
                    </div>
                    
                    <div className="bg-white/50 border-t border-slate-100 p-3 flex justify-between items-center px-6">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Feedback</span>
                        <div className="flex items-center gap-4">
                            <button onClick={() => handleFeedbackClick(look.originalIdx, 'like')} className={`transition-all ${look.feedback === 'like' ? 'text-brand-gold' : 'text-slate-300'}`}><ThumbsUp size={16} fill={look.feedback === 'like' ? 'currentColor' : 'none'} /></button>
                            <button onClick={() => handleFeedbackClick(look.originalIdx, 'dislike')} className={`transition-all ${look.feedback === 'dislike' ? 'text-red-400' : 'text-slate-300'}`}><ThumbsDown size={16} fill={look.feedback === 'dislike' ? 'currentColor' : 'none'} /></button>
                        </div>
                    </div>
                 </div>
               ))}
             </div>
           ) : (
             <div className="py-20 text-center bg-slate-50 rounded-[40px] border border-dashed border-slate-200">
               <h4 className="font-bold text-slate-400">Sem resultados para este filtro</h4>
             </div>
           )}
        </section>
      </div>
      
      <div className="bg-slate-950 p-6 text-center">
        <p className="text-[10px] text-white/40 font-bold uppercase tracking-[0.3em]">Atelier VizuHalizando Pro • Consultoria Exclusiva</p>
      </div>
    </div>
  );
};
