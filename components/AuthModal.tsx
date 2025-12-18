
import React, { useState } from 'react';
import { X, Loader2, Chrome, LogIn, Sparkles, ShieldCheck } from 'lucide-react';
import { supabase } from '../services/supabase';
import { db } from '../services/database';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMockLogin: (user: any) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onMockLogin }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      if (!supabase) {
        throw new Error("Supabase não configurado. Verifique as chaves no ambiente.");
      }

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        }
      });

      if (error) throw error;
    } catch (err: any) {
      setError(err.message || "Erro ao conectar com Google via Supabase.");
      setLoading(false);
    }
  };

  const handleSpecialAccess = async () => {
    setLoading(true);
    try {
      // Simula um login administrativo ou cortesia
      const mockAdmin = {
        id: 'dev_user_admin',
        nome: 'Acesso Cortesia',
        email: 'evaldo0510@gmail.com', // Força um e-mail admin
        photoURL: null,
        user_metadata: { full_name: 'Acesso Cortesia' }
      };
      
      const synced = await db.syncGoogleUser(mockAdmin);
      await db.forcePremium(synced.id);
      
      // Força recarregamento suave para o App reconhecer o estado
      window.location.reload();
    } catch (err) {
      setError("Erro ao liberar acesso especial.");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-brand-graphite/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-sm bg-white rounded-[40px] shadow-2xl overflow-hidden border border-white/20 animate-fade-in p-10">
        <button onClick={onClose} className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-50 transition-colors"><X size={20} /></button>
        
        <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center p-4 bg-brand-gold/10 rounded-3xl mb-6 text-brand-gold">
                <LogIn size={32} />
            </div>
            <h2 className="text-3xl font-serif font-bold text-brand-graphite mb-2">Acesso ao Atelier</h2>
            <p className="text-slate-400 text-sm">Entre no seu espaço exclusivo de consultoria.</p>
        </div>

        <div className="space-y-4">
            <button 
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full flex items-center justify-center gap-4 bg-white border border-slate-200 p-4 rounded-2xl hover:bg-slate-50 transition-all font-bold text-slate-700 disabled:opacity-50 shadow-sm group"
            >
                 {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Chrome className="w-6 h-6 text-[#4285F4] group-hover:scale-110 transition-transform" />}
                 <span>Entrar com Google</span>
            </button>

            <div className="relative py-2">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
                <div className="relative flex justify-center text-[10px] uppercase font-bold text-slate-300"><span className="bg-white px-4">Ou liberação rápida</span></div>
            </div>

            <button 
                onClick={handleSpecialAccess}
                disabled={loading}
                className="w-full flex items-center justify-center gap-4 bg-brand-graphite text-brand-gold p-4 rounded-2xl hover:bg-brand-gold hover:text-brand-graphite transition-all font-bold disabled:opacity-50 shadow-xl"
            >
                 <Sparkles size={20} />
                 <span>Acesso Cortesia (Full)</span>
            </button>

            {error && <p className="text-red-500 text-xs text-center font-bold bg-red-50 p-3 rounded-xl">{error}</p>}
            
            <p className="text-[10px] text-slate-400 text-center px-4 leading-relaxed mt-4">
              Ao acessar, você concorda com nossos termos de privacidade e processamento biométrico.
            </p>
        </div>
      </div>
    </div>
  );
};
