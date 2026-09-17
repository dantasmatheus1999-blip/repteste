import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { 
  Tv, 
  Maximize2, 
  Minimize2, 
  Plus, 
  Map as MapIcon, 
  ExternalLink, 
  Upload, 
  Check, 
  Loader2, 
  Trash2, 
  ChevronDown, 
  AlertCircle,
  BookOpen, 
  RotateCcw, 
  RotateCw, 
  Undo2, 
  Redo2,
  LayoutGrid,
  MoreVertical,
  Compass,
  Crosshair,
  EyeOff,
  Pause,
  Play,
  FileText,
  XCircle,
  Sword,
  SlidersHorizontal
} from 'lucide-react';
import { 
  ToolType, 
  GridSettings, 
  FogSettings, 
  MapMarker, 
  MapDrawing, 
  MapShape, 
  ShapeType, 
  SelectedObject, 
  TestMap, 
  MapFolder, 
  TvSyncState,
  SplitLayoutCount,
  QuadrantMapState,
  TvSyncQuadrantItem
} from './types';
import { MapToolbar } from './MapToolbar';
import { MapCanvas } from './MapCanvas';
import { PlayersPanel } from './PlayersPanel';
import { MapLibraryDrawer } from './MapLibraryDrawer';
import { MapBestiaryDrawer } from './MapBestiaryDrawer';
import { DEFAULT_FOG_SETTINGS } from './fogUtils';
import { calculateAutomaticGrid, getEffectiveGrid } from './gridUtils';
import { 
  fetchTestMaps, 
  saveTestMap, 
  deleteTestMap, 
  uploadMapImage, 
  broadcastToTv, 
  fetchMapFolders, 
  saveMapFolder, 
  deleteMapFolder, 
  moveMapToFolder, 
  renameMap, 
  SAMPLE_MAPS, 
  SAMPLE_FOLDERS 
} from './mapService';
import { Game } from '../../types/game';
import { GameService } from '../../services/gameService';

interface HistorySnapshot {
  mapId: string;
  markers: MapMarker[];
  drawings: MapDrawing[];
  shapes: MapShape[];
  fogData?: string;
}

const LAST_STATE_STORAGE_KEY = 'realmor_map_editor_last_state';

interface PersistedEditorState {
  splitCount: SplitLayoutCount;
  activeQuadrantIndex: number;
  quadrants: {
    quadrantId: number;
    mapId: string | null;
    zoom: number;
    pan: { x: number; y: number };
  }[];
}

