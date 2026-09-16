import React, { useRef, useEffect, useState, useCallback } from 'react';
import { ToolType, GridSettings, FogSettings, MapMarker } from './types';
import { MapMarkers } from './MapMarkers';
import { 
  NATIVE_MAP_WIDTH, 
  NATIVE_MAP_HEIGHT, 
  DEFAULT_FOG_SETTINGS, 
  applyOrganicFogRect, 
  revealOrganicFogRect, 
  coverEntireMapFog, 
  clearEntireMapFog 
} from './fogUtils';
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

interface MapCanvasProps {
  imageUrl: string;
  activeTool: ToolType;
  gridSettings: GridSettings;
  fogSettings?: FogSettings;
  fogData?: string;
  onFogChange: (newFogData: string) => void;
  markers: MapMarker[];
  selectedMarkerId: string | null;
  onSelectMarker: (markerId: string | null) => void;
  onUpdateMarkerPosition: (markerId: string, x: number, y: number) => void;
  onAddMarker: (x: number, y: number) => void;
  zoom: number;
  setZoom: React.Dispatch<React.SetStateAction<number>>;
  pan: { x: number; y: number };
  setPan: React.Dispatch<React.SetStateAction<{ x: number; y: number }>>;
  onResetView: () => void;
  resetViewTrigger?: number;
  isReadOnly?: boolean;
}

interface SelectionBox {
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
}

