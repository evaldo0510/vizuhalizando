
import React, { useState } from 'react';
import { 
  X, Play, Lock, Shield, CreditCard, Check, Camera, 
  Scan, Shirt, Palette, Globe, ChevronRight, Download, 
  Sparkles, Star, UserCheck, Scissors, Eye
} from 'lucide-react';
import { Logo } from './Logo';

interface LandingPageProps {
  onEnterApp: () => void;
  onLoginClick: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnterApp, onLoginClick }) => {
  const [activeModal, setActiveModal] = useState<'video' | 'terms' | 'privacy' | null>(null);

  const openModal = (modal: 'video' | 'terms' | 'privacy') => setActiveModal(modal);
  const closeModal = () => setActiveModal(null);

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
                    <a href="#atelier" className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-brand-gold transition-colors">O Atelier</a>
                    <a href="#planos" className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-brand-gold transition-colors">Investimento</a>
                    
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
            <div 
                className="absolute inset-0 z-0 opacity-40 bg-cover bg-fixed bg-center scale-110"
                style={{ backgroundImage: "url('https://images.unsplash.com/photo-1441998856307-55151932379b?auto=format&fit=crop&q=80&w=2071')" }}
            ></div>
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
                      Deixe que nossa inteligência biométrica revele os cortes, cores e trajes que ressoam com sua verdadeira identidade visual.
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
                      <img 
                          src="https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&q=80&w=1000" 
                          className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000" 
                          alt="Luxury Atelier"
                      />
                      <div className="absolute bottom-10 left-10 p-8 bg-black/40 backdrop-blur-xl rounded-3xl border border-white/10 max-w-xs">
                          <p className="text-brand-gold font-bold text-xs uppercase tracking-widest mb-2">Visagismo Pro</p>
                          <p className="text-white text-sm font-light">"Uma imagem harmonizada é o seu passaporte para o sucesso em qualquer esfera social."</p>
                      </div>
                    </div>
                </div>
            </div>
        </section>

        {/* SECTION: EXPERIENCE */}
        <section id="experiencia" className="py-32 bg-brand-bg relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-6 lg:px-10">
                <div className="grid lg:grid-cols-2 gap-24 items-center">
                    <div className="relative order-2 lg:order-1">
                        <div className="grid grid-cols-2 gap-6">
                          <img src="https://images.unsplash.com/photo-1551232864-3f0890e580d9?auto=format&fit=crop&q=80&w=600" className="rounded-[32px] shadow-2xl transform -rotate-2" alt="Alfaiataria" />
                          <img src="https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=600" className="rounded-[32px] shadow-2xl mt-12 transform rotate-2" alt="Executivo" />
                        </div>
                        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-brand-gold rounded-[40px] flex items-center justify-center p-8 shadow-2xl rotate-12">
                            <Logo className="w-full h-full" />
                        </div>
                    </div>
                    <div className="order-1 lg:order-2 space-y-10">
                        <h2 className="font-serif text-5xl text-brand-graphite leading-tight font-bold">
                            O espelho técnico que <br/>
                            <span className="text-brand-gold italic">você sempre buscou.</span>
                        </h2>
                        <p className="text-lg text-slate-500 font-light leading-relaxed">
                          Nossa tecnologia proprietária mapeia as linhas de força do seu rosto e o subtom da sua pele, gerando um dossiê técnico que elimina a dúvida na hora de projetar sua imagem.
                        </p>
                        <div className="grid gap-6">
                            {[
                              { icon: Eye, title: "Visão Analítica", desc: "Análise de contraste facial e geometria para harmonização." },
                              { icon: Palette, title: "Cromática Pessoal", desc: "Identificação do subtom de pele com precisão científica." },
                              { icon: UserCheck, title: "Try-On Virtual", desc: "Visualize as peças sugeridas aplicadas diretamente em você." }
                            ].map((item, i) => (
                              <div key={i} className="flex gap-6 p-6 bg-white rounded-3xl border border-slate-50 shadow-sm hover:shadow-xl transition-all group">
                                <div className="p-4 bg-brand-bg text-brand-gold rounded-2xl group-hover:bg-brand-gold group-hover:text-white transition-colors">
                                  <item.icon size={24} />
                                </div>
                                <div>
                                  <h4 className="font-bold text-brand-graphite mb-1">{item.title}</h4>
                                  <p className="text-xs text-slate-400 font-medium">{item.desc}</p>
                                </div>
                              </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>

        {/* SECTION: HOW IT WORKS */}
        <section id="atelier" className="py-32 bg-white relative">
            <div className="max-w-7xl mx-auto px-6 lg:px-10">
                <div className="text-center mb-24">
                    <span className="text-brand-gold font-bold tracking-[0.3em] text-[10px] uppercase mb-4 block">Metodologia</span>
                    <h2 className="font-serif text-5xl text-brand-graphite font-bold">Três passos para a maestria visual.</h2>
                </div>
                
                <div className="grid md:grid-cols-3 gap-12">
                    {[
                      { step: "01", icon: Camera, title: "Mapeamento", desc: "Capture uma selfie frontal com luz natural. Nossa IA identifica os pontos nodais da sua estrutura facial." },
                      { step: "02", icon: Sparkles, title: "Consultoria", desc: "Receba o diagnóstico de biotipo, formato de rosto e paleta de cores técnicos em segundos." },
                      { step: "03", icon: Shirt, title: "Visualização", desc: "Experimente looks harmonizados com seu visagismo através do nosso provador virtual de elite." }
                    ].map((item, i) => (
                      <div key={i} className="bg-brand-bg p-10 rounded-[48px] border border-slate-50 shadow-sm hover:shadow-2xl transition-all group relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 text-slate-100 font-serif text-8xl font-bold opacity-20 group-hover:opacity-100 transition-opacity">
                          {item.step}
                        </div>
                        <div className="w-16 h-16 bg-brand-graphite rounded-3xl flex items-center justify-center text-brand-gold mb-10 shadow-xl group-hover:scale-110 transition-transform relative z-10"><item.icon size={28} /></div>
                        <h3 className="font-serif text-2xl font-bold text-brand-graphite mb-4 relative z-10">{item.title}</h3>
                        <p className="text-sm text-slate-500 leading-relaxed relative z-10">{item.desc}</p>
                      </div>
                    ))}
                </div>
            </div>
        </section>

        {/* APP PROMO */}
        <section className="py-24 bg-slate-50">
            <div className="max-w-6xl mx-auto px-6 lg:px-10">
                <div className="bg-brand-graphite rounded-[60px] shadow-3xl overflow-hidden flex flex-col lg:flex-row items-center border border-white/5">
                    <div className="w-full lg:w-1/2 h-[500px] relative overflow-hidden">
                        <img src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=1200" className="absolute inset-0 w-full h-full object-cover opacity-50 grayscale" alt="App Preview" />
                        <div className="absolute inset-0 bg-gradient-to-t from-brand-graphite via-brand-graphite/40 to-transparent"></div>
                        
                        {/* Mockup do App Premium */}
                        <div className="absolute inset-0 flex items-center justify-center p-20">
                           <div className="w-64 h-full bg-white rounded-[40px] border-[10px] border-slate-900 shadow-2xl relative overflow-hidden flex flex-col">
                              <div className="h-6 w-full bg-slate-900 flex justify-center items-center"><div className="w-12 h-1 bg-white/20 rounded-full"></div></div>
                              <div className="flex-1 flex flex-col items-center justify-center p-6 gap-6">
                                <Logo className="w-16 h-16" />
                                <div className="text-center">
                                  <p className="font-serif font-bold text-lg leading-tight">Vizu<span className="text-brand-gold">Halizando</span></p>
                                  <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest mt-1">Sua Ciência de Estilo</p>
                                </div>
                                <div className="w-full h-px bg-slate-100 mt-2"></div>
                                <div className="w-full flex flex-col gap-2">
                                  <div className="w-full h-4 bg-slate-50 rounded-lg"></div>
                                  <div className="w-4/5 h-4 bg-slate-50 rounded-lg"></div>
                                  <div className="w-full h-12 bg-brand-gold/10 rounded-xl mt-4 border border-brand-gold/20"></div>
                                </div>
                              </div>
                           </div>
                        </div>
                    </div>
                    <div className="w-full lg:w-1/2 p-12 lg:p-20 space-y-8">
                        <span className="text-[10px] font-bold text-brand-gold uppercase tracking-[0.4em] block">Mobilidade Premium</span>
                        <h3 className="font-serif text-4xl font-bold text-white leading-tight">O Atelier em seu smartphone, em qualquer lugar.</h3>
                        <p className="text-slate-400 text-lg font-light leading-relaxed">Instale o VizuHalizando em sua tela inicial e acesse suas paletas, looks favoritos e dossiês técnicos de qualquer lugar do mundo.</p>
                        <button onClick={onEnterApp} className="w-full bg-brand-gold text-brand-graphite py-5 rounded-[24px] font-bold hover:bg-white transition-all flex items-center justify-center gap-4 shadow-2xl shadow-brand-gold/10 group">
                          <Download size={20} className="group-hover:bounce" /> 
                          <span>INSTALAR ATELIER DIGITAL</span>
                        </button>
                    </div>
                </div>
            </div>
        </section>

        {/* PRICING SECTION */}
        <section id="planos" className="py-32 bg-white">
            <div className="max-w-7xl mx-auto px-6 lg:px-10">
                <div className="text-center mb-24">
                    <h2 className="font-serif text-5xl text-brand-graphite font-bold mb-6">Investimento em sua <span className="text-brand-gold italic">Marca Pessoal.</span></h2>
                    <p className="text-slate-400 font-medium">Resultados imediatos. Transformação duradoura.</p>
                </div>
                <div className="grid md:grid-cols-2 gap-10 max-w-5xl mx-auto">
                    {/* Free Plan */}
                    <div className="bg-brand-bg rounded-[48px] p-12 border border-slate-100 hover:shadow-2xl transition-all flex flex-col group">
                        <h3 className="font-serif text-3xl font-bold text-brand-graphite">Membro Visitante</h3>
                        <div className="flex items-baseline gap-2 my-8">
                          <span className="text-5xl font-bold text-slate-300">R$0</span>
                          <span className="text-xs text-slate-400 font-bold uppercase">Acesso Free</span>
                        </div>
                        <ul className="space-y-5 flex-1 mb-12">
                            <li className="flex items-center gap-4 text-sm text-slate-600 font-medium"><Check size={18} className="text-brand-graphite" /> Coloração Pessoal básica</li>
                            <li className="flex items-center gap-4 text-sm text-slate-600 font-medium"><Check size={18} className="text-brand-graphite" /> Sugestão de 1 Perfil de Estilo IA</li>
                            <li className="flex items-center gap-4 text-sm text-slate-600 font-medium"><Check size={18} className="text-brand-graphite" /> Mapeamento de Contraste Facial</li>
                        </ul>
                        <button onClick={onEnterApp} className="w-full py-5 border-2 border-brand-graphite text-brand-graphite rounded-[24px] hover:bg-brand-graphite hover:text-white transition-all font-bold uppercase tracking-widest text-xs">Entrar no Atelier</button>
                    </div>
                    {/* Premium Plan */}
                    <div className="bg-brand-graphite rounded-[48px] p-12 shadow-[0_40px_100px_rgba(0,0,0,0.15)] relative transform md:-translate-y-8 flex flex-col border border-white/5">
                        <div className="absolute top-8 right-8 bg-brand-gold text-brand-graphite text-[9px] font-black px-4 py-2 rounded-full tracking-widest uppercase">Consultoria Completa</div>
                        <div className="flex items-center gap-3 mb-2"><h3 className="font-serif text-3xl font-bold text-white">Halizando Pro</h3><Sparkles size={24} className="text-brand-gold" /></div>
                        <div className="flex items-baseline gap-2 my-8">
                          <span className="text-5xl font-bold text-brand-gold">R$29,90</span>
                          <span className="text-xs text-slate-500 font-bold uppercase">Pagamento Único</span>
                        </div>
                        <ul className="space-y-5 flex-1 mb-12">
                            <li className="flex items-center gap-4 text-sm text-white font-medium"><Check size={18} className="text-brand-gold" /> Visagismo Técnico Completo</li>
                            <li className="flex items-center gap-4 text-sm text-white font-medium"><Check size={18} className="text-brand-gold" /> Provador Virtual IA Ilimitado</li>
                            <li className="flex items-center gap-4 text-sm text-white font-medium"><Check size={18} className="text-brand-gold" /> Exportação de Dossiê em PDF</li>
                            <li className="flex items-center gap-4 text-sm text-white font-medium"><Check size={18} className="text-brand-gold" /> Sugestão de Corte e Óptica</li>
                        </ul>
                        <button onClick={onEnterApp} className="w-full py-5 bg-brand-gold text-brand-graphite rounded-[24px] hover:bg-white transition-all font-bold uppercase tracking-widest text-xs shadow-2xl shadow-brand-gold/30">Desbloquear Agora</button>
                    </div>
                </div>
            </div>
        </section>

        {/* FOOTER */}
        <footer className="bg-[#0f0f1a] pt-32 pb-16 border-t border-white/5">
            <div className="max-w-7xl mx-auto px-6 lg:px-10 flex flex-col md:flex-row justify-between items-start gap-16">
                <div className="space-y-8">
                    <div className="flex items-center gap-4 text-white font-serif text-2xl font-bold group">
                        <Logo className="w-12 h-12" />
                        <div>
                          <span>Vizu</span>
                          <span className="text-brand-gold">Halizando</span>
                        </div>
                    </div>
                    <p className="max-w-xs text-slate-500 font-light leading-relaxed">O atelier digital definitivo que une biometria e IA para revelar a melhor versão da sua imagem.</p>
                    <div className="flex gap-4">
                      <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white hover:border-brand-gold hover:text-brand-gold transition-all cursor-pointer"><Globe size={18} /></div>
                      <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white hover:border-brand-gold hover:text-brand-gold transition-all cursor-pointer"><Lock size={18} /></div>
                    </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-16">
                    <div className="space-y-6">
                        <span className="text-white font-bold uppercase text-[10px] tracking-[0.3em] block">Atelier</span>
                        <ul className="space-y-4 text-slate-500 text-xs font-medium">
                          <li><button onClick={onEnterApp} className="hover:text-brand-gold transition-colors">Visagismo</button></li>
                          <li><button onClick={onEnterApp} className="hover:text-brand-gold transition-colors">Colorimetria</button></li>
                          <li><button onClick={onEnterApp} className="hover:text-brand-gold transition-colors">Provador Virtual</button></li>
                        </ul>
                    </div>
                    <div className="space-y-6">
                        <span className="text-white font-bold uppercase text-[10px] tracking-[0.3em] block">Suporte</span>
                        <ul className="space-y-4 text-slate-500 text-xs font-medium">
                          <li><button className="hover:text-white transition-colors" onClick={() => openModal('terms')}>Termos de Uso</button></li>
                          <li><button className="hover:text-white transition-colors" onClick={() => openModal('privacy')}>Privacidade</button></li>
                        </ul>
                    </div>
                    <div className="space-y-6">
                        <span className="text-white font-bold uppercase text-[10px] tracking-[0.3em] block">Comunidade</span>
                        <ul className="space-y-4 text-slate-500 text-xs font-medium">
                          <li><a href="https://wa.me/5511961226754" target="_blank" className="hover:text-brand-gold transition-colors">WhatsApp Suporte</a></li>
                          <li><a href="#" className="hover:text-white transition-colors">Instagram Oficial</a></li>
                        </ul>
                    </div>
                </div>
            </div>
            <div className="max-w-7xl mx-auto px-6 lg:px-10 mt-32 pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] text-slate-600 font-bold uppercase tracking-widest">
                <span>© {new Date().getFullYear()} VizuHalizando Pro • Atelier Digital de Visagismo</span>
                <span className="flex items-center gap-2 text-brand-gold"><Sparkles size={12} /> Gemini 3.1 Luxury Engine Active</span>
            </div>
        </footer>

        {/* MODALS 100% FUNCIONAIS */}
        
        {/* Video Modal */}
        {activeModal === 'video' && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 md:p-12 animate-fade-in">
                <div className="absolute inset-0 bg-brand-graphite/95 backdrop-blur-xl" onClick={closeModal}></div>
                <div className="relative w-full max-w-5xl aspect-video bg-black rounded-[40px] shadow-3xl overflow-hidden border border-white/10 animate-scale-up">
                    <button onClick={closeModal} className="absolute top-8 right-8 z-50 p-3 bg-white/10 text-white hover:bg-brand-gold rounded-full backdrop-blur-md transition-all">
                      <X size={24} />
                    </button>
                    <iframe 
                      className="w-full h-full" 
                      src="https://www.youtube.com/embed/DaSKyQ7y4sU?autoplay=1&mute=1&controls=1&rel=0&modestbranding=1" 
                      frameBorder="0" 
                      allow="autoplay; encrypted-media" 
                      allowFullScreen
                    ></iframe>
                </div>
            </div>
        )}

        {/* Terms Modal */}
        {activeModal === 'terms' && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-fade-in">
                <div className="absolute inset-0 bg-brand-graphite/90 backdrop-blur-md" onClick={closeModal}></div>
                <div className="relative w-full max-w-2xl max-h-[80vh] bg-white rounded-[40px] shadow-3xl animate-scale-up flex flex-col overflow-hidden">
                    <div className="p-8 md:p-10 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                      <h3 className="font-serif text-3xl font-bold text-brand-graphite">Termos de Uso</h3>
                      <button onClick={closeModal} className="p-3 hover:bg-slate-200 rounded-full transition-all"><X size={24} /></button>
                    </div>
                    <div className="p-8 md:p-10 overflow-y-auto flex-1 prose prose-slate max-w-none custom-scrollbar">
                        <p className="text-sm leading-relaxed text-slate-500">Ao utilizar o VizuHalizando, você concorda com os termos de processamento de imagem para fins de consultoria.</p>
                        <h4 className="font-bold text-brand-graphite mt-6">1. Escopo Tecnológico</h4>
                        <p className="text-sm text-slate-500">O VizuHalizando utiliza algoritmos de IA de última geração para mapeamento facial e sugestão de vestuário.</p>
                        <h4 className="font-bold text-brand-graphite mt-6">2. Propriedade Intelectual</h4>
                        <p className="text-sm text-slate-500">O usuário mantém os direitos sobre suas fotos. A análise gerada é de uso pessoal e intransferível.</p>
                    </div>
                    <div className="p-8 border-t border-slate-100 bg-slate-50 flex justify-end">
                      <button onClick={closeModal} className="px-10 py-4 bg-brand-graphite text-white rounded-2xl font-bold uppercase tracking-widest text-xs">Entendi</button>
                    </div>
                </div>
            </div>
        )}

        {/* Privacy Modal */}
        {activeModal === 'privacy' && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-fade-in">
                <div className="absolute inset-0 bg-brand-graphite/90 backdrop-blur-md" onClick={closeModal}></div>
                <div className="relative w-full max-w-2xl max-h-[80vh] bg-white rounded-[40px] shadow-3xl animate-scale-up flex flex-col overflow-hidden">
                    <div className="p-8 md:p-10 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                      <h3 className="font-serif text-3xl font-bold text-brand-graphite">Privacidade</h3>
                      <button onClick={closeModal} className="p-3 hover:bg-slate-200 rounded-full transition-all"><X size={24} /></button>
                    </div>
                    <div className="p-8 md:p-10 overflow-y-auto flex-1 prose prose-slate max-w-none custom-scrollbar">
                        <p className="text-sm leading-relaxed text-slate-500">Sua privacidade é inegociável. Fotos são processadas localmente e enviadas via canais criptografados.</p>
                        <h4 className="font-bold text-brand-graphite mt-6">1. Coleta de Dados</h4>
                        <p className="text-sm text-slate-500">Coletamos apenas o estritamente necessário para realizar as métricas de biometria facial e corporal.</p>
                        <h4 className="font-bold text-brand-graphite mt-6">2. Retenção</h4>
                        <p className="text-sm text-slate-500">Você pode solicitar a exclusão definitiva de todo o seu histórico e imagens a qualquer momento nas configurações.</p>
                    </div>
                    <div className="p-8 border-t border-slate-100 bg-slate-50 flex justify-end">
                      <button onClick={closeModal} className="px-10 py-4 bg-brand-graphite text-white rounded-2xl font-bold uppercase tracking-widest text-xs">Concordo</button>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};
