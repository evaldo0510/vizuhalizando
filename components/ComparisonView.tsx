
import React, { useState, useRef } from 'react';
import { Eye, Save, Maximize2, Loader2, RotateCcw, Lock, Unlock, ZoomIn, Move, FileImage, Check, MousePointer2 } from 'lucide-react';
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

  // Refs to control independent zoom states
  const generatedRef = useRef<ReactZoomPanPinchRef>(null);
  const originalRef = useRef<ReactZoomPanPinchRef>(null);

  // Determine which image to show
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

        const dataUrl = canvas.toDataURL(`image/${format}`, 1.0);
        
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = `vizu-edit-${Date.now()}.${format === 'jpeg' ? 'jpg' : 'png'}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Success Animation Logic
        setIsSaved(true);
        setShowSaveOptions(false);
        onSave();
        
        setTimeout(() => {
            setIsSaved(false);
        }, 2000);

    } catch (error) {
        console.error("Erro ao baixar imagem", error);
        alert("Erro ao processar imagem para download.");
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
    <div className="w-full h-full relative group select-none overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800 transition-all duration-300 shadow-lg border border-slate-200 dark:border-slate-700">
        
        {/* Layer 1: Generated Image (Default) */}
        <div className={`absolute inset-0 transition-opacity duration-200 ${showOriginal ? 'opacity-0 pointer-events-none' : 'opacity-100 pointer-events-auto'}`}>
            <TransformWrapper
                ref={generatedRef}
                initialScale={1}
                minScale={1}
                maxScale={8}
                centerOnInit
                wheel={{ step: 0.2 }}
                doubleClick={{ mode: "reset", disabled: false }}
                pinch={{ disabled: false }}
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

        {/* Layer 2: Original Image (Overlay) */}
        <div className={`absolute inset-0 transition-opacity duration-200 ${showOriginal ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
            <TransformWrapper
                ref={originalRef}
                initialScale={1}
                minScale={1}
                maxScale={8}
                centerOnInit
                wheel={{ step: 0.2 }}
                doubleClick={{ mode: "reset", disabled: false }}
                pinch={{ disabled: false }}
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

        {/* Controls Overlay */}
        <div className="absolute inset-0 pointer-events-none z-20 flex flex-col justify-between p-4">
                {/* Header Controls */}
                <div className="flex justify-between items-start">
                    
                    {/* Visual Hints */}
                    <div className="pointer-events-none opacity-60">
                        <div className="flex items-center gap-2 px-2 py-1 bg-black/40 backdrop-blur-md rounded-lg text-white/90 text-[10px] font-bold border border-white/10">
                            <ZoomIn className="w-3 h-3" />
                            <span className="hidden sm:inline">2x TOQUE P/ RESET</span>
                            <span className="opacity-30 hidden sm:inline">|</span>
                            <MousePointer2 className="w-3 h-3" />
                            <span className="uppercase">{showOriginal ? "Zoom: Original" : "Zoom: Gerado"}</span>
                        </div>
                    </div>

                    <div className="flex gap-2 pointer-events-auto">
                        <button
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold backdrop-blur-md transition-all shadow-sm ring-1 ring-white/10 ${
                            isHolding && !isLocked
                            ? 'bg-indigo-600 text-white scale-105 ring-indigo-400' 
                            : 'bg-black/60 text-white hover:bg-black/80'
                        }`}
                        onMouseDown={() => setIsHolding(true)}
                        onMouseUp={() => setIsHolding(false)}
                        onMouseLeave={() => setIsHolding(false)}
                        onTouchStart={() => setIsHolding(true)}
                        onTouchEnd={() => setIsHolding(false)}
                        title="Mantenha pressionado para ver a imagem original"
                        >
                        <Eye className="w-3 h-3" />
                        {isHolding ? "ORIGINAL" : "SEGURE"}
                        </button>

                        <button
                        onClick={() => setIsLocked(!isLocked)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold backdrop-blur-md transition-all shadow-sm ring-1 ring-white/10 ${
                            isLocked
                            ? 'bg-amber-500 text-white ring-amber-300' 
                            : 'bg-black/60 text-white hover:bg-black/80'
                        }`}
                        title={isLocked ? "Destravar para ver Look Gerado" : "Fixar Original para Ajustes (Zoom/Pan)"}
                        >
                        {isLocked ? <Unlock className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                        {isLocked ? "FIXADO" : "FIXAR"}
                        </button>
                    </div>
                </div>
                
                {/* Centered Label */}
                {showOriginal && (
                <div className="absolute top-16 left-1/2 -translate-x-1/2 pointer-events-none">
                    <div className={`px-3 py-1.5 rounded-lg font-bold shadow-lg animate-fade-in border border-white/20 text-[10px] tracking-wider backdrop-blur-md ${
                        isLocked ? 'bg-amber-500/90 text-white' : 'bg-indigo-600/90 text-white'
                    }`}>
                        FOTO ORIGINAL {isLocked && "(MODO EDIÇÃO)"}
                    </div>
                </div>
                )}

            {/* Bottom Action Buttons */}
            <div className="flex justify-center items-end gap-3 pointer-events-auto opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-300 translate-y-0 sm:translate-y-4 sm:group-hover:translate-y-0 relative">
                    <div className="flex gap-2 bg-black/70 backdrop-blur-md p-2 rounded-full shadow-lg border border-white/10">
                    <button 
                        onClick={handleResetZoom} 
                        className="p-2.5 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors" 
                        title="Resetar Zoom da imagem atual"
                    >
                        <RotateCcw className="w-4 h-4" />
                    </button>
                    
                    <div className="w-px bg-white/20 mx-1 self-center h-6"></div>

                    <div className="relative">
                        <button 
                            onClick={(e) => { e.stopPropagation(); setShowSaveOptions(!showSaveOptions); }} 
                            className={`p-2.5 rounded-full shadow-sm transition-all duration-500 transform ${
                            isSaved 
                                ? 'bg-green-500 text-white ring-4 ring-green-300 scale-110' 
                                : showSaveOptions 
                                    ? 'bg-indigo-600 text-white' 
                                    : 'bg-white text-slate-900 hover:bg-indigo-50'
                            }`} 
                            title="Salvar Imagem"
                        >
                            {isSaved ? (
                                <Check className="w-4 h-4 animate-bounce" />
                            ) : (
                                parentIsSaving || isProcessingDownload ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />
                            )}
                        </button>

                        {/* Save Options Popover */}
                        {showSaveOptions && !isSaved && (
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 p-2 min-w-[140px] animate-fade-in z-50">
                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 px-2 text-center">
                                    Salvar Como
                                </div>
                                <div className="flex flex-col gap-1">
                                    <button 
                                        onClick={() => handleDownload('png')}
                                        className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg w-full"
                                    >
                                        <FileImage className="w-3 h-3 text-indigo-500" />
                                        PNG (Alta Qualidade)
                                    </button>
                                    <button 
                                        onClick={() => handleDownload('jpeg')}
                                        className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg w-full"
                                    >
                                        <FileImage className="w-3 h-3 text-blue-500" />
                                        JPG (Padrão)
                                    </button>
                                </div>
                                <div className="w-4 h-4 bg-white dark:bg-slate-800 absolute -bottom-2 left-1/2 -translate-x-1/2 rotate-45 border-r border-b border-slate-200 dark:border-slate-700"></div>
                            </div>
                        )}
                    </div>
                    
                    <button 
                        onClick={(e) => { e.stopPropagation(); onExpand(); }} 
                        className="p-2.5 bg-indigo-600 text-white hover:bg-indigo-500 rounded-full shadow-sm transition-transform hover:scale-105" 
                        title="Expandir"
                    >
                        <Maximize2 className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    </div>
  );
};
