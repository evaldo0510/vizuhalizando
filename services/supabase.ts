
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const getEnv = (key: string): string | undefined => {
    // Lista exaustiva de possíveis locais onde o Vercel/Vite/Browser pode guardar a chave
    const lookups = [
        // @ts-ignore
        () => typeof import.meta !== 'undefined' && (import.meta as any).env?.[key],
        // @ts-ignore
        () => typeof import.meta !== 'undefined' && (import.meta as any).env?.[`VITE_${key}`],
        () => typeof process !== 'undefined' && process.env?.[key],
        () => typeof process !== 'undefined' && process.env?.[`VITE_${key}`],
        () => typeof process !== 'undefined' && process.env?.[`REACT_APP_${key}`],
        // @ts-ignore
        () => window.__env?.[key]
    ];

    for (const lookup of lookups) {
        try {
            const val = lookup();
            if (val && val !== 'undefined' && val !== 'null') return val;
        } catch (e) {}
    }
    return undefined;
};

const supabaseUrl = getEnv('SUPABASE_URL');
const supabaseAnonKey = getEnv('SUPABASE_ANON_KEY');

const isValid = (val: string | undefined): boolean => {
    return !!val && val.length > 10;
};

let supabaseInstance: SupabaseClient | null = null;
const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'unknown';

if (isValid(supabaseUrl) && isValid(supabaseAnonKey)) {
    try {
        supabaseInstance = createClient(supabaseUrl!, supabaseAnonKey!);
        console.log(`✅ Supabase: Sincronização Ativa em ${currentOrigin}`);
    } catch (e) {
        console.error("❌ Supabase: Erro de Instanciação", e);
    }
} else {
    console.warn("⚠️ VizuHalizando: Cloud Sync Inativo (Variáveis ausentes).");
}

export const debugConnection = {
    hasUrl: isValid(supabaseUrl),
    hasKey: isValid(supabaseAnonKey),
    urlPrefix: supabaseUrl ? `${supabaseUrl.substring(0, 15)}...` : 'ausente',
    currentOrigin: currentOrigin
};

export const supabase = supabaseInstance;
