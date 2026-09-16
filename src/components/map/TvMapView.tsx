import React, { useEffect, useState, useRef } from 'react';
import { subscribeTvSync, sendTvHeartbeat } from './mapService';
import { TvSyncState } from './types';
import { MapCanvas } from './MapCanvas';
import { Tv, Sparkles, Maximize2, Minimize2, Radio } from 'lucide-react';

export const TvMapView: React.FC = () => {
  const [tvState, setTvState] = useState<TvSyncState | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isIdle, setIsIdle] = useState(false);
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Escuta as transmissões do Mestre em tempo real (Estritamente Leitura via onSnapshot)
  useEffect(() => {
    const unsubscribe = subscribeTvSync((state) => {
      if (state && state.imageUrl) {
        setTvState(state);
        if (state.viewport) {
          setZoom(state.viewport.zoom ?? 1);
          setPan({ x: state.viewport.panX ?? 0, y: state.viewport.panY ?? 0 });
        }
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Ocultar cursor e controles quando ocioso
  const handleMouseMove = () => {
    setIsIdle(false);
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    idleTimerRef.current = setTimeout(() => {
      setIsIdle(true);
    }, 3500);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  return (
    <div 
      id="tv-mapa-teste-container"
      onMouseMove={handleMouseMove}
      className={`fixed inset-0 w-screen h-screen bg-black overflow-hidden select-none flex flex-col ${
        isIdle ? 'cursor-none' : 'cursor-default'
      }`}
    >
      {/* Se ainda não recebeu nenhum mapa transmitido */}
      {!tvState || !tvState.imageUrl ? (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-6">
          <div className="w-24 h-24 rounded-full border border-amber-600/30 bg-stone-950 flex items-center justify-center text-amber-400 shadow-[0_0_40px_rgba(245,158,11,0.15)] relative animate-pulse">
            <Tv size={42} />
            <Radio size={18} className="absolute top-2 right-2 text-amber-500 animate-ping" />
          </div>

          <div className="space-y-3">
            <span className="text-[11px] font-mono text-amber-500/60 uppercase tracking-[0.4em] font-bold">
              REALMOR • MODO TV
            </span>
            <h1 className="text-3xl sm:text-4xl font-cinzel text-amber-200 uppercase font-black tracking-wider text-gold-gradient">
              CANAL DE TRANSMISSÃO
            </h1>
            <p className="text-sm font-cinzel text-stone-400 italic max-w-md mx-auto">
              Aguardando o Mestre transmitir a cena do mapa...
            </p>
          </div>

          <div className="pt-4 flex items-center gap-2 text-xs font-cinzel text-stone-500">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>TV Conectada ao Reino</span>
          </div>
        </div>
      ) : (
        /* Mapa sincronizado com Névoa de Guerra e Marcadores */
        <div className="flex-1 relative w-full h-full">
          <MapCanvas
            imageUrl={tvState.imageUrl}
            activeTool="select"
            gridSettings={tvState.grid || { enabled: true, size: 50, color: 'rgba(217, 119, 6, 0.35)', opacity: 0.35 }}
            fogSettings={tvState.fogSettings}
            fogData={tvState.fogData}
            onFogChange={() => {}}
            markers={tvState.markers || []}
            selectedMarkerId={null}
            onSelectMarker={() => {}}
            onUpdateMarkerPosition={() => {}}
            onAddMarker={() => {}}
            zoom={zoom}
            setZoom={setZoom}
            pan={pan}
            setPan={setPan}
            onResetView={() => {
              setZoom(1);
              setPan({ x: 0, y: 0 });
            }}
            isReadOnly={true}
          />
        </div>
      )}

      {/* Botão Discreto de Tela Cheia no Canto da TV */}
      <div 
        className={`fixed top-4 right-4 z-50 transition-opacity duration-500 ${
          isIdle ? 'opacity-0 pointer-events-none' : 'opacity-70 hover:opacity-100'
        }`}
      >
        <button
          type="button"
          onClick={toggleFullscreen}
          className="p-2.5 rounded-xl bg-stone-950/80 border border-amber-900/40 text-amber-300 hover:bg-stone-900 shadow-xl backdrop-blur-md cursor-pointer flex items-center gap-2 text-xs font-cinzel font-bold"
          title="Alternar Tela Cheia"
        >
          {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          <span className="hidden sm:inline">
            {isFullscreen ? 'Sair' : 'Tela Cheia'}
          </span>
        </button>
      </div>

      {/* Marca d'água sutil no canto inferior esquerdo */}
      <div 
        className={`fixed bottom-3 left-4 z-50 transition-opacity duration-500 ${
          isIdle ? 'opacity-0' : 'opacity-40'
        }`}
      >
        <span className="text-[10px] font-cinzel text-amber-400 font-bold uppercase tracking-widest">
          {tvState?.mapName ? `✦ ${tvState.mapName}` : 'REALMOR VTT'}
        </span>
      </div>
    </div>
  );
};

export default TvMapView;
