
import React, { useState, useEffect, useRef } from 'react';
import { 
  Camera, Upload, Share2, Sparkles, User as UserIcon, 
  Loader2, Download, LogOut, X, Menu, SwitchCamera,
  Check, Plus, Trash2, ArrowRight, Layout, Grid, SplitSquareHorizontal,
  BookOpen, Wand2, Eye, ScanFace, Timer, Heart, Edit3, Grid3X3, RefreshCw,
  Info, ShoppingBag, ExternalLink, Send, Image as ImageIcon, Filter, Save, XCircle,
  ArrowUpDown, Palette, Sliders, MapPin, Briefcase, Sun, Moon, Coffee, Dumbbell,
  Focus, Tag, Edit, Pencil, Scan, Zap, ChevronDown, Shirt, Bell, Search, Home as HomeIcon, FileText, Smartphone,
  ThumbsUp, ThumbsDown, Package, Layers, ZoomIn, Clock, Lightbulb, ChevronLeft, CheckCircle2
} from 'lucide-react';
import { Onboarding } from './components/Onboarding';
import { AuthModal } from './components/AuthModal';
import { Modal } from './components/Modal';
import { VisagismGuideModal } from './components/VisagismGuideModal';
import { VisagismAnalysis } from './components/VisagismAnalysis';
import { ComparisonView } from './components/ComparisonView';
import { Logo } from './components/Logo';
import { ProfileSettingsModal } from './components/ProfileSettingsModal';
import { analyzeImageWithGemini, generateVisualEdit } from './services/geminiService';
import { generateDossierPDF } from './services/pdfService';
import { LandingPage } from './components/LandingPage'; 
import { db, Analise } from './services/database';
import type { AnalysisResult, OutfitSuggestion, UserRole, SkinTone, ColorPalette, UserMetrics, Visagismo, UserPreferences } from './types';

// Enhanced Skin Tone Data for Brazilian Diversity
const SKIN_TONE_DATA: Record<SkinTone, { description: string; palettes: ColorPalette[]; makeup: string; color: string }> = {
    'Quente': {
        description: "Pele com fundo dourado, amarelado ou alaranjado. Bronzeia facilmente e tem veias esverdeadas.",
        palettes: [
            { hex: "#D4AF37", nome: "Dourado" }, { hex: "#FF7F50", nome: "Coral" },
            { hex: "#8B4513", nome: "Terra" }, { hex: "#556B2F", nome: "Verde Oliva" },
            { hex: "#F4A460", nome: "Areia" }, { hex: "#CD853F", nome: "Bronze" }
        ],
        makeup: "Tons terrosos, pêssego, dourado e bronzer. Batons alaranjados ou vermelhos quentes.",
        color: "#f59e0b" // Amber 500
    },
    'Frio': {
        description: "Pele com fundo rosado, avermelhado ou azulado. Queima-se facilmente e tem veias azuladas.",
        palettes: [
            { hex: "#000080", nome: "Azul Marinho" }, { hex: "#C0C0C0", nome: "Prata" },
            { hex: "#800080", nome: "Roxo" }, { hex: "#DC143C", nome: "Vermelho Cereja" },
            { hex: "#E0FFFF", nome: "Gelo" }, { hex: "#FF69B4", nome: "Rosa Choque" }
        ],
        makeup: "Tons de rosa, prata, cinza e azul. Batons em tons de frutas vermelhas ou rosa frio.",
        color: "#3b82f6" // Blue 500
    },
    'Neutro': {
        description: "Equilíbrio entre quente e frio. Versátil com quase todas as cores, não tem subtons dominantes óbvios.",
        palettes: [
            { hex: "#40E0D0", nome: "Turquesa" }, { hex: "#FF69B4", nome: "Rosa Médio" },
            { hex: "#F5F5DC", nome: "Bege" }, { hex: "#708090", nome: "Cinza Ardósia" },
            { hex: "#2E8B57", nome: "Verde Mar" }, { hex: "#483D8B", nome: "Azul Ardósia" }
        ],
        makeup: "Pode transitar entre tons quentes e frios. Foco em iluminar naturalmente.",
        color: "#a3a3a3" // Neutral Gray
    },
    'Oliva': {
        description: "Fundo esverdeado, acinzentado ou amarelado frio. Comum em peles morenas e negras brasileiras.",
        palettes: [
            { hex: "#2F4F4F", nome: "Verde Escuro" }, { hex: "#800000", nome: "Vinho" },
            { hex: "#4B0082", nome: "Índigo" }, { hex: "#DAA520", nome: "Ocre" },
            { hex: "#556B2F", nome: "Verde Militar" }, { hex: "#A52A2A", nome: "Marrom" }
        ],
        makeup: "Tons de ameixa, beringela e metálicos profundos. Evite tons pastéis muito claros que apagam a pele.",
        color: "#84cc16" // Lime 500
    }
};

const ENVIRONMENTS = [
  { label: 'Geral', value: 'General Style', icon: Sparkles },
  { label: 'Trabalho', value: 'Office Business', icon: Briefcase },
  { label: 'Praia', value: 'Beach Resort', icon: Sun },
  { label: 'Festa', value: 'Night Club Party', icon: Moon },
  { label: 'Encontro', value: 'Casual Date', icon: Coffee },
  { label: 'Esporte', value: 'Gym Sport', icon: Dumbbell },
];

const CATEGORIES = [
    { label: 'Ocasião', icon: Timer },
    { label: 'Cores', icon: Palette },
    { label: 'Estilo', icon: Tag },
    { label: 'Peças', icon: Shirt },
    { label: 'Visagismo', icon: ScanFace },
];

const PRESET_TAGS = ["Trabalho", "Evento", "Conforto", "Verão", "Inverno", "Ousado", "Clássico", "Date", "Viagem"];

// Simple Toast Component (Internal)
const Toast = ({ msg, type }: { msg: string, type: 'success' | 'error' | 'info' }) => (
  <div className={`fixed top-4 left-1/2 -translate-x-1/2 px-4 py-3 rounded-lg shadow-xl text-white font-medium z-[1000] animate-fade-in flex items-center gap-2 ${
    type === 'success' ? 'bg-green-600' : type === 'error' ? 'bg-red-600' : 'bg-indigo-600'
  }`}>
    {type === 'info' && <Zap className="w-4 h-4 animate-pulse text-yellow-300" />}
    {msg}
  </div>
);

// Helper: Play Camera Shutter Sound
const playShutterSound = () => {
    try {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContext) return;
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        // Simulating a "Click" sound
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.08);
        
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
        
        osc.start();
        osc.stop(ctx.currentTime + 0.08);
    } catch (e) {
        console.warn("Audio playback failed", e);
    }
};

