import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Função utilitária para buscar variáveis de ambiente em diferentes contextos de build
 * (Vite usa import.meta.env, Webpack usa process.env)
 */
const getEnv = (key: string): string | undefined => {
    const prefixes = ['', 'VITE_', 'REACT_APP_'];
    
    for (const prefix of prefixes) {
        const fullKey = `${prefix}${key}`;
        
        // Tenta import.meta.env (Vite)
        // Fix: Cast import.meta to any to avoid TS error "Property 'env' does not exist on type 'ImportMeta'"
        if (typeof import.meta !== 'undefined' && (import.meta as any).env && (import.meta as any).env[fullKey]) {
            return (import.meta as any).env[fullKey];
        }
        
        // Tenta process.env (Vercel/Webpack)
        if (typeof process !== 'undefined' && process.env && process.env[fullKey]) {
            return process.env[fullKey];
        }
    }
    
    return undefined;
};

const supabaseUrl = getEnv('SUPABASE_URL');
const supabaseAnonKey = getEnv('SUPABASE_ANON_KEY');

const isValid = (val: string | undefined): boolean => {
    return !!val && val !== '' && val !== 'undefined' && val !== 'null';
};

let supabaseInstance: SupabaseClient | null = null;

if (isValid(supabaseUrl) && isValid(supabaseAnonKey)) {
    try {
        supabaseInstance = createClient(supabaseUrl!, supabaseAnonKey!);
        console.log("✅ VizuHalizando: Cloud Sync Ativado via Supabase.");
    } catch (e) {
        console.error("❌ Falha crítica na conexão Supabase:", e);
    }
} else {
    console.warn("⚠️ VizuHalizando: Operando em MODO LOCAL. Sincronização Vercel pendente.");
}

// Exportamos as chaves para o diagnóstico na UI
export const debugConnection = {
    hasUrl: isValid(supabaseUrl),
    hasKey: isValid(supabaseAnonKey),
    urlPrefix: supabaseUrl ? `${supabaseUrl.substring(0, 12)}...` : 'ausente'
};

export const supabase = supabaseInstance;