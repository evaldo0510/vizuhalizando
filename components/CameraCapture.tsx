
import React, { useState, useRef, useEffect } from 'react';
import { Camera, RefreshCw, Timer, Zap, X, ChevronLeft, ChevronRight, Maximize, ZoomIn, ZoomOut } from 'lucide-react';

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
    if (isCapturing) return;
    
    setIsCapturing(true);
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // Calculate crop/zoom
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Draw centered and zoomed
        const drawWidth = video.videoWidth / zoom;
        const drawHeight = video.videoHeight / zoom;
        const offsetX = (video.videoWidth - drawWidth) / 2;
        const offsetY = (video.videoHeight - drawHeight) / 2;
        
        ctx.drawImage(video, offsetX, offsetY, drawWidth, drawHeight, 0, 0, canvas.width, canvas.height);
        
        const base64 = canvas.toDataURL('image/jpeg', 0.95);
        onCapture(base64);
        onClose();
      }
    }
    setIsCapturing(false);
  };

  const startTimer = (seconds: number) => {
    if (timer) {
        setTimer(null);
        return;
    }
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

  const adjustZoom = (delta: number) => {
    setZoom(prev => Math.min(Math.max(prev + delta, 1), 3));
  };

  return (
    <div className="fixed inset-0 z-[200] bg-black flex flex-col items-center justify-center animate-fade-in overflow-hidden">
      {/* Top Controls */}
      <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-50 bg-gradient-to-b from-black/60 to-transparent">
        <button onClick={onClose} className="p-3 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-all">
          <X size={24} />
        </button>
        
        <div className="flex gap-3">
           <button 
             onClick={() => startTimer(5)} 
             className={`p-3 rounded-full text-white transition-all flex items-center gap-2 font-bold ${timer ? 'bg-brand-gold scale-110' : 'bg-white/10'}`}
           >
             <Timer size={20} />
             {timer && <span className="text-xs">{timer}s</span>}
           </button>
           <button onClick={toggleCamera} className="p-3 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-all">
             <RefreshCw size={20} />
           </button>
        </div>
      </div>

      {/* Camera Viewport */}
      <div className="relative w-full h-full max-w-lg overflow-hidden bg-slate-900 shadow-2xl flex items-center justify-center">
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          className="w-full h-full object-cover transition-transform duration-300"
          style={{ 
            transform: `${facingMode === 'user' ? 'scaleX(-1)' : 'none'} scale(${zoom})`,
          }}
        />
        
        {/* Guides */}
        <div className="absolute inset-0 pointer-events-none border-[1px] border-white/10 flex items-center justify-center">
            <div className="w-64 h-80 border-2 border-dashed border-white/20 rounded-[80px]"></div>
        </div>

        {timer && !isCapturing && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="bg-black/40 backdrop-blur-xl w-32 h-32 rounded-full flex items-center justify-center border-4 border-brand-gold animate-pulse">
                <span className="text-6xl font-serif font-bold text-white drop-shadow-2xl">{timer}</span>
            </div>
          </div>
        )}

        {/* Zoom & Shutter Controls */}
        <div className="absolute bottom-0 left-0 right-0 p-10 flex flex-col items-center gap-8 bg-gradient-to-t from-black/80 to-transparent">
           
           {/* Zoom Selector */}
           <div className="flex items-center gap-6 bg-black/40 backdrop-blur-md p-1.5 rounded-full border border-white/10">
              <button onClick={() => adjustZoom(-0.5)} className="p-2 text-white/60 hover:text-white transition-colors"><ZoomOut size={18}/></button>
              <div className="flex gap-2">
                 {[1, 1.5, 2, 3].map(z => (
                   <button 
                    key={z}
                    onClick={() => setZoom(z)}
                    className={`w-8 h-8 rounded-full text-[10px] font-bold transition-all ${zoom === z ? 'bg-brand-gold text-brand-graphite shadow-lg' : 'text-white/40 hover:text-white'}`}
                   >
                     {z}x
                   </button>
                 ))}
              </div>
              <button onClick={() => adjustZoom(0.5)} className="p-2 text-white/60 hover:text-white transition-colors"><ZoomIn size={18}/></button>
           </div>

           {/* Shutter */}
           <button 
             onClick={handleCapture}
             disabled={isCapturing}
             className="relative w-20 h-20 rounded-full border-4 border-white p-1 hover:scale-105 transition-transform active:scale-95 disabled:opacity-50"
           >
             <div className="w-full h-full bg-white rounded-full shadow-inner flex items-center justify-center">
                {isCapturing && <RefreshCw size={24} className="text-brand-graphite animate-spin" />}
             </div>
           </button>
        </div>
      </div>

      <canvas ref={canvasRef} className="hidden" />
      <div className="absolute bottom-4 text-white/30 text-[9px] font-bold uppercase tracking-[0.4em] pointer-events-none">
        Mapeamento Biométrico Ativo
      </div>
    </div>
  );
};
