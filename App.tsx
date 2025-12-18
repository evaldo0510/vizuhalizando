
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
  AlertTriangle, Settings, Globe, Copy
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

  // Verificação de segurança da API KEY
  const isApiConfigured = !!process.env.API_KEY || (typeof import.meta !== 'undefined' && !!(import.meta as any).env?.VITE_API_KEY);

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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setToast({ msg: "Copiado para a área de transferência", type: 'success' });
  };

  const handleLogout = async () => {
      await db.logout();
      setUser(null);
      setHistory([]);
      setAnalysisResult(null);
      setImages([]);
      setShowLanding(true);
  };

  const runAnalysis = async (inputImages: string[]) => {
    if (!isApiConfigured) {
        setToast({ msg: "Erro: API do Gemini não configurada no Vercel.", type: "error" });
        setShowDebugModal(true);
        return;
    }
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
          <header className="bg-white border-b border-slate-100 px-6 py-4 flex justify-between items-center z-40">
            <div className="flex items-center gap-3">
              <Logo className="w-8 h-8" />
              <div className="flex flex-col">
                  <h1 className="font-serif text-xl font-bold tracking-tight leading-none">VizuHalizando</h1>
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">Atelier Digital</span>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setShowDebugModal(true)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border transition-all hover:scale-105 active:scale-95 ${isApiConfigured && !!supabase ? 'bg-green-50 border-green-200 text-green-600' : 'bg-red-50 border-red-200 text-red-600 animate-pulse'}`}
              >
                {isApiConfigured && !!supabase ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                {isApiConfigured && !!supabase ? 'Pronto' : 'Ajuste Necessário'}
              </button>
              
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 hover:bg-slate-50 rounded-full transition-colors"
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-6 flex flex-col items-center justify-center">
             {!analysisResult && !isAnalyzing && (
               <div className="text-center space-y-6 max-w-md">
                  <div className="w-20 h-20 bg-brand-gold/10 rounded-full flex items-center justify-center mx-auto text-brand-gold shadow-inner">
                    <Camera className="w-10 h-10" />
                  </div>
                  <h2 className="text-2xl font-serif font-bold text-brand-graphite">Seu atelier está aberto.</h2>
                  <p className="text-slate-500 text-sm leading-relaxed">
                      Se você está vendo esta tela em <b>vizuhalizando.com.br</b>, o sistema principal foi carregado com sucesso.
                  </p>
                  <button onClick={() => runAnalysis(['dummy_image'])} className="w-full py-4 bg-brand-graphite text-white rounded-xl font-bold hover:scale-105 transition-transform shadow-xl">
                    Iniciar Consultoria
                  </button>
               </div>
             )}
             {isAnalyzing && (
               <div className="flex flex-col items-center gap-4 text-center">
                  <div className="relative">
                      <Loader2 className="w-16 h-16 text-brand-gold animate-spin" />
                      <Sparkles className="w-6 h-6 text-brand-gold absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                  </div>
                  <p className="font-serif italic text-lg text-brand-graphite animate-pulse">Tecendo recomendações personalizadas...</p>
               </div>
             )}
          </main>

          <Modal 
            isOpen={showDebugModal} 
            onClose={() => setShowDebugModal(false)} 
            title="Painel de Controle do Atelier" 
            icon={Settings}
          >
            <div className="space-y-6 py-4">
                <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex gap-3">
                    <Info className="w-5 h-5 text-amber-600 shrink-0" />
                    <p className="text-xs text-amber-800 leading-relaxed">
                        Se o domínio <b>vizuhalizando.com.br</b> estiver com tela branca ou erro de login, verifique se você adicionou este endereço exato no painel do Supabase em <i>Authentication > URL Configuration</i>.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                    <div className={`p-4 rounded-xl border ${!!supabase ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
                        <div className="flex items-center gap-2 mb-2">
                             {!!supabase ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                             <h4 className="font-bold text-sm uppercase">Banco (Supabase)</h4>
                        </div>
                        <p className="text-[10px] opacity-80">{!!supabase ? 'Sincronização na Nuvem Ativa.' : 'Erro: Configure SUPABASE_URL e SUPABASE_ANON_KEY no Vercel.'}</p>
                    </div>

                    <div className={`p-4 rounded-xl border ${isApiConfigured ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
                        <div className="flex items-center gap-2 mb-2">
                             {isApiConfigured ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                             <h4 className="font-bold text-sm uppercase">Cérebro (Gemini)</h4>
                        </div>
                        <p className="text-[10px] opacity-80">{isApiConfigured ? 'IA Pronta para Análise.' : 'Erro: Configure API_KEY nas variáveis do Vercel.'}</p>
                    </div>
                </div>

                <div className="bg-slate-900 text-white p-6 rounded-2xl">
                    <div className="flex items-center justify-between mb-4">
                         <h5 className="font-bold text-sm flex items-center gap-2 text-brand-gold uppercase tracking-widest">
                            <Globe className="w-4 h-4" /> Domínio Ativo
                         </h5>
                         <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-white/60">Produção</span>
                    </div>
                    <div className="flex items-center justify-between bg-black/40 p-3 rounded-lg border border-white/10">
                        <code className="text-xs font-mono text-brand-gold">{debugConnection.currentOrigin}</code>
                        <button onClick={() => copyToClipboard(debugConnection.currentOrigin)} className="p-1.5 hover:bg-white/10 rounded-md transition-colors">
                            <Copy className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                <div className="space-y-4">
                    <h5 className="font-bold text-xs uppercase text-slate-400 px-1">Guia de Correção (Vercel):</h5>
                    <div className="space-y-2">
                        <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                            <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold shrink-0">1</div>
                            <p className="text-xs text-slate-600">Vá no painel do Vercel e confirme se as variáveis têm o prefixo <b>VITE_</b> (Ex: VITE_API_KEY).</p>
                        </div>
                        <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                            <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold shrink-0">2</div>
                            <p className="text-xs text-slate-600">Certifique-se de que a variável <b>API_KEY</b> do Gemini está com o valor correto.</p>
                        </div>
                        <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                            <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold shrink-0">3</div>
                            <p className="text-xs text-slate-600">Faça um <b>Redeploy</b> manual para aplicar as novas variáveis no domínio customizado.</p>
                        </div>
                    </div>
                </div>
            </div>
          </Modal>

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
