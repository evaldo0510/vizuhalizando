
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  X, CheckCircle2, Sparkles, 
  Scissors, Palette, Glasses, Shirt, Info, ArrowRight,
  Filter, Sun, ThumbsUp, ThumbsDown,
  Download, Wand2, Loader2, UserCheck, Tag, BookOpen,
  Zap, ZoomIn, Maximize2, Move, FileImage, Check, RefreshCw, Coins, Code, Share2, FileCode,
  User, Layers, Eye, Smartphone, Copy, ExternalLink, AlertTriangle, ShieldAlert, ChevronLeft, ChevronRight
} from 'lucide-react';
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import type { AnalysisResult, OutfitSuggestion } from '../types';
import { generateVisualEdit } from '../services/geminiService';
import { db } from '../services/database';
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

type OccasionFilter = 'Todas' | 'Trabalho' | 'Casual' | 'Noite' | 'Esportivo';

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
  const [userCredits, setUserCredits] = useState(0);
  const [showGuide, setShowGuide] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (result?.sugestoes_roupa) {
      setLocalOutfits(Array.isArray(result.sugestoes_roupa) ? result.sugestoes_roupa : []);
    }
    loadUserCredits();
  }, [result]);

  const loadUserCredits = async () => {
    try {
      const user = await db.getCurrentUser();
      if (user) setUserCredits(user.creditos);
    } catch (e) {
      console.warn("Erro ao ler créditos");
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const { scrollLeft, clientWidth } = scrollContainerRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth : scrollLeft + clientWidth;
      scrollContainerRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  const handleShare = async (imageSrc: string, title: string) => {
    try {
      if (navigator.share) {
        const response = await fetch(imageSrc);
        const blob = await response.blob();
        const file = new File([blob], 'meu-look-vizu.png', { type: 'image/png' });
        
        await navigator.share({
          title: `VizuHalizando: ${title}`,
          text: `Minha nova identidade visual criada com IA no VizuHalizando!`,
          files: [file],
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert("Link do Atelier copiado!");
      }
    } catch (err) {
      console.error("Erro ao compartilhar:", err);
    }
  };

  const handleDownloadImage = async (imageSrc: string, format: 'png' | 'jpeg' | 'json', title: string = 'look') => {
    const user = await db.getCurrentUser();
    if (!user) return;

    if (!isPremium && format !== 'json') {
      const hasCredits = await db.useCredit(user.id);
      if (!hasCredits) {
        onUpgrade();
        return;
      }
      setUserCredits(prev => Math.max(0, prev - 1));
    }

    setIsProcessingDownload(true);
    try {
      if (format === 'json') {
        const exportData = {
          app: "VizuHalizando Studio",
          exportedAt: new Date().toISOString(),
          client: userName,
          analysis: { biotype: result.biotipo, face: result.formato_rosto_detalhado },
          look: { title, image: imageSrc }
        };
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `vizu-look-${title.replace(/\s+/g, '-').toLowerCase()}.json`;
        link.click();
        URL.revokeObjectURL(url);
      } else {
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
        if (ctx) {
          if (format === 'jpeg') {
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
          }
          ctx.drawImage(img, 0, 0);
          const dataUrl = canvas.toDataURL(`image/${format}`, 0.95);
          const link = document.createElement('a');
          link.href = dataUrl;
          link.download = `vizu-look-${title.replace(/\s+/g, '-').toLowerCase()}.${format === 'jpeg' ? 'jpg' : 'png'}`;
          link.click();
        }
      }
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 2000);
    } catch (error) {
      console.error("Erro no download:", error);
      alert("Erro ao processar o download da imagem.");
    } finally {
      setIsProcessingDownload(false);
    }
  };

  const handleLocalFeedback = (idx: number, type: 'like' | 'dislike') => {
    const updated = [...localOutfits];
    if (!updated[idx]) return;
    const newFeedback = updated[idx].feedback === type ? null : type;
    updated[idx].feedback = newFeedback;
    setLocalOutfits(updated);
    if (onFeedback) onFeedback(idx, newFeedback);
  };

  const handleVirtualTryOn = async (idx: number, outfit: OutfitSuggestion) => {
    if (!userImage) return;
    setGeneratingLookIdx(idx);
    try {
      const base64Clean = userImage.split(',')[1] || userImage;
      const generatedBase64 = await generateVisualEdit(
        base64Clean,
        'outfit',
        outfit.titulo,
        outfit.detalhes,
        `Biotipo: ${result.biotipo}`,
        ""
      );
      const updated = [...localOutfits];
      updated[idx].generatedImage = `data:image/png;base64,${generatedBase64}`;
      setLocalOutfits(updated);
    } catch (error: any) {
      alert(`Erro no Provador: ${error.message}`);
    } finally {
      setGeneratingLookIdx(null);
    }
  };

  const filteredLooks = useMemo(() => {
    if (!Array.isArray(localOutfits)) return [];
    return localOutfits.filter((look) => {
      if (!look) return false;
      const filter = occasionFilter.toLowerCase();
      return filter === 'todas' || (look.ocasiao?.toLowerCase() || '').includes(filter);
    }).map((look) => ({ ...look, originalIdx: localOutfits.findIndex(l => l === look) }));
  }, [localOutfits, occasionFilter]);

  const qualityIssue = result.quality_check && !result.quality_check.valid;

  return (
    <div className="w-full bg-white animate-fade-in flex flex-col relative min-h-screen">
      
      {/* BANNER DE QUALIDADE */}
      {qualityIssue && (
        <div className="bg-amber-50 border-b border-amber-100 px-12 py-3 flex items-center justify-between gap-4">
           <div className="flex items-center gap-3">
              <AlertTriangle size={18} className="text-amber-500" />
              <p className="text-xs text-amber-700 font-bold uppercase tracking-widest">IA detectou baixa nitidez. Precisão estimada: {result.quality_check?.accuracy_estimate || "70"}%</p>
           </div>
           <button onClick={onClose} className="text-[10px] font-bold text-amber-600 uppercase border-b border-amber-600">Refazer Captura</button>
        </div>
      )}

      {/* STUDIO DE EXPORTAÇÃO */}
      {expandedLook && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 md:p-8 animate-fade-in">
           <div className="absolute inset-0 bg-brand-graphite/95 backdrop-blur-3xl" onClick={() => setExpandedLook(null)}></div>
           <div className="relative w-full h-full max-w-[1400px] bg-[#0A0A0A] rounded-[40px] overflow-hidden shadow-2xl flex flex-col lg:flex-row border border-white/5">
              <button onClick={() => setExpandedLook(null)} className="absolute top-8 right-8 z-[10002] p-4 bg-white/5 text-white hover:bg-brand-gold rounded-full transition-all border border-white/10 backdrop-blur-md">
                 <X size={24} />
              </button>
              
              <div className="flex-[2] bg-black relative flex items-center justify-center overflow-hidden">
                 <TransformWrapper initialScale={1} minScale={0.8} maxScale={8} centerOnInit>
                    <TransformComponent wrapperClass="w-full h-full" contentClass="w-full h-full">
                       <img src={expandedLook.generatedImage} className="w-full h-full object-contain" alt="Look HD" />
                    </TransformComponent>
                 </TransformWrapper>
              </div>

              <div className="flex-1 p-12 bg-[#111] flex flex-col space-y-10 overflow-y-auto">
                 <div className="space-y-4">
                    <h4 className="text-brand-gold text-[10px] font-bold uppercase tracking-[0.5em] flex items-center gap-2">Studio Export</h4>
                    <h3 className="text-4xl font-serif font-bold text-white leading-tight">{expandedLook.titulo}</h3>
                    <p className="text-slate-500 text-sm leading-relaxed">{expandedLook.detalhes}</p>
                 </div>

                 <div className="space-y-6">
                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest border-b border-white/10 pb-2">Selecionar Formato para Download</p>
                    
                    <div className="grid gap-4">
                        <button onClick={() => handleDownloadImage(expandedLook!.generatedImage!, 'png', expandedLook!.titulo)} className="group bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-4 transition-all hover:bg-brand-gold/10 hover:border-brand-gold/40">
                            <div className="w-12 h-16 rounded-lg overflow-hidden bg-slate-900 shrink-0"><img src={expandedLook.generatedImage} className="w-full h-full object-cover" /></div>
                            <div className="flex-1 text-left"><h5 className="text-white font-bold text-sm">PNG HD</h5><p className="text-[9px] text-slate-500 font-bold uppercase">Qualidade Máxima</p></div>
                            <div className="p-2 rounded-full text-brand-gold bg-brand-gold/10">
                              {isProcessingDownload ? <Loader2 className="animate-spin" size={18}/> : <FileImage size={18}/>}
                            </div>
                        </button>
                        <button onClick={() => handleDownloadImage(expandedLook!.generatedImage!, 'jpeg', expandedLook!.titulo)} className="group bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-4 transition-all hover:bg-blue-400/10 hover:border-blue-400/40">
                            <div className="w-12 h-16 rounded-lg overflow-hidden bg-slate-900 shrink-0 opacity-80"><img src={expandedLook.generatedImage} className="w-full h-full object-cover" /></div>
                            <div className="flex-1 text-left"><h5 className="text-white font-bold text-sm">JPG Otimizado</h5><p className="text-[9px] text-slate-500 font-bold uppercase">Ideal para Web</p></div>
                            <div className="p-2 rounded-full text-blue-400 bg-blue-400/10">
                              {isProcessingDownload ? <Loader2 className="animate-spin" size={18}/> : <Download size={18}/>}
                            </div>
                        </button>
                    </div>
                 </div>

                 <button onClick={() => handleShare(expandedLook!.generatedImage!, expandedLook!.titulo)} className="w-full py-5 border border-brand-gold/20 bg-brand-gold/5 text-brand-gold rounded-2xl text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-brand-gold hover:text-brand-graphite transition-all">
                    <Share2 size={18}/> Compartilhar Atelier
                 </button>

                 <div className="mt-auto">
                    <button onClick={() => setExpandedLook(null)} className="w-full py-5 bg-white text-black rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl">Concluir Exportação</button>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* HEADER */}
      <header className="sticky top-0 z-[100] px-10 py-6 bg-white/90 backdrop-blur-xl flex justify-between items-center border-b border-slate-100">
        <div className="flex items-center gap-4 cursor-pointer" onClick={onClose}>
          <Logo className="w-10 h-10" />
          <div className="flex flex-col">
            <h2 className="text-lg font-serif font-bold text-brand-graphite">Atelier {userName}</h2>
            <span className="text-[9px] text-brand-gold font-bold uppercase tracking-widest">ID: {result.formato_rosto_detalhado}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setShowGuide(true)} className="flex items-center gap-2 px-5 py-2.5 bg-slate-50 text-slate-600 rounded-full border border-slate-200 text-[10px] font-bold uppercase tracking-widest hover:bg-brand-gold hover:text-white transition-all">
            <BookOpen size={14}/> Guia Visagista
          </button>
          <button onClick={onDownloadPDF} className="hidden md:flex items-center gap-2 px-5 py-2.5 bg-brand-graphite text-white rounded-full text-[10px] font-bold uppercase tracking-widest shadow-lg">
            <Download size={14}/> PDF Pro
          </button>
          <button onClick={onClose} className="p-2.5 bg-slate-100 text-slate-400 rounded-full hover:bg-red-50 hover:text-red-500 transition-all"><X size={20}/></button>
        </div>
      </header>

      {/* CONTEÚDO */}
      <main className="flex-1 overflow-x-hidden">
        <div className="px-10 py-16 space-y-20 max-w-7xl mx-auto">
          
          {/* DASHBOARD */}
          <section className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in-up">
            <div className="lg:col-span-2 flex flex-col justify-center pr-10">
               <h1 className="text-6xl font-serif font-bold text-brand-graphite mb-4 leading-tight">Sua imagem,<br/><span className="text-brand-gold italic">redefinida.</span></h1>
               <p className="text-slate-500 font-medium leading-relaxed">Analise biométrica completa com precisão neural.</p>
            </div>
            <div className="p-8 bg-slate-50 rounded-[40px] border border-slate-100 shadow-inner flex flex-col justify-between h-56">
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Rosto</p>
               <h4 className="text-2xl font-serif font-bold text-brand-graphite">{result.formato_rosto_detalhado}</h4>
               <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-brand-gold shadow-sm"><UserCheck size={20}/></div>
            </div>
            <div className="p-8 bg-brand-graphite rounded-[40px] shadow-2xl flex flex-col justify-between h-56 text-white border border-white/5">
               <p className="text-[10px] font-bold text-brand-gold/50 uppercase tracking-widest">Biotipo</p>
               <h4 className="text-2xl font-serif font-bold">{result.biotipo}</h4>
               <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-brand-gold shadow-sm"><Layers size={20}/></div>
            </div>
          </section>

          {/* LOOKS - CARROSSEL LUXUOSO */}
          <section className="space-y-12">
            <div className="flex items-end justify-between">
               <div>
                  <h3 className="text-4xl font-serif font-bold text-brand-graphite">Looks sob Medida</h3>
                  <div className="flex gap-4 mt-4">
                    {['Todas', 'Trabalho', 'Casual', 'Noite'].map(f => (
                      <button key={f} onClick={() => setOccasionFilter(f as any)} className={`text-[10px] font-bold uppercase tracking-widest transition-all border-b-2 pb-1 ${occasionFilter === f ? 'text-brand-gold border-brand-gold' : 'text-slate-300 border-transparent hover:text-slate-500'}`}>{f}</button>
                    ))}
                  </div>
               </div>
               <div className="flex gap-3">
                  <button onClick={() => scroll('left')} className="p-4 bg-slate-50 text-slate-400 rounded-full border border-slate-100 hover:bg-white hover:text-brand-gold shadow-sm transition-all"><ChevronLeft size={20}/></button>
                  <button onClick={() => scroll('right')} className="p-4 bg-slate-50 text-slate-400 rounded-full border border-slate-100 hover:bg-white hover:text-brand-gold shadow-sm transition-all"><ChevronRight size={20}/></button>
               </div>
            </div>

            <div 
              ref={scrollContainerRef}
              className="flex gap-10 overflow-x-auto snap-x snap-mandatory pb-20 scrollbar-hide -mx-10 px-10"
            >
              {filteredLooks.map((look, idx) => (
                <div key={idx} className="flex-shrink-0 w-[320px] md:w-[400px] snap-start group animate-fade-in-up" style={{ animationDelay: `${idx * 100}ms` }}>
                  <div className="relative aspect-[3/4.2] rounded-[50px] overflow-hidden bg-slate-50 shadow-2xl border border-slate-100">
                    {generatingLookIdx === look.originalIdx && (
                        <div className="absolute inset-0 z-50 bg-brand-graphite/95 backdrop-blur-3xl flex flex-col items-center justify-center text-center p-10 text-white">
                            <Loader2 size={60} className="text-brand-gold animate-spin mb-6" />
                            <h4 className="text-xl font-serif italic mb-1">Tecendo Visual...</h4>
                            <p className="text-[9px] text-brand-gold font-bold uppercase tracking-widest animate-pulse">Renderização 8K</p>
                        </div>
                    )}

                    {look.generatedImage ? (
                        <div className="w-full h-full relative group/img cursor-pointer" onClick={() => setExpandedLook(look)}>
                            <img src={look.generatedImage} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-all duration-500 flex flex-col items-center justify-center">
                                <div className="p-5 bg-white/10 backdrop-blur-3xl rounded-full text-white border border-white/20"><Maximize2 size={32}/></div>
                                <span className="text-white text-[10px] font-bold uppercase tracking-[0.4em] mt-5">Abrir Studio Export</span>
                            </div>
                        </div>
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center p-12 text-center space-y-8">
                            <div className="p-6 bg-white rounded-[32px] text-brand-gold shadow-xl border border-slate-50 group-hover:rotate-6 transition-all"><Shirt size={48}/></div>
                            <div className="space-y-4">
                                <h4 className="text-2xl font-serif font-bold text-brand-graphite">{look.titulo}</h4>
                                <p className="text-sm text-slate-400 font-medium leading-relaxed line-clamp-3">{look.detalhes}</p>
                            </div>
                            <button onClick={() => handleVirtualTryOn(look.originalIdx, look)} className="w-full py-6 bg-brand-graphite text-white rounded-[32px] text-[11px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-brand-gold transition-all shadow-xl">
                              <Wand2 size={20}/> Ativar Provador
                            </button>
                        </div>
                    )}
                  </div>
                  {look.generatedImage && (
                    <div className="mt-8 px-4 space-y-2">
                      <div className="flex justify-between items-center"><h4 className="text-xl font-serif font-bold text-brand-graphite">{look.titulo}</h4><span className="text-[9px] font-bold text-brand-gold bg-brand-gold/5 px-3 py-1 rounded-full border border-brand-gold/10">{look.ocasiao}</span></div>
                      <p className="text-slate-400 text-xs font-medium leading-relaxed line-clamp-2">{look.detalhes}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>

      <VisagismGuideModal isOpen={showGuide} onClose={() => setShowGuide(false)} />
    </div>
  );
};
