
import React, { useState, useMemo } from 'react';
import { 
  X, CheckCircle2, Lock, Sparkles, CreditCard, 
  Scissors, Palette, Glasses, Shirt, Info, ArrowRight,
  Filter, Briefcase, Coffee, PartyPopper, LayoutGrid,
  Sun, Leaf, Snowflake, CloudRain, ThumbsUp, ThumbsDown,
  Download, Wand2, Loader2, UserCheck, Calendar, Tag, BookOpen
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
  const [styleFilter, setStyleFilter] = useState<string>('Todos');
  const [localOutfits, setLocalOutfits] = useState<OutfitSuggestion[]>(result.sugestoes_roupa || []);
  const [generatingLookIdx, setGeneratingLookIdx] = useState<number | null>(null);

  const availableStyles = useMemo(() => {
    const styles = new Set(['Todos']);
    localOutfits.forEach(o => { if(o.estilo) styles.add(o.estilo) });
    return Array.from(styles);
  }, [localOutfits]);

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
      const base64Clean = userImage.split(',')[1] || userImage;
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
      const matchSeason = seasonFilter === 'Todas' || 
        (look.estacao && look.estacao.toLowerCase().includes(seasonFilter.toLowerCase()));
      const matchStyle = styleFilter === 'Todos' || look.estilo === styleFilter;
      
      return matchOccasion && matchSeason && matchStyle;
    }).map((look) => {
        const originalIdx = localOutfits.findIndex(l => l === look);
        return { ...look, originalIdx };
    });
  }, [localOutfits, occasionFilter, seasonFilter, styleFilter]);

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
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-brand-graphite leading-tight">Dossiê de Estilo</h2>
            <p className="text-[10px] md:text-xs text-slate-400 font-bold uppercase tracking-[0.2em] mt-1">Visagismo Aplicado para {userName}</p>
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
              {result.paleta_cores?.map((color, i) => (
                <div key={i} className="group relative">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl border-4 border-white shadow-md transform hover:rotate-6 transition-transform" style={{ backgroundColor: color.hex }} />
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

        {/* Technical Harmonization (Premium) */}
        <section className="relative">
          <div className="flex items-center justify-between mb-8 md:mb-10">
            <div className="flex items-center gap-4">
              <h3 className="font-serif text-2xl md:text-3xl font-bold text-brand-graphite">Curadoria de Beleza</h3>
              {isPremium && <CheckCircle2 className="text-green-500" size={20} />}
            </div>
          </div>

          <div className={`grid md:grid-cols-2 gap-8 transition-all duration-700 ${!isPremium ? 'blur-2xl pointer-events-none opacity-40 grayscale' : ''}`}>
            {/* Hair & Styling */}
            <div className="bg-white border border-slate-100 rounded-[40px] shadow-sm overflow-hidden flex flex-col">
               <div className="p-8 pb-4">
                 <div className="w-14 h-14 bg-brand-gold/10 rounded-2xl flex items-center justify-center text-brand-gold mb-6">
                   <Scissors size={28}/>
                 </div>
                 <h4 className="font-bold text-xl mb-2">Cabelo & Corte</h4>
                 <p className="text-sm text-slate-500 leading-relaxed mb-6">
                   <span className="text-brand-graphite font-bold">{result.visagismo?.cabelo?.estilo}:</span> {result.visagismo?.cabelo?.motivo}
                 </p>
               </div>
               
               <div className="px-8 pb-8 space-y-6 flex-1">
                  {result.visagismo?.cabelo?.produtos && result.visagismo.cabelo.produtos.length > 0 && (
                    <div className="space-y-3">
                      <p className="text-[10px] font-bold text-brand-gold uppercase tracking-[0.2em] flex items-center gap-2">
                        <Tag size={12}/> Produtos Recomendados
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {result.visagismo.cabelo.produtos.map((p, i) => (
                          <span key={i} className="px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-xl text-[11px] font-medium text-slate-600">
                            {p}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {result.visagismo?.cabelo?.tecnicas && result.visagismo.cabelo.tecnicas.length > 0 && (
                    <div className="space-y-3">
                      <p className="text-[10px] font-bold text-brand-graphite uppercase tracking-[0.2em] flex items-center gap-2">
                        <BookOpen size={12}/> Técnicas de Aplicação
                      </p>
                      <ul className="space-y-2">
                        {result.visagismo.cabelo.tecnicas.map((t, i) => (
                          <li key={i} className="flex gap-3 text-xs text-slate-500 leading-relaxed">
                            <span className="w-5 h-5 bg-brand-gold/10 text-brand-gold rounded-full flex items-center justify-center text-[10px] font-bold shrink-0">{i+1}</span>
                            {t}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
               </div>
            </div>

            {/* Makeup / Beard */}
            <div className="bg-white border border-slate-100 rounded-[40px] shadow-sm overflow-hidden flex flex-col">
               <div className="p-8 pb-4">
                 <div className="w-14 h-14 bg-brand-gold/10 rounded-2xl flex items-center justify-center text-brand-gold mb-6">
                   <Palette size={28}/>
                 </div>
                 <h4 className="font-bold text-xl mb-2">{result.genero === 'Masculino' ? 'Barba & Rosto' : 'Maquiagem & Realce'}</h4>
                 <p className="text-sm text-slate-500 leading-relaxed mb-6">
                   <span className="text-brand-graphite font-bold">{result.visagismo?.barba_ou_make?.estilo}:</span> {result.visagismo?.barba_ou_make?.motivo}
                 </p>
               </div>
               
               <div className="px-8 pb-8 space-y-6 flex-1">
                  {result.visagismo?.barba_ou_make?.produtos && result.visagismo.barba_ou_make.produtos.length > 0 && (
                    <div className="space-y-3">
                      <p className="text-[10px] font-bold text-brand-gold uppercase tracking-[0.2em] flex items-center gap-2">
                        <Tag size={12}/> Essenciais de Beleza
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {result.visagismo.barba_ou_make.produtos.map((p, i) => (
                          <span key={i} className="px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-xl text-[11px] font-medium text-slate-600">
                            {p}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {result.visagismo?.barba_ou_make?.tecnicas && result.visagismo.barba_ou_make.tecnicas.length > 0 && (
                    <div className="space-y-3">
                      <p className="text-[10px] font-bold text-brand-graphite uppercase tracking-[0.2em] flex items-center gap-2">
                        <BookOpen size={12}/> Passo a Passo
                      </p>
                      <ul className="space-y-2">
                        {result.visagismo.barba_ou_make.tecnicas.map((t, i) => (
                          <li key={i} className="flex gap-3 text-xs text-slate-500 leading-relaxed">
                            <span className="w-5 h-5 bg-brand-gold/10 text-brand-gold rounded-full flex items-center justify-center text-[10px] font-bold shrink-0">{i+1}</span>
                            {t}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
               </div>
            </div>
          </div>

          {!isPremium && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-8 text-center bg-white/5 backdrop-blur-[4px] rounded-[40px]">
               <div className="w-24 h-24 bg-brand-graphite rounded-[32px] flex items-center justify-center text-brand-gold mb-8 shadow-2xl border-4 border-white animate-bounce">
                 <Lock size={40} />
               </div>
               <h4 className="text-3xl font-serif font-bold text-brand-graphite mb-4">Liberar Guia de Beleza Completo</h4>
               <button 
                 onClick={onUpgrade}
                 className="flex items-center gap-4 px-10 py-5 bg-brand-gold text-brand-graphite rounded-3xl font-bold shadow-2xl hover:scale-105 transition-all"
               >
                 <CreditCard size={24} />
                 <span>UPGRADE AGORA</span>
                 <ArrowRight size={20} />
               </button>
            </div>
          )}
        </section>

        {/* Curadoria Virtual (Try-On) */}
        <section className={`transition-all duration-700 ${!isPremium ? 'blur-xl opacity-30 pointer-events-none' : ''}`}>
           <div className="mb-10 space-y-8">
             <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
               <div>
                 <h3 className="font-serif text-3xl font-bold text-brand-graphite">Curadoria de Looks</h3>
                 <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-2">Harmonização Inteligente Vizu AI</p>
               </div>
               
               <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200 overflow-x-auto whitespace-nowrap">
                  {['Todas', 'Trabalho', 'Casual', 'Festa'].map((f) => (
                    <button
                      key={f}
                      onClick={() => setOccasionFilter(f as OccasionFilter)}
                      className={`px-5 py-2.5 rounded-xl text-[10px] font-bold transition-all ${occasionFilter === f ? 'bg-white text-brand-graphite shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                      {f}
                    </button>
                  ))}
               </div>
             </div>

             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                   <label className="text-[9px] font-bold text-slate-400 uppercase ml-2 tracking-widest">Estação do Ano</label>
                   <select 
                     value={seasonFilter} 
                     onChange={e => setSeasonFilter(e.target.value as SeasonFilter)}
                     className="w-full p-3 bg-white border border-slate-100 rounded-2xl text-[10px] font-bold text-brand-graphite outline-none focus:ring-2 focus:ring-brand-gold transition-all"
                   >
                     <option value="Todas">Todas as Estações</option>
                     <option value="Primavera">Primavera</option>
                     <option value="Verão">Verão</option>
                     <option value="Outono">Outono</option>
                     <option value="Inverno">Inverno</option>
                   </select>
                </div>
                <div className="space-y-2">
                   <label className="text-[9px] font-bold text-slate-400 uppercase ml-2 tracking-widest">Estilo Sugerido</label>
                   <select 
                     value={styleFilter} 
                     onChange={e => setStyleFilter(e.target.value)}
                     className="w-full p-3 bg-white border border-slate-100 rounded-2xl text-[10px] font-bold text-brand-graphite outline-none focus:ring-2 focus:ring-brand-gold transition-all"
                   >
                     {availableStyles.map(s => <option key={s} value={s}>{s}</option>)}
                   </select>
                </div>
             </div>
           </div>

           {filteredLooks.length > 0 ? (
             <div className="grid md:grid-cols-2 gap-8">
               {filteredLooks.map((look, idx) => (
                 <div key={idx} className="bg-white rounded-[40px] border border-slate-100 flex flex-col group hover:border-brand-gold/30 transition-all hover:shadow-2xl overflow-hidden shadow-sm">
                    <div className="p-8 flex-1">
                        {look.generatedImage ? (
                          <div className="aspect-[3/4] rounded-3xl overflow-hidden mb-6 relative bg-slate-900 shadow-2xl">
                             <img src={look.generatedImage} className="w-full h-full object-cover animate-fade-in" />
                             <div className="absolute bottom-6 left-6 right-6 p-4 bg-brand-graphite/90 backdrop-blur-md rounded-2xl border border-white/10 flex justify-between items-center">
                                <span className="text-[10px] text-brand-gold font-bold uppercase tracking-widest">Visualização em você</span>
                                <button onClick={() => {
                                   const updated = [...localOutfits];
                                   updated[look.originalIdx].generatedImage = undefined;
                                   setLocalOutfits(updated);
                                }} className="text-white hover:text-brand-gold transition-colors"><Info size={16}/></button>
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
                            <p className="text-xs text-slate-500 leading-relaxed text-justify h-24 overflow-hidden line-clamp-4">{look.detalhes}</p>
                          </div>
                        )}
                        
                        {isPremium && !look.generatedImage && (
                          <button 
                            disabled={generatingLookIdx !== null}
                            onClick={() => handleVirtualTryOn(look.originalIdx, look)}
                            className="w-full mt-6 py-4 bg-brand-graphite text-white rounded-[24px] text-sm font-bold flex items-center justify-center gap-3 hover:bg-brand-gold transition-all disabled:opacity-50 active:scale-95 shadow-xl group"
                          >
                            {generatingLookIdx === look.originalIdx ? (
                              <><Loader2 size={18} className="animate-spin" /> PROCESSANDO...</>
                            ) : (
                              <><Wand2 size={18} /> VER LOOK EM MIM</>
                            )}
                          </button>
                        )}
                    </div>
                    
                    <div className="bg-slate-50/50 border-t border-slate-50 p-4 flex justify-between items-center px-8">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Gostou deste estilo?</span>
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
               <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto text-slate-200 mb-6 shadow-sm"><Filter size={40}/></div>
               <h4 className="font-bold text-slate-400 text-lg">Nenhum look nesta combinação</h4>
               <p className="text-sm text-slate-400 mt-2">Tente desativar os filtros para ver todas as opções.</p>
             </div>
           )}
        </section>
      </div>
      
      <div className="bg-brand-graphite p-10 text-center flex flex-col items-center gap-4">
        <div className="flex items-center gap-3 opacity-30 grayscale invert">
          <Logo className="w-6 h-6" />
          <span className="font-serif text-xl font-bold text-white tracking-tight">VizuHalizando AI</span>
        </div>
        <p className="text-[9px] text-white/20 font-bold uppercase tracking-[0.5em]">Consultoria de Imagem de Luxo • {new Date().getFullYear()}</p>
      </div>
    </div>
  );
};
