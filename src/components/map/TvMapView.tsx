import React, { useEffect, useState, useRef } from 'react';
import { subscribeTvSync, getStoredTvState } from './mapService';
import { TvSyncState, TvSyncQuadrantItem } from './types';
import { calculateAutomaticGrid } from './gridUtils';
import { MapCanvas } from './MapCanvas';
import { Tv, Sparkles, Maximize2, Minimize2, Radio, Compass } from 'lucide-react';

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
        markers: tvState.markers || [],
        drawings: tvState.drawings || [],
        shapes: tvState.shapes || [],
        viewport: tvState.viewport || { zoom: 1, panX: 0, panY: 0 }
      }]
    : [];

  return (
    <div 
      id="tv-mapa-teste-container"
      onMouseMove={handleMouseMove}
      className={`fixed inset-0 w-screen h-screen bg-black overflow-hidden select-none flex flex-col ${
        isIdle ? 'cursor-none' : 'cursor-default'
      }`}
    >
      {/* Se ainda não recebeu nenhum mapa transmitido */}
      {!tvState || (!tvState.imageUrl && quadrants.length === 0) ? (
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
        /* Renderização dos Mapas na TV (1, 2, 3 ou 4 Mapas) */
        <div className="flex-1 relative w-full h-full overflow-hidden bg-black">
          {splitCount === 1 ? (
            /* 1 MAPA (Tela Inteira) */
            <TvQuadrantCanvas item={quadrants[0] || tvState} />
          ) : splitCount === 2 ? (
            /* 2 MAPAS (Lado a Lado) */
            <div className="w-full h-full grid grid-cols-2 gap-1.5 bg-stone-950 p-1">
              {quadrants.map((quad, idx) => (
                <div key={quad.mapId || idx} className="relative w-full h-full overflow-hidden rounded bg-black border border-amber-950/60 shadow-lg">
                  <TvQuadrantCanvas item={quad} />
                </div>
              ))}
            </div>
          ) : splitCount === 3 ? (
            /* 3 MAPAS (Composição Equilibrada: 2 à esquerda empilhados, 1 à direita ocupando toda altura) */
            <div className="w-full h-full grid grid-cols-2 grid-rows-2 gap-1.5 bg-stone-950 p-1">
              <div className="relative w-full h-full overflow-hidden rounded bg-black border border-amber-950/60 shadow-lg">
                {quadrants[0] && <TvQuadrantCanvas item={quadrants[0]} />}
              </div>
              <div className="relative w-full h-full overflow-hidden rounded bg-black border border-amber-950/60 shadow-lg row-span-2">
                {quadrants[1] && <TvQuadrantCanvas item={quadrants[1]} />}
              </div>
              <div className="relative w-full h-full overflow-hidden rounded bg-black border border-amber-950/60 shadow-lg">
                {quadrants[2] && <TvQuadrantCanvas item={quadrants[2]} />}
              </div>
            </div>
          ) : (
            /* 4 MAPAS (Grade 2x2) */
            <div className="w-full h-full grid grid-cols-2 grid-rows-2 gap-1.5 bg-stone-950 p-1">
              {quadrants.map((quad, idx) => (
                <div key={quad.mapId || idx} className="relative w-full h-full overflow-hidden rounded bg-black border border-amber-950/60 shadow-lg">
                  <TvQuadrantCanvas item={quad} />
                </div>
              ))}
            </div>
          )}
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

// Subcomponente de Canvas Isolado para cada Quadrante da TV
const TvQuadrantCanvas: React.FC<{ item: any }> = ({ item }) => {
  const [zoom, setZoom] = useState(item.viewport?.zoom ?? 1);
  const [pan, setPan] = useState({ x: item.viewport?.panX ?? 0, y: item.viewport?.panY ?? 0 });

  useEffect(() => {
    if (item.viewport) {
      setZoom(item.viewport.zoom ?? 1);
      setPan({ x: item.viewport.panX ?? 0, y: item.viewport.panY ?? 0 });
    }
  }, [item.viewport?.zoom, item.viewport?.panX, item.viewport?.panY]);

  if (!item.imageUrl) {
    return (
      <div 
        className="w-full h-full flex flex-col items-center justify-center p-4 text-center select-none"
        style={{
          backgroundImage: 'radial-gradient(ellipse at center, rgba(30, 24, 18, 0.7) 0%, rgba(10, 9, 8, 0.98) 100%)'
        }}
      >
        <div className="w-12 h-12 rounded-xl bg-amber-950/30 border border-amber-900/40 flex items-center justify-center text-amber-500/60 mb-2">
          <Compass size={22} className="stroke-[1.5]" />
        </div>
        <span className="font-cinzel text-xs font-bold text-amber-400/60 tracking-wider">
          🗺️ DESTINO NÃO REVELADO
        </span>
        <span className="font-cinzel text-[10px] text-stone-500 italic mt-0.5">
          Aguardando visão do Mestre...
        </span>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative overflow-hidden">
      <MapCanvas
        imageUrl={item.imageUrl}
        activeTool="select"
        gridSettings={item.grid || calculateAutomaticGrid()}
        fogSettings={item.fogSettings}
        fogData={item.fogData}
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
      />
      {/* Identificador sutil do nome do mapa no quadrante */}
      {item.mapName && (
        <div className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded bg-stone-950/70 border border-amber-900/40 text-[10px] font-cinzel text-amber-300 font-bold pointer-events-none opacity-60">
          {item.mapName}
        </div>
      )}
    </div>
  );
};

export default TvMapView;
