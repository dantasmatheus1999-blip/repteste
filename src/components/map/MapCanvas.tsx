import React, { useRef, useEffect, useState, useCallback, useMemo, useId } from 'react';
import { 
  ToolType, 
  GridSettings, 
  FogSettings, 
  FogMode, 
  FogShape, 
  MapMarker, 
  MapDrawing, 
  MapShape, 
  ShapeType, 
  SelectedObject,
  VisionArea
} from './types';
import { MapMarkers } from './MapMarkers';
import { MapVectorLayers } from './MapVectorLayers';
import { 
  NATIVE_MAP_WIDTH, 
  NATIVE_MAP_HEIGHT, 
  DEFAULT_FOG_SETTINGS, 
  Point,
  applyOrganicFogRect, 
  revealOrganicFogRect, 
  applyOrganicFogPolygon,
  revealOrganicFogPolygon,
  coverEntireMapFog, 
  clearEntireMapFog 
} from './fogUtils';
import { ZoomIn, ZoomOut, RotateCcw, Trash2 } from 'lucide-react';

interface MapCanvasProps {
  imageUrl: string;
  activeTool: ToolType;
  gridSettings: GridSettings;
  fogSettings?: FogSettings;
  fogData?: string;
  onFogChange: (newFogData: string) => void;
  // Áreas de Visão
  visionAreas?: VisionArea[];
  onAddVisionArea?: (area: Omit<VisionArea, 'id'>) => void;
  onUpdateVisionArea?: (id: string, updates: Partial<VisionArea>) => void;
  onDeleteVisionArea?: (id: string) => void;
  selectedVisionRadius?: number;
  // Marcadores
  markers: MapMarker[];
  selectedMarkerId: string | null;
  onSelectMarker: (markerId: string | null) => void;
  onUpdateMarkerPosition: (markerId: string, x: number, y: number) => void;
  onAddMarker: (x: number, y: number) => void;
  // Desenhos e Formas
  drawings?: MapDrawing[];
  shapes?: MapShape[];
  selectedObject?: SelectedObject | null;
  onSelectObject?: (obj: SelectedObject | null) => void;
  onDeleteObject?: (obj: SelectedObject) => void;
  onAddDrawing?: (drawing: Omit<MapDrawing, 'id'>) => void;
  onAddShape?: (shape: Omit<MapShape, 'id'>) => void;
  onUpdateShape?: (shapeId: string, updates: Partial<MapShape>) => void;
  onUpdateDrawing?: (drawingId: string, updates: Partial<MapDrawing>) => void;
  // Configurações de Desenho / Formas / Medição
  activeShapeType?: ShapeType;
  shapeStrokeColor?: string;
  shapeStrokeWidth?: number;
  drawColor?: string;
  drawWidth?: number;
  scaleMeters?: number;
  // Viewport
  zoom: number;
  setZoom: React.Dispatch<React.SetStateAction<number>>;
  pan: { x: number; y: number };
  setPan: React.Dispatch<React.SetStateAction<{ x: number; y: number }>>;
  onResetView: () => void;
  resetViewTrigger?: number;
  isReadOnly?: boolean;
  isTvMode?: boolean;
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
  visionAreas = [],
  onAddVisionArea,
  onUpdateVisionArea,
  onDeleteVisionArea,
  selectedVisionRadius = 10,
  markers,
  selectedMarkerId,
  onSelectMarker,
  onUpdateMarkerPosition,
  onAddMarker,
  drawings = [],
  shapes = [],
  selectedObject,
  onSelectObject,
  onDeleteObject,
  onAddDrawing,
  onAddShape,
  onUpdateShape,
  onUpdateDrawing,
  activeShapeType = 'rect',
  shapeStrokeColor = '#f59e0b',
  shapeStrokeWidth = 3,
  drawColor = '#f59e0b',
  drawWidth = 4,
  scaleMeters = 3,
  zoom,
  setZoom,
  pan,
  setPan,
  onResetView,
  resetViewTrigger,
  isReadOnly = false,
  isTvMode = false
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const fogCanvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isSpacePressed, setIsSpacePressed] = useState(false);

  // Controle de arrasto da Área de Visão
  const [isDraggingVision, setIsDraggingVision] = useState(false);
  const [draggingVisionId, setDraggingVisionId] = useState<string | null>(null);
  const [dragVisionOffset, setDragVisionOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const autoId = useId();
  const gridPatternId = useMemo(() => `tactical-grid-pattern-${autoId.replace(/[^a-zA-Z0-9_-]/g, '')}`, [autoId]);

  // 1. Névoa: Retângulo e Livre (Lasso)
  const [selectionBox, setSelectionBox] = useState<SelectionBox | null>(null);
  const [freehandPoints, setFreehandPoints] = useState<Point[]>([]);
  const [isDrawingFreehand, setIsDrawingFreehand] = useState(false);

  // 2. Régua de Medição (Temporária)
  const [measurePoints, setMeasurePoints] = useState<{ start: Point; current: Point } | null>(null);

  // 3. Desenho Livre Ativo
  const [activeDrawingPoints, setActiveDrawingPoints] = useState<Point[]>([]);
  const [isDrawingActive, setIsDrawingActive] = useState(false);

  // 4. Criação de Forma Geométrica Ativa
  const [activeShapePreview, setActiveShapePreview] = useState<{ start: Point; current: Point } | null>(null);

  const isFogActive = activeTool === 'fog' || activeTool === 'fog-paint' || activeTool === 'fog-reveal' || activeTool === 'fog-vision';
  const currentFogMode: FogMode = fogSettings.mode || (activeTool === 'fog-reveal' ? 'reveal' : 'hide');
  const currentFogShape: FogShape = fogSettings.shape || 'rect';

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

  // Coordenadas da tela para as coordenadas nativas 1920x1080 (16:9) do mapa
  const getMapCoordinates = useCallback((clientX: number, clientY: number): Point => {
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

  const setZoomRef = useRef(setZoom);
  const setPanRef = useRef(setPan);
  const zoomRef = useRef(zoom);
  const panRef = useRef(pan);
  const isReadOnlyRef = useRef(isReadOnly);
  const isTvModeRef = useRef(isTvMode);

  setZoomRef.current = setZoom;
  setPanRef.current = setPan;
  zoomRef.current = zoom;
  panRef.current = pan;
  isReadOnlyRef.current = isReadOnly;
  isTvModeRef.current = isTvMode;

  // Enquadramento automático no espaço disponível respeitando rigorosamente 16:9
  const autoFit16by9 = useCallback(() => {
    // Se for apenas readOnly sem ser modo TV, respeita o viewport fixo
    if (isReadOnlyRef.current && !isTvModeRef.current) return;
    if (!containerRef.current) return;
    const cw = containerRef.current.clientWidth;
    const ch = containerRef.current.clientHeight;
    if (cw <= 0 || ch <= 0) return;

    // Em modo TV, utiliza 100% da área (margin = 1.0) para preenchimento total e sem barras pretas desnecessárias
    const margin = isTvModeRef.current ? 1.0 : 0.96;
    const scaleW = (cw * margin) / NATIVE_MAP_WIDTH;
    const scaleH = (ch * margin) / NATIVE_MAP_HEIGHT;
    const targetZoom = Math.min(scaleW, scaleH);

    const targetPanX = (cw - NATIVE_MAP_WIDTH * targetZoom) / 2;
    const targetPanY = (ch - NATIVE_MAP_HEIGHT * targetZoom) / 2;

    const currentZoom = zoomRef.current;
    const currentPan = panRef.current;

    const isZoomEqual = Math.abs(currentZoom - targetZoom) < 0.001;
    const isPanEqual = Math.abs(currentPan.x - targetPanX) < 0.5 && Math.abs(currentPan.y - targetPanY) < 0.5;

    // Se já estiver rigorosamente enquadrado, não dispara atualizações
    if (isZoomEqual && isPanEqual) {
      return;
    }

    if (!isZoomEqual) {
      setZoomRef.current(targetZoom);
    }
    if (!isPanEqual) {
      setPanRef.current({ x: targetPanX, y: targetPanY });
    }
  }, []);

  const hasCustomInitialViewRef = useRef(zoom !== 1 || pan.x !== 0 || pan.y !== 0);

  const handleImageLoad = () => {
    setIsImageLoaded(true);
    if (!isReadOnly || isTvMode) {
      // Se não havia viewport customizado restaurado (ou se for modo TV), ajusta automaticamente 16:9
      if (!hasCustomInitialViewRef.current || isTvMode) {
        autoFit16by9();
      }
    }
  };

  const lastResetTriggerRef = useRef(resetViewTrigger);
  useEffect(() => {
    if (resetViewTrigger && resetViewTrigger !== lastResetTriggerRef.current) {
      lastResetTriggerRef.current = resetViewTrigger;
      hasCustomInitialViewRef.current = false;
      autoFit16by9();
    }
  }, [resetViewTrigger, autoFit16by9]);

  useEffect(() => {
    if (!containerRef.current || (isReadOnly && !isTvMode)) return;
    let prevWidth = 0;
    let prevHeight = 0;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0 && (Math.abs(width - prevWidth) > 4 || Math.abs(height - prevHeight) > 4)) {
          const isInitialTick = prevWidth === 0 && prevHeight === 0;
          prevWidth = width;
          prevHeight = height;
          if (isInitialTick && hasCustomInitialViewRef.current && !isTvMode) {
            // Preserva zoom/pan restaurados no primeiro layout no editor
            continue;
          }
          autoFit16by9();
        }
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [autoFit16by9, isReadOnly, isTvMode]);

  // Sincronizar / Carregar a camada da Névoa de Guerra no Canvas 1920x1080 com recorte dinâmico das Áreas de Visão
  useEffect(() => {
    if (!fogCanvasRef.current || !isImageLoaded) return;
    const canvas = fogCanvasRef.current;
    canvas.width = NATIVE_MAP_WIDTH;
    canvas.height = NATIVE_MAP_HEIGHT;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const applyDynamicVisionCutouts = () => {
      if (!visionAreas || visionAreas.length === 0) return;
      const cellSize = gridSettings.size || 50;
      const effectiveScale = scaleMeters || gridSettings.scaleMeters || 3;
      const pxPerMeter = cellSize / effectiveScale;

      ctx.save();
      ctx.globalCompositeOperation = 'destination-out';

      for (const area of visionAreas) {
        const radiusPx = (area.radiusMeters || 10) * pxPerMeter;
        if (radiusPx <= 0) continue;

        // Borda suave / feather proporcional com efeito orgânico
        const innerR = Math.max(0, radiusPx * 0.72);
        const outerR = radiusPx;

        const grad = ctx.createRadialGradient(area.x, area.y, innerR, area.x, area.y, outerR);
        grad.addColorStop(0, 'rgba(0, 0, 0, 1.0)');
        grad.addColorStop(0.5, 'rgba(0, 0, 0, 0.85)');
        grad.addColorStop(0.85, 'rgba(0, 0, 0, 0.35)');
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(area.x, area.y, outerR, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    };

    if (fogData && fogData.length > 50) {
      const fogImg = new Image();
      fogImg.crossOrigin = 'anonymous';
      fogImg.onload = () => {
        ctx.clearRect(0, 0, NATIVE_MAP_WIDTH, NATIVE_MAP_HEIGHT);
        ctx.drawImage(fogImg, 0, 0, NATIVE_MAP_WIDTH, NATIVE_MAP_HEIGHT);
        applyDynamicVisionCutouts();
      };
      fogImg.src = fogData;
    } else {
      ctx.clearRect(0, 0, NATIVE_MAP_WIDTH, NATIVE_MAP_HEIGHT);
    }
  }, [fogData, isImageLoaded, visionAreas, gridSettings.size, gridSettings.scaleMeters, scaleMeters]);

  // Função auxiliar para operar na névoa base (sem queimar as áreas de visão no PNG)
  const modifyBaseFog = useCallback((drawFn: (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => void) => {
    const offscreen = document.createElement('canvas');
    offscreen.width = NATIVE_MAP_WIDTH;
    offscreen.height = NATIVE_MAP_HEIGHT;
    const ctx = offscreen.getContext('2d');
    if (!ctx) return;

    if (fogData && fogData.length > 50) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        ctx.drawImage(img, 0, 0, NATIVE_MAP_WIDTH, NATIVE_MAP_HEIGHT);
        drawFn(ctx, offscreen);
        onFogChange(offscreen.toDataURL());
      };
      img.src = fogData;
    } else {
      drawFn(ctx, offscreen);
      onFogChange(offscreen.toDataURL());
    }
  }, [fogData, onFogChange]);

  // Funções globais chamadas pelos botões de cobrir e limpar névoa
  useEffect(() => {
    (window as any).__vtt_cover_all_fog = () => {
      const offscreen = document.createElement('canvas');
      offscreen.width = NATIVE_MAP_WIDTH;
      offscreen.height = NATIVE_MAP_HEIGHT;
      const ctx = offscreen.getContext('2d');
      if (!ctx) return;
      coverEntireMapFog(ctx, NATIVE_MAP_WIDTH, NATIVE_MAP_HEIGHT, fogSettings);
      onFogChange(offscreen.toDataURL());
    };

    (window as any).__vtt_clear_all_fog = () => {
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

  // Início de toque/clique no Marcador Central da Área de Visão
  const handleVisionPointerDown = (e: React.PointerEvent, visionId: string) => {
    e.stopPropagation();
    if (isReadOnly) return;
    if (e.button !== 0) return;

    const mapPos = getMapCoordinates(e.clientX, e.clientY);
    const area = visionAreas.find(v => v.id === visionId);
    if (!area) return;

    setIsDraggingVision(true);
    setDraggingVisionId(visionId);
    setDragVisionOffset({
      x: mapPos.x - area.x,
      y: mapPos.y - area.y
    });
    onSelectObject?.({ id: visionId, type: 'vision' });
  };

  // Início de toque/clique no Canvas
  const handlePointerDown = (e: React.PointerEvent) => {
    if (isReadOnly) return;

    // 1. Pan via botão do meio, ferramenta Pan ou Barra de Espaço
    if (e.button === 1 || activeTool === 'pan' || isSpacePressed) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      return;
    }

    if (e.button !== 0) return;

    const mapPos = getMapCoordinates(e.clientX, e.clientY);

    // 2. Ferramenta Medir (Régua)
    if (activeTool === 'measure') {
      setMeasurePoints({
        start: mapPos,
        current: mapPos
      });
      return;
    }

    // 3. Ferramenta Área de Visão: Adiciona nova área no clique do Mestre
    if (activeTool === 'fog-vision') {
      const radius = selectedVisionRadius || 10;
      onAddVisionArea?.({
        x: Math.round(mapPos.x),
        y: Math.round(mapPos.y),
        radiusMeters: radius,
        label: `Visão ${radius}m`
      });
      return;
    }

    // 4. Ferramenta Marcador
    if (activeTool === 'marker') {
      const percentX = Math.round((mapPos.x / NATIVE_MAP_WIDTH) * 1000) / 10;
      const percentY = Math.round((mapPos.y / NATIVE_MAP_HEIGHT) * 1000) / 10;
      onAddMarker(percentX, percentY);
      return;
    }

    // 5. Ferramenta Desenhar Livre
    if (activeTool === 'draw') {
      setIsDrawingActive(true);
      setActiveDrawingPoints([mapPos]);
      return;
    }

    // 6. Ferramenta Formas Geométricas
    if (activeTool === 'shape') {
      setActiveShapePreview({
        start: mapPos,
        current: mapPos
      });
      return;
    }

    // 7. Ferramentas de Névoa (Ocultar ou Revelar)
    if (isFogActive) {
      if (currentFogShape === 'freehand') {
        setIsDrawingFreehand(true);
        setFreehandPoints([mapPos]);
      } else {
        setSelectionBox({
          startX: mapPos.x,
          startY: mapPos.y,
          currentX: mapPos.x,
          currentY: mapPos.y
        });
      }
      return;
    }

    // 8. Ferramenta Selecionar: desseleciona se clicou no fundo do mapa
    if (activeTool === 'select') {
      onSelectMarker(null);
      onSelectObject(null);
    }
  };

  // Movimento do ponteiro
  const handlePointerMove = (e: React.PointerEvent) => {
    if (isPanning) {
      setPan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y
      });
      return;
    }

    const mapPos = getMapCoordinates(e.clientX, e.clientY);

    // Arrasto de Área de Visão
    if (isDraggingVision && draggingVisionId) {
      const newX = Math.max(0, Math.min(NATIVE_MAP_WIDTH, mapPos.x - dragVisionOffset.x));
      const newY = Math.max(0, Math.min(NATIVE_MAP_HEIGHT, mapPos.y - dragVisionOffset.y));
      onUpdateVisionArea?.(draggingVisionId, {
        x: Math.round(newX),
        y: Math.round(newY)
      });
      return;
    }

    // Atualiza Régua de Medição
    if (measurePoints) {
      setMeasurePoints(prev => prev ? { ...prev, current: mapPos } : null);
    }

    // Atualiza Desenho Livre
    if (isDrawingActive) {
      setActiveDrawingPoints(prev => {
        if (prev.length === 0) return [mapPos];
        const last = prev[prev.length - 1];
        const dx = mapPos.x - last.x;
        const dy = mapPos.y - last.y;
        if (dx * dx + dy * dy >= 9) { // amostragem a cada ~3px
          return [...prev, mapPos];
        }
        return prev;
      });
    }

    // Atualiza Preview de Forma
    if (activeShapePreview) {
      setActiveShapePreview(prev => prev ? { ...prev, current: mapPos } : null);
    }

    // Atualiza Caixa de Névoa Retangular
    if (selectionBox) {
      setSelectionBox(prev => prev ? {
        ...prev,
        currentX: mapPos.x,
        currentY: mapPos.y
      } : null);
    }

    // Atualiza Seleção Livre de Névoa (Lasso)
    if (isDrawingFreehand) {
      setFreehandPoints(prev => {
        if (prev.length === 0) return [mapPos];
        const last = prev[prev.length - 1];
        const dx = mapPos.x - last.x;
        const dy = mapPos.y - last.y;
        if (dx * dx + dy * dy >= 16) {
          return [...prev, mapPos];
        }
        return prev;
      });
    }
  };

  // Finalização do toque/clique
  const handlePointerUp = () => {
    if (isPanning) {
      setIsPanning(false);
    }

    if (isDraggingVision) {
      setIsDraggingVision(false);
      setDraggingVisionId(null);
    }

    // Finalizar Desenho Livre
    if (isDrawingActive) {
      setIsDrawingActive(false);
      if (activeDrawingPoints.length >= 2) {
        onAddDrawing?.({
          points: activeDrawingPoints,
          color: drawColor,
          width: drawWidth,
          opacity: 1
        });
      }
      setActiveDrawingPoints([]);
    }

    // Finalizar Criação de Forma
    if (activeShapePreview) {
      const { start, current } = activeShapePreview;
      const dist = Math.hypot(current.x - start.x, current.y - start.y);
      if (dist >= 6) {
        onAddShape?.({
          type: activeShapeType,
          start,
          end: current,
          color: shapeStrokeColor,
          fillColor: activeShapeType === 'circle' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.15)',
          strokeWidth: shapeStrokeWidth,
          opacity: 1
        });
      }
      setActiveShapePreview(null);
    }

    // Finalizar Névoa Retangular na camada base
    if (selectionBox) {
      const left = Math.min(selectionBox.startX, selectionBox.currentX);
      const top = Math.min(selectionBox.startY, selectionBox.currentY);
      const width = Math.abs(selectionBox.currentX - selectionBox.startX);
      const height = Math.abs(selectionBox.currentY - selectionBox.startY);

      if (width >= 4 && height >= 4) {
        modifyBaseFog((ctx) => {
          const rect = { x: left, y: top, width, height };
          if (currentFogMode === 'reveal') {
            revealOrganicFogRect(ctx, rect, fogSettings);
          } else {
            applyOrganicFogRect(ctx, rect, fogSettings);
          }
        });
      }
      setSelectionBox(null);
    }

    // Finalizar Névoa Livre (Lasso) na camada base
    if (isDrawingFreehand) {
      setIsDrawingFreehand(false);
      if (freehandPoints.length >= 3) {
        modifyBaseFog((ctx) => {
          if (currentFogMode === 'reveal') {
            revealOrganicFogPolygon(ctx, freehandPoints, fogSettings);
          } else {
            applyOrganicFogPolygon(ctx, freehandPoints, fogSettings);
          }
        });
      }
      setFreehandPoints([]);
    }
  };

  // Cursor CSS dinâmico
  const getCursorClass = () => {
    if (isPanning || isDraggingVision) return 'cursor-grabbing';
    switch (activeTool) {
      case 'pan': return 'cursor-grab';
      case 'measure': return 'cursor-crosshair';
      case 'marker': return 'cursor-crosshair';
      case 'draw': return 'cursor-crosshair';
      case 'shape': return 'cursor-crosshair';
      case 'eraser': return 'cursor-not-allowed';
      case 'fog':
      case 'fog-paint':
      case 'fog-reveal':
      case 'fog-vision': return 'cursor-crosshair';
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

  // Caminho SVG para a seleção livre (Lasso) da névoa
  const freehandSvgPath = useMemo(() => {
    if (freehandPoints.length < 2) return '';
    return freehandPoints.reduce((acc, pt, idx) => {
      return idx === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
    }, '');
  }, [freehandPoints]);

  // Caminho SVG para o desenho livre ativo
  const activeDrawSvgPath = useMemo(() => {
    if (activeDrawingPoints.length < 2) return '';
    return activeDrawingPoints.reduce((acc, pt, idx) => {
      return idx === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
    }, '');
  }, [activeDrawingPoints]);

  // Cálculo da Régua Tática Tormenta 20
  const measureCalculation = useMemo(() => {
    if (!measurePoints) return null;
    const { start, current } = measurePoints;
    const distPx = Math.hypot(current.x - start.x, current.y - start.y);
    const cellSize = gridSettings.size || 50;
    const squares = Math.round((distPx / cellSize) * 10) / 10;
    const effectiveScale = scaleMeters || gridSettings.scaleMeters || 3;
    const meters = Math.round(squares * effectiveScale * 10) / 10;
    const midX = (start.x + current.x) / 2;
    const midY = (start.y + current.y) / 2;

    return {
      distPx,
      squares,
      meters,
      midX,
      midY,
      start,
      current
    };
  }, [measurePoints, gridSettings.size, gridSettings.scaleMeters, scaleMeters]);

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

        {/* 2. Camada da Grade Tática */}
        {gridSettings.enabled && (
          <svg 
            className="absolute inset-0 w-full h-full pointer-events-none z-10"
            width={NATIVE_MAP_WIDTH}
            height={NATIVE_MAP_HEIGHT}
            style={{ opacity: gridSettings.opacity ?? 0.4 }}
          >
            <defs>
              <pattern
                id={gridPatternId}
                width={Math.max(10, gridSettings.size || 50)}
                height={Math.max(10, gridSettings.size || 50)}
                patternUnits="userSpaceOnUse"
              >
                <path
                  d={`M ${Math.max(10, gridSettings.size || 50)} 0 L 0 0 0 ${Math.max(10, gridSettings.size || 50)}`}
                  fill="none"
                  stroke={gridSettings.color || '#FFFFFF'}
                  strokeWidth={gridSettings.thickness ?? 1.2}
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill={`url(#${gridPatternId})`} />
          </svg>
        )}

        {/* 3. Camada Vetorial: Desenhos e Formas Geométricas */}
        <MapVectorLayers
          drawings={drawings}
          shapes={shapes}
          selectedObject={selectedObject}
          onSelectObject={onSelectObject}
          onDeleteObject={onDeleteObject}
          onUpdateShape={onUpdateShape}
          onUpdateDrawing={onUpdateDrawing}
          activeTool={activeTool}
          isReadOnly={isReadOnly}
        />

        {/* 4. Preview do Desenho Livre em Tempo Real */}
        {activeDrawSvgPath && (
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none z-19 overflow-visible"
            width={NATIVE_MAP_WIDTH}
            height={NATIVE_MAP_HEIGHT}
          >
            <path
              d={activeDrawSvgPath}
              fill="none"
              stroke={drawColor}
              strokeWidth={drawWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}

        {/* 5. Preview da Forma Geométrica em Tempo Real */}
        {activeShapePreview && (
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none z-19 overflow-visible"
            width={NATIVE_MAP_WIDTH}
            height={NATIVE_MAP_HEIGHT}
          >
            {activeShapeType === 'rect' && (
              <rect
                x={Math.min(activeShapePreview.start.x, activeShapePreview.current.x)}
                y={Math.min(activeShapePreview.start.y, activeShapePreview.current.y)}
                width={Math.abs(activeShapePreview.current.x - activeShapePreview.start.x)}
                height={Math.abs(activeShapePreview.current.y - activeShapePreview.start.y)}
                fill="rgba(245, 158, 11, 0.2)"
                stroke={shapeStrokeColor}
                strokeWidth={shapeStrokeWidth}
                strokeDasharray="4 2"
                rx="4"
              />
            )}
            {activeShapeType === 'circle' && (
              <ellipse
                cx={(activeShapePreview.start.x + activeShapePreview.current.x) / 2}
                cy={(activeShapePreview.start.y + activeShapePreview.current.y) / 2}
                rx={Math.abs(activeShapePreview.current.x - activeShapePreview.start.x) / 2}
                ry={Math.abs(activeShapePreview.current.y - activeShapePreview.start.y) / 2}
                fill="rgba(239, 68, 68, 0.25)"
                stroke={shapeStrokeColor}
                strokeWidth={shapeStrokeWidth}
                strokeDasharray="4 2"
              />
            )}
            {activeShapeType === 'line' && (
              <line
                x1={activeShapePreview.start.x}
                y1={activeShapePreview.start.y}
                x2={activeShapePreview.current.x}
                y2={activeShapePreview.current.y}
                stroke={shapeStrokeColor}
                strokeWidth={shapeStrokeWidth}
                strokeLinecap="round"
                strokeDasharray="4 2"
              />
            )}
            {activeShapeType === 'arrow' && (
              <line
                x1={activeShapePreview.start.x}
                y1={activeShapePreview.start.y}
                x2={activeShapePreview.current.x}
                y2={activeShapePreview.current.y}
                stroke={shapeStrokeColor}
                strokeWidth={shapeStrokeWidth}
                strokeLinecap="round"
                strokeDasharray="4 2"
              />
            )}
          </svg>
        )}

        {/* 6. Régua de Medição Tática (Tormenta 20) */}
        {measureCalculation && (
          <div className="absolute inset-0 pointer-events-none z-24">
            <svg
              className="absolute inset-0 w-full h-full overflow-visible"
              width={NATIVE_MAP_WIDTH}
              height={NATIVE_MAP_HEIGHT}
            >
              {/* Linha da Régua */}
              <line
                x1={measureCalculation.start.x}
                y1={measureCalculation.start.y}
                x2={measureCalculation.current.x}
                y2={measureCalculation.current.y}
                stroke="#f59e0b"
                strokeWidth="3.5"
                strokeDasharray="8 4"
                strokeLinecap="round"
              />
              {/* Ponto A */}
              <circle
                cx={measureCalculation.start.x}
                cy={measureCalculation.start.y}
                r="6"
                fill="#f59e0b"
                stroke="#000"
                strokeWidth="2"
              />
              {/* Ponto B */}
              <circle
                cx={measureCalculation.current.x}
                cy={measureCalculation.current.y}
                r="6"
                fill="#38bdf8"
                stroke="#000"
                strokeWidth="2"
              />
            </svg>

            {/* Badge Flutuante de Distância */}
            <div
              style={{
                left: measureCalculation.midX,
                top: measureCalculation.midY,
                transform: 'translate(-50%, -50%)'
              }}
              className="absolute px-3 py-1.5 rounded-lg bg-stone-950/95 border border-amber-500/80 shadow-[0_0_20px_rgba(0,0,0,0.9)] flex flex-col items-center gap-0.5 pointer-events-none text-center"
            >
              <div className="text-amber-300 font-cinzel font-black text-sm tracking-wider flex items-center gap-1.5">
                <span>📏 {measureCalculation.meters}m</span>
              </div>
              <div className="text-[10px] font-mono font-bold text-cyan-300 tracking-wide">
                {measureCalculation.squares} quadrados
              </div>
            </div>
          </div>
        )}

        {/* 7. Camada da Névoa de Guerra Orgânica (Canvas 1920x1080) */}
        <canvas
          ref={fogCanvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none z-15"
          style={{ opacity: isReadOnly ? (fogSettings.density ?? 1) : (fogSettings.density ?? 0.95) }}
        />

        {/* 7.1. Camada de Áreas de Visão: Aura de Luz Suave e Controles Interativos */}
        {visionAreas && visionAreas.length > 0 && (
          <div className="absolute inset-0 w-full h-full pointer-events-none z-18">
            <svg
              className="absolute inset-0 w-full h-full overflow-visible"
              width={NATIVE_MAP_WIDTH}
              height={NATIVE_MAP_HEIGHT}
              viewBox={`0 0 ${NATIVE_MAP_WIDTH} ${NATIVE_MAP_HEIGHT}`}
            >
              <defs>
                {visionAreas.map((area) => (
                  <radialGradient
                    key={`grad-aura-${area.id}`}
                    id={`vision-aura-grad-${area.id}`}
                    cx="50%"
                    cy="50%"
                    r="50%"
                  >
                    <stop offset="0%" stopColor="#fef08a" stopOpacity="0.14" />
                    <stop offset="50%" stopColor="#f59e0b" stopOpacity="0.07" />
                    <stop offset="85%" stopColor="#d97706" stopOpacity="0.02" />
                    <stop offset="100%" stopColor="#b45309" stopOpacity="0" />
                  </radialGradient>
                ))}
              </defs>

              {visionAreas.map((area) => {
                const cellSize = gridSettings.size || 50;
                const effectiveScale = scaleMeters || gridSettings.scaleMeters || 3;
                const radiusPx = (area.radiusMeters || 10) * (cellSize / effectiveScale);
                const isSelected = !isReadOnly && (selectedObject?.type === 'vision' && selectedObject.id === area.id);

                return (
                  <g key={`vision-group-${area.id}`} className="transition-all">
                    {/* Efeito discreto de Luz / Aura Quente da Tocha/Visão */}
                    <circle
                      cx={area.x}
                      cy={area.y}
                      r={radiusPx}
                      fill={`url(#vision-aura-grad-${area.id})`}
                    />

                    {/* Borda circular suave com brilho e traçado tático */}
                    <circle
                      cx={area.x}
                      cy={area.y}
                      r={radiusPx}
                      fill="none"
                      stroke={isSelected ? '#fbbf24' : 'rgba(245, 158, 11, 0.45)'}
                      strokeWidth={isSelected ? '2.5' : '1.5'}
                      strokeDasharray={isSelected ? '6 3' : '5 4'}
                      style={{
                        filter: isSelected 
                          ? 'drop-shadow(0 0 8px rgba(251, 191, 36, 0.8))' 
                          : 'drop-shadow(0 0 4px rgba(245, 158, 11, 0.4))'
                      }}
                    />

                    {/* Raio visual secundário suave para sensação de profundidade de luz */}
                    <circle
                      cx={area.x}
                      cy={area.y}
                      r={Math.max(10, radiusPx * 0.65)}
                      fill="none"
                      stroke="rgba(254, 240, 138, 0.15)"
                      strokeWidth="1"
                      strokeDasharray="3 3"
                    />
                  </g>
                );
              })}
            </svg>

            {/* Controles Interativos e Marcadores Centrais das Áreas de Visão (apenas na visão do Mestre) */}
            {!isReadOnly && visionAreas.map((area) => {
              const isSelected = selectedObject?.type === 'vision' && selectedObject.id === area.id;

              return (
                <div
                  key={`vision-interactive-${area.id}`}
                  style={{
                    left: area.x,
                    top: area.y,
                    transform: 'translate(-50%, -50%)'
                  }}
                  className="absolute pointer-events-auto flex flex-col items-center justify-center select-none"
                >
                  {/* Marcador Central Draggable (Ícone de Olho Místico) */}
                  <div
                    onPointerDown={(e) => handleVisionPointerDown(e, area.id)}
                    className={`w-8 h-8 rounded-full flex items-center justify-center cursor-grab active:cursor-grabbing transition-transform hover:scale-110 shadow-xl ${
                      isSelected
                        ? 'bg-amber-500 text-stone-950 ring-4 ring-amber-400/50 shadow-[0_0_20px_rgba(245,158,11,0.8)]'
                        : 'bg-stone-950/90 border border-amber-500/80 text-amber-400 hover:bg-stone-900 shadow-[0_0_12px_rgba(0,0,0,0.8)]'
                    }`}
                    title="Arraste para mover a Área de Visão"
                  >
                    <span className="text-sm">👁️</span>
                  </div>

                  {/* Badge de Metros e Controles Rápidos */}
                  <div
                    className={`mt-1.5 px-2 py-0.5 rounded-md flex items-center gap-1.5 shadow-lg backdrop-blur-sm border transition-all ${
                      isSelected
                        ? 'bg-stone-950/95 border-amber-400 text-amber-200'
                        : 'bg-stone-950/80 border-amber-900/60 text-amber-300/90 hover:bg-stone-950'
                    }`}
                  >
                    <span className="text-[10px] font-cinzel font-bold tracking-wider whitespace-nowrap">
                      {area.radiusMeters}m
                    </span>

                    {isSelected && (
                      <div className="flex items-center gap-1 pl-1 border-l border-amber-900/60">
                        {/* Botões Rápidos de Raio 5m, 10m, 15m */}
                        {[5, 10, 15].map((r) => (
                          <button
                            key={r}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onUpdateVisionArea?.(area.id, { radiusMeters: r, label: `Visão ${r}m` });
                            }}
                            className={`px-1 py-0.2 rounded text-[9px] font-mono font-bold ${
                              area.radiusMeters === r
                                ? 'bg-amber-500 text-stone-950'
                                : 'bg-stone-900 text-stone-300 hover:text-amber-200'
                            }`}
                          >
                            {r}m
                          </button>
                        ))}

                        {/* Botão de Excluir */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteVisionArea?.(area.id);
                            onSelectObject?.(null);
                          }}
                          className="p-0.5 text-stone-400 hover:text-red-400 hover:bg-red-950/40 rounded transition-colors ml-0.5"
                          title="Remover Área de Visão"
                        >
                          <Trash2 size={11} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 8. Caixa de Seleção Retangular de Névoa */}
        {boxRect && (
          <div
            id="fog-active-selection-box"
            className={`absolute pointer-events-none z-25 border-2 transition-none ${
              currentFogMode === 'reveal'
                ? 'border-cyan-400/95 bg-cyan-950/30 shadow-[0_0_20px_rgba(34,211,238,0.4)]'
                : 'border-amber-400/95 bg-stone-950/75 shadow-[0_0_20px_rgba(245,158,11,0.4)]'
            }`}
            style={{
              left: boxRect.left,
              top: boxRect.top,
              width: boxRect.width,
              height: boxRect.height,
              borderStyle: 'dashed'
            }}
          >
            <div className={`absolute top-1 left-1.5 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
              currentFogMode === 'reveal'
                ? 'bg-cyan-950/90 text-cyan-300 border border-cyan-500/40'
                : 'bg-stone-900/90 text-amber-300 border border-amber-500/40'
            }`}>
              {Math.round(boxRect.width)} × {Math.round(boxRect.height)} px
            </div>
          </div>
        )}

        {/* 9. Pré-visualização da Seleção Livre (Lasso) de Névoa */}
        {freehandPoints.length >= 2 && (
          <svg
            id="fog-active-freehand-overlay"
            className="absolute inset-0 w-full h-full pointer-events-none z-25 overflow-visible"
            width={NATIVE_MAP_WIDTH}
            height={NATIVE_MAP_HEIGHT}
            viewBox={`0 0 ${NATIVE_MAP_WIDTH} ${NATIVE_MAP_HEIGHT}`}
          >
            <path
              d={`${freehandSvgPath} Z`}
              fill={currentFogMode === 'reveal' ? 'rgba(34, 211, 238, 0.22)' : 'rgba(12, 10, 8, 0.55)'}
              stroke={currentFogMode === 'reveal' ? 'rgb(34, 211, 238)' : 'rgb(245, 158, 11)'}
              strokeWidth="2.5"
              strokeDasharray="6 4"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
            <line
              x1={freehandPoints[freehandPoints.length - 1].x}
              y1={freehandPoints[freehandPoints.length - 1].y}
              x2={freehandPoints[0].x}
              y2={freehandPoints[0].y}
              stroke={currentFogMode === 'reveal' ? 'rgba(34, 211, 238, 0.6)' : 'rgba(245, 158, 11, 0.6)'}
              strokeWidth="1.5"
              strokeDasharray="3 3"
            />
            <circle
              cx={freehandPoints[0].x}
              cy={freehandPoints[0].y}
              r="4.5"
              fill={currentFogMode === 'reveal' ? '#22d3ee' : '#f59e0b'}
              stroke="#000000"
              strokeWidth="1.5"
            />
            <circle
              cx={freehandPoints[freehandPoints.length - 1].x}
              cy={freehandPoints[freehandPoints.length - 1].y}
              r="3.5"
              fill="#ffffff"
              stroke={currentFogMode === 'reveal' ? '#22d3ee' : '#f59e0b'}
              strokeWidth="1.5"
            />
          </svg>
        )}

        {/* 10. Camada de Marcadores */}
        <MapMarkers
          markers={markers}
          selectedMarkerId={selectedMarkerId}
          onSelectMarker={(id) => {
            onSelectMarker(id);
            if (id) {
              onSelectObject({ id, type: 'marker' });
            }
          }}
          onUpdateMarkerPosition={onUpdateMarkerPosition}
          isInteractive={!isReadOnly && (activeTool === 'select' || activeTool === 'marker')}
          hideLabels={isTvMode}
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