export const MapCanvas: React.FC<MapCanvasProps> = ({
  imageUrl,
  activeTool,
  gridSettings,
  fogSettings = DEFAULT_FOG_SETTINGS,
  fogData,
  onFogChange,
  markers,
  selectedMarkerId,
  onSelectMarker,
  onUpdateMarkerPosition,
  onAddMarker,
  zoom,
  setZoom,
  pan,
  setPan,
  onResetView,
  resetViewTrigger,
  isReadOnly = false
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const fogCanvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isSpacePressed, setIsSpacePressed] = useState(false);

  // Seleção Retangular de Névoa (Ocultar ou Revelar)
  const [selectionBox, setSelectionBox] = useState<SelectionBox | null>(null);
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number } | null>(null);

  // Monitorar tecla de espaço para atalho de Pan rápido
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        setIsSpacePressed(true);
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setIsSpacePressed(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Conversão de coordenadas da tela para as coordenadas nativas 1920x1080 (16:9) do mapa
  const getMapCoordinates = useCallback((clientX: number, clientY: number) => {
    if (!stageRef.current) return { x: 0, y: 0 };
    const rect = stageRef.current.getBoundingClientRect();
    const currentScale = rect.width / NATIVE_MAP_WIDTH;
    if (currentScale <= 0) return { x: 0, y: 0 };

    const x = (clientX - rect.left) / currentScale;
    const y = (clientY - rect.top) / currentScale;

    return {
      x: Math.max(0, Math.min(NATIVE_MAP_WIDTH, x)),
      y: Math.max(0, Math.min(NATIVE_MAP_HEIGHT, y))
    };
  }, []);

  // Enquadramento automático no espaço disponível respeitando rigorosamente 16:9
  const autoFit16by9 = useCallback(() => {
    if (!containerRef.current) return;
    const cw = containerRef.current.clientWidth;
    const ch = containerRef.current.clientHeight;
    if (cw <= 0 || ch <= 0) return;

    // Margem de 96% para máximo aproveitamento do espaço mantendo conforto visual
    const margin = 0.96;
    const scaleW = (cw * margin) / NATIVE_MAP_WIDTH;
    const scaleH = (ch * margin) / NATIVE_MAP_HEIGHT;
    const targetZoom = Math.min(scaleW, scaleH);

    const targetPanX = (cw - NATIVE_MAP_WIDTH * targetZoom) / 2;
    const targetPanY = (ch - NATIVE_MAP_HEIGHT * targetZoom) / 2;

    setZoom(targetZoom);
    setPan({ x: targetPanX, y: targetPanY });
  }, [setZoom, setPan]);

  // Ao carregar a imagem pela primeira vez
  const handleImageLoad = () => {
    setIsImageLoaded(true);
    autoFit16by9();
  };

  // Re-centralizar sempre que o botão de reset for acionado externamente
  useEffect(() => {
    if (resetViewTrigger && resetViewTrigger > 0) {
      autoFit16by9();
    }
  }, [resetViewTrigger, autoFit16by9]);

  // Observador de redimensionamento do contêiner para recalcular espaço sem deformar o mapa 16:9
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver(() => {
      autoFit16by9();
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [autoFit16by9]);

  // Sincronizar / Carregar a camada da Névoa de Guerra no Canvas 1920x1080
  useEffect(() => {
    if (!fogCanvasRef.current || !isImageLoaded) return;
    const canvas = fogCanvasRef.current;
    canvas.width = NATIVE_MAP_WIDTH;
    canvas.height = NATIVE_MAP_HEIGHT;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (fogData && fogData.length > 50) {
      const fogImg = new Image();
      fogImg.crossOrigin = 'anonymous';
      fogImg.onload = () => {
        ctx.clearRect(0, 0, NATIVE_MAP_WIDTH, NATIVE_MAP_HEIGHT);
        ctx.drawImage(fogImg, 0, 0, NATIVE_MAP_WIDTH, NATIVE_MAP_HEIGHT);
      };
      fogImg.src = fogData;
    } else {
      ctx.clearRect(0, 0, NATIVE_MAP_WIDTH, NATIVE_MAP_HEIGHT);
    }
  }, [fogData, isImageLoaded]);

  // Funções globais chamadas pelos botões de cobrir e limpar névoa
  useEffect(() => {
    (window as any).__vtt_cover_all_fog = () => {
      if (!fogCanvasRef.current) return;
      const canvas = fogCanvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      coverEntireMapFog(ctx, NATIVE_MAP_WIDTH, NATIVE_MAP_HEIGHT, fogSettings);
      onFogChange(canvas.toDataURL());
    };

    (window as any).__vtt_clear_all_fog = () => {
      if (!fogCanvasRef.current) return;
      const canvas = fogCanvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      clearEntireMapFog(ctx, NATIVE_MAP_WIDTH, NATIVE_MAP_HEIGHT);
      onFogChange('');
    };

    return () => {
      delete (window as any).__vtt_cover_all_fog;
      delete (window as any).__vtt_clear_all_fog;
    };
  }, [onFogChange, fogSettings]);

  // Tratar Zoom com a roda do mouse (focado no cursor)
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (!containerRef.current) return;

    const zoomFactor = e.deltaY < 0 ? 1.15 : 0.87;
    const newZoom = Math.max(0.15, Math.min(zoom * zoomFactor, 6));

    const containerRect = containerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - containerRect.left;
    const mouseY = e.clientY - containerRect.top;

    const newPanX = mouseX - (mouseX - pan.x) * (newZoom / zoom);
    const newPanY = mouseY - (mouseY - pan.y) * (newZoom / zoom);

    setZoom(newZoom);
    setPan({ x: newPanX, y: newPanY });
  };

  // Início de toque/clique no Canvas
  const handlePointerDown = (e: React.PointerEvent) => {
    if (isReadOnly) return;

    // Pan via botão do meio, ferramenta Pan ou Barra de Espaço
    if (e.button === 1 || activeTool === 'pan' || isSpacePressed) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      return;
    }

    if (e.button !== 0) return;

    // Ferramenta Marcador: adiciona novo marcador
    if (activeTool === 'marker') {
      const { x, y } = getMapCoordinates(e.clientX, e.clientY);
      const percentX = Math.round((x / NATIVE_MAP_WIDTH) * 1000) / 10;
      const percentY = Math.round((y / NATIVE_MAP_HEIGHT) * 1000) / 10;
      onAddMarker(percentX, percentY);
      return;
    }

    // Ferramentas de Névoa (Ocultar ou Revelar com Seleção Retangular)
    if (activeTool === 'fog-paint' || activeTool === 'fog-reveal') {
      const mapPos = getMapCoordinates(e.clientX, e.clientY);
      setSelectionBox({
        startX: mapPos.x,
        startY: mapPos.y,
        currentX: mapPos.x,
        currentY: mapPos.y
      });
      return;
    }

    // Ferramenta Selecionar: desseleciona se clicou no mapa
    if (activeTool === 'select') {
      onSelectMarker(null);
    }
  };

  // Movimento do ponteiro
  const handlePointerMove = (e: React.PointerEvent) => {
    setCursorPos({ x: e.clientX, y: e.clientY });

    if (isPanning) {
      setPan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y
      });
      return;
    }

    // Atualiza a caixa de seleção retangular em tempo real
    if (selectionBox) {
      const mapPos = getMapCoordinates(e.clientX, e.clientY);
      setSelectionBox(prev => prev ? {
        ...prev,
        currentX: mapPos.x,
        currentY: mapPos.y
      } : null);
    }
  };

  // Finalização do toque/clique
  const handlePointerUp = () => {
    if (isPanning) {
      setIsPanning(false);
    }

    // Aplica ou revela a névoa na área retangular selecionada
    if (selectionBox) {
      const left = Math.min(selectionBox.startX, selectionBox.currentX);
      const top = Math.min(selectionBox.startY, selectionBox.currentY);
      const width = Math.abs(selectionBox.currentX - selectionBox.startX);
      const height = Math.abs(selectionBox.currentY - selectionBox.startY);

      // Só aplica se houve um arrasto mínimo de 4px para evitar cliques acidentais
      if (width >= 4 && height >= 4 && fogCanvasRef.current) {
        const canvas = fogCanvasRef.current;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const rect = { x: left, y: top, width, height };
          if (activeTool === 'fog-paint') {
            applyOrganicFogRect(ctx, rect, fogSettings);
          } else if (activeTool === 'fog-reveal') {
            revealOrganicFogRect(ctx, rect, fogSettings);
          }
          onFogChange(canvas.toDataURL());
        }
      }

      setSelectionBox(null);
    }
  };

  // Cursor CSS dinâmico
  const getCursorClass = () => {
    if (isPanning) return 'cursor-grabbing';
    switch (activeTool) {
      case 'pan': return 'cursor-grab';
      case 'marker': return 'cursor-crosshair';
      case 'fog-paint':
      case 'fog-reveal': return 'cursor-crosshair';
      case 'zoom-in': return 'cursor-zoom-in';
      case 'zoom-out': return 'cursor-zoom-out';
      default: return 'cursor-default';
    }
  };

  // Coordenadas calculadas da caixa de seleção no espaço nativo 1920x1080
  const boxRect = selectionBox ? {
    left: Math.min(selectionBox.startX, selectionBox.currentX),
    top: Math.min(selectionBox.startY, selectionBox.currentY),
    width: Math.abs(selectionBox.currentX - selectionBox.startX),
    height: Math.abs(selectionBox.currentY - selectionBox.startY)
  } : null;

  return (
    <div 
      ref={containerRef}
      id="map-canvas-viewport"
      onWheel={handleWheel}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={() => {
        handlePointerUp();
        setCursorPos(null);
      }}
      className={`relative w-full h-full overflow-hidden bg-stone-950 select-none ${getCursorClass()}`}
      style={{
        backgroundImage: `
          radial-gradient(circle at 50% 50%, rgba(20, 18, 16, 0.95) 0%, rgba(8, 7, 6, 1) 100%),
          linear-gradient(rgba(30, 27, 24, 0.4) 1px, transparent 1px),
          linear-gradient(90deg, rgba(30, 27, 24, 0.4) 1px, transparent 1px)
        `,
        backgroundSize: '100% 100%, 48px 48px, 48px 48px'
      }}
    >
      {/* CAMADA DE TRANSFORMAÇÃO 2D (ZOOM & PAN) - ESTRITAMENTE 16:9 (1920x1080) */}
      <div
        ref={stageRef}
        id="map-transform-layer"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: '0 0',
          width: NATIVE_MAP_WIDTH,
          height: NATIVE_MAP_HEIGHT,
          aspectRatio: '16 / 9'
        }}
        className="absolute top-0 left-0 transition-none will-change-transform shadow-[0_0_90px_rgba(0,0,0,0.95)]"
      >
        {/* 1. Imagem Principal do Mapa (16:9 Full HD) */}
        <img
          ref={imgRef}
          src={imageUrl}
          alt="Mapa de Batalha Full HD 16:9"
          onLoad={handleImageLoad}
          crossOrigin="anonymous"
          className="w-full h-full object-contain pointer-events-none select-none block bg-stone-950"
          referrerPolicy="no-referrer"
        />

        {/* 2. Camada da Grade Tática (Tied rigorosamente ao sistema de coordenadas 16:9) */}
        {gridSettings.enabled && (
          <svg 
            className="absolute inset-0 w-full h-full pointer-events-none z-10"
            width={NATIVE_MAP_WIDTH}
            height={NATIVE_MAP_HEIGHT}
            style={{ opacity: gridSettings.opacity ?? 0.4 }}
          >
            <defs>
              <pattern
                id="tactical-grid-pattern-16-9"
                width={gridSettings.size}
                height={gridSettings.size}
                patternUnits="userSpaceOnUse"
              >
                <path
                  d={`M ${gridSettings.size} 0 L 0 0 0 ${gridSettings.size}`}
                  fill="none"
                  stroke={gridSettings.color || 'rgb(217, 119, 6)'}
                  strokeWidth="1.2"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#tactical-grid-pattern-16-9)" />
          </svg>
        )}

        {/* 3. Camada da Névoa de Guerra Orgânica (Canvas 1920x1080) */}
        <canvas
          ref={fogCanvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none z-15"
          style={{ opacity: isReadOnly ? (fogSettings.density ?? 1) : (fogSettings.density ?? 0.95) }}
        />

        {/* 4. Caixa de Seleção Retangular Ativa (Ao arrastar no mapa) */}
        {boxRect && (
          <div
            id="fog-active-selection-box"
            className={`absolute pointer-events-none z-25 border-2 transition-none ${
              activeTool === 'fog-paint'
                ? 'border-amber-400/90 bg-stone-950/75 shadow-[0_0_20px_rgba(245,158,11,0.4)]'
                : 'border-cyan-400/90 bg-cyan-950/30 shadow-[0_0_20px_rgba(34,211,238,0.4)]'
            }`}
            style={{
              left: boxRect.left,
              top: boxRect.top,
              width: boxRect.width,
              height: boxRect.height,
              borderStyle: 'dashed'
            }}
          >
            <div className="absolute top-1 left-1.5 px-1.5 py-0.5 rounded bg-black/80 text-[10px] font-mono font-bold text-amber-300">
              {Math.round(boxRect.width)} × {Math.round(boxRect.height)} px
            </div>
          </div>
        )}

        {/* 5. Camada de Marcadores */}
        <MapMarkers
          markers={markers}
          selectedMarkerId={selectedMarkerId}
          onSelectMarker={onSelectMarker}
          onUpdateMarkerPosition={onUpdateMarkerPosition}
          isInteractive={!isReadOnly && activeTool === 'select'}
        />
      </div>

      {/* Controles Flutuantes Discretos de Zoom e Reset no Canto Inferior Direito */}
      {!isReadOnly && (
        <div className="absolute bottom-4 right-4 z-30 flex items-center gap-1.5 p-1 rounded-xl bg-stone-950/90 border border-amber-900/50 shadow-2xl backdrop-blur-md">
          <button
            type="button"
            onClick={() => setZoom(z => Math.max(0.15, z * 0.85))}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-stone-400 hover:text-amber-300 hover:bg-stone-900 transition-colors"
            title="Diminuir Zoom"
          >
            <ZoomOut size={15} />
          </button>
          <span className="text-[11px] font-mono font-bold text-amber-300/90 px-1 min-w-[42px] text-center">
            {Math.round(zoom * 100)}%
          </span>
          <button
            type="button"
            onClick={() => setZoom(z => Math.min(5, z * 1.15))}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-stone-400 hover:text-amber-300 hover:bg-stone-900 transition-colors"
            title="Aumentar Zoom"
          >
            <ZoomIn size={15} />
          </button>
          <div className="w-px h-4 bg-stone-800 mx-0.5" />
          <button
            type="button"
            onClick={() => {
              autoFit16by9();
              onResetView();
            }}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-stone-400 hover:text-amber-300 hover:bg-stone-900 transition-colors"
            title="Centralizar e Enquadrar Mapa 16:9"
          >
            <RotateCcw size={14} />
          </button>
        </div>
      )}
    </div>
  );
};
