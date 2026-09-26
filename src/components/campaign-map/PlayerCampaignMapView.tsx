import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Hand, 
  PenTool, 
  Circle, 
  ArrowRight, 
  Type, 
  MapPin, 
  Eraser, 
  Trash2, 
  Undo2, 
  Compass, 
  Check, 
  AlertCircle,
  HelpCircle,
  X,
  Swords,
  Castle,
  Skull,
  Gem,
  Star,
  ChevronLeft
} from 'lucide-react';
import { 
  CampaignMapService, 
  CampaignMapData, 
  MapAnnotationItem, 
  AnnotationTool,
  FreehandStroke,
  ShapeAnnotation,
  TextAnnotation,
  PinAnnotation,
  Point
} from '../../services/campaignMapService';

interface PlayerCampaignMapViewProps {
  campaignId: string;
  playerId: string;
  playerName?: string;
  onClose?: () => void;
}

const INK_COLORS = [
  { name: 'Sangue Rubro', color: '#ef4444' },
  { name: 'Ouro Tormenta', color: '#f59e0b' },
  { name: 'Arcano Azul', color: '#38bdf8' },
  { name: 'Trevas Roxo', color: '#c084fc' },
  { name: 'Veneno Verde', color: '#22c55e' },
  { name: 'Giz Branco', color: '#f8fafc' },
  { name: 'Tinta Negra', color: '#18181b' }
];

const PIN_ICONS = [
  { id: 'pin', label: 'Local', icon: MapPin },
  { id: 'combat', label: 'Batalha', icon: Swords },
  { id: 'castle', label: 'Ruína/Forte', icon: Castle },
  { id: 'danger', label: 'Perigo', icon: Skull },
  { id: 'treasure', label: 'Tesouro', icon: Gem },
  { id: 'star', label: 'Importante', icon: Star }
];

