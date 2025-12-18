
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

/**
 * VIZUHALIZANDO - CONTROLE DE BOOT
 * Versão: 5.1.0 - Estabilidade Corrigida
 */
const APP_VERSION = '5.1.0';

const launchApp = async () => {
  try {
    const cachedVersion = localStorage.getItem('app_version');
    
    // Só recarrega se a versão mudar e não estivermos já na URL correta
    if (cachedVersion !== APP_VERSION) {
      localStorage.setItem('app_version', APP_VERSION);
      const url = new URL(window.location.href);
      if (url.searchParams.get('v') !== APP_VERSION) {
        url.searchParams.set('v', APP_VERSION);
        window.location.replace(url.toString());
        return;
      }
    }
  } catch (err) {
    console.error("[Vizu] Erro no check de versão:", err);
  }

  const rootElement = document.getElementById('root');
  if (rootElement) {
    try {
      const root = ReactDOM.createRoot(rootElement);
      root.render(
        <React.StrictMode>
          <App />
        </React.StrictMode>
      );
    } catch (renderError) {
      console.error("[Vizu] Erro fatal na renderização:", renderError);
      // Fallback simples caso o React falhe
      rootElement.innerHTML = '<div style="color:white;text-align:center;padding:50px;">Erro ao iniciar o Atelier. Por favor, limpe o cache do navegador.</div>';
    }
  }
};

launchApp();
