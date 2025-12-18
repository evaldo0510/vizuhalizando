
import React, { useState } from 'react';
import { 
  X, Play, Lock, Check, ChevronRight, 
  Sparkles, Zap, Coins, Cpu, Palette, Shirt, ShoppingBag, History, ArrowRight, Loader2
} from 'lucide-react';
import { Logo } from './Logo';
import { generatePromoVideo } from '../services/videoService';

interface LandingPageProps {
  onEnterApp: () => void;
  onLoginClick: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnterApp, onLoginClick }) => {
  const [activeModal, setActiveModal] = useState<'video' | 'terms' | 'privacy' | 'credits' | null>(null);
  const [isGeneratingPromo, setIsGeneratingPromo] = useState(false);
  const [promoUrl, setPromoUrl] = useState<string | null>(null);

  const openModal = (modal: 'video' | 'terms' | 'privacy' | 'credits') => {
    setActiveModal(modal);
    if (modal === 'video' && !promoUrl) {
      handleLoadPromo();
    }
  };

  const closeModal = () => setActiveModal(null);

  const handleLoadPromo = async () => {
    setIsGeneratingPromo(true);
    try {
      // Prompt padrão de luxo para o VizuHalizando
      const url = await generatePromoVideo("Luxury digital atelier showing futuristic AI face mapping, stylish virtual try-ons of high-end suits and dresses, elegant motion graphics, professional lighting, 4k cinematic quality");
      setPromoUrl(url);
    } catch (err) {
      console.error("Erro ao carregar promo:", err);
    } finally {
      setIsGeneratingPromo(false);
    }
  };

  return (
    <div className="antialiased text-brand-graphite bg-brand-bg selection:bg-brand-gold/30">
        
        {/* HEADER */}
        <header className="fixed w-full top-0 z-[60] transition-all duration-500 bg-white/80 backdrop-blur-xl border-b border-slate-100">
            <div className="max-w-7xl mx-auto px-6 lg:px-10 h-24 flex justify-between items-center">
                <div className="flex items-center gap-4 cursor-pointer group" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
                    <Logo className="w-10 h-10 group-hover:scale-110 transition-transform" />
                    <div className="flex flex-col">
                      <span className="font-serif text-2xl font-bold tracking-tight leading-none">
                        <span className="text-brand-graphite">Vizu</span>
                        <span className="text-brand-gold">Halizando</span>
                      </span>
                      <span className="text-[8px] font-bold text-slate-400 uppercase tracking-[0.3em] mt-1">L'atelier de l'image</span>
                    </div>
                </div>

                <nav className="hidden lg:flex items-center gap-10">
                    <a href="#experiencia" className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-brand-gold transition-colors">Experiência</a>
                    <button onClick={() => openModal('credits')} className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-brand-gold transition-colors">Banco de Créditos</button>
                    <a href="#planos" className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-brand-gold transition-colors">Preços</a>
                    
                    <div className="h-6 w-px bg-slate-100 mx-2"></div>

                    <button onClick={onLoginClick} className="text-[11px] font-bold text-brand-graphite hover:text-brand-gold transition-colors uppercase tracking-widest">
                        Entrar
                    </button>
                    
                    <button onClick={onEnterApp} className="px-8 py-3.5 bg-brand-graphite text-white rounded-full text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-brand-gold transition-all shadow-xl shadow-brand-graphite/10 hover:shadow-brand-gold/20 active:scale-95">
                        Iniciar Consultoria
                    </button>
                </nav>

                <button onClick={onEnterApp} className="lg:hidden p-3 bg-brand-graphite text-white rounded-2xl shadow-lg">
                    <ChevronRight size={24} />
                </button>
            </div>
        </header>

        {/* HERO SECTION */}
        <section className="relative min-h-screen pt-24 flex items-center overflow-hidden bg-brand-graphite">
            <div className="absolute inset-0 z-0 opacity-40 bg-cover bg-fixed bg-center scale-110" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1441998856307-55151932379b?auto=format&fit=crop&q=80&w=2071')" }}></div>
            <div className="absolute inset-0 bg-gradient-to-tr from-brand-graphite via-brand-graphite/90 to-transparent z-10"></div>
            
            <div className="max-w-7xl mx-auto px-6 lg:px-10 relative z-20 w-full grid lg:grid-cols-2 gap-16 items-center">
                <div className="animate-fade-in-up">
                    <div className="flex items-center gap-3 mb-8">
                      <span className="w-12 h-px bg-brand-gold"></span>
                      <span className="text-brand-gold text-[10px] font-bold uppercase tracking-[0.4em]">Sua Essência, Digitalizada</span>
                    </div>
                    <h1 className="font-serif text-5xl md:text-7xl font-bold text-white leading-[1.1] mb-8">
                      A ciência da <span className="italic text-brand-gold font-light">imagem</span><br/>
                      agora em suas mãos.
                    </h1>
                    <p className="text-xl text-slate-300 mb-12 max-w-lg font-light leading-relaxed">
                      Deixe que nossa inteligência biométrica revele os cortes, cores e trajes que ressoam com sua identidade visual única.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-6">
                        <button onClick={onEnterApp} className="px-10 py-5 bg-brand-gold text-brand-graphite rounded-2xl font-bold transition-all shadow-2xl shadow-brand-gold/20 flex items-center justify-center gap-4 group hover:bg-white">
                            <span>EXPERIÊNCIA GRATUITA</span>
                            <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                        <button onClick={() => openModal('video')} className="px-10 py-5 border border-white/20 text-white rounded-2xl hover:bg-white/10 backdrop-blur-md transition-all font-bold flex items-center justify-center gap-3">
                            <Play size={18} className="fill-brand-gold text-brand-gold" />
                            <span>CONHECER O ATELIER</span>
                        </button>
                    </div>
                </div>

                <div className="hidden lg:block relative h-[650px] animate-fade-in-up delay-200">
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-brand-gold/20 rounded-full blur-[120px]"></div>
                    <div className="relative w-full h-full rounded-[40px] overflow-hidden border border-white/10 shadow-[0_0_80px_rgba(0,0,0,0.5)]">
                      <img src="https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&q=80&w=1000" className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000" alt="Luxury Atelier" />
                    </div>
                </div>
            </div>
        </section>

        {/* SECTION: COMO FUNCIONAM OS CRÉDITOS */}
        <section className="py-24 bg-white border-y border-slate-50">
           <div className="max-w-7xl mx-auto px-6 lg:px-10">
              <div className="grid lg:grid-cols-2 gap-16 items-center">
                 <div>
                    <h2 className="font-serif text-4xl font-bold text-brand-graphite mb-8">Economia por <span className="text-brand-gold italic">Créditos.</span></h2>
                    <p className="text-lg text-slate-500 mb-10 leading-relaxed">No VizuHalizando, você investe apenas no que consome. Cada crédito desbloqueia uma análise completa com biometria facial, corporal e paleta cromática.</p>
                    
                    <div className="space-y-6">
                       <div className="flex gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-100">
                          <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-brand-gold shadow-sm"><History size={24}/></div>
                          <div>
                             <h4 className="font-bold text-brand-graphite">Sem Validade</h4>
                             <p className="text-xs text-slate-400 font-medium">Seus créditos adquiridos nunca expiram. Use quando precisar.</p>
                          </div>
                       </div>
                       <div className="flex gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-100">
                          <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-brand-gold shadow-sm"><ShoppingBag size={24}/></div>
                          <div>
                             <h4 className="font-bold text-brand-graphite">Compra Ilimitada</h4>
                             <p className="text-xs text-slate-400 font-medium">Pode comprar packs de 5, 10 ou mais créditos conforme seu ritmo de evolução.</p>
                          </div>
                       </div>
                    </div>
                 </div>
                 <div className="bg-brand-graphite p-10 rounded-[48px] shadow-3xl border border-white/10 text-center relative overflow-hidden group">
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-brand-gold/10 rounded-full blur-3xl group-hover:bg-brand-gold/20 transition-all"></div>
                    <Coins size={64} className="text-brand-gold mx-auto mb-8 animate-bounce" />
                    <h3 className="text-white font-serif text-3xl font-bold mb-4">Flexibilidade Total</h3>
                    <p className="text-slate-400 text-sm mb-8 leading-relaxed">Novo no atelier? Você ganha **1 crédito cortesia** assim que se cadastrar. Experimente a precisão antes de investir.</p>
                    <button onClick={onEnterApp} className="px-10 py-5 bg-brand-gold text-brand-graphite rounded-2xl font-bold hover:bg-white transition-all shadow-xl shadow-brand-gold/10 uppercase tracking-widest text-[11px]">Resgatar meu crédito grátis</button>
                 </div>
              </div>
           </div>
        </section>

        {/* PRICING SECTION */}
        <section id="planos" className="py-32 bg-brand-bg">
            <div className="max-w-7xl mx-auto px-6 lg:px-10 text-center">
                <h2 className="font-serif text-5xl text-brand-graphite font-bold mb-16">Planos do <span className="text-brand-gold italic">Atelier.</span></h2>
                <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    <div className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm flex flex-col h-fit">
                        <h3 className="font-serif text-2xl font-bold text-brand-graphite">Visitante</h3>
                        <span className="text-4xl font-bold text-slate-300 my-6">Grátis</span>
                        <ul className="space-y-4 mb-10 text-left text-xs text-slate-500 font-medium">
                            <li className="flex items-center gap-2"><Check size={14} className="text-brand-gold"/> 1 Crédito Cortesia</li>
                            <li className="flex items-center gap-2"><Check size={14} className="text-brand-gold"/> Mapeamento Básico</li>
                        </ul>
                        <button onClick={onEnterApp} className="w-full py-4 border-2 border-brand-graphite rounded-2xl font-bold uppercase tracking-widest text-[10px]">Testar Grátis</button>
                    </div>

                    <div className="bg-white p-10 rounded-[48px] border-2 border-brand-gold shadow-2xl flex flex-col h-fit scale-105 relative z-10">
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-brand-gold text-brand-graphite text-[10px] font-black px-4 py-1 rounded-full uppercase tracking-widest">Recomendado</div>
                        <h3 className="font-serif text-2xl font-bold text-brand-graphite">Vizu Pack</h3>
                        <span className="text-4xl font-bold text-brand-gold my-6">R$14,90</span>
                        <ul className="space-y-4 mb-10 text-left text-xs text-slate-600 font-bold">
                            <li className="flex items-center gap-2"><Zap size={14} className="text-brand-gold"/> 5 Créditos Avulsos</li>
                            <li className="flex items-center gap-2"><Check size={14} className="text-brand-gold"/> Sem Expiração</li>
                            <li className="flex items-center gap-2"><Check size={14} className="text-brand-gold"/> Dossiê Digital</li>
                        </ul>
                        <button onClick={onEnterApp} className="w-full py-4 bg-brand-gold text-brand-graphite rounded-2xl font-bold uppercase tracking-widest text-[10px] shadow-lg">Comprar Pack</button>
                    </div>

                    <div className="bg-brand-graphite p-10 rounded-[48px] shadow-xl flex flex-col h-fit">
                        <h3 className="font-serif text-2xl font-bold text-white">Halizando Pro</h3>
                        <span className="text-4xl font-bold text-brand-gold my-6">R$29,90</span>
                        <ul className="space-y-4 mb-10 text-left text-xs text-slate-300 font-medium">
                            <li className="flex items-center gap-2"><Sparkles size={14} className="text-brand-gold"/> Créditos Ilimitados</li>
                            <li className="flex items-center gap-2"><Check size={14} className="text-brand-gold"/> Provador Virtual Infinito</li>
                        </ul>
                        <button onClick={onEnterApp} className="w-full py-4 bg-white/10 text-white rounded-2xl font-bold uppercase tracking-widest text-[10px]">Assinar Pro</button>
                    </div>
                </div>
            </div>
        </section>

        {/* MODAL: VÍDEO PROMOCIONAL VEO */}
        {activeModal === 'video' && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10 animate-fade-in">
                <div className="absolute inset-0 bg-brand-graphite/98 backdrop-blur-2xl" onClick={closeModal}></div>
                <div className="relative w-full max-w-6xl bg-black rounded-[40px] shadow-3xl overflow-hidden border border-white/10 animate-scale-up grid lg:grid-cols-12">
                    <button onClick={closeModal} className="absolute top-8 right-8 z-50 p-3 bg-white/10 text-white hover:bg-brand-gold rounded-full transition-all"><X size={24} /></button>
                    <div className="lg:col-span-8 aspect-video bg-slate-900 relative flex items-center justify-center">
                        {isGeneratingPromo ? (
                            <div className="flex flex-col items-center gap-6 text-center p-12">
                                <Loader2 className="w-16 h-16 text-brand-gold animate-spin" />
                                <div className="space-y-2">
                                    <h4 className="text-xl font-serif text-white">Gerando sua prévia exclusiva...</h4>
                                    <p className="text-[10px] text-brand-gold font-bold uppercase tracking-[0.4em] animate-pulse">Veo Video Engine v3.1</p>
                                </div>
                            </div>
                        ) : promoUrl ? (
                            <video src={promoUrl} autoPlay loop muted playsInline className="w-full h-full object-cover" />
                        ) : (
                            <div className="text-white text-center p-10">Falha ao carregar prévia promocional.</div>
                        )}
                    </div>
                    <div className="lg:col-span-4 p-10 lg:p-12 flex flex-col justify-center space-y-10 bg-brand-graphite border-l border-white/5">
                        <h3 className="text-3xl font-serif font-bold text-white">O <span className="text-brand-gold italic">Futuro</span> da Imagem</h3>
                        <div className="space-y-6">
                            <div className="flex gap-4"><div className="p-2 bg-white/5 text-brand-gold rounded-xl"><Cpu size={20}/></div><p className="text-[11px] text-slate-400 leading-relaxed">Mapeamento Neural de Proporções Faciais em Tempo Real.</p></div>
                            <div className="flex gap-4"><div className="p-2 bg-white/5 text-brand-gold rounded-xl"><Palette size={20}/></div><p className="text-[11px] text-slate-400 leading-relaxed">Cromática Digital baseada em Colorimetria Avançada.</p></div>
                            <div className="flex gap-4"><div className="p-2 bg-white/5 text-brand-gold rounded-xl"><Shirt size={20}/></div><p className="text-[11px] text-slate-400 leading-relaxed">Provador Virtual HD para visualização imediata.</p></div>
                        </div>
                        <button onClick={onEnterApp} className="w-full py-5 bg-brand-gold text-brand-graphite rounded-2xl font-bold flex items-center justify-center gap-3 shadow-2xl hover:bg-white transition-all">INICIAR AGORA <ArrowRight size={18}/></button>
                    </div>
                </div>
            </div>
        )}

        {/* MODAL: BANCO DE CRÉDITOS */}
        {activeModal === 'credits' && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-fade-in">
                <div className="absolute inset-0 bg-brand-graphite/90 backdrop-blur-md" onClick={closeModal}></div>
                <div className="relative w-full max-w-2xl bg-white rounded-[40px] shadow-3xl overflow-hidden animate-scale-up p-12">
                   <button onClick={closeModal} className="absolute top-8 right-8 p-2 hover:bg-slate-100 rounded-full transition-all"><X size={24}/></button>
                   <div className="text-center mb-10">
                      <div className="w-16 h-16 bg-brand-gold/10 rounded-2xl flex items-center justify-center mx-auto text-brand-gold mb-6"><Coins size={32}/></div>
                      <h3 className="text-3xl font-serif font-bold text-brand-graphite">Seu Banco de Créditos</h3>
                      <p className="text-slate-400 text-sm mt-2">Liberdade para evoluir sua imagem no seu ritmo.</p>
                   </div>
                   <div className="grid gap-4 mb-10">
                      <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex justify-between items-center group hover:border-brand-gold transition-all cursor-pointer">
                         <div>
                            <h4 className="font-bold text-brand-graphite">Single Pack</h4>
                            <p className="text-xs text-slate-400">1 Análise Biométrica Única</p>
                         </div>
                         <div className="text-right">
                            <span className="text-lg font-bold text-brand-gold">R$ 4,90</span>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Avulso</p>
                         </div>
                      </div>
                      <div className="p-6 bg-brand-gold/5 rounded-3xl border-2 border-brand-gold flex justify-between items-center relative overflow-hidden group cursor-pointer">
                         <div className="absolute top-0 right-0 bg-brand-gold text-brand-graphite text-[8px] font-bold px-3 py-1 uppercase tracking-widest rounded-bl-xl">Mais Popular</div>
                         <div>
                            <h4 className="font-bold text-brand-graphite">Essential Pack</h4>
                            <p className="text-xs text-slate-400">5 Análises Biométricas Completas</p>
                         </div>
                         <div className="text-right">
                            <span className="text-lg font-bold text-brand-gold">R$ 14,90</span>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">R$ 2,98 / análise</p>
                         </div>
                      </div>
                      <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex justify-between items-center group hover:border-brand-gold transition-all cursor-pointer">
                         <div>
                            <h4 className="font-bold text-brand-graphite">Premium Pack</h4>
                            <p className="text-xs text-slate-400">12 Análises + 10 Provadores Virtuais</p>
                         </div>
                         <div className="text-right">
                            <span className="text-lg font-bold text-brand-gold">R$ 24,90</span>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Melhor Valor</p>
                         </div>
                      </div>
                   </div>
                   <button onClick={onEnterApp} className="w-full py-5 bg-brand-graphite text-white rounded-2xl font-bold uppercase tracking-widest text-xs shadow-xl shadow-brand-graphite/10">Ir para o provador e comprar</button>
                </div>
            </div>
        )}
    </div>
  );
};
