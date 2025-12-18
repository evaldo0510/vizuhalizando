import React, { useState } from 'react';
import { X, Play, Lock, Shield, CreditCard, Check, Camera, Scan, Shirt, Palette, Globe, ChevronRight, Download, Sparkles } from 'lucide-react';

interface LandingPageProps {
  onEnterApp: () => void;
  onLoginClick: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnterApp, onLoginClick }) => {
  const [activeModal, setActiveModal] = useState<'video' | 'terms' | 'privacy' | null>(null);

  const openModal = (modal: 'video' | 'terms' | 'privacy') => setActiveModal(modal);
  const closeModal = () => setActiveModal(null);

  return (
    <div className="antialiased text-slate-800 bg-brand-bg transition-opacity duration-500">
        
        {/* HEADER (Landing) */}
        <header id="main-header" className="fixed w-full top-0 z-50 transition-all duration-300 bg-brand-bg/95 backdrop-blur-sm border-b border-slate-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-20">
                    <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
                        <svg width="32" height="32" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M10 4L20 36L30 4H24L20 20L16 4H10Z" fill="#1A1A2E"/>
                            <path d="M0 0L14 38H26L40 0H32L20 30L8 0H0Z" fill="#C5A572" fillOpacity="0.3"/>
                        </svg>
                        <span className="font-serif text-2xl font-bold text-brand-graphite tracking-wide">Vizuhalizando</span>
                    </div>

                    <nav className="hidden md:flex items-center gap-8">
                        <a href="#como-funciona" className="text-sm font-medium text-slate-600 hover:text-brand-gold transition-colors">Como Funciona</a>
                        <a href="#diferenciais" className="text-sm font-medium text-slate-600 hover:text-brand-gold transition-colors">Diferenciais</a>
                        <a href="#planos" className="text-sm font-medium text-slate-600 hover:text-brand-gold transition-colors">Planos</a>
                        
                        <button onClick={onLoginClick} className="text-sm font-bold text-brand-graphite hover:text-brand-gold transition-colors">
                            Entrar
                        </button>
                        
                        <button onClick={onEnterApp} className="px-6 py-2 border border-brand-gold text-brand-graphite rounded-full text-sm font-medium hover:bg-brand-gold hover:text-white transition-all duration-300">
                            Experimentar Grátis
                        </button>
                    </nav>

                    <button onClick={onEnterApp} className="md:hidden text-brand-graphite text-2xl">
                        <i className="ph ph-list"></i>
                    </button>
                </div>
            </div>
        </header>

        {/* HERO SECTION */}
        <section className="relative bg-brand-graphite min-h-screen pt-20 flex items-center overflow-hidden">
            <div 
                className="absolute inset-0 z-0 opacity-30 bg-cover bg-center"
                style={{ backgroundImage: "url('https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=2071')" }}
            ></div>
            <div className="absolute inset-0 bg-gradient-to-r from-brand-graphite via-brand-graphite/90 to-transparent z-10"></div>
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20 w-full grid lg:grid-cols-2 gap-12 items-center">
                <div className="animate-fade-in-up">
                    <span className="inline-block py-1 px-3 rounded-full bg-brand-gold/10 border border-brand-gold/30 text-brand-gold text-xs font-semibold tracking-wider mb-6">INTELIGÊNCIA VISUAL</span>
                    <h1 className="font-serif text-4xl md:text-6xl font-medium text-white leading-tight mb-6">
                        Seu estilo explicado pela <span className="italic text-brand-gold">ciência</span>.<br/>
                        Agora visualizado em você.
                    </h1>
                    <p className="text-lg text-slate-300 mb-8 max-w-lg font-light leading-relaxed">
                        Descubra as cores, cortes e combinações que realmente funcionam para o seu rosto, sua pele e sua intenção.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <button onClick={onEnterApp} className="px-8 py-4 bg-brand-gold text-brand-graphite rounded hover:bg-brand-goldHover font-semibold transition-all shadow-lg shadow-brand-gold/20 flex items-center justify-center gap-2">
                            Experimentar grátis agora
                            <ChevronRight size={18} />
                        </button>
                        <button onClick={() => openModal('video')} className="px-8 py-4 border border-white/20 text-white rounded hover:bg-white/10 transition-all font-medium flex items-center justify-center gap-2">
                            <Play size={18} fill="currentColor" />
                            Ver como funciona
                        </button>
                    </div>
                </div>

                <div className="hidden lg:block relative h-[600px] animate-fade-in-up delay-200">
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[400px] h-[500px] bg-brand-gold/10 rounded-full blur-3xl"></div>
                    <img 
                        src="https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&q=80&w=1000" 
                        className="relative w-full h-full object-cover rounded-sm shadow-2xl border border-white/10" 
                        style={{ maskImage: 'linear-gradient(to bottom, black 80%, transparent 100%)' }}
                        alt="Hero Style"
                        crossOrigin="anonymous"
                    />
                </div>
            </div>
        </section>

        {/* SEÇÃO: O PROBLEMA */}
        <section className="py-24 bg-brand-bg">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    <div className="relative order-2 lg:order-1">
                        <img 
                            src="https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&q=80&w=1000" 
                            alt="Dúvida com roupas" 
                            className="rounded shadow-lg grayscale hover:grayscale-0 transition-all duration-500 w-full aspect-[4/3] object-cover"
                            crossOrigin="anonymous"
                        />
                        <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-brand-graphite flex items-center justify-center">
                            <span className="text-4xl text-white font-serif">?</span>
                        </div>
                    </div>
                    <div className="order-1 lg:order-2">
                        <h2 className="font-serif text-3xl md:text-4xl text-brand-graphite mb-8 leading-tight">
                            Você já comprou roupas que ficaram ótimas na vitrine... <br/>
                            <span className="text-slate-400 italic">mas não funcionaram em você?</span>
                        </h2>
                        <ul className="space-y-6 mb-10">
                            <li className="flex items-start gap-4">
                                <div className="mt-1 w-6 h-6 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0"><X size={12} className="text-red-400" /></div>
                                <div><h4 className="font-semibold text-brand-graphite">Cores que apagam o rosto</h4><p className="text-sm text-slate-500">Aquelas peças que acentuam olheiras e te deixam com ar de cansaço.</p></div>
                            </li>
                            <li className="flex items-start gap-4">
                                <div className="mt-1 w-6 h-6 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0"><X size={12} className="text-red-400" /></div>
                                <div><h4 className="font-semibold text-brand-graphite">Looks que não comunicam quem você é</h4><p className="text-sm text-slate-500">Sentir que a roupa "chegou antes" de você no ambiente.</p></div>
                            </li>
                            <li className="flex items-start gap-4">
                                <div className="mt-1 w-6 h-6 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0"><X size={12} className="text-red-400" /></div>
                                <div><h4 className="font-semibold text-brand-graphite">Dúvida constante</h4><p className="text-sm text-slate-500">O guarda-roupa cheio, mas a sensação de "não tenho nada para vestir".</p></div>
                            </li>
                        </ul>
                        <div className="flex items-center gap-4 p-4 bg-white border border-brand-gold/20 rounded shadow-sm">
                            <div className="w-10 h-10 bg-brand-graphite rounded-full flex items-center justify-center text-brand-gold"><Check size={20} /></div>
                            <p className="font-serif font-bold text-brand-graphite text-lg">O Vizuhalizando resolve isso.</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        {/* SEÇÃO: COMO FUNCIONA */}
        <section id="como-funciona" className="py-24 bg-white relative">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <span className="text-brand-gold font-bold tracking-widest text-xs uppercase mb-2 block">Processo</span>
                    <h2 className="font-serif text-4xl text-brand-graphite">Simples. Rápido. Personalizado.</h2>
                </div>
                <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-slate-100 -z-10 transform -translate-y-1/2"></div>
                <div className="grid md:grid-cols-3 gap-12">
                    <div className="bg-brand-bg p-8 rounded-lg border border-slate-100 shadow-sm hover:shadow-lg hover:border-brand-gold/30 transition-all group text-center">
                        <div className="w-16 h-16 mx-auto bg-brand-graphite rounded-full flex items-center justify-center text-brand-gold text-2xl mb-6 shadow-lg group-hover:scale-110 transition-transform"><Camera size={32} /></div>
                        <h3 className="font-serif text-xl font-bold text-brand-graphite mb-3">1. Envie sua selfie</h3>
                        <p className="text-sm text-slate-500 mb-6">Tire uma foto simples com luz natural. Sem maquiagem pesada, apenas você.</p>
                        <div className="bg-white p-2 rounded shadow-inner border border-slate-100 overflow-hidden">
                            <img src="https://images.unsplash.com/photo-1542332606-b4d1c172421c?auto=format&fit=crop&q=80&w=400" className="w-full h-32 object-cover rounded opacity-80 group-hover:opacity-100 transition-opacity" alt="Selfie Example" />
                        </div>
                    </div>
                    <div className="bg-brand-bg p-8 rounded-lg border border-slate-100 shadow-sm hover:shadow-lg hover:border-brand-gold/30 transition-all group text-center relative top-0 md:-top-8">
                        <div className="w-16 h-16 mx-auto bg-brand-gold rounded-full flex items-center justify-center text-brand-graphite text-2xl mb-6 shadow-lg group-hover:scale-110 transition-transform"><Scan size={32} /></div>
                        <h3 className="font-serif text-xl font-bold text-brand-graphite mb-3">2. Receba sua análise</h3>
                        <p className="text-sm text-slate-500 mb-6">Nossa IA analisa contraste, subtom e proporções áureas do seu rosto.</p>
                        <div className="bg-white p-2 rounded shadow-inner border border-slate-100 overflow-hidden">
                             <img src="https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&q=80&w=400" className="w-full h-32 object-cover rounded opacity-80 group-hover:opacity-100 transition-opacity" alt="AI Scan Example" />
                        </div>
                    </div>
                    <div className="bg-brand-bg p-8 rounded-lg border border-slate-100 shadow-sm hover:shadow-lg hover:border-brand-gold/30 transition-all group text-center">
                        <div className="w-16 h-16 mx-auto bg-brand-graphite rounded-full flex items-center justify-center text-brand-gold text-2xl mb-6 shadow-lg group-hover:scale-110 transition-transform"><Shirt size={32} /></div>
                        <h3 className="font-serif text-xl font-bold text-brand-graphite mb-3">3. Looks em você</h3>
                        <p className="text-sm text-slate-500 mb-6">Visualize roupas aplicadas na sua foto e saiba exatamente o que comprar.</p>
                        <div className="bg-white p-2 rounded shadow-inner border border-slate-100 overflow-hidden">
                             <img src="https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&q=80&w=400" className="w-full h-32 object-cover rounded opacity-80 group-hover:opacity-100 transition-opacity" alt="Virtual Try On Example" />
                        </div>
                    </div>
                </div>
            </div>
        </section>

        {/* SEÇÃO: DIFERENCIAIS */}
        <section id="diferenciais" className="py-24 bg-brand-bg border-y border-slate-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    <div className="space-y-8">
                        <h2 className="font-serif text-4xl text-brand-graphite">Não é sobre moda.<br/>É sobre <span className="text-brand-gold italic">expressão pessoal</span>.</h2>
                        <div className="space-y-6">
                            <div className="flex gap-4">
                                <div className="w-12 h-12 bg-white border border-slate-200 rounded flex items-center justify-center text-brand-gold text-xl shadow-sm"><Scan size={24} /></div>
                                <div><h4 className="font-bold text-brand-graphite text-lg">Visagismo aplicado ao estilo</h4><p className="text-slate-500 text-sm">Analisamos as linhas do seu rosto para sugerir cortes que harmonizam, não que escondem.</p></div>
                            </div>
                            <div className="flex gap-4">
                                <div className="w-12 h-12 bg-white border border-slate-200 rounded flex items-center justify-center text-brand-gold text-xl shadow-sm"><Palette size={24} /></div>
                                <div><h4 className="font-bold text-brand-graphite text-lg">Colorimetria real, explicada</h4><p className="text-slate-500 text-sm">Entenda o porquê certas cores funcionam. Não apenas uma cartela, mas a teoria na prática.</p></div>
                            </div>
                            <div className="flex gap-4">
                                <div className="w-12 h-12 bg-white border border-slate-200 rounded flex items-center justify-center text-brand-gold text-xl shadow-sm"><Globe size={24} /></div>
                                <div><h4 className="font-bold text-brand-graphite text-lg">Pensado para diversidade brasileira</h4><p className="text-slate-500 text-sm">IA treinada em diversos tons de pele e tipos de corpo, fugindo do padrão eurocêntrico.</p></div>
                            </div>
                        </div>
                    </div>
                    <div className="relative">
                        <div className="absolute -inset-4 bg-brand-gold/10 rounded-lg transform rotate-2"></div>
                        <img 
                            src="https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=1000" 
                            alt="Mulher profissional sorrindo" 
                            className="relative rounded shadow-xl w-full aspect-[4/5] object-cover" 
                            crossOrigin="anonymous"
                        />
                    </div>
                </div>
            </div>
        </section>

        {/* SEÇÃO: PWA PROMO */}
        <section className="py-16 bg-slate-100">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col md:flex-row items-center">
                    <div className="w-full md:w-1/2 h-80 md:h-[400px] bg-slate-200 flex items-end justify-center relative overflow-hidden">
                        <img src="https://images.unsplash.com/photo-1512314889357-e157c22f938d?auto=format&fit=crop&q=80&w=800" className="absolute inset-0 w-full h-full object-cover opacity-60" alt="Mobile Consult" />
                        <div className="absolute inset-0 bg-gradient-to-t from-brand-graphite/40 to-transparent"></div>
                        <div className="w-48 bg-brand-graphite rounded-t-3xl border-4 border-brand-graphite border-b-0 shadow-2xl z-10 p-2 transform translate-y-4">
                            <div className="w-full h-full bg-white rounded-t-2xl overflow-hidden relative">
                                <div className="w-full h-8 bg-brand-bg flex items-center justify-center"><div className="w-12 h-3 bg-slate-200 rounded-full"></div></div>
                                <div className="p-4 flex flex-col items-center justify-center h-56">
                                    <div className="w-16 h-16 bg-brand-graphite text-brand-gold rounded-2xl flex items-center justify-center mb-4 shadow-lg"><span className="font-serif font-bold text-2xl">V</span></div>
                                    <p className="text-xs text-center text-slate-400 font-bold uppercase tracking-widest">Sua Ciência de Estilo</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="w-full md:w-1/2 p-8 md:p-12">
                        <span className="text-xs font-bold text-brand-graphite uppercase tracking-wider mb-2 block">Web App</span>
                        <h3 className="font-serif text-3xl font-bold text-brand-graphite mb-4 leading-tight">Tenha seu consultor de bolso disponível 24h.</h3>
                        <p className="text-slate-500 mb-8 leading-relaxed">Instale diretamente pelo navegador. Sem ocupar espaço, sem lojas de aplicativos, acesso instantâneo às suas análises e favoritos.</p>
                        <button onClick={onEnterApp} className="w-full bg-brand-graphite text-brand-gold py-4 rounded-xl font-bold hover:bg-slate-800 transition-colors flex items-center justify-center gap-3 shadow-lg"><Download size={20} /> Instalar Vizuhalizando</button>
                    </div>
                </div>
            </div>
        </section>

        {/* SEÇÃO: PLANOS */}
        <section id="planos" className="py-24 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="font-serif text-4xl text-brand-graphite mb-4">Escolha sua transformação</h2>
                    <p className="text-slate-500">Comece grátis, evolua quando quiser.</p>
                </div>
                <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    {/* Free Plan */}
                    <div className="border border-slate-200 rounded-2xl p-8 hover:border-slate-300 transition-colors bg-brand-bg">
                        <h3 className="font-serif text-2xl font-bold text-brand-graphite">Visitante</h3>
                        <p className="text-4xl font-bold text-slate-300 mt-4 mb-2">R$0</p>
                        <p className="text-xs text-slate-500 mb-8">Para sempre</p>
                        <ul className="space-y-4 mb-8">
                            <li className="flex items-center gap-3 text-sm text-slate-600"><Check size={16} className="text-brand-graphite" /> 1 Análise de coloração básica</li>
                            <li className="flex items-center gap-3 text-sm text-slate-600"><Check size={16} className="text-brand-graphite" /> Visualização de 1 Look</li>
                            <li className="flex items-center gap-3 text-sm text-slate-600"><Check size={16} className="text-brand-graphite" /> Teste de contraste</li>
                        </ul>
                        <button onClick={onEnterApp} className="w-full py-3 border border-brand-graphite text-brand-graphite rounded-xl hover:bg-slate-100 transition-colors font-bold">Começar Grátis</button>
                    </div>
                    {/* Premium Plan */}
                    <div className="border-2 border-brand-gold rounded-2xl p-8 bg-white shadow-2xl relative transform md:-translate-y-4">
                        <div className="absolute top-0 right-0 bg-brand-gold text-brand-graphite text-xs font-bold px-4 py-1.5 rounded-bl-xl rounded-tr-xl">RECOMENDADO</div>
                        <div className="flex items-center gap-2 mb-1"><h3 className="font-serif text-2xl font-bold text-brand-graphite">Premium</h3><Sparkles size={20} className="text-brand-gold" /></div>
                        <p className="text-4xl font-bold text-brand-graphite mt-4 mb-2">R$29,90</p>
                        <p className="text-xs text-slate-500 mb-8">Pagamento único (Acesso Vitalício)</p>
                        <ul className="space-y-4 mb-8">
                            <li className="flex items-center gap-3 text-sm text-brand-graphite font-medium"><Check size={16} className="text-brand-gold" /> Análise de Visagismo Completa</li>
                            <li className="flex items-center gap-3 text-sm text-brand-graphite font-medium"><Check size={16} className="text-brand-gold" /> Dossiê de Coloração Pessoal</li>
                            <li className="flex items-center gap-3 text-sm text-brand-graphite font-medium"><Check size={16} className="text-brand-gold" /> Looks Ilimitados na sua foto</li>
                            <li className="flex items-center gap-3 text-sm text-brand-graphite font-medium"><Check size={16} className="text-brand-gold" /> Exportação em PDF</li>
                        </ul>
                        <button onClick={onEnterApp} className="w-full py-4 bg-brand-gold text-brand-graphite rounded-xl hover:bg-brand-goldHover transition-colors font-bold shadow-lg shadow-brand-gold/30">Desbloquear Premium</button>
                    </div>
                </div>
            </div>
        </section>

        {/* SEÇÃO: CONFIANÇA */}
        <section className="py-12 bg-slate-50 border-t border-slate-200">
            <div className="max-w-4xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-8 text-center md:text-left">
                <div className="flex items-center gap-3 opacity-70 hover:opacity-100 transition-opacity">
                    <Lock size={24} className="text-brand-graphite" />
                    <div><p className="text-xs font-bold text-brand-graphite">DADOS PROTEGIDOS</p><p className="text-[10px] text-slate-500">Suas fotos não são compartilhadas</p></div>
                </div>
                <div className="flex items-center gap-3 opacity-70 hover:opacity-100 transition-opacity">
                    <Shield size={24} className="text-brand-graphite" />
                    <div><p className="text-xs font-bold text-brand-graphite">VOCÊ NO CONTROLE</p><p className="text-[10px] text-slate-500">Delete seus dados quando quiser</p></div>
                </div>
                <div className="flex items-center gap-3 opacity-70 hover:opacity-100 transition-opacity">
                    <CreditCard size={24} className="text-brand-graphite" />
                    <div><p className="text-xs font-bold text-brand-graphite">PAGAMENTO SEGURO</p><p className="text-[10px] text-slate-500">Processado via Stripe/MercadoPago</p></div>
                </div>
            </div>
        </section>

        {/* SEÇÃO: FINAL CTA */}
        <section className="py-32 bg-brand-graphite relative overflow-hidden flex items-center justify-center">
            <div 
                className="absolute inset-0 z-0 opacity-20 bg-cover bg-center"
                style={{ backgroundImage: "url('https://images.unsplash.com/photo-1441996832387-353006a88b50?auto=format&fit=crop&q=80&w=1200')" }}
            ></div>
            <div className="absolute inset-0 bg-brand-graphite/80 z-10"></div>
            <div className="max-w-3xl mx-auto px-4 text-center relative z-20">
                <h2 className="font-serif text-4xl md:text-6xl text-white mb-6 leading-tight">Veja seu estilo com outros olhos.</h2>
                <p className="text-slate-300 mb-12 text-lg md:text-xl font-light">Pare de imaginar como ficaria. Comece a vizuhalizar a melhor versão de você.</p>
                <button onClick={onEnterApp} className="px-12 py-5 bg-brand-gold text-brand-graphite text-lg font-bold rounded-xl shadow-2xl shadow-brand-gold/20 hover:scale-105 hover:bg-white transition-all duration-300 flex items-center justify-center gap-3 mx-auto">
                    Começar agora gratuitamente
                    <ChevronRight size={20} />
                </button>
            </div>
        </section>

        {/* FOOTER */}
        <footer className="bg-[#0f0f1a] py-16 border-t border-white/5">
            <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-8 text-sm text-slate-500">
                <div className="flex flex-col items-center md:items-start gap-4">
                    <div className="flex items-center gap-2 text-white font-serif text-xl font-bold">
                        <svg width="24" height="24" viewBox="0 0 40 40" fill="none"><path d="M10 4L20 36L30 4H24L20 20L16 4H10Z" fill="#FFFFFF"/></svg>
                        Vizuhalizando
                    </div>
                    <p className="max-w-xs text-center md:text-left">A primeira plataforma brasileira de análise de imagem sob medida com IA.</p>
                </div>
                <div className="flex flex-wrap justify-center gap-8">
                    <div className="flex flex-col gap-2">
                        <span className="text-white font-bold uppercase text-[10px] tracking-widest mb-2">Legal</span>
                        <button className="text-left hover:text-white transition-colors" onClick={() => openModal('terms')}>Termos de Uso</button>
                        <button className="text-left hover:text-white transition-colors" onClick={() => openModal('privacy')}>Privacidade</button>
                    </div>
                    <div className="flex flex-col gap-2">
                        <span className="text-white font-bold uppercase text-[10px] tracking-widest mb-2">Social</span>
                        <a href="#" className="hover:text-white transition-colors">Instagram</a>
                        <a href="https://wa.me/5511961226754" target="_blank" className="hover:text-brand-gold transition-colors flex items-center gap-1">WhatsApp</a>
                    </div>
                </div>
            </div>
            <div className="max-w-7xl mx-auto px-4 mt-12 pt-8 border-t border-white/5 text-center text-xs text-slate-600">
                © {new Date().getFullYear()} Vizuhalizando AI. Todos os direitos reservados.
            </div>
        </footer>

        {/* Video Modal */}
        {activeModal === 'video' && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-brand-graphite/90 backdrop-blur-md transition-opacity" onClick={closeModal}></div>
                <div className="relative w-full max-w-4xl p-2 animate-scale-up">
                    <button onClick={closeModal} className="absolute -top-12 right-0 text-white hover:text-brand-gold flex items-center gap-2 font-bold">Fechar <X size={24} /></button>
                    <div className="aspect-video bg-black rounded-2xl shadow-2xl overflow-hidden relative border border-white/10">
                        <iframe className="absolute inset-0 w-full h-full" src="https://www.youtube.com/embed/DaSKyQ7y4sU?autoplay=1&mute=1&controls=1&rel=0&modestbranding=1&loop=1" frameBorder="0" allow="autoplay; encrypted-media"></iframe>
                    </div>
                </div>
            </div>
        )}

        {/* Terms Modal */}
        {activeModal === 'terms' && (
            <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-brand-graphite/80 backdrop-blur-sm transition-opacity" onClick={closeModal}></div>
                <div className="relative w-full max-w-2xl h-[80vh] bg-white rounded-3xl shadow-2xl animate-scale-up flex flex-col overflow-hidden">
                    <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50"><h3 className="font-serif text-2xl text-brand-graphite">Termos de Uso</h3><button onClick={closeModal} className="p-2 hover:bg-slate-200 rounded-full transition-colors"><X size={24} /></button></div>
                    <div className="p-8 overflow-y-auto flex-1 prose prose-slate">
                        <h4>1. Aceitação dos Termos</h4><p>Ao acessar e usar o Vizuhalizando, você concorda em cumprir estes termos.</p>
                        <h4>2. Descrição do Serviço</h4><p>O Vizuhalizando utiliza inteligência artificial para fornecer análises de estilo.</p>
                        <h4>3. Responsabilidade</h4><p>Você é responsável por fornecer imagens reais e adequadas.</p>
                        <h4>4. Limitação</h4><p>A análise é uma sugestão baseada em algoritmos, não uma ciência exata.</p>
                    </div>
                    <div className="p-6 border-t border-slate-100 bg-slate-50 rounded-b-2xl flex justify-end"><button onClick={closeModal} className="px-8 py-3 bg-brand-graphite text-white rounded-xl font-bold">Entendi</button></div>
                </div>
            </div>
        )}

        {/* Privacy Modal */}
        {activeModal === 'privacy' && (
            <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-brand-graphite/80 backdrop-blur-sm transition-opacity" onClick={closeModal}></div>
                <div className="relative w-full max-w-2xl h-[80vh] bg-white rounded-3xl shadow-2xl animate-scale-up flex flex-col overflow-hidden">
                    <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50"><h3 className="font-serif text-2xl text-brand-graphite">Privacidade</h3><button onClick={closeModal} className="p-2 hover:bg-slate-200 rounded-full transition-colors"><X size={24} /></button></div>
                    <div className="p-8 overflow-y-auto flex-1 prose prose-slate">
                        <h4>1. Coleta de Dados</h4><p>Coletamos apenas as imagens que você envia para análise temporária.</p>
                        <h4>2. Uso das Imagens</h4><p>Não vendemos nem compartilhamos suas fotos com terceiros. As fotos são usadas exclusivamente para gerar sua análise.</p>
                        <h4>3. Segurança</h4><p>Utilizamos criptografia de ponta a ponta e gateways de pagamento seguros.</p>
                    </div>
                    <div className="p-6 border-t border-slate-100 bg-slate-50 rounded-b-2xl flex justify-end"><button onClick={closeModal} className="px-8 py-3 bg-brand-graphite text-white rounded-xl font-bold">Entendi</button></div>
                </div>
            </div>
        )}
    </div>
  );
};
