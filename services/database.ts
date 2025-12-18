
import { supabase } from './supabase';
import type { AnalysisResult, UserRole } from '../types';

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  foto_perfil?: string;
  nivel_acesso: 'user' | 'admin';
  data_cadastro: string;
  isPremium?: boolean;
}

export interface Analise {
  id: number;
  usuario_id: string;
  foto_url: string;
  resultado_json: AnalysisResult;
  data_analise: string;
}

const ADMIN_EMAILS = ['evaldo0510@gmail.com', 'aljariristartups@gmail.com'];

class HybridDatabase {
  private isAdmin(email: string): boolean {
    return ADMIN_EMAILS.includes(email.toLowerCase());
  }

  private getLocalTable<T>(tableName: string): T[] {
    const data = localStorage.getItem(`vizu_db_${tableName}`);
    return data ? JSON.parse(data) : [];
  }

  private saveLocalTable<T>(tableName: string, data: T[]) {
    localStorage.setItem(`vizu_db_${tableName}`, JSON.stringify(data));
  }

  async syncGoogleUser(googleUser: any): Promise<Usuario> {
    const email = googleUser.email;
    const role = this.isAdmin(email) ? 'admin' : 'user';
    const usuarios = this.getLocalTable<Usuario>('usuarios');
    let user = usuarios.find(u => u.email === email);
    
    const userData: Usuario = {
      id: googleUser.uid || googleUser.id,
      nome: googleUser.displayName || googleUser.user_metadata?.full_name || "Usuário",
      email: email,
      foto_perfil: googleUser.photoURL || googleUser.user_metadata?.avatar_url,
      nivel_acesso: role,
      data_cadastro: user?.data_cadastro || new Date().toISOString()
    };

    if (!user || user.nome !== userData.nome || user.foto_perfil !== userData.foto_perfil) {
      const filteredUsers = usuarios.filter(u => u.email !== email);
      this.saveLocalTable('usuarios', [...filteredUsers, userData]);
    }

    this.setCurrentUser(userData);
    return userData;
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

  /**
   * Atualiza o feedback de um look específico dentro de uma análise.
   */
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

  /**
   * Gera um resumo textual das preferências do usuário baseado no histórico de feedbacks.
   */
  async getUserFeedbackSummary(usuario_id: string): Promise<string> {
    const analises = await this.getUserAnalyses(usuario_id);
    const likes: string[] = [];
    const dislikes: string[] = [];

    analises.forEach(a => {
      a.resultado_json.sugestoes_roupa?.forEach(look => {
        if (look.feedback === 'like') likes.push(`${look.titulo} (${look.detalhes.slice(0, 30)}...)`);
        if (look.feedback === 'dislike') dislikes.push(`${look.titulo}`);
      });
    });

    if (likes.length === 0 && dislikes.length === 0) return "Nenhum feedback prévio.";

    return `
      Histórico de Preferências:
      - O usuário GOSTOU de: ${likes.join(', ')}.
      - O usuário NÃO GOSTOU de: ${dislikes.join(', ')}.
      Priorize elementos similares aos que ele gostou e evite os que ele rejeitou.
    `;
  }

  async getUserAnalyses(usuario_id: string): Promise<Analise[]> {
    return this.getLocalTable<Analise>('analises')
      .filter(a => a.usuario_id === usuario_id)
      .sort((a, b) => new Date(b.data_analise).getTime() - new Date(a.data_analise).getTime());
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
}

export const db = new HybridDatabase();
