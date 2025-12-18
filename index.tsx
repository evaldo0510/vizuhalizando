
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

/**
 * VIZUHALIZANDO - CONTROLE DE VERSÃO E CACHE
 * Incrementar APP_VERSION força a limpeza de cache local nos navegadores dos clientes.
 * Isso resolve problemas de "site não atualizando" após deploys no Vercel/Domínios customizados.
 */
const APP_VERSION = '4.8.7';

const forceUpdate = async () => {
  try {
    const cachedVersion = localStorage.getItem('app_version');
    
    if (cachedVersion !== APP_VERSION) {
      console.log(`[VizuHalizando] Nova versão detectada: ${APP_VERSION}. Otimizando sistema...`);
      
      // 1. Limpeza de Cache Storage (Imagens e Assets cacheados pela API)
      if ('caches' in window) {
        try {
          const keys = await caches.keys();
          await Promise.all(keys.map(key => caches.delete(key)));
        } catch (e) {
          console.warn("[Vizu] Falha ao limpar Cache Storage:", e);
        }
      }

      // 2. Limpeza de Service Workers antigos (Causa comum de site travado em versão velha)
      if ('serviceWorker' in navigator) {
        try {
          // getRegistrations pode falhar se o documento estiver em "estado inválido" (ex: carregando ou em iframe restrito)
          const registrations = await navigator.serviceWorker.getRegistrations();
          for (const registration of registrations) {
            await registration.unregister();
          }
        } catch (e) {
          console.warn("[Vizu] Falha ao desregistrar Service Workers:", e);
        }
      }

      // 3. Persistir nova versão e forçar recarregamento limpo
      localStorage.setItem('app_version', APP_VERSION);
      
      // Adiciona um parâmetro de busca para garantir que o CDN não entregue a página velha
      const sep = window.location.search ? '&' : '?';
      if (!window.location.search.includes('v=' + APP_VERSION)) {
        window.location.href = window.location.pathname + sep + 'v=' + APP_VERSION;
      }
    }
  } catch (err) {
    console.error("[Vizu] Erro crítico no processo de atualização:", err);
  }
};

/**
 * Função de inicialização robusta
 */
const startApp = async () => {
  // Executa o forceUpdate antes de renderizar para garantir que o usuário veja a versão mais nova
  await forceUpdate();
  
  const rootElement = document.getElementById('root');
  if (rootElement) {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  }
};

// Disparar inicialização
startApp();