const loadPersistedEditorState = (): PersistedEditorState | null => {
  try {
    const raw = localStorage.getItem(LAST_STATE_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;

    const splitCount: SplitLayoutCount = ([1, 2, 3, 4].includes(parsed.splitCount)) ? parsed.splitCount : 1;
    const activeQuadrantIndex = (typeof parsed.activeQuadrantIndex === 'number' && parsed.activeQuadrantIndex >= 0 && parsed.activeQuadrantIndex < 4)
      ? parsed.activeQuadrantIndex
      : 0;

    if (!Array.isArray(parsed.quadrants) || parsed.quadrants.length !== 4) {
      return null;
    }

    const validatedQuadrants = parsed.quadrants.map((q: any, idx: number) => ({
      quadrantId: idx,
      mapId: typeof q?.mapId === 'string' && q.mapId.trim().length > 0 ? q.mapId.trim() : null,
      zoom: (typeof q?.zoom === 'number' && isFinite(q.zoom) && q.zoom >= 0.1 && q.zoom <= 10) ? q.zoom : 1,
      pan: (q?.pan && typeof q.pan.x === 'number' && typeof q.pan.y === 'number' && isFinite(q.pan.x) && isFinite(q.pan.y)) 
        ? { x: q.pan.x, y: q.pan.y } 
        : { x: 0, y: 0 }
    }));

    return {
      splitCount,
      activeQuadrantIndex,
      quadrants: validatedQuadrants
    };
  } catch (err) {
    console.warn('Falha ao ler realmor_map_editor_last_state:', err);
    return null;
  }
};

export interface MapEditorProps {
  campaignId?: string;
  gameId?: string;
  game?: Game | null;
  isMaster?: boolean;
  onExitAdventure?: () => void;
  onOpenLobbyModal?: () => void;
}

export const MapEditor: React.FC<MapEditorProps> = ({
  campaignId: propCampaignId,
  gameId: propGameId,
  game: propGame,
  isMaster: propIsMaster = true,
  onExitAdventure,
  onOpenLobbyModal
}) => {
  const params = useParams<{ campaignId?: string; gameId?: string; roomId?: string }>();
  const [searchParams] = useSearchParams();

  const campaignId = propCampaignId || params.campaignId || searchParams.get('campaignId') || undefined;
  const gameId = propGameId || params.gameId || searchParams.get('gameId') || undefined;
  const isMaster = propIsMaster;

  const [liveGame, setLiveGame] = useState<Game | null>(propGame || null);
  const [isFinishingModalOpen, setIsFinishingModalOpen] = useState(false);
  const [isUpdatingGameStatus, setIsUpdatingGameStatus] = useState(false);

  // Inscrição em tempo real aos dados da partida (Game)
  useEffect(() => {
    if (propGame) {
      setLiveGame(propGame);
    }
    if (!campaignId || !gameId) return;

    const unsub = GameService.subscribeToGame(campaignId, gameId, (loaded) => {
      if (loaded) {
        setLiveGame(loaded);
      }
    });

    return () => {
      unsub();
    };
  }, [campaignId, gameId, propGame]);

  const handleTogglePauseGame = async () => {
    if (!campaignId || !gameId || !liveGame) return;
    setIsUpdatingGameStatus(true);
    try {
      const nextStatus = liveGame.status === 'paused' ? 'active' : 'paused';
      await GameService.updateGameStatus(campaignId, gameId, nextStatus);
    } catch (err) {
      console.error('Erro ao alternar pausa da aventura:', err);
    } finally {
      setIsUpdatingGameStatus(false);
    }
  };

  const handleConfirmFinishGame = async () => {
    if (!campaignId || !gameId) return;
    setIsUpdatingGameStatus(true);
    try {
      await GameService.updateGameStatus(campaignId, gameId, 'finished');
      setIsFinishingModalOpen(false);
      if (onExitAdventure) {
        onExitAdventure();
      }
    } catch (err) {
      console.error('Erro ao finalizar aventura:', err);
    } finally {
      setIsUpdatingGameStatus(false);
    }
  };
  // Estado dos Mapas e Pastas
  const [maps, setMaps] = useState<TestMap[]>(SAMPLE_MAPS);
  const [folders, setFolders] = useState<MapFolder[]>(SAMPLE_FOLDERS);
  const [isLoadingMaps, setIsLoadingMaps] = useState(true);

  // Carregar Último Estado Salvo do Mestre (localStorage)
  const initialPersistedState = useMemo(() => loadPersistedEditorState(), []);

  // Divisão de Tela (1, 2, 3 ou 4 Mapas)
  const [splitCount, setSplitCount] = useState<SplitLayoutCount>(initialPersistedState?.splitCount || 1);
  const [activeQuadrantIndex, setActiveQuadrantIndex] = useState<number>(initialPersistedState?.activeQuadrantIndex ?? 0);

  // Estados Independentes de cada Quadrante (0, 1, 2, 3)
  const [quadrants, setQuadrants] = useState<QuadrantMapState[]>(() => {
    if (initialPersistedState?.quadrants) {
      return initialPersistedState.quadrants.map(q => ({
        ...q,
        resetViewTrigger: 0
      }));
    }
    return [
      { quadrantId: 0, mapId: SAMPLE_MAPS[0]?.id || null, zoom: 1, pan: { x: 0, y: 0 }, resetViewTrigger: 0 },
      { quadrantId: 1, mapId: null, zoom: 1, pan: { x: 0, y: 0 }, resetViewTrigger: 0 },
      { quadrantId: 2, mapId: null, zoom: 1, pan: { x: 0, y: 0 }, resetViewTrigger: 0 },
      { quadrantId: 3, mapId: null, zoom: 1, pan: { x: 0, y: 0 }, resetViewTrigger: 0 },
    ];
  });

  // Refs de sincronização para salvar estado sem dependências circulares
  const splitCountRef = useRef(splitCount);
  const activeQuadrantIndexRef = useRef(activeQuadrantIndex);
  const quadrantsRef = useRef(quadrants);
  const lastStateSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  splitCountRef.current = splitCount;
  activeQuadrantIndexRef.current = activeQuadrantIndex;
  quadrantsRef.current = quadrants;

  const saveToLocalStorage = useCallback((
    overrideSplit?: SplitLayoutCount,
    overrideActiveIdx?: number,
    overrideQuads?: QuadrantMapState[],
    immediate?: boolean
  ) => {
    if (lastStateSaveTimerRef.current) {
      clearTimeout(lastStateSaveTimerRef.current);
      lastStateSaveTimerRef.current = null;
    }

    const doSave = () => {
      try {
        const currentSplit = overrideSplit !== undefined ? overrideSplit : splitCountRef.current;
        const currentActiveIdx = overrideActiveIdx !== undefined ? overrideActiveIdx : activeQuadrantIndexRef.current;
        const currentQuads = overrideQuads !== undefined ? overrideQuads : quadrantsRef.current;

        const payload: PersistedEditorState = {
          splitCount: currentSplit,
          activeQuadrantIndex: currentActiveIdx,
          quadrants: currentQuads.map(q => ({
            quadrantId: q.quadrantId,
            mapId: q.mapId,
            zoom: q.zoom,
            pan: q.pan
          }))
        };
        localStorage.setItem(LAST_STATE_STORAGE_KEY, JSON.stringify(payload));
      } catch (e) {
        console.warn('Erro ao salvar realmor_map_editor_last_state:', e);
      }
    };

    if (immediate) {
      doSave();
    } else {
      lastStateSaveTimerRef.current = setTimeout(doSave, 600);
    }
  }, []);

  // Seletor Dropdown de Mapa por Quadrante e Menu de Opções
  const [openSelectorQuadrant, setOpenSelectorQuadrant] = useState<number | null>(null);
  const [openQuadrantMenu, setOpenQuadrantMenu] = useState<number | null>(null);

  // Estado da Biblioteca Acoplada
  const [isLibraryOpen, setIsLibraryOpen] = useState<boolean>(false);
  // Estado do Bestiário Acoplado
  const [isBestiaryOpen, setIsBestiaryOpen] = useState<boolean>(false);

  // Manipuladores de Painéis Exclusivos (Biblioteca vs Bestiário vs Ferramentas vs Propriedades)
  const handleToggleLibrary = useCallback(() => {
    setIsLibraryOpen(prev => {
      const willOpen = !prev;
      if (willOpen) {
        setSelectedObject(null);
        setIsBestiaryOpen(false);
      }
      return willOpen;
    });
  }, []);

  const handleCloseLibrary = useCallback(() => {
    setIsLibraryOpen(false);
  }, []);

  const handleToggleBestiary = useCallback(() => {
    setIsBestiaryOpen(prev => {
      const willOpen = !prev;
      if (willOpen) {
        setSelectedObject(null);
        setIsLibraryOpen(false);
      }
      return willOpen;
    });
  }, []);

  const handleCloseBestiary = useCallback(() => {
    setIsBestiaryOpen(false);
  }, []);

  // Estado da Ferramenta e Objeto Selecionado
  const [activeTool, setActiveTool] = useState<ToolType>('select');
  const [selectedObject, setSelectedObject] = useState<SelectedObject | null>(null);

  // Ferramentas de Formas, Desenho e Medição
  const [activeShapeType, setActiveShapeType] = useState<ShapeType>('rect');
  const [shapeStrokeColor, setShapeStrokeColor] = useState<string>('#f59e0b');
  const [shapeStrokeWidth, setShapeStrokeWidth] = useState<number>(3);
  const [drawColor, setDrawColor] = useState<string>('#f59e0b');
  const [drawWidth, setDrawWidth] = useState<number>(4);
  const [scaleMeters, setScaleMeters] = useState<number>(3);

  // Histórico Local de Desfazer / Refazer (Undo / Redo)
  const [undoStack, setUndoStack] = useState<HistorySnapshot[]>([]);
  const [redoStack, setRedoStack] = useState<HistorySnapshot[]>([]);

  // Estado de Sincronização com TV
  const [syncStatus, setSyncStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [isTvConnected, setIsTvConnected] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Modais e Menus
  const [isMapModalOpen, setIsMapModalOpen] = useState<boolean>(false);
  const [isTopMapDropdownOpen, setIsTopMapDropdownOpen] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);

  // Formulário de Novo Mapa (com seleção de Pasta)
  const [newMapName, setNewMapName] = useState('');
  const [uploadTargetFolderId, setUploadTargetFolderId] = useState<string>('unorganized');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editorRootRef = useRef<HTMLDivElement>(null);
  const tvWindowRef = useRef<Window | null>(null);

  // Mapa ativo no momento (associado ao quadrante ativo)
  const currentQuadrant = quadrants[activeQuadrantIndex] || quadrants[0];
  const activeMap = maps.find(m => m.id === currentQuadrant.mapId) || maps[0] || SAMPLE_MAPS[0];

  // Grade do Mapa Ativo (automática por padrão ou configuração manual existente)
  const gridSettings: GridSettings = getEffectiveGrid(activeMap);

  // Configuração da Névoa do Mapa Ativo
  const fogSettings: FogSettings = activeMap.fogSettings || DEFAULT_FOG_SETTINGS;

  // Carregar mapas e pastas iniciais do Firestore
  useEffect(() => {
    let isMounted = true;
    Promise.all([fetchTestMaps(), fetchMapFolders()]).then(([loadedMaps, loadedFolders]) => {
      if (isMounted) {
        if (loadedMaps.length > 0) {
          setMaps(loadedMaps);
          
          setQuadrants(prev => {
            const next = prev.map((q, idx) => {
              if (q.mapId) {
                const mapExists = loadedMaps.some(m => m.id === q.mapId);
                // Se o mapa não existe mais (excluído), o slot fica vazio (null) de forma segura
                return mapExists ? q : { ...q, mapId: null };
              }
              // Se não havia estado salvo prévio no localStorage e for o quadrante 0, define o primeiro mapa
              if (idx === 0 && !initialPersistedState) {
                return { ...q, mapId: loadedMaps[0].id };
              }
              return q;
            });
            return next;
          });
        }
        if (loadedFolders.length > 0) {
          setFolders(loadedFolders);
        }
        setIsLoadingMaps(false);
      }
    }).catch(err => {
      console.warn('Erro ao carregar mapas e pastas:', err);
      if (isMounted) setIsLoadingMaps(false);
    });

    return () => { isMounted = false; };
  }, [initialPersistedState]);

  // Monitorar se a TV está conectada
  useEffect(() => {
    const checkTvStatus = () => {
      if (tvWindowRef.current) {
        setIsTvConnected(!tvWindowRef.current.closed);
      }
    };

    const interval = setInterval(checkTvStatus, 2000);
    window.addEventListener('focus', checkTvStatus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', checkTvStatus);
    };
  }, []);

  const saveDebounceRef = useRef<NodeJS.Timeout | null>(null);
  const pendingMapRef = useRef<TestMap | null>(null);
  const pendingReasonRef = useRef<string>('map update');

  // Limpar timer de salvamento ao desmontar e salvar pendências
  useEffect(() => {
    return () => {
      if (saveDebounceRef.current) {
        clearTimeout(saveDebounceRef.current);
      }
      if (lastStateSaveTimerRef.current) {
        clearTimeout(lastStateSaveTimerRef.current);
      }
      if (pendingMapRef.current) {
        saveTestMap(pendingMapRef.current, pendingReasonRef.current).catch(() => {});
      }
    };
  }, []);

  // Handlers para divisão de tela e seleção de quadrante
  const handleSelectSplitCount = (count: SplitLayoutCount) => {
    setSplitCount(count);
    saveToLocalStorage(count, undefined, undefined, true);
  };

  const handleSelectActiveQuadrant = (index: number) => {
    if (activeQuadrantIndex !== index) {
      setActiveQuadrantIndex(index);
      saveToLocalStorage(undefined, index, undefined, true);
    }
  };

  // Salvar snapshot antes de alterações para Undo
  const pushHistorySnapshot = useCallback(() => {
    setUndoStack(prev => [
      ...prev.slice(-15),
      {
        mapId: activeMap.id,
        markers: activeMap.markers || [],
        drawings: activeMap.drawings || [],
        shapes: activeMap.shapes || [],
        fogData: activeMap.fogData
      }
    ]);
    setRedoStack([]);
  }, [activeMap.id, activeMap.markers, activeMap.drawings, activeMap.shapes, activeMap.fogData]);

  // Atualizar propriedades do mapa ativo com debounce inteligente (salva no Firestore apenas após estabilização)
  const updateActiveMap = useCallback((updater: Partial<TestMap>, reason: string = 'map update') => {
    setMaps(prevMaps => prevMaps.map(m => {
      if (m.id === activeMap.id) {
        const updated = { ...m, ...updater, updatedAt: new Date().toISOString() };
        pendingMapRef.current = updated;
        pendingReasonRef.current = reason;

        if (saveDebounceRef.current) {
          clearTimeout(saveDebounceRef.current);
        }

        saveDebounceRef.current = setTimeout(() => {
          if (pendingMapRef.current) {
            saveTestMap(pendingMapRef.current, pendingReasonRef.current).catch(e => 
              console.warn('Aviso ao salvar mapa no Firestore:', e)
            );
          }
        }, 1200);

        return updated;
      }
      return m;
    }));
  }, [activeMap.id]);

  // Atualizar Viewport específico de um quadrante (Zoom / Pan independente)
  const updateQuadrantViewport = useCallback((quadrantIndex: number, updates: Partial<QuadrantMapState>) => {
    setQuadrants(prev => {
      const next = prev.map((q, idx) => {
        if (idx === quadrantIndex) {
          return { ...q, ...updates };
        }
        return q;
      });
      saveToLocalStorage(undefined, undefined, next, false);
      return next;
    });
  }, [saveToLocalStorage]);

  const handleUpdateQuadrantZoom = useCallback((quadrantIndex: number, action: React.SetStateAction<number>) => {
    setQuadrants(prev => {
      const target = prev[quadrantIndex];
      if (!target) return prev;
      const newZ = typeof action === 'function' ? (action as (p: number) => number)(target.zoom) : action;
      if (Math.abs(target.zoom - newZ) < 0.0001) return prev;
      const next = prev.map((q, idx) => idx === quadrantIndex ? { ...q, zoom: newZ } : q);
      saveToLocalStorage(undefined, undefined, next, false);
      return next;
    });
  }, [saveToLocalStorage]);

  const handleUpdateQuadrantPan = useCallback((quadrantIndex: number, action: React.SetStateAction<{ x: number; y: number }>) => {
    setQuadrants(prev => {
      const target = prev[quadrantIndex];
      if (!target) return prev;
      const newP = typeof action === 'function' ? (action as (p: { x: number; y: number }) => { x: number; y: number })(target.pan) : action;
      if (Math.abs(target.pan.x - newP.x) < 0.5 && Math.abs(target.pan.y - newP.y) < 0.5) return prev;
      const next = prev.map((q, idx) => idx === quadrantIndex ? { ...q, pan: newP } : q);
      saveToLocalStorage(undefined, undefined, next, false);
      return next;
    });
  }, [saveToLocalStorage]);

  // Alterar o mapa de um quadrante específico
  const setQuadrantMap = (quadrantIndex: number, mapId: string | null) => {
    setQuadrants(prev => {
      const next = prev.map((q, idx) => {
        if (idx === quadrantIndex) {
          return { 
            ...q, 
            mapId, 
            zoom: 1, 
            pan: { x: 0, y: 0 }, 
            resetViewTrigger: (q.resetViewTrigger || 0) + 1 
          };
        }
        return q;
      });
      saveToLocalStorage(undefined, quadrantIndex, next, true);
      return next;
    });
    setActiveQuadrantIndex(quadrantIndex);
    setOpenSelectorQuadrant(null);
    setOpenQuadrantMenu(null);
  };

  // Remover mapa de um quadrante (deixa o espaço vazio sem excluir o mapa)
  const handleRemoveQuadrantMap = (quadrantIndex: number) => {
    setQuadrants(prev => {
      const next = prev.map((q, idx) => {
        if (idx === quadrantIndex) {
          return { ...q, mapId: null };
        }
        return q;
      });
      saveToLocalStorage(undefined, undefined, next, true);
      return next;
    });
    setOpenQuadrantMenu(null);
    setOpenSelectorQuadrant(null);
  };

  // ============================================================
  // DESFAZER (UNDO) E REFAZER (REDO)
  // ============================================================
  const handleUndo = useCallback(() => {
    if (undoStack.length === 0) return;
    const last = undoStack[undoStack.length - 1];
    const newUndoStack = undoStack.slice(0, -1);

    const targetMap = maps.find(m => m.id === last.mapId) || activeMap;

    setRedoStack(prev => [
      ...prev,
      {
        mapId: targetMap.id,
        markers: targetMap.markers || [],
        drawings: targetMap.drawings || [],
        shapes: targetMap.shapes || [],
        fogData: targetMap.fogData
      }
    ]);

    setUndoStack(newUndoStack);
    setMaps(prevMaps => prevMaps.map(m => {
      if (m.id === last.mapId) {
        return {
          ...m,
          markers: last.markers,
          drawings: last.drawings,
          shapes: last.shapes,
          fogData: last.fogData,
          updatedAt: new Date().toISOString()
        };
      }
      return m;
    }));
    setSelectedObject(null);
  }, [undoStack, activeMap, maps]);

  const handleRedo = useCallback(() => {
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    const newRedoStack = redoStack.slice(0, -1);

    const targetMap = maps.find(m => m.id === next.mapId) || activeMap;

    setUndoStack(prev => [
      ...prev,
      {
        mapId: targetMap.id,
        markers: targetMap.markers || [],
        drawings: targetMap.drawings || [],
        shapes: targetMap.shapes || [],
        fogData: targetMap.fogData
      }
    ]);

    setRedoStack(newRedoStack);
    setMaps(prevMaps => prevMaps.map(m => {
      if (m.id === next.mapId) {
        return {
          ...m,
          markers: next.markers,
          drawings: next.drawings,
          shapes: next.shapes,
          fogData: next.fogData,
          updatedAt: new Date().toISOString()
        };
      }
      return m;
    }));
    setSelectedObject(null);
  }, [redoStack, activeMap, maps]);

  // Atalhos de teclado globais
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

      // Undo: Ctrl+Z ou Cmd+Z
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
        return;
      }

      // Redo: Ctrl+Y ou Ctrl+Shift+Z
      if (((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') || 
          ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'z')) {
        e.preventDefault();
        handleRedo();
        return;
      }

      // Delete / Backspace: Apagar objeto selecionado
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedObject) {
          e.preventDefault();
          handleDeleteObject(selectedObject);
          return;
        }
      }

      // Atalhos de Ferramentas
      switch (e.key.toLowerCase()) {
        case 'v':
          setActiveTool('select');
          break;
        case 'h':
          setActiveTool('pan');
          break;
        case 'm':
          setActiveTool('measure');
          break;
        case 'n':
        case 'f':
          setActiveTool('fog');
          break;
        case 'g':
          setActiveTool('grid');
          break;
        case 'd':
          setActiveTool('draw');
          break;
        case 'r':
          setActiveTool('shape');
          setActiveShapeType('rect');
          break;
        case 'c':
          setActiveTool('shape');
          setActiveShapeType('circle');
          break;
        case 'l':
          setActiveTool('shape');
          setActiveShapeType('line');
          break;
        case 'e':
          setActiveTool('eraser');
          break;
        case 'escape':
          setSelectedObject(null);
          setOpenSelectorQuadrant(null);
          setIsTopMapDropdownOpen(false);
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo, selectedObject]);

  // ============================================================
  // HANDLERS DE EDIÇÃO DO MAPA ATIVO
  // ============================================================
  const handleUpdateGrid = (newSettings: Partial<GridSettings>) => {
    updateActiveMap({
      grid: { ...gridSettings, ...newSettings }
    }, 'grid update');
  };

  const handleUpdateFogSettings = (newSettings: Partial<FogSettings>) => {
    updateActiveMap({
      fogSettings: { ...fogSettings, ...newSettings }
    }, 'fog settings');
  };

  const handleFogChange = (newFogData: string) => {
    pushHistorySnapshot();
    updateActiveMap({ fogData: newFogData }, 'fog paint');
  };

  const handleClearFog = () => {
    pushHistorySnapshot();
    updateActiveMap({ fogData: '' }, 'reveal all fog');
    if ((window as any).__vtt_clear_all_fog) {
      (window as any).__vtt_clear_all_fog();
    }
  };

  const handleCoverAllFog = () => {
    pushHistorySnapshot();
    if ((window as any).__vtt_cover_all_fog) {
      (window as any).__vtt_cover_all_fog();
    }
  };

  const handleAddMarker = (x: number, y: number) => {
    pushHistorySnapshot();
    const newMarker: MapMarker = {
      id: `marker-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      x,
      y,
      label: `Marcador ${((activeMap.markers || []).length + 1)}`,
      color: '#f59e0b',
      icon: 'pin'
    };

    const currentMarkers = activeMap.markers || [];
    updateActiveMap({
      markers: [...currentMarkers, newMarker]
    }, 'add marker');
    setSelectedObject({ id: newMarker.id, type: 'marker' });
  };

  const handleUpdateMarker = (markerId: string, updates: Partial<MapMarker>) => {
    const currentMarkers = activeMap.markers || [];
    updateActiveMap({
      markers: currentMarkers.map(m => m.id === markerId ? { ...m, ...updates } : m)
    }, 'update marker');
  };

  const handleUpdateMarkerPosition = (markerId: string, x: number, y: number) => {
    const currentMarkers = activeMap.markers || [];
    updateActiveMap({
      markers: currentMarkers.map(m => m.id === markerId ? { ...m, x, y } : m)
    }, 'move marker');
  };

  const handleAddDrawing = (drawingData: Omit<MapDrawing, 'id'>) => {
    pushHistorySnapshot();
    const newDrawing: MapDrawing = {
      ...drawingData,
      id: `draw-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`
    };
    const currentDrawings = activeMap.drawings || [];
    updateActiveMap({
      drawings: [...currentDrawings, newDrawing]
    }, 'add drawing');
  };

  const handleUpdateDrawing = (drawingId: string, updates: Partial<MapDrawing>) => {
    const currentDrawings = activeMap.drawings || [];
    updateActiveMap({
      drawings: currentDrawings.map(d => d.id === drawingId ? { ...d, ...updates } : d)
    }, 'update drawing');
  };

  const handleAddShape = (shapeData: Omit<MapShape, 'id'>) => {
    pushHistorySnapshot();
    const newShape: MapShape = {
      ...shapeData,
      id: `shape-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`
    };
    const currentShapes = activeMap.shapes || [];
    updateActiveMap({
      shapes: [...currentShapes, newShape]
    }, 'add shape');
    setSelectedObject({ id: newShape.id, type: 'shape' });
  };

  const handleUpdateShape = (shapeId: string, updates: Partial<MapShape>) => {
    const currentShapes = activeMap.shapes || [];
    updateActiveMap({
      shapes: currentShapes.map(s => s.id === shapeId ? { ...s, ...updates } : s)
    }, 'update shape');
  };

  const handleDeleteObject = (obj: SelectedObject) => {
    pushHistorySnapshot();
    if (obj.type === 'marker') {
      const currentMarkers = activeMap.markers || [];
      updateActiveMap({
        markers: currentMarkers.filter(m => m.id !== obj.id)
      }, 'delete marker');
    } else if (obj.type === 'drawing') {
      const currentDrawings = activeMap.drawings || [];
      updateActiveMap({
        drawings: currentDrawings.filter(d => d.id !== obj.id)
      }, 'delete drawing');
    } else if (obj.type === 'shape') {
      const currentShapes = activeMap.shapes || [];
      updateActiveMap({
        shapes: currentShapes.filter(s => s.id !== obj.id)
      }, 'delete shape');
    }
    setSelectedObject(null);
  };

  // ============================================================
  // GERENCIAMENTO DA BIBLIOTECA & PASTAS
  // ============================================================
  const handleCreateFolder = async (folderData: Omit<MapFolder, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newFolder: MapFolder = {
      id: `folder-${Date.now()}`,
      name: folderData.name,
      icon: folderData.icon,
      description: folderData.description,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    await saveMapFolder(newFolder);
    setFolders(prev => [...prev, newFolder]);
  };

  const handleUpdateFolder = async (folderId: string, updates: Partial<MapFolder>) => {
    const target = folders.find(f => f.id === folderId);
    if (!target) return;
    const updated = { ...target, ...updates, updatedAt: new Date().toISOString() };
    await saveMapFolder(updated);
    setFolders(prev => prev.map(f => f.id === folderId ? updated : f));
  };

  const handleDeleteFolder = async (folderId: string) => {
    await deleteMapFolder(folderId);
    setFolders(prev => prev.filter(f => f.id !== folderId));
    setMaps(prev => prev.map(m => m.folderId === folderId ? { ...m, folderId: undefined } : m));
  };

  const handleRenameMap = async (mapId: string, newName: string) => {
    await renameMap(mapId, newName);
    setMaps(prev => prev.map(m => m.id === mapId ? { ...m, name: newName } : m));
  };

  const handleMoveMap = async (mapId: string, folderId?: string) => {
    await moveMapToFolder(mapId, folderId);
    setMaps(prev => prev.map(m => m.id === mapId ? { ...m, folderId } : m));
  };

  const handleDeleteMap = async (mapId: string) => {
    if (maps.length <= 1) {
      alert('É necessário manter ao menos um mapa no Reino.');
      return;
    }
    await deleteTestMap(mapId);
    setMaps(prev => {
      const remaining = prev.filter(m => m.id !== mapId);
      // Atualiza quadrantes que apontavam para este mapa deixando o slot vazio para escolher outro destino
      setQuadrants(quads => {
        const next = quads.map(q => q.mapId === mapId ? { ...q, mapId: null } : q);
        saveToLocalStorage(undefined, undefined, next, true);
        return next;
      });
      return remaining;
    });
  };

  const handleOpenUploadModal = (folderId?: string) => {
    setUploadTargetFolderId(folderId || 'unorganized');
    setUploadError(null);
    setNewMapName('');
    setIsMapModalOpen(true);
  };

  // Abrir Janela da TV
  const handleOpenTv = () => {
    const tvUrl = `${window.location.origin}${window.location.pathname}?mode=tv`;
    try {
      if (tvWindowRef.current && !tvWindowRef.current.closed) {
        tvWindowRef.current.focus();
        setIsTvConnected(true);
        return;
      }
      const newWin = window.open(tvUrl, 'realmor_tv_window');
      tvWindowRef.current = newWin;
      if (newWin) {
        setIsTvConnected(true);
      }
    } catch (err) {
      console.warn('Não foi possível abrir a janela da TV:', err);
    }
  };

  // ============================================================
  // AÇÃO PRINCIPAL: [ 📺 ATUALIZAR NA TV ]
  // ============================================================
  const handleBroadcastToTv = async () => {
    setSyncStatus('sending');
    try {
      // Montar quadrantes ativos da divisão de tela
      const activeQuadrantsList: TvSyncQuadrantItem[] = quadrants.slice(0, splitCount).map((q, idx) => {
        const qMap = q.mapId ? maps.find(m => m.id === q.mapId) : null;
        if (!qMap) {
          return {
            mapId: '',
            mapName: '',
            imageUrl: '',
            markers: [],
            drawings: [],
            shapes: [],
            viewport: {
              zoom: q.zoom,
              panX: q.pan.x,
              panY: q.pan.y
            }
          };
        }
        return {
          mapId: qMap.id,
          mapName: qMap.name,
          imageUrl: qMap.imageUrl,
          grid: qMap.grid,
          fogData: qMap.fogData || '',
          fogSettings: qMap.fogSettings,
          markers: qMap.markers || [],
          drawings: qMap.drawings || [],
          shapes: qMap.shapes || [],
          viewport: {
            zoom: q.zoom,
            panX: q.pan.x,
            panY: q.pan.y
          }
        };
      });

      const syncPayload: TvSyncState = {
        mapId: activeMap.id,
        mapName: activeMap.name,
        imageUrl: activeMap.imageUrl,
        grid: gridSettings,
        fogData: activeMap.fogData || '',
        fogSettings: fogSettings,
        markers: activeMap.markers || [],
        drawings: activeMap.drawings || [],
        shapes: activeMap.shapes || [],
        viewport: {
          zoom: currentQuadrant.zoom,
          panX: currentQuadrant.pan.x,
          panY: currentQuadrant.pan.y
        },
        splitCount: splitCount,
        quadrants: activeQuadrantsList,
        updatedAt: new Date().toISOString()
      };

      await broadcastToTv(syncPayload);
      setSyncStatus('success');

      if (tvWindowRef.current && !tvWindowRef.current.closed) {
        setIsTvConnected(true);
      }

      setTimeout(() => {
        setSyncStatus('idle');
      }, 3000);
    } catch (err) {
      console.error('Falha ao atualizar na TV:', err);
      setSyncStatus('error');
      setTimeout(() => setSyncStatus('idle'), 3000);
    }
  };

  const handleResetActiveQuadrantView = () => {
    setQuadrants(prev => prev.map((q, idx) => {
      if (idx === activeQuadrantIndex) {
        return { ...q, resetViewTrigger: (q.resetViewTrigger || 0) + 1 };
      }
      return q;
    }));
  };

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      editorRootRef.current?.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Upload de Imagem de Mapa
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      const { url, name } = await uploadMapImage(file);
      const chosenFolder = uploadTargetFolderId === 'unorganized' ? undefined : uploadTargetFolderId;
      const newMap: TestMap = {
        id: `map-${Date.now()}`,
        name: newMapName.trim() || name,
        imageUrl: url,
        folderId: chosenFolder,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        grid: calculateAutomaticGrid(),
        markers: [],
        drawings: [],
        shapes: []
      };

      await saveTestMap(newMap, 'new map upload');
      setMaps(prev => [newMap, ...prev]);
      setQuadrantMap(activeQuadrantIndex, newMap.id);
      setIsMapModalOpen(false);
      setNewMapName('');
    } catch (err: any) {
      console.error('Erro no upload de mapa:', err);
      setUploadError(err.message || 'Falha ao processar arquivo.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div 
      ref={editorRootRef}
      id="realmor-map-editor"
      className="w-full h-full flex flex-col bg-stone-950 text-stone-100 overflow-hidden select-none font-sans relative"
    >
      {/* ============================================================ */}
      {/* 1. BARRA SUPERIOR COMPACTA COM DESFAZER/REFAZER              */}
      {/* ============================================================ */}
      <header 
        id="map-top-bar"
        className="h-12 sm:h-13 bg-stone-950 border-b border-amber-900/40 px-2 sm:px-4 flex items-center justify-between shrink-0 z-30 shadow-md gap-2"
        style={{
          backgroundImage: 'linear-gradient(to right, rgba(20, 18, 16, 0.98), rgba(12, 10, 9, 0.98))'
        }}
      >
        {/* Lado Esquerdo: Identidade ⚔️ MESA DO MESTRE + Status + 📚 MAPAS + Seletor de Mapa + Desfazer/Refazer */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0">
          {/* Título Oficial: ⚔️ MESA DO MESTRE */}
          <div className="flex items-center gap-1.5 shrink-0 pr-1.5 sm:pr-2 border-r border-amber-900/40">
            <span className="text-amber-500 font-bold text-sm">⚔️</span>
            <div className="hidden lg:block leading-tight">
              <h1 className="font-cinzel font-black text-xs text-amber-200 tracking-widest uppercase">
                MESA DO MESTRE
              </h1>
              {liveGame?.name && (
                <p className="text-[9px] text-stone-400 font-medium truncate max-w-[130px]">
                  {liveGame.name}
                </p>
              )}
            </div>
          </div>

          {/* Badge de Status da Aventura */}
          {liveGame && (
            <div className="hidden xl:flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-stone-900 border border-amber-900/40 text-[10px] font-cinzel font-bold shrink-0">
              <span className={`w-2 h-2 rounded-full ${
                liveGame.status === 'paused' 
                  ? 'bg-amber-400' 
                  : 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse'
              }`} />
              <span className={liveGame.status === 'paused' ? 'text-amber-300' : 'text-emerald-300'}>
                {liveGame.status === 'paused' ? 'PAUSADA' : 'ATIVA'}
              </span>
            </div>
          )}

          {/* Botão Principal: 📚 MAPAS */}
          <button
            type="button"
            id="open-map-library-top-btn"
            onClick={handleToggleLibrary}
            className={`flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg border text-xs font-cinzel font-black tracking-wider uppercase transition-all shadow-sm cursor-pointer shrink-0 ${
              isLibraryOpen
                ? 'bg-amber-800/80 border-amber-400 text-amber-100 shadow-[0_0_12px_rgba(245,158,11,0.3)]'
                : 'bg-stone-900 hover:bg-stone-850 border-amber-900/50 hover:border-amber-600/70 text-amber-300'
            }`}
            title="Abrir Biblioteca e Pastas de Mapas"
          >
            <BookOpen size={14} className="text-amber-400" />
            <span className="hidden sm:inline">MAPAS</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-stone-950 text-amber-400/90 border border-amber-900/60 ml-0.5">
              {maps.length}
            </span>
          </button>

          {/* Troca Rápida de Mapa do Quadrante Ativo */}
          <div className="relative shrink-0">
            <button
              type="button"
              id="map-selector-dropdown-btn"
              onClick={() => setIsTopMapDropdownOpen(prev => !prev)}
              className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-2.5 py-1.5 rounded-lg bg-stone-900 border border-amber-900/50 hover:border-amber-600/70 text-xs font-cinzel font-bold text-amber-200 transition-all cursor-pointer max-w-[130px] sm:max-w-[200px]"
            >
              <MapIcon size={14} className="text-amber-400 shrink-0" />
              <span className="truncate">{activeMap.name}</span>
              {splitCount > 1 && (
                <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-amber-950/80 text-amber-400 border border-amber-800/50">
                  Q{activeQuadrantIndex + 1}
                </span>
              )}
              <ChevronDown size={13} className="text-amber-400/80 shrink-0" />
            </button>

            {/* Dropdown de Mapas */}
            {isTopMapDropdownOpen && (
              <div 
                className="absolute left-0 mt-1.5 w-64 bg-stone-950 border border-amber-700/60 rounded-xl shadow-2xl z-50 overflow-hidden font-cinzel"
                onMouseLeave={() => setIsTopMapDropdownOpen(false)}
              >
                <div className="p-2 border-b border-amber-900/40 bg-stone-900/80 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">
                    {splitCount > 1 ? `MAPA PARA QUADRANTE ${activeQuadrantIndex + 1}` : 'SELECIONE O MAPA'}
                  </span>
                </div>
                <div className="max-h-60 overflow-y-auto p-1 space-y-0.5">
                  {maps.map(m => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => {
                        setQuadrantMap(activeQuadrantIndex, m.id);
                        setIsTopMapDropdownOpen(false);
                      }}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors ${
                        m.id === activeMap.id 
                          ? 'bg-amber-950/80 text-amber-200 font-bold border border-amber-700/50' 
                          : 'text-stone-300 hover:bg-stone-900 hover:text-amber-300'
                      }`}
                    >
                      <span className="truncate">{m.name}</span>
                      {m.id === activeMap.id && <Check size={13} className="text-amber-400 shrink-0" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="w-px h-5 bg-amber-900/30 hidden sm:block" />

          {/* Botões Desfazer (Ctrl+Z) e Refazer (Ctrl+Y) */}
          <div className="hidden sm:flex items-center gap-1">
            <button
              type="button"
              id="editor-undo-btn"
              disabled={undoStack.length === 0}
              onClick={handleUndo}
              className={`p-1.5 rounded-lg border text-stone-400 transition-all ${
                undoStack.length > 0
                  ? 'hover:text-amber-300 hover:bg-stone-900 border-amber-900/40 cursor-pointer text-stone-300'
                  : 'border-transparent opacity-30 cursor-not-allowed'
              }`}
              title="Desfazer Ação (Ctrl+Z)"
            >
              <Undo2 size={15} />
            </button>
            <button
              type="button"
              id="editor-redo-btn"
              disabled={redoStack.length === 0}
              onClick={handleRedo}
              className={`p-1.5 rounded-lg border text-stone-400 transition-all ${
                redoStack.length > 0
                  ? 'hover:text-amber-300 hover:bg-stone-900 border-amber-900/40 cursor-pointer text-stone-300'
                  : 'border-transparent opacity-30 cursor-not-allowed'
              }`}
              title="Refazer Ação (Ctrl+Y)"
            >
              <Redo2 size={15} />
            </button>
          </div>
        </div>

        {/* Lado Direito: Controles do Cockpit da Aventura + TV + Tela Cheia */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Controles de Gerenciamento da Aventura (Apenas Mestre com Partida Ativa) */}
          {liveGame && campaignId && gameId && isMaster && (
            <div className="flex items-center gap-1 sm:gap-1.5 pr-1 border-r border-amber-900/40">
              {/* Botão Pausar / Retomar */}
              <button
                type="button"
                id="master-toggle-pause-btn"
                disabled={isUpdatingGameStatus}
                onClick={handleTogglePauseGame}
                className="px-2 py-1 rounded-lg bg-stone-900 hover:bg-amber-950/60 border border-amber-900/40 hover:border-amber-700/60 text-[11px] font-cinzel font-bold text-amber-300 flex items-center gap-1 transition-all cursor-pointer"
                title={liveGame.status === 'paused' ? 'Retomar Aventura' : 'Pausar Aventura temporariamente'}
              >
                {liveGame.status === 'paused' ? (
                  <>
                    <Play size={12} className="text-emerald-400 fill-emerald-400" />
                    <span className="hidden md:inline">RETOMAR</span>
                  </>
                ) : (
                  <>
                    <Pause size={12} className="text-amber-400" />
                    <span className="hidden md:inline">PAUSAR</span>
                  </>
                )}
              </button>

              {/* Botão Ver Lobby / Detalhes */}
              {onOpenLobbyModal && (
                <button
                  type="button"
                  id="master-open-lobby-btn"
                  onClick={onOpenLobbyModal}
                  className="px-2 py-1 rounded-lg bg-stone-900 hover:bg-amber-950/60 border border-amber-900/40 hover:border-amber-700/60 text-[11px] font-cinzel font-bold text-amber-300 flex items-center gap-1 transition-all cursor-pointer"
                  title="Abrir Detalhes da Partida e Código de Convite"
                >
                  <FileText size={12} className="text-amber-400" />
                  <span className="hidden md:inline">LOBBY</span>
                </button>
              )}

              {/* Botão Finalizar Aventura */}
              <button
                type="button"
                id="master-finish-game-btn"
                onClick={() => setIsFinishingModalOpen(true)}
                className="px-2 py-1 rounded-lg bg-red-950/40 hover:bg-red-900/60 border border-red-900/50 hover:border-red-700 text-[11px] font-cinzel font-bold text-red-300 flex items-center gap-1 transition-all cursor-pointer"
                title="Finalizar e Concluir Aventura"
              >
                <XCircle size={12} className="text-red-400" />
                <span className="hidden lg:inline">FINALIZAR</span>
              </button>
            </div>
          )}

          {/* Indicador de TV Conectada */}
          <div 
            className="hidden md:flex items-center gap-1.5 px-2 py-0.5 rounded bg-stone-900/70 border border-stone-800 text-[10px] font-cinzel tracking-wider"
            title={isTvConnected ? 'TV ativa respondendo ao canal' : 'Nenhuma tela de TV ativa detectada'}
          >
            <span 
              className={`w-2 h-2 rounded-full ${
                isTvConnected 
                  ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse' 
                  : 'bg-stone-600'
              }`} 
            />
            <span className={isTvConnected ? 'text-emerald-300 font-bold' : 'text-stone-400'}>
              {isTvConnected ? 'TV ON' : 'TV OFF'}
            </span>
          </div>

          {/* Botão para Abrir Tela da TV */}
          <button
            type="button"
            id="map-open-tv-tab-btn"
            onClick={handleOpenTv}
            className="flex items-center gap-1.5 text-[11px] font-cinzel text-amber-400/90 hover:text-amber-200 px-2 sm:px-2.5 py-1 rounded bg-stone-900/80 hover:bg-stone-850 border border-amber-900/50 hover:border-amber-700/60 transition-all cursor-pointer shadow-sm"
            title="Abrir Tela da TV em nova aba independente"
          >
            <ExternalLink size={13} />
            <span className="hidden sm:inline">ABRIR TV</span>
          </button>

          {/* BOTÃO CRÍTICO: [ 📺 ATUALIZAR NA TV ] */}
          <button
            type="button"
            id="map-sync-tv-btn"
            disabled={syncStatus === 'sending'}
            onClick={handleBroadcastToTv}
            className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1.5 rounded-lg text-xs font-cinzel font-black tracking-wider uppercase transition-all shadow-md cursor-pointer ${
              syncStatus === 'sending'
                ? 'bg-amber-700/60 border border-amber-500 text-amber-100 cursor-wait'
                : syncStatus === 'success'
                ? 'bg-emerald-800/80 border border-emerald-400 text-emerald-100 shadow-[0_0_15px_rgba(52,211,153,0.4)]'
                : syncStatus === 'error'
                ? 'bg-red-800/80 border border-red-500 text-red-100'
                : 'bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700 hover:from-amber-600 hover:to-amber-500 text-stone-950 border border-amber-400/80 shadow-[0_0_15px_rgba(245,158,11,0.25)] hover:shadow-[0_0_20px_rgba(245,158,11,0.45)]'
            }`}
          >
            {syncStatus === 'sending' ? (
              <>
                <Loader2 size={14} className="animate-spin text-amber-200" />
                <span>TRANSMITINDO...</span>
              </>
            ) : syncStatus === 'success' ? (
              <>
                <Check size={14} className="text-emerald-300 stroke-[3]" />
                <span>✓ TV ATUALIZADA</span>
              </>
            ) : syncStatus === 'error' ? (
              <>
                <AlertCircle size={14} className="text-red-300" />
                <span>FALHA NA TV</span>
              </>
            ) : (
              <>
                <Tv size={14} className="stroke-[2.5]" />
                <span className="hidden sm:inline">ATUALIZAR NA TV</span>
                <span className="sm:hidden">TV</span>
              </>
            )}
          </button>

          {/* Botão [ ⛶ TELA CHEIA ] */}
          <button
            type="button"
            id="map-fullscreen-btn"
            onClick={handleToggleFullscreen}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-stone-400 hover:text-amber-300 hover:bg-stone-900 border border-amber-900/30 transition-all cursor-pointer"
            title={isFullscreen ? 'Sair da Tela Cheia' : 'Tela Cheia do Editor'}
          >
            {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
          </button>
        </div>
      </header>

      {/* ============================================================ */}
      {/* 2. ÁREA CENTRAL: BARRA ESQUERDA + BIBLIOTECA + MAPA + JOGADORES */}
      {/* ============================================================ */}
      <div 
        id="map-editor-body"
        className="flex-1 flex flex-row overflow-hidden relative"
      >
        {/* BARRA DE FERRAMENTAS LATERAL INTEGRADA */}
        <MapToolbar
          activeTool={activeTool}
          onSelectTool={setActiveTool}
          activeMapName={activeMap?.name}
          activeQuadrantIndex={activeQuadrantIndex}
          activeQuadrantNumber={activeQuadrantIndex + 1}
          gridSettings={gridSettings}
          onUpdateGrid={handleUpdateGrid}
          fogSettings={fogSettings}
          onUpdateFogSettings={handleUpdateFogSettings}
          onClearFog={handleClearFog}
          onCoverAllFog={handleCoverAllFog}
          activeShapeType={activeShapeType}
          onSelectShapeType={setActiveShapeType}
          shapeStrokeColor={shapeStrokeColor}
          onSetShapeStrokeColor={setShapeStrokeColor}
          shapeStrokeWidth={shapeStrokeWidth}
          onSetShapeStrokeWidth={setShapeStrokeWidth}
          drawColor={drawColor}
          onSetDrawColor={setDrawColor}
          drawWidth={drawWidth}
          onSetDrawWidth={setDrawWidth}
          scaleMeters={scaleMeters}
          onSetScaleMeters={setScaleMeters}
          selectedObject={selectedObject}
          onCloseProperties={() => setSelectedObject(null)}
          markers={activeMap.markers || []}
          drawings={activeMap.drawings || []}
          shapes={activeMap.shapes || []}
          onUpdateMarker={handleUpdateMarker}
          onUpdateDrawing={handleUpdateDrawing}
          onUpdateShape={handleUpdateShape}
          onDeleteObject={handleDeleteObject}
          onOpenImageModal={() => handleOpenUploadModal()}
          onResetView={handleResetActiveQuadrantView}
          zoomLevel={currentQuadrant.zoom}
          isLibraryOpen={isLibraryOpen}
          onToggleLibrary={handleToggleLibrary}
          onCloseLibrary={handleCloseLibrary}
          isBestiaryOpen={isBestiaryOpen}
          onToggleBestiary={handleToggleBestiary}
          onCloseBestiary={handleCloseBestiary}
        />

        {/* PAINEL ACOPLADO DA BIBLIOTECA DE MAPAS */}
        <MapLibraryDrawer
          isOpen={isLibraryOpen}
          onClose={handleCloseLibrary}
          maps={maps}
          folders={folders}
          activeMapId={activeMap.id}
          onSelectMap={(mapId) => setQuadrantMap(activeQuadrantIndex, mapId)}
          onCreateFolder={handleCreateFolder}
          onUpdateFolder={handleUpdateFolder}
          onDeleteFolder={handleDeleteFolder}
          onRenameMap={handleRenameMap}
          onMoveMap={handleMoveMap}
          onDeleteMap={handleDeleteMap}
          onOpenUploadModal={handleOpenUploadModal}
          splitCount={splitCount}
          onSelectSplitCount={handleSelectSplitCount}
        />

        {/* PAINEL ACOPLADO DO BESTIÁRIO DE MONSTROS */}
        <MapBestiaryDrawer
          isOpen={isBestiaryOpen}
          onClose={handleCloseBestiary}
          campaignId={campaignId}
        />

        {/* ÁREA CENTRAL: MAPAS NATIVOS 16:9 COM DIVISÃO DE TELA (1, 2, 3 OU 4 MAPAS) */}
        <main 
          id="map-center-viewport"
          className="flex-1 h-full overflow-hidden relative bg-stone-950"
        >
          {splitCount === 1 ? (
            /* 1 MAPA (TELA INTEIRA) */
            <div className="w-full h-full relative" onClick={() => handleSelectActiveQuadrant(0)}>
              {renderQuadrant(0)}
            </div>
          ) : splitCount === 2 ? (
            /* 2 MAPAS (LADO A LADO) */
            <div className="w-full h-full grid grid-cols-2 gap-1.5 p-1.5 bg-stone-900/40">
              {renderQuadrant(0)}
              {renderQuadrant(1)}
            </div>
          ) : splitCount === 3 ? (
            /* 3 MAPAS (COMPOSIÇÃO EQUILIBRADA: MAPA 1 E 3 EMPILHADOS À ESQUERDA, MAPA 2 À DIREITA) */
            <div className="w-full h-full grid grid-cols-2 grid-rows-2 gap-1.5 p-1.5 bg-stone-900/40">
              <div className="w-full h-full relative overflow-hidden">{renderQuadrant(0)}</div>
              <div className="w-full h-full relative overflow-hidden row-span-2">{renderQuadrant(1)}</div>
              <div className="w-full h-full relative overflow-hidden">{renderQuadrant(2)}</div>
            </div>
          ) : (
            /* 4 MAPAS (GRADE 2X2) */
            <div className="w-full h-full grid grid-cols-2 grid-rows-2 gap-1.5 p-1.5 bg-stone-900/40">
              {renderQuadrant(0)}
              {renderQuadrant(1)}
              {renderQuadrant(2)}
              {renderQuadrant(3)}
            </div>
          )}
        </main>

        {/* PAINEL DIREITO: JOGADORES REAIS DA PARTIDA COM COCKPIT DO MESTRE */}
        <PlayersPanel 
          campaignId={campaignId} 
          gameId={gameId} 
          isMaster={isMaster} 
        />
      </div>

      {/* ============================================================ */}
      {/* MODAL: CONFIRMAÇÃO DE FINALIZAR AVENTURA                     */}
      {/* ============================================================ */}
      {isFinishingModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200 font-cinzel">
          <div className="max-w-md w-full bg-stone-950 border border-red-800/80 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.9)] p-5 space-y-4">
            <div className="flex items-center gap-2.5 text-red-400">
              <AlertCircle size={22} className="shrink-0" />
              <h3 className="font-bold text-base uppercase tracking-wider">
                Finalizar Aventura Atual?
              </h3>
            </div>
            
            <p className="text-xs text-stone-300 font-sans leading-relaxed">
              Tem certeza que deseja encerrar esta sessão de aventura? O status da partida será marcado como concluído e os dados serão preservados.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setIsFinishingModalOpen(false)}
                disabled={isUpdatingGameStatus}
                className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-850 border border-stone-700 text-stone-300 text-xs font-bold uppercase cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmFinishGame}
                disabled={isUpdatingGameStatus}
                className="px-4 py-2 rounded-xl bg-red-700 hover:bg-red-600 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-md disabled:opacity-50"
              >
                {isUpdatingGameStatus ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
                <span>Confirmar Encerramento</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL: CARREGAR NOVO MAPA COM SELEÇÃO DE PASTA              */}
      {/* ============================================================ */}
      {isMapModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200 font-cinzel">
          <div className="max-w-xl w-full bg-stone-950 border border-amber-700/60 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col">
            <div className="p-4 border-b border-amber-900/40 flex items-center justify-between bg-stone-900/50">
              <div className="flex items-center gap-2 text-amber-300">
                <MapIcon size={18} />
                <h3 className="font-bold text-sm uppercase tracking-wider">
                  CARREGAR MAPA DE BATALHA
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsMapModalOpen(false)}
                className="text-stone-500 hover:text-stone-300 p-1"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4 overflow-y-auto max-h-[80vh]">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {SAMPLE_MAPS.map((sample) => (
                  <button
                    key={sample.id}
                    type="button"
                    onClick={() => {
                      setQuadrantMap(activeQuadrantIndex, sample.id);
                      setIsMapModalOpen(false);
                    }}
                    className={`p-2.5 rounded-xl border text-left transition-all flex flex-col gap-2 group ${
                      activeMap.id === sample.id
                        ? 'border-amber-500 bg-amber-950/40 shadow-lg'
                        : 'border-stone-800 bg-stone-900/60 hover:border-amber-800/80 hover:bg-stone-900'
                    }`}
                  >
                    <div className="w-full aspect-video rounded-lg overflow-hidden border border-amber-950/40 bg-stone-950 relative">
                      <img 
                        src={sample.imageUrl} 
                        alt={sample.name} 
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                      />
                    </div>
                    <span className="font-bold text-xs text-stone-200 group-hover:text-amber-300 truncate">
                      {sample.name}
                    </span>
                  </button>
                ))}
              </div>

              {/* Upload de Arquivo Local */}
              <div className="pt-3 border-t border-amber-900/30 space-y-3">
                <label className="text-xs font-bold text-stone-400 block uppercase tracking-wider">
                  Nome do Mapa Personalizado:
                </label>
                <input
                  type="text"
                  placeholder="Ex: Masmorra do Dragão Negro"
                  value={newMapName}
                  onChange={(e) => setNewMapName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-stone-900 border border-amber-900/50 text-stone-100 placeholder:text-stone-600 text-xs focus:outline-none focus:border-amber-500"
                />

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                {uploadError && (
                  <p className="text-red-400 text-xs">{uploadError}</p>
                )}

                <button
                  type="button"
                  disabled={isUploading}
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-700 to-amber-600 hover:from-amber-600 hover:to-amber-500 text-stone-950 font-bold text-xs tracking-wider uppercase flex items-center justify-center gap-2 shadow-lg cursor-pointer"
                >
                  {isUploading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Enviando imagem...</span>
                    </>
                  ) : (
                    <>
                      <Upload size={16} />
                      <span>Selecionar Imagem do Computador</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // Renderizador de Quadrante Específico (0, 1, 2, 3)
  function renderQuadrant(quadrantIndex: number) {
    const quad = quadrants[quadrantIndex] || quadrants[0];
    const quadMap = maps.find(m => m.id === quad.mapId);
    const isActive = activeQuadrantIndex === quadrantIndex;

    const handleSelectQuadrant = () => {
      handleSelectActiveQuadrant(quadrantIndex);
    };

    // ============================================================
    // ESTADO VAZIO: O Mestre ainda não escolheu um mapa para este quadrante
    // ============================================================
    if (!quadMap) {
      return (
        <div 
          key={`quadrant-empty-${quadrantIndex}`}
          onClick={handleSelectQuadrant}
          className={`w-full h-full relative rounded-xl flex flex-col items-center justify-center p-4 transition-all overflow-hidden cursor-pointer select-none ${
            isActive 
              ? 'ring-2 ring-amber-500/90 border border-amber-400/90 bg-stone-950 shadow-[0_0_25px_rgba(245,158,11,0.2)]' 
              : 'border border-amber-950/70 bg-stone-950/90 hover:border-amber-800/60'
          }`}
          style={{
            backgroundImage: 'radial-gradient(ellipse at center, rgba(35, 28, 22, 0.75) 0%, rgba(12, 10, 9, 0.98) 100%)'
          }}
        >
          {/* Tag Superior Discreta de Número do Espaço */}
          <div className="absolute top-3 left-3 flex items-center gap-2 pointer-events-none">
            <span className={`px-2 py-0.5 rounded text-[10px] font-cinzel font-bold tracking-wider uppercase border shadow-md ${
              isActive 
                ? 'bg-amber-950 text-amber-300 border-amber-500/80' 
                : 'bg-stone-900/90 text-stone-500 border-stone-800'
            }`}>
              ESPAÇO {quadrantIndex + 1}
            </span>
            {isActive && (
              <span className="text-[10px] font-cinzel font-bold text-amber-400/90 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                ATIVO
              </span>
            )}
          </div>

          {/* Conteúdo Central Fantasia RPG */}
          <div className="text-center space-y-3 font-cinzel max-w-sm px-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-amber-950/40 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto shadow-inner group-hover:border-amber-400/60 transition-colors">
              <Compass size={32} className="stroke-[1.5] text-amber-300 animate-pulse" />
            </div>

            <div className="space-y-1">
              <h4 className="text-base sm:text-lg font-bold text-amber-200 tracking-wider">
                🗺️ ESCOLHA O DESTINO
              </h4>
              <p className="text-stone-400 text-xs italic">
                Nenhum local selecionado
              </p>
            </div>

            <div className="pt-2">
              <button
                type="button"
                id={`add-map-btn-quad-${quadrantIndex}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveQuadrantIndex(quadrantIndex);
                  setIsLibraryOpen(true);
                }}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700 hover:from-amber-600 hover:to-amber-500 text-stone-950 font-cinzel font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(245,158,11,0.3)] hover:shadow-[0_0_20px_rgba(245,158,11,0.5)] border border-amber-300/60 transition-all cursor-pointer mx-auto"
              >
                <Plus size={15} className="stroke-[3]" />
                <span>+ ADICIONAR LOCAL</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    // ============================================================
    // ESTADO PREENCHIDO: O quadrante possui um mapa carregado
    // ============================================================
    const quadGrid: GridSettings = getEffectiveGrid(quadMap);

    const quadFog: FogSettings = quadMap.fogSettings || DEFAULT_FOG_SETTINGS;

    return (
      <div 
        key={`quadrant-box-${quadrantIndex}`}
        onClick={handleSelectQuadrant}
        className={`w-full h-full relative overflow-hidden rounded-lg transition-all ${
          splitCount > 1
            ? isActive 
              ? 'ring-2 ring-amber-500/90 border border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.2)]' 
              : 'border border-amber-950/70 opacity-95 hover:border-amber-700/60'
            : ''
        }`}
      >
        {/* Barra de Controle Superior Discreta do Quadrante (quando tela dividida) */}
        {splitCount > 1 && (
          <div className="absolute top-2 left-2 right-2 z-20 flex items-center justify-between pointer-events-none">
            {/* Lado Esquerdo: Tag do Espaço + Seletor de Local + Badge de Ativo */}
            <div className="flex items-center gap-1.5 pointer-events-auto">
              {/* Tag LOCAL N */}
              <span className={`px-2 py-0.5 rounded text-[10px] font-cinzel font-bold tracking-wider uppercase border shadow-md ${
                isActive 
                  ? 'bg-amber-950 text-amber-300 border-amber-500' 
                  : 'bg-stone-950/90 text-stone-400 border-stone-800'
              }`}>
                LOCAL {quadrantIndex + 1}
              </span>

              {/* Seletor Discreto do Mapa do Quadrante */}
              <div className="relative">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveQuadrantIndex(quadrantIndex);
                    setOpenSelectorQuadrant(prev => prev === quadrantIndex ? null : quadrantIndex);
                  }}
                  className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-stone-950/90 hover:bg-stone-900 border border-amber-900/50 hover:border-amber-600/70 text-[11px] font-cinzel font-bold text-amber-200 transition-all cursor-pointer max-w-[140px] sm:max-w-[190px] shadow-md backdrop-blur-sm"
                >
                  <span className="truncate">{quadMap.name}</span>
                  <ChevronDown size={12} className="text-amber-400 shrink-0" />
                </button>

                {/* Menu Popup de Seleção Rápida */}
                {openSelectorQuadrant === quadrantIndex && (
                  <div 
                    className="absolute left-0 mt-1 w-56 bg-stone-950 border border-amber-700/70 rounded-xl shadow-2xl z-50 overflow-hidden font-cinzel text-xs"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="p-1.5 bg-stone-900 border-b border-amber-900/40 flex items-center justify-between">
                      <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">
                        ESCOLHER MAPA
                      </span>
                      <button
                        type="button"
                        onClick={() => setOpenSelectorQuadrant(null)}
                        className="text-stone-400 hover:text-stone-200 text-[10px] p-0.5"
                      >
                        ✕
                      </button>
                    </div>
                    <div className="max-h-52 overflow-y-auto p-1 space-y-0.5">
                      {maps.map(m => (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => setQuadrantMap(quadrantIndex, m.id)}
                          className={`w-full text-left px-2 py-1.5 rounded-lg flex items-center justify-between transition-colors ${
                            m.id === quadMap.id 
                              ? 'bg-amber-950 text-amber-200 font-bold border border-amber-700/50' 
                              : 'text-stone-300 hover:bg-stone-900 hover:text-amber-300'
                          }`}
                        >
                          <span className="truncate">{m.name}</span>
                          {m.id === quadMap.id && <Check size={12} className="text-amber-400 shrink-0" />}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Badge de Mapa Ativo */}
              {isActive && (
                <span className="hidden sm:flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-500/20 border border-amber-500/60 text-[10px] font-cinzel font-bold text-amber-300 shadow-sm animate-pulse">
                  ✓ MAPA ATIVO
                </span>
              )}
            </div>

            {/* Lado Direito: Botão de Menu Mais Opções [ ⋮ ] */}
            <div className="relative pointer-events-auto">
              <button
                type="button"
                id={`quadrant-options-btn-${quadrantIndex}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveQuadrantIndex(quadrantIndex);
                  setOpenQuadrantMenu(prev => prev === quadrantIndex ? null : quadrantIndex);
                }}
                className="w-7 h-7 rounded-lg bg-stone-950/90 hover:bg-stone-900 border border-amber-900/50 hover:border-amber-600/70 flex items-center justify-center text-amber-400 shadow-md cursor-pointer transition-all"
                title="Opções do Espaço"
              >
                <MoreVertical size={14} />
              </button>

              {/* Dropdown de Mais Opções */}
              {openQuadrantMenu === quadrantIndex && (
                <div 
                  className="absolute right-0 mt-1 w-48 bg-stone-950 border border-amber-700/80 rounded-xl shadow-2xl z-50 overflow-hidden font-cinzel text-xs py-1"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setOpenQuadrantMenu(null);
                      setActiveQuadrantIndex(quadrantIndex);
                      setIsLibraryOpen(true);
                    }}
                    className="w-full text-left px-3 py-2 flex items-center gap-2 text-stone-200 hover:text-amber-200 hover:bg-stone-900 transition-colors"
                  >
                    <BookOpen size={13} className="text-amber-400" />
                    <span>Trocar local</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      updateQuadrantViewport(quadrantIndex, { zoom: 1, pan: { x: 0, y: 0 } });
                      setOpenQuadrantMenu(null);
                    }}
                    className="w-full text-left px-3 py-2 flex items-center gap-2 text-stone-200 hover:text-amber-200 hover:bg-stone-900 transition-colors"
                  >
                    <Crosshair size={13} className="text-amber-400" />
                    <span>Centralizar visão</span>
                  </button>

                  <div className="h-px bg-amber-900/40 my-1" />

                  <button
                    type="button"
                    onClick={() => handleRemoveQuadrantMap(quadrantIndex)}
                    className="w-full text-left px-3 py-2 flex items-center gap-2 text-red-400 hover:text-red-300 hover:bg-red-950/30 transition-colors"
                  >
                    <EyeOff size={13} className="text-red-400" />
                    <span>Remover local</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Canvas do Mapa */}
        <MapCanvas
          imageUrl={quadMap.imageUrl}
          activeTool={isActive ? activeTool : 'select'}
          gridSettings={quadGrid}
          fogSettings={quadFog}
          fogData={quadMap.fogData}
          onFogChange={(newFog) => {
            if (isActive) handleFogChange(newFog);
          }}
          markers={quadMap.markers || []}
          selectedMarkerId={isActive && selectedObject?.type === 'marker' ? selectedObject.id : null}
          onSelectMarker={(id) => {
            handleSelectQuadrant();
            if (isActive) setSelectedObject(id ? { id, type: 'marker' } : null);
          }}
          onUpdateMarkerPosition={(markerId, x, y) => {
            if (isActive) handleUpdateMarkerPosition(markerId, x, y);
          }}
          onAddMarker={(x, y) => {
            if (isActive) handleAddMarker(x, y);
          }}
          drawings={quadMap.drawings || []}
          shapes={quadMap.shapes || []}
          selectedObject={isActive ? selectedObject : null}
          onSelectObject={(obj) => {
            handleSelectQuadrant();
            if (isActive) setSelectedObject(obj);
          }}
          onDeleteObject={(obj) => {
            if (isActive) handleDeleteObject(obj);
          }}
          onAddDrawing={(drawing) => {
            if (isActive) handleAddDrawing(drawing);
          }}
          onAddShape={(shape) => {
            if (isActive) handleAddShape(shape);
          }}
          onUpdateShape={(shapeId, updates) => {
            if (isActive) handleUpdateShape(shapeId, updates);
          }}
          onUpdateDrawing={(drawingId, updates) => {
            if (isActive) handleUpdateDrawing(drawingId, updates);
          }}
          activeShapeType={activeShapeType}
          shapeStrokeColor={shapeStrokeColor}
          shapeStrokeWidth={shapeStrokeWidth}
          drawColor={drawColor}
          drawWidth={drawWidth}
          scaleMeters={scaleMeters}
          zoom={quad.zoom}
          setZoom={(action) => handleUpdateQuadrantZoom(quadrantIndex, action)}
          pan={quad.pan}
          setPan={(action) => handleUpdateQuadrantPan(quadrantIndex, action)}
          onResetView={() => updateQuadrantViewport(quadrantIndex, { zoom: 1, pan: { x: 0, y: 0 } })}
          resetViewTrigger={quad.resetViewTrigger}
        />
      </div>
    );
  }
};

export default MapEditor;
