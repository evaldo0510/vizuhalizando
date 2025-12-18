
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Captura erros de sincronização e carregamento de módulos
window.addEventListener('unhandledrejection', (event) => {
  console.error("PROMISE REJECTED:", event.reason);
  // Não interrompe o app, mas loga para depuração
});

window.onerror = (message, source, lineno, colno, error) => {
  console.error("FALHA DE INICIALIZAÇÃO:", { message, error });
  const root = document.getElementById('root');
  
  if (root && (root.innerHTML.trim() === "" || root.innerHTML.includes('loading'))) {
    const isHttps = window.location.protocol === 'https:';
    const domain = window.location.hostname;
    
    root.innerHTML = `
      <div style="padding: 20px; font-family: 'Inter', sans-serif; text-align: center; background: #1A1A2E; color: white; height: 100vh; display: flex; flex-direction: column; justify-content: center; align-items: center;">
        <div style="background: rgba(197, 165, 114, 0.05); padding: 40px; border-radius: 32px; border: 1px solid rgba(197, 165, 114, 0.2); max-width: 500px; width: 100%;">
          <div style="font-size: 40px; margin-bottom: 20px;">🏛️</div>
          <h2 style="color: #C5A572; margin-bottom: 10px; font-family: 'Playfair Display', serif; font-size: 24px;">Atelier VizuHalizando</h2>
          <p style="opacity: 0.7; font-size: 14px; line-height: 1.6; margin-bottom: 20px;">
            O sistema detectou uma falha ao abrir o atelier em <br/><b>${domain}</b>.
          </p>
          
          ${!isHttps ? `
            <div style="background: #742a2a; color: #feb2b2; padding: 12px; border-radius: 12px; font-size: 12px; margin-bottom: 20px; font-weight: bold;">
              ⚠️ SEGURANÇA: Use HTTPS para este domínio.
            </div>
          ` : ''}

          <div style="background: rgba(0,0,0,0.4); padding: 15px; border-radius: 12px; margin-bottom: 20px; font-size: 10px; color: #888; text-align: left; overflow-x: auto; font-family: monospace;">
            ID: ${message || 'Erro Desconhecido'}
          </div>

          <button onclick="window.location.reload()" style="background: #C5A572; color: #1A1A2E; border: none; padding: 16px 32px; border-radius: 14px; font-weight: bold; cursor: pointer; width: 100%; font-size: 16px; transition: all 0.2s;">
            Tentar Reconectar
          </button>
          
          <p style="margin-top: 24px; font-size: 11px; opacity: 0.4;">
            Verifique se as variáveis de ambiente estão configuradas para o ambiente de PRODRUCTION no Vercel.
          </p>
        </div>
      </div>
    `;
  }
};

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