export default function App() {
  const [user, setUser] = useState<{ displayName: string | null; email: string | null; photoURL: string | null; uid: string } | null>(null);
  const [images, setImages] = useState<string[]>([]); // Changed to Array for multiple photos
  const [history, setHistory] = useState<Analise[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  
  // App View State
  const [showLanding, setShowLanding] = useState(true); 
  const [currentView, setCurrentView] = useState<'home' | 'analysis' | 'profile' | 'grid'>('home');

  // User Metrics (Input before analysis)
  const [metrics, setMetrics] = useState<UserMetrics>({ height: '', weight: '' });
  
  // User Preferences
  const [userPreferences, setUserPreferences] = useState<UserPreferences>({ favoriteStyles: [], favoriteColors: '', avoidItems: '' });
  
  // Environment Selection
  const [targetEnvironment, setTargetEnvironment] = useState<string>('General Style');

  // Skin Tone State
  const [currentSkinTone, setCurrentSkinTone] = useState<SkinTone>('Neutro');
  
  // States required for Dossier
  const [isGeneratingDossier, setIsGeneratingDossier] = useState(false);
  
  // States for Comparison Feature
  const [selectedOutfits, setSelectedOutfits] = useState<OutfitSuggestion[]>([]);
  const [showComparison, setShowComparison] = useState(false);
  const [isGeneratingComparison, setIsGeneratingComparison] = useState(false);

  // States for Outfit Generation (Virtual Try-On)
  const [generatingOutfitIndex, setGeneratingOutfitIndex] = useState<number | null>(null);
  const [isGeneratingAll, setIsGeneratingAll] = useState(false);
  const [viewingOutfitIndex, setViewingOutfitIndex] = useState<number | null>(null);
  const [refinementPrompt, setRefinementPrompt] = useState("");
  const [isRefining, setIsRefining] = useState(false);

  // Outfit Filtering & Sorting State
  const [activeOutfitFilter, setActiveOutfitFilter] = useState<string>('Todas');
  const [outfitSortOrder, setOutfitSortOrder] = useState<'relevance' | 'favorites'>('relevance');
  const [showFilters, setShowFilters] = useState(false); // Toggle extra filters
  const [filterCriteria, setFilterCriteria] = useState({
      season: 'Todos',
      color: 'Todos'
  });

  // Animation states
  const [animatedHearts, setAnimatedHearts] = useState<Record<number, boolean>>({});

  // Visagism Editing State
  const [isEditingVisagism, setIsEditingVisagism] = useState(false);
  const [tempVisagism, setTempVisagism] = useState<Visagismo | null>(null);

  // States for Visagism Guide
  const [showVisagismGuide, setShowVisagismGuide] = useState(false);
  const [showVisagismAnalysis, setShowVisagismAnalysis] = useState(false);
  const [showProfileSettings, setShowProfileSettings] = useState(false);

  // States for Manual Outfit Editing
  const [editingOutfitIndex, setEditingOutfitIndex] = useState<number | null>(null);
  const [tempOutfitData, setTempOutfitData] = useState<OutfitSuggestion | null>(null);

  // Camera States
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [isFlashing, setIsFlashing] = useState(false);
  const [timerDuration, setTimerDuration] = useState<0 | 3 | 10>(0);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [showGrid, setShowGrid] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const videoRef = useRef<HTMLVideoElement>(null);

  // UI States
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [showUploadOption, setShowUploadOption] = useState(false);
  const [toast, setToast] = useState<{ msg: string, type: 'success'|'error'|'info' } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Derived primary image
  const primaryImage = images.length > 0 ? images[0] : null;

  // PWA Install State
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  // --- PERSISTENCE LOGIC (USING DB SERVICE) ---
  useEffect(() => {
      const initApp = async () => {
          try {
              const savedUser = db.getCurrentUser(); // Load from DB session
              if (savedUser) {
                  setUser({
                      uid: savedUser.id.toString(),
                      displayName: savedUser.nome,
                      email: savedUser.email,
                      photoURL: savedUser.foto_perfil || null
                  });
                  setShowLanding(false);
                  
                  // Load full history
                  const userHistory = await db.getUserAnalyses(savedUser.id);
                  setHistory(userHistory);

                  // If logged in, try to load last analysis
                  const lastAnalysis = userHistory[0];
                  if (lastAnalysis) {
                      setAnalysisResult(lastAnalysis.resultado_json);
                      setImages([lastAnalysis.foto_url]);
                  }
              }
              
              // Load prefs separately
              const savedPrefs = localStorage.getItem('vizu_prefs');
              if (savedPrefs) setUserPreferences(JSON.parse(savedPrefs));

          } catch (e) {
              console.error("Failed to load state", e);
          }
      };
      initApp();
  }, []);

  useEffect(() => {
      if (userPreferences) localStorage.setItem('vizu_prefs', JSON.stringify(userPreferences));
  }, [userPreferences]);

  const handleClearData = () => {
      setAnalysisResult(null);
      setImages([]);
      // We don't delete from DB history, just clear current view
      addToast("Visualização limpa. Histórico mantido.", "info");
  };

  const handleLogout = () => {
      db.setCurrentUser(null);
      setUser(null);
      setHistory([]);
      handleClearData();
      setShowLanding(true);
  };

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  const handleLoadHistory = (item: Analise) => {
      setAnalysisResult(item.resultado_json);
      setImages([item.foto_url]);
      setCurrentView('analysis');
      addToast("Análise carregada do histórico.", "success");
  };

  // Generate a random daily tip based on history
  const getDailyTip = () => {
      if (history.length === 0) return null;
      const last = history[0].resultado_json;
      if (!last) return null;

      // Simple pseudo-random logic based on minutes to keep it static for a bit
      const isEven = new Date().getMinutes() % 2 === 0;
      
      if (isEven) {
          return {
              title: "Insight de Cor",
              text: `Sua pele com subtom ${last.tom_pele_detectado || 'neutro'} brilha com ${last.paleta_cores?.[0]?.nome || 'tons terrosos'}. Experimente hoje!`,
              icon: Palette,
              color: "text-rose-500",
              bg: "bg-rose-50 dark:bg-rose-900/20"
          };
      } else {
          return {
              title: "Dica de Visagismo",
              text: `Para valorizar seu rosto ${last.formato_rosto_detalhado}, aposte em ${last.visagismo?.acessorios?.[0] || 'acessórios que criem contraste'}.`,
              icon: ScanFace,
              color: "text-indigo-500",
              bg: "bg-indigo-50 dark:bg-indigo-900/20"
          };
      }
  };

  const dailyTip = getDailyTip();

  // Helper: Toast
  const addToast = (msg: string, type: 'success' | 'error' | 'info') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Logic to enter the main app
  const enterApp = () => {
      setShowLanding(false);
      // Optional: Check if onboarding was seen, if not show it
      const seen = localStorage.getItem('vizu_intro_seen_v2');
      if (!seen) {
          setShowOnboarding(true);
      }
  };

  // Logic to handle login from landing page
  const handleLandingLogin = () => {
      setShowAuth(true);
  };

  // When user logs in via AuthModal, we also enter the app
  const handleMockLogin = (u: any) => {
      setUser(u);
      db.setCurrentUser({
          id: parseInt(u.uid) || Date.now(),
          nome: u.displayName || 'Usuario',
          email: u.email,
          senha_hash: '',
          nivel_acesso: u.role === 'admin' ? 'admin' : 'user',
          data_cadastro: new Date().toISOString()
      });
      // Fetch history immediately
      db.getUserAnalyses(parseInt(u.uid) || 0).then(h => setHistory(h));
      enterApp();
  };

  // --- Feedback Logic ---
  const handleOutfitFeedback = (index: number, feedback: 'like' | 'dislike') => {
      if (!analysisResult) return;
      const newSuggestions = [...analysisResult.sugestoes_roupa];
      const outfit = newSuggestions[index];
      
      // Toggle logic: if clicking same feedback, remove it.
      if (outfit.feedback === feedback) {
          outfit.feedback = null;
      } else {
          outfit.feedback = feedback;
          addToast(feedback === 'like' ? 'Obrigado! Vamos sugerir mais assim.' : 'Entendido. Vamos evitar este estilo.', 'info');
          
          // REFINEMENT LOGIC: If liked, add style to preferences
          if (feedback === 'like') {
              const styles = outfit.visagismo_sugerido.split(',').concat(outfit.titulo.split(' '));
              const currentPrefs = new Set(userPreferences.favoriteStyles);
              
              // Add a couple of keywords from the title/style
              if (outfit.estacao) currentPrefs.add(outfit.estacao);
              // Basic logic to pick keywords
              styles.forEach(s => {
                  if (s.length > 4) currentPrefs.add(s.trim());
              });

              setUserPreferences(prev => ({
                  ...prev,
                  favoriteStyles: Array.from(currentPrefs).slice(10) // Limit to 10 tags
              }));
          }
      }
      
      setAnalysisResult({ ...analysisResult, sugestoes_roupa: newSuggestions });
  };

  // Centralized Analysis Logic
  const runAnalysis = async (inputImages: string[]) => {
    if (!inputImages || inputImages.length === 0) return;

    setIsAnalyzing(true);
    setAnalysisResult(null);
    setSelectedOutfits([]); 
    setActiveOutfitFilter('Todas');
    // Switch to analysis view
    setCurrentView('analysis');
    
    try {
      // Clean base64 strings
      const rawBase64Images = inputImages.map(img => img.includes(',') ? img.split(',')[1] : img);
      
      const result = await analyzeImageWithGemini(rawBase64Images, metrics, targetEnvironment, userPreferences);
      setAnalysisResult(result);
      if (result.tom_pele_detectado) {
          setCurrentSkinTone(result.tom_pele_detectado);
      }

      // SAVE TO DB if user is logged in
      if (user) {
          // Saving primary image to DB for history
          const newAnalise = await db.saveAnalise(parseInt(user.uid) || 0, inputImages[0], result);
          setHistory(prev => [newAnalise, ...prev]);
      }

      addToast("Análise de estilo concluída!", "success");
    } catch (err: any) {
      console.error(err);
      addToast(err.message || "Erro na análise", "error");
      // Go back home if failed
      setCurrentView('home');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // ... (Rest of component methods kept same, just ensuring correct context)
  const handleSaveOrShareImage = async (dataUrl: string, filename: string) => {
    try {
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = `${filename}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        addToast("Imagem salva com sucesso!", "success");
    } catch (e) {
        console.error(e);
        addToast("Erro ao salvar imagem", "error");
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (images.length >= 3) {
        addToast("Máximo de 3 fotos atingido.", "info");
        return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
        setImages(prev => [...prev, reader.result as string]);
    };
    reader.readAsDataURL(file);
    e.target.value = ''; // Reset input
  };

  const removeImage = (index: number) => {
      setImages(prev => prev.filter((_, i) => i !== index));
  };

  const startAnalysis = () => {
      if (images.length === 0) return;
      setShowUploadOption(false);
      runAnalysis(images);
  };

  // --- VISAGISM EDITING LOGIC ---
  const startEditingVisagism = () => {
      if (!analysisResult) return;
      setTempVisagism(JSON.parse(JSON.stringify(analysisResult.visagismo)));
      setIsEditingVisagism(true);
  };

  const cancelEditingVisagism = () => {
      setTempVisagism(null);
      setIsEditingVisagism(false);
  };

  const saveVisagismChanges = () => {
      if (!analysisResult || !tempVisagism) return;
      setAnalysisResult({
          ...analysisResult,
          visagismo: tempVisagism
      });
      setIsEditingVisagism(false);
      addToast("Ajustes de visagismo salvos.", "success");
  };

  // --- OUTFIT EDITING LOGIC (MANUAL) ---
  const handleStartEdit = (index: number, outfit: OutfitSuggestion) => {
    setEditingOutfitIndex(index);
    setTempOutfitData(JSON.parse(JSON.stringify(outfit)));
  };

  const handleCancelEdit = () => {
    setEditingOutfitIndex(null);
    setTempOutfitData(null);
  };

  const handleSaveEdit = () => {
    if (!analysisResult || editingOutfitIndex === null || !tempOutfitData) return;
    
    // Update the outfit in the list
    const newSuggestions = [...analysisResult.sugestoes_roupa];
    
    // We update the outfit at editingOutfitIndex
    newSuggestions[editingOutfitIndex] = tempOutfitData;
    
    setAnalysisResult({ ...analysisResult, sugestoes_roupa: newSuggestions });
    setEditingOutfitIndex(null);
    setTempOutfitData(null);
    addToast("Look atualizado com sucesso!", "success");
  };

  const handleComponentChange = (compIndex: number, field: 'peca' | 'loja', value: string) => {
    if (!tempOutfitData || !tempOutfitData.components) return;
    const newComponents = [...tempOutfitData.components];
    newComponents[compIndex] = { ...newComponents[compIndex], [field]: value };
    setTempOutfitData({ ...tempOutfitData, components: newComponents });
  };

  // --- SKIN TONE UPDATE LOGIC ---
  const handleSkinToneChange = (tone: SkinTone) => {
      if (!analysisResult) return;
      
      setCurrentSkinTone(tone);
      const updatedData = SKIN_TONE_DATA[tone];
      
      const newResult = { 
          ...analysisResult,
          analise_pele: `(Ajuste Manual: ${tone}). ${updatedData.description}`,
          tom_pele_detectado: tone,
          paleta_cores: updatedData.palettes,
          visagismo: {
              ...analysisResult.visagismo,
              barba_ou_make: {
                  ...analysisResult.visagismo.barba_ou_make,
                  detalhes: updatedData.makeup,
                  motivo: `Ajustado manualmente para subtom ${tone}`
              }
          }
      };
      setAnalysisResult(newResult);
      addToast(`Paleta recalculada para: ${tone}`, "success");
  };

  // --- OUTFIT GENERATION & REFINEMENT ---
  const handleGenerateLook = async (index: number, outfit: OutfitSuggestion, customRefinement?: string, silent = false) => {
    // We use image (primary image) for virtual try-on visual generation
    const sourceImage = primaryImage;
    if (!sourceImage || !analysisResult) return;
    
    if (customRefinement) {
        setIsRefining(true);
    } else {
        setGeneratingOutfitIndex(index);
    }

    try {
        const rawBase64 = sourceImage.includes(',') ? sourceImage.split(',')[1] : sourceImage;
        
        // Uses the *latest* visagism details, including manual edits
        const currentVisagismoDescription = `Hair: ${analysisResult.visagismo.cabelo.estilo} (${analysisResult.visagismo.cabelo.detalhes}). Makeup/Beard: ${analysisResult.visagismo.barba_ou_make.estilo} (${analysisResult.visagismo.barba_ou_make.detalhes}).`;

        const modificationPrompt = `Personal Stylist Request: Wear stylish outfit: ${outfit.titulo}. Details: ${outfit.detalhes}. Style: ${outfit.ocasiao}. Perfectly fit for biotype: ${analysisResult.biotipo}. Maintain sophisticated look. Keep face identity and pose.`;
        
        const generatedImage = await generateVisualEdit(
            rawBase64,
            "clothing", 
            modificationPrompt,
            currentVisagismoDescription, // Pass updated visagism
            { biotype: analysisResult.biotipo, palette: "harmonious" },
            customRefinement
        );

        setAnalysisResult((prev) => {
            if (!prev) return null;
            const realIndex = prev.sugestoes_roupa.findIndex(o => o.titulo === outfit.titulo);
            if (realIndex === -1) return prev;

            const newSuggestions = [...prev.sugestoes_roupa];
            newSuggestions[realIndex] = { 
                ...outfit, 
                generatedImage: `data:image/png;base64,${generatedImage.includes('base64,') ? generatedImage.split(',')[1] : generatedImage}`,
                lastModificationPrompt: customRefinement
            };
            return { ...prev, sugestoes_roupa: newSuggestions };
        });
        
        if (customRefinement) {
             setRefinementPrompt(""); 
             addToast("Look refinado sob medida!", "success");
        } else if (!silent) {
             addToast("Look gerado com sucesso!", "success");
             setViewingOutfitIndex(index); 
        }

    } catch (e: any) {
        console.error(e);
        if (!silent) addToast(e.message || "Erro ao gerar visualização do look.", "error");
    } finally {
        if (!silent) setGeneratingOutfitIndex(null);
        setIsRefining(false);
    }
  };

  const handleRefinementSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (viewingOutfitIndex !== null && analysisResult && refinementPrompt.trim()) {
        handleGenerateLook(viewingOutfitIndex, analysisResult.sugestoes_roupa[viewingOutfitIndex], refinementPrompt);
    }
  };

  // --- BATCH GENERATION ---
  const handleGenerateAllLooks = async () => {
      if (!analysisResult) return;
      setIsGeneratingAll(true);
      addToast("Iniciando Provador Mágico...", "success");

      for (let i = 0; i < analysisResult.sugestoes_roupa.length; i++) {
          const outfit = analysisResult.sugestoes_roupa[i];
          if (!outfit.generatedImage) {
              setGeneratingOutfitIndex(i);
              await handleGenerateLook(i, outfit, undefined, true);
          }
      }
      
      setGeneratingOutfitIndex(null);
      setIsGeneratingAll(false);
      addToast("Todos os provadores liberados!", "success");
  };

  // --- SHARE LOOK LOGIC ---
  const handleShareLook = async (outfit: OutfitSuggestion) => {
    if (!primaryImage) return;
    addToast("Preparando imagem...", "success");
    try {
        const canvas = document.createElement('canvas');
        canvas.width = 1080;
        canvas.height = 1080;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Load Primary Image
        const originalImg = new Image();
        originalImg.crossOrigin = "anonymous";
        originalImg.src = primaryImage;
        await new Promise(r => originalImg.onload = r);

        // Draw Images
        if (outfit.generatedImage) {
            const genImg = new Image();
            genImg.crossOrigin = "anonymous";
            genImg.src = outfit.generatedImage;
            await new Promise(r => genImg.onload = r);
            ctx.drawImage(originalImg, 0, 0, 540, 800, 0, 0, 540, 800); 
            ctx.drawImage(genImg, 0, 0, 540, 800, 540, 0, 540, 800);
        } else {
             ctx.drawImage(originalImg, 0, 0, 1080, 800);
        }
        
        // Footer Overlay
        ctx.fillStyle = "#0f172a"; // Dark Slate
        ctx.fillRect(0, 800, 1080, 280);
        
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 40px 'Inter', sans-serif";
        ctx.fillText(outfit.titulo, 50, 860);
        
        ctx.font = "italic 30px 'Inter', serif"; 
        ctx.fillStyle = "#a5b4fc";
        ctx.fillText(`VizuHalizando AI • ${outfit.ocasiao.toUpperCase()}`, 50, 910);
        
        ctx.font = "24px 'Inter', sans-serif";
        ctx.fillStyle = "#94a3b8";
        
        const words = outfit.detalhes.split(' ');
        let line = '';
        let y = 960;
        for (let n = 0; n < words.length; n++) {
             if (ctx.measureText(line + words[n]).width > 980) {
                 ctx.fillText(line, 50, y);
                 line = words[n] + ' ';
                 y += 35;
             } else {
                 line += words[n] + ' ';
             }
        }
        ctx.fillText(line, 50, y);

        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        
        if (navigator.share) {
             const blob = await (await fetch(dataUrl)).blob();
             // Fix TS error: cast blob to any to avoid type mismatch
             const file = new File([blob as any], "vizu-look.jpg", { type: "image/jpeg" });
             await navigator.share({
                 title: `VizuHalizando: ${outfit.titulo}`,
                 text: `Sugestão de estilo: ${outfit.detalhes}`,
                 files: [file]
             });
        } else {
             await handleSaveOrShareImage(dataUrl, `Vizu-Look-${outfit.titulo.replace(/\s/g,'-')}`);
        }

    } catch (e) {
        console.error(e);
        addToast("Erro ao compartilhar. Tente salvar.", "error");
    }
  };

  const toggleOutfitFavorite = (index: number) => {
    if (!analysisResult) return;
    
    // Trigger animation
    setAnimatedHearts(prev => ({ ...prev, [index]: true }));
    setTimeout(() => {
        setAnimatedHearts(prev => ({ ...prev, [index]: false }));
    }, 400);

    const newSuggestions = [...analysisResult.sugestoes_roupa];
    const isNowFavorite = !newSuggestions[index].isFavorite;
    
    newSuggestions[index] = { 
        ...newSuggestions[index], 
        isFavorite: isNowFavorite 
    };
    
    if (isNowFavorite) {
        addToast("Adicionado aos Favoritos", "success");
    }
    
    setAnalysisResult({ ...analysisResult, sugestoes_roupa: newSuggestions });
  };

  const updateOutfitNote = (index: number, note: string) => {
      if (!analysisResult) return;
      const newSuggestions = [...analysisResult.sugestoes_roupa];
      newSuggestions[index] = { 
          ...newSuggestions[index], 
          userNote: note 
      };
      setAnalysisResult({ ...analysisResult, sugestoes_roupa: newSuggestions });
  };

  // --- CAMERA LOGIC ---
  const startCamera = async (mode: 'user' | 'environment' = 'user') => {
    try {
      if (videoRef.current && videoRef.current.srcObject) {
         const stream = videoRef.current.srcObject as MediaStream;
         stream.getTracks().forEach(track => track.stop());
      }
      setIsCameraOpen(true);
      setShowUploadOption(false); // Close upload modal if open
      setFacingMode(mode);
      setZoomLevel(1);
      setTimeout(async () => {
          try {
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: { facingMode: mode, width: { ideal: 1920 }, height: { ideal: 1080 } } 
            });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
          } catch (innerErr) {
             console.error("Camera error:", innerErr);
             addToast("Erro ao iniciar câmera.", "error");
             setIsCameraOpen(false);
          }
      }, 100);
    } catch (err) {
      console.error(err);
      addToast("Erro de permissão.", "error");
      setIsCameraOpen(false);
    }
  };

  const switchCamera = () => {
      const newMode = facingMode === 'user' ? 'environment' : 'user';
      startCamera(newMode);
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraOpen(false);
    setCountdown(null);
  };

  const handleZoomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setZoomLevel(parseFloat(e.target.value));
  };

  const capturePhoto = () => {
    if (images.length >= 3) {
        addToast("Máximo de 3 fotos atingido.", "info");
        return;
    }

    setIsFlashing(true);
    playShutterSound(); // Trigger sound
    setTimeout(() => setIsFlashing(false), 200); // 200ms flash duration

    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      // Capture at video resolution
      const vWidth = videoRef.current.videoWidth;
      const vHeight = videoRef.current.videoHeight;
      canvas.width = vWidth;
      canvas.height = vHeight;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        if (facingMode === 'user') {
            ctx.translate(canvas.width, 0);
            ctx.scale(-1, 1);
        }
        
        // Apply Zoom Crop Logic
        // Calculate crop region based on zoomLevel
        const sWidth = vWidth / zoomLevel;
        const sHeight = vHeight / zoomLevel;
        const sx = (vWidth - sWidth) / 2;
        const sy = (vHeight - sHeight) / 2;

        ctx.drawImage(videoRef.current, sx, sy, sWidth, sHeight, 0, 0, vWidth, vHeight);
        
        const base64 = canvas.toDataURL('image/jpeg', 0.9);
        
        setImages(prev => [...prev, base64]);
        
        // Visual feedback
        addToast(`Foto capturada! (${images.length + 1}/3)`, "success");
      }
    }
  };

  const handleCaptureClick = () => {
     if (timerDuration === 0) capturePhoto();
     else setCountdown(timerDuration);
  };

  const finishCameraSession = () => {
      stopCamera();
      if (images.length > 0) {
          setShowUploadOption(true); // Return to preview modal
      }
  };

  useEffect(() => {
    if (countdown === null) return;
    if (countdown > 0) {
      const timerId = setTimeout(() => setCountdown(prev => prev! - 1), 1000);
      return () => clearTimeout(timerId);
    } 
    if (countdown === 0) {
       capturePhoto();
       setCountdown(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countdown]);

  const toggleOutfitSelection = (outfit: OutfitSuggestion) => {
    const isSelected = selectedOutfits.some(o => o.titulo === outfit.titulo);
    if (isSelected) {
        setSelectedOutfits(prev => prev.filter(o => o.titulo !== outfit.titulo));
    } else {
        if (selectedOutfits.length >= 3) {
            addToast("Selecione no máximo 3 looks.", "error");
            return;
        }
        setSelectedOutfits(prev => [...prev, outfit]);
    }
  };

  const handleExportComparison = async () => {
    if (selectedOutfits.length === 0) return;
    setIsGeneratingComparison(true);
    addToast("Gerando board comparativo...", "info");
    
    try {
        const canvas = document.createElement('canvas');
        canvas.width = 1920;
        canvas.height = 1080; 
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Header
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
        gradient.addColorStop(0, "#1e1b4b"); // Indigo 950
        gradient.addColorStop(1, "#312e81"); // Indigo 900
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, 150);
        
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 50px 'Inter', sans-serif";
        ctx.textAlign = "center";
        const userName = user?.displayName ? user.displayName.toUpperCase().split(' ')[0] : 'CLIENTE';
        ctx.fillText("VIZU HALIZANDO • BOARD COMPARATIVO", canvas.width / 2, 70);
        
        ctx.font = "italic 30px 'Inter', sans-serif";
        ctx.fillStyle = "rgba(255,255,255,0.8)";
        ctx.fillText(`ANÁLISE SOB MEDIDA PARA ${userName}`, canvas.width / 2, 115);
        
        const count = selectedOutfits.length;
        // Divide remaining width among outfits
        const colWidth = canvas.width / count;
        const margin = 40;
        const imageY = 250;
        const imageH = 700; // Fixed height for images
        
        // Load original image once
        const originalImg = new Image();
        if (primaryImage) {
            originalImg.crossOrigin = "anonymous";
            originalImg.src = primaryImage;
            await new Promise(r => originalImg.onload = r);
        }

        // Draw each outfit column
        for (let i = 0; i < count; i++) {
             const outfit = selectedOutfits[i];
             const colX = i * colWidth;
             const contentX = colX + margin;
             
             // Draw Text
             ctx.fillStyle = "#1e293b";
             ctx.font = "bold 30px 'Inter', sans-serif";
             ctx.textAlign = "left";
             ctx.fillText(outfit.titulo, contentX, 220);
             
             // Draw Image (Generated or Original as fallback)
             const targetSrc = outfit.generatedImage || primaryImage;
             if (targetSrc) {
                 const img = new Image();
                 img.crossOrigin = "anonymous";
                 img.src = targetSrc;
                 await new Promise((resolve, reject) => {
                     img.onload = resolve;
                     img.onerror = () => { console.warn("Failed to load outfit image for export"); resolve(null); };
                 });
                 
                 // Calc aspect ratio fit
                 const availableW = colWidth - (margin * 2);
                 // Draw fitted image
                 ctx.drawImage(img, contentX, imageY, availableW, imageH);
             }
        }

        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        await handleSaveOrShareImage(dataUrl, `Vizu-Board-${userName}`);
    } catch (e) {
        console.error(e);
        addToast("Erro ao gerar comparativo", "error");
    } finally {
        setIsGeneratingComparison(false);
    }
  };

  // --- LOOKBOOK / DOSSIER EXPORT (PDF) ---
  const handleExportAnalysis = async () => {
    if (!analysisResult || !primaryImage) return;
    setIsGeneratingDossier(true);
    addToast("Gerando Dossier PDF...", "info");
    
    try {
        const userName = user?.displayName ? user.displayName : 'Cliente';
        await generateDossierPDF(analysisResult, userName, primaryImage);
        addToast("Dossier baixado com sucesso!", "success");
    } catch (e) {
        console.error(e);
        addToast("Erro ao gerar Dossier. Tente novamente.", "error");
    } finally {
        setIsGeneratingDossier(false);
    }
  };

  // Helper to get unique occasions for filter
  const getUniqueOccasions = () => {
      if (!analysisResult) return [];
      const occasions = analysisResult.sugestoes_roupa.map(o => o.ocasiao);
      return ['Todas', ...new Set(occasions)];
  };

  // Filter outfits
  const filteredAndSortedOutfits = React.useMemo(() => {
    if (!analysisResult) return [];
    
    let result = analysisResult.sugestoes_roupa.filter(outfit => 
        activeOutfitFilter === 'Todas' || outfit.ocasiao === activeOutfitFilter
    );

    // Apply extra filters if defined
    if (filterCriteria.season !== 'Todos') {
        result = result.filter(o => 
            (o.estacao && o.estacao === filterCriteria.season) ||
            o.detalhes.toLowerCase().includes(filterCriteria.season.toLowerCase()) ||
            o.titulo.toLowerCase().includes(filterCriteria.season.toLowerCase())
        );
    }

    if (outfitSortOrder === 'favorites') {
        result = [...result].sort((a, b) => (b.isFavorite ? 1 : 0) - (a.isFavorite ? 1 : 0));
    }
    
    return result;
  }, [analysisResult, activeOutfitFilter, outfitSortOrder, filterCriteria]);

  // If showing landing page, return it.
  if (showLanding) {
      return (
          <>
            <LandingPage 
                onEnterApp={enterApp} 
                onLoginClick={handleLandingLogin}
            />
            {/* Auth Modal Triggered from Landing Page */}
            <AuthModal 
                isOpen={showAuth} 
                onClose={() => setShowAuth(false)} 
                onMockLogin={handleMockLogin}
            />
          </>
      );
  }

  return (
    <div className="min-h-screen bg-brand-bg dark:bg-brand-graphite font-sans transition-colors duration-300">
      {/* Toast Notification Container */}
      {toast && <Toast msg={toast.msg} type={toast.type} />}

      {/* --- HOME VIEW --- */}
      {(!analysisResult && !isAnalyzing) && (
        <div className="flex flex-col min-h-screen pb-20">
            {/* Header */}
            <div className="px-6 py-6 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Logo className="w-10 h-10" />
                    <div>
                        <h1 className="font-serif font-bold text-xl text-brand-graphite dark:text-white leading-none">
                            Vizuhalizando
                        </h1>
                    </div>
                </div>
                
                <div className="flex gap-3">
                    {/* INSTALL BUTTON */}
                    {deferredPrompt && (
                        <button 
                            onClick={handleInstallClick}
                            className="p-2 rounded-full bg-brand-gold/20 text-brand-gold hover:bg-brand-gold/30 animate-pulse transition-colors relative"
                            title="Instalar Aplicativo"
                        >
                            <Smartphone className="w-6 h-6" />
                            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-brand-bg dark:border-brand-graphite"></span>
                        </button>
                    )}

                    <button 
                        onClick={() => setShowProfileSettings(true)}
                        className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 relative text-brand-graphite dark:text-white"
                    >
                        <Sliders className="w-6 h-6" />
                    </button>
                    {user && (
                        <button 
                            onClick={handleLogout}
                            className="p-2 rounded-full hover:bg-red-500/10 text-red-500"
                            title="Sair"
                        >
                            <LogOut className="w-6 h-6" />
                        </button>
                    )}
                </div>
            </div>

            {/* Search Bar */}
            <div className="px-6 mb-6">
                <div className="relative">
                    <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                    <input 
                        type="text" 
                        placeholder="Buscar" 
                        className="w-full pl-12 pr-4 py-3 bg-white dark:bg-zinc-800 rounded-2xl shadow-sm border border-transparent focus:border-brand-gold outline-none text-brand-graphite dark:text-white placeholder-gray-400"
                    />
                </div>
            </div>

            {/* Categories */}
            <div className="mb-8">
                <div className="px-6 mb-3">
                    <h3 className="font-serif font-bold text-lg text-brand-graphite dark:text-white">Categorias</h3>
                </div>
                <div className="flex gap-4 overflow-x-auto px-6 pb-2 custom-scrollbar">
                    {CATEGORIES.map((cat, idx) => (
                        <button key={idx} className="flex flex-col items-center gap-2 min-w-[70px]">
                            <div className="w-14 h-14 rounded-2xl border border-gray-200 dark:border-zinc-700 flex items-center justify-center bg-white dark:bg-zinc-800 shadow-sm hover:border-brand-gold transition-colors">
                                <cat.icon className="w-6 h-6 text-brand-graphite dark:text-gray-300" />
                            </div>
                            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">{cat.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Daily Style Insight Widget (New Feature) */}
            {dailyTip && (
                <div className="px-6 mb-8 animate-fade-in">
                    <div className={`p-4 rounded-2xl border flex items-start gap-4 shadow-sm ${dailyTip.bg} border-transparent`}>
                        <div className={`p-3 rounded-full bg-white dark:bg-slate-800 shadow-sm ${dailyTip.color}`}>
                            <dailyTip.icon className="w-6 h-6" />
                        </div>
                        <div>
                            <h4 className={`font-bold text-sm mb-1 ${dailyTip.color}`}>{dailyTip.title}</h4>
                            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                                {dailyTip.text}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Hero / Profile Card */}
            <div className="px-6 mb-8">
                <div className="bg-white dark:bg-zinc-800 rounded-[2rem] p-6 shadow-xl relative overflow-hidden text-center border border-gray-100 dark:border-zinc-700">
                    {/* Decorative Elements */}
                    <div className="absolute top-0 left-0 w-full h-24 bg-brand-graphite dark:bg-black rounded-b-[50%] opacity-90 -mt-12"></div>
                    
                    <div className="relative z-10 mt-4">
                        <h2 className="font-bold text-lg text-brand-graphite dark:text-white mb-4">Seu Perfil Visual</h2>
                        
                        <div className="relative w-24 h-24 mx-auto mb-3">
                            <div className="w-full h-full rounded-full overflow-hidden border-4 border-white dark:border-zinc-700 shadow-lg bg-gray-200">
                                {user?.photoURL ? (
                                    <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-brand-bg dark:bg-zinc-900 text-brand-gold font-serif text-3xl">
                                        {user?.displayName ? user.displayName[0] : 'V'}
                                    </div>
                                )}
                            </div>
                            <div className="absolute bottom-0 right-0 bg-brand-gold p-1.5 rounded-full border-2 border-white dark:border-zinc-800">
                                <Check className="w-3 h-3 text-white" />
                            </div>
                        </div>

                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                            Paleta: <span className="text-brand-gold font-bold">{currentSkinTone}</span>
                        </p>

                        <button 
                            onClick={() => { setImages([]); setShowUploadOption(true); }}
                            className="w-full py-4 bg-brand-graphite dark:bg-white text-white dark:text-brand-graphite rounded-xl font-bold text-sm shadow-lg hover:opacity-90 transition-opacity"
                        >
                            Gerar novo look
                        </button>
                        
                        {analysisResult && (
                            <button 
                                onClick={handleClearData}
                                className="mt-2 text-xs text-red-400 hover:text-red-500 underline"
                            >
                                Limpar dados de análise
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* History Section */}
            <div className="px-6 mb-8">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-serif font-bold text-lg text-brand-graphite dark:text-white">Seu Histórico</h3>
                </div>
                {history.length > 0 ? (
                    <div className="grid grid-cols-2 gap-4">
                        {history.map((item) => (
                            <div 
                                key={item.id} 
                                onClick={() => handleLoadHistory(item)}
                                className="rounded-2xl overflow-hidden bg-white dark:bg-zinc-800 border border-slate-100 dark:border-zinc-700 shadow-sm hover:shadow-md transition-all cursor-pointer group"
                            >
                                <div className="h-32 bg-gray-200 dark:bg-zinc-700 relative overflow-hidden">
                                    <img src={item.foto_url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                    <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors"></div>
                                </div>
                                <div className="p-3">
                                    <p className="font-bold text-xs text-brand-graphite dark:text-white truncate">
                                        Análise {item.resultado_json.biotipo}
                                    </p>
                                    <div className="flex items-center gap-1 text-[10px] text-gray-500 mt-1">
                                        <Clock className="w-3 h-3" />
                                        {new Date(item.data_analise).toLocaleDateString('pt-BR')}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center p-8 bg-slate-50 dark:bg-zinc-800/50 rounded-2xl border border-dashed border-slate-200 dark:border-zinc-700">
                        <Clock className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                        <p className="text-sm text-slate-500 font-medium">Você ainda não tem looks salvos.</p>
                        <p className="text-xs text-slate-400">Faça sua primeira análise para começar.</p>
                    </div>
                )}
            </div>

            {/* Bottom Nav */}
            <div className="fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border-t border-gray-100 dark:border-zinc-800 py-4 px-8 flex justify-between items-center z-50 rounded-t-3xl shadow-[0_-5px_20px_rgba(0,0,0,0.05)]">
                <button 
                    onClick={() => setCurrentView('home')}
                    className={`flex flex-col items-center gap-1 ${currentView === 'home' ? 'text-brand-graphite dark:text-white' : 'text-gray-400'}`}
                >
                    <HomeIcon className={`w-6 h-6 ${currentView === 'home' && 'fill-current'}`} />
                </button>
                <button 
                    onClick={() => setShowVisagismGuide(true)}
                    className="flex flex-col items-center gap-1 text-gray-400 hover:text-brand-gold transition-colors"
                >
                    <Grid className="w-6 h-6" />
                </button>
                <button 
                    onClick={() => setShowAuth(true)}
                    className={`flex flex-col items-center gap-1 ${currentView === 'profile' ? 'text-brand-graphite dark:text-white' : 'text-gray-400'}`}
                >
                    <UserIcon className={`w-6 h-6 ${currentView === 'profile' && 'fill-current'}`} />
                </button>
            </div>
        </div>
      )}

      {/* --- ANALYSIS / RESULT VIEW --- */}
      {(analysisResult || isAnalyzing) && (
        <div className="container mx-auto px-4 py-8 max-w-5xl">
            {/* Header Actions */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 mb-8">
                <button 
                    onClick={() => { setCurrentView('home'); }}
                    className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors font-medium text-sm"
                >
                    <ArrowRight className="w-4 h-4 rotate-180" />
                    Voltar ao Início
                </button>
                
                <div className="flex flex-wrap gap-2">
                    <button 
                        onClick={() => setShowComparison(!showComparison)}
                        disabled={!analysisResult}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                            showComparison 
                            ? 'bg-brand-graphite text-white border-brand-graphite' 
                            : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                        }`}
                    >
                        <Layout className="w-4 h-4" />
                        {showComparison ? 'Ocultar Comparativo' : 'Modo Comparativo'}
                    </button>
                    
                    <button 
                        onClick={handleExportAnalysis}
                        disabled={isGeneratingDossier || !analysisResult}
                        className="flex items-center gap-2 px-4 py-2 bg-brand-gold text-white rounded-xl text-xs font-bold hover:bg-yellow-600 transition-colors shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isGeneratingDossier ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                        Baixar Dossier PDF
                    </button>
                </div>
            </div>

            {/* Analysis Loading State */}
            {isAnalyzing && (
                <div className="flex flex-col items-center justify-center min-h-[50vh] animate-fade-in space-y-6">
                <div className="relative">
                    <div className="w-24 h-24 border-4 border-brand-gold/30 border-t-brand-gold rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Sparkles className="w-8 h-8 text-brand-gold animate-pulse" />
                    </div>
                </div>
                <div className="text-center space-y-2">
                    <h3 className="text-xl font-serif font-bold text-brand-graphite dark:text-white">Analisando Perfil</h3>
                    <p className="text-slate-500 text-sm animate-pulse">Cruzando dados de rosto, cabelo e corpo...</p>
                </div>
                </div>
            )}

            {/* Results */}
            {analysisResult && !isAnalyzing && (
               <div className="animate-fade-in space-y-8">
                   <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                       {/* Left Column: Profile Card */}
                       <div className="lg:col-span-4 space-y-6">
                           <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl overflow-hidden border border-slate-100 dark:border-slate-800 sticky top-24">
                               <div className="relative h-96 group">
                                   {/* Display Primary Image */}
                                   <img src={primaryImage || ""} alt="User Primary" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                                   
                                   <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                                   
                                   <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                                       <div className="flex items-center gap-2 mb-2">
                                           <span className="px-2 py-1 bg-brand-gold rounded-md text-[10px] font-bold uppercase tracking-wider text-black">
                                               {analysisResult.genero}
                                           </span>
                                           <span className="px-2 py-1 bg-white/20 backdrop-blur-md rounded-md text-[10px] font-bold uppercase tracking-wider border border-white/10">
                                               {metrics.height}m • {metrics.weight}kg
                                           </span>
                                       </div>
                                       <h2 className="text-3xl font-bold font-serif mb-1">{analysisResult.formato_rosto_detalhado}</h2>
                                       <p className="text-slate-300 text-sm font-medium">{analysisResult.biotipo}</p>
                                   </div>

                                   <button 
                                       onClick={startEditingVisagism}
                                       className="absolute top-4 right-4 p-2 bg-black/40 hover:bg-black/60 backdrop-blur-md rounded-full text-white transition-colors opacity-0 group-hover:opacity-100"
                                   >
                                       <Edit3 className="w-4 h-4" />
                                   </button>
                               </div>
                               
                               {/* Color Palette Section */}
                               <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                                   <div className="flex items-center justify-between mb-4">
                                       <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                           <Palette className="w-4 h-4 text-brand-gold" />
                                           Cartela de Cores
                                       </h3>
                                       {/* Skin Tone Selector */}
                                       <div className="relative group/tone">
                                           <button className="text-[10px] font-bold px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-slate-600 dark:text-slate-300 flex items-center gap-1 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                                               {currentSkinTone} <ChevronDown className="w-3 h-3" />
                                           </button>
                                           <div className="absolute right-0 mt-1 w-32 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden hidden group-hover/tone:block z-20 animate-fade-in">
                                               {(['Quente', 'Frio', 'Neutro', 'Oliva'] as SkinTone[]).map((tone) => (
                                                   <button 
                                                       key={tone}
                                                       onClick={() => handleSkinToneChange(tone)}
                                                       className={`w-full text-left px-4 py-2 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-700 ${currentSkinTone === tone ? 'text-brand-gold bg-amber-50 dark:bg-amber-900/20' : 'text-slate-600 dark:text-slate-400'}`}
                                                   >
                                                       {tone}
                                                   </button>
                                               ))}
                                           </div>
                                       </div>
                                   </div>
                                   
                                   <div className="grid grid-cols-4 gap-3 mb-4">
                                       {analysisResult.paleta_cores.map((color, idx) => (
                                           <div key={idx} className="group relative cursor-pointer">
                                               <div 
                                                   className="w-full aspect-square rounded-full shadow-sm border border-black/5 transform transition-transform hover:scale-110"
                                                   style={{ backgroundColor: color.hex }}
                                               ></div>
                                               <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-black/80 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                                                   {color.nome}
                                               </span>
                                           </div>
                                       ))}
                                   </div>
                                   <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg">
                                       {analysisResult.analise_pele}
                                   </p>
                               </div>

                               {/* Visagism Details */}
                               <div className="p-6 space-y-4">
                                   <div>
                                       <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Cabelo & Grooming</h4>
                                       <p className="text-sm text-slate-700 dark:text-slate-300 font-medium mb-1">
                                           {analysisResult.visagismo.cabelo.estilo}
                                       </p>
                                       <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                                           {analysisResult.visagismo.cabelo.motivo}
                                       </p>
                                       
                                       {/* Hair Products and Techniques */}
                                       {(analysisResult.visagismo.cabelo.produtos || analysisResult.visagismo.cabelo.tecnicas) && (
                                           <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 gap-2">
                                               {analysisResult.visagismo.cabelo.produtos && (
                                                   <div className="bg-indigo-50 dark:bg-indigo-900/20 p-2 rounded-lg">
                                                       <span className="text-[10px] font-bold text-indigo-500 uppercase block mb-1">Produtos Sugeridos</span>
                                                       <p className="text-xs text-indigo-700 dark:text-indigo-200">{analysisResult.visagismo.cabelo.produtos.join(', ')}</p>
                                                   </div>
                                               )}
                                               {analysisResult.visagismo.cabelo.tecnicas && (
                                                   <div className="bg-emerald-50 dark:bg-emerald-900/20 p-2 rounded-lg">
                                                       <span className="text-[10px] font-bold text-emerald-500 uppercase block mb-1">Técnicas</span>
                                                       <p className="text-xs text-emerald-700 dark:text-emerald-200">{analysisResult.visagismo.cabelo.tecnicas.join(', ')}</p>
                                                   </div>
                                               )}
                                           </div>
                                       )}
                                   </div>
                                   
                                   <div>
                                       <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Ótica & Acessórios</h4>
                                       <p className="text-sm text-slate-700 dark:text-slate-300 font-medium mb-1">
                                           {analysisResult.otica.armacao} ({analysisResult.otica.material})
                                       </p>
                                       <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                                           {analysisResult.otica.motivo}
                                       </p>
                                   </div>
                               </div>
                           </div>
                       </div>

                       {/* Right Column: Outfits */}
                       <div className="lg:col-span-8">
                           {/* Comparison Board logic here (kept same as before) */}
                           {showComparison && (
                               <div className="mb-8 bg-slate-900 rounded-3xl p-6 text-white border border-slate-800 animate-fade-in relative overflow-hidden">
                                   {/* Content from previous iteration... */}
                                   <div className="absolute top-0 right-0 w-64 h-64 bg-brand-gold rounded-full blur-[100px] opacity-20 -mr-20 -mt-20 pointer-events-none"></div>
                                   <div className="flex justify-between items-center mb-6 relative z-10">
                                       <div>
                                           <h3 className="text-2xl font-bold mb-1 font-serif">Board Comparativo</h3>
                                           <p className="text-slate-400 text-sm">Selecione até 3 looks para comparar lado a lado.</p>
                                       </div>
                                       <button 
                                           onClick={handleExportComparison}
                                           disabled={selectedOutfits.length === 0 || isGeneratingComparison}
                                           className="px-6 py-2 bg-brand-gold hover:bg-yellow-600 rounded-xl font-bold text-sm shadow-lg transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-white"
                                       >
                                           {isGeneratingComparison ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                                           Exportar Board
                                       </button>
                                   </div>
                                   <div className="grid grid-cols-3 gap-4 min-h-[200px] relative z-10">
                                       {selectedOutfits.length === 0 ? (
                                           <div className="col-span-3 flex flex-col items-center justify-center border-2 border-dashed border-slate-700 rounded-2xl h-48 text-slate-500">
                                               <Layout className="w-8 h-8 mb-2 opacity-50" />
                                               <p className="text-sm font-medium">Clique no ícone <Plus className="w-3 h-3 inline" /> nos cards abaixo para adicionar</p>
                                           </div>
                                       ) : (
                                           selectedOutfits.map((outfit, idx) => (
                                               <div key={idx} className="relative group bg-slate-800 rounded-xl overflow-hidden border border-slate-700">
                                                   <button 
                                                       onClick={() => toggleOutfitSelection(outfit)}
                                                       className="absolute top-2 right-2 p-1.5 bg-black/60 text-white rounded-full hover:bg-red-500 transition-colors z-10"
                                                   >
                                                       <X className="w-3 h-3" />
                                                   </button>
                                                   <div className="h-32 bg-slate-700 relative">
                                                       {outfit.generatedImage ? (
                                                           <img src={outfit.generatedImage} className="w-full h-full object-cover" />
                                                       ) : (
                                                           <div className="w-full h-full flex items-center justify-center text-slate-500 text-xs">Sem Imagem</div>
                                                       )}
                                                   </div>
                                                   <div className="p-3">
                                                       <p className="font-bold text-xs truncate text-white">{outfit.titulo}</p>
                                                       <p className="text-[10px] text-slate-400 truncate">{outfit.ocasiao}</p>
                                                   </div>
                                               </div>
                                           ))
                                       )}
                                       {selectedOutfits.length > 0 && selectedOutfits.length < 3 && (
                                           Array.from({ length: 3 - selectedOutfits.length }).map((_, i) => (
                                               <div key={i} className="border-2 border-dashed border-slate-800 rounded-xl flex items-center justify-center text-slate-700">
                                                   <span className="text-xs font-bold">Vazio</span>
                                               </div>
                                           ))
                                       )}
                                   </div>
                               </div>
                           )}

                           {/* Filter Bar */}
                           <div className="flex flex-col gap-4 mb-6">
                               <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                                   <div className="flex items-center gap-2 overflow-x-auto max-w-full pb-2 sm:pb-0 custom-scrollbar">
                                       {getUniqueOccasions().map(occ => (
                                           <button
                                               key={occ}
                                               onClick={() => setActiveOutfitFilter(occ)}
                                               className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
                                                   activeOutfitFilter === occ 
                                                   ? 'bg-brand-graphite text-white shadow-md' 
                                                   : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                                               }`}
                                           >
                                               {occ}
                                           </button>
                                       ))}
                                   </div>
                                   
                                   <div className="flex items-center gap-2 self-end sm:self-auto">
                                       <button 
                                           onClick={() => setShowFilters(!showFilters)}
                                           className={`flex items-center gap-2 px-3 py-2 border rounded-lg text-xs font-bold transition-colors ${showFilters ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'}`}
                                       >
                                           <Filter className="w-3 h-3" />
                                           Filtros
                                       </button>

                                       <button 
                                           onClick={() => setOutfitSortOrder(prev => prev === 'relevance' ? 'favorites' : 'relevance')}
                                           className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                                       >
                                           <ArrowUpDown className="w-3 h-3" />
                                           {outfitSortOrder === 'relevance' ? 'Relevância' : 'Favoritos'}
                                       </button>
                                       
                                       <button 
                                           onClick={handleGenerateAllLooks}
                                           disabled={isGeneratingAll}
                                           className="flex items-center gap-2 px-4 py-2 bg-brand-gold hover:bg-yellow-600 text-white rounded-lg text-xs font-bold shadow-lg transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                                       >
                                           {isGeneratingAll ? <Loader2 className="w-3 h-3 animate-spin" /> : <Wand2 className="w-3 h-3" />}
                                           Provador Mágico (Todos)
                                       </button>
                                   </div>
                               </div>

                               {/* Expanded Filters */}
                               {showFilters && (
                                   <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 animate-fade-in grid grid-cols-2 md:grid-cols-4 gap-4">
                                       <div>
                                           <label className="text-[10px] font-bold text-slate-500 uppercase block mb-2">Estação/Clima</label>
                                           <select 
                                               className="w-full text-xs p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                               value={filterCriteria.season}
                                               onChange={(e) => setFilterCriteria({...filterCriteria, season: e.target.value})}
                                           >
                                               <option value="Todos">Todos</option>
                                               <option value="Primavera">Primavera</option>
                                               <option value="Verão">Verão</option>
                                               <option value="Outono">Outono</option>
                                               <option value="Inverno">Inverno</option>
                                           </select>
                                       </div>
                                       <div>
                                           <label className="text-[10px] font-bold text-slate-500 uppercase block mb-2">Salvos</label>
                                           <button 
                                               onClick={() => setOutfitSortOrder(prev => prev === 'relevance' ? 'favorites' : 'relevance')}
                                               className={`w-full text-xs p-2 rounded-lg border font-bold ${outfitSortOrder === 'favorites' ? 'bg-indigo-100 text-indigo-700 border-indigo-200' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700'}`}
                                           >
                                               {outfitSortOrder === 'favorites' ? 'Apenas Salvos' : 'Todos os Looks'}
                                           </button>
                                       </div>
                                   </div>
                               )}
                           </div>

                           {/* Outfit Cards */}
                           <div className="space-y-6">
                               {filteredAndSortedOutfits.map((outfit, index) => {
                                   const originalIndex = analysisResult.sugestoes_roupa.findIndex(o => o.titulo === outfit.titulo);
                                   return (
                                   <div key={originalIndex} className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 transition-all hover:shadow-lg hover:border-brand-gold/30 group">
                                       <div className="flex flex-col md:flex-row gap-8">
                                           {/* Visualization Area */}
                                           <div className="w-full md:w-5/12 flex-shrink-0">
                                               <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-inner">
                                                   {generatingOutfitIndex === originalIndex ? (
                                                       <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm z-10">
                                                           <Loader2 className="w-10 h-10 text-brand-gold animate-spin mb-4" />
                                                           <p className="text-xs font-bold text-slate-500 uppercase tracking-wider animate-pulse">Criando Visualização...</p>
                                                       </div>
                                                   ) : outfit.generatedImage ? (
                                                       <ComparisonView 
                                                           generatedSrc={outfit.generatedImage}
                                                           originalSrc={primaryImage || ""} // Using primary image for comparison
                                                           alt={outfit.titulo}
                                                           onSave={() => handleSaveOrShareImage(outfit.generatedImage!, `Vizu-TryOn-${index}`)}
                                                           onExpand={() => setViewingOutfitIndex(originalIndex)}
                                                           isSaving={false}
                                                       />
                                                   ) : (
                                                       <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
                                                           <div className="w-16 h-16 bg-brand-gold/10 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-500">
                                                               <Shirt className="w-8 h-8 text-brand-gold" />
                                                           </div>
                                                           <h4 className="font-bold text-slate-900 dark:text-white mb-2">Visualização Pendente</h4>
                                                           <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 max-w-[200px]">
                                                               Use a IA generativa para provar este look virtualmente na sua foto.
                                                           </p>
                                                           <button 
                                                               onClick={() => handleGenerateLook(originalIndex, outfit)}
                                                               className="px-6 py-3 bg-brand-graphite text-white rounded-xl text-xs font-bold hover:scale-105 transition-transform shadow-lg flex items-center gap-2"
                                                           >
                                                               <Wand2 className="w-3 h-3" />
                                                               Gerar Provador Virtual
                                                           </button>
                                                       </div>
                                                   )}
                                                   
                                                   <button 
                                                       onClick={() => toggleOutfitFavorite(originalIndex)}
                                                       className="absolute top-3 right-3 p-2 rounded-full bg-white/80 dark:bg-black/60 backdrop-blur-md shadow-sm hover:scale-110 transition-transform z-20"
                                                   >
                                                       <Heart 
                                                           className={`w-5 h-5 transition-colors ${outfit.isFavorite ? 'fill-red-500 text-red-500' : 'text-slate-400'}`} 
                                                       />
                                                   </button>
                                               </div>
                                               
                                               <div className="flex gap-2 mt-4">
                                                   <button 
                                                       onClick={() => toggleOutfitSelection(outfit)}
                                                       className={`flex-1 py-2.5 rounded-xl border font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                                                           selectedOutfits.some(o => o.titulo === outfit.titulo)
                                                           ? 'bg-brand-gold text-white border-brand-gold'
                                                           : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                                                       }`}
                                                   >
                                                       {selectedOutfits.some(o => o.titulo === outfit.titulo) ? <Check className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                                                       Comparar
                                                   </button>
                                                   <button 
                                                       onClick={() => handleShareLook(outfit)}
                                                       className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                                                   >
                                                       <Share2 className="w-4 h-4" />
                                                   </button>
                                               </div>
                                           </div>

                                           {/* Content Area */}
                                           <div className="w-full md:w-7/12 flex flex-col">
                                               <div className="flex items-start justify-between mb-2">
                                                   <div>
                                                       <span className="text-[10px] font-bold text-brand-gold uppercase tracking-wider mb-1 block">
                                                           {outfit.ocasiao}
                                                       </span>
                                                       <h3 className="text-xl font-serif font-bold text-slate-900 dark:text-white leading-tight">
                                                           {outfit.titulo}
                                                       </h3>
                                                   </div>
                                                   <button 
                                                       onClick={() => handleStartEdit(originalIndex, outfit)}
                                                       className="p-2 text-slate-400 hover:text-brand-gold hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-colors"
                                                   >
                                                       <Pencil className="w-4 h-4" />
                                                   </button>
                                               </div>

                                               <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-6 font-medium">
                                                   {outfit.detalhes}
                                               </p>

                                               {/* Components List */}
                                               <div className="space-y-3 mb-6 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                                                   <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                                                       <ShoppingBag className="w-3 h-3" />
                                                       Onde Encontrar
                                                   </h5>
                                                   <div className="space-y-2">
                                                       {(outfit.components || []).map((comp, i) => (
                                                           <div key={i} className="flex items-center justify-between text-sm group/item">
                                                               <div className="flex items-center gap-2 overflow-hidden">
                                                                   <div className="w-1.5 h-1.5 rounded-full bg-brand-gold flex-shrink-0"></div>
                                                                   <span className="font-medium text-slate-700 dark:text-slate-200 truncate">{comp.peca}</span>
                                                                   <span className="text-slate-400 text-xs">• {comp.loja}</span>
                                                               </div>
                                                               <a 
                                                                   href={comp.link} 
                                                                   target="_blank" 
                                                                   rel="noopener noreferrer"
                                                                   className="flex items-center gap-1 text-brand-gold font-bold text-xs hover:underline opacity-0 group-hover/item:opacity-100 transition-opacity"
                                                               >
                                                                   Ver Loja <ExternalLink className="w-3 h-3" />
                                                               </a>
                                                           </div>
                                                       ))}
                                                   </div>
                                               </div>

                                               {/* Stylist Note & Feedback */}
                                               <div className="mt-auto">
                                                   <div className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-100 dark:border-amber-800/30">
                                                       <Sparkles className="w-4 h-4 text-brand-gold mt-0.5 flex-shrink-0" />
                                                       <div>
                                                           <h5 className="text-xs font-bold text-amber-900 dark:text-amber-300 mb-1">Stylist Note</h5>
                                                           <p className="text-xs text-amber-800 dark:text-amber-200 leading-relaxed">
                                                               {outfit.motivo}
                                                           </p>
                                                       </div>
                                                   </div>
                                                   
                                                   <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                                       <div className="relative flex-1 mr-4">
                                                           <input 
                                                               type="text" 
                                                               placeholder="Adicione uma nota pessoal..." 
                                                               className="w-full text-xs bg-transparent border-none focus:ring-0 text-slate-600 dark:text-slate-400 placeholder:text-slate-300 px-0"
                                                               value={outfit.userNote || ''}
                                                               onChange={(e) => updateOutfitNote(originalIndex, e.target.value)}
                                                           />
                                                           <Edit3 className="w-3 h-3 text-slate-300 absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none" />
                                                       </div>
                                                       
                                                       {/* Feedback Actions */}
                                                       <div className="flex items-center gap-2">
                                                           <button 
                                                               onClick={() => handleOutfitFeedback(originalIndex, 'like')}
                                                               className={`p-2 rounded-full transition-colors ${outfit.feedback === 'like' ? 'bg-green-100 text-green-600 dark:bg-green-900/30' : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                                                           >
                                                               <ThumbsUp className="w-4 h-4" />
                                                           </button>
                                                           <button 
                                                               onClick={() => handleOutfitFeedback(originalIndex, 'dislike')}
                                                               className={`p-2 rounded-full transition-colors ${outfit.feedback === 'dislike' ? 'bg-red-100 text-red-600 dark:bg-red-900/30' : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                                                           >
                                                               <ThumbsDown className="w-4 h-4" />
                                                           </button>
                                                       </div>
                                                   </div>
                                               </div>
                                           </div>
                                       </div>
                                   </div>
                                   );
                               })}
                           </div>
                       </div>
                   </div>
               </div>
            )}
        </div>
      )}

      {/* ... (Rest of App.tsx remains the same: Analysis View, Modals, Camera) ... */}
      
      {/* Upload/Camera Selection Modal (triggered by "Gerar novo look") */}
      {showUploadOption && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => setShowUploadOption(false)}>
              <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl w-full max-w-sm shadow-2xl relative" onClick={e => e.stopPropagation()}>
                  <button onClick={() => setShowUploadOption(false)} className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"><X className="w-5 h-5"/></button>
                  <h3 className="text-xl font-serif font-bold text-center mb-2">Nova Análise</h3>
                  <p className="text-xs text-slate-500 text-center mb-6">Envie até 3 fotos (Frente, Perfil) com boa iluminação.</p>
                  
                  {/* Multi-Photo Preview Grid */}
                  <div className="grid grid-cols-3 gap-2 mb-6">
                      {[0, 1, 2].map((idx) => (
                          <div key={idx} className="relative aspect-square bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden border border-dashed border-slate-300 dark:border-slate-700">
                              {images[idx] ? (
                                  <>
                                    <img src={images[idx]} className="w-full h-full object-cover" />
                                    <button 
                                        onClick={() => removeImage(idx)} 
                                        className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                                    >
                                        <X className="w-3 h-3"/>
                                    </button>
                                  </>
                              ) : (
                                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                                      <ImageIcon className="w-6 h-6 mb-1 opacity-50" />
                                      <span className="text-[10px] font-bold text-slate-400">Foto {idx + 1}</span>
                                  </div>
                              )}
                          </div>
                      ))}
                  </div>

                  {/* User Metrics Input inside Modal */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Altura (m)</label>
                            <input 
                                type="number" 
                                step="0.01"
                                placeholder="Ex: 1.75"
                                value={metrics.height}
                                onChange={(e) => setMetrics({...metrics, height: e.target.value})}
                                className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm dark:text-white focus:ring-2 focus:ring-brand-gold focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Peso (kg)</label>
                            <input 
                                type="number" 
                                placeholder="Ex: 80"
                                value={metrics.weight}
                                onChange={(e) => setMetrics({...metrics, weight: e.target.value})}
                                className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm dark:text-white focus:ring-2 focus:ring-brand-gold focus:outline-none"
                            />
                        </div>
                  </div>

                  <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                          <button 
                            onClick={() => fileInputRef.current?.click()}
                            disabled={images.length >= 3}
                            className="w-full py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                              <Upload className="w-4 h-4" /> Galeria
                          </button>
                          <button 
                            onClick={() => startCamera('user')}
                            disabled={images.length >= 3}
                            className="w-full py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                              <Camera className="w-4 h-4" /> Câmera
                          </button>
                      </div>
                      
                      <button 
                        onClick={startAnalysis}
                        disabled={images.length === 0}
                        className="w-full py-4 bg-brand-graphite text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                      >
                          <Wand2 className="w-5 h-5" /> Analisar {images.length > 0 ? `(${images.length})` : ''}
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* Hidden File Input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        accept="image/*" 
        multiple
        onChange={handleImageUpload} 
      />

      {/* Full Screen Camera View */}
      {isCameraOpen && (
             <div className="fixed inset-0 z-[100] bg-black flex flex-col">
                 <div className="relative flex-1 overflow-hidden group bg-black">
                    <video 
                      ref={videoRef} 
                      autoPlay 
                      playsInline 
                      muted 
                      className={`w-full h-full object-cover transition-transform duration-300 ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
                    />
                    
                    {/* Visual Flash Effect */}
                    <div className={`absolute inset-0 bg-white pointer-events-none transition-opacity duration-200 ease-out ${isFlashing ? 'opacity-100' : 'opacity-0'}`} />

                    {/* Countdown Overlay */}
                    {countdown !== null && (
                        <div className="absolute inset-0 flex items-center justify-center z-50 bg-black/20 backdrop-blur-sm animate-in fade-in zoom-in duration-300">
                            <span className="text-9xl font-black text-white drop-shadow-2xl animate-pulse">
                                {countdown}
                            </span>
                        </div>
                    )}

                    {/* Grid Overlay */}
                    {showGrid && (
                        <div className="absolute inset-0 pointer-events-none z-10 grid grid-cols-3 grid-rows-3 opacity-30">
                            <div className="border-r border-b border-white"></div>
                            <div className="border-r border-b border-white"></div>
                            <div className="border-b border-white"></div>
                            <div className="border-r border-b border-white"></div>
                            <div className="border-r border-b border-white"></div>
                            <div className="border-b border-white"></div>
                            <div className="border-r border-white"></div>
                            <div className="border-r border-white"></div>
                            <div className=""></div>
                        </div>
                    )}

                    <div className="absolute top-4 left-4 z-50">
                        <button 
                            onClick={stopCamera} 
                            className="p-3 bg-black/40 backdrop-blur-md text-white rounded-full hover:bg-black/60 transition-all"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="absolute top-4 right-4 z-50 flex flex-col gap-2">
                        <button 
                            onClick={switchCamera} 
                            className="p-3 bg-black/40 backdrop-blur-md text-white rounded-full hover:bg-black/60 transition-all"
                        >
                            <SwitchCamera className="w-6 h-6" />
                        </button>
                        <button 
                            onClick={() => setShowGrid(!showGrid)} 
                            className={`p-3 backdrop-blur-md rounded-full transition-all ${showGrid ? 'bg-brand-gold text-white' : 'bg-black/40 text-white hover:bg-black/60'}`}
                        >
                            <Grid3X3 className="w-6 h-6" />
                        </button>
                        <button 
                            onClick={() => setTimerDuration(prev => prev === 0 ? 3 : prev === 3 ? 10 : 0)} 
                            className={`p-3 backdrop-blur-md rounded-full transition-all flex items-center justify-center font-bold ${timerDuration > 0 ? 'bg-brand-gold text-white' : 'bg-black/40 text-white hover:bg-black/60'}`}
                        >
                            {timerDuration > 0 ? <span className="text-xs">{timerDuration}s</span> : <Timer className="w-6 h-6" />}
                        </button>
                    </div>

                    {/* Zoom Slider */}
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 w-64 bg-black/40 backdrop-blur-md rounded-full p-2 flex items-center gap-3">
                        <ZoomIn className="w-4 h-4 text-white" />
                        <input 
                            type="range" 
                            min="1" 
                            max="3" 
                            step="0.1" 
                            value={zoomLevel} 
                            onChange={handleZoomChange}
                            className="w-full accent-brand-gold h-1 bg-white/20 rounded-lg appearance-none cursor-pointer"
                        />
                        <span className="text-xs font-bold text-white w-8 text-right">{zoomLevel.toFixed(1)}x</span>
                    </div>
                 </div>

                 {/* Camera Controls */}
                 <div className="h-auto bg-black flex flex-col items-center justify-end pb-8 pt-4">
                     {/* Gallery Preview Strip */}
                     {images.length > 0 && (
                         <div className="flex gap-2 mb-4 overflow-x-auto px-4 w-full justify-center">
                             {images.map((img, idx) => (
                                 <div key={idx} className="w-12 h-12 rounded-lg border-2 border-white overflow-hidden relative">
                                     <img src={img} className="w-full h-full object-cover" />
                                     <div className="absolute top-0 right-0 bg-brand-gold text-white text-[8px] font-bold px-1 rounded-bl">
                                         {idx + 1}
                                     </div>
                                 </div>
                             ))}
                         </div>
                     )}

                     <div className="flex items-center gap-12">
                        <div className="w-12 h-12 flex items-center justify-center">
                            {images.length > 0 && (
                                <button 
                                    onClick={finishCameraSession}
                                    className="text-white text-xs font-bold hover:text-brand-gold transition-colors flex flex-col items-center"
                                >
                                    <CheckCircle2 className="w-6 h-6 mb-1" />
                                    Concluir
                                </button>
                            )}
                        </div> 
                        
                        <button 
                            onClick={handleCaptureClick}
                            disabled={images.length >= 3}
                            className={`w-20 h-20 rounded-full border-4 flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)] ${images.length >= 3 ? 'border-slate-600 opacity-50 cursor-not-allowed' : 'bg-white border-slate-300'}`}
                        >
                            <div className={`w-16 h-16 rounded-full border-2 ${images.length >= 3 ? 'bg-slate-600 border-slate-800' : 'bg-white border-black'}`} />
                        </button>
                        
                        <div className="w-12 h-12 flex items-center justify-center">
                             <span className="text-white font-bold text-sm">{images.length}/3</span>
                        </div>
                     </div>
                 </div>
             </div>
      )}

      {/* Manual Visagism Edit Modal */}
      <Modal
        isOpen={isEditingVisagism}
        onClose={cancelEditingVisagism}
        title="Ajuste Manual de Visagismo"
        icon={ScanFace}
        sizeClass="max-w-2xl"
      >
         {tempVisagism && (
             <div className="space-y-6">
                 {/* ... existing edit form ... */}
                 <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-100 dark:border-amber-800/30 text-sm text-amber-800 dark:text-amber-200">
                     <Info className="w-4 h-4 inline mr-2" />
                     Edite os parâmetros detectados pela IA para forçar um estilo específico nas próximas gerações.
                 </div>
                 <div>
                     <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Estilo de Cabelo</label>
                     <input 
                        type="text" 
                        value={tempVisagism.cabelo.estilo}
                        onChange={(e) => setTempVisagism({...tempVisagism, cabelo: { ...tempVisagism.cabelo, estilo: e.target.value }})}
                        className="w-full p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                     />
                 </div>
                 <div>
                     <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Detalhes Cabelo</label>
                     <textarea 
                        value={tempVisagism.cabelo.detalhes}
                        onChange={(e) => setTempVisagism({...tempVisagism, cabelo: { ...tempVisagism.cabelo, detalhes: e.target.value }})}
                        className="w-full p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl h-24 resize-none"
                     />
                 </div>
                 <div className="border-t border-slate-100 dark:border-slate-800 pt-4">
                     <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Maquiagem / Barba</label>
                     <input 
                        type="text" 
                        value={tempVisagism.barba_ou_make.estilo}
                        onChange={(e) => setTempVisagism({...tempVisagism, barba_ou_make: { ...tempVisagism.barba_ou_make, estilo: e.target.value }})}
                        className="w-full p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                     />
                 </div>
                 <div className="flex gap-3 pt-4">
                     <button onClick={saveVisagismChanges} className="flex-1 py-3 bg-brand-gold text-white rounded-xl font-bold">Salvar Alterações</button>
                     <button onClick={cancelEditingVisagism} className="px-6 py-3 border border-slate-200 dark:border-slate-700 rounded-xl font-bold hover:bg-slate-50 dark:hover:bg-slate-800">Cancelar</button>
                 </div>
             </div>
         )}
      </Modal>

      {/* Manual Outfit Edit Modal */}
      <Modal
        isOpen={editingOutfitIndex !== null}
        onClose={handleCancelEdit}
        title="Editar Sugestão de Look"
        icon={Edit}
        sizeClass="max-w-3xl"
      >
          {tempOutfitData && (
              <div className="space-y-6">
                  {/* ... existing outfit edit form ... */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Título do Look</label>
                          <input 
                            type="text"
                            value={tempOutfitData.titulo}
                            onChange={(e) => setTempOutfitData({...tempOutfitData, titulo: e.target.value})}
                            className="w-full p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold"
                          />
                      </div>
                      <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Ocasião</label>
                          <input 
                            type="text"
                            value={tempOutfitData.ocasiao}
                            onChange={(e) => setTempOutfitData({...tempOutfitData, ocasiao: e.target.value})}
                            className="w-full p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                          />
                      </div>
                  </div>
                  <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Descrição Detalhada</label>
                      <textarea 
                        value={tempOutfitData.detalhes}
                        onChange={(e) => setTempOutfitData({...tempOutfitData, detalhes: e.target.value})}
                        className="w-full p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl h-24 resize-none"
                      />
                  </div>
                  <div>
                      <h4 className="font-bold text-slate-800 dark:text-white mb-3 flex items-center gap-2">
                          <ShoppingBag className="w-4 h-4" /> Componentes & Lojas
                      </h4>
                      <div className="space-y-3">
                          {tempOutfitData.components?.map((comp, idx) => (
                              <div key={idx} className="flex gap-2 items-center bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg">
                                  <span className="text-xs font-bold w-6 h-6 flex items-center justify-center bg-indigo-100 text-indigo-700 rounded-full">{idx + 1}</span>
                                  <input 
                                    type="text"
                                    value={comp.peca}
                                    onChange={(e) => handleComponentChange(idx, 'peca', e.target.value)}
                                    placeholder="Peça"
                                    className="flex-1 p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
                                  />
                                  <input 
                                    type="text"
                                    value={comp.loja}
                                    onChange={(e) => handleComponentChange(idx, 'loja', e.target.value)}
                                    placeholder="Loja"
                                    className="w-1/3 p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
                                  />
                              </div>
                          ))}
                      </div>
                  </div>
                  <div className="flex gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                      <button onClick={handleSaveEdit} className="flex-1 py-3 bg-brand-gold text-white rounded-xl font-bold shadow-lg">Salvar Alterações</button>
                      <button onClick={handleCancelEdit} className="px-6 py-3 border border-slate-200 dark:border-slate-700 rounded-xl font-bold hover:bg-slate-50 dark:hover:bg-slate-800">Cancelar</button>
                  </div>
              </div>
          )}
      </Modal>

      {/* Visagism Analysis Lab Modal (Correctly Placed) */}
      {showVisagismAnalysis && (
        <VisagismAnalysis onClose={() => setShowVisagismAnalysis(false)} />
      )}

      {/* Full Screen Image Viewer / Refinement Modal (Correctly Placed) */}
      {viewingOutfitIndex !== null && analysisResult && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex flex-col animate-fade-in">
             <div className="flex justify-between items-center p-4 text-white bg-black/50 backdrop-blur-md">
                 <div>
                    <h3 className="font-bold text-lg font-serif">{analysisResult.sugestoes_roupa[viewingOutfitIndex].titulo}</h3>
                    <p className="text-xs text-slate-400">Provador Virtual de Alta Definição</p>
                 </div>
                 <button onClick={() => setViewingOutfitIndex(null)} className="p-2 hover:bg-white/10 rounded-full">
                     <X className="w-6 h-6" />
                 </button>
             </div>
             
             <div className="flex-1 overflow-hidden relative flex items-center justify-center p-4">
                 <div className="w-full h-full max-w-4xl flex items-center justify-center">
                    <ComparisonView 
                        generatedSrc={analysisResult.sugestoes_roupa[viewingOutfitIndex].generatedImage!}
                        originalSrc={primaryImage || ""} // Use primary image
                        alt="Full Screen View"
                        onSave={() => {}}
                        onExpand={() => {}} // Already expanded
                        isSaving={false}
                    />
                 </div>
             </div>

             {/* Refinement Bar */}
             <div className="bg-slate-900 border-t border-slate-800 p-4">
                 <div className="max-w-3xl mx-auto">
                     <form onSubmit={handleRefinementSubmit} className="flex gap-2">
                         <div className="flex-1 relative">
                             <input 
                                type="text" 
                                value={refinementPrompt}
                                onChange={(e) => setRefinementPrompt(e.target.value)}
                                placeholder="Ex: Ajuste a gola da camisa, mude a cor para azul marinho..."
                                className="w-full bg-slate-800 text-white border border-slate-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand-gold focus:outline-none"
                             />
                         </div>
                         <button 
                            type="submit"
                            disabled={!refinementPrompt.trim() || isRefining}
                            className="bg-brand-gold hover:bg-yellow-600 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg disabled:opacity-50 flex items-center gap-2"
                         >
                            {isRefining ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
                            Refinar
                         </button>
                     </form>
                 </div>
             </div>
        </div>
      )}

    </div>
  );
}
