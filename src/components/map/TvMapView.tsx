import React, { useEffect, useState, useRef, useCallback } from 'react';
import { subscribeTvSync, getStoredTvState } from './mapService';
import { TvSyncState, TvSyncQuadrantItem } from './types';
import { calculateAutomaticGrid } from './gridUtils';
import { MapCanvas } from './MapCanvas';
import { Tv, Maximize2, Minimize2, Radio, Compass } from 'lucide-react';

export const TvMapView: React.FC = () => {
  const [tvState, setTvState] = useState<TvSyncState | null>(() => getStoredTvState());
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isIdle, setIsIdle] = useState(false);
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Escuta as transmissões do Mestre em tempo real (Estritamente Leitura via onSnapshot)
  useEffect(() => {
    const unsubscribe = subscribeTvSync((state) => {
      if (state && (state.imageUrl || (state.quadrants && state.quadrants.length > 0))) {
        setTvState(state);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Monitorar mudanças no status de tela cheia (incluindo ESC)
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, []);

  // Ocultar cursor e botão de controle quando ocioso
  const handleUserActivity = useCallback(() => {
    setIsIdle(false);
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    idleTimerRef.current = setTimeout(() => {
      setIsIdle(true);
    }, 2500);
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', handleUserActivity);
    window.addEventListener('touchstart', handleUserActivity);
    window.addEventListener('keydown', handleUserActivity);

    return () => {
      window.removeEventListener('mousemove', handleUserActivity);
      window.removeEventListener('touchstart', handleUserActivity);
      window.removeEventListener('keydown', handleUserActivity);
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, [handleUserActivity]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const splitCount = tvState?.splitCount || 1;
  const quadrants: TvSyncQuadrantItem[] = tvState?.quadrants && tvState.quadrants.length > 0
    ? tvState.quadrants.slice(0, splitCount)
    : tvState?.imageUrl
    ? [{
        mapId: tvState.mapId,
        mapName: tvState.mapName,
        imageUrl: tvState.imageUrl,
        grid: tvState.grid,
        fogData: tvState.fogData,
        fogSettings: tvState.fogSettings,
        visionAreas: tvState.visionAreas || [],
        markers: tvState.markers || [],
        drawings: tvState.drawings || [],
        shapes: tvState.shapes || [],
        viewport: tvState.viewport || { zoom: 1, panX: 0, panY: 0 }
      }]
    : [];

  return (
    <div 
      id="tv-mapa-tela-cheia-container"
      className={`fixed inset-0 w-screen h-screen bg-black overflow-hidden select-none flex flex-col items-center justify-center ${
        isIdle ? 'cursor-none' : 'cursor-default'
      }`}
    >
      {/* Se ainda não recebeu nenhum mapa transmitido */}
      {!tvState || (!tvState.imageUrl && quadrants.length === 0) ? (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-6 select-none bg-black">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border border-amber-600/30 bg-stone-950 flex items-center justify-center text-amber-400 shadow-[0_0_40px_rgba(245,158,11,0.15)] relative animate-pulse">
            <Tv size={38} />
            <Radio size={16} className="absolute top-2 right-2 text-amber-500 animate-ping" />
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-mono text-amber-500/60 uppercase tracking-[0.4em] font-bold">
              REALMOR • MODO TV
            </span>
            <h1 className="text-2xl sm:text-3xl font-cinzel text-amber-200 uppercase font-black tracking-wider text-gold-gradient">
              CANAL DA TV
            </h1>
            <p className="text-xs sm:text-sm font-cinzel text-stone-400 italic max-w-md mx-auto">
              Aguardando o Mestre transmitir a cena do mapa...
            </p>
          </div>

          <div className="pt-2 flex items-center gap-2 text-xs font-cinzel text-stone-500">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>TV Conectada ao Reino</span>
          </div>
        </div>
      ) : (
        /* Visualização Exclusiva e 100% Limpa da TV (Sem menus, sem textos, sem água, sem bordas) */
        <div className="w-full h-full relative overflow-hidden bg-black flex items-center justify-center">
          {splitCount === 1 ? (
            /* 1 MAPA (Ocupa 100% da tela preservando a proporção 16:9) */
            <TvQuadrantCanvas item={quadrants[0] || tvState} />
          ) : splitCount === 2 ? (
            /* 2 MAPAS (Lado a Lado) */
            <div className="w-full h-full grid grid-cols-2 gap-1 bg-black p-0.5">
              {quadrants.map((quad, idx) => (
                <div key={quad.mapId || idx} className="relative w-full h-full overflow-hidden bg-black">
                  <TvQuadrantCanvas item={quad} />
                </div>
              ))}
            </div>
          ) : splitCount === 3 ? (
            /* 3 MAPAS */
            <div className="w-full h-full grid grid-cols-2 grid-rows-2 gap-1 bg-black p-0.5">
              <div className="relative w-full h-full overflow-hidden bg-black">
                {quadrants[0] && <TvQuadrantCanvas item={quadrants[0]} />}
              </div>
              <div className="relative w-full h-full overflow-hidden bg-black row-span-2">
                {quadrants[1] && <TvQuadrantCanvas item={quadrants[1]} />}
              </div>
              <div className="relative w-full h-full overflow-hidden bg-black">
                {quadrants[2] && <TvQuadrantCanvas item={quadrants[2]} />}
              </div>
            </div>
          ) : (
            /* 4 MAPAS (Grade 2x2) */
            <div className="w-full h-full grid grid-cols-2 grid-rows-2 gap-1 bg-black p-0.5">
              {quadrants.map((quad, idx) => (
                <div key={quad.mapId || idx} className="relative w-full h-full overflow-hidden bg-black">
                  <TvQuadrantCanvas item={quad} />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Botão Flutuante Discreto de Tela Cheia (Some quando ocioso) */}
      <div 
        className={`fixed top-4 right-4 z-50 transition-opacity duration-300 ${
          isIdle ? 'opacity-0 pointer-events-none' : 'opacity-70 hover:opacity-100'
        }`}
      >
        <button
          type="button"
          onClick={toggleFullscreen}
          className="p-2.5 rounded-xl bg-stone-950/85 border border-amber-900/40 text-amber-300 hover:text-amber-100 hover:bg-stone-900 shadow-2xl backdrop-blur-md cursor-pointer flex items-center gap-2 text-xs font-cinzel font-bold transition-all"
          title={isFullscreen ? 'Sair da Tela Cheia (ESC)' : 'Entrar em Tela Cheia'}
        >
          {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          <span className="hidden sm:inline">
            {isFullscreen ? 'Sair' : 'Tela Cheia'}
          </span>
        </button>
      </div>
    </div>
  );
};

// Subcomponente de Canvas Isolado para cada Quadrante da TV
const TvQuadrantCanvas: React.FC<{ item: any }> = ({ item }) => {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });

  if (!item.imageUrl) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center select-none bg-black">
        <div className="w-12 h-12 rounded-xl bg-stone-950 border border-amber-900/30 flex items-center justify-center text-amber-500/50 mb-2">
          <Compass size={22} className="stroke-[1.5]" />
        </div>
        <span className="font-cinzel text-xs font-bold text-amber-400/50 tracking-wider">
          DESTINO NÃO REVELADO
        </span>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative overflow-hidden bg-black flex items-center justify-center">
      <MapCanvas
        imageUrl={item.imageUrl}
        activeTool="select"
        gridSettings={item.grid || calculateAutomaticGrid()}
        fogSettings={item.fogSettings}
        fogData={item.fogData}
        visionAreas={item.visionAreas || []}
        onFogChange={() => {}}
        markers={item.markers || []}
        selectedMarkerId={null}
        onSelectMarker={() => {}}
        onUpdateMarkerPosition={() => {}}
        onAddMarker={() => {}}
        drawings={item.drawings || []}
        shapes={item.shapes || []}
        zoom={zoom}
        setZoom={setZoom}
        pan={pan}
        setPan={setPan}
        onResetView={() => {
          setZoom(1);
          setPan({ x: 0, y: 0 });
        }}
        isReadOnly={true}
        isTvMode={true}
      />
    </div>
  );
};

export default TvMapView;
