
import React, { useState } from 'react';
import { X, Mail, Lock, Loader2, ArrowRight, LogIn, Chrome, User, Briefcase, ShoppingBag, Smile } from 'lucide-react';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  User as FirebaseUser
} from 'firebase/auth';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { UserRole } from '../types';
import { db } from '../services/database';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMockLogin?: (user: any, role: UserRole) => void;
}

// Helper to safely retrieve initialized Firebase App or attempt init if config exists
const getFirebaseApp = (): FirebaseApp | null => {
    if (getApps().length > 0) {
        return getApp();
    }
    const w = window as any;
    if (typeof w.__firebase_config !== 'undefined') {
        try {
            const config = typeof w.__firebase_config === 'string' 
                ? JSON.parse(w.__firebase_config) 
                : w.__firebase_config;
            return initializeApp(config);
        } catch (e) {
            console.warn("AuthModal: Failed to init firebase from config", e);
            return null;
        }
    }
    return null;
};

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onMockLogin }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('client');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const app = getFirebaseApp();
      if (!app) {
          throw new Error("Login com Google indisponível offline. Use Email/Senha.");
      }
      const auth = getAuth(app);
      const provider = new GoogleAuthProvider();
      if (isRegistering) {
        provider.setCustomParameters({ prompt: 'select_account' });
      }

      const result = await signInWithPopup(auth, provider);
      
      // Sync with local DB logic if needed, or just pass through
      if (onMockLogin) {
          onMockLogin({
              uid: result.user.uid,
              email: result.user.email,
              displayName: result.user.displayName,
              photoURL: result.user.photoURL
          }, selectedRole);
      }
      
      onClose();
    } catch (err: any) {
      console.error("Google Auth Error:", err);
      setError(err.message || "Erro ao conectar com Google.");
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || (isRegistering && !name)) {
        setError("Por favor, preencha todos os campos.");
        return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Use Local DB Service
      let user;
      if (isRegistering) {
          user = await db.registerUser(name, email, password, selectedRole);
      } else {
          user = await db.loginUser(email, password);
      }

      // Convert DB user to App User format
      const appUser = {
          uid: user.id.toString(),
          email: user.email,
          displayName: user.nome,
          photoURL: user.foto_perfil || null,
          role: user.nivel_acesso // 'admin' | 'user'
      };

      if (onMockLogin) {
          onMockLogin(appUser, selectedRole);
      }
      onClose();

    } catch (err: any) {
      console.error("Auth Error:", err);
      setError(err.message || "Ocorreu um erro. Verifique suas credenciais.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-brand-graphite/60 backdrop-blur-sm transition-opacity animate-fade-in" 
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-md bg-white/95 dark:bg-brand-graphite/95 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/40 dark:border-white/10 animate-fade-in transform transition-all scale-100 max-h-[90vh] overflow-y-auto custom-scrollbar">
        
        {/* Header */}
        <div className="p-8 pb-0 text-center relative">
            <button 
                onClick={onClose} 
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-slate-500 dark:text-slate-400"
            >
                <X className="w-5 h-5" />
            </button>
            <div className="inline-flex items-center justify-center p-3 bg-brand-gold/10 dark:bg-brand-gold/20 rounded-full mb-4 text-brand-gold">
                <LogIn className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-brand-graphite dark:text-white mb-2 font-serif">
                {isRegistering ? 'Crie sua conta' : 'Bem-vindo de volta'}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
                {isRegistering ? 'Escolha seu perfil e cadastre-se.' : 'Entre para acessar suas análises.'}
            </p>
        </div>

        <div className="p-8">
            {/* Role Selection */}
            {isRegistering && (
                <div className="mb-6 grid grid-cols-3 gap-2">
                    <button 
                        type="button"
                        onClick={() => setSelectedRole('client')}
                        className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${selectedRole === 'client' ? 'border-brand-gold bg-brand-gold/10 text-brand-graphite dark:text-white' : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:border-brand-gold/50'}`}
                    >
                        <Smile className="w-5 h-5 mb-1" />
                        <span className="text-xs font-bold">Cliente</span>
                    </button>
                    <button 
                        type="button"
                        onClick={() => setSelectedRole('professional')}
                        className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${selectedRole === 'professional' ? 'border-brand-gold bg-brand-gold/10 text-brand-graphite dark:text-white' : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:border-brand-gold/50'}`}
                    >
                        <Briefcase className="w-5 h-5 mb-1" />
                        <span className="text-xs font-bold">Estilista</span>
                    </button>
                    <button 
                        type="button"
                        onClick={() => setSelectedRole('store')}
                        className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${selectedRole === 'store' ? 'border-brand-gold bg-brand-gold/10 text-brand-graphite dark:text-white' : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:border-brand-gold/50'}`}
                    >
                        <ShoppingBag className="w-5 h-5 mb-1" />
                        <span className="text-xs font-bold">Loja</span>
                    </button>
                </div>
            )}

            {/* Google Auth */}
            <button 
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all font-medium text-brand-graphite dark:text-slate-200 mb-6 group"
            >
                 <Chrome className="w-5 h-5 text-brand-graphite dark:text-white group-hover:scale-110 transition-transform" />
                 <span>{isRegistering ? 'Cadastrar com Google' : 'Entrar com Google'}</span>
            </button>

            <div className="relative flex py-2 items-center mb-6">
                <div className="flex-grow border-t border-slate-200 dark:border-slate-700"></div>
                <span className="flex-shrink-0 mx-4 text-slate-400 text-xs uppercase font-bold">Ou via Email</span>
                <div className="flex-grow border-t border-slate-200 dark:border-slate-700"></div>
            </div>

            <form onSubmit={handleEmailAuth} className="space-y-4">
                {isRegistering && (
                    <div className="relative">
                        <User className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
                        <input 
                            type="text" 
                            placeholder="Seu Nome"
                            value={name} 
                            onChange={(e) => setName(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-gold focus:outline-none dark:text-white transition-all placeholder:text-slate-400"
                            required
                        />
                    </div>
                )}

                <div className="relative">
                    <Mail className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
                    <input 
                        type="email" 
                        placeholder="seu@email.com"
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-gold focus:outline-none dark:text-white transition-all placeholder:text-slate-400"
                        required
                    />
                </div>

                <div className="relative">
                    <Lock className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
                    <input 
                        type="password" 
                        placeholder="Sua senha"
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-gold focus:outline-none dark:text-white transition-all placeholder:text-slate-400"
                        required
                    />
                </div>

                {error && <p className="text-red-500 text-xs text-center font-medium bg-red-50 dark:bg-red-900/20 p-2 rounded-lg">{error}</p>}

                <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full bg-brand-gold hover:bg-yellow-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-brand-gold/30 transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (isRegistering ? 'Criar Conta' : 'Entrar')}
                    {!loading && <ArrowRight className="w-4 h-4" />}
                </button>
            </form>

            <div className="mt-6 text-center">
                <p className="text-slate-500 dark:text-slate-400 text-sm">
                    {isRegistering ? 'Já tem uma conta?' : 'Ainda não tem conta?'}
                    <button 
                        onClick={() => setIsRegistering(!isRegistering)}
                        className="ml-2 font-bold text-brand-gold hover:underline"
                    >
                        {isRegistering ? 'Fazer Login' : 'Cadastre-se'}
                    </button>
                </p>
            </div>
        </div>
      </div>
    </div>
  );
};
