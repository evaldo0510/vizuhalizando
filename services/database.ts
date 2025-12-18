
import { supabase } from './supabase';
import type { AnalysisResult } from '../types';

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  foto_perfil?: string;
  nivel_acesso: 'user' | 'admin';
  data_cadastro: string;
  isPremium?: boolean;
  creditos: number;
}

export interface Analise {
  id: number;
  usuario_id: string;
  foto_url: string;
  resultado_json: AnalysisResult;
  data_analise: string;
}

export interface CreditPackage {
  id: string;
  credits: number;
  price: number;
  name: string;
}

const ADMIN_EMAILS = ['evaldo0510@gmail.com', 'aljariristartups@gmail.com'];

class HybridDatabase {
  private isAdmin(email: string = ''): boolean {
    return ADMIN_EMAILS.includes(email.toLowerCase());
  }

  private getLocalTable<T>(tableName: string): T[] {
    try {
      const data = localStorage.getItem(`vizu_db_${tableName}`);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error(`Erro ao ler tabela ${tableName}`, e);
      return [];
    }
  }

  private saveLocalTable<T>(tableName: string, data: T[]) {
    localStorage.setItem(`vizu_db_${tableName}`, JSON.stringify(data));
  }

  async syncGoogleUser(googleUser: any): Promise<Usuario> {
    const email = googleUser.email || '';
    const role = this.isAdmin(email) ? 'admin' : 'user';
    const usuarios = this.getLocalTable<Usuario>('usuarios');
    let user = usuarios.find(u => u.email === email);
    
    const userData: Usuario = {
      id: googleUser.uid || googleUser.id,
      nome: googleUser.displayName || googleUser.user_metadata?.full_name || "Usuário",
      email: email,
      foto_perfil: googleUser.photoURL || googleUser.user_metadata?.avatar_url,
      nivel_acesso: role,
      data_cadastro: user?.data_cadastro || new Date().toISOString(),
      creditos: user ? user.creditos : 1 
    };

    const filteredUsers = usuarios.filter(u => u.email !== email);
    this.saveLocalTable('usuarios', [...filteredUsers, userData]);
    this.setCurrentUser(userData);
    return userData;
  }

  async useCredit(userId: string): Promise<boolean> {
    const usuarios = this.getLocalTable<Usuario>('usuarios');
    const userIdx = usuarios.findIndex(u => u.id === userId);
    if (userIdx === -1) return false;

    const user = usuarios[userIdx];
    const isPremium = localStorage.getItem(`premium_${userId}`) === 'true';
    if (isPremium || this.isAdmin(user.email)) return true;

    if (user.creditos > 0) {
      user.creditos -= 1;
      usuarios[userIdx] = user;
      this.saveLocalTable('usuarios', usuarios);
      this.setCurrentUser(user);
      return true;
    }
    return false;
  }

  async addCredits(userId: string, amount: number): Promise<void> {
    const usuarios = this.getLocalTable<Usuario>('usuarios');
    const userIdx = usuarios.findIndex(u => u.id === userId);
    if (userIdx === -1) return;

    usuarios[userIdx].creditos += amount;
    this.saveLocalTable('usuarios', usuarios);
    this.setCurrentUser(usuarios[userIdx]);
  }

  async forcePremium(userId: string): Promise<void> {
    localStorage.setItem(`premium_${userId}`, 'true');
  }

  async saveAnalise(usuario_id: string, foto_url: string, resultado: AnalysisResult): Promise<Analise> {
    const analises = this.getLocalTable<Analise>('analises');
    const newAnalise: Analise = {
      id: Date.now(),
      usuario_id,
      foto_url,
      resultado_json: resultado,
      data_analise: new Date().toISOString()
    };
    analises.push(newAnalise);
    this.saveLocalTable('analises', analises);
    return newAnalise;
  }

  async updateAnaliseFeedback(analiseId: number, outfitIdx: number, feedback: 'like' | 'dislike' | null): Promise<void> {
    const analises = this.getLocalTable<Analise>('analises');
    const index = analises.findIndex(a => a.id === analiseId);
    if (index === -1) return;

    const analise = analises[index];
    if (analise.resultado_json.sugestoes_roupa[outfitIdx]) {
      analise.resultado_json.sugestoes_roupa[outfitIdx].feedback = feedback;
      analises[index] = analise;
      this.saveLocalTable('analises', analises);
    }
  }

  async getUserAnalyses(usuario_id: string): Promise<Analise[]> {
    return this.getLocalTable<Analise>('analises')
      .filter(a => a.usuario_id === usuario_id)
      .sort((a, b) => new Date(b.data_analise).getTime() - new Date(a.data_analise).getTime());
  }

  async getCurrentUser(): Promise<Usuario | null> {
    const data = localStorage.getItem('vizu_session_user');
    if (!data) return null;
    try {
      return JSON.parse(data);
    } catch {
      return null;
    }
  }

  setCurrentUser(user: Usuario | null) {
      if (user) {
        localStorage.setItem('vizu_session_user', JSON.stringify(user));
      } else {
        localStorage.removeItem('vizu_session_user');
      }
  }

  async logout() {
    this.setCurrentUser(null);
  }

  async getAdminStats() {
    const usuarios = this.getLocalTable<Usuario>('usuarios');
    const analises = this.getLocalTable<Analise>('analises');
    const premiumUsers = usuarios.filter(u => localStorage.getItem(`premium_${u.id}`) === 'true');
    const totalGanhos = premiumUsers.length * 29.90; 

    return {
      totalUsuarios: usuarios.length,
      totalAnalises: analises.length,
      totalPremium: premiumUsers.length,
      faturamentoTotal: totalGanhos,
      usuarios: usuarios.map(u => ({
        ...u,
        isPremium: localStorage.getItem(`premium_${u.id}`) === 'true'
      }))
    };
  }

  async getCreditPackages(): Promise<CreditPackage[]> {
    const packages = localStorage.getItem('vizu_credit_packages');
    return packages ? JSON.parse(packages) : [
      { id: '1', name: 'Single Pack', credits: 1, price: 4.90 },
      { id: '2', name: 'Essential Pack', credits: 5, price: 14.90 },
      { id: '3', name: 'Premium Pack', credits: 12, price: 24.90 }
    ];
  }

  async saveCreditPackages(packages: CreditPackage[]): Promise<void> {
    localStorage.setItem('vizu_credit_packages', JSON.stringify(packages));
  }
}

export const db = new HybridDatabase();
