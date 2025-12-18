
import React, { useState, useEffect, useCallback } from 'react';
import { 
  Camera, Upload, Sparkles, User as UserIcon, 
  Loader2, LogOut, X, Menu, Trash2, Zap, 
  History, Calendar, LayoutGrid, Plus, Info, CheckCircle2, XCircle,
  FileText, Home as HomeIcon, Smartphone, Settings, Palette, CreditCard,
  ShieldCheck, BarChart3, ArrowUpRight, ChevronRight
} from 'lucide-react';
import { AuthModal } from './components/AuthModal';
import { VisagismAnalysis } from './components/VisagismAnalysis';
import { AdminDashboard } from './components/AdminDashboard';
import { Logo } from './components/Logo';
import { CameraCapture } from './components/CameraCapture';
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
  const [showCamera, setShowCamera] = useState(false);
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

  const checkPremiumStatus = (email: string | null, uid: string) => {
    if (!email) return false;
    const isAdmin = ADMIN_EMAILS.includes(email.toLowerCase());
    const hasPaid = localStorage.getItem(`premium_${uid}`) === 'true';
    return isAdmin || hasPaid;
  };

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
        setIsPremium(checkPremiumStatus(cachedUser.email, cachedUser.id));
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
    setIsPremium(checkPremiumStatus(syncedUser.email, syncedUser.id));
  };

  const handleLogoutLocal = () => {
    db.logout();
    setUser(null);
    setShowLanding(true);
    setIsMenuOpen(false);
    setShowAdmin(false);
    setShowHistoryView(false);
    setIsPremium(false);
  };

  const handleLogout = async () => {
    if (supabase) await supabase.auth.signOut();
    handleLogoutLocal();
  };

  const handleDownloadPDF = async () => {
    if (!analysisResult) return;
    setToast({ msg: "Gerando Dossiê Premium...", type: 'info' });
    try {
      await generateDossierPDF(analysisResult, user?.displayName || "Cliente VizuHalizando", selectedImages[0]);
      setToast({ msg: "PDF salvo com sucesso!", type: 'success' });
      setTimeout(() => setToast(null), 3000);
    } catch (error: any) {
      setToast({ msg: "Erro ao gerar PDF.", type: 'error' });
      setTimeout(() => setToast(null), 3000);
    }
  };

  const handleFeedback = async (outfitIdx: number, feedback: 'like' | 'dislike' | null) => {
    if (currentAnaliseId) {
      await db.updateAnaliseFeedback(currentAnaliseId, outfitIdx, feedback);
      setHistory(prev => prev.map(item => 
        item.id === currentAnaliseId 
          ? { 
              ...item, 
              resultado_json: { 
                ...item.resultado_json, 
                sugestoes_roupa: item.resultado_json.sugestoes_roupa.map((s, i) => 
                  i === outfitIdx ? { ...s, feedback } : s
                ) 
              } 
            } 
          : item
      ));
    }
  };

  const runAnalysis = async () => {
    if (selectedImages.length === 0) {
      setToast({ msg: "Capture uma foto para análise.", type: "error" });
      setTimeout(() => setToast(null), 3000);
      return;
    }
    setIsAnalyzing(true);
    setAnalysisResult(null);
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
      setToast({ msg: "Erro na análise biométrica.", type: "error" });
      setTimeout(() => setToast(null), 3000);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleManualUpgrade = () => {
    if (user) {
      localStorage.setItem(`premium_${user.uid}`, 'true');
      setIsPremium(true);
      setToast({ msg: "Acesso Premium Ativado!", type: 'success' });
      setTimeout(() => setToast(null), 3000);
    } else {
      setShowAuth(true);
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
            <div className="flex items-center gap-4 cursor-pointer group" onClick={() => { setShowHistoryView(false); setShowAdmin(false); setAnalysisResult(null); }}>
              <Logo className="w-10 h-10" />
              <div className="flex flex-col">
                <h1 className="font-serif text-xl font-bold tracking-tight leading-none">
                  <span className="text-brand-graphite">Vizu</span>
                  <span className="text-brand-gold">Halizando</span>
                </h1>
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">Atelier Digital Pro</span>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {!isPremium && (
                <button onClick={handleManualUpgrade} className="hidden md:flex items-center gap-2 px-4 py-2 bg-brand-gold text-white rounded-full text-[10px] font-bold animate-pulse hover:bg-brand-goldHover transition-all shadow-lg shadow-brand-gold/20">
                  <CreditCard size={14} /> UPGRADE PREMIUM
                </button>
              )}
              {user?.role === 'admin' && (
                <button onClick={() => { setShowAdmin(!showAdmin); setShowHistoryView(false); }} className={`p-2.5 rounded-full transition-all ${showAdmin ? 'bg-indigo-600 text-white shadow-lg' : 'bg-indigo-50 text-indigo-600'}`}>
                  <ShieldCheck size={20} />
                </button>
              )}
              <button onClick={() => { setShowHistoryView(!showHistoryView); setShowAdmin(false); setAnalysisResult(null); }} className={`p-2.5 rounded-full transition-all ${showHistoryView ? 'bg-brand-gold text-white shadow-md' : 'bg-slate-50 text-slate-400 hover:text-brand-graphite'}`}>
                <History className="w-5 h-5" />
              </button>
              <button onClick={() => setIsMenuOpen(true)} className="p-2.5 bg-brand-graphite text-white rounded-full shadow-lg hover:scale-110 transition-transform"><Menu size={20} /></button>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-4 md:p-8 flex flex-col items-center bg-slate-50/50">
             {showAdmin ? (
               <AdminDashboard />
             ) : showHistoryView ? (
               <div className="w-full max-w-5xl animate-fade-in">
                  <div className="flex justify-between items-center mb-10">
                    <h2 className="text-3xl font-serif font-bold text-brand-graphite">Meu Histórico <span className="text-brand-gold italic">Halizando</span></h2>
                    <button onClick={() => setShowHistoryView(false)} className="px-6 py-2 bg-brand-graphite text-white rounded-full text-[10px] font-bold uppercase tracking-widest shadow-xl">Nova Análise</button>
                  </div>
                  
                  {history.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 pb-20">
                      {history.map((item) => (
                        <div key={item.id} className="bg-white rounded-[32px] overflow-hidden shadow-sm border border-slate-100 cursor-pointer hover:shadow-2xl hover:-translate-y-2 transition-all group" onClick={() => { setAnalysisResult(item.resultado_json); setCurrentAnaliseId(item.id); setSelectedImages([item.foto_url]); setShowHistoryView(false); }}>
                          <div className="relative aspect-[3/4] overflow-hidden">
                            <img src={item.foto_url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                            <div className="absolute inset-0 bg-gradient-to-t from-brand-graphite/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-8">
                               <div className="flex items-center gap-2 text-brand-gold text-[10px] font-bold uppercase tracking-[0.2em] mb-2">
                                  <Sparkles size={12}/> {item.resultado_json?.biotipo || "Análise"}
                               </div>
                               <span className="text-white font-serif text-2xl font-bold leading-tight">Ver Dossiê <ArrowUpRight size={20} className="inline ml-2" /></span>
                            </div>
                          </div>
                          <div className="p-6 flex justify-between items-center">
                            <div>
                              <p className="font-bold text-brand-graphite text-lg">{item.resultado_json?.formato_rosto_detalhado || "Análise"}</p>
                              <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-widest flex items-center gap-2">
                                <Calendar size={12}/> {new Date(item.data_analise).toLocaleDateString('pt-BR')}
                              </p>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-brand-gold group-hover:text-white transition-colors shadow-inner">
                               <ChevronRight size={20}/>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-32 bg-white rounded-[40px] border border-dashed border-slate-200">
                      <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-200 shadow-inner"><History size={48} /></div>
                      <h3 className="text-xl font-serif font-bold text-brand-graphite mb-2">Sem registros prévios</h3>
                      <p className="text-slate-400 font-medium text-sm max-w-xs mx-auto">Suas consultorias de luxo aparecerão aqui para consultas futuras.</p>
                      <button onClick={() => setShowHistoryView(false)} className="mt-8 px-10 py-4 bg-brand-gold text-white rounded-full text-xs font-bold uppercase tracking-widest hover:bg-brand-goldHover transition-all shadow-xl shadow-brand-gold/20">Iniciar Agora</button>
                    </div>
                  )}
               </div>
             ) : (
               <>
                 {!analysisResult && !isAnalyzing && (
                   <div className="w-full max-w-2xl animate-fade-in py-8">
                      <div className="text-center mb-10">
                        <div className="w-20 h-20 bg-brand-gold/10 rounded-3xl flex items-center justify-center mx-auto text-brand-gold mb-6 shadow-xl shadow-brand-gold/10 border border-brand-gold/20"><Sparkles size={40}/></div>
                        <h2 className="text-4xl font-serif font-bold text-brand-graphite mb-3 leading-tight">O Atelier <span className="italic text-brand-gold">Halizando</span></h2>
                        <p className="text-slate-500 text-sm max-w-sm mx-auto font-medium">Análise biométrica de alta precisão para a curadoria da sua imagem.</p>
                      </div>

                      <div className="bg-white p-10 rounded-[48px] shadow-2xl border border-slate-100 mb-8 space-y-10">
                        <div className="grid grid-cols-2 gap-8">
                           {/* Seleção de Foto */}
                           <div className="space-y-4">
                              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-2">Sua Foto Facial</label>
                              {selectedImages[0] ? (
                                <div className="aspect-[3/4] rounded-3xl overflow-hidden relative border-4 border-slate-50 shadow-2xl group">
                                  <img src={selectedImages[0]} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                                  <button onClick={() => setSelectedImages([])} className="absolute top-4 right-4 p-3 bg-white/90 text-red-500 rounded-full shadow-xl hover:bg-red-500 hover:text-white transition-all transform hover:scale-110"><Trash2 size={16}/></button>
                                </div>
                              ) : (
                                <div className="grid grid-cols-1 gap-4 h-[300px]">
                                  <button 
                                    onClick={() => setShowCamera(true)}
                                    className="h-full rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 hover:border-brand-gold/40 transition-all group"
                                  >
                                    <div className="p-5 bg-brand-gold/10 rounded-full group-hover:scale-110 transition-transform">
                                      <Camera className="text-brand-gold" size={32} />
                                    </div>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-4">Capturar Agora</span>
                                  </button>
                                  <label className="h-12 border-2 border-slate-100 rounded-2xl flex items-center justify-center gap-2 cursor-pointer hover:bg-slate-50 transition-colors">
                                    <Upload size={14} className="text-slate-400" />
                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Enviar Arquivo</span>
                                    <input type="file" className="hidden" onChange={(e) => {
                                      const f = e.target.files?.[0];
                                      if (f) {
                                        const r = new FileReader();
                                        r.onload = () => setSelectedImages([r.result as string]);
                                        r.readAsDataURL(f);
                                      }
                                    }} />
                                  </label>
                                </div>
                              )}
                           </div>

                           {/* Dados Adicionais */}
                           <div className="space-y-8 py-4">
                              <div className="space-y-3">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-2">Sua Altura</label>
                                <div className="relative">
                                  <input 
                                    type="text" 
                                    placeholder="Ex: 1.75" 
                                    value={metrics.height} 
                                    onChange={e => setMetrics({...metrics, height: e.target.value})}
                                    className="w-full p-4 bg-slate-50 rounded-2xl text-sm border-none focus:ring-2 focus:ring-brand-gold transition-all shadow-inner" 
                                  />
                                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 text-[10px] font-bold">M</span>
                                </div>
                              </div>
                              <div className="space-y-3">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-2">Foco do Estilo</label>
                                <select 
                                  value={userPreferences.favoriteStyles[0] || ''} 
                                  onChange={e => setUserPreferences({...userPreferences, favoriteStyles: [e.target.value]})}
                                  className="w-full p-4 bg-slate-50 rounded-2xl text-sm border-none focus:ring-2 focus:ring-brand-gold appearance-none shadow-inner font-bold text-brand-graphite cursor-pointer"
                                >
                                  <option value="">Automático IA</option>
                                  <option value="Minimalista">Minimalista / Luxo Silencioso</option>
                                  <option value="Elegante">Elegante Executivo</option>
                                  <option value="Criativo">Criativo / Fashionista</option>
                                </select>
                              </div>
                              <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                                 <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed">Sua privacidade é prioridade. As fotos são processadas e enviadas apenas para a geração do seu dossiê exclusivo.</p>
                              </div>
                           </div>
                        </div>
                      </div>

                      <button disabled={selectedImages.length === 0} onClick={runAnalysis} className="w-full py-6 bg-brand-graphite text-white rounded-[32px] font-bold flex items-center justify-center gap-4 text-xl shadow-2xl active:scale-[0.98] hover:shadow-brand-gold/20 transition-all disabled:opacity-50 group border border-white/10">
                        <Zap className="w-6 h-6 text-brand-gold fill-brand-gold group-hover:scale-125 transition-transform" /> 
                        <span>ANALISAR BIOMETRIA</span>
                      </button>
                      <p className="text-center text-[10px] text-slate-400 mt-8 font-bold uppercase tracking-[0.3em] opacity-50">Private Label Style Engine • Version 3.1 Pro</p>
                   </div>
                 )}

                 {isAnalyzing && (
                   <div className="flex-1 flex flex-col items-center justify-center gap-10 animate-fade-in text-center max-w-sm">
                      <div className="relative p-8">
                        <div className="absolute inset-0 border-2 border-brand-gold/20 rounded-full animate-ping"></div>
                        <Loader2 className="w-24 h-24 text-brand-gold animate-spin" />
                        <Sparkles className="absolute inset-0 m-auto text-brand-graphite w-8 h-8" />
                      </div>
                      <div className="space-y-3">
                        <h3 className="font-serif italic text-4xl text-brand-graphite">Tecendo sua Identidade...</h3>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.4em] animate-pulse">
                          Harmonização de Proporções Áureas
                        </p>
                      </div>
                   </div>
                 )}
                 
                 {analysisResult && (
                   <VisagismAnalysis 
                     result={analysisResult} 
                     isPremium={isPremium} 
                     userImage={selectedImages[0]}
                     userName={user?.displayName || "Membro VizuHalizando"}
                     onUpgrade={handleManualUpgrade} 
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
              <div className="absolute inset-0 bg-brand-graphite/40 backdrop-blur-md" onClick={() => setIsMenuOpen(false)} />
              <div className="relative w-85 h-full bg-white p-10 animate-slide-in-right shadow-[0_0_100px_rgba(0,0,0,0.2)] flex flex-col border-l border-slate-100 rounded-l-[40px]">
                <button onClick={() => setIsMenuOpen(false)} className="absolute top-8 right-8 text-slate-300 hover:text-brand-graphite transition-colors p-2 hover:bg-slate-50 rounded-full"><X/></button>
                
                <div className="mb-12 flex items-center gap-5 border-b border-slate-50 pb-10">
                  <div className="w-20 h-20 bg-brand-gold/10 rounded-[24px] flex items-center justify-center overflow-hidden border-2 border-brand-gold/20 shadow-xl group">
                    {user?.photoURL ? <img src={user.photoURL} className="group-hover:scale-110 transition-transform" referrerPolicy="no-referrer" /> : <span className="font-bold text-3xl text-brand-gold">{user?.displayName?.[0] || "?"}</span>}
                  </div>
                  <div>
                    <p className="font-serif text-2xl font-bold text-brand-graphite leading-tight">{user?.displayName || 'Visitante'}</p>
                    <div className="flex items-center gap-2 mt-2">
                       <p className="text-[10px] text-brand-gold font-bold uppercase tracking-widest flex items-center gap-1 bg-brand-gold/5 px-3 py-1 rounded-full border border-brand-gold/10">
                        {isPremium ? <><CheckCircle2 size={10}/> MEMBRO PREMIUM</> : 'MEMBRO FREE'}
                      </p>
                    </div>
                  </div>
                </div>

                <nav className="space-y-3 flex-1">
                  <button onClick={() => { setShowAdmin(false); setShowHistoryView(false); setShowLanding(true); setIsMenuOpen(false); }} className="w-full text-left py-5 px-6 rounded-2xl font-bold text-sm text-slate-600 hover:bg-slate-50 flex items-center gap-4 transition-all group">
                    <div className="p-2 bg-slate-100 rounded-xl group-hover:bg-brand-graphite group-hover:text-white transition-colors"><Smartphone size={20}/></div>
                    Início do Atelier
                  </button>
                  <button onClick={() => { setShowAdmin(false); setShowHistoryView(true); setIsMenuOpen(false); }} className="w-full text-left py-5 px-6 rounded-2xl font-bold text-sm text-slate-600 hover:bg-slate-50 flex items-center gap-4 transition-all group">
                    <div className="p-2 bg-slate-100 rounded-xl group-hover:bg-brand-gold group-hover:text-white transition-colors"><LayoutGrid size={20}/> Consultorias Salvas</button>
                  {user?.role === 'admin' && (
                    <button onClick={() => { setShowAdmin(true); setShowHistoryView(false); setIsMenuOpen(false); }} className="w-full text-left py-5 px-6 rounded-2xl font-bold text-sm text-indigo-600 bg-indigo-50 flex items-center gap-4 transition-all mt-6 border border-indigo-100 group">
                      <div className="p-2 bg-indigo-600 text-white rounded-xl"><ShieldCheck size={20}/></div>
                      Gestão Administrativa
                    </button>
                  )}
                </nav>

                <div className="pt-10 border-t border-slate-50">
                  <button onClick={handleLogout} className="w-full py-5 bg-red-50 text-red-500 rounded-[24px] font-bold text-sm flex items-center justify-center gap-3 hover:bg-red-100 transition-colors shadow-sm"><LogOut size={18}/> Encerrar Sessão</button>
                </div>
              </div>
            </div>
          )}

          {showCamera && (
            <CameraCapture 
              onCapture={(base64) => setSelectedImages([base64])} 
              onClose={() => setShowCamera(false)} 
            />
          )}

          {showAuth && <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} onMockLogin={() => {}} />}
          {toast && (
            <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] px-8 py-5 bg-white shadow-[0_20px_60px_rgba(0,0,0,0.1)] rounded-[24px] border border-slate-100 flex items-center gap-4 animate-fade-in-up min-w-[280px]">
              <div className={`p-2 rounded-full ${toast.type === 'success' ? 'bg-green-50 text-green-500' : toast.type === 'error' ? 'bg-red-50 text-red-500' : 'bg-brand-gold/10 text-brand-gold'}`}>
                {toast.type === 'success' ? <CheckCircle2 size={20}/> : toast.type === 'error' ? <XCircle size={20}/> : <Loader2 size={20} className="animate-spin"/>}
              </div>
              <span className="font-bold text-sm text-brand-graphite">{toast.msg}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
