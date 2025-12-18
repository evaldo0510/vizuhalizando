
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Limpeza silenciosa de Service Workers apenas se estiver em contexto seguro
if ('serviceWorker' in navigator && window.isSecureContext) {
  navigator.serviceWorker.getRegistrations().then(registrations => {
    for (const registration of registrations) {
      registration.unregister();
    }
  }).catch(() => {});
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
