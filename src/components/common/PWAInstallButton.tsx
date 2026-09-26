import React, { useState } from 'react';
import { Download, Share2, X } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running as an installed PWA, do not show button
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop install button
  if (isInstallable) {
    return (
      <button
        onClick={install}
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-gradient-to-r from-amber-700 to-amber-600 hover:from-amber-600 hover:to-amber-500 text-stone-950 font-cinzel font-bold text-[10px] sm:text-xs uppercase tracking-wider shadow-md transition-all active:scale-95 cursor-pointer border border-amber-300/50"
        title="Instalar aplicativo REALMOR no dispositivo"
      >
        <Download size={13} strokeWidth={2.5} />
        <span className="hidden sm:inline">INSTALAR</span>
        <span className="sm:hidden">APP</span>
      </button>
    );
  }

  // iOS Safari guide button
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-950/80 hover:bg-amber-900/80 text-amber-200 font-cinzel font-bold text-[10px] sm:text-xs uppercase tracking-wider transition-all cursor-pointer border border-amber-600/50 shadow-sm"
          title="Instalar REALMOR no iOS"
        >
          <Download size={13} strokeWidth={2.5} />
          <span>INSTALAR</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="w-full max-w-sm rounded-xl bg-[#0e0c0a] border border-amber-600/50 p-6 shadow-2xl relative text-stone-200 font-serif">
              <button
                onClick={() => setShowIOSGuide(false)}
                className="absolute top-3 right-3 text-stone-400 hover:text-amber-300 transition-colors"
              >
                <X size={18} />
              </button>

              <div className="flex items-center gap-3 border-b border-amber-900/40 pb-3 mb-4">
                <img src="/icone-main.png" alt="REALMOR" className="w-10 h-10 rounded-md border border-amber-500/40" />
                <div>
                  <h3 className="font-cinzel font-bold text-amber-200 text-base">Instalar REALMOR</h3>
                  <p className="text-[11px] text-stone-400">Adicione à Tela de Início do iOS</p>
                </div>
              </div>

              <ol className="space-y-3 text-xs text-stone-300">
                <li className="flex items-start gap-2">
                  <span className="font-bold text-amber-400 font-cinzel">1.</span>
                  <span>Toque no botão <strong className="text-amber-200 inline-flex items-center gap-1"><Share2 size={12} /> Compartilhar</strong> na barra do Safari.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-amber-400 font-cinzel">2.</span>
                  <span>Role o menu para baixo e selecione <strong className="text-amber-200">Adicionar à Tela de Início</strong>.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-amber-400 font-cinzel">3.</span>
                  <span>Abra o REALMOR diretamente como aplicativo na sua tela inicial!</span>
                </li>
              </ol>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-stone-950 font-cinzel font-bold text-xs uppercase tracking-wider transition-all"
              >
                ENTENDIDO
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
