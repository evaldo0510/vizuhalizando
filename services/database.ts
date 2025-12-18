
import { supabase } from './supabase';
import type { AnalysisResult, UserRole } from '../types';

export interface Usuario {
  id: string; // Supabase usa UUID
  nome: string;
  email: string;
  foto_perfil?: string;
  nivel_acesso: 'user' | 'admin';
  data_cadastro: string;
}

export interface Analise {
  id: number;
  usuario_id: string;
  foto_url: string;
  resultado_json: AnalysisResult;
  data_analise: string;
}

class SupabaseDatabase {
  // --- AUTH METHODS ---

  async registerUser(nome: string, email: string, senha_plana: string, role: UserRole = 'client') {
    const { data, error } = await supabase.auth.signUp({
      email,
      password: senha_plana,
      options: {
        data: {
          full_name: nome,
          role: role
        }
      }
    });

    if (error) throw error;
    if (!data.user) throw new Error("Erro ao criar usuário.");

    return {
        id: data.user.id,
        nome: data.user.user_metadata.full_name,
        email: data.user.email!,
        nivel_acesso: 'user',
        data_cadastro: data.user.created_at
    };
  }

  async loginUser(email: string, senha_plana: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: senha_plana
    });

    if (error) throw error;
    if (!data.user) throw new Error("Credenciais inválidas.");

    return {
        id: data.user.id,
        nome: data.user.user_metadata.full_name,
        email: data.user.email!,
        foto_perfil: data.user.user_metadata.avatar_url,
        nivel_acesso: data.user.user_metadata.role === 'admin' ? 'admin' : 'user',
        data_cadastro: data.user.created_at
    };
  }

  async logout() {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
  }

  // --- ANALYSIS METHODS ---

  async saveAnalise(usuario_id: string, foto_url: string, resultado: AnalysisResult): Promise<Analise> {
    const { data, error } = await supabase
        .from('analises')
        .insert([{
            usuario_id,
            foto_url,
            resultado_json: resultado,
            data_analise: new Date().toISOString()
        }])
        .select()
        .single();

    if (error) throw error;
    return data;
  }

  async getUserAnalyses(usuario_id: string): Promise<Analise[]> {
    const { data, error } = await supabase
        .from('analises')
        .select('*')
        .eq('usuario_id', usuario_id)
        .order('data_analise', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async deleteAccount() {
      // O Supabase Auth lida com a deleção, mas aqui simulamos a limpeza de dados do perfil
      const user = await this.getCurrentUser();
      if (!user) return;

      const { error } = await supabase.auth.admin.deleteUser(user.id);
      if (error) throw error;
  }

  // --- SESSION MANAGEMENT ---

  async getCurrentUser(): Promise<Usuario | null> {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      return {
          id: user.id,
          nome: user.user_metadata.full_name,
          email: user.email!,
          foto_perfil: user.user_metadata.avatar_url,
          nivel_acesso: user.user_metadata.role === 'admin' ? 'admin' : 'user',
          data_cadastro: user.created_at
      };
  }
}

export const db = new SupabaseDatabase();
