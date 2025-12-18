
import React, { useState, useRef } from 'react';
import { Eye, Save, Maximize2, Loader2, RotateCcw, Lock, Unlock, ZoomIn, Move, FileImage, Check, MousePointer2, Download } from 'lucide-react';
import { TransformWrapper, TransformComponent, ReactZoomPanPinchRef } from "react-zoom-pan-pinch";

interface ComparisonViewProps {
  generatedSrc: string;
  originalSrc: string;
  alt: string;
  onSave: () => void;
  onExpand: () => void;
  isSaving: boolean;
}

export const ComparisonView: React.FC<ComparisonViewProps> = ({ 
  generatedSrc, 
  originalSrc, 
  alt, 
  onSave, 
  onExpand, 
  isSaving: parentIsSaving 
}) => {
  const [isHolding, setIsHolding] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [showSaveOptions, setShowSaveOptions] = useState(false);
  const [isProcessingDownload, setIsProcessingDownload] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const generatedRef = useRef<ReactZoomPanPinchRef>(null);
  const originalRef = useRef<ReactZoomPanPinchRef>(null);

  const showOriginal = isHolding || isLocked;

  const handleDownload = async (format: 'png' | 'jpeg') => {
    setIsProcessingDownload(true);
    try {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = generatedSrc;

        await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
        });

        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error("Contexto do canvas falhou");

        if (format === 'jpeg') {
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        ctx.drawImage(img, 0, 0);

        const dataUrl = canvas.toDataURL(`image/${format}`, format === 'jpeg' ? 0.95 : 1.0);
        
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = `vizu-atelier-look-${Date.now()}.${format === 'jpeg' ? 'jpg' : 'png'}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        setIsSaved(true);
        setShowSaveOptions(false);
        onSave();
        
        setTimeout(() => {
            setIsSaved(false);
        }, 2500);

    } catch (error) {
        console.error("Erro ao baixar imagem", error);
        alert("Ocorreu um erro ao processar sua imagem.");
    } finally {
        setIsProcessingDownload(false);
    }
  };

  const handleResetZoom = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (showOriginal) {
          originalRef.current?.resetTransform();
      } else {
          generatedRef.current?.resetTransform();
      }
  };

  return (
    <div className="w-full h-full relative group select-none overflow-hidden rounded-[32px] bg-slate-100 dark:bg-slate-900 transition-all duration-300 shadow-2xl border border-slate-200/50 dark:border-white/5">
        
        {/* Layer 1: Generated Image */}
        <div className={`absolute inset-0 transition-opacity duration-300 ${showOriginal ? 'opacity-0 pointer-events-none' : 'opacity-100 pointer-events-auto'}`}>
            <TransformWrapper
                ref={generatedRef}
                initialScale={1}
                minScale={1}
                maxScale={8}
                centerOnInit
                wheel={{ step: 0.2 }}
                doubleClick={{ mode: "reset", disabled: false }}
            >
                <TransformComponent 
                    wrapperClass="w-full h-full !cursor-grab active:!cursor-grabbing"
                    contentClass="w-full h-full"
                    wrapperStyle={{ width: "100%", height: "100%" }}
                >
                    <img 
                        src={generatedSrc} 
                        alt={alt} 
                        className="w-full h-full object-cover" 
                        draggable={false}
                        onMouseDown={() => setIsHolding(true)}
                        onMouseUp={() => setIsHolding(false)}
                        onMouseLeave={() => setIsHolding(false)}
                        onTouchStart={() => setIsHolding(true)}
                        onTouchEnd={() => setIsHolding(false)}
                    />
                </TransformComponent>
            </TransformWrapper>
        </div>

        {/* Layer 2: Original Image */}
        <div className={`absolute inset-0 transition-opacity duration-300 ${showOriginal ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
            <TransformWrapper
                ref={originalRef}
                initialScale={1}
                minScale={1}
                maxScale={8}
                centerOnInit
                wheel={{ step: 0.2 }}
                doubleClick={{ mode: "reset", disabled: false }}
            >
                <TransformComponent 
                    wrapperClass="w-full h-full !cursor-grab active:!cursor-grabbing"
                    contentClass="w-full h-full"
                    wrapperStyle={{ width: "100%", height: "100%" }}
                >
                    <img 
                        src={originalSrc} 
                        alt="Original" 
                        className="w-full h-full object-cover" 
                        draggable={false}
                    />
                </TransformComponent>
            </TransformWrapper>
        </div>

        {/* HUD Overlay */}
        <div className="absolute inset-0 pointer-events-none z-20 flex flex-col justify-between p-6">
                <div className="flex justify-between items-start">
                    <div className="pointer-events-none opacity-80 scale-90 sm:scale-100 origin-top-left">
                        <div className="flex items-center gap-3 px-3 py-1.5 bg-black/60 backdrop-blur-xl rounded-full text-white/90 text-[10px] font-bold border border-white/10 shadow-xl">
                            <ZoomIn className="w-3.5 h-3.5 text-brand-gold" />
                            <span className="uppercase tracking-widest">{showOriginal ? "VISUALIZANDO: ORIGINAL" : "VISUALIZANDO: DESIGN IA"}</span>
                        </div>
                    </div>

                    <div className="flex gap-2 pointer-events-auto">
                        <button
                          className={`flex items-center gap-3 px-4 py-2 rounded-full text-[10px] font-black tracking-widest backdrop-blur-xl transition-all shadow-xl border border-white/10 ${
                              isHolding && !isLocked
                              ? 'bg-brand-gold text-brand-graphite scale-110' 
                              : 'bg-black/60 text-white hover:bg-black/80'
                          }`}
                          onMouseDown={() => setIsHolding(true)}
                          onMouseUp={() => setIsHolding(false)}
                          onMouseLeave={() => setIsHolding(false)}
                          onTouchStart={() => setIsHolding(true)}
                          onTouchEnd={() => setIsHolding(false)}
                        >
                        <Eye className="w-3.5 h-3.5" />
                        {isHolding ? "ORIGINAL" : "VER ORIGINAL"}
                        </button>

                        <button
                          onClick={() => setIsLocked(!isLocked)}
                          className={`flex items-center gap-3 px-4 py-2 rounded-full text-[10px] font-black tracking-widest backdrop-blur-xl transition-all shadow-xl border border-white/10 ${
                              isLocked
                              ? 'bg-brand-gold text-brand-graphite' 
                              : 'bg-black/60 text-white hover:bg-black/80'
                          }`}
                        >
                        {isLocked ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                        {isLocked ? "DESTRAVAR" : "FIXAR"}
                        </button>
                    </div>
                </div>

            <div className="flex justify-center items-end gap-3 pointer-events-auto relative">
                <div className="flex gap-3 bg-black/70 backdrop-blur-2xl p-2.5 rounded-[24px] shadow-2xl border border-white/10 animate-fade-in-up">
                    <button 
                        onClick={handleResetZoom} 
                        className="p-3 bg-white/5 hover:bg-white/10 rounded-full text-white transition-all active:scale-90" 
                        title="Resetar Zoom"
                    >
                        <RotateCcw className="w-5 h-5" />
                    </button>
                    
                    <div className="w-px bg-white/10 mx-1 self-center h-8"></div>

                    <div className="relative">
                        <button 
                            onClick={(e) => { e.stopPropagation(); setShowSaveOptions(!showSaveOptions); }} 
                            className={`p-3 rounded-full shadow-xl transition-all transform active:scale-95 ${
                            isSaved 
                                ? 'bg-green-500 text-white scale-110' 
                                : showSaveOptions 
                                    ? 'bg-brand-gold text-brand-graphite' 
                                    : 'bg-white text-brand-graphite hover:bg-brand-gold'
                            }`}
                        >
                            {isSaved ? <Check className="w-5 h-5 animate-pulse" /> : 
                              (parentIsSaving || isProcessingDownload ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />)}
                        </button>

                        {showSaveOptions && !isSaved && (
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 bg-white dark:bg-slate-800 rounded-[24px] shadow-3xl border border-slate-200 dark:border-white/5 p-3 min-w-[180px] animate-fade-in z-50 overflow-hidden">
                                <div className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 px-3">
                                    Exportar Estilo
                                </div>
                                <div className="space-y-1">
                                    <button 
                                        onClick={() => handleDownload('png')}
                                        className="flex items-center justify-between px-4 py-3 text-[11px] font-bold text-slate-700 dark:text-slate-200 hover:bg-brand-gold hover:text-brand-graphite rounded-xl w-full transition-all group/opt"
                                    >
                                        <div className="flex items-center gap-3">
                                            <FileImage className="w-4 h-4 text-brand-gold group-hover/opt:text-brand-graphite" />
                                            PNG (Ultra HQ)
                                        </div>
                                        <Download size={14} className="opacity-30" />
                                    </button>
                                    <button 
                                        onClick={() => handleDownload('jpeg')}
                                        className="flex items-center justify-between px-4 py-3 text-[11px] font-bold text-slate-700 dark:text-slate-200 hover:bg-brand-gold hover:text-brand-graphite rounded-xl w-full transition-all group/opt"
                                    >
                                        <div className="flex items-center gap-3">
                                            <FileImage className="w-4 h-4 text-blue-500 group-hover/opt:text-brand-graphite" />
                                            JPG (Otimizado)
                                        </div>
                                        <Download size={14} className="opacity-30" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                    
                    <button 
                        onClick={(e) => { e.stopPropagation(); onExpand(); }} 
                        className="p-3 bg-brand-gold text-brand-graphite hover:bg-white rounded-full shadow-xl transition-all hover:scale-105 active:scale-95" 
                    >
                        <Maximize2 className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    </div>
  );
};
