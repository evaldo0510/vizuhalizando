
import React, { useState, useRef, useEffect } from 'react';
import { Camera, RefreshCw, Timer, X, AlertCircle, ZoomIn, ZoomOut } from 'lucide-react';

interface CameraCaptureProps {
  onCapture: (base64: string) => void;
  onClose: () => void;
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [timer, setTimer] = useState<number | null>(null);
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
        video: { facingMode: { ideal: facingMode }, width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err: any) {
      console.error("Camera error:", err);
      setError("Não foi possível acessar a câmera. Verifique as permissões.");
    }
  };

  const handleCapture = () => {
    if (isCapturing || error) return;
    setIsCapturing(true);
    try {
      if (videoRef.current && canvasRef.current) {
        const canvas = canvasRef.current;
        const video = videoRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          if (facingMode === 'user') {
            ctx.translate(canvas.width, 0);
            ctx.scale(-1, 1);
          }
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          onCapture(canvas.toDataURL('image/jpeg', 0.9));
          onClose();
        }
      }
    } catch (err) {
      setError("Erro ao processar imagem.");
    } finally {
      setIsCapturing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] bg-black flex flex-col items-center justify-center animate-fade-in">
      <div className="absolute top-6 left-6 z-50">
        <button onClick={onClose} className="p-3 bg-white/10 rounded-full text-white"><X size={24} /></button>
      </div>

      <div className="relative w-full h-full max-w-lg bg-slate-900 flex items-center justify-center overflow-hidden">
        {error ? (
          <div className="p-10 text-center text-white space-y-4">
            <AlertCircle className="mx-auto text-red-500" size={48} />
            <p className="text-sm">{error}</p>
            <button onClick={startCamera} className="px-6 py-2 bg-brand-gold text-brand-graphite rounded-xl font-bold">Tentar Novamente</button>
          </div>
        ) : (
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            muted 
            className="w-full h-full object-cover" 
            style={{ transform: facingMode === 'user' ? 'scaleX(-1)' : 'none' }}
          />
        )}
      </div>

      <div className="absolute bottom-10 flex flex-col items-center gap-6">
        <div className="flex gap-4 bg-black/40 p-2 rounded-full border border-white/10">
          <button onClick={() => setFacingMode(f => f === 'user' ? 'environment' : 'user')} className="p-3 text-white"><RefreshCw size={24}/></button>
          <button 
            onClick={handleCapture} 
            disabled={isCapturing}
            className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center bg-white/20 active:scale-90 transition-transform"
          >
            <div className="w-16 h-16 bg-white rounded-full"></div>
          </button>
          <button onClick={() => setTimer(5)} className={`p-3 text-white ${timer ? 'text-brand-gold' : ''}`}><Timer size={24}/></button>
        </div>
      </div>
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};