export const PlayerCampaignMapView: React.FC<PlayerCampaignMapViewProps> = ({
  campaignId,
  playerId,
  playerName = 'Aventureiro',
  onClose
}) => {
  // Dados do Mapa
  const [mapData, setMapData] = useState<CampaignMapData | null>(null);
  const [loadingMap, setLoadingMap] = useState(true);

  // Camada de Anotações do Jogador
  const [annotations, setAnnotations] = useState<MapAnnotationItem[]>([]);
  const [isSaved, setIsSaved] = useState(true);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Ferramentas ativas
  const [activeTool, setActiveTool] = useState<AnnotationTool>('pan');
  const [activeColor, setActiveColor] = useState<string>('#ef4444');
  const [strokeWidth, setStrokeWidth] = useState<number>(3);
  const [activePinType, setActivePinType] = useState<string>('pin');

  // Modal para adicionar anotação de texto
  const [textModalPos, setTextModalPos] = useState<Point | null>(null);
  const [textInputValue, setTextInputValue] = useState('');

  // Confirmação para limpar tudo
  const [isConfirmingClear, setIsConfirmingClear] = useState(false);

  // Navegação e Transformação (Pan & Zoom)
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // Controle de Arrastar / Desenhar
  const isDraggingRef = useRef(false);
  const startDragPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const startPanRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Controle de Toque / Gesto (Pinch to Zoom)
  const initialPinchDistRef = useRef<number | null>(null);
  const initialPinchZoomRef = useRef<number>(1);

  // Desenho livre em andamento
  const currentStrokePointsRef = useRef<Point[]>([]);
  const [drawingPreviewStroke, setDrawingPreviewStroke] = useState<Point[] | null>(null);
  const shapeStartPointRef = useRef<Point | null>(null);
  const [shapePreviewEnd, setShapePreviewEnd] = useState<Point | null>(null);

  // 1. Assinatura em tempo real do Mapa Oficial da Campanha enviado pelo Mestre
  useEffect(() => {
    if (!campaignId) return;
    setLoadingMap(true);

    const unsubscribe = CampaignMapService.subscribeToCampaignMap(campaignId, (data) => {
      setMapData(data);
      setLoadingMap(false);
    });

    return () => unsubscribe();
  }, [campaignId]);

  // 2. Assinatura em tempo real das anotações pessoais deste jogador
  useEffect(() => {
    if (!campaignId || !playerId) return;

    const unsubscribe = CampaignMapService.subscribeToPlayerAnnotations(
      campaignId,
      playerId,
      (data) => {
        if (data && Array.isArray(data.items)) {
          setAnnotations(data.items);
        }
      }
    );

    return () => unsubscribe();
  }, [campaignId, playerId]);

  // 3. Salvamento com debounce de anotações pessoais
  const scheduleSaveAnnotations = useCallback((newItems: MapAnnotationItem[]) => {
    setAnnotations(newItems);
    setIsSaved(false);

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(async () => {
      try {
        await CampaignMapService.savePlayerAnnotations(campaignId, playerId, newItems, playerName);
        setIsSaved(true);
      } catch (err) {
        console.error('[PlayerCampaignMapView] Erro ao salvar anotações:', err);
      }
    }, 600);
  }, [campaignId, playerId, playerName]);

  // Converte coordenadas do evento para porcentagem relativa ao elemento do mapa (0 a 100)
  const getRelativeCoordinates = (clientX: number, clientY: number): Point | null => {
    if (!imageRef.current) return null;
    const rect = imageRef.current.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return null;

    const x = ((clientX - rect.left) / rect.width) * 100;
    const y = ((clientY - rect.top) / rect.height) * 100;

    return {
      x: Math.max(0, Math.min(100, x)),
      y: Math.max(0, Math.min(100, y))
    };
  };

  // =========================================================================
  // HANDLERS DE INTERAÇÃO (MOUSE E TOUCH)
  // =========================================================================

  const handlePointerDown = (e: React.PointerEvent) => {
    // Se for toque multifinger, deixa o handler de touch cuidar
    if (e.pointerType === 'touch' && !e.isPrimary) return;

    const relPos = getRelativeCoordinates(e.clientX, e.clientY);

    if (activeTool === 'pan') {
      isDraggingRef.current = true;
      startDragPosRef.current = { x: e.clientX, y: e.clientY };
      startPanRef.current = { ...pan };
      return;
    }

    if (!relPos) return;

    if (activeTool === 'pen') {
      isDraggingRef.current = true;
      currentStrokePointsRef.current = [relPos];
      setDrawingPreviewStroke([relPos]);
    } else if (activeTool === 'circle' || activeTool === 'arrow') {
      isDraggingRef.current = true;
      shapeStartPointRef.current = relPos;
      setShapePreviewEnd(relPos);
    } else if (activeTool === 'pin') {
      // Cria marcador na posição do toque
      const newPin: PinAnnotation = {
        id: `pin_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        type: 'pin',
        point: relPos,
        icon: activePinType,
        color: activeColor,
        createdAt: Date.now()
      };
      scheduleSaveAnnotations([...annotations, newPin]);
    } else if (activeTool === 'text') {
      // Abre modal para inserir o texto nesta posição
      setTextModalPos(relPos);
      setTextInputValue('');
    } else if (activeTool === 'eraser') {
      // Borracha: apaga anotação mais próxima do ponto clicado
      eraseNearestAnnotation(relPos);
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;

    if (activeTool === 'pan') {
      const deltaX = e.clientX - startDragPosRef.current.x;
      const deltaY = e.clientY - startDragPosRef.current.y;
      setPan({
        x: startPanRef.current.x + deltaX,
        y: startPanRef.current.y + deltaY
      });
      return;
    }

    const relPos = getRelativeCoordinates(e.clientX, e.clientY);
    if (!relPos) return;

    if (activeTool === 'pen') {
      currentStrokePointsRef.current.push(relPos);
      setDrawingPreviewStroke([...currentStrokePointsRef.current]);
    } else if (activeTool === 'circle' || activeTool === 'arrow') {
      setShapePreviewEnd(relPos);
    } else if (activeTool === 'eraser') {
      eraseNearestAnnotation(relPos);
    }
  };

  const handlePointerUp = () => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;

    if (activeTool === 'pen' && currentStrokePointsRef.current.length > 1) {
      const newStroke: FreehandStroke = {
        id: `stroke_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        type: 'stroke',
        points: [...currentStrokePointsRef.current],
        color: activeColor,
        width: strokeWidth,
        createdAt: Date.now()
      };
      scheduleSaveAnnotations([...annotations, newStroke]);
      currentStrokePointsRef.current = [];
      setDrawingPreviewStroke(null);
    } else if ((activeTool === 'circle' || activeTool === 'arrow') && shapeStartPointRef.current && shapePreviewEnd) {
      const newShape: ShapeAnnotation = {
        id: `shape_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        type: activeTool,
        start: shapeStartPointRef.current,
        end: shapePreviewEnd,
        color: activeColor,
        width: strokeWidth,
        createdAt: Date.now()
      };
      scheduleSaveAnnotations([...annotations, newShape]);
      shapeStartPointRef.current = null;
      setShapePreviewEnd(null);
    }
  };

  // Suporte a Touch Pinch-to-zoom nativo
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const dist = Math.hypot(touch2.clientX - touch1.clientX, touch2.clientY - touch1.clientY);
      initialPinchDistRef.current = dist;
      initialPinchZoomRef.current = zoom;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && initialPinchDistRef.current !== null) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const currentDist = Math.hypot(touch2.clientX - touch1.clientX, touch2.clientY - touch1.clientY);
      const ratio = currentDist / initialPinchDistRef.current;
      const nextZoom = Math.max(0.6, Math.min(5, initialPinchZoomRef.current * ratio));
      setZoom(nextZoom);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (e.touches.length < 2) {
      initialPinchDistRef.current = null;
    }
  };

  // Apaga a anotação mais próxima
  const eraseNearestAnnotation = (point: Point) => {
    const threshold = 4; // tolerância em % de proximidade
    const filtered = annotations.filter((item) => {
      if (item.type === 'pin' || item.type === 'text') {
        const d = Math.hypot(item.point.x - point.x, item.point.y - point.y);
        return d > threshold;
      }
      if (item.type === 'circle' || item.type === 'arrow') {
        const dStart = Math.hypot(item.start.x - point.x, item.start.y - point.y);
        const dEnd = Math.hypot(item.end.x - point.x, item.end.y - point.y);
        return dStart > threshold && dEnd > threshold;
      }
      if (item.type === 'stroke') {
        // Verifica se algum ponto do traço está muito perto
        return !item.points.some(p => Math.hypot(p.x - point.x, p.y - point.y) < threshold);
      }
      return true;
    });

    if (filtered.length !== annotations.length) {
      scheduleSaveAnnotations(filtered);
    }
  };

  // Desfazer última anotação
  const handleUndo = () => {
    if (annotations.length === 0) return;
    const newItems = annotations.slice(0, -1);
    scheduleSaveAnnotations(newItems);
  };

  // Limpar todas as anotações do jogador
  const handleClearAll = async () => {
    scheduleSaveAnnotations([]);
    setIsConfirmingClear(false);
  };

  // Adicionar texto confirmado
  const handleConfirmText = () => {
    if (!textModalPos || !textInputValue.trim()) {
      setTextModalPos(null);
      return;
    }

    const newText: TextAnnotation = {
      id: `text_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      type: 'text',
      point: textModalPos,
      text: textInputValue.trim(),
      color: activeColor,
      fontSize: 13,
      createdAt: Date.now()
    };

    scheduleSaveAnnotations([...annotations, newText]);
    setTextModalPos(null);
    setTextInputValue('');
  };

  // Resetar zoom e enquadrar
  const handleResetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handleZoomIn = () => setZoom(prev => Math.min(5, prev + 0.35));
  const handleZoomOut = () => setZoom(prev => Math.max(0.6, prev - 0.35));

  return (
    <div className="relative w-full h-[calc(100vh-140px)] min-h-[480px] bg-[#0c0907] rounded-2xl overflow-hidden border border-amber-900/60 flex flex-col select-none shadow-[0_20px_50px_rgba(0,0,0,0.95)]">
      
      {/* ===================================================================== */}
      {/* 1. BARRA SUPERIOR: IDENTIDADE DO MAPA + STATUS + VOLTAR                */}
      {/* ===================================================================== */}
      <div className="h-12 bg-gradient-to-r from-[#1b1510] via-[#120e0a] to-[#1b1510] border-b border-amber-900/50 px-3 flex items-center justify-between z-20 shrink-0">
        <div className="flex items-center gap-2">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg bg-amber-950/70 hover:bg-amber-900 border border-amber-700/50 text-amber-200 text-xs font-cinzel flex items-center gap-1 cursor-pointer transition-all active:scale-95"
              title="Voltar ao Personagem"
            >
              <ChevronLeft size={16} />
              <span className="hidden sm:inline">Ficha</span>
            </button>
          )}

          <div className="flex items-center gap-1.5">
            <Compass size={16} className="text-amber-400 shrink-0" />
            <span className="font-cinzel font-bold text-xs sm:text-sm text-amber-100 tracking-wider truncate max-w-[150px] sm:max-w-[260px]">
              {mapData?.name || 'MAPA DA CAMPANHA'}
            </span>
          </div>
        </div>

        {/* Indicador de Status & Zoom */}
        <div className="flex items-center gap-2">
          <div className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/60 border border-amber-900/40 text-amber-300">
            {Math.round(zoom * 100)}%
          </div>

          <div 
            className="flex items-center gap-1 text-[10px] font-cinzel text-stone-400"
            title="Suas anotações são salvas em sua camada individual nesta campanha."
          >
            {isSaved ? (
              <span className="flex items-center gap-1 text-emerald-400">
                <Check size={12} />
                <span className="hidden sm:inline">Anotações Salvas</span>
              </span>
            ) : (
              <span className="flex items-center gap-1 text-amber-400 animate-pulse">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span className="hidden sm:inline">Salvando...</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 2. ÁREA PRINCIPAL DO MAPA COM CAMADAS SEPARADAS                        */}
      {/* ===================================================================== */}
      <div 
        ref={containerRef}
        className="flex-1 relative overflow-hidden bg-[#070504] cursor-crosshair touch-none"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {loadingMap ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center space-y-3 z-30">
            <div className="w-8 h-8 rounded-full border-2 border-amber-500 border-t-transparent animate-spin" />
            <p className="text-xs font-cinzel text-amber-200/80 tracking-wider">Revelando mapa da campanha...</p>
          </div>
        ) : !mapData?.imageUrl ? (
          /* Estado Vazio: Mestre ainda não enviou o mapa */
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center space-y-3 z-30">
            <div className="w-16 h-16 rounded-2xl bg-amber-950/40 border border-amber-800/50 flex items-center justify-center text-amber-400 shadow-xl">
              <Compass size={32} />
            </div>
            <div className="space-y-1 max-w-sm">
              <h3 className="font-cinzel font-bold text-base text-amber-200 tracking-wide">
                Nenhum Mapa Revelado
              </h3>
              <p className="text-xs text-stone-400 font-serif leading-relaxed">
                O Mestre ainda não enviou o mapa oficial desta campanha. Assim que ele disponibilizar o mapa na Mesa do Mestre, ele aparecerá aqui com seus segredos e caminhos.
              </p>
            </div>
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="mt-2 px-4 py-2 rounded-xl bg-amber-950/80 hover:bg-amber-900 border border-amber-600/60 text-amber-200 text-xs font-cinzel font-bold uppercase tracking-wider cursor-pointer shadow"
              >
                Voltar à Ficha
              </button>
            )}
          </div>
        ) : (
          /* ================================================================= */
          /* MUNDO VIRTUAL COM TRANSFORMAÇÃO PAN & ZOOM                        */
          /* ================================================================= */
          <div 
            className="w-full h-full flex items-center justify-center transition-transform duration-75 ease-out origin-center"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: 'center center'
            }}
          >
            {/* Contêiner Proporcional da Imagem + Camada de Anotações */}
            <div className="relative inline-block max-w-full max-h-full select-none">
              
              {/* CAMADA 1: MAPA ORIGINAL DO MESTRE (Totalmente preservado e inalterável) */}
              <img 
                ref={imageRef}
                src={mapData.imageUrl} 
                alt={mapData.name || 'Mapa da Campanha'}
                draggable={false}
                className="max-h-[calc(100vh-210px)] max-w-[94vw] object-contain pointer-events-none select-none rounded shadow-2xl block border border-amber-950/60"
              />

              {/* CAMADA 2: ANOTAÇÕES PESSOAIS DO JOGADOR (SVG Sobreposto) */}
              <svg 
                className="absolute inset-0 w-full h-full pointer-events-none"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
              >
                {/* 1. Traços livres existentes */}
                {annotations.filter(a => a.type === 'stroke').map((item) => {
                  const stroke = item as FreehandStroke;
                  if (stroke.points.length < 2) return null;
                  const pathData = stroke.points.reduce((acc, pt, idx) => {
                    return idx === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
                  }, '');

                  return (
                    <path
                      key={stroke.id}
                      d={pathData}
                      stroke={stroke.color}
                      strokeWidth={stroke.width * 0.35}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      fill="none"
                      opacity="0.9"
                    />
                  );
                })}

                {/* 2. Traço livre sendo desenhado no momento (preview) */}
                {drawingPreviewStroke && drawingPreviewStroke.length > 1 && (
                  <path
                    d={drawingPreviewStroke.reduce((acc, pt, idx) => {
                      return idx === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
                    }, '')}
                    stroke={activeColor}
                    strokeWidth={strokeWidth * 0.35}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                    opacity="0.9"
                  />
                )}

                {/* 3. Formas geométricas (Círculos e Setas) */}
                {annotations.filter(a => a.type === 'circle' || a.type === 'arrow').map((item) => {
                  const shape = item as ShapeAnnotation;
                  if (shape.type === 'circle') {
                    const radius = Math.hypot(shape.end.x - shape.start.x, shape.end.y - shape.start.y);
                    return (
                      <circle
                        key={shape.id}
                        cx={shape.start.x}
                        cy={shape.start.y}
                        r={radius}
                        stroke={shape.color}
                        strokeWidth={shape.width * 0.35}
                        fill={shape.color}
                        fillOpacity="0.15"
                      />
                    );
                  }

                  if (shape.type === 'arrow') {
                    return (
                      <g key={shape.id}>
                        <line
                          x1={shape.start.x}
                          y1={shape.start.y}
                          x2={shape.end.x}
                          y2={shape.end.y}
                          stroke={shape.color}
                          strokeWidth={shape.width * 0.4}
                          strokeLinecap="round"
                        />
                        {/* Ponta da Seta */}
                        <circle cx={shape.end.x} cy={shape.end.y} r={shape.width * 0.6} fill={shape.color} />
                      </g>
                    );
                  }
                  return null;
                })}

                {/* Preview de Forma Sendo Criada */}
                {shapeStartPointRef.current && shapePreviewEnd && (
                  activeTool === 'circle' ? (
                    <circle
                      cx={shapeStartPointRef.current.x}
                      cy={shapeStartPointRef.current.y}
                      r={Math.hypot(shapePreviewEnd.x - shapeStartPointRef.current.x, shapePreviewEnd.y - shapeStartPointRef.current.y)}
                      stroke={activeColor}
                      strokeWidth={strokeWidth * 0.35}
                      strokeDasharray="2,2"
                      fill={activeColor}
                      fillOpacity="0.1"
                    />
                  ) : activeTool === 'arrow' ? (
                    <line
                      x1={shapeStartPointRef.current.x}
                      y1={shapeStartPointRef.current.y}
                      x2={shapePreviewEnd.x}
                      y2={shapePreviewEnd.y}
                      stroke={activeColor}
                      strokeWidth={strokeWidth * 0.4}
                      strokeDasharray="2,2"
                      strokeLinecap="round"
                    />
                  ) : null
                )}
              </svg>

              {/* CAMADA 3: MARCADORES HTML (Pinos e Rótulos de Texto) */}
              <div className="absolute inset-0 pointer-events-none">
                {/* Pinos e Ícones */}
                {annotations.filter(a => a.type === 'pin').map((item) => {
                  const pin = item as PinAnnotation;
                  const IconComp = PIN_ICONS.find(p => p.id === pin.icon)?.icon || MapPin;

                  return (
                    <div
                      key={pin.id}
                      className="absolute -translate-x-1/2 -translate-y-full transition-transform"
                      style={{
                        left: `${pin.point.x}%`,
                        top: `${pin.point.y}%`
                      }}
                    >
                      <div 
                        className="p-1 rounded-full border-2 shadow-[0_4px_12px_rgba(0,0,0,0.8)] backdrop-blur-sm flex items-center justify-center text-white"
                        style={{
                          backgroundColor: pin.color,
                          borderColor: '#fff'
                        }}
                      >
                        <IconComp size={14} className="stroke-[2.5]" />
                      </div>
                      <div className="w-1.5 h-1.5 bg-white rounded-full mx-auto -mt-0.5 shadow" />
                    </div>
                  );
                })}

                {/* Notas de Texto */}
                {annotations.filter(a => a.type === 'text').map((item) => {
                  const textItem = item as TextAnnotation;
                  return (
                    <div
                      key={textItem.id}
                      className="absolute -translate-x-1/2 -translate-y-1/2 px-2 py-0.5 rounded-md bg-black/85 border text-xs font-serif shadow-xl backdrop-blur-sm whitespace-nowrap z-10"
                      style={{
                        left: `${textItem.point.x}%`,
                        top: `${textItem.point.y}%`,
                        borderColor: textItem.color,
                        color: textItem.color
                      }}
                    >
                      {textItem.text}
                    </div>
                  );
                })}
              </div>

            </div>
          </div>
        )}

        {/* ===================================================================== */}
        {/* MODAL PARA DIGITAR TEXTO NO MAPA                                      */}
        {/* ===================================================================== */}
        {textModalPos && (
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm z-40 flex items-center justify-center p-4">
            <div className="w-full max-w-xs rounded-xl bg-[#140e0a] border border-amber-600/70 p-4 space-y-3 shadow-2xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-cinzel font-bold text-amber-200 uppercase">
                  Anotação no Mapa
                </span>
                <button
                  type="button"
                  onClick={() => setTextModalPos(null)}
                  className="text-stone-400 hover:text-stone-200"
                >
                  <X size={16} />
                </button>
              </div>

              <input
                type="text"
                autoFocus
                maxLength={40}
                placeholder="Ex: Pousada do Dragão, Ruínas..."
                value={textInputValue}
                onChange={(e) => setTextInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleConfirmText();
                }}
                className="w-full px-3 py-2 rounded-lg bg-stone-950 border border-amber-900/60 text-stone-100 text-xs font-serif focus:outline-none focus:border-amber-400"
              />

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setTextModalPos(null)}
                  className="px-3 py-1.5 rounded-lg text-xs font-cinzel text-stone-400 hover:text-stone-200 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmText}
                  className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-amber-700 to-amber-600 hover:from-amber-600 hover:to-amber-500 text-stone-950 font-cinzel font-bold text-xs uppercase tracking-wider cursor-pointer shadow"
                >
                  Inserir
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Confirmação para Limpar Minhas Anotações */}
        {isConfirmingClear && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-40 flex items-center justify-center p-4">
            <div className="w-full max-w-xs rounded-xl bg-[#140e0a] border border-red-700/70 p-4 space-y-3 text-center shadow-2xl">
              <div className="w-10 h-10 rounded-full bg-red-950/80 border border-red-600/60 flex items-center justify-center text-red-300 mx-auto">
                <Trash2 size={18} />
              </div>
              <div className="space-y-1">
                <h4 className="font-cinzel font-bold text-sm text-red-200 uppercase">
                  Limpar Suas Anotações?
                </h4>
                <p className="text-xs text-stone-300 font-serif">
                  Todas as suas marcações pessoais sobre o mapa serão apagadas. O mapa original do Mestre não será afetado.
                </p>
              </div>
              <div className="flex items-center justify-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsConfirmingClear(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-cinzel text-stone-300 bg-stone-900 hover:bg-stone-800 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="px-3.5 py-1.5 rounded-lg bg-red-800 hover:bg-red-700 text-stone-100 font-cinzel font-bold text-xs uppercase tracking-wider cursor-pointer shadow"
                >
                  Sim, limpar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ===================================================================== */}
      {/* 3. BARRA INFERIOR DE FERRAMENTAS & CONTROLES IMERSIVOS DO JOGADOR      */}
      {/* ===================================================================== */}
      <div className="bg-[#120e0a] border-t border-amber-900/60 p-2 z-20 shrink-0 space-y-2">
        
        {/* Linha 1: Ferramentas Principais */}
        <div className="flex items-center justify-between gap-1 overflow-x-auto custom-scrollbar pb-0.5">
          <div className="flex items-center gap-1">
            {/* Mover / Pan */}
            <button
              type="button"
              onClick={() => setActiveTool('pan')}
              className={`p-2 rounded-xl transition-all cursor-pointer flex flex-col items-center justify-center ${
                activeTool === 'pan'
                  ? 'bg-amber-950 border border-amber-400 text-amber-200 shadow-[0_0_10px_rgba(245,158,11,0.3)]'
                  : 'bg-stone-900/80 border border-stone-800 text-stone-400 hover:text-stone-200'
              }`}
              title="Mover e Navegar pelo Mapa (✋)"
            >
              <Hand size={16} />
              <span className="text-[9px] font-cinzel font-bold uppercase mt-0.5">Mover</span>
            </button>

            {/* Desenho Livre */}
            <button
              type="button"
              onClick={() => setActiveTool('pen')}
              className={`p-2 rounded-xl transition-all cursor-pointer flex flex-col items-center justify-center ${
                activeTool === 'pen'
                  ? 'bg-amber-950 border border-amber-400 text-amber-200 shadow-[0_0_10px_rgba(245,158,11,0.3)]'
                  : 'bg-stone-900/80 border border-stone-800 text-stone-400 hover:text-stone-200'
              }`}
              title="Desenhar Livremente (✏️)"
            >
              <PenTool size={16} />
              <span className="text-[9px] font-cinzel font-bold uppercase mt-0.5">Desenhar</span>
            </button>

            {/* Círculo */}
            <button
              type="button"
              onClick={() => setActiveTool('circle')}
              className={`p-2 rounded-xl transition-all cursor-pointer flex flex-col items-center justify-center ${
                activeTool === 'circle'
                  ? 'bg-amber-950 border border-amber-400 text-amber-200 shadow-[0_0_10px_rgba(245,158,11,0.3)]'
                  : 'bg-stone-900/80 border border-stone-800 text-stone-400 hover:text-stone-200'
              }`}
              title="Círculo de Destaque (⭕)"
            >
              <Circle size={16} />
              <span className="text-[9px] font-cinzel font-bold uppercase mt-0.5">Círculo</span>
            </button>

            {/* Seta */}
            <button
              type="button"
              onClick={() => setActiveTool('arrow')}
              className={`p-2 rounded-xl transition-all cursor-pointer flex flex-col items-center justify-center ${
                activeTool === 'arrow'
                  ? 'bg-amber-950 border border-amber-400 text-amber-200 shadow-[0_0_10px_rgba(245,158,11,0.3)]'
                  : 'bg-stone-900/80 border border-stone-800 text-stone-400 hover:text-stone-200'
              }`}
              title="Seta de Direção (➔)"
            >
              <ArrowRight size={16} />
              <span className="text-[9px] font-cinzel font-bold uppercase mt-0.5">Seta</span>
            </button>

            {/* Marcadores / Pinos */}
            <button
              type="button"
              onClick={() => setActiveTool('pin')}
              className={`p-2 rounded-xl transition-all cursor-pointer flex flex-col items-center justify-center ${
                activeTool === 'pin'
                  ? 'bg-amber-950 border border-amber-400 text-amber-200 shadow-[0_0_10px_rgba(245,158,11,0.3)]'
                  : 'bg-stone-900/80 border border-stone-800 text-stone-400 hover:text-stone-200'
              }`}
              title="Marcar Local de Interesse (📍)"
            >
              <MapPin size={16} />
              <span className="text-[9px] font-cinzel font-bold uppercase mt-0.5">Marcador</span>
            </button>

            {/* Nota de Texto */}
            <button
              type="button"
              onClick={() => setActiveTool('text')}
              className={`p-2 rounded-xl transition-all cursor-pointer flex flex-col items-center justify-center ${
                activeTool === 'text'
                  ? 'bg-amber-950 border border-amber-400 text-amber-200 shadow-[0_0_10px_rgba(245,158,11,0.3)]'
                  : 'bg-stone-900/80 border border-stone-800 text-stone-400 hover:text-stone-200'
              }`}
              title="Inserir Nota de Texto (🏷️)"
            >
              <Type size={16} />
              <span className="text-[9px] font-cinzel font-bold uppercase mt-0.5">Texto</span>
            </button>

            {/* Borracha */}
            <button
              type="button"
              onClick={() => setActiveTool('eraser')}
              className={`p-2 rounded-xl transition-all cursor-pointer flex flex-col items-center justify-center ${
                activeTool === 'eraser'
                  ? 'bg-red-950 border border-red-500 text-red-200 shadow-[0_0_10px_rgba(239,68,68,0.3)]'
                  : 'bg-stone-900/80 border border-stone-800 text-stone-400 hover:text-stone-200'
              }`}
              title="Apagar Minhas Marcações (🧹)"
            >
              <Eraser size={16} />
              <span className="text-[9px] font-cinzel font-bold uppercase mt-0.5">Borracha</span>
            </button>
          </div>

          {/* Desfazer e Limpar Tudo */}
          <div className="flex items-center gap-1 pl-2 border-l border-amber-900/40 shrink-0">
            <button
              type="button"
              onClick={handleUndo}
              disabled={annotations.length === 0}
              className="p-2 rounded-xl bg-stone-900/80 border border-stone-800 text-stone-400 hover:text-amber-300 disabled:opacity-40 cursor-pointer"
              title="Desfazer Última Marcação (Ctrl+Z)"
            >
              <Undo2 size={16} />
            </button>

            <button
              type="button"
              onClick={() => setIsConfirmingClear(true)}
              disabled={annotations.length === 0}
              className="p-2 rounded-xl bg-stone-900/80 border border-stone-800 text-stone-400 hover:text-red-400 disabled:opacity-40 cursor-pointer"
              title="Limpar Minhas Anotações"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        {/* Linha 2: Paleta de Cores + Tipos de Marcador + Controles de Zoom */}
        <div className="flex items-center justify-between gap-2 pt-1 border-t border-amber-950/60">
          
          {/* Se estiver no marcador, mostra seleção de ícones */}
          {activeTool === 'pin' ? (
            <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar py-0.5">
              <span className="text-[10px] font-cinzel text-stone-400 uppercase shrink-0">Ícone:</span>
              {PIN_ICONS.map((p) => {
                const IconC = p.icon;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setActivePinType(p.id)}
                    className={`p-1.5 rounded-lg border flex items-center gap-1 cursor-pointer transition-all ${
                      activePinType === p.id 
                        ? 'bg-amber-950 border-amber-400 text-amber-200' 
                        : 'bg-stone-900 border-stone-800 text-stone-400'
                    }`}
                    title={p.label}
                  >
                    <IconC size={13} />
                  </button>
                );
              })}
            </div>
          ) : (
            /* Paleta de Cores e Espessura para desenho livre, setas e círculos */
            <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar py-0.5">
              <span className="text-[10px] font-cinzel text-stone-400 uppercase shrink-0">Tinta:</span>
              {INK_COLORS.map((c) => (
                <button
                  key={c.color}
                  type="button"
                  onClick={() => setActiveColor(c.color)}
                  className={`w-5 h-5 rounded-full border-2 transition-transform cursor-pointer shrink-0 ${
                    activeColor === c.color ? 'scale-125 border-white shadow-md' : 'border-black/50 hover:scale-110'
                  }`}
                  style={{ backgroundColor: c.color }}
                  title={c.name}
                />
              ))}
            </div>
          )}

          {/* Controles de Zoom e Enquadrar */}
          <div className="flex items-center gap-1 shrink-0 ml-auto">
            <button
              type="button"
              onClick={handleZoomOut}
              className="p-1.5 rounded-lg bg-stone-900/90 border border-amber-900/40 text-stone-300 hover:text-amber-300 hover:bg-stone-800 cursor-pointer active:scale-95"
              title="Reduzir Zoom (-)"
            >
              <ZoomOut size={15} />
            </button>

            <button
              type="button"
              onClick={handleResetView}
              className="p-1.5 rounded-lg bg-stone-900/90 border border-amber-900/40 text-stone-300 hover:text-amber-300 hover:bg-stone-800 cursor-pointer active:scale-95"
              title="Enquadrar Mapa (100%)"
            >
              <RotateCcw size={15} />
            </button>

            <button
              type="button"
              onClick={handleZoomIn}
              className="p-1.5 rounded-lg bg-stone-900/90 border border-amber-900/40 text-stone-300 hover:text-amber-300 hover:bg-stone-800 cursor-pointer active:scale-95"
              title="Aumentar Zoom (+)"
            >
              <ZoomIn size={15} />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
