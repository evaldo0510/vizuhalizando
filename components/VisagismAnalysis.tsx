
import React, { useState, useMemo, useEffect } from 'react';
import { 
  X, CheckCircle2, Lock, Sparkles, CreditCard, 
  Scissors, Palette, Glasses, Shirt, Info, ArrowRight,
  Filter, Sun, ThumbsUp, ThumbsDown,
  Download, Wand2, Loader2, UserCheck, Tag, BookOpen,
  Zap, ZoomIn, Maximize2, Move, FileImage, Check, RefreshCw, Coins, Code, Share2, FileCode,
  User, Layers, Eye, Smartphone, Copy, ExternalLink, AlertTriangle, ShieldAlert
} from 'lucide-react';
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import type { AnalysisResult, OutfitSuggestion } from '../types';
import { generateVisualEdit } from '../services/geminiService';
import { db } from '../services/database';
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

  useEffect(() => {
    if (result?.sugestoes_roupa) {
      setLocalOutfits(Array.isArray(result.sugestoes_roupa) ? result.sugestoes_roupa : []);
    }
    loadUserCredits();
  }, [result]);

  const loadUserCredits = async () => {
    const user = await db.getCurrentUser();
    if (user) setUserCredits(user.creditos);
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
      alert("Use o botão de download para salvar e compartilhar manualmente.");
    }
  };

  const handleDownloadImage = async (imageSrc: string, format: 'png' | 'jpeg' | 'json', title: string = 'look') => {
    const user = await db.getCurrentUser();
    if (!user) return;

    if (!isPremium && format !== 'json') {
      const hasCredits = await db.useCredit(user.id);
      if (!hasCredits) {
        alert("Você precisa de créditos para baixar este look em HD.");
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
          version: "4.8",
          exportedAt: new Date().toISOString(),
          client: userName,
          analysis: { biotype: result.biotipo, face: result.formato_rosto_detalhado },
          look: { title, image: imageSrc, details: expandedLook?.detalhes }
        };
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `vizu-look-data-${title}.json`;
        link.click();
        URL.revokeObjectURL(url);
      } else {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = imageSrc;
        await new Promise((resolve) => { img.onload = resolve; });
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
          const dataUrl = canvas.toDataURL(`image/${format}`, 1.0);
          const link = document.createElement('a');
          link.href = dataUrl;
          link.download = `vizu-look-${title.toLowerCase().replace(/\s+/g, '-')}.${format === 'jpeg' ? 'jpg' : 'png'}`;
          link.click();
        }
      }
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 2000);
    } catch (error) {
      console.error("Erro no processamento do arquivo:", error);
    } finally {
      setIsProcessingDownload(false);
    }
  };

  const handleLocalFeedback = (idx: number, type: 'like' | 'dislike') => {
    const updated = [...localOutfits];
    const newFeedback = updated[idx].feedback === type ? null : type;
    updated[idx].feedback = newFeedback;
    setLocalOutfits(updated);
    if (onFeedback) onFeedback(idx, newFeedback);
  };

  const handleVirtualTryOn = async (idx: number, outfit: OutfitSuggestion) => {
    if (!userImage || !Array.isArray(localOutfits)) return;
    setGeneratingLookIdx(idx);
    try {
      const base64Clean = userImage.split(',')[1] || userImage;
      const generatedBase64 = await generateVisualEdit(
        base64Clean,
        'outfit',
        outfit.titulo,
        outfit.detalhes,
        `Biotipo: ${result.biotipo}. Harmonização: ${outfit.visagismo_sugerido}`,
        ""
      );
      const updated = [...localOutfits];
      if (updated[idx]) {
        updated[idx].generatedImage = `data:image/png;base64,${generatedBase64}`;
        setLocalOutfits(updated);
      }
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
    <div className="w-full max-w-[1440px] bg-white animate-fade-in flex flex-col relative min-h-screen">
      
      {/* BANNER DE QUALIDADE DA IMAGEM */}
      {qualityIssue && (
        <div className="bg-amber-50 border-b border-amber-100 px-12 py-4 flex flex-col md:flex-row items-center justify-between gap-4 animate-fade-in">
           <div className="flex items-center gap-4">
              <div className="p-2 bg-amber-500 text-white rounded-full">
                 <AlertTriangle size={20} />
              </div>
              <div>
                 <p className="text-xs font-black text-amber-800 uppercase tracking-widest">Alerta de Integridade Biométrica</p>
                 <p className="text-sm text-amber-600 font-medium">{result.quality_check?.reason || "Imagem com baixa nitidez ou iluminação detectada."} Precisão estimada: <span className="font-black">{result.quality_check?.accuracy_estimate || "70"}%</span></p>
              </div>
           </div>
           <button onClick={onClose} className="px-6 py-2 bg-amber-500 text-white rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-amber-600 transition-all flex items-center gap-2">
              <RefreshCw size={14} /> Refazer Scan de Alta Qualidade
           </button>
        </div>
      )}

      {/* MODAL STUDIO DE EXPORTAÇÃO COM PREVIEWS VISUAIS */}
      {expandedLook && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-0 md:p-8 animate-fade-in">
           <div className="absolute inset-0 bg-brand-graphite/98 backdrop-blur-3xl" onClick={() => setExpandedLook(null)}></div>
           <div className="relative w-full h-full max-w-[1600px] bg-[#0A0A0A] md:rounded-[50px] overflow-hidden shadow-2xl flex flex-col lg:flex-row animate-scale-up border border-white/5">
              <button onClick={() => setExpandedLook(null)} className="absolute top-8 right-8 z-[10002] p-4 bg-white/5 text-white hover:bg-brand-gold rounded-full transition-all border border-white/10 backdrop-blur-md">
                 <X size={24} />
              </button>
              
              <div className="flex-[3] bg-black relative h-[60vh] lg:h-auto overflow-hidden">
                 <TransformWrapper initialScale={1} minScale={0.8} maxScale={8} centerOnInit>
                    <TransformComponent wrapperClass="w-full h-full cursor-zoom-in" contentClass="w-full h-full">
                       <img src={expandedLook.generatedImage} className="w-full h-full object-contain" alt="Look HD" />
                    </TransformComponent>
                 </TransformWrapper>
              </div>

              <div className="flex-1 p-12 lg:p-16 bg-[#111] flex flex-col border-l border-white/5 space-y-12 overflow-y-auto custom-scrollbar">
                 <div className="space-y-4">
                    <h4 className="text-brand-gold text-[10px] font-bold uppercase tracking-[0.6em] flex items-center gap-2">
                       <Sparkles size={14}/> Atelier Export Hub
                    </h4>
                    <h3 className="text-5xl font-serif font-bold text-white leading-tight">{expandedLook.titulo}</h3>
                    <div className="flex items-center gap-4 pt-4">
                        <button onClick={() => handleShare(expandedLook.generatedImage!, expandedLook.titulo)} className="flex items-center gap-2 text-brand-gold hover:text-white transition-all text-[11px] font-black uppercase tracking-widest bg-brand-gold/10 px-6 py-3 rounded-full border border-brand-gold/20 shadow-xl">
                           <Share2 size={18}/> Compartilhar Agora
                        </button>
                    </div>
                 </div>

                 {/* PREVIEWS DE FORMATO */}
                 <div className="space-y-6">
                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest border-b border-white/10 pb-2">Selecionar Formato</p>
                    
                    <div className="grid grid-cols-1 gap-4">
                        <button onClick={() => handleDownloadImage(expandedLook.generatedImage!, 'png', expandedLook.titulo)} className="group bg-white/5 border border-white/10 rounded-3xl p-5 flex items-center gap-5 transition-all hover:border-brand-gold/40 text-left">
                            <div className="w-16 h-20 rounded-xl overflow-hidden bg-slate-900 border border-white/5 shrink-0"><img src={expandedLook.generatedImage} className="w-full h-full object-cover" /></div>
                            <div className="flex-1"><h5 className="text-white font-bold text-sm">PNG HD</h5><p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest">Fundo Transparente Opcional</p></div>
                            <div className="p-3 bg-white/5 rounded-full text-brand-gold"><FileImage size={20}/></div>
                        </button>
                        <button onClick={() => handleDownloadImage(expandedLook.generatedImage!, 'jpeg', expandedLook.titulo)} className="group bg-white/5 border border-white/10 rounded-3xl p-5 flex items-center gap-5 transition-all hover:border-blue-400/40 text-left">
                            <div className="w-16 h-20 rounded-xl overflow-hidden bg-slate-900 border border-white/5 shrink-0 grayscale"><img src={expandedLook.generatedImage} className="w-full h-full object-cover" /></div>
                            <div className="flex-1"><h5 className="text-white font-bold text-sm">JPEG Otimizado</h5><p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest">Ideal para Redes Sociais</p></div>
                            <div className="p-3 bg-white/5 rounded-full text-blue-400"><Download size={20}/></div>
                        </button>
                        <button onClick={() => handleDownloadImage(expandedLook.generatedImage!, 'json', expandedLook.titulo)} className="group bg-white/5 border border-white/10 rounded-3xl p-5 flex items-center gap-5 transition-all hover:border-emerald-400/40 text-left">
                            <div className="w-16 h-20 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shrink-0"><Code className="text-emerald-500" size={32}/></div>
                            <div className="flex-1"><h5 className="text-white font-bold text-sm">Metadados JSON</h5><p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest">Para Ferramentas de Design</p></div>
                            <div className="p-3 bg-white/5 rounded-full text-emerald-500"><FileCode size={20}/></div>
                        </button>
                    </div>
                 </div>

                 <div className="mt-auto pt-10">
                    <button onClick={() => setExpandedLook(null)} className="w-full py-6 bg-white text-black rounded-2xl text-[12px] font-black uppercase tracking-[0.4em] hover:bg-brand-gold transition-all shadow-2xl active:scale-95">Fechar Studio</button>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* HEADER MINIMALISTA */}
      <header className="sticky top-0 z-[100] px-12 py-8 bg-white/80 backdrop-blur-xl flex justify-between items-center border-b border-slate-100">
        <div className="flex items-center gap-6">
          <Logo className="w-10 h-10" />
          <div className="h-8 w-px bg-slate-200"></div>
          <div>
            <h2 className="text-xl font-serif font-bold text-brand-graphite">Dossiê {userName}</h2>
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.2em]">Consultoria Atelier v4.8</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={onDownloadPDF} className="hidden md:flex items-center gap-2 px-6 py-3 bg-slate-50 text-slate-600 rounded-full border border-slate-200 text-[10px] font-bold uppercase tracking-widest hover:bg-brand-gold hover:text-white transition-all shadow-sm"><Download size={14}/> PDF Completo</button>
          {!isPremium && <div className="bg-brand-gold/10 px-4 py-2.5 rounded-full flex items-center gap-2 border border-brand-gold/20"><Coins size={14} className="text-brand-gold" /><span className="text-[10px] font-bold text-brand-gold">{userCredits} CR</span></div>}
          <button onClick={onClose} className="p-3 bg-brand-graphite text-white rounded-full hover:bg-red-500 transition-all shadow-lg active:scale-90"><X size={20}/></button>
        </div>
      </header>

      {/* CONTEÚDO PRINCIPAL - LAYOUT ABERTO */}
      <div className="px-12 py-16 space-y-24">
        
        {/* DASHBOARD BIOMÉTRICO */}
        <section className="animate-fade-in-up">
            <div className="grid lg:grid-cols-4 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <h1 className="text-7xl font-serif font-bold text-brand-graphite leading-[1.1]">Sua essência,<br/><span className="text-brand-gold italic">mapeada.</span></h1>
                    <p className="text-xl text-slate-500 font-light leading-relaxed max-w-xl">Uma análise técnica baseada na biometria facial e corporal para criar uma identidade visual autêntica.</p>
                </div>
                <div className={`p-10 rounded-[40px] border flex flex-col justify-between transition-all shadow-sm ${qualityIssue ? 'bg-amber-50/50 border-amber-200' : 'bg-slate-50 border-slate-100 hover:border-brand-gold/30'}`}>
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Formato de Rosto</p>
                        {qualityIssue && <ShieldAlert size={14} className="text-amber-500" />}
                      </div>
                      <h4 className="text-2xl font-serif font-bold text-brand-graphite">{result.formato_rosto_detalhado}</h4>
                    </div>
                    <div className="pt-6 border-t border-slate-200 flex items-center justify-between"><span className="text-[10px] font-bold text-brand-gold uppercase tracking-widest">Simetria Detectada</span><div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm text-brand-gold"><UserCheck size={20}/></div></div>
                </div>
                <div className="bg-brand-graphite p-10 rounded-[40px] shadow-2xl flex flex-col justify-between text-white border border-white/10 group transition-all hover:scale-[1.02]">
                    <div><p className="text-[10px] font-bold text-brand-gold/50 uppercase tracking-widest mb-4">Biotipo Corporal</p><h4 className="text-2xl font-serif font-bold">{result.biotipo}</h4></div>
                    <div className="pt-6 border-t border-white/10 flex items-center justify-between"><span className="text-[10px] font-bold text-white/50 uppercase tracking-widest">Proporção Áurea</span><div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center shadow-sm text-brand-gold group-hover:rotate-12 transition-transform"><Layers size={20}/></div></div>
                </div>
            </div>
        </section>

        {/* GALERIA DE LOOKS */}
        <section className="space-y-16">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-10">
                <div><h3 className="text-5xl font-serif font-bold text-brand-graphite tracking-tight">Curadoria Atelier</h3><p className="text-xs text-slate-400 font-bold uppercase tracking-[0.4em] mt-4">Sugestões baseadas na sua volumetria e biometria facial</p></div>
                <div className="flex bg-slate-100 p-2 rounded-full border border-slate-200 shadow-inner overflow-x-auto whitespace-nowrap scrollbar-hide">
                    {['Todas', 'Trabalho', 'Casual', 'Noite', 'Esportivo'].map((f) => (
                        <button key={f} onClick={() => setOccasionFilter(f as OccasionFilter)} className={`px-10 py-4 rounded-full text-[11px] font-black uppercase tracking-widest transition-all ${occasionFilter === f ? 'bg-white text-brand-graphite shadow-xl' : 'text-slate-400 hover:text-brand-graphite'}`}>{f}</button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-20 pb-40">
                {filteredLooks.map((look, idx) => (
                    <div key={idx} className="group/card flex flex-col space-y-10 animate-fade-in-up" style={{ animationDelay: `${idx * 150}ms` }}>
                        <div className="relative aspect-[3/4.5] rounded-[70px] overflow-hidden bg-slate-100 shadow-[0_50px_80px_-20px_rgba(0,0,0,0.15)] transition-all duration-1000 group-hover/card:shadow-brand-gold/30">
                            {generatingLookIdx === look.originalIdx && (
                                <div className="absolute inset-0 z-50 bg-brand-graphite/98 backdrop-blur-3xl flex flex-col items-center justify-center p-12 text-center text-white">
                                    <Loader2 size={80} className="text-brand-gold animate-spin mb-10" />
                                    <h4 className="text-3xl font-serif italic mb-2 tracking-tight">Renderizando Atelier...</h4>
                                    <p className="text-[10px] text-brand-gold font-bold uppercase tracking-[0.6em] animate-pulse">Inteligência Visual HD v4.8</p>
                                </div>
                            )}

                            {look.generatedImage ? (
                                <div className="w-full h-full relative cursor-pointer group/img" onClick={() => setExpandedLook(look)}>
                                    <img src={look.generatedImage} className="w-full h-full object-cover transition-transform duration-[4s] group-hover/card:scale-110" />
                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/img:opacity-100 transition-all duration-500 flex flex-col items-center justify-center backdrop-blur-[4px]">
                                        <div className="p-8 bg-white/10 backdrop-blur-3xl rounded-full text-white border border-white/20 shadow-4xl scale-75 group-hover/img:scale-100 transition-all"><Maximize2 size={40}/></div>
                                        <span className="text-white text-[12px] font-black uppercase tracking-[0.6em] mt-8 drop-shadow-2xl">Acessar Studio Export</span>
                                    </div>
                                    <div className="absolute top-10 right-10 flex flex-col gap-4">
                                        <button onClick={(e) => { e.stopPropagation(); handleLocalFeedback(look.originalIdx, 'like'); }} className={`p-5 rounded-full backdrop-blur-3xl border transition-all shadow-2xl ${look.feedback === 'like' ? 'bg-brand-gold text-white border-brand-gold scale-110' : 'bg-black/20 text-white border-white/20 hover:bg-brand-gold/80'}`}><ThumbsUp size={20}/></button>
                                        <button onClick={(e) => { e.stopPropagation(); handleLocalFeedback(look.originalIdx, 'dislike'); }} className={`p-5 rounded-full backdrop-blur-3xl border transition-all shadow-2xl ${look.feedback === 'dislike' ? 'bg-red-500 text-white border-red-500 scale-110' : 'bg-black/20 text-white border-white/20 hover:bg-red-500/80'}`}><ThumbsDown size={20}/></button>
                                    </div>
                                    <button onClick={(e) => { e.stopPropagation(); handleShare(look.generatedImage!, look.titulo); }} className="absolute bottom-10 right-10 p-6 bg-white text-brand-graphite rounded-full shadow-4xl hover:bg-brand-gold hover:text-white transition-all active:scale-90"><Share2 size={24}/></button>
                                </div>
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center p-20 text-center space-y-12">
                                    <div className="w-32 h-32 bg-white rounded-[50px] flex items-center justify-center text-brand-gold shadow-2xl border border-slate-50 transition-transform group-hover/card:rotate-6"><Shirt size={64}/></div>
                                    <div className="space-y-6"><h4 className="text-4xl font-serif font-bold text-brand-graphite leading-tight">{look.titulo}</h4><p className="text-base text-slate-500 leading-relaxed font-light line-clamp-4">{look.detalhes}</p></div>
                                    <button onClick={() => handleVirtualTryOn(look.originalIdx, look)} className="w-full py-8 bg-brand-graphite text-white rounded-[40px] text-[13px] font-black uppercase tracking-[0.4em] flex items-center justify-center gap-6 hover:bg-brand-gold transition-all shadow-2xl border border-white/10"><Wand2 size={24}/> Ativar Provador Digital</button>
                                </div>
                            )}
                        </div>
                        {look.generatedImage && (
                            <div className="px-6 space-y-4">
                                <div className="flex justify-between items-center"><h4 className="text-3xl font-serif font-bold text-brand-graphite">{look.titulo}</h4><span className="text-[10px] font-black text-brand-gold border border-brand-gold/30 px-4 py-1.5 rounded-full uppercase tracking-widest bg-brand-gold/5">{look.ocasiao}</span></div>
                                <p className="text-slate-400 text-sm leading-relaxed font-medium line-clamp-2">{look.detalhes}</p>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </section>
      </div>

      <footer className="px-12 py-24 bg-brand-graphite text-center mt-20 relative overflow-hidden">
          <div className="absolute inset-0 opacity-5 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
          <Logo className="w-16 h-16 mx-auto mb-10 grayscale invert opacity-60" />
          <h4 className="text-white font-serif text-3xl font-bold mb-4">VizuHalizando Professional Atelier</h4>
          <p className="text-[11px] text-white/30 font-bold uppercase tracking-[1.2em]">Excellence in AI Fashion Consultation</p>
          <div className="mt-16 flex justify-center gap-14">
              <button onClick={onDownloadPDF} className="text-[10px] font-black text-white/40 uppercase tracking-widest hover:text-brand-gold transition-all flex items-center gap-2 group"><Download size={16}/> Dossiê PDF</button>
              <button onClick={onClose} className="text-[10px] font-black text-white/40 uppercase tracking-widest hover:text-brand-gold transition-all flex items-center gap-2 group"><RefreshCw size={16}/> Novo Scan</button>
          </div>
      </footer>
    </div>
  );
};
