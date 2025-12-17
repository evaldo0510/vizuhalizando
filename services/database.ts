
import type { AnalysisResult, UserRole } from '../types';

// Interfaces matching the SQL Schema
export interface Usuario {
  id: number;
  nome: string;
  email: string;
  senha_hash: string; // Storing plain text for this mock, typically hashed
  telefone?: string;
  foto_perfil?: string;
  nivel_acesso: 'user' | 'admin';
  data_cadastro: string;
}

export interface Plano {
  id: number;
  nome: string;
  preco: number;
  descricao: string;
  creditos_analise: number;
}

export interface Analise {
  id: number;
  usuario_id: number;
  foto_url: string;
  resultado_json: AnalysisResult;
  data_analise: string;
}

// Initial Seed Data
const INITIAL_PLANOS: Plano[] = [
  { id: 1, nome: 'Visitante', preco: 0.00, descricao: 'Plano gratuito básico', creditos_analise: 1 },
  { id: 2, nome: 'Premium Vitalício', preco: 29.90, descricao: 'Acesso total e ilimitado', creditos_analise: 9999 },
  { id: 3, nome: 'Sob Medida', preco: 149.90, descricao: 'Consultoria humana personalizada + Acesso total', creditos_analise: 9999 }
];

const ADMIN_EMAILS = ['evaldo0510@gmail.com', 'aljariristartups@gmail.com'];

class MockDatabase {
  private getTable<T>(tableName: string): T[] {
    const data = localStorage.getItem(`vizu_db_${tableName}`);
    return data ? JSON.parse(data) : [];
  }

  private saveTable<T>(tableName: string, data: T[]) {
    localStorage.setItem(`vizu_db_${tableName}`, JSON.stringify(data));
  }

  constructor() {
    // Seed Planos if empty
    const planos = this.getTable<Plano>('planos');
    if (planos.length === 0) {
      this.saveTable('planos', INITIAL_PLANOS);
    }
  }

  // --- USER METHODS ---

  async registerUser(nome: string, email: string, senha_hash: string, role: UserRole = 'client'): Promise<Usuario> {
    const usuarios = this.getTable<Usuario>('usuarios');
    
    if (usuarios.find(u => u.email === email)) {
      throw new Error('Email já cadastrado.');
    }

    // Determine access level based on provided admin emails
    let nivel_acesso: 'user' | 'admin' = 'user';
    if (role !== 'client') {
        if (ADMIN_EMAILS.includes(email.toLowerCase())) {
            nivel_acesso = 'admin';
        } else {
            throw new Error('Este email não tem permissão para criar contas administrativas.');
        }
    }

    const newUser: Usuario = {
      id: Date.now(), // Mock ID
      nome,
      email,
      senha_hash,
      nivel_acesso,
      data_cadastro: new Date().toISOString()
    };

    usuarios.push(newUser);
    this.saveTable('usuarios', usuarios);
    return newUser;
  }

  async loginUser(email: string, senha_hash: string): Promise<Usuario> {
    const usuarios = this.getTable<Usuario>('usuarios');
    const user = usuarios.find(u => u.email === email);

    if (!user) {
        // Mock default admins if they don't exist yet (for demo purposes)
        if (ADMIN_EMAILS.includes(email) && senha_hash === '123456') {
            return this.registerUser('Admin', email, senha_hash, 'professional'); // Auto-register admin
        }
        throw new Error('Usuário não encontrado.');
    }

    if (user.senha_hash !== senha_hash) {
      throw new Error('Senha incorreta.');
    }

    // Update last login (simulated)
    return user;
  }

  // --- ANALYSIS METHODS ---

  async saveAnalise(usuario_id: number, foto_url: string, resultado: AnalysisResult): Promise<Analise> {
    const analises = this.getTable<Analise>('analises');
    
    const newAnalise: Analise = {
        id: Date.now(),
        usuario_id,
        foto_url,
        resultado_json: resultado,
        data_analise: new Date().toISOString()
    };

    analises.push(newAnalise);
    this.saveTable('analises', analises);
    
    // Also save as "current session" for simple persistence on reload
    localStorage.setItem('vizu_current_analysis', JSON.stringify(newAnalise));
    
    return newAnalise;
  }

  async getLastAnalise(usuario_id: number): Promise<Analise | null> {
      const analises = this.getTable<Analise>('analises');
      const userAnalises = analises.filter(a => a.usuario_id === usuario_id);
      if (userAnalises.length === 0) return null;
      // Sort by date desc
      return userAnalises.sort((a, b) => new Date(b.data_analise).getTime() - new Date(a.data_analise).getTime())[0];
  }

  async getUserAnalyses(usuario_id: number): Promise<Analise[]> {
      const analises = this.getTable<Analise>('analises');
      // Return all analyses for user, sorted newest first
      return analises
        .filter(a => a.usuario_id === usuario_id)
        .sort((a, b) => new Date(b.data_analise).getTime() - new Date(a.data_analise).getTime());
  }

  // --- SESSION MANAGEMENT ---
  
  setCurrentUser(user: Usuario | null) {
      if (user) {
          localStorage.setItem('vizu_session_user', JSON.stringify(user));
      } else {
          localStorage.removeItem('vizu_session_user');
          localStorage.removeItem('vizu_current_analysis');
      }
  }

  getCurrentUser(): Usuario | null {
      const data = localStorage.getItem('vizu_session_user');
      return data ? JSON.parse(data) : null;
  }
}

export const db = new MockDatabase();
