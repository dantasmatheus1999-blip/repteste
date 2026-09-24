import React, { useState, useEffect } from 'react';
import { storage, ref, getDownloadURL, listAll } from '../../../firebase/storage';

interface WizardBackgroundProps {
  children?: React.ReactNode;
}

let cachedFundoUrl: string | null = null;
let isResolving = false;
const listeners: Array<(url: string | null) => void> = [];

export async function resolveFundoBackgroundUrl(): Promise<string | null> {
  if (cachedFundoUrl) {
    return cachedFundoUrl;
  }

  // 1. Tentar descoberta dinâmica via listAll na pasta img-capas/
  try {
    const folderRef = ref(storage, 'img-capas');
    const res = await listAll(folderRef);
    if (res.items && res.items.length > 0) {
      // Procura por arquivo cujo nome base seja "fundo" (independente de extensão e maiúsculas/minúsculas)
      const foundItem = res.items.find((item) => {
        const base = item.name.replace(/\.[^/.]+$/, '').toLowerCase();
        return base === 'fundo';
      });

      if (foundItem) {
        console.log('BACKGROUND FUNDO: arquivo encontrado', foundItem.name);
        const url = await getDownloadURL(foundItem);
        console.log('BACKGROUND FUNDO: URL obtida', url);
        cachedFundoUrl = url;
        return url;
      }
    }
  } catch (err: any) {
    // Se listAll for restrito por regras, continua para verificação direta de candidatos
    console.debug('[WizardBackground] listAll não disponível, testando referências diretas:', err?.message || err);
  }

  // 2. Testar referências diretas no Firebase Storage para todas as extensões comuns
  const candidatePaths = [
    'img-capas/fundo.png',
    'img-capas/fundo.jpg',
    'img-capas/fundo.jpeg',
    'img-capas/fundo.webp',
    'img-capas/fundo',
    'img-capas/fundo.PNG',
    'img-capas/fundo.JPG',
    'img-capas/fundo.JPEG',
    'img-capas/fundo.WEBP',
    'img-capas/fundo.jfif',
    'img-capas/fundo.avif',
    'img-capas/Fundo.png',
    'img-capas/Fundo.jpg',
    'img-capas/Fundo.jpeg',
    'img-capas/Fundo.webp',
    'img-capas/Fundo',
    'img-capas/Fundo.PNG',
    'img-capas/Fundo.JPG',
    'fundo.png',
    'fundo.jpg',
    'fundo.jpeg',
    'fundo.webp',
    'fundo'
  ];

  let lastError: any = null;
  for (const path of candidatePaths) {
    try {
      const fileRef = ref(storage, path);
      const url = await getDownloadURL(fileRef);
      if (url) {
        console.log('BACKGROUND FUNDO: arquivo encontrado', path);
        console.log('BACKGROUND FUNDO: URL obtida', url);
        cachedFundoUrl = url;
        return url;
      }
    } catch (err: any) {
      lastError = err;
      // Continua para o próximo candidato
    }
  }

  console.error('BACKGROUND FUNDO: arquivo não encontrado', lastError?.message || lastError);
  return null;
}

export const WizardParchmentBackground: React.FC<WizardBackgroundProps> = () => {
  const [backgroundUrl, setBackgroundUrl] = useState<string | null>(cachedFundoUrl);
  const [isImageReady, setIsImageReady] = useState<boolean>(Boolean(cachedFundoUrl));

  useEffect(() => {
    let isMounted = true;

    if (cachedFundoUrl) {
      setBackgroundUrl(cachedFundoUrl);
      setIsImageReady(true);
      return;
    }

    const handleResolved = (url: string | null) => {
      if (!isMounted) return;
      if (url) {
        const img = new Image();
        img.onload = () => {
          if (isMounted) {
            setBackgroundUrl(url);
            setIsImageReady(true);
          }
        };
        img.onerror = (e) => {
          console.error('BACKGROUND FUNDO: erro ao carregar', e);
        };
        img.src = url;
      }
    };

    listeners.push(handleResolved);

    if (!isResolving) {
      isResolving = true;
      resolveFundoBackgroundUrl()
        .then((url) => {
          isResolving = false;
          listeners.forEach((l) => l(url));
          listeners.length = 0;
        })
        .catch((err) => {
          isResolving = false;
          console.error('BACKGROUND FUNDO: erro ao carregar', err);
          listeners.forEach((l) => l(null));
          listeners.length = 0;
        });
    }

    return () => {
      isMounted = false;
      const index = listeners.indexOf(handleResolved);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }, []);

  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden pointer-events-none select-none z-0">
      {/* 1. Base Dark Surface */}
      <div className="absolute inset-0 bg-[#06080d]" />

      {/* 2. Official Firebase Storage Background Image (img-capas/fundo) */}
      {backgroundUrl && (
        <div
          className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-500 ${
            isImageReady ? 'opacity-100' : 'opacity-0'
          }`}
          style={{
            backgroundImage: `url("${backgroundUrl}")`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        />
      )}

      {/* 3. Ambient Atmospheric Glow & Elements (visible while loading or as backlight) */}
      <div className="absolute -top-20 -left-20 w-96 h-96 rounded-full bg-gradient-to-br from-[#d97706]/15 via-[#b45309]/10 to-transparent blur-3xl pointer-events-none mix-blend-screen" />
      <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full bg-gradient-to-bl from-[#d4af37]/15 via-[#854d0e]/10 to-transparent blur-3xl pointer-events-none mix-blend-screen" />

      {/* 4. Reading Contrast Layer - Soft tint ensuring texts & cards stand out without obscuring the background art */}
      <div className="absolute inset-0 bg-black/45 backdrop-blur-[0.5px]" />
    </div>
  );
};
