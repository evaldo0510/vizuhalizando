
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// No ambiente de produção/SaaS, estas chaves vêm das variáveis de ambiente
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';

// Inicialização segura para evitar "supabaseUrl is required" crash
let supabaseInstance: SupabaseClient | null = null;

if (supabaseUrl && supabaseAnonKey && supabaseUrl !== '') {
    try {
        supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
    } catch (e) {
        console.error("Erro ao inicializar Supabase:", e);
    }
} else {
    console.warn("Supabase não configurado. O sistema usará o Banco de Dados Local (LocalStorage) como fallback de desenvolvimento.");
}

export const supabase = supabaseInstance;
