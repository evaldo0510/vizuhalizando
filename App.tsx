
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

// ... (Mantenha as constantes SKIN_TONE_DATA, ENVIRONMENTS, etc. inalteradas)

export default function App() {
  const [user, setUser] = useState<{ displayName: string | null; email: string | null; photoURL: string | null; uid: string } | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [history, setHistory] = useState<Analise[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [showLanding, setShowLanding] = useState(true); 
  const [currentView, setCurrentView] = useState<'home' | 'analysis' | 'profile' | 'grid'>('home');
  const [metrics, setMetrics] = useState<UserMetrics>({ height: '', weight: '' });
  const [userPreferences, setUserPreferences] = useState<UserPreferences>({ favoriteStyles: [], favoriteColors: '', avoidItems: '' });
  const [targetEnvironment, setTargetEnvironment] = useState<string>('General Style');
  const [currentSkinTone, setCurrentSkinTone] = useState<SkinTone>('Neutro');
  const [isGeneratingDossier, setIsGeneratingDossier] = useState(false);
  const [selectedOutfits, setSelectedOutfits] = useState<OutfitSuggestion[]>([]);
  const [showComparison, setShowComparison] = useState(false);
  const [generatingOutfitIndex, setGeneratingOutfitIndex] = useState<number | null>(null);
  const [isGeneratingAll, setIsGeneratingAll] = useState(false);
  const [viewingOutfitIndex, setViewingOutfitIndex] = useState<number | null>(null);
  const [refinementPrompt, setRefinementPrompt] = useState("");
  const [isRefining, setIsRefining] = useState(false);
  const [activeOutfitFilter, setActiveOutfitFilter] = useState<string>('Todas');
  const [outfitSortOrder, setOutfitSortOrder] = useState<'relevance' | 'favorites'>('relevance');
  const [showFilters, setShowFilters] = useState(false);
  const [filterCriteria, setFilterCriteria] = useState({ season: 'Todos', color: 'Todos' });
  const [isEditingVisagism, setIsEditingVisagism] = useState(false);
  const [tempVisagism, setTempVisagism] = useState<Visagismo | null>(null);
  const [showVisagismGuide, setShowVisagismGuide] = useState(false);
  const [showVisagismAnalysis, setShowVisagismAnalysis] = useState(false);
  const [showProfileSettings, setShowProfileSettings] = useState(false);
  const [editingOutfitIndex, setEditingOutfitIndex] = useState<number | null>(null);
  const [tempOutfitData, setTempOutfitData] = useState<OutfitSuggestion | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [isFlashing, setIsFlashing] = useState(false);
  const [timerDuration, setTimerDuration] = useState<0 | 3 | 10>(0);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [showGrid, setShowGrid] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [showUploadOption, setShowUploadOption] = useState(false);
  const [toast, setToast] = useState<{ msg: string, type: 'success'|'error'|'info' } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  const primaryImage = images.length > 0 ? images[0] : null;

  useEffect(() => {
      const initApp = async () => {
          try {
              const savedUser = await db.getCurrentUser();
              if (savedUser) {
                  setUser({
                      uid: savedUser.id,
                      displayName: savedUser.nome,
                      email: savedUser.email,
                      photoURL: savedUser.foto_perfil || null
                  });
                  setShowLanding(false);
                  const userHistory = await db.getUserAnalyses(savedUser.id);
                  setHistory(userHistory);
                  if (userHistory[0]) {
                      setAnalysisResult(userHistory[0].resultado_json);
                      setImages([userHistory[0].foto_url]);
                  }
              }
              const savedPrefs = localStorage.getItem('vizu_prefs');
              if (savedPrefs) setUserPreferences(JSON.parse(savedPrefs));
          } catch (e) {
              console.error("Failed to load real session", e);
          }
      };
      initApp();
  }, []);

  const handleLogout = async () => {
      await db.logout();
      setUser(null);
      setHistory([]);
      setAnalysisResult(null);
      setImages([]);
      setShowLanding(true);
  };

  const handleMockLogin = (u: any) => {
      setUser(u);
      db.getUserAnalyses(u.uid).then(h => setHistory(h));
      setShowLanding(false);
  };

  const runAnalysis = async (inputImages: string[]) => {
    if (!inputImages || inputImages.length === 0) return;
    setIsAnalyzing(true);
    setAnalysisResult(null);
    setSelectedOutfits([]); 
    setActiveOutfitFilter('Todas');
    setCurrentView('analysis');
    try {
      const rawBase64Images = inputImages.map(img => img.includes(',') ? img.split(',')[1] : img);
      const result = await analyzeImageWithGemini(rawBase64Images, metrics, targetEnvironment, userPreferences);
      setAnalysisResult(result);
      if (result.tom_pele_detectado) setCurrentSkinTone(result.tom_pele_detectado);
      if (user) {
          const newAnalise = await db.saveAnalise(user.uid, inputImages[0], result);
          setHistory(prev => [newAnalise, ...prev]);
      }
      setToast({ msg: "Análise de estilo concluída!", type: "success" });
    } catch (err: any) {
      console.error(err);
      setToast({ msg: err.message || "Erro na análise", type: "error" });
      setCurrentView('home');
    } finally {
      setIsAnalyzing(false);
      setTimeout(() => setToast(null), 3000);
    }
  };

  // ... (Mantenha o restante das funções auxiliares de câmera, upload e exportação)
  // Certifique-se de que os métodos que usam user.uid agora tratam como string.

  return (
      // ... (Mantenha o JSX do App.tsx inalterado)
      <div /> // Apenas placeholder para o snippet
  );
}
