
import React, { useState, useRef, useEffect } from 'react';
import { Camera, RefreshCw, Timer, X, AlertCircle, ZoomIn, ZoomOut, Check, ChevronLeft } from 'lucide-react';

interface CameraCaptureProps {
  onCapture: (base64: string) => void;
  onClose: () => void;
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [timer, setTimer] = useState<number>(0);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [zoom, setZoom] = useState(1);
  const [isCapturing, setIsCapturing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, [facingMode]);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const startCamera = async () => {
    stopCamera();
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: { ideal: facingMode }, 
          width: { ideal: 1920 }, 
          height: { ideal: 1080 } 
        }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err: any) {
      console.error("Camera error:", err);
      setError("Não foi possível acessar a câmera. Verifique as permissões de vídeo do seu navegador.");
    }
  };

  const initiateCapture = () => {
    if (timer > 0) {
      setCountdown(timer);
      const interval = setInterval(() => {
        setCountdown(prev => {
          if (prev === 1) {
            clearInterval(interval);
            setTimeout(handleCapture, 100);
            return null;
          }
          return prev ? prev - 1 : null;
        });
      }, 1000);
    } else {
      handleCapture();
    }
  };

  const handleCapture = () => {
    if (isCapturing || error) return;
    setIsCapturing(true);
    try {
      if (videoRef.current && canvasRef.current) {
        const canvas = canvasRef.current;
        const video = videoRef.current;
        
        // Use natural dimensions
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        const ctx = canvas.getContext('2d');
        if (ctx) {
          // Digital Zoom logic
          const zoomFactor = zoom;
          const sWidth = canvas.width / zoomFactor;
          const sHeight = canvas.height / zoomFactor;
          const sx = (canvas.width - sWidth) / 2;
          const sy = (canvas.height - sHeight) / 2;

          if (facingMode === 'user') {
            ctx.translate(canvas.width, 0);
            ctx.scale(-1, 1);
          }
          
          ctx.drawImage(video, sx, sy, sWidth, sHeight, 0, 0, canvas.width, canvas.height);
          onCapture(canvas.toDataURL('image/jpeg', 0.95));
          onClose();
        }
      }
    } catch (err) {
      setError("Erro ao processar imagem capturada.");
    } finally {
      setIsCapturing(false);
    }
  };

  const toggleTimer = () => {
    const options = [0, 3, 5, 10];
    const currentIndex = options.indexOf(timer);
    setTimer(options[(currentIndex + 1) % options.length]);
  };

  return (
    <div className="fixed inset-0 z-[200] bg-black flex flex-col animate-fade-in overflow-hidden">
      
      {/* HEADER CAMERA */}
      <div className="absolute top-0 w-full p-6 flex justify-between items-center z-50 bg-gradient-to-b from-black/60 to-transparent">
        <button onClick={onClose} className="p-3 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-all">
          <ChevronLeft size={24} />
        </button>
        <div className="flex gap-4">
          <button onClick={toggleTimer} className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest flex items-center gap-2 transition-all ${timer > 0 ? 'bg-brand-gold text-brand-graphite' : 'bg-white/10 text-white'}`}>
            <Timer size={16} /> {timer > 0 ? `${timer}s` : 'Timer'}
          </button>
          <button onClick={() => setFacingMode(f => f === 'user' ? 'environment' : 'user')} className="p-3 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-all">
            <RefreshCw size={20}/>
          </button>
        </div>
      </div>

      <div className="relative flex-1 bg-slate-950 flex items-center justify-center overflow-hidden">
        {error ? (
          <div className="p-10 text-center text-white space-y-6 max-w-sm">
            <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto text-red-500 border border-red-500/20 shadow-2xl">
              <AlertCircle size={40} />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold">Erro de Câmera</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{error}</p>
            </div>
            <button onClick={startCamera} className="w-full py-4 bg-brand-gold text-brand-graphite rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-xl">Tentar Novamente</button>
            <button onClick={onClose} className="text-slate-500 font-bold text-xs uppercase tracking-widest border-b border-slate-500/30">Voltar ao Atelier</button>
          </div>
        ) : (
          <div className="relative w-full h-full flex items-center justify-center">
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted 
              className="w-full h-full object-cover transition-transform duration-300" 
              style={{ 
                transform: `${facingMode === 'user' ? 'scaleX(-1)' : 'scaleX(1)'} scale(${zoom})` 
              }}
            />
            
            {/* OVERLAY DE ENQUADRAMENTO */}
            <div className="absolute inset-0 pointer-events-none border-[60px] border-black/40 flex items-center justify-center">
                <div className="w-[300px] h-[400px] border-2 border-white/20 rounded-[100px] relative">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 border border-white/40 rounded-full"></div>
                </div>
            </div>

            {/* COUNTDOWN VISUAL */}
            {countdown !== null && (
              <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm animate-fade-in">
                 <span className="text-[200px] font-serif font-black text-brand-gold animate-ping">{countdown}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* CONTROLES INFERIORES */}
      <div className="absolute bottom-0 w-full p-10 flex flex-col items-center gap-8 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
        
        {/* ZOOM SLIDER */}
        <div className="flex items-center gap-6 bg-black/40 backdrop-blur-xl px-6 py-3 rounded-full border border-white/10 w-64">
           <button onClick={() => setZoom(prev => Math.max(1, prev - 0.5))} className="text-white hover:text-brand-gold transition-colors"><ZoomOut size={20}/></button>
           <input 
            type="range" 
            min="1" 
            max="3" 
            step="0.1" 
            value={zoom} 
            onChange={(e) => setZoom(parseFloat(e.target.value))}
            className="flex-1 accent-brand-gold h-1"
           />
           <button onClick={() => setZoom(prev => Math.min(3, prev + 0.5))} className="text-white hover:text-brand-gold transition-colors"><ZoomIn size={20}/></button>
           <span className="text-[10px] font-bold text-white/50 w-8">{zoom.toFixed(1)}x</span>
        </div>

        <div className="flex items-center gap-12">
          <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-white/20 bg-slate-800 shadow-xl opacity-40">
            {/* Placeholder para última foto ou preview */}
          </div>

          <button 
            onClick={initiateCapture} 
            disabled={isCapturing || !!countdown}
            className="relative w-24 h-24 rounded-full border-4 border-white flex items-center justify-center transition-all hover:scale-105 active:scale-90 group disabled:opacity-50"
          >
            <div className={`w-20 h-20 rounded-full bg-white transition-all ${isCapturing ? 'scale-75' : 'scale-100 group-hover:scale-95'}`}></div>
            {isCapturing && (
              <div className="absolute inset-0 border-4 border-brand-gold rounded-full animate-spin border-t-transparent"></div>
            )}
          </button>

          <div className="w-16 h-16 rounded-full flex items-center justify-center text-white/40">
             <Camera size={24} />
          </div>
        </div>

        <p className="text-[10px] text-white/40 font-bold uppercase tracking-[0.4em] mb-4">Posicione o rosto no centro do enquadramento</p>
      </div>
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};
