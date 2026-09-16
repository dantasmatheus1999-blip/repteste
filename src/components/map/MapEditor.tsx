import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { ToolType, GridSettings, FogSettings, MapMarker, TestMap, TvSyncState } from './types';
import { MapToolbar } from './MapToolbar';
import { MapCanvas } from './MapCanvas';
import { PlayersPanel } from './PlayersPanel';
import { DEFAULT_FOG_SETTINGS } from './fogUtils';
import { 
  fetchTestMaps, 
  saveTestMap, 
  deleteTestMap, 
  uploadMapImage, 
  broadcastToTv, 
  subscribeTvSync,
  SAMPLE_MAPS 
} from './mapService';

export const MapEditor: React.FC = () => {
  // Estado dos Mapas
  const [maps, setMaps] = useState<TestMap[]>(SAMPLE_MAPS);
  const [activeMapId, setActiveMapId] = useState<string>(SAMPLE_MAPS[0].id);
  const [isLoadingMaps, setIsLoadingMaps] = useState(true);

  // Estado da Ferramenta e Modos
  const [activeTool, setActiveTool] = useState<ToolType>('select');
  const [selectedMarkerId, setSelectedMarkerId] = useState<string | null>(null);

  // Viewport (Zoom e Pan)
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [resetViewTrigger, setResetViewTrigger] = useState<number>(0);

  // Estado de Sincronização com TV
  const [syncStatus, setSyncStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [isTvConnected, setIsTvConnected] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Modais e Menus
  const [isMapModalOpen, setIsMapModalOpen] = useState<boolean>(false);
  const [isMapDropdownOpen, setIsMapDropdownOpen] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);

  // Formulário de Novo Mapa
  const [newMapName, setNewMapName] = useState('');
  const [newMapUrl, setNewMapUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editorRootRef = useRef<HTMLDivElement>(null);
  // Referência única e persistente para a janela da TV
  const tvWindowRef = useRef<Window | null>(null);

  // Mapa ativo atual
  const activeMap = maps.find(m => m.id === activeMapId) || maps[0] || SAMPLE_MAPS[0];

  // Grade atual
  const gridSettings: GridSettings = activeMap.grid || {
    enabled: true,
    size: 50,
    color: 'rgba(217, 119, 6, 0.4)',
    opacity: 0.4
  };

  // Configuração da Névoa de Guerra
  const fogSettings: FogSettings = activeMap.fogSettings || DEFAULT_FOG_SETTINGS;

  // Carregar mapas iniciais do Firestore
  useEffect(() => {
    let isMounted = true;
    fetchTestMaps().then(loadedMaps => {
      if (isMounted && loadedMaps.length > 0) {
        setMaps(loadedMaps);
        setActiveMapId(loadedMaps[0].id);
        setIsLoadingMaps(false);
      }
    }).catch(err => {
      console.warn('Erro ao carregar mapas:', err);
      if (isMounted) setIsLoadingMaps(false);
    });

    return () => { isMounted = false; };
  }, []);

  // Monitorar se a TV está conectada (janela aberta pelo Mestre)
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

  // Atalhos de teclado (Photoshop style)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignorar se o usuário estiver digitando em inputs
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;

      switch (e.key.toLowerCase()) {
        case 'v': setActiveTool('select'); break;
        case 'h': setActiveTool('pan'); break;
        case 'g': 
          handleUpdateGrid({ enabled: !gridSettings.enabled }); 
          break;
        case 'f': setActiveTool('fog-paint'); break;
        case 'r': setActiveTool('fog-reveal'); break;
        case 'm': setActiveTool('marker'); break;
        case 'delete':
        case 'backspace':
          handleDeleteSelectedMarker();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedMarkerId, activeMap, gridSettings]);

  const saveDebounceRef = useRef<NodeJS.Timeout | null>(null);
  const pendingMapRef = useRef<TestMap | null>(null);
  const pendingReasonRef = useRef<string>('map update');

  // Limpar timer de salvamento ao desmontar e salvar pendências
  useEffect(() => {
    return () => {
      if (saveDebounceRef.current) {
        clearTimeout(saveDebounceRef.current);
      }
      if (pendingMapRef.current) {
        saveTestMap(pendingMapRef.current, pendingReasonRef.current).catch(() => {});
      }
    };
  }, []);

  // Atualizar propriedades do mapa ativo com debounce inteligente (salva no Firestore apenas após estabilização)
  const updateActiveMap = useCallback((updater: Partial<TestMap>, reason: string = 'map update') => {
    setMaps(prevMaps => prevMaps.map(m => {
      if (m.id === activeMap.id) {
        const updated = { ...m, ...updater, updatedAt: new Date().toISOString() };
        pendingMapRef.current = updated;
        pendingReasonRef.current = reason;

        // Limpa timer anterior para acumular alterações (ex: sliders, arrastos, pincéis)
        if (saveDebounceRef.current) {
          clearTimeout(saveDebounceRef.current);
        }

        // Debounce de 1.2 segundos após o usuário parar a interação antes de persistir no Firestore
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

  // Atualizar Grade
  const handleUpdateGrid = (newSettings: Partial<GridSettings>) => {
    const updatedGrid = { ...gridSettings, ...newSettings };
    updateActiveMap({ grid: updatedGrid }, 'grid update');
  };

  // Atualizar Névoa de Guerra
  const handleFogChange = (newFogData: string) => {
    updateActiveMap({ fogData: newFogData }, 'fog update');
  };

  const handleUpdateFogSettings = (newFogSettings: Partial<FogSettings>) => {
    const updated = { ...fogSettings, ...newFogSettings };
    updateActiveMap({ fogSettings: updated }, 'fog settings update');
  };

  // Limpar ou cobrir toda a névoa
  const handleClearFog = () => {
    if ((window as any).__vtt_clear_all_fog) {
      (window as any).__vtt_clear_all_fog();
    }
  };

  const handleCoverAllFog = () => {
    if ((window as any).__vtt_cover_all_fog) {
      (window as any).__vtt_cover_all_fog();
    }
  };

  // Adicionar Marcador
  const handleAddMarker = (x: number, y: number) => {
    const newMarker: MapMarker = {
      id: `marker-${Date.now()}`,
      x,
      y,
      label: `Marcador ${(activeMap.markers?.length || 0) + 1}`,
      color: '#f59e0b',
      icon: 'pin'
    };
    const updatedMarkers = [...(activeMap.markers || []), newMarker];
    updateActiveMap({ markers: updatedMarkers }, 'marker add');
    setSelectedMarkerId(newMarker.id);
    setActiveTool('select');
  };

  // Mover Marcador (chamado no pointerup quando o arraste termina)
  const handleUpdateMarkerPosition = (markerId: string, x: number, y: number) => {
    const updatedMarkers = (activeMap.markers || []).map(m => 
      m.id === markerId ? { ...m, x, y } : m
    );
    updateActiveMap({ markers: updatedMarkers }, 'marker move');
  };

  // Excluir Marcador Selecionado
  const handleDeleteSelectedMarker = () => {
    if (!selectedMarkerId) return;
    const updatedMarkers = (activeMap.markers || []).filter(m => m.id !== selectedMarkerId);
    updateActiveMap({ markers: updatedMarkers }, 'marker delete');
    setSelectedMarkerId(null);
  };

  // Ação para ABRIR TV:
  // 1. Mantém uma única referência na memória (tvWindowRef)
  // 2. Se a janela já estiver aberta, apenas a reutiliza e foca nela
  // 3. Se estiver fechada ou inexistente, cria uma nova janela com identificador nomeado
  const handleOpenTv = () => {
    const tvUrl = `${window.location.origin}/tv?sync=test-map`;
    try {
      if (tvWindowRef.current && !tvWindowRef.current.closed) {
        tvWindowRef.current.focus();
        setIsTvConnected(true);
        return;
      }
      // Reutiliza o mesmo nome de janela 'realmor_tv_window' para evitar abertura descontrolada de múltiplas abas
      const newWin = window.open(tvUrl, 'realmor_tv_window');
      tvWindowRef.current = newWin;
      if (newWin) {
        setIsTvConnected(true);
      }
    } catch (err) {
      console.warn('Não foi possível abrir a janela da TV:', err);
    }
  };

  // Ação Principal: ATUALIZAR NA TV
  // - NUNCA abre uma nova janela
  // - NUNCA usa window.open()
  // - NUNCA redireciona o Mestre
  // - NUNCA recarrega o aplicativo
  // - NUNCA altera a autenticação ou faz logout
  // - APENAS publica o estado atual do mapa no Firestore (test_tv_sync/current)
  const handleBroadcastToTv = async () => {
    setSyncStatus('sending');
    try {
      const syncPayload: TvSyncState = {
        mapId: activeMap.id,
        mapName: activeMap.name,
        imageUrl: activeMap.imageUrl,
        grid: gridSettings,
        fogData: activeMap.fogData || '',
        fogSettings: fogSettings,
        markers: activeMap.markers || [],
        viewport: {
          zoom,
          panX: pan.x,
          panY: pan.y
        },
        updatedAt: new Date().toISOString()
      };

      // 1. Publicar o estado atual do mapa no Firestore
      await broadcastToTv(syncPayload);
      setSyncStatus('success');

      // Se a janela da TV estiver aberta, atualiza indicador
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

  // Redefinir Enquadramento e Zoom 16:9
  const handleResetView = () => {
    setResetViewTrigger(c => c + 1);
  };

  // Alternar Tela Cheia
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
      const newMap: TestMap = {
        id: `map-${Date.now()}`,
        name: newMapName.trim() || name,
        imageUrl: url,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        grid: { enabled: true, size: 50, color: 'rgba(217, 119, 6, 0.4)', opacity: 0.4 },
        markers: []
      };

      await saveTestMap(newMap, 'new map upload');
      setMaps(prev => [newMap, ...prev]);
      setActiveMapId(newMap.id);
      setIsMapModalOpen(false);
      setNewMapName('');
      setNewMapUrl('');
    } catch (err: any) {
      console.error('Erro no upload de mapa:', err);
      setUploadError(err.message || 'Falha ao processar arquivo.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Salvar novo mapa a partir de URL ou de exemplo
  const handleSelectSample = (sample: TestMap) => {
    setActiveMapId(sample.id);
    setIsMapModalOpen(false);
  };

  return (
    <div 
      ref={editorRootRef}
      id="realmor-map-editor"
      className="w-full h-full flex flex-col bg-stone-950 text-stone-100 overflow-hidden select-none font-sans relative"
    >
      {/* ============================================================ */}
      {/* 1. BARRA SUPERIOR COMPACTA                                    */}
      {/* ============================================================ */}
      <header 
        id="map-top-bar"
        className="h-12 bg-stone-950 border-b border-amber-900/40 px-3 sm:px-4 flex items-center justify-between shrink-0 z-30 shadow-md"
        style={{
          backgroundImage: 'linear-gradient(to right, rgba(20, 18, 16, 0.95), rgba(12, 10, 9, 0.95))'
        }}
      >
        {/* Lado Esquerdo: Identificação e Seletor de Mapa */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-1.5 text-amber-400 font-cinzel font-black tracking-wider text-xs sm:text-sm">
            <MapIcon size={17} className="text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
            <span className="hidden xs:inline">MAPA:</span>
          </div>

          {/* Dropdown Seletor de Mapas */}
          <div className="relative">
            <button
              type="button"
              id="map-selector-dropdown-btn"
              onClick={() => setIsMapDropdownOpen(prev => !prev)}
              className="flex items-center gap-2 px-2.5 py-1 rounded bg-stone-900 border border-amber-900/50 hover:border-amber-600/70 text-xs font-cinzel font-bold text-amber-200 transition-all cursor-pointer max-w-[200px] sm:max-w-[280px]"
            >
              <span className="truncate">{activeMap.name}</span>
              <ChevronDown size={13} className="text-amber-400/80 shrink-0" />
            </button>

            {/* Menu Dropdown de Seleção de Mapas */}
            {isMapDropdownOpen && (
              <div className="absolute top-full left-0 mt-1.5 w-64 bg-stone-950 border border-amber-800/60 rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.9)] py-2 z-50 font-cinzel text-xs">
                <div className="px-3 py-1 text-[10px] text-stone-400 uppercase tracking-widest border-b border-stone-800 flex justify-between items-center">
                  <span>Mapas Disponíveis</span>
                  <span className="text-amber-500 font-mono">{maps.length}</span>
                </div>
                <div className="max-h-56 overflow-y-auto py-1">
                  {maps.map(m => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => {
                        setActiveMapId(m.id);
                        setIsMapDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-amber-950/40 transition-colors ${
                        m.id === activeMap.id ? 'bg-amber-900/30 text-amber-300 font-bold border-l-2 border-amber-400' : 'text-stone-300'
                      }`}
                    >
                      <span className="truncate">{m.name}</span>
                      {m.id === activeMap.id && <Check size={13} className="text-amber-400" />}
                    </button>
                  ))}
                </div>
                <div className="p-2 border-t border-stone-800">
                  <button
                    type="button"
                    onClick={() => {
                      setIsMapDropdownOpen(false);
                      setIsMapModalOpen(true);
                    }}
                    className="w-full py-1.5 px-3 rounded bg-amber-950/40 hover:bg-amber-900/60 border border-amber-800/40 text-amber-300 text-[11px] font-bold tracking-wider uppercase flex items-center justify-center gap-1.5 transition-all"
                  >
                    <Plus size={13} />
                    <span>+ Adicionar Mapa</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Botão + ADICIONAR MAPA */}
          <button
            type="button"
            id="map-add-btn"
            onClick={() => setIsMapModalOpen(true)}
            className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded bg-stone-900 hover:bg-stone-800 border border-amber-800/40 hover:border-amber-500/60 text-[11px] font-cinzel font-bold text-amber-300 transition-all cursor-pointer"
          >
            <Plus size={13} />
            <span>Adicionar</span>
          </button>
        </div>

        {/* Lado Direito: Status TV, Atualizar na TV e Tela Cheia */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Indicador Discreto de TV Conectada */}
          <div 
            className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-stone-900/70 border border-stone-800 text-[10px] font-cinzel tracking-wider"
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
              {isTvConnected ? 'TV CONECTADA' : 'TV OFFLINE'}
            </span>
          </div>

          {/* Botão para Abrir Tela da TV em Nova Aba (Reutiliza a mesma janela) */}
          <button
            type="button"
            id="map-open-tv-tab-btn"
            onClick={handleOpenTv}
            className="flex items-center gap-1.5 text-[11px] font-cinzel text-amber-400/90 hover:text-amber-200 px-2.5 py-1 rounded bg-stone-900/80 hover:bg-stone-850 border border-amber-900/50 hover:border-amber-700/60 transition-all cursor-pointer shadow-sm"
            title="Abrir Tela da TV em nova aba independente"
          >
            <ExternalLink size={13} />
            <span>ABRIR TV</span>
          </button>

          {/* BOTÃO CRÍTICO: [ 📺 ATUALIZAR NA TV ] */}
          <button
            type="button"
            id="map-sync-tv-btn"
            disabled={syncStatus === 'sending'}
            onClick={handleBroadcastToTv}
            className={`flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-lg text-xs font-cinzel font-black tracking-wider uppercase transition-all shadow-md cursor-pointer ${
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
                <span>⏳ TRANSMITINDO...</span>
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
                <span>📺 ATUALIZAR NA TV</span>
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
      {/* 2. ÁREA CENTRAL: BARRA ESQUERDA + MAPA + PAINEL DIREITO     */}
      {/* ============================================================ */}
      <div 
        id="map-editor-body"
        className="flex-1 flex flex-row overflow-hidden relative"
      >
        {/* PAINEL ESQUERDO: BARRA DE FERRAMENTAS ACOPLADA (EXPANSÍVEL) */}
        <MapToolbar
          activeTool={activeTool}
          onSelectTool={setActiveTool}
          gridSettings={gridSettings}
          onUpdateGrid={handleUpdateGrid}
          fogSettings={fogSettings}
          onUpdateFogSettings={handleUpdateFogSettings}
          hasSelectedMarker={!!selectedMarkerId}
          onDeleteSelectedMarker={handleDeleteSelectedMarker}
          onOpenImageModal={() => setIsMapModalOpen(true)}
          onResetView={handleResetView}
          onClearFog={handleClearFog}
          onCoverAllFog={handleCoverAllFog}
          zoomLevel={zoom}
        />

        {/* ÁREA CENTRAL: MAPA NATIVO 16:9 */}
        <main 
          id="map-center-viewport"
          className="flex-1 h-full overflow-hidden relative"
        >
          <MapCanvas
            imageUrl={activeMap.imageUrl}
            activeTool={activeTool}
            gridSettings={gridSettings}
            fogSettings={fogSettings}
            fogData={activeMap.fogData}
            onFogChange={handleFogChange}
            markers={activeMap.markers || []}
            selectedMarkerId={selectedMarkerId}
            onSelectMarker={setSelectedMarkerId}
            onUpdateMarkerPosition={handleUpdateMarkerPosition}
            onAddMarker={handleAddMarker}
            zoom={zoom}
            setZoom={setZoom}
            pan={pan}
            setPan={setPan}
            onResetView={handleResetView}
            resetViewTrigger={resetViewTrigger}
          />
        </main>

        {/* PAINEL DIREITO: JOGADORES FIXO */}
        <PlayersPanel />
      </div>

      {/* ============================================================ */}
      {/* MODAL: ADICIONAR / TROCAR IMAGEM DE MAPA                    */}
      {/* ============================================================ */}
      {isMapModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="max-w-xl w-full bg-stone-950 border border-amber-700/60 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col font-cinzel">
            {/* Cabeçalho do Modal */}
            <div className="p-4 border-b border-amber-900/40 flex items-center justify-between bg-stone-900/50">
              <div className="flex items-center gap-2 text-amber-300">
                <MapIcon size={18} />
                <h3 className="font-bold text-sm uppercase tracking-wider">
                  GERENCIAR MAPAS DE BATALHA
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

            {/* Conteúdo do Modal */}
            <div className="p-5 space-y-5 overflow-y-auto max-h-[80vh]">
              {/* 1. Upload do Computador */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-amber-200 uppercase tracking-wider">
                  Carregar Imagem do Computador
                </label>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-amber-900/60 hover:border-amber-500/70 bg-stone-900/40 hover:bg-stone-900/80 rounded-xl p-6 text-center cursor-pointer transition-all space-y-2 group"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  {isUploading ? (
                    <div className="flex flex-col items-center gap-2 text-amber-300">
                      <Loader2 size={28} className="animate-spin" />
                      <p className="text-xs font-bold">Enviando imagem do mapa...</p>
                    </div>
                  ) : (
                    <>
                      <div className="w-12 h-12 rounded-full bg-stone-950 border border-amber-900/50 flex items-center justify-center text-amber-400 mx-auto group-hover:scale-110 transition-transform">
                        <Upload size={20} />
                      </div>
                      <p className="text-xs font-bold text-stone-200">
                        Clique para selecionar ou arraste o arquivo aqui
                      </p>
                      <p className="text-[10px] text-stone-400">
                        Formatos suportados: PNG, JPG, WEBP • Proporção original preservada
                      </p>
                    </>
                  )}
                </div>
                {uploadError && (
                  <p className="text-xs text-red-400 font-sans">{uploadError}</p>
                )}
              </div>

              {/* 2. Mapas de Amostra Pré-definidos */}
              <div className="space-y-2 pt-2 border-t border-amber-900/30">
                <label className="text-xs font-bold text-amber-200 uppercase tracking-wider">
                  Ou Escolha um Mapa de Amostra
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {SAMPLE_MAPS.map(sample => (
                    <div
                      key={sample.id}
                      onClick={() => handleSelectSample(sample)}
                      className="group cursor-pointer rounded-lg overflow-hidden border border-amber-900/40 hover:border-amber-500 transition-all bg-stone-900 relative aspect-video"
                    >
                      <img
                        src={sample.imageUrl}
                        alt={sample.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/40 to-transparent flex items-end p-2">
                        <span className="text-[11px] font-bold text-amber-100 truncate">
                          {sample.name}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Rodapé do Modal */}
            <div className="p-3 border-t border-amber-900/40 flex justify-end bg-stone-900/40">
              <button
                type="button"
                onClick={() => setIsMapModalOpen(false)}
                className="px-4 py-1.5 rounded bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-bold uppercase tracking-wider"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapEditor;
