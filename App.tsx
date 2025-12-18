
import React, { useState, useEffect, useRef } from 'react';
import { 
  Camera, Upload, Share2, Sparkles, User as UserIcon, 
  Loader2, Download, LogOut, X, Menu, SwitchCamera,
  Check, Plus, Trash2, ArrowRight, Layout, Grid, SplitSquareHorizontal,
  BookOpen, Wand2, Eye, ScanFace, Timer, Heart, Edit3, Grid3X3, RefreshCw,
  Info, ShoppingBag, ExternalLink, Send, Image as ImageIcon, Filter, Save, XCircle,
  ArrowUpDown, Palette, Sliders, MapPin, Briefcase, Sun, Moon, Coffee, Dumbbell,
  Focus, Tag, Edit, Pencil, Scan, Zap, ChevronDown, Shirt, Bell, Search, Home as HomeIcon, FileText, Smartphone,
  ThumbsUp, ThumbsDown, Package, Layers, ZoomIn, Clock, Lightbulb, ChevronLeft, CheckCircle2, Cloud, CloudOff,
  AlertTriangle, Settings
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
import { supabase, debugConnection } from './services/supabase';
import type { AnalysisResult, OutfitSuggestion, UserRole, SkinTone, ColorPalette, UserMetrics, Visagismo, UserPreferences } from './types';

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
  const [targetEnvironment, setTargetEnvironment] = useState<string>('Estilo Geral');
  const [currentSkinTone, setCurrentSkinTone] = useState<SkinTone>('Neutro');
  const [isGeneratingDossier, setIsGeneratingDossier] = useState(false);
  const [selectedOutfits, setSelectedOutfits] = useState<OutfitSuggestion[]>([]);
  const [showComparison, setShowComparison] = useState(false);
  const [toast, setToast] = useState<{ msg: string, type: 'success'|'error'|'info' } | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showDebugModal, setShowDebugModal] = useState(false);

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
          } catch (e) {
              console.error("Init Error", e);
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
    setCurrentView('analysis');
    try {
      const result = await analyzeImageWithGemini(inputImages, metrics, targetEnvironment, userPreferences);
      setAnalysisResult(result);
      if (user) {
          const newAnalise = await db.saveAnalise(user.uid, inputImages[0], result);
          setHistory(prev => [newAnalise, ...prev]);
      }
      setToast({ msg: "Análise concluída com sucesso!", type: "success" });
    } catch (err: any) {
      setToast({ msg: err.message || "Erro na análise", type: "error" });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg text-brand-graphite font-sans overflow-x-hidden">
      {showLanding && !user ? (
        <LandingPage onEnterApp={() => setShowLanding(false)} onLoginClick={() => {}} />
      ) : (
        <div className="flex flex-col h-screen">
          {/* Header Minimalista */}
          <header className="bg-white border-b border-slate-100 px-6 py-4 flex justify-between items-center z-40">
            <div className="flex items-center gap-3">
              <Logo className="w-8 h-8" />
              <h1 className="font-serif text-xl font-bold tracking-tight">VizuHalizando</h1>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Status de Conexão Clicável para Debug */}
              <button 
                onClick={() => setShowDebugModal(true)}
                className={`flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border transition-all hover:scale-105 active:scale-95 ${!!supabase ? 'bg-green-50 border-green-200 text-green-600' : 'bg-amber-50 border-amber-200 text-amber-600 animate-pulse'}`}
              >
                {!!supabase ? <Cloud className="w-3 h-3" /> : <CloudOff className="w-3 h-3" />}
                {!!supabase ? 'Sincronizado' : 'Offline'}
              </button>
              
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 hover:bg-slate-50 rounded-full transition-colors"
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </header>

          {/* Área Principal */}
          <main className="flex-1 overflow-y-auto p-6 flex flex-col items-center justify-center">
             {!analysisResult && !isAnalyzing && (
               <div className="text-center space-y-6 max-w-md">
                  <div className="w-20 h-20 bg-brand-gold/10 rounded-full flex items-center justify-center mx-auto text-brand-gold">
                    <Camera className="w-10 h-10" />
                  </div>
                  <h2 className="text-2xl font-serif font-bold">Inicie sua jornada de estilo</h2>
                  <p className="text-slate-500">Capture uma imagem para análise imediata com nossa IA de Visagismo.</p>
                  <button onClick={() => runAnalysis(['dummy_image'])} className="w-full py-4 bg-brand-graphite text-white rounded-xl font-bold hover:scale-105 transition-transform shadow-lg">
                    Nova Análise
                  </button>
               </div>
             )}
             {isAnalyzing && (
               <div className="flex flex-col items-center gap-4">
                  <Loader2 className="w-12 h-12 text-brand-gold animate-spin" />
                  <p className="font-medium animate-pulse">Sincronizando dados corporais...</p>
               </div>
             )}
          </main>

          {/* Modal de Depuração de Conexão (Para resolver o problema do Vercel) */}
          <Modal 
            isOpen={showDebugModal} 
            onClose={() => setShowDebugModal(false)} 
            title="Diagnóstico de Sincronização" 
            icon={Settings}
          >
            <div className="space-y-6 py-4">
                <div className={`p-4 rounded-xl flex items-start gap-4 ${!!supabase ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                    {!!supabase ? <CheckCircle2 className="w-6 h-6 text-green-500 mt-1" /> : <AlertTriangle className="w-6 h-6 text-red-500 mt-1" />}
                    <div>
                        <h4 className={`font-bold ${!!supabase ? 'text-green-800' : 'text-red-800'}`}>
                            {!!supabase ? 'Conectado ao Supabase' : 'Erro de Configuração no Vercel'}
                        </h4>
                        <p className="text-sm opacity-80">
                            {!!supabase 
                              ? 'Seu app está salvando dados na nuvem com sucesso.' 
                              : 'O Vercel não está enviando as chaves do banco de dados para o navegador.'}
                        </p>
                    </div>
                </div>

                <div className="space-y-4">
                    <h5 className="font-bold text-sm uppercase text-slate-400">Status das Variáveis:</h5>
                    <div className="grid gap-2">
                        <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                            <span className="text-sm font-medium">SUPABASE_URL</span>
                            <span className={`text-xs font-bold ${debugConnection.hasUrl ? 'text-green-600' : 'text-red-500'}`}>
                                {debugConnection.hasUrl ? `Detectado (${debugConnection.urlPrefix})` : 'Faltando'}
                            </span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                            <span className="text-sm font-medium">SUPABASE_ANON_KEY</span>
                            <span className={`text-xs font-bold ${debugConnection.hasKey ? 'text-green-600' : 'text-red-500'}`}>
                                {debugConnection.hasKey ? 'Detectado' : 'Faltando'}
                            </span>
                        </div>
                    </div>
                </div>

                {!supabase && (
                    <div className="bg-brand-graphite text-white p-6 rounded-2xl space-y-4">
                        <h5 className="font-bold flex items-center gap-2"><Settings className="w-4 h-4 text-brand-gold" /> Como resolver:</h5>
                        <ol className="text-xs space-y-2 opacity-80 list-decimal pl-4">
                            <li>Vá ao painel do seu projeto no **Vercel**.</li>
                            <li>Em **Settings > Environment Variables**, adicione as chaves acima.</li>
                            <li>Tente usar o prefixo **VITE_** (ex: `VITE_SUPABASE_URL`) se o build falhar.</li>
                            <li>**IMPORTANTE:** Você deve fazer um novo **Deploy** para as mudanças surtirem efeito.</li>
                        </ol>
                    </div>
                )}
            </div>
          </Modal>

          {/* Toasts */}
          {toast && (
            <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-fade-in-up border ${
              toast.type === 'success' ? 'bg-white border-green-100 text-green-800' : 'bg-white border-red-100 text-red-800'
            }`}>
              {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <XCircle className="w-5 h-5 text-red-500" />}
              <span className="font-bold text-sm">{toast.msg}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
