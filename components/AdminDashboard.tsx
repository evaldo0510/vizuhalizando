
import React, { useState, useEffect } from 'react';
import { 
  BarChart3, Users, DollarSign, FileText, 
  ArrowUpRight, Download, Search, Filter,
  ShieldCheck, Star, Calendar, Key, Settings as SettingsIcon,
  Zap, AlertCircle, Video, Loader2, Play, Sparkles
} from 'lucide-react';
import { db } from '../services/database';
import { generatePromoVideo } from '../services/videoService';

export const AdminDashboard = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'stats' | 'settings' | 'creative'>('stats');
  
  // States para Geração de Vídeo
  const [videoPrompt, setVideoPrompt] = useState("High-end luxury fashion atelier, digital interface showing AI face mapping and virtual try-on, luxury atmosphere, 4k cinematic, professional lighting");
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await db.getAdminStats();
        setStats(data);
      } catch (error) {
        console.error("Erro ao carregar estatísticas do admin:", error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Added mandatory API key selection check as per Veo video generation guidelines
  const handleGenerateVideo = async () => {
    setIsGeneratingVideo(true);
    setGeneratedVideoUrl(null);
    try {
      // Guideline: Check whether an API key has been selected before using Veo models
      if (typeof (window as any).aistudio !== 'undefined' && !(await (window as any).aistudio.hasSelectedApiKey())) {
          await (window as any).aistudio.openSelectKey();
          // Proceed as per guideline: assume the key selection was successful after triggering openSelectKey()
      }

      const url = await generatePromoVideo(videoPrompt);
      setGeneratedVideoUrl(url);
    } catch (error: any) {
      // Guideline: If the request fails with "Requested entity was not found.", reset the key selection state
      if (error.message?.includes("Requested entity was not found.") && typeof (window as any).aistudio !== 'undefined') {
          await (window as any).aistudio.openSelectKey();
      }
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
        <div className="bg-white p-1.5 rounded-2xl shadow-sm border border-slate-100 flex gap-1">
           <button onClick={() => setActiveTab('stats')} className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${activeTab === 'stats' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}>
             <BarChart3 size={16}/> Estatísticas
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
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
             <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                   <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl"><Users size={20}/></div>
                   <span className="text-[10px] font-bold text-green-500">+12%</span>
                </div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Usuários</p>
                <h4 className="text-2xl font-bold text-brand-graphite">{stats.totalUsuarios}</h4>
             </div>
             <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                   <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl"><FileText size={20}/></div>
                   <span className="text-[10px] font-bold text-green-500">+8%</span>
                </div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Análises</p>
                <h4 className="text-2xl font-bold text-brand-graphite">{stats.totalAnalises}</h4>
             </div>
             <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                   <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl"><Star size={20}/></div>
                   <span className="text-[10px] font-bold text-green-500">+5%</span>
                </div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Premium</p>
                <h4 className="text-2xl font-bold text-brand-graphite">{stats.totalPremium}</h4>
             </div>
             <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                   <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl"><DollarSign size={20}/></div>
                   <span className="text-[10px] font-bold text-green-500">+15%</span>
                </div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Receita</p>
                <h4 className="text-2xl font-bold text-brand-graphite">R$ {stats.faturamentoTotal.toFixed(2)}</h4>
             </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
             <div className="p-6 border-b border-slate-50 flex justify-between items-center">
                <h4 className="font-bold text-brand-graphite">Usuários Recentes</h4>
                <button className="text-xs font-bold text-indigo-600">Ver Todos</button>
             </div>
             <div className="overflow-x-auto">
                <table className="w-full text-left">
                   <thead className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      <tr>
                         <th className="px-6 py-4">Usuário</th>
                         <th className="px-6 py-4">Email</th>
                         <th className="px-6 py-4">Status</th>
                         <th className="px-6 py-4">Créditos</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-50">
                      {stats.usuarios.map((u: any) => (
                         <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-6 py-4 flex items-center gap-3">
                               <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-xs">
                                  {u.nome[0]}
                               </div>
                               <span className="text-sm font-bold text-brand-graphite">{u.nome}</span>
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-500">{u.email}</td>
                            <td className="px-6 py-4">
                               {u.isPremium ? 
                                 <span className="px-2 py-1 bg-green-50 text-green-600 rounded-full text-[10px] font-bold">PREMIUM</span> :
                                 <span className="px-2 py-1 bg-slate-50 text-slate-400 rounded-full text-[10px] font-bold">FREE</span>
                               }
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

      {activeTab === 'creative' && (
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
           <div className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-xl">
              <div className="flex items-center gap-4 mb-8">
                 <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl"><Video size={24}/></div>
                 <div>
                    <h3 className="text-xl font-serif font-bold text-brand-graphite">Gerador de Vídeo Promocional</h3>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Powered by Veo 3.1 Luxury Engine</p>
                 </div>
              </div>

              <div className="space-y-6">
                 <div className="space-y-3">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-2">Direção de Cena (Prompt)</label>
                    <textarea 
                      value={videoPrompt}
                      onChange={(e) => setVideoPrompt(e.target.value)}
                      className="w-full p-5 bg-slate-50 border border-slate-100 rounded-3xl text-sm outline-none focus:ring-2 focus:ring-purple-500 min-h-[120px]"
                    />
                 </div>

                 <button 
                   onClick={handleGenerateVideo}
                   disabled={isGeneratingVideo}
                   className="w-full py-5 bg-purple-600 text-white rounded-2xl font-bold flex items-center justify-center gap-4 hover:bg-purple-700 transition-all shadow-xl disabled:opacity-50"
                 >
                    {isGeneratingVideo ? <><Loader2 className="animate-spin" size={20}/> GERANDO VÍDEO (Pode levar 2-3 minutos)...</> : <><Sparkles size={20}/> GERAR NOVO VÍDEO VEO</>}
                 </button>

                 {generatedVideoUrl && (
                   <div className="mt-10 space-y-4 animate-fade-in">
                      <div className="aspect-video rounded-3xl overflow-hidden bg-black shadow-2xl border-4 border-white">
                         <video src={generatedVideoUrl} controls className="w-full h-full" />
                      </div>
                      <div className="flex justify-between items-center p-4 bg-purple-50 rounded-2xl border border-purple-100">
                         <span className="text-xs font-bold text-purple-700">Vídeo Gerado com Sucesso!</span>
                         <a href={generatedVideoUrl} download className="text-purple-600 hover:underline text-xs font-bold">Download MP4</a>
                      </div>
                   </div>
                 )}
              </div>
           </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="max-w-2xl mx-auto">
           <div className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-xl">
              <h3 className="text-xl font-serif font-bold text-brand-graphite mb-8">Configurações de API</h3>
              <div className="space-y-6">
                 <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Instruções Billing Gemini</p>
                    <p className="text-sm text-slate-600 leading-relaxed">
                       Para utilizar os modelos Veo e Gemini 3.1 Pro, é necessário vincular uma conta de faturamento do Google Cloud.
                    </p>
                    <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-2 text-indigo-600 font-bold text-xs">
                       Documentação de Faturamento <ArrowUpRight size={14}/>
                    </a>
                 </div>
                 <button className="w-full py-4 border-2 border-slate-200 text-slate-500 rounded-2xl font-bold uppercase tracking-widest text-[10px] hover:bg-slate-50 transition-all">
                    Resetar Cache do Atelier
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};
