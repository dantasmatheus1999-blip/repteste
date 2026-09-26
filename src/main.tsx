import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { AssetCacheService } from './services/assetCacheService.ts';

// Inicia imediatamente o pré-carregamento e cache das imagens essenciais no boot do JS
if (typeof window !== 'undefined') {
  AssetCacheService.preloadEssentialAssets().catch(() => {});
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
