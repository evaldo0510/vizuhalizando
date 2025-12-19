
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  X, Sparkles, Shirt, Download, Wand2, Loader2, UserCheck, Layers, Maximize2, FileImage, 
  ChevronLeft, ChevronRight, BookOpen, Scissors, Palette, Heart, Check, Zap, Info, Brush, 
  Figma, PenTool, Layout
} from 'lucide-react';
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import type { AnalysisResult, OutfitSuggestion } from '../types';
import { generateVisualEdit } from '../services/geminiService';
import { Logo } from './Logo';
import { VisagismGuideModal } from './VisagismGuideModal';

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

export const VisagismAnalysis: React.FC<VisagismAnalysisProps> = ({ 
  result, isPremium, userImage, userName, onUpgrade, onClose, onDownloadPDF, onFeedback 
}) => {
  const [occasionFilter, setOccasionFilter] = useState('Todas');
  const [localOutfits, setLocalOutfits] = useState<OutfitSuggestion[]>(Array.isArray(result?.sugestoes_roupa) ? result.sugestoes_roupa : []);
  const [generatingLookIdx, setGeneratingLookIdx] = useState<number | null>(null);
  const [loadingStep, setLoadingStep] = useState(0);
  const [expandedLook, setExpandedLook] = useState<OutfitSuggestion | null>(null);
  const [showGuide, setShowGuide] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const loadingMessages = [
    "Analisando caimento...",
    "Preservando textura real...",
    "Afinando iluminação...",
    "Finalizando Atelier..."
  ];

  useEffect(() => {
    let interval: any;
    if (generatingLookIdx !== null) {
      setLoadingStep(0);
      interval = setInterval(() => {
        setLoadingStep(prev => (prev + 1) % loadingMessages.length);
      }, 1500);
    }
    return () => clearInterval(interval);
  }, [generatingLookIdx]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const { scrollLeft, clientWidth } = scrollContainerRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth * 0.7 : scrollLeft + clientWidth * 0.7;
      scrollContainerRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  const handleVirtualTryOn = async (idx: number, outfit: OutfitSuggestion) => {
    if (!userImage) return;
    setGeneratingLookIdx(idx);
    try {
      const base64Clean = userImage.split(',')[1] || userImage;
      const gen = await generateVisualEdit(base64Clean, 'outfit', outfit.titulo, outfit.detalhes, `Biotipo: ${result.biotipo}`, "");
      const updated = [...localOutfits];
      updated[idx].generatedImage = `data:image/png;base64,${gen}`;
      setLocalOutfits(updated);
    } catch (e: any) {
      console.error(e);
    } finally {
      setGeneratingLookIdx(null);
    }
  };

  const filteredLooks = useMemo(() => {
    return localOutfits.filter(l => occasionFilter === 'Todas' || (l.ocasiao || '').includes(occasionFilter))
      .map(l => ({ ...l, originalIdx: localOutfits.findIndex(x => x === l) }));
  }, [localOutfits, occasionFilter]);

  return (
    <div className="w-full bg-[#FAFAFA] flex flex-col min-h-screen animate-fade-in font-sans">
      
      {/* VIEW HD LOOK */}
      {expandedLook && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 md:p-12 bg-brand-graphite/98 backdrop-blur-3xl animate-fade-in">
           <div className="relative w-full h-full max-w-7xl bg-black rounded-[56px] overflow-hidden flex flex-col lg:flex-row shadow-3xl border border-white/5">
              <button onClick={() => setExpandedLook(null)} className="absolute top-8 right-8 z-50 p-4 bg-white/5 text-white rounded-full hover:bg-brand-gold transition-all"><X strokeWidth={1} size={28}/></button>
              
              <div className="flex-[2] relative flex items-center justify-center bg-black overflow-hidden">
                 <TransformWrapper initialScale={1} centerOnInit>
                    <TransformComponent wrapperClass="w-full h-full" contentClass="w-full h-full">
                       <img src={expandedLook.generatedImage} className="w-full h-full object-contain" alt="HD View" />
                    </TransformComponent>
                 </TransformWrapper>
              </div>

              <div className="flex-1 p-14 flex flex-col justify-between bg-zinc-900">
                 <div className="space-y-10">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-brand-gold/10 text-brand-gold rounded-full border border-brand-gold/20">
                       <Zap size={14} strokeWidth={2}/> <span className="text-[10px] font-bold uppercase tracking-[0.3em]">Master Render v2.5</span>
                    </div>
                    <h3 className="text-5xl font-serif font-bold text-white leading-tight">{expandedLook.titulo}</h3>
                    <p className="text-zinc-400 text-lg leading-relaxed font-light">{expandedLook.detalhes}</p>
                 </div>
                 <button className="w-full py-7 bg-brand-gold text-brand-graphite rounded-[32px] font-bold uppercase text-[11px] tracking-[0.3em] hover:bg-white transition-all shadow-2xl">Exportar Dossiê HD</button>
              </div>
           </div>
        </div>
      )}

      {/* HEADER PROFESSIONAL */}
      <header className="px-10 py-8 bg-white/95 backdrop-blur-2xl border-b border-slate-100 flex justify-between items-center sticky top-0 z-[100] shadow-sm">
        <div className="flex items-center gap-6 cursor-pointer" onClick={onClose}>
           <Logo className="w-12 h-12" />
           <div className="flex flex-col">
              <h2 className="text-xl font-serif font-bold tracking-tight text-brand-graphite">Atelier {userName}</h2>
              <span className="text-[10px] text-brand-gold font-bold uppercase tracking-[0.3em]">{result.formato_rosto_detalhado} em foco</span>
           </div>
        </div>
        <div className="flex items-center gap-5">
           <button onClick={() => setShowGuide(true)} className="flex items-center gap-3 px-8 py-3 bg-slate-50 text-slate-500 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-brand-gold hover:text-white transition-all border border-slate-100 group shadow-sm">
             <Scissors size={16} strokeWidth={1.2} className="group-hover:rotate-12 transition-transform"/> Guia de Medidas
           </button>
           <button onClick={onClose} className="p-3 bg-slate-100 text-slate-400 rounded-full hover:bg-red-50 hover:text-red-500 transition-all"><X size={24} strokeWidth={1.2}/></button>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-10 py-20 space-y-28">
        
        {/* STATS BIOMÉTRICOS */}
        <section className="grid md:grid-cols-4 gap-10">
           <div className="md:col-span-2 space-y-6 flex flex-col justify-center">
              <h1 className="text-6xl lg:text-7xl font-serif font-bold text-brand-graphite leading-[1.05] animate-fade-in-up">Sua imagem,<br/><span className="text-brand-gold italic font-light">reescrita.</span></h1>
              <p className="text-slate-400 text-xl font-light max-w-md">Uma consultoria que preserva sua humanidade através de algoritmos de alta fidelidade.</p>
           </div>
           <div className="p-12 bg-white rounded-[56px] border border-slate-100 flex flex-col justify-between h-64 group hover:shadow-3xl transition-all duration-700 hover:-translate-y-2">
              <div className="flex justify-between items-start">
                 <span className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.3em]">Geometria</span>
                 <PenTool size={22} strokeWidth={1.2} className="text-brand-gold"/>
              </div>
              <h4 className="text-3xl font-serif font-bold text-brand-graphite">{result.formato_rosto_detalhado}</h4>
           </div>
           <div className="p-12 bg-brand-graphite rounded-[56px] text-white flex flex-col justify-between h-64 shadow-2xl relative overflow-hidden group hover:scale-[1.02] transition-all duration-700">
              <div className="absolute -top-12 -right-12 w-48 h-48 bg-brand-gold/10 rounded-full blur-[60px] group-hover:bg-brand-gold/20 transition-all"></div>
              <div className="flex justify-between items-start relative z-10">
                 <span className="text-[10px] font-bold text-brand-gold/50 uppercase tracking-[0.3em]">Proporção</span>
                 <Layout size={22} strokeWidth={1.2} className="text-brand-gold"/>
              </div>
              <h4 className="text-3xl font-serif font-bold relative z-10">{result.biotipo}</h4>
           </div>
        </section>

        {/* LOOKS SELECTION */}
        <section className="space-y-16">
           <div className="flex items-end justify-between">
              <div className="space-y-6">
                 <h3 className="text-5xl font-serif font-bold">A Curadoria</h3>
                 <div className="flex gap-8">
                    {['Todas', 'Trabalho', 'Casual', 'Noite'].map(f => (
                       <button 
                        key={f} 
                        onClick={() => setOccasionFilter(f)} 
                        className={`text-[11px] font-bold uppercase tracking-[0.3em] transition-all border-b-2 pb-3 ${occasionFilter === f ? 'text-brand-gold border-brand-gold scale-110' : 'text-slate-300 border-transparent hover:text-slate-500'}`}
                       >
                        {f}
                       </button>
                    ))}
                 </div>
              </div>
              <div className="flex gap-5">
                 <button onClick={() => scroll('left')} className="p-6 bg-white border border-slate-100 rounded-full hover:bg-brand-gold hover:text-white transition-all shadow-sm active:scale-90"><ChevronLeft size={28} strokeWidth={1.2}/></button>
                 <button onClick={() => scroll('right')} className="p-6 bg-white border border-slate-100 rounded-full hover:bg-brand-gold hover:text-white transition-all shadow-sm active:scale-90"><ChevronRight size={28} strokeWidth={1.2}/></button>
              </div>
           </div>

           <div ref={scrollContainerRef} className="dynamic-carousel flex gap-10 overflow-x-auto pb-16 scrollbar-hide -mx-10 px-10 snap-x snap-mandatory">
              {filteredLooks.map((look, i) => (
                 <div key={i} className="carousel-item flex-shrink-0 w-[320px] md:w-[420px] snap-center group">
                    <div className="relative aspect-[3/4.4] rounded-[64px] overflow-hidden bg-white shadow-xl border border-slate-50 transition-all duration-1000 group-hover:shadow-3xl group-hover:-translate-y-4">
                       
                       {generatingLookIdx === look.originalIdx && (
                          <div className="absolute inset-0 z-50 bg-brand-graphite/98 flex flex-col items-center justify-center p-14 text-center space-y-10 animate-fade-in">
                             <div className="relative">
                                <Loader2 size={72} strokeWidth={0.8} className="text-brand-gold animate-spin" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <Brush size={28} strokeWidth={1.2} className="text-white/30 animate-pulse" />
                                </div>
                             </div>
                             <div className="space-y-4">
                                <h4 className="text-white font-serif italic text-3xl">{loadingMessages[loadingStep]}</h4>
                                <div className="w-56 h-1 bg-white/5 rounded-full mx-auto overflow-hidden">
                                   <div className="h-full bg-brand-gold animate-progress"></div>
                                </div>
                                <p className="text-brand-gold text-[10px] font-bold uppercase tracking-[0.5em] pt-4">Renderização Humana Ativa</p>
                             </div>
                          </div>
                       )}

                       {look.generatedImage ? (
                          <div className="w-full h-full relative cursor-pointer overflow-hidden" onClick={() => setExpandedLook(look)}>
                             <img src={look.generatedImage} className="w-full h-full object-cover transition-transform duration-[2000ms] group-hover:scale-110" />
                             <div className="absolute inset-0 bg-brand-graphite/50 opacity-0 group-hover:opacity-100 transition-opacity duration-700 flex flex-col items-center justify-center gap-5">
                                <div className="p-7 bg-white/10 backdrop-blur-2xl rounded-full text-white border border-white/20"><Maximize2 size={36} strokeWidth={1.2}/></div>
                                <span className="text-white text-[11px] font-bold uppercase tracking-[0.4em]">Ampliar Detalhes</span>
                             </div>
                          </div>
                       ) : (
                          <div className="w-full h-full p-16 flex flex-col items-center justify-center text-center space-y-10 bg-gradient-to-b from-white to-[#FDFDFD]">
                             <div className="w-28 h-28 bg-brand-gold/5 rounded-[48px] flex items-center justify-center text-brand-gold group-hover:rotate-6 transition-all duration-700 shadow-inner">
                                <Shirt size={52} strokeWidth={1}/>
                             </div>
                             <div className="space-y-4">
                                <h4 className="font-serif font-bold text-3xl text-brand-graphite tracking-tight">{look.titulo}</h4>
                                <p className="text-[13px] text-slate-400 font-light leading-relaxed px-4 line-clamp-3">{look.detalhes}</p>
                             </div>
                             <button 
                                onClick={() => handleVirtualTryOn(look.originalIdx, look)} 
                                className="w-full py-7 bg-brand-graphite text-white rounded-[40px] font-bold uppercase text-[10px] tracking-[0.4em] flex items-center justify-center gap-4 hover:bg-brand-gold transition-all duration-700 shadow-2xl group/btn"
                             >
                                <Figma size={18} strokeWidth={1.2} className="group-hover/btn:rotate-12 transition-transform" /> 
                                ATIVAR ATELIER
                             </button>
                          </div>
                       )}
                    </div>
                    {look.generatedImage && (
                       <div className="mt-10 px-10 space-y-2 animate-fade-in flex justify-between items-start">
                          <div className="space-y-1">
                            <h5 className="font-serif font-bold text-2xl text-brand-graphite">{look.titulo}</h5>
                            <span className="text-[10px] font-bold text-brand-gold uppercase tracking-[0.4em]">{look.ocasiao}</span>
                          </div>
                          <button className="p-4 text-slate-200 hover:text-brand-gold transition-all hover:scale-110"><Heart size={24} strokeWidth={1.2}/></button>
                       </div>
                    )}
                 </div>
              ))}
           </div>
        </section>
      </main>

      <VisagismGuideModal isOpen={showGuide} onClose={() => setShowGuide(false)} />
    </div>
  );
};
