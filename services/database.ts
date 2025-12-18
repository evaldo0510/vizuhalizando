
import { supabase } from './supabase';
import type { AnalysisResult, UserRole } from '../types';

export interface Usuario {
  id: string;
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

class HybridDatabase {
  private isCloud(): boolean {
    return !!supabase;
  }

  // --- MOCK LOGIC (FALLBACK) ---
  private async hashPassword(password: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(password + "vizu_salt_2025");
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  private getLocalTable<T>(tableName: string): T[] {
    const data = localStorage.getItem(`vizu_db_${tableName}`);
    return data ? JSON.parse(data) : [];
  }

  private saveLocalTable<T>(tableName: string, data: T[]) {
    localStorage.setItem(`vizu_db_${tableName}`, JSON.stringify(data));
  }

  // --- PUBLIC METHODS ---

  async registerUser(nome: string, email: string, senha_plana: string, role: UserRole = 'client'): Promise<Usuario> {
    if (this.isCloud()) {
      const { data, error } = await supabase!.auth.signUp({
        email,
        password: senha_plana,
        options: { data: { full_name: nome, role: role } }
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
    } else {
      const usuarios = this.getLocalTable<any>('usuarios');
      if (usuarios.find(u => u.email === email)) throw new Error('Email já cadastrado.');
      
      const newUser = {
        id: Date.now().toString(),
        nome,
        email,
        senha_hash: await this.hashPassword(senha_plana),
        nivel_acesso: 'user',
        data_cadastro: new Date().toISOString()
      };
      usuarios.push(newUser);
      this.saveLocalTable('usuarios', usuarios);
      this.setCurrentUser(newUser as any);
      return newUser as any;
    }
  }

  async loginUser(email: string, senha_plana: string): Promise<Usuario> {
    if (this.isCloud()) {
      const { data, error } = await supabase!.auth.signInWithPassword({ email, password: senha_plana });
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
    } else {
      const usuarios = this.getLocalTable<any>('usuarios');
      const user = usuarios.find(u => u.email === email);
      if (!user) throw new Error('Usuário não encontrado.');
      const hashed = await this.hashPassword(senha_plana);
      if (user.senha_hash !== hashed) throw new Error('Senha incorreta.');
      this.setCurrentUser(user as any);
      return user as any;
    }
  }

  async logout() {
    if (this.isCloud()) {
      await supabase!.auth.signOut();
    } else {
      localStorage.removeItem('vizu_session_user');
    }
  }

  async saveAnalise(usuario_id: string, foto_url: string, resultado: AnalysisResult): Promise<Analise> {
    if (this.isCloud()) {
      const { data, error } = await supabase!
        .from('analises')
        .insert([{ usuario_id, foto_url, resultado_json: resultado, data_analise: new Date().toISOString() }])
        .select()
        .single();
      if (error) throw error;
      return data;
    } else {
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
  }

  async getUserAnalyses(usuario_id: string): Promise<Analise[]> {
    if (this.isCloud()) {
      const { data, error } = await supabase!
        .from('analises')
        .select('*')
        .eq('usuario_id', usuario_id)
        .order('data_analise', { ascending: false });
      if (error) throw error;
      return data || [];
    } else {
      return this.getLocalTable<Analise>('analises')
        .filter(a => a.usuario_id === usuario_id)
        .sort((a, b) => new Date(b.data_analise).getTime() - new Date(a.data_analise).getTime());
    }
  }

  async getCurrentUser(): Promise<Usuario | null> {
    if (this.isCloud()) {
      const { data: { user } } = await supabase!.auth.getUser();
      if (!user) return null;
      return {
        id: user.id,
        nome: user.user_metadata.full_name,
        email: user.email!,
        foto_perfil: user.user_metadata.avatar_url,
        nivel_acesso: user.user_metadata.role === 'admin' ? 'admin' : 'user',
        data_cadastro: user.created_at
      };
    } else {
      const data = localStorage.getItem('vizu_session_user');
      return data ? JSON.parse(data) : null;
    }
  }

  private setCurrentUser(user: Usuario | null) {
      if (user) localStorage.setItem('vizu_session_user', JSON.stringify(user));
      else localStorage.removeItem('vizu_session_user');
  }
}

export const db = new HybridDatabase();
