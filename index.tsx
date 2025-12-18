
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Listener de erro global para evitar tela branca sem feedback
window.onerror = (message, source, lineno, colno, error) => {
  console.error("FALHA CRÍTICA AO ABRIR APP:", { message, error });
  const root = document.getElementById('root');
  if (root && root.innerHTML === "") {
    root.innerHTML = `
      <div style="padding: 40px; font-family: sans-serif; text-align: center; background: #1A1A2E; color: white; height: 100vh; display: flex; flex-direction: column; justify-content: center; align-items: center;">
        <h2 style="color: #C5A572;">VizuHalizando: Erro de Inicialização</h2>
        <p style="opacity: 0.8; max-width: 400px; margin: 20px 0;">Ocorreu um erro ao carregar o aplicativo. Isso pode ser causado por variáveis de ambiente ausentes no Vercel ou erro de rede.</p>
        <code style="background: rgba(255,255,255,0.1); padding: 10px; border-radius: 8px; font-size: 12px; margin-bottom: 20px;">${message}</code>
        <button onclick="window.location.reload()" style="background: #C5A572; color: #1A1A2E; border: none; padding: 12px 24px; border-radius: 8px; font-weight: bold; cursor: pointer;">Tentar Novamente</button>
      </div>
    `;
  }
};

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('SW registered: ', registration);
      })
      .catch(registrationError => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
