
import React, { useState, useEffect } from 'react';
import { 
  BarChart3, Users, DollarSign, FileText, 
  Settings as SettingsIcon,
  Video, Loader2, Sparkles, Coins, Plus, Trash2, Save, CreditCard, Tag,
  Star, Zap
} from 'lucide-react';
import { db, CreditPackage } from '../services/database';
import { generatePromoVideo } from '../services/videoService';

export const AdminDashboard = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'stats' | 'settings' | 'creative' | 'monetization'>('stats');
  const [creditPackages, setCreditPackages] = useState<CreditPackage[]>([]);
  
  const [videoPrompt, setVideoPrompt] = useState("High-end luxury fashion atelier, digital interface showing AI face mapping and virtual try-on, luxury atmosphere, 4k cinematic, professional lighting");
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await db.getAdminStats();
        setStats(data);
        const packs = await db.getCreditPackages();
        setCreditPackages(packs);
      } catch (error) {
        console.error("Erro ao carregar estatísticas do admin:", error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleSavePackages = async () => {
    try {
      await db.saveCreditPackages(creditPackages);
      alert("Pacotes de créditos configurados e salvos com sucesso!");
    } catch (err) {
      alert("Erro ao salvar configurações de monetização.");
    }
  };

  const addPackage = () => {
    setCreditPackages([
      ...creditPackages, 
      { id: Date.now().toString(), name: 'Novo Pacote', credits: 1, price: 9.90 }
    ]);
  };

  const updatePackage = (id: string, field: keyof CreditPackage, value: any) => {
    setCreditPackages(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const removePackage = (id: string) => {
    if (confirm("Deseja realmente remover este pacote?")) {
      setCreditPackages(prev => prev.filter(p => p.id !== id));
    }
  };

  const handleGenerateVideo = async () => {
    setIsGeneratingVideo(true);
    setGeneratedVideoUrl(null);
    try {
      if (typeof (window as any).aistudio !== 'undefined' && !(await (window as any).aistudio.hasSelectedApiKey())) {
          await (window as any).aistudio.openSelectKey();
      }
      const url = await generatePromoVideo(videoPrompt);
      setGeneratedVideoUrl(url);
    } catch (error: any) {
      console.error("Video Generation Error:", error);
      alert(error.message || "Erro ao gerar vídeo promocional.");
    } finally {
      setIsGeneratingVideo(false);
    }
  };

  if (loading || !stats) return (
    <div className="flex flex-col items-center justify-center py-20 animate-pulse">
      <BarChart3 className="w-12 h-12 text-slate-300 mb-4" />
      <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Carregando Atelier Metrics...</p>
    </div>
  );

  return (
    <div className="w-full max-w-6xl animate-fade-in space-y-8 pb-20">
      <div className="flex justify-center mb-8">
        <div className="bg-white p-1.5 rounded-2xl shadow-sm border border-slate-100 flex flex-wrap gap-1">
           <button onClick={() => setActiveTab('stats')} className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${activeTab === 'stats' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}>
             <BarChart3 size={16}/> Estatísticas
           </button>
           <button onClick={() => setActiveTab('monetization')} className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${activeTab === 'monetization' ? 'bg-brand-gold text-brand-graphite shadow-sm' : 'text-slate-400'}`}>
             <Coins size={16}/> Monetização
           </button>
           <button onClick={() => setActiveTab('creative')} className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${activeTab === 'creative' ? 'bg-purple-600 text-white' : 'text-slate-400'}`}>
             <Video size={16}/> IA Creative
           </button>
           <button onClick={() => setActiveTab('settings')} className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${activeTab === 'settings' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}>
             <SettingsIcon size={16}/> Configurações
           </button>
        </div>
      </div>

      {activeTab === 'stats' && (
        <div className="space-y-8 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
             <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                   <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl"><Users size={20}/></div>
                </div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Usuários Totais</p>
                <h4 className="text-2xl font-bold text-brand-graphite">{stats.totalUsuarios}</h4>
             </div>
             <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                   <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl"><FileText size={20}/></div>
                </div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Análises Realizadas</p>
                <h4 className="text-2xl font-bold text-brand-graphite">{stats.totalAnalises}</h4>
             </div>
             <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                   {/* Fix: Usage of missing Star icon */}
                   <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl"><Star size={20}/></div>
                </div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Membros Pro</p>
                <h4 className="text-2xl font-bold text-brand-graphite">{stats.totalPremium}</h4>
             </div>
             <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                   <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl"><DollarSign size={20}/></div>
                </div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Faturamento Est.</p>
                <h4 className="text-2xl font-bold text-brand-graphite">R$ {stats.faturamentoTotal.toFixed(2)}</h4>
             </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
             <div className="p-6 border-b border-slate-50">
                <h4 className="font-bold text-brand-graphite">Base de Usuários</h4>
             </div>
             <div className="overflow-x-auto">
                <table className="w-full text-left">
                   <thead className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      <tr>
                         <th className="px-6 py-4">Usuário</th>
                         <th className="px-6 py-4">Email</th>
                         <th className="px-6 py-4">Acesso</th>
                         <th className="px-6 py-4">Créditos</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-50">
                      {stats.usuarios.map((u: any) => (
                         <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-6 py-4 flex items-center gap-3">
                               <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs">
                                  {u.nome[0]}
                               </div>
                               <span className="text-sm font-bold text-brand-graphite">{u.nome}</span>
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-500">{u.email}</td>
                            <td className="px-6 py-4">
                               <span className={`px-2 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider ${u.isPremium ? 'bg-brand-gold/20 text-brand-gold' : 'bg-slate-100 text-slate-400'}`}>
                                 {u.isPremium ? 'PRO' : 'Membro'}
                               </span>
                            </td>
                            <td className="px-6 py-4 text-sm font-bold text-slate-600">{u.creditos}</td>
                         </tr>
                      ))}
                   </tbody>
                </table>
             </div>
          </div>
        </div>
      )}

      {activeTab === 'monetization' && (
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
           <div className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-xl">
              <div className="flex justify-between items-center mb-10">
                 <div className="flex items-center gap-4">
                    <div className="p-3 bg-brand-gold/10 text-brand-gold rounded-2xl"><CreditCard size={24}/></div>
                    <div>
                       <h3 className="text-2xl font-serif font-bold text-brand-graphite leading-tight">Gestão de Créditos</h3>
                       <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Configure pacotes e preços para o Atelier</p>
                    </div>
                 </div>
                 <button onClick={addPackage} className="px-5 py-2.5 bg-brand-graphite text-white rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-brand-gold transition-all shadow-lg active:scale-95"><Plus size={16}/> Adicionar Pacote</button>
              </div>

              <div className="space-y-4 mb-10">
                 {creditPackages.map((pack) => (
                    <div key={pack.id} className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex flex-col md:flex-row gap-6 items-center group transition-all hover:border-brand-gold/30">
                       <div className="flex-1 w-full space-y-2">
                          <label className="flex items-center gap-2 text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1"><Tag size={12}/> Nome do Pacote</label>
                          <input 
                            type="text" 
                            value={pack.name} 
                            onChange={(e) => updatePackage(pack.id, 'name', e.target.value)}
                            placeholder="Ex: Essential Pack"
                            className="w-full bg-white p-4 rounded-2xl border border-slate-200 text-sm font-bold focus:ring-2 focus:ring-brand-gold outline-none transition-all"
                          />
                       </div>
                       <div className="w-full md:w-40 space-y-2">
                          <label className="flex items-center gap-2 text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1"><Coins size={12}/> Créditos</label>
                          <input 
                            type="number" 
                            value={pack.credits} 
                            onChange={(e) => updatePackage(pack.id, 'credits', parseInt(e.target.value))}
                            className="w-full bg-white p-4 rounded-2xl border border-slate-200 text-sm font-bold focus:ring-2 focus:ring-brand-gold outline-none transition-all"
                          />
                       </div>
                       <div className="w-full md:w-40 space-y-2">
                          <label className="flex items-center gap-2 text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1"><DollarSign size={12}/> Preço (R$)</label>
                          <input 
                            type="number" 
                            step="0.01"
                            value={pack.price} 
                            onChange={(e) => updatePackage(pack.id, 'price', parseFloat(e.target.value))}
                            className="w-full bg-white p-4 rounded-2xl border border-slate-200 text-sm font-bold focus:ring-2 focus:ring-brand-gold outline-none transition-all"
                          />
                       </div>
                       <button onClick={() => removePackage(pack.id)} className="p-4 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all mt-4 md:mt-0"><Trash2 size={22}/></button>
                    </div>
                 ))}
                 
                 {creditPackages.length === 0 && (
                   <div className="py-20 text-center border-2 border-dashed border-slate-100 rounded-[40px]">
                      <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Nenhum pacote configurado</p>
                   </div>
                 )}
              </div>

              <button onClick={handleSavePackages} className="w-full py-6 bg-brand-graphite text-brand-gold rounded-[32px] font-black uppercase tracking-[0.2em] text-[11px] flex items-center justify-center gap-4 shadow-2xl hover:bg-brand-gold hover:text-brand-graphite transition-all group">
                <Save size={20} className="group-hover:scale-125 transition-transform" /> Salvar Configurações de Monetização
              </button>
           </div>
        </div>
      )}

      {activeTab === 'creative' && (
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
           <div className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-xl">
              <div className="flex items-center gap-4 mb-8">
                 <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl"><Video size={24}/></div>
                 <div>
                    <h3 className="text-xl font-serif font-bold text-brand-graphite">Estúdio de Marketing (VEO)</h3>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Gere conteúdos de vídeo para promoção do Atelier</p>
                 </div>
              </div>

              <div className="space-y-6">
                 <textarea 
                   value={videoPrompt}
                   onChange={(e) => setVideoPrompt(e.target.value)}
                   placeholder="Descreva o vídeo promocional..."
                   className="w-full p-6 bg-slate-50 border border-slate-100 rounded-3xl text-sm min-h-[140px] font-medium text-slate-600 outline-none focus:ring-2 focus:ring-purple-200"
                 />
                 <button 
                   onClick={handleGenerateVideo}
                   disabled={isGeneratingVideo}
                   className="w-full py-6 bg-purple-600 text-white rounded-3xl font-black uppercase tracking-widest flex items-center justify-center gap-4 shadow-xl disabled:opacity-50 active:scale-[0.98] transition-transform"
                 >
                    {isGeneratingVideo ? <><Loader2 className="animate-spin" size={24}/> PROCESSANDO...</> : <><Zap size={24}/> GERAR TEASER CINEMÁTICO</>}
                 </button>
                 {generatedVideoUrl && (
                   <div className="mt-10 aspect-video rounded-[32px] overflow-hidden bg-black shadow-2xl border-8 border-white group relative">
                      <video src={generatedVideoUrl} controls className="w-full h-full" />
                      <div className="absolute top-6 left-6 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold text-white uppercase tracking-widest">Preview HD</div>
                   </div>
                 )}
              </div>
           </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="max-w-2xl mx-auto animate-fade-in">
           <div className="bg-white p-12 rounded-[50px] border border-slate-100 shadow-xl">
              <h3 className="text-2xl font-serif font-bold text-brand-graphite mb-8">Administração do Atelier</h3>
              <div className="space-y-6">
                 <div className="p-6 bg-indigo-50/50 rounded-3xl border border-indigo-100">
                    {/* Fix: Usage of missing Zap icon */}
                    <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2"><Zap size={14}/> Engine Status</p>
                    <p className="text-sm text-indigo-900 leading-relaxed font-medium">Os modelos Gemini 3 Pro e Veo requerem um projeto Google Cloud com faturamento ativado para operar em escala.</p>
                 </div>
                 <button className="w-full py-6 border-2 border-slate-100 text-slate-400 rounded-[32px] font-bold uppercase tracking-widest text-[11px] hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-all">Limpar Banco de Dados Local</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};
