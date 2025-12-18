
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

/**
 * VIZUHALIZANDO - CONTROLE DE VERSÃO
 * Versão: 5.0.1 - Estabilidade Máxima
 */
const APP_VERSION = '5.0.1';

const launchApp = async () => {
  try {
    const cachedVersion = localStorage.getItem('app_version');
    
    if (cachedVersion !== APP_VERSION) {
      console.log(`[Vizu] Atualizando Atelier para v${APP_VERSION}...`);
      
      if ('caches' in window) {
        try {
          const keys = await caches.keys();
          await Promise.all(keys.map(key => caches.delete(key)));
        } catch (e) {}
      }

      localStorage.setItem('app_version', APP_VERSION);
      
      const url = new URL(window.location.href);
      if (url.searchParams.get('v') !== APP_VERSION) {
        url.searchParams.set('v', APP_VERSION);
        window.location.replace(url.toString());
        return;
      }
    }
  } catch (err) {
    console.error("[Vizu] Falha crítica no arranque:", err);
  }

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

launchApp();
