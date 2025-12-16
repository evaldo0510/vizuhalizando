
import React, { useState, useRef, useEffect } from 'react';
import { 
  Camera, Upload, Scan, CheckCircle2, ArrowLeft, X, Ruler, Palette, Scissors, Move, Check, Edit3, ChevronDown, RefreshCw, Search, Glasses
} from 'lucide-react';

/**
 * LÓGICA MATEMÁTICA HALLAWELL
 */
const VISAGISM_ALGORITHM = {
  analyzeGeometry: (measurements: { foreheadWidth: number; jawWidth: number; faceHeight: number; cheekWidth: number; }) => {
    const { foreheadWidth, jawWidth, faceHeight, cheekWidth } = measurements;
    
    const jawToForeheadRatio = jawWidth / foreheadWidth;
    const heightToWidthRatio = faceHeight / cheekWidth;
    
    let shape = 'oval';
    let details = [];

    if (heightToWidthRatio > 1.5) {
      details.push("Rosto Alongado (Vertical dominante)");
      if (jawToForeheadRatio > 0.95 && jawToForeheadRatio < 1.05) {
        shape = 'oblong';
      } else {
        shape = 'oval';
      }
    } else {
      details.push("Rosto Curto/Médio (Proporção equilibrada)");
    }

    if (jawToForeheadRatio > 1.1) {
      shape = 'triangle';
    } else if (jawToForeheadRatio < 0.85) {
      shape = 'inverted_triangle';
    } else {
      if (heightToWidthRatio < 1.35) {
        shape = Math.abs(cheekWidth - jawWidth) < 10 ? 'square' : 'round'; 
      }
    }

    let archetype: 'melancholic' | 'choleric' | 'phlegmatic' | 'sanguine' = 'melancholic';
    if (shape === 'square' || shape === 'oblong') archetype = 'choleric';
    if (shape === 'round') archetype = 'phlegmatic';
    if (shape === 'inverted_triangle' || shape === 'triangle') archetype = 'sanguine';
    if (shape === 'oval') archetype = 'melancholic';

    return { shape, archetype, details, ratios: { jawToForeheadRatio, heightToWidthRatio } };
  },

  archetypes: {
    sanguine: {
      id: "sanguine",
      name: "Triângulo Invertido / Diamante",
      temperament: "Sanguíneo",
      element: "Ar (Linhas Inclinadas)",
      desc: "Sua medição indicou uma diferença significativa entre a largura da testa/maçãs e a mandíbula. Este formato projeta dinamismo, criatividade e leveza.",
      hair: [
        { name: "Long Bob Assimétrico", image: "https://images.unsplash.com/photo-1605980776566-0486c3331b18?w=600&q=80", guide: "Frente alongada para equilibrar o queixo fino." },
        { name: "Pixie com Volume", image: "https://images.unsplash.com/photo-1595476104696-931b6e6ce73c?w=600&q=80", guide: "Volume no topo, laterais batidas." },
        { name: "Camadas Médias", image: "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=600&q=80", guide: "Volume na altura do queixo para preencher." }
      ],
      glasses: [
        { name: "Aviador Clássico", image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&q=80", guide: "Base larga equilibra a testa mais ampla." },
        { name: "Gatinho (Cat Eye)", image: "https://images.unsplash.com/photo-1577803645773-f96470509666?w=600&q=80", guide: "Segue as linhas ascendentes naturais do rosto." },
        { name: "Sem Aro (Rimless)", image: "https://images.unsplash.com/photo-1591076482161-42ce6da69f67?w=600&q=80", guide: "Leveza visual para não pesar na expressão." }
      ]
    },
    choleric: {
      id: "choleric",
      name: "Retangular / Quadrado",
      temperament: "Colérico",
      element: "Fogo (Linhas Retas)",
      desc: "Sua medição mostrou proporções quase iguais entre testa e mandíbula, com linhas fortes. Isso transmite potência, liderança e determinação.",
      hair: [
        { name: "Ondas Suaves (Soft Waves)", image: "https://images.unsplash.com/photo-1552699309-8f3811566371?w=600&q=80", guide: "Criar curvas para suavizar a retidão do rosto." },
        { name: "Repicado Longo", image: "https://images.unsplash.com/photo-1519699047748-40baea614fda?w=600&q=80", guide: "Camadas começando abaixo da mandíbula." },
        { name: "Side Part (Masculino)", image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=600&q=80", guide: "Clássico e estruturado." }
      ],
      glasses: [
        { name: "Redondo (Round)", image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600&q=80", guide: "Suaviza os ângulos fortes do maxilar." },
        { name: "Oval de Metal", image: "https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=600&q=80", guide: "Contraste elegante com linhas retas." },
        { name: "Browline (Clubmaster)", image: "https://images.unsplash.com/photo-1533681018184-68bd1d883b97?w=600&q=80", guide: "Destaca a linha da sobrancelha, tirando foco do queixo." }
      ]
    },
    melancholic: {
      id: "melancholic",
      name: "Oval / Longo",
      temperament: "Melancólico",
      element: "Terra (Linhas Verticais)",
      desc: "Sua medição indicou que a altura do rosto predomina sobre a largura. Um formato elegante, sensível e equilibrado.",
      hair: [
        { name: "Corte Reto (Blunt Cut)", image: "https://images.unsplash.com/photo-1503443207922-dff7d543fd0e?w=600&q=80", guide: "Base reta para dar peso horizontal." },
        { name: "Franja Bardot", image: "https://images.unsplash.com/photo-1609176378613-75b253b7c897?w=600&q=80", guide: "Cortina para diminuir a percepção de altura." },
        { name: "Coque Baixo", image: "https://images.unsplash.com/photo-1492106087820-71f171791ace?w=600&q=80", guide: "Elegância clássica." }
      ],
      glasses: [
        { name: "Quadrado Grande", image: "https://images.unsplash.com/photo-1509695507497-903c140c43b0?w=600&q=80", guide: "Quebra a linha vertical longa do rosto." },
        { name: "Retangular Grosso", image: "https://images.unsplash.com/photo-1548865619-35e69888a7c2?w=600&q=80", guide: "Adiciona largura visual às têmporas." },
        { name: "Wayfarer Oversized", image: "https://images.unsplash.com/photo-1563907083-d53956799059?w=600&q=80", guide: "Equilíbrio perfeito para rostos ovais." }
      ]
    },
    phlegmatic: {
      id: "phlegmatic",
      name: "Redondo",
      temperament: "Fleumático",
      element: "Água (Linhas Curvas)",
      desc: "Suas medidas de largura e altura são muito próximas. Transmite acessibilidade, acolhimento e jovialidade.",
      hair: [
        { name: "Longo com Risca Central", image: "https://images.unsplash.com/photo-1606206173007-42750d4f6a2b?w=600&q=80", guide: "Linhas verticais para alongar visualmente." },
        { name: "Bob Assimétrico", image: "https://images.unsplash.com/photo-1533224732104-e58572110c59?w=600&q=80", guide: "Pontas frontais alongadas criam ângulos." },
        { name: "Topete Alto (Masculino)", image: "https://images.unsplash.com/photo-1610260481284-5f8021dc0060?w=600&q=80", guide: "Volume vertical essencial." }
      ],
      glasses: [
        { name: "Retangular Anguloso", image: "https://images.unsplash.com/photo-1596701836814-22b378044733?w=600&q=80", guide: "Cria estrutura óssea artificial." },
        { name: "Wayfarer Clássico", image: "https://images.unsplash.com/photo-1516762689617-e1cffcef479d?w=600&q=80", guide: "Linhas retas contrastam com a face curva." },
        { name: "Geométrico", image: "https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=600&q=80", guide: "Ângulos definidos afinam o rosto." }
      ]
    }
  }
};

// Skin Profiles Data
const SKIN_PROFILES = {
  warm: {
    label: "Quente",
    color: "#f59e0b",
    desc: "Subtom Dourado/Amarelado. Pele bronzeia fácil.",
    makeup: "Tons terrosos, pêssego, dourado e bronzer. Batons alaranjados ou vermelhos quentes.",
    metals: "Dourado e Cobre"
  },
  cool: {
    label: "Frio",
    color: "#3b82f6",
    desc: "Subtom Rosado/Azulado. Pele queima fácil.",
    makeup: "Tons de rosa, prata, cinza e azul. Batons em tons de frutas vermelhas ou rosa frio.",
    metals: "Prata e Ouro Branco"
  },
  neutral: {
    label: "Neutro",
    color: "#a3a3a3",
    desc: "Equilíbrio Quente/Frio. Adapta-se bem.",
    makeup: "Pode transitar entre tons. Foco em iluminar naturalmente e tons de bege/marrom suave.",
    metals: "Todos (Mistura de Metais)"
  },
  olive: {
    label: "Oliva",
    color: "#84cc16",
    desc: "Subtom Esverdeado/Acinzentado. Comum no Brasil.",
    makeup: "Tons de ameixa, beringela, verde musgo e metálicos profundos. Evite pastéis.",
    metals: "Bronze, Ouro Velho e Prata Envelhecida"
  }
};

// Helper to get all styles flat (generic)
const getAllStyles = (category: 'hair' | 'glasses') => {
  const styles: any[] = [];
  Object.values(VISAGISM_ALGORITHM.archetypes).forEach(arch => {
    // Check if category exists in archetype data
    const list = category === 'hair' ? arch.hair : arch.glasses;
    if (list) {
        list.forEach((style: any) => {
            styles.push({ ...style, origin: arch.name }); 
        });
    }
  });
  return styles;
};

export const VisagismAnalysis = ({ onClose }: { onClose: () => void }) => {
  const [step, setStep] = useState<'home' | 'camera' | 'crop_skin' | 'crop_geo' | 'result'>('home');
  const [image, setImage] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<any>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Ruler State
  const [geoLines, setGeoLines] = useState({
    forehead: { y: 30, width: 50 },
    cheek: { y: 50, width: 50 },
    jaw: { y: 70, width: 50 },
    height: { x: 50, top: 15, bottom: 85 }
  });
  
  const [skinColor, setSkinColor] = useState<string | null>(null);
  const [skinToneType, setSkinToneType] = useState<'warm' | 'cool' | 'neutral' | 'olive' | null>(null);
  const [finalResult, setFinalResult] = useState<any>(null);

  useEffect(() => {
    return () => {
      // Cleanup camera on unmount
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setStep('camera');
      }
    } catch (err) {
      alert("Erro ao abrir câmera. Use upload.");
    }
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(videoRef.current, 0, 0);
        setImage(canvas.toDataURL('image/png'));
        
        const stream = videoRef.current.srcObject as MediaStream;
        if (stream) stream.getTracks().forEach(t => t.stop());
        
        setStep('crop_skin');
      }
    }
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImage(reader.result as string);
        setStep('crop_skin');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageClickForColor = (e: React.MouseEvent<HTMLImageElement>) => {
    const img = e.target as HTMLImageElement;
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.drawImage(img, 0, 0);

    const rect = img.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (img.naturalWidth / rect.width);
    const y = (e.clientY - rect.top) * (img.naturalHeight / rect.height);

    const pixel = ctx.getImageData(x, y, 1, 1).data;
    const r = pixel[0];
    const g = pixel[1];
    const b = pixel[2];
    
    // Improved Heuristic for Sub-tone detection
    let tone: 'warm' | 'cool' | 'neutral' | 'olive' = 'neutral';

    // Calculate perceived brightness
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;

    // Logic specifically tuned for Brazilian skin diversity
    if (g > r) {
        // Very rare, usually artificial or shadow error, fallback
        tone = 'neutral';
    } else if (r > g && g > b) {
        // Standard skin range
        const r_g_diff = r - g;
        const g_b_diff = g - b;

        if (g_b_diff > 30 && r_g_diff < 40) {
            // High Yellow content
            tone = 'warm'; 
        } else if (g_b_diff < 20) {
            // Blue channel is high relative to green -> pinkish/cool
            tone = 'cool';
        } else if (r_g_diff > 50 && g_b_diff > 20) {
            // High red, medium green -> warm/bronze
            tone = 'warm';
        } else {
            // Check for Olive (Greenish cast)
            // Olive skins have a green undertone, meaning G is relatively high compared to R (less red gap)
            // and B is low.
            if (r_g_diff < 25 && g_b_diff > 25) {
                tone = 'olive';
            } else {
                tone = 'neutral';
            }
        }
    }

    setSkinColor(`rgb(${r},${g},${b})`);
    setSkinToneType(tone); 
  };

  const handleSliderChange = (line: 'forehead' | 'cheek' | 'jaw' | 'height', field: string, value: string) => {
    setGeoLines(prev => ({
      ...prev,
      [line]: { ...prev[line], [field]: parseFloat(value) }
    }));
  };

  const calculateResults = () => {
    const measurements = {
      foreheadWidth: geoLines.forehead.width,
      jawWidth: geoLines.jaw.width,
      cheekWidth: geoLines.cheek.width,
      faceHeight: geoLines.height.bottom - geoLines.height.top
    };

    const analysis = VISAGISM_ALGORITHM.analyzeGeometry(measurements);
    setFinalResult(analysis);
    setStep('result');
  };

  const SkinAnalysisScreen = () => (
    <div className="flex-1 flex flex-col items-center p-4 animate-fade-in w-full max-w-2xl mx-auto">
      <h2 className="text-white text-xl font-bold mb-2 flex items-center gap-2">
        <Palette className="text-amber-500" /> Passo 1: Tom de Pele
      </h2>
      <p className="text-slate-400 text-sm mb-4 text-center">
        Toque na sua pele na foto (preferência na bochecha ou queixo, sem sombra).
      </p>
      
      <div className="relative w-full bg-black rounded-xl overflow-hidden shadow-2xl border border-slate-800">
        <img 
          src={image!} 
          onClick={handleImageClickForColor}
          className="w-full h-auto cursor-crosshair" 
          alt="Analysis"
        />
        {skinColor && (
          <div className="absolute top-4 right-4 flex flex-col items-end gap-2">
            <div 
              className="w-12 h-12 rounded-full border-4 border-white shadow-lg transition-colors duration-300"
              style={{ backgroundColor: skinColor }}
            ></div>
          </div>
        )}
      </div>

      {/* Manual Skin Tone Adjustment */}
      {skinColor && (
          <div className="w-full mt-6 bg-slate-900/50 p-4 rounded-xl border border-slate-800 backdrop-blur-sm">
              <label className="text-xs font-bold text-slate-400 uppercase mb-3 block text-center">
                  Subtom Detectado (Toque para Ajustar)
              </label>
              <div className="grid grid-cols-4 gap-2">
                  {Object.entries(SKIN_PROFILES).map(([key, profile]) => {
                      const isActive = skinToneType === key;
                      return (
                          <button
                              key={key}
                              onClick={() => setSkinToneType(key as any)}
                              className={`flex flex-col items-center p-2 rounded-lg transition-all border-2 ${
                                  isActive 
                                  ? 'bg-slate-800 border-white scale-105' 
                                  : 'bg-transparent border-transparent hover:bg-slate-800 opacity-60 hover:opacity-100'
                              }`}
                          >
                              <div 
                                className="w-6 h-6 rounded-full shadow-sm mb-1" 
                                style={{ backgroundColor: profile.color }}
                              />
                              <span className={`text-[10px] font-bold ${isActive ? 'text-white' : 'text-slate-500'}`}>
                                  {profile.label}
                              </span>
                          </button>
                      );
                  })}
              </div>
              <div className="mt-3 text-center min-h-[20px]">
                  <p className="text-xs text-amber-500 font-medium">
                      {skinToneType ? SKIN_PROFILES[skinToneType].desc : ''}
                  </p>
              </div>
          </div>
      )}

      <button 
        disabled={!skinColor}
        onClick={() => setStep('crop_geo')}
        className={`mt-6 w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all ${
          skinColor 
            ? 'bg-amber-500 text-slate-900 hover:bg-amber-400 shadow-lg shadow-amber-500/20' 
            : 'bg-slate-800 text-slate-500 cursor-not-allowed'
        }`}
      >
        Confirmar e Medir Rosto <ArrowLeft className="rotate-180" size={20} />
      </button>
    </div>
  );

  const GeometryScreen = () => (
    <div className="flex-1 flex flex-col items-center p-4 animate-fade-in w-full max-w-2xl mx-auto">
      <h2 className="text-white text-xl font-bold mb-2 flex items-center gap-2">
        <Ruler className="text-amber-500" /> Passo 2: Medidas Reais
      </h2>
      <p className="text-slate-400 text-xs mb-4 text-center max-w-xs">
        Ajuste as barras para a largura da sua testa, bochechas e mandíbula.
      </p>

      <div className="relative w-full bg-black rounded-xl overflow-hidden shadow-2xl border border-slate-800 select-none">
        <img src={image!} className="w-full h-auto opacity-70 pointer-events-none" alt="Geo" />
        
        <div className="absolute inset-0">
          {/* Linha Testa */}
          <div className="absolute left-1/2 transform -translate-x-1/2 flex flex-col items-center group" style={{ top: `${geoLines.forehead.y}%`, width: `${geoLines.forehead.width}%` }}>
            <div className="w-full h-1 bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)] relative">
               <span className="absolute -top-5 left-0 text-[10px] text-cyan-400 font-bold bg-black/50 px-1 rounded">Testa</span>
            </div>
          </div>

          {/* Linha Bochechas */}
          <div className="absolute left-1/2 transform -translate-x-1/2 flex flex-col items-center" style={{ top: `${geoLines.cheek.y}%`, width: `${geoLines.cheek.width}%` }}>
            <div className="w-full h-1 bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.8)] relative">
               <span className="absolute -top-5 left-0 text-[10px] text-green-400 font-bold bg-black/50 px-1 rounded">Maçãs</span>
            </div>
          </div>

          {/* Linha Mandíbula */}
          <div className="absolute left-1/2 transform -translate-x-1/2 flex flex-col items-center" style={{ top: `${geoLines.jaw.y}%`, width: `${geoLines.jaw.width}%` }}>
            <div className="w-full h-1 bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)] relative">
              <span className="absolute -top-5 left-0 text-[10px] text-red-500 font-bold bg-black/50 px-1 rounded">Mandíbula</span>
            </div>
          </div>

          {/* Linha Altura */}
          <div className="absolute w-1 bg-white/50 left-1/2 transform -translate-x-1/2 h-full pointer-events-none">
             <div className="absolute w-4 h-1 bg-white -left-1.5" style={{ top: `${geoLines.height.top}%` }}></div>
             <div className="absolute w-4 h-1 bg-white -left-1.5" style={{ top: `${geoLines.height.bottom}%` }}></div>
             <div className="absolute w-0.5 bg-white left-0" style={{ top: `${geoLines.height.top}%`, height: `${geoLines.height.bottom - geoLines.height.top}%` }}></div>
          </div>
        </div>
      </div>
      
      {/* Controles Manuais */}
      <div className="w-full mt-4 grid grid-cols-1 gap-3">
         <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
           <label className="text-xs text-cyan-400 font-bold flex justify-between mb-1">Largura Testa / Posição</label>
           <div className="flex gap-2">
             <input type="range" min="10" max="90" value={geoLines.forehead.width} onChange={(e) => handleSliderChange('forehead', 'width', e.target.value)} className="w-full accent-cyan-400"/>
             <input type="range" min="0" max="100" value={geoLines.forehead.y} onChange={(e) => handleSliderChange('forehead', 'y', e.target.value)} className="w-1/3 accent-cyan-400"/>
           </div>
         </div>
         <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
           <label className="text-xs text-green-400 font-bold flex justify-between mb-1">Largura Maçãs / Posição</label>
           <div className="flex gap-2">
             <input type="range" min="10" max="90" value={geoLines.cheek.width} onChange={(e) => handleSliderChange('cheek', 'width', e.target.value)} className="w-full accent-green-400"/>
             <input type="range" min="0" max="100" value={geoLines.cheek.y} onChange={(e) => handleSliderChange('cheek', 'y', e.target.value)} className="w-1/3 accent-green-400"/>
           </div>
         </div>
         <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
           <label className="text-xs text-red-500 font-bold flex justify-between mb-1">Largura Mandíbula / Posição</label>
           <div className="flex gap-2">
             <input type="range" min="10" max="90" value={geoLines.jaw.width} onChange={(e) => handleSliderChange('jaw', 'width', e.target.value)} className="w-full accent-red-500"/>
             <input type="range" min="0" max="100" value={geoLines.jaw.y} onChange={(e) => handleSliderChange('jaw', 'y', e.target.value)} className="w-1/3 accent-red-500"/>
           </div>
         </div>
         <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
           <label className="text-xs text-white font-bold flex justify-between mb-1">Altura do Rosto (Topo - Base)</label>
           <div className="flex gap-2">
             <input type="range" min="0" max="50" value={geoLines.height.top} onChange={(e) => handleSliderChange('height', 'top', e.target.value)} className="w-full accent-white"/>
             <input type="range" min="50" max="100" value={geoLines.height.bottom} onChange={(e) => handleSliderChange('height', 'bottom', e.target.value)} className="w-full accent-white"/>
           </div>
         </div>
      </div>

      <button 
        onClick={calculateResults}
        className="mt-6 w-full py-4 bg-amber-500 text-slate-900 rounded-xl font-bold text-lg hover:bg-amber-400 shadow-lg shadow-amber-500/20 transition-all mb-8"
      >
        Processar Dados Reais
      </button>
    </div>
  );

  const ResultScreen = () => {
    // Local state for manual refinement logic
    const [activeArchetypeKey, setActiveArchetypeKey] = useState<string>(finalResult.archetype);
    const [isEditing, setIsEditing] = useState(false);
    
    // Style Category State (Hair vs Glasses)
    const [activeCategory, setActiveCategory] = useState<'hair' | 'glasses'>('hair');

    // Recommendation Customization State
    const [currentList, setCurrentList] = useState<any[]>([]);
    const [isManualSelection, setIsManualSelection] = useState(false);
    const [swappingIndex, setSwappingIndex] = useState<number | null>(null);
    const [searchTerm, setSearchTerm] = useState("");

    const archetypeData = VISAGISM_ALGORITHM.archetypes[activeArchetypeKey as keyof typeof VISAGISM_ALGORITHM.archetypes];
    const skinProfile = skinToneType ? SKIN_PROFILES[skinToneType] : SKIN_PROFILES.neutral;

    // Effect to update recommendation list when archetype or category changes, but ONLY if not manually overridden
    useEffect(() => {
        if (!isManualSelection) {
            const list = activeCategory === 'hair' ? archetypeData.hair : archetypeData.glasses;
            setCurrentList(list || []);
        }
    }, [activeArchetypeKey, isManualSelection, activeCategory, archetypeData]);

    // Reset search when modal opens
    useEffect(() => {
        if (swappingIndex !== null) setSearchTerm("");
    }, [swappingIndex]);

    const handleSwapStyle = (newStyle: any) => {
        if (swappingIndex === null) return;
        const newList = [...currentList];
        newList[swappingIndex] = newStyle;
        setCurrentList(newList);
        setIsManualSelection(true);
        setSwappingIndex(null);
    };

    if (selectedStyle) {
       return (
        <div className="flex-1 w-full max-w-4xl mx-auto p-4 animate-fade-in pb-24">
           <button onClick={() => setSelectedStyle(null)} className="mb-6 flex items-center gap-2 text-slate-400 hover:text-white transition-colors bg-slate-900 py-2 px-4 rounded-full w-fit border border-slate-700">
             <ArrowLeft size={18} /> Voltar
           </button>
           <div className="bg-slate-900 rounded-2xl overflow-hidden border border-slate-700 shadow-2xl">
              <div className="md:flex">
                 <div className="md:w-1/2 h-64 md:h-auto relative">
                    <img src={selectedStyle.image} className="w-full h-full object-cover"/>
                 </div>
                 <div className="p-6 md:p-8 md:w-1/2 space-y-4">
                    <h2 className="text-2xl font-bold text-white">{selectedStyle.name}</h2>
                    <p className="text-amber-500 font-medium text-sm">Ideal para: {archetypeData.name}</p>
                    <p className="text-slate-300 italic bg-slate-800 p-4 rounded-lg">"{selectedStyle.guide}"</p>
                 </div>
              </div>
           </div>
        </div>
       );
    }

    return (
      <div className="flex-1 w-full max-w-3xl mx-auto p-4 animate-fade-in pb-24 relative">
          {/* Header Resultado */}
          <div className="text-center mb-8">
            <div className="inline-block p-3 rounded-full bg-green-500/10 text-green-500 border border-green-500/30 mb-4">
              <CheckCircle2 size={32} />
            </div>
            <h2 className="text-3xl font-light text-white">Análise <span className="font-bold text-amber-500">Concluída</span></h2>
            <p className="text-slate-400 text-sm mt-2">Baseado em {finalResult.ratios.jawToForeheadRatio.toFixed(2)} de proporção facial.</p>
          </div>

          {/* Refinement Toggle */}
          <div className="flex justify-end mb-4">
             <button 
                onClick={() => setIsEditing(!isEditing)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${isEditing ? 'bg-amber-500 text-slate-900' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
             >
                <Edit3 className="w-4 h-4" />
                {isEditing ? 'Concluir Refino' : 'Refinar Diagnóstico'}
             </button>
          </div>

          {/* Cartão de Diagnóstico */}
          <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-2xl mb-8 relative overflow-hidden transition-all duration-300">
             <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl"></div>
             
             {isEditing ? (
                 <div className="relative z-10 space-y-4">
                     <label className="text-xs font-bold text-amber-500 uppercase tracking-wider block">Selecione o Temperamento/Formato:</label>
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                         {Object.values(VISAGISM_ALGORITHM.archetypes).map((arch) => (
                             <button
                                key={arch.id}
                                onClick={() => { setActiveArchetypeKey(arch.id); setIsManualSelection(false); }}
                                className={`p-4 rounded-xl border text-left transition-all ${
                                    activeArchetypeKey === arch.id 
                                    ? 'bg-amber-500/20 border-amber-500 text-white' 
                                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
                                }`}
                             >
                                 <span className="font-bold text-sm block">{arch.name}</span>
                                 <span className="text-xs opacity-70">{arch.temperament}</span>
                             </button>
                         ))}
                     </div>
                     <p className="text-xs text-slate-500 mt-2 italic">*Ajustar o diagnóstico atualizará instantaneamente todas as sugestões abaixo.</p>
                 </div>
             ) : (
                <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
                    <div className="w-24 h-24 rounded-full border-4 border-amber-500 overflow-hidden shrink-0">
                    <img src={image!} className="w-full h-full object-cover" />
                    </div>
                    <div className="text-center md:text-left">
                    <h3 className="text-2xl font-bold text-white mb-1 flex items-center gap-2 justify-center md:justify-start">
                        {archetypeData.name}
                        {activeArchetypeKey !== finalResult.archetype && (
                            <span className="bg-amber-500/20 text-amber-500 text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider border border-amber-500/30">Ajustado</span>
                        )}
                    </h3>
                    <div className="flex items-center gap-2 justify-center md:justify-start mb-2">
                        <span className="inline-block px-2 py-1 bg-slate-800 rounded text-xs text-amber-500 font-mono border border-slate-700">
                            {skinProfile.label} ({skinProfile.desc})
                        </span>
                    </div>
                    <p className="text-slate-300 text-sm leading-relaxed">{archetypeData.desc}</p>
                    </div>
                </div>
             )}
          </div>

          {/* Recomendações Tabs */}
          <div className="flex items-center justify-between mb-4">
              <div className="flex gap-2">
                  <button 
                    onClick={() => { setActiveCategory('hair'); setIsManualSelection(false); }}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${activeCategory === 'hair' ? 'bg-white text-slate-900' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                  >
                      <Scissors className="w-3.5 h-3.5" /> Cabelo
                  </button>
                  <button 
                    onClick={() => { setActiveCategory('glasses'); setIsManualSelection(false); }}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${activeCategory === 'glasses' ? 'bg-white text-slate-900' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                  >
                      <Glasses className="w-3.5 h-3.5" /> Óculos
                  </button>
              </div>
              {isManualSelection && <span className="text-[10px] bg-slate-800 px-2 py-1 rounded text-slate-400">Personalizado</span>}
          </div>
          
          {/* Grid de Sugestões */}
          <div className="grid sm:grid-cols-3 gap-4 mb-8">
             {currentList.map((style, i) => (
                <div key={i} className="bg-slate-900 rounded-xl overflow-hidden border border-slate-800 cursor-pointer hover:border-amber-500 transition-all group relative">
                   <div onClick={() => setSelectedStyle(style)} className="h-40 overflow-hidden relative">
                      <img src={style.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform"/>
                      <div className="absolute inset-0 bg-black/40 group-hover:bg-transparent transition-colors"></div>
                      <div className="absolute bottom-2 right-2 text-white text-xs bg-black/50 px-2 py-1 rounded backdrop-blur">Ver</div>
                   </div>
                   <div className="p-3 pr-10">
                      <h4 className="text-white font-bold text-sm truncate">{style.name}</h4>
                   </div>
                   
                   {/* Swap Button (Edit Mode) */}
                   {isEditing && (
                       <button 
                           onClick={(e) => { e.stopPropagation(); setSwappingIndex(i); }}
                           className="absolute bottom-2 right-2 p-2 bg-amber-500 text-slate-900 rounded-full shadow-lg hover:bg-amber-400 z-10 transition-transform hover:scale-110"
                           title="Trocar Sugestão"
                       >
                           <RefreshCw className="w-4 h-4" />
                       </button>
                   )}
                </div>
             ))}
          </div>

          <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
             <h4 className="text-amber-500 font-bold text-sm mb-2 uppercase">Dicas Finais</h4>
             <ul className="text-slate-300 text-sm space-y-2 list-disc list-inside">
               <li><strong>Óculos:</strong> {archetypeData.glasses.map((g: any) => g.name).join(', ')}.</li>
               <li><strong>Maquiagem:</strong> {skinProfile.makeup}</li>
               <li><strong>Metais:</strong> {skinProfile.metals}.</li>
             </ul>
          </div>
          
          <button onClick={() => setStep('home')} className="mt-8 w-full py-3 bg-slate-800 text-slate-400 hover:text-white rounded-xl border border-slate-700">Nova Análise</button>

          {/* Swap Modal */}
          {swappingIndex !== null && (
              <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setSwappingIndex(null)}>
                  <div className="bg-slate-900 w-full max-w-lg rounded-2xl border border-slate-700 shadow-2xl flex flex-col max-h-[80vh]" onClick={e => e.stopPropagation()}>
                      <div className="p-4 border-b border-slate-800 flex justify-between items-center">
                          <h4 className="text-white font-bold flex items-center gap-2">
                              {activeCategory === 'hair' ? <Scissors className="w-4 h-4 text-amber-500" /> : <Glasses className="w-4 h-4 text-amber-500" />}
                              Biblioteca de {activeCategory === 'hair' ? 'Cabelo' : 'Óculos'}
                          </h4>
                          <button onClick={() => setSwappingIndex(null)} className="p-2 hover:bg-slate-800 rounded-full"><X className="w-5 h-5 text-slate-400"/></button>
                      </div>
                      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-3">
                          <div className="relative mb-4">
                              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                              <input 
                                type="text" 
                                placeholder="Buscar estilo ou formato..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 bg-slate-800 rounded-lg text-sm text-white focus:outline-none focus:ring-1 focus:ring-amber-500 placeholder:text-slate-600"
                              />
                          </div>
                          {getAllStyles(activeCategory)
                            .filter(style => 
                                style.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                style.origin.toLowerCase().includes(searchTerm.toLowerCase())
                            )
                            .map((style, idx) => (
                              <button 
                                key={idx} 
                                onClick={() => handleSwapStyle(style)}
                                className="w-full flex items-center gap-4 p-2 hover:bg-slate-800 rounded-lg transition-colors group text-left"
                              >
                                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-slate-800 shrink-0">
                                      <img src={style.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                                  </div>
                                  <div>
                                      <h5 className="text-white font-bold text-sm">{style.name}</h5>
                                      <span className="text-[10px] text-slate-500 uppercase tracking-wider">{style.origin}</span>
                                  </div>
                                  <div className="ml-auto text-amber-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <Check className="w-5 h-5" />
                                  </div>
                              </button>
                          ))}
                      </div>
                  </div>
              </div>
          )}
      </div>
    );
  };

  const HomeScreen = () => (
    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center animate-fade-in">
      <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-2xl mb-8 relative">
        <Scan size={64} className="text-amber-500" />
        <div className="absolute -top-2 -right-2 bg-green-500 text-slate-900 text-xs font-bold px-2 py-1 rounded-full animate-bounce">
          100% Real
        </div>
      </div>
      
      <h1 className="text-4xl font-light text-white mb-4">Visagismo <span className="font-bold text-amber-500">Técnico</span></h1>
      <p className="text-slate-400 max-w-sm mb-10 text-sm leading-relaxed">
        Sem suposições. Usamos biometria real. <br/>
        Você tira a foto, nós medimos os pixels e calculamos a proporção exata do seu rosto.
      </p>

      <div className="w-full max-w-xs space-y-4">
        <button 
          onClick={startCamera}
          className="w-full py-4 bg-white hover:bg-slate-200 text-slate-900 rounded-xl font-bold flex items-center justify-center gap-3 transition-colors shadow-lg"
        >
          <Camera size={20} /> Usar Câmera
        </button>
        <label className="w-full py-4 bg-slate-900 text-slate-300 border border-slate-800 rounded-xl font-medium cursor-pointer flex items-center justify-center gap-3 hover:bg-slate-800 transition-colors">
          <Upload size={20} /> Upload Arquivo
          <input type="file" className="hidden" accept="image/*" onChange={handleUpload} />
        </label>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950 font-sans text-slate-200 flex flex-col overflow-y-auto custom-scrollbar">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-slate-950/80 backdrop-blur-md p-4 flex justify-between items-center border-b border-slate-900">
          <button onClick={onClose} className="p-2 hover:bg-slate-900 rounded-full transition-colors text-slate-400 hover:text-white">
              <X size={24} />
          </button>
          <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Laboratório</span>
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
          </div>
      </div>

      {step === 'home' && <HomeScreen />}
      
      {step === 'camera' && (
        <div className="flex-1 bg-black flex flex-col justify-center relative">
           <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover transform -scale-x-100" />
           <div className="absolute bottom-10 inset-x-0 flex justify-center gap-8 z-50">
              <button onClick={() => setStep('home')} className="p-4 bg-slate-800 rounded-full text-white hover:bg-slate-700 transition-colors"><X/></button>
              <button onClick={capturePhoto} className="w-20 h-20 bg-white rounded-full border-4 border-slate-400 flex items-center justify-center hover:scale-105 transition-transform">
                 <div className="w-16 h-16 bg-white rounded-full border-2 border-black"></div>
              </button>
           </div>
        </div>
      )}

      {step === 'crop_skin' && <SkinAnalysisScreen />}
      {step === 'crop_geo' && <GeometryScreen />}
      {step === 'result' && <ResultScreen />}
    </div>
  );
};
