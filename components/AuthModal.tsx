
import React, { useState } from 'react';
import { X, Loader2, Chrome, Sparkles, CheckCircle2 } from 'lucide-react';
import { supabase } from '../services/supabase';
import { db } from '../services/database';
import { Logo } from '../Logo';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMockLogin: (user: any) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onMockLogin }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      if (!supabase) throw new Error("Supabase não configurado.");
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin }
      });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message || "Erro ao conectar com Google.");
      setLoading(false);
    }
  };

  const handleSpecialAccess = async () => {
    setLoading(true);
    try {
      localStorage.removeItem('vizu_session_user');
      
      const mockAdmin = {
        id: 'admin_' + Math.random().toString(36).substr(2, 9),
        nome: 'Admin VizuHalizando',
        email: 'evaldo0510@gmail.com',
        photoURL: null,
        user_metadata: { full_name: 'Admin VizuHalizando' }
      };
      
      const synced = await db.syncGoogleUser(mockAdmin);
      await db.forcePremium(synced.id);
      
      setSuccess(true);
      // Notifica o app pai imediatamente
      onMockLogin(synced);
      
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      setError("Erro ao liberar acesso.");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-brand-graphite/90 backdrop-blur-md" onClick={onClose} />
      
      <div className="relative w-full max-w-sm bg-white rounded-[40px] shadow-3xl overflow-hidden border border-white/20 animate-scale-up p-10">
        <button onClick={onClose} className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-50 transition-colors"><X size={20} /></button>
        
        {success ? (
          <div className="text-center py-10 animate-fade-in">
             <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
                <CheckCircle2 size={40} />
             </div>
             <h2 className="text-2xl font-serif font-bold text-brand-graphite">Bem-vindo de volta!</h2>
             <p className="text-slate-400 text-sm mt-2">Sincronizando seu atelier...</p>
          </div>
        ) : (
          <>
            <div className="text-center mb-10">
                <div className="inline-flex items-center justify-center p-5 bg-brand-gold/10 rounded-[32px] mb-6 text-brand-gold shadow-inner border border-brand-gold/10">
                    <Logo className="w-12 h-12" />
                </div>
                <h2 className="text-3xl font-serif font-bold text-brand-graphite mb-2">Acesso Privado</h2>
                <p className="text-slate-400 text-sm">Entre para salvar suas consultorias.</p>
            </div>

            <div className="space-y-4">
                <button 
                    onClick={handleGoogleLogin}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-4 bg-white border border-slate-200 p-4 rounded-2xl hover:bg-slate-50 transition-all font-bold text-slate-700 disabled:opacity-50 shadow-sm group"
                >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Chrome className="w-6 h-6 text-[#4285F4] group-hover:rotate-12 transition-transform" />}
                    <span>Login com Google</span>
                </button>

                <div className="relative py-4">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
                    <div className="relative flex justify-center text-[10px] uppercase font-bold text-slate-300"><span className="bg-white px-4 tracking-widest font-black">ÁREA ADMINISTRATIVA</span></div>
                </div>

                <button 
                    onClick={handleSpecialAccess}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-4 bg-brand-graphite text-brand-gold p-4 rounded-2xl hover:bg-brand-gold hover:text-brand-graphite transition-all font-bold disabled:opacity-50 shadow-xl group"
                >
                    <Sparkles size={20} className="group-hover:scale-125 transition-transform" />
                    <span>ENTRAR COMO EVALDO</span>
                </button>

                {error && <p className="text-red-500 text-xs text-center font-bold bg-red-50 p-3 rounded-xl mt-4 border border-red-100">{error}</p>}
                
                <p className="text-[10px] text-slate-400 text-center px-4 leading-relaxed mt-8 font-medium opacity-60">
                  VizuHalizando Luxury Engine v3.1<br/>
                  Sua identidade visual protegida por IA.
                </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
