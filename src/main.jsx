import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';

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
