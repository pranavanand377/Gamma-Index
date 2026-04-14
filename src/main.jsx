import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { installGlobalErrorHandlers } from './services/errorLogger';

// Install global error & rejection handlers before rendering
installGlobalErrorHandlers();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

requestAnimationFrame(() => {
  const boot = document.getElementById('app-boot-loader');
  if (!boot) return;
  boot.classList.add('hidden');
  setTimeout(() => boot.remove(), 260);
});
