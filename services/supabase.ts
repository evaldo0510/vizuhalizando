
import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Função utilitária para buscar variáveis de ambiente em diferentes contextos de build
 * (Vite usa import.meta.env, Webpack usa process.env)
 */
const getEnv = (key: string): string | undefined => {
    const prefixes = ['', 'VITE_', 'REACT_APP_'];
    
    for (const prefix of prefixes) {
        const fullKey = `${prefix}${key}`;
        
        // 1. Tenta import.meta.env (Padrão Vite/Bundlers modernos)
        try {
            // @ts-ignore
            if (typeof import.meta !== 'undefined' && (import.meta as any).env && (import.meta as any).env[fullKey]) {
                return (import.meta as any).env[fullKey];
            }
        } catch (e) {}
        
        // 2. Tenta process.env (Vercel/Node/CI)
        try {
            if (typeof process !== 'undefined' && process.env && process.env[fullKey]) {
                return process.env[fullKey];
            }
        } catch (e) {}
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
        console.log("✅ VizuHalizando: Cloud Sync estabelecido com sucesso.");
    } catch (e) {
        console.error("❌ Supabase Error: Falha ao inicializar o cliente.", e);
    }
} else {
    console.warn("⚠️ VizuHalizando: Operando em MODO LOCAL. Sincronização em nuvem desativada.");
    console.debug("Diagnóstico de Variáveis:", {
        urlFound: !!supabaseUrl,
        keyFound: !!supabaseAnonKey,
        context: typeof process !== 'undefined' ? 'Node/Vercel' : 'Browser Only'
    });
}

// Exportamos as chaves para o diagnóstico na UI de depuração do App.tsx
export const debugConnection = {
    hasUrl: isValid(supabaseUrl),
    hasKey: isValid(supabaseAnonKey),
    urlPrefix: supabaseUrl ? `${supabaseUrl.substring(0, 15)}...` : 'ausente'
};

export const supabase = supabaseInstance;
