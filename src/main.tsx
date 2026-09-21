import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Pré-carregamento imediato dos assets da tela inicial na inicialização do aplicativo
const preloadHero = new Image();
preloadHero.src = 'https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0150741197.firebasestorage.app/o/img-capas%2Fcapa1.png?alt=media';

const preloadIcon = new Image();
preloadIcon.src = 'https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0150741197.firebasestorage.app/o/img-capas%2Fswordandstaff.png?alt=media';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
