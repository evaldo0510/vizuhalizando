
import React, { useState, useEffect } from 'react';
import { 
  BarChart3, Users, DollarSign, FileText, 
  ArrowUpRight, Download, Search, Filter,
  ShieldCheck, Star, Calendar
} from 'lucide-react';
import { db } from '../services/database';

export const AdminDashboard = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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

  if (loading || !stats) return (
    <div className="flex flex-col items-center justify-center py-20 animate-pulse">
      <BarChart3 className="w-12 h-12 text-slate-300 mb-4" />
      <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Carregando Atelier Metrics...</p>
    </div>
  );

  return (
    <div className="w-full max-w-6xl animate-fade-in space-y-8 pb-20">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-green-50 text-green-600 rounded-xl"><DollarSign size={20}/></div>
            <span className="text-[10px] font-bold text-green-500 bg-green-50 px-2 py-0.5 rounded-full">+12%</span>
          </div>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Faturamento Total</p>
          <h3 className="text-2xl font-bold text-slate-800 mt-1">R$ {stats.faturamentoTotal?.toFixed(2) || "0.00"}</h3>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl"><Users size={20}/></div>
          </div>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Usuários Ativos</p>
          <h3 className="text-2xl font-bold text-slate-800 mt-1">{stats.totalUsuarios || 0}</h3>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl"><Star size={20}/></div>
          </div>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Membros Premium</p>
          <h3 className="text-2xl font-bold text-slate-800 mt-1">{stats.totalPremium || 0}</h3>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-slate-50 text-slate-600 rounded-xl"><FileText size={20}/></div>
          </div>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Total Análises IA</p>
          <h3 className="text-2xl font-bold text-slate-800 mt-1">{stats.totalAnalises || 0}</h3>
        </div>
      </div>

      {/* Spreadsheet View */}
      <div className="bg-white rounded-[40px] border border-slate-100 shadow-xl overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h2 className="text-2xl font-serif font-bold text-slate-800">Planilha de Gestão</h2>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Controle de Acessos e Vendas</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4" />
              <input type="text" placeholder="Buscar e-mail..." className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-gold/30" />
            </div>
            <button className="p-2 bg-slate-50 text-slate-400 rounded-xl hover:text-brand-gold transition-colors"><Download size={20}/></button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Usuário</th>
                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Cadastro</th>
                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Role</th>
                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {/* Fix: Added safe navigation for mapping users */}
              {stats.usuarios?.map((u: any) => (
                <tr key={u.id} className="hover:bg-slate-50/30 transition-colors">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 overflow-hidden">
                        {u.foto_perfil ? <img src={u.foto_perfil} /> : <div className="w-full h-full flex items-center justify-center font-bold text-slate-400">{u.nome?.[0] || "?"}</div>}
                      </div>
                      <div>
                        <p className="font-bold text-slate-700 text-sm">{u.nome}</p>
                        <p className="text-xs text-slate-400">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    {u.isPremium ? (
                      <span className="px-3 py-1 bg-amber-50 text-amber-600 text-[10px] font-bold rounded-full border border-amber-100 flex items-center gap-1 w-fit">
                        <Star size={10} fill="currentColor" /> PREMIUM
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-slate-100 text-slate-400 text-[10px] font-bold rounded-full w-fit block">FREE</span>
                    )}
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2 text-slate-500 text-xs">
                      <Calendar size={14} />
                      {new Date(u.data_cadastro).toLocaleDateString('pt-BR')}
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    {u.nivel_acesso === 'admin' ? (
                      <span className="text-brand-gold font-bold text-[10px] uppercase tracking-tighter flex items-center gap-1">
                        <ShieldCheck size={14} /> ADMINISTRADOR
                      </span>
                    ) : (
                      <span className="text-slate-400 text-[10px] font-bold uppercase tracking-tighter">CLIENTE</span>
                    )}
                  </td>
                  <td className="px-8 py-5">
                    <button className="text-slate-300 hover:text-slate-600 transition-colors"><ArrowUpRight size={18}/></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
