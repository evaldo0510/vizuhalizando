
import React, { useState, useRef, useEffect } from 'react';
import { Camera, RefreshCw, Timer, Zap, X, ChevronLeft, ChevronRight, Maximize } from 'lucide-react';

interface CameraCaptureProps {
  onCapture: (base64: string) => void;
  onClose: () => void;
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [timer, setTimer] = useState<number | null>(null);
  const [zoom, setZoom] = useState(1);
  const [isCapturing, setIsCapturing] = useState(false);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, [facingMode]);

  const startCamera = async () => {
    stopCamera();
    try {
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode,
          width: { ideal: 1080 },
          height: { ideal: 1920 }
        }
      });
      setStream(newStream);
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
      }
    } catch (err) {
      console.error("Erro ao acessar câmera:", err);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
  };

  const handleCapture = () => {
    if (timer) return; // Aguardando timer
    
    const captureAction = () => {
      if (videoRef.current && canvasRef.current) {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        const ctx = canvas.getContext('2d');
        if (ctx) {
          // Aplicar Zoom via Canvas se necessário (ou apenas crop)
          ctx.drawImage(video, 0, 0);
          const base64 = canvas.toDataURL('image/jpeg', 0.9);
          onCapture(base64);
          onClose();
        }
      }
    };

    captureAction();
  };

  const startTimer = (seconds: number) => {
    setTimer(seconds);
    const interval = setInterval(() => {
      setTimer(prev => {
        if (prev === 1) {
          clearInterval(interval);
          handleCapture();
          return null;
        }
        return prev ? prev - 1 : null;
      });
    }, 1000);
  };

  const toggleCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  return (
    <div className="fixed inset-0 z-[200] bg-black flex flex-col items-center justify-center animate-fade-in">
      <div className="absolute top-6 left-6 right-6 flex justify-between items-center z-10">
        <button onClick={onClose} className="p-3 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-all">
          <ChevronLeft size={24} />
        </button>
        <div className="flex gap-4">
           <button onClick={() => startTimer(3)} className={`p-3 rounded-full text-white transition-all ${timer ? 'bg-brand-gold' : 'bg-white/10 hover:bg-white/20'}`}>
             <Timer size={20} />
             {timer === 3 && <span className="ml-2 font-bold">3s</span>}
           </button>
           <button onClick={toggleCamera} className="p-3 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-all">
             <RefreshCw size={20} />
           </button>
        </div>
      </div>

      <div className="relative w-full max-w-lg aspect-[3/4] overflow-hidden bg-slate-900 md:rounded-[40px] shadow-2xl">
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          className="w-full h-full object-cover"
          style={{ transform: facingMode === 'user' ? 'scaleX(-1)' : 'none' }}
        />
        
        {timer && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-8xl font-serif font-bold text-white drop-shadow-2xl animate-ping">{timer}</span>
          </div>
        )}

        <div className="absolute bottom-10 left-0 right-0 flex flex-col items-center gap-6 px-10">
           {/* Zoom Slider Simulado */}
           <div className="w-full flex items-center gap-4 bg-black/40 backdrop-blur-md p-2 rounded-full px-4 border border-white/10">
              <span className="text-white text-[10px] font-bold">1x</span>
              <input 
                type="range" min="1" max="3" step="0.1" value={zoom} 
                onChange={e => setZoom(parseFloat(e.target.value))}
                className="flex-1 accent-brand-gold"
              />
              <span className="text-white text-[10px] font-bold">3x</span>
           </div>

           <button 
             onClick={handleCapture}
             className="w-20 h-20 rounded-full border-4 border-white p-1 hover:scale-105 transition-transform active:scale-95"
           >
             <div className="w-full h-full bg-white rounded-full shadow-inner"></div>
           </button>
        </div>
      </div>

      <canvas ref={canvasRef} className="hidden" />
      <p className="mt-8 text-white/40 text-[10px] font-bold uppercase tracking-[0.3em]">Câmera Biométrica VizuHalizando</p>
    </div>
  );
};
