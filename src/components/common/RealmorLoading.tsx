import React, { useState, useEffect } from 'react';
import { ref, getDownloadURL, storage } from '../../firebase/storage';
import { AssetCacheService, LOADING_IMAGE_URL } from '../../services/assetCacheService';

const REALMOR_ICON_DEFAULT_URL = LOADING_IMAGE_URL;

// Preload the loading image immediately on JS import
if (typeof window !== 'undefined') {
  AssetCacheService.preloadLoadingAsset().catch(() => {});
}

export interface RealmorLoadingProps {
  /** Mensagem principal de carregamento exibida abaixo do ícone (opcional) */
  message?: string;
  /** Subtítulo ou dica de contexto (opcional) */
  subtitle?: string;
  /** Tamanho do ícone: 'sm' (56px), 'md' (84px), 'lg' (112px), 'xl' (140px) */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Se deve ocupar a tela inteira em overlay modal ou renderizar in-line */
  fullScreen?: boolean;
  /** Classes CSS adicionais para o container externo */
  className?: string;
}

export const RealmorLoading: React.FC<RealmorLoadingProps> = ({
  message,
  subtitle,
  size = 'md',
  fullScreen = false,
  className = '',
}) => {
  const [iconUrl, setIconUrl] = useState<string>(() => 
    AssetCacheService.getCachedUrl(REALMOR_ICON_DEFAULT_URL)
  );

  useEffect(() => {
    let isMounted = true;
    
    // Ensure loading asset is pre-decoded and update state
    AssetCacheService.preloadLoadingAsset().then((cachedUrl) => {
      if (isMounted && cachedUrl) {
        setIconUrl(cachedUrl);
      }
    });

    // Also attempt Firebase Storage URL lookup in background for fallback
    try {
      const iconRef = ref(storage, 'img-capas/swordandstaff.png');
      getDownloadURL(iconRef)
        .then((url) => {
          if (url && isMounted) {
            AssetCacheService.preloadImage(url).then((cUrl) => {
              if (isMounted) setIconUrl(cUrl);
            });
          }
        })
        .catch(() => {});
    } catch (_) {}

    return () => {
      isMounted = false;
    };
  }, []);

  // Mapeamento de dimensões para o ícone
  const sizeClasses = {
    sm: 'w-14 h-14',
    md: 'w-20 h-20 sm:w-24 sm:h-24',
    lg: 'w-28 h-28 sm:w-32 sm:h-32',
    xl: 'w-36 h-36 sm:w-44 sm:h-44',
  }[size];

  const content = (
    <div className={`flex flex-col items-center justify-center text-center select-none ${className}`}>
      {/* Container Principal do Ícone e Efeitos Sobrepostos */}
      <div className={`relative ${sizeClasses} flex items-center justify-center`}>
        {/* 1. Aura Mágica Central (Pulso e Respiração) */}
        <div 
          className="absolute left-1/2 top-1/2 w-3/5 h-3/5 rounded-full pointer-events-none animate-realmor-center"
          style={{
            background: 'radial-gradient(circle, rgba(239, 68, 68, 0.75) 0%, rgba(220, 38, 38, 0.35) 50%, transparent 75%)',
          }}
        />

        {/* 2. Flare e Pulsação de Energia no Orbe do Cajado (Canto Superior Direito ~78% X, 18% Y) */}
        <div 
          className="absolute left-[78%] top-[18%] w-1/3 h-1/3 rounded-full pointer-events-none animate-realmor-orb"
          style={{
            background: 'radial-gradient(circle, rgba(254, 240, 138, 0.9) 0%, rgba(239, 68, 68, 0.8) 35%, rgba(185, 28, 28, 0.4) 65%, transparent 80%)',
          }}
        />

        {/* 3. Partículas Mágicas Vermelhas Flutuantes (Discretas em Loop) */}
        <div className="absolute inset-0 pointer-events-none overflow-visible">
          {/* Partícula 1 - Centro-Esquerda */}
          <span 
            className="absolute left-[38%] top-[45%] w-1 h-1 rounded-full bg-red-400 shadow-[0_0_6px_#ef4444] animate-realmor-particle"
            style={{ ['--dx' as any]: '-14px', ['--dy' as any]: '-26px', animationDelay: '0s' }}
          />
          {/* Partícula 2 - Centro-Direita */}
          <span 
            className="absolute left-[60%] top-[40%] w-1.5 h-1.5 rounded-full bg-red-300 shadow-[0_0_8px_#f87171] animate-realmor-particle"
            style={{ ['--dx' as any]: '16px', ['--dy' as any]: '-32px', animationDelay: '0.9s' }}
          />
          {/* Partícula 3 - Topo Próximo ao Orbe */}
          <span 
            className="absolute left-[74%] top-[26%] w-1 h-1 rounded-full bg-amber-200 shadow-[0_0_6px_#f59e0b] animate-realmor-particle"
            style={{ ['--dx' as any]: '8px', ['--dy' as any]: '-22px', animationDelay: '1.6s' }}
          />
          {/* Partícula 4 - Centro Inferior */}
          <span 
            className="absolute left-[48%] top-[56%] w-1.5 h-1.5 rounded-full bg-red-400 shadow-[0_0_6px_#ef4444] animate-realmor-particle"
            style={{ ['--dx' as any]: '-8px', ['--dy' as any]: '-28px', animationDelay: '2.2s' }}
          />
        </div>

        {/* 4. Imagem Real do Firebase Storage com Transparência e Brilho Respiratório */}
        <img
          src={iconUrl}
          alt="REALMOR Carregando"
          className="w-full h-full object-contain relative z-10 animate-realmor-icon pointer-events-none select-none"
          loading="eager"
          decoding="async"
          referrerPolicy="no-referrer"
          onError={() => setIconUrl(REALMOR_ICON_DEFAULT_URL)}
        />

        {/* 5. Shimmer / Reflexo Suave de Luz percorrendo a Lâmina da Espada (Diagonal) */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-full z-20">
          <div 
            className="absolute left-1/2 top-1/2 w-full h-[300%] bg-gradient-to-b from-transparent via-white/35 to-transparent animate-realmor-gleam pointer-events-none"
            style={{
              clipPath: 'polygon(15% 10%, 45% 45%, 40% 50%, 10% 15%)'
            }}
          />
        </div>
      </div>

      {/* Mensagem e Subtítulo Atmosféricos (Opcionais) */}
      {(message || subtitle) && (
        <div className="mt-3.5 sm:mt-4 space-y-1 max-w-xs animate-in fade-in duration-500">
          {message && (
            <p className="font-cinzel text-xs sm:text-sm font-bold text-amber-200/90 tracking-[0.15em] uppercase drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] animate-pulse">
              {message}
            </p>
          )}
          {subtitle && (
            <p className="font-serif italic text-[11px] text-stone-400/80 tracking-wide">
              {subtitle}
            </p>
          )}
        </div>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-300">
        {content}
      </div>
    );
  }

  return content;
};
