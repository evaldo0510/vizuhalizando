
import React, { useState, useEffect, useCallback } from 'react';
import { 
  Camera, Upload, Sparkles, User as UserIcon, 
  Loader2, LogOut, X, Menu, Trash2, Zap, 
  History, Calendar, LayoutGrid, Plus, Info, CheckCircle2, XCircle,
  FileText, Home as HomeIcon, Smartphone, Settings, Palette, CreditCard,
  ShieldCheck, BarChart3
} from 'lucide-react';
import { AuthModal } from './components/AuthModal';
import { VisagismAnalysis } from './components/VisagismAnalysis';
import { AdminDashboard } from './components/AdminDashboard';
import { Logo } from './components/Logo';
import { analyzeImageWithGemini } from './services/geminiService';
import { LandingPage } from './components/LandingPage'; 
import { db, Analise, Usuario } from './services/database';
import { supabase } from './services/supabase';
import { generateDossierPDF } from './services/pdfService';
import type { AnalysisResult, UserMetrics, UserPreferences } from './types';

const ADMIN_EMAILS = ['evaldo0510@gmail.com', 'aljariristartups@gmail.com'];

export default function App() {
  const [user, setUser] = useState<{ displayName: string | null; email: string | null; photoURL: string | null; uid: string; role: string; isPremium?: boolean } | null>(null);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [history, setHistory] = useState<Analise[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [currentAnaliseId, setCurrentAnaliseId] = useState<number | null>(null);
  const [showLanding, setShowLanding] = useState(true); 
  const [isPremium, setIsPremium] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [metrics, setMetrics] = useState<UserMetrics>({ height: '', weight: '' });
  const [userPreferences, setUserPreferences] = useState<UserPreferences>({ favoriteStyles: [], favoriteColors: '', avoidItems: '' });
  const [targetEnvironment, setTargetEnvironment] = useState<string>('Estilo Geral');
  const [toast, setToast] = useState<{ msg: string, type: 'success'|'error'|'info' } | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showHistoryView, setShowHistoryView] = useState(false);
  const [showAuth, setShowAuth] = useState(false);

  const loadHistory = useCallback(async (uid: string) => {
    const userHistory = await db.getUserAnalyses(uid);
    setHistory(userHistory);
  }, []);

  useEffect(() => {
    const fastSession = localStorage.getItem('vizu_session_user');
    if (fastSession) {
      try {
        const cachedUser = JSON.parse(fastSession);
        setUser({
          uid: cachedUser.id,
          displayName: cachedUser.nome,
          email: cachedUser.email,
          photoURL: cachedUser.foto_perfil || null,
          role: cachedUser.nivel_acesso
        });
        setShowLanding(false);
        loadHistory(cachedUser.id);
        
        // ADMINS SÃO SEMPRE PREMIUM
        const isAdmin = ADMIN_EMAILS.includes(cachedUser.email?.toLowerCase());
        setIsPremium(isAdmin || localStorage.getItem(`premium_${cachedUser.id}`) === 'true');
      } catch (e) {
        console.error("Erro na sessão rápida");
      }
    }

    if (supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) handleUserSync(session.user);
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (session?.user) {
          handleUserSync(session.user);
        } else if (event === 'SIGNED_OUT') {
          handleLogoutLocal();
        }
      });
      return () => subscription.unsubscribe();
    }
  }, [loadHistory]);

  const handleUserSync = async (supabaseUser: any) => {
    const syncedUser = await db.syncGoogleUser(supabaseUser);
    setUser({
      uid: syncedUser.id,
      displayName: syncedUser.nome,
      email: syncedUser.email,
      photoURL: syncedUser.foto_perfil || null,
      role: syncedUser.nivel_acesso
    });
    setShowLanding(false);
    loadHistory(syncedUser.id);
    const isAdmin = ADMIN_EMAILS.includes(syncedUser.email?.toLowerCase());
    setIsPremium(isAdmin || localStorage.getItem(`premium_${syncedUser.id}`) === 'true');
  };

  const handleLogoutLocal = () => {
    db.logout();
    setUser(null);
    setShowLanding(true);
    setIsMenuOpen(false);
    setShowAdmin(false);
    setShowHistoryView(false);
  };

  const handleLogout = async () => {
    if (supabase) await supabase.auth.signOut();
    handleLogoutLocal();
  };

  const handleDownloadPDF = async () => {
    if (!analysisResult) return;
    setToast({ msg: "Gerando PDF...", type: 'info' });
    try {
      await generateDossierPDF(analysisResult, user?.displayName || "Cliente VizuHalizando", selectedImages[0]);
      setToast({ msg: "Dossiê pronto!", type: 'success' });
    } catch (e) {
      setToast({ msg: "Erro ao gerar PDF.", type: 'error' });
    }
  };

  const runAnalysis = async () => {
    if (selectedImages.length === 0) {
      setToast({ msg: "Selecione uma foto.", type: "error" });
      return;
    }
    setIsAnalyzing(true);
    try {
      const cleanImages = selectedImages.map(img => img.split(',')[1]);
      const result = await analyzeImageWithGemini(cleanImages, metrics, targetEnvironment, userPreferences, user?.uid);
      setAnalysisResult(result);
      if (user) {
        const newAnalise = await db.saveAnalise(user.uid, selectedImages[0], result);
        setCurrentAnaliseId(newAnalise.id);
        setHistory(prev => [newAnalise, ...prev]);
      }
    } catch (err: any) {
      setToast({ msg: "Falha na análise técnica.", type: "error" });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg text-brand-graphite font-sans overflow-x-hidden">
      {showLanding && !user ? (
        <LandingPage 
          onEnterApp={() => setShowLanding(false)} 
          onLoginClick={() => setShowAuth(true)} 
        />
      ) : (
        <div className="flex flex-col h-screen">
          <header className="bg-white border-b border-slate-100 px-6 py-4 flex justify-between items-center z-40 shrink-0">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => { setShowHistoryView(false); setShowAdmin(false); setAnalysisResult(null); }}>
              <Logo className="w-8 h-8" />
              <h1 className="font-serif text-xl font-bold tracking-tight">VizuHalizando</h1>
            </div>
            
            <div className="flex items-center gap-3">
              {!isPremium && !showAdmin && (
                <button onClick={() => { localStorage.setItem(`premium_${user?.uid}`, 'true'); setIsPremium(true); }} className="hidden md:flex items-center gap-2 px-4 py-2 bg-brand-gold text-white rounded-full text-xs font-bold animate-pulse">
                  <CreditCard size={14} /> UPGRADE PREMIUM
                </button>
              )}
              {user?.role === 'admin' && (
                <button onClick={() => { setShowAdmin(!showAdmin); setShowHistoryView(false); }} className={`p-2.5 rounded-full transition-all ${showAdmin ? 'bg-indigo-600 text-white shadow-lg' : 'bg-indigo-50 text-indigo-600'}`}>
                  <ShieldCheck size={20} />
                </button>
              )}
              <button onClick={() => { setShowHistoryView(!showHistoryView); setShowAdmin(false); }} className={`p-2.5 rounded-full transition-all ${showHistoryView ? 'bg-brand-gold text-white' : 'bg-slate-50 text-slate-600'}`}>
                <History className="w-5 h-5" />
              </button>
              <button onClick={() => setIsMenuOpen(true)} className="p-2.5 bg-brand-graphite text-white rounded-full"><Menu size={20} /></button>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-4 md:p-8 flex flex-col items-center bg-slate-50/50">
             {showAdmin ? (
               <AdminDashboard />
             ) : showHistoryView ? (
               <div className="w-full max-w-5xl animate-fade-in">
                  <h2 className="text-3xl font-serif font-bold mb-8">Seu Histórico</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {history.map((item) => (
                      <div key={item.id} className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100 cursor-pointer" onClick={() => { setAnalysisResult(item.resultado_json); setCurrentAnaliseId(item.id); setSelectedImages([item.foto_url]); setShowHistoryView(false); }}>
                        <img src={item.foto_url} className="w-full aspect-[3/4] object-cover" />
                        <div className="p-4"><p className="font-bold text-sm">{item.resultado_json.formato_rosto_detalhado}</p></div>
                      </div>
                    ))}
                  </div>
               </div>
             ) : (
               <>
                 {!analysisResult && !isAnalyzing && (
                   <div className="w-full max-w-2xl animate-fade-in py-8">
                      <div className="text-center mb-10">
                        <div className="w-20 h-20 bg-brand-gold/10 rounded-3xl flex items-center justify-center mx-auto text-brand-gold mb-6"><Sparkles size={40}/></div>
                        <h2 className="text-4xl font-serif font-bold text-brand-graphite mb-3">O Atelier IA.</h2>
                        <p className="text-slate-500 text-sm">A ciência do visagismo a um clique de distância.</p>
                      </div>

                      <div className="bg-white p-6 rounded-3xl shadow-xl border border-slate-100 mb-8 space-y-4">
                        <div className="grid grid-cols-3 gap-4">
                          {selectedImages.map((img, idx) => (
                            <div key={idx} className="aspect-[3/4] rounded-2xl overflow-hidden relative border-2 border-slate-100">
                              <img src={img} className="w-full h-full object-cover" />
                              <button onClick={() => setSelectedImages(prev => prev.filter((_, i) => i !== idx))} className="absolute top-2 right-2 p-1.5 bg-white/90 text-red-500 rounded-full"><Trash2 size={14}/></button>
                            </div>
                          ))}
                          {selectedImages.length < 3 && (
                            <label className="aspect-[3/4] rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center cursor-pointer hover:bg-slate-50">
                              <Plus className="text-slate-300" size={32} />
                              <input type="file" className="hidden" multiple onChange={(e) => {
                                const files = e.target.files;
                                if (files) {
                                  Array.from(files).forEach(f => {
                                    const r = new FileReader();
                                    r.onload = () => setSelectedImages(p => [...p, r.result as string]);
                                    r.readAsDataURL(f);
                                  });
                                }
                              }} />
                            </label>
                          )}
                        </div>
                        
                        <div className="pt-4 border-t border-slate-50 grid grid-cols-2 gap-4">
                           <div className="space-y-1">
                              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sua Altura</label>
                              <input 
                                type="text" 
                                placeholder="Ex: 1.75" 
                                value={metrics.height} 
                                onChange={e => setMetrics({...metrics, height: e.target.value})}
                                className="w-full p-3 bg-slate-50 rounded-xl text-sm border-none focus:ring-2 focus:ring-brand-gold" 
                              />
                           </div>
                           <div className="space-y-1">
                              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Estilo Desejado</label>
                              <select 
                                value={userPreferences.favoriteStyles[0] || ''} 
                                onChange={e => setUserPreferences({...userPreferences, favoriteStyles: [e.target.value]})}
                                className="w-full p-3 bg-slate-50 rounded-xl text-sm border-none focus:ring-2 focus:ring-brand-gold appearance-none"
                              >
                                <option value="">Automático</option>
                                <option value="Minimalista">Minimalista</option>
                                <option value="Boho">Boho</option>
                                <option value="Clássico">Clássico</option>
                                <option value="Streetwear">Streetwear</option>
                              </select>
                           </div>
                        </div>
                      </div>

                      <button disabled={selectedImages.length === 0} onClick={runAnalysis} className="w-full py-5 bg-brand-graphite text-white rounded-2xl font-bold flex items-center justify-center gap-3 text-lg shadow-2xl active:scale-95 transition-all">
                        <Zap className="w-5 h-5 text-brand-gold fill-brand-gold" /> Gerar Consultoria IA
                      </button>
                   </div>
                 )}

                 {isAnalyzing && (
                   <div className="flex-1 flex flex-col items-center justify-center gap-6">
                      <Loader2 className="w-16 h-16 text-brand-gold animate-spin" />
                      <p className="font-serif italic text-2xl animate-pulse">Tecendo seu Estilo...</p>
                      <span className="text-xs text-slate-400 uppercase tracking-widest font-bold">Processando biometria facial</span>
                   </div>
                 )}
                 
                 {analysisResult && (
                   <VisagismAnalysis 
                     result={analysisResult} 
                     isPremium={isPremium} 
                     userImage={selectedImages[0]}
                     userName={user?.displayName || ""}
                     onUpgrade={() => { localStorage.setItem(`premium_${user?.uid}`, 'true'); setIsPremium(true); }} 
                     onClose={() => { setAnalysisResult(null); setCurrentAnaliseId(null); }}
                     onFeedback={handleFeedback}
                     onDownloadPDF={handleDownloadPDF}
                   />
                 )}
               </>
             )}
          </main>

          {isMenuOpen && (
            <div className="fixed inset-0 z-50 flex justify-end">
              <div className="absolute inset-0 bg-black/40" onClick={() => setIsMenuOpen(false)} />
              <div className="relative w-80 h-full bg-white p-8 animate-slide-in-right shadow-2xl flex flex-col">
                <button onClick={() => setIsMenuOpen(false)} className="absolute top-6 right-6 text-slate-300"><X/></button>
                <div className="mb-10 flex items-center gap-4 border-b border-slate-50 pb-8">
                  <div className="w-16 h-16 bg-brand-gold/10 rounded-2xl flex items-center justify-center overflow-hidden">
                    {user?.photoURL ? <img src={user.photoURL} /> : <span className="font-bold text-2xl text-brand-gold">{user?.displayName?.[0]}</span>}
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 leading-tight">{user?.displayName}</p>
                    <p className="text-[9px] text-brand-gold font-bold uppercase tracking-widest mt-1">{isPremium ? 'PREMIUM' : 'FREE'}</p>
                  </div>
                </div>
                <nav className="space-y-2 flex-1">
                  <button onClick={() => { setShowAdmin(false); setShowHistoryView(true); setIsMenuOpen(false); }} className="w-full text-left py-4 px-5 rounded-2xl font-bold text-sm text-slate-600 hover:bg-slate-50 flex items-center gap-3"><LayoutGrid size={18}/> Meu Histórico</button>
                  {user?.role === 'admin' && (
                    <button onClick={() => { setShowAdmin(true); setShowHistoryView(false); setIsMenuOpen(false); }} className="w-full text-left py-4 px-5 rounded-2xl font-bold text-sm text-indigo-600 bg-indigo-50 flex items-center gap-3"><BarChart3 size={18}/> Gestão do Atelier</button>
                  )}
                </nav>
                <div className="pt-8 border-t border-slate-50">
                  <button onClick={handleLogout} className="w-full py-4 bg-red-50 text-red-500 rounded-2xl font-bold text-sm flex items-center justify-center gap-3"><LogOut size={18}/> Sair</button>
                </div>
              </div>
            </div>
          )}

          {showAuth && <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} onMockLogin={() => {}} />}
          {toast && (
            <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 px-6 py-4 bg-white shadow-2xl rounded-2xl border border-slate-100 flex items-center gap-3 animate-fade-in-up">
              {toast.type === 'success' ? <CheckCircle2 className="text-green-500"/> : <Loader2 className="text-brand-gold animate-spin"/>}
              <span className="font-bold text-sm text-slate-700">{toast.msg}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
