import React, { useState, useMemo } from 'react';
import { 
  FolderPlus, 
  Search, 
  X, 
  MoreVertical, 
  Edit3, 
  FolderInput, 
  Trash2, 
  Check, 
  ChevronRight, 
  ChevronDown, 
  Map as MapIcon, 
  Plus, 
  Layers, 
  SortAsc, 
  Clock, 
  ArrowUpDown,
  AlertTriangle,
  Folder
} from 'lucide-react';
import { TestMap, MapFolder, SplitLayoutCount } from './types';

interface MapLibraryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  maps: TestMap[];
  folders: MapFolder[];
  activeMapId: string;
  onSelectMap: (mapId: string) => void;
  onCreateFolder: (folder: Omit<MapFolder, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onUpdateFolder: (folderId: string, updates: Partial<MapFolder>) => Promise<void>;
  onDeleteFolder: (folderId: string) => Promise<void>;
  onRenameMap: (mapId: string, newName: string) => Promise<void>;
  onMoveMap: (mapId: string, targetFolderId: string | undefined) => Promise<void>;
  onDeleteMap: (mapId: string) => Promise<void>;
  onOpenUploadModal: (defaultFolderId?: string) => void;
  splitCount?: SplitLayoutCount;
  onSelectSplitCount?: (count: SplitLayoutCount) => void;
}

const AVAILABLE_FOLDER_ICONS = [
  '👑', '⚔️', '🐉', '🏰', '🌲', '⛏️', '🕳️', '🧭', 
  '💀', '🛡️', '🏕️', '🗺️', '🧙‍♂️', '📜', '🏔️', '🏛️', 
  '🌊', '🚪', '🕯️', '⛺', '🩸', '🔥', '💎', '📁'
];

type SortMode = 'name' | 'newest' | 'oldest';

export const MapLibraryDrawer: React.FC<MapLibraryDrawerProps> = ({
  isOpen,
  onClose,
  maps,
  folders,
  activeMapId,
  onSelectMap,
  onCreateFolder,
  onUpdateFolder,
  onDeleteFolder,
  onRenameMap,
  onMoveMap,
  onDeleteMap,
  onOpenUploadModal,
  splitCount = 1,
  onSelectSplitCount
}) => {
  // Estado de Busca e Filtros
  const [searchQuery, setSearchQuery] = useState('');
  const [sortMode, setSortMode] = useState<SortMode>('newest');

  // Pastas recolhidas / expandidas (por padrão todas abertas)
  const [collapsedFolders, setCollapsedFolders] = useState<Record<string, boolean>>({});

  // Modais de Ação
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [folderFormName, setFolderFormName] = useState('');
  const [folderFormDesc, setFolderFormDesc] = useState('');
  const [folderFormIcon, setFolderFormIcon] = useState('👑');

  // Modal Mover Mapa
  const [movingMapId, setMovingMapId] = useState<string | null>(null);
  const [selectedTargetFolderId, setSelectedTargetFolderId] = useState<string>('');

  // Modal Renomear Mapa
  const [renamingMapId, setRenamingMapId] = useState<string | null>(null);
  const [renameInputValue, setRenameInputValue] = useState('');

  // Modal Confirmar Exclusão de Mapa
  const [deletingMapId, setDeletingMapId] = useState<string | null>(null);

  // Modal Confirmar Exclusão de Pasta
  const [deletingFolderId, setDeletingFolderId] = useState<string | null>(null);

  // Menu Dropdown ativo por mapa
  const [activeMenuMapId, setActiveMenuMapId] = useState<string | null>(null);

  // Alternar colapso de pasta
  const toggleFolderCollapse = (folderId: string) => {
    setCollapsedFolders(prev => ({
      ...prev,
      [folderId]: !prev[folderId]
    }));
  };

  // Abrir Modal de Criação de Pasta
  const handleOpenCreateFolder = () => {
    setEditingFolderId(null);
    setFolderFormName('');
    setFolderFormDesc('');
    setFolderFormIcon('👑');
    setIsFolderModalOpen(true);
  };

  // Abrir Modal de Edição de Pasta
  const handleOpenEditFolder = (folder: MapFolder) => {
    setEditingFolderId(folder.id);
    setFolderFormName(folder.name);
    setFolderFormDesc(folder.description || '');
    setFolderFormIcon(folder.icon || '📁');
    setIsFolderModalOpen(true);
  };

  // Salvar Pasta
  const handleSaveFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!folderFormName.trim()) return;

    if (editingFolderId) {
      await onUpdateFolder(editingFolderId, {
        name: folderFormName.trim(),
        description: folderFormDesc.trim(),
        icon: folderFormIcon
      });
    } else {
      await onCreateFolder({
        name: folderFormName.trim(),
        description: folderFormDesc.trim(),
        icon: folderFormIcon
      });
    }

    setIsFolderModalOpen(false);
  };

  // Abrir Modal de Mover Mapa
  const handleOpenMoveMap = (map: TestMap) => {
    setMovingMapId(map.id);
    setSelectedTargetFolderId(map.folderId || folders[0]?.id || '');
    setActiveMenuMapId(null);
  };

  // Executar Mover Mapa
  const handleConfirmMoveMap = async () => {
    if (!movingMapId || !selectedTargetFolderId) return;
    await onMoveMap(movingMapId, selectedTargetFolderId);
    setMovingMapId(null);
  };

  // Abrir Modal de Renomear
  const handleOpenRenameMap = (map: TestMap) => {
    setRenamingMapId(map.id);
    setRenameInputValue(map.name);
    setActiveMenuMapId(null);
  };

  // Executar Renomear Mapa
  const handleConfirmRenameMap = async () => {
    if (!renamingMapId || !renameInputValue.trim()) return;
    await onRenameMap(renamingMapId, renameInputValue.trim());
    setRenamingMapId(null);
  };

  // Executar Exclusão de Mapa
  const handleConfirmDeleteMap = async () => {
    if (!deletingMapId) return;
    await onDeleteMap(deletingMapId);
    setDeletingMapId(null);
  };

  // Executar Exclusão de Pasta
  const handleConfirmDeleteFolder = async () => {
    if (!deletingFolderId) return;
    await onDeleteFolder(deletingFolderId);
    setDeletingFolderId(null);
  };

  // Filtragem e Ordenação de Mapas
  const sortedAndFilteredMaps = useMemo(() => {
    let list = [...maps];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(m => m.name.toLowerCase().includes(q));
    }

    switch (sortMode) {
      case 'name':
        list.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
        break;
      case 'newest':
        list.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
        break;
      case 'oldest':
        list.sort((a, b) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime());
        break;
    }

    return list;
  }, [maps, searchQuery, sortMode]);

  // Agrupamento por Pastas
  const groupedMaps = useMemo(() => {
    const mapByFolder: Record<string, TestMap[]> = {};

    // Inicializar grupos apenas das pastas do usuário
    folders.forEach(f => {
      mapByFolder[f.id] = [];
    });

    sortedAndFilteredMaps.forEach(map => {
      if (map.folderId && mapByFolder[map.folderId]) {
        mapByFolder[map.folderId].push(map);
      }
    });

    return { mapByFolder };
  }, [folders, sortedAndFilteredMaps]);

  if (!isOpen) return null;

  const mapBeingDeleted = maps.find(m => m.id === deletingMapId);
  const folderBeingDeleted = folders.find(f => f.id === deletingFolderId);

  // Renderizador do Card de Mapa Individual
  const renderMapCard = (map: TestMap) => {
    const isActive = map.id === activeMapId;
    const isMenuOpen = activeMenuMapId === map.id;

    return (
      <div
        key={map.id}
        id={`map-card-${map.id}`}
        className={`group relative rounded-lg overflow-hidden border transition-all flex flex-col bg-stone-900 ${
          isActive 
            ? 'border-amber-400/90 shadow-[0_0_12px_rgba(245,158,11,0.35)] ring-1 ring-amber-400/80' 
            : 'border-amber-900/30 hover:border-amber-600/70 hover:shadow-md'
        }`}
      >
        {/* Imagem 16:9 em Proporção Nativa */}
        <div 
          className="relative aspect-video w-full overflow-hidden cursor-pointer bg-stone-950"
          onClick={() => {
            onSelectMap(map.id);
            setActiveMenuMapId(null);
          }}
        >
          <img
            src={map.imageUrl}
            alt={map.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            referrerPolicy="no-referrer"
          />

          {/* Gradiente Inferior para Contraste */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent pointer-events-none" />

          {/* Badge: MAPA ATUAL */}
          {isActive && (
            <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-amber-500 text-stone-950 text-[9px] font-cinzel font-black tracking-wider flex items-center gap-1 shadow-md">
              <Check size={10} className="stroke-[3]" />
              <span>ATUAL</span>
            </div>
          )}

          {/* Botão Menu ⋮ no Canto Superior Direito */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setActiveMenuMapId(isMenuOpen ? null : map.id);
            }}
            className="absolute top-1.5 right-1.5 w-6 h-6 rounded bg-stone-950/80 hover:bg-stone-900 border border-stone-700/60 text-stone-300 hover:text-amber-300 flex items-center justify-center transition-all opacity-90 group-hover:opacity-100 z-10"
            title="Opções do mapa"
          >
            <MoreVertical size={13} />
          </button>

          {/* Menu Dropdown de Ações do Mapa */}
          {isMenuOpen && (
            <div 
              className="absolute top-8 right-1 w-36 bg-stone-950 border border-amber-800/80 rounded-lg shadow-[0_8px_25px_rgba(0,0,0,0.95)] py-1 z-30 font-cinzel text-[11px]"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => {
                  onSelectMap(map.id);
                  setActiveMenuMapId(null);
                }}
                className="w-full text-left px-2.5 py-1.5 hover:bg-amber-950/50 text-amber-200 flex items-center gap-1.5 transition-colors font-bold"
              >
                <MapIcon size={12} className="text-amber-400" />
                <span>Abrir no Editor</span>
              </button>
              <button
                type="button"
                onClick={() => handleOpenRenameMap(map)}
                className="w-full text-left px-2.5 py-1.5 hover:bg-stone-850 text-stone-200 flex items-center gap-1.5 transition-colors"
              >
                <Edit3 size={12} className="text-amber-400" />
                <span>Renomear</span>
              </button>
              <button
                type="button"
                onClick={() => handleOpenMoveMap(map)}
                className="w-full text-left px-2.5 py-1.5 hover:bg-stone-850 text-stone-200 flex items-center gap-1.5 transition-colors"
              >
                <FolderInput size={12} className="text-cyan-400" />
                <span>Mover para...</span>
              </button>
              <div className="my-1 border-t border-stone-800" />
              <button
                type="button"
                onClick={() => {
                  setDeletingMapId(map.id);
                  setActiveMenuMapId(null);
                }}
                className="w-full text-left px-2.5 py-1.5 hover:bg-red-950/60 text-red-400 flex items-center gap-1.5 transition-colors"
              >
                <Trash2 size={12} />
                <span>Excluir</span>
              </button>
            </div>
          )}
        </div>

        {/* Nome do Mapa e Ação Rápida */}
        <div 
          className="p-1.5 flex items-center justify-between cursor-pointer"
          onClick={() => onSelectMap(map.id)}
        >
          <span className={`text-[11px] font-cinzel truncate font-bold ${
            isActive ? 'text-amber-300' : 'text-stone-200 hover:text-amber-200'
          }`}>
            {map.name}
          </span>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Painel Lateral Acoplado (Ancorado no lado esquerdo do editor) */}
      <aside 
        id="map-library-drawer"
        className="w-80 sm:w-96 h-full bg-stone-950 border-r border-amber-900/40 flex flex-col z-35 shrink-0 shadow-[10px_0_30px_rgba(0,0,0,0.85)] animate-in slide-in-from-left duration-200 select-none overflow-hidden"
      >
        {/* ============================================================ */}
        {/* CABEÇALHO DA BIBLIOTECA                                       */}
        {/* ============================================================ */}
        <div className="p-3.5 bg-stone-900/70 border-b border-amber-900/40 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-amber-400 font-cinzel font-bold">
            <span className="text-base">📚</span>
            <div>
              <h2 className="text-xs uppercase tracking-wider font-black text-amber-200">
                BIBLIOTECA DE MAPAS
              </h2>
              <p className="text-[10px] text-stone-400 font-sans">
                {folders.length} pasta{folders.length === 1 ? '' : 's'}
              </p>
            </div>
          </div>

          <button
            type="button"
            id="close-library-btn"
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-amber-200 hover:bg-stone-800 transition-colors"
            title="Fechar biblioteca"
          >
            <X size={16} />
          </button>
        </div>

        {/* ============================================================ */}
        {/* SELETOR DE LAYOUT / DIVISÃO DE TELA [ 1 ] [ 2 ] [ 3 ] [ 4 ]   */}
        {/* ============================================================ */}
        {onSelectSplitCount && (
          <div 
            id="library-layout-selector"
            className="px-3.5 py-2 bg-stone-950/95 border-b border-amber-900/40 flex items-center justify-between gap-2 shrink-0"
          >
            <span className="text-[10px] font-cinzel font-bold text-amber-300 tracking-widest uppercase">
              LAYOUT
            </span>
            <div className="flex items-center gap-1.5">
              {([1, 2, 3, 4] as SplitLayoutCount[]).map(num => (
                <button
                  key={num}
                  type="button"
                  id={`library-split-btn-${num}`}
                  title={num === 1 ? '1 espaço' : `${num} espaços`}
                  onClick={() => onSelectSplitCount(num)}
                  className={`px-2 py-0.5 rounded text-xs font-mono font-bold border transition-all cursor-pointer ${
                    splitCount === num
                      ? 'bg-amber-950 border-amber-500 text-amber-300 shadow-[0_0_8px_rgba(245,158,11,0.35)] ring-1 ring-amber-500/50'
                      : 'bg-stone-900/90 border-stone-800 text-stone-400 hover:text-stone-200 hover:border-amber-900/50'
                  }`}
                >
                  [{num}]
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* CONTROLES: BUSCA, NOVA PASTA E ORDENAÇÃO                    */}
        {/* ============================================================ */}
        <div className="p-3 space-y-2.5 bg-stone-950/90 border-b border-stone-800/80 shrink-0">
          {/* Campo de Busca */}
          <div className="relative">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              id="library-search-input"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Buscar mapas por nome..."
              className="w-full pl-8 pr-7 py-1.5 bg-stone-900 border border-amber-900/30 focus:border-amber-500 rounded-lg text-xs text-stone-100 placeholder-stone-400 outline-none font-sans transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-200 p-0.5"
              >
                <X size={12} />
              </button>
            )}
          </div>

          {/* Linha de Ações: + NOVA PASTA & ORDENAR */}
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              id="create-folder-btn"
              onClick={handleOpenCreateFolder}
              className="flex-1 py-1.5 px-2.5 rounded-lg bg-amber-950/50 hover:bg-amber-900/60 border border-amber-800/50 hover:border-amber-600/70 text-amber-300 text-[11px] font-cinzel font-bold tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer"
            >
              <FolderPlus size={13} className="text-amber-400" />
              <span>+ NOVA PASTA</span>
            </button>

            {/* Seletor de Ordenação Compacto */}
            <div className="flex items-center gap-1 bg-stone-900 p-0.5 rounded-lg border border-stone-800">
              <button
                type="button"
                onClick={() => setSortMode('name')}
                className={`p-1.5 rounded text-[10px] font-cinzel font-bold transition-all ${
                  sortMode === 'name' 
                    ? 'bg-amber-900/60 text-amber-300 shadow-sm' 
                    : 'text-stone-400 hover:text-stone-200'
                }`}
                title="Ordenar por Nome (A-Z)"
              >
                <SortAsc size={13} />
              </button>
              <button
                type="button"
                onClick={() => setSortMode('newest')}
                className={`p-1.5 rounded text-[10px] font-cinzel font-bold transition-all ${
                  sortMode === 'newest' 
                    ? 'bg-amber-900/60 text-amber-300 shadow-sm' 
                    : 'text-stone-400 hover:text-stone-200'
                }`}
                title="Mais Recentes"
              >
                <Clock size={13} />
              </button>
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* LISTAGEM PRINCIPAL: PASTAS E MAPAS                          */}
        {/* ============================================================ */}
        <div 
          id="library-folder-scroll-container"
          className="flex-1 overflow-y-auto p-3 space-y-4 font-sans text-xs scrollbar-thin scrollbar-thumb-amber-900/40"
        >
          {/* Se estiver buscando e não houver mapas correspondentes */}
          {searchQuery && sortedAndFilteredMaps.length === 0 && (
            <div className="text-center py-10 text-stone-400 space-y-2 font-cinzel">
              <p className="text-sm font-bold text-amber-400/80">Nenhum mapa encontrado</p>
              <p className="text-xs font-sans text-stone-400">
                Não há mapas com o nome "{searchQuery}"
              </p>
            </div>
          )}

          {/* 1. PASTAS CRIADAS */}
          {folders.map(folder => {
            const folderMaps = groupedMaps.mapByFolder[folder.id] || [];
            const isCollapsed = collapsedFolders[folder.id];

            return (
              <div 
                key={folder.id} 
                id={`folder-group-${folder.id}`}
                className="bg-stone-900/40 border border-amber-900/30 rounded-xl overflow-hidden shadow-sm"
              >
                {/* Cabeçalho da Pasta */}
                <div 
                  className="p-2.5 bg-stone-900/80 hover:bg-stone-850 border-b border-amber-900/20 flex items-center justify-between cursor-pointer transition-colors"
                  onClick={() => toggleFolderCollapse(folder.id)}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-base shrink-0">{folder.icon || '📁'}</span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-cinzel font-bold text-amber-200 text-xs truncate">
                          {folder.name}
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-stone-800 text-amber-400/80 border border-stone-700 shrink-0">
                          {folderMaps.length}
                        </span>
                      </div>
                      {folder.description && (
                        <p className="text-[10px] text-stone-400 truncate max-w-[200px]">
                          {folder.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                    {/* Botão para Adicionar Mapa direto nesta pasta */}
                    <button
                      type="button"
                      onClick={() => onOpenUploadModal(folder.id)}
                      className="p-1 rounded hover:bg-stone-800 text-stone-400 hover:text-amber-300 transition-colors"
                      title={`Adicionar mapa em ${folder.name}`}
                    >
                      <Plus size={13} />
                    </button>

                    {/* Botão de Edição da Pasta */}
                    <button
                      type="button"
                      onClick={() => handleOpenEditFolder(folder)}
                      className="p-1 rounded hover:bg-stone-800 text-stone-400 hover:text-amber-300 transition-colors"
                      title="Editar pasta"
                    >
                      <Edit3 size={12} />
                    </button>

                    {/* Botão Excluir Pasta */}
                    <button
                      type="button"
                      onClick={() => setDeletingFolderId(folder.id)}
                      className="p-1 rounded hover:bg-red-950/60 text-stone-400 hover:text-red-400 transition-colors"
                      title="Excluir pasta"
                    >
                      <Trash2 size={12} />
                    </button>

                    {/* Colapsar / Expandir */}
                    <button
                      type="button"
                      onClick={() => toggleFolderCollapse(folder.id)}
                      className="p-1 rounded text-stone-400 hover:text-stone-200"
                    >
                      {isCollapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
                    </button>
                  </div>
                </div>

                {/* Conteúdo da Pasta: Miniaturas 16:9 */}
                {!isCollapsed && (
                  <div className="p-2.5">
                    {folderMaps.length === 0 ? (
                      <div className="text-center py-4 px-2 border border-dashed border-stone-800 rounded-lg">
                        <p className="text-[11px] text-stone-400 mb-2 font-sans">
                          Nenhum mapa nesta pasta ainda.
                        </p>
                        <button
                          type="button"
                          onClick={() => onOpenUploadModal(folder.id)}
                          className="px-2.5 py-1 rounded bg-stone-900 hover:bg-stone-800 border border-amber-900/40 text-[10px] font-cinzel font-bold text-amber-300 tracking-wider inline-flex items-center gap-1"
                        >
                          <Plus size={11} />
                          <span>Adicionar Mapa</span>
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-2">
                        {folderMaps.map(map => renderMapCard(map))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Rodapé da Biblioteca: Botão de Novo Mapa */}
        <div className="p-3 bg-stone-900/60 border-t border-amber-900/30 shrink-0">
          <button
            type="button"
            id="library-upload-map-btn"
            onClick={() => onOpenUploadModal()}
            className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700 hover:from-amber-600 hover:to-amber-500 text-stone-950 text-xs font-cinzel font-black tracking-wider uppercase flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer"
          >
            <Plus size={14} className="stroke-[3]" />
            <span>+ CARREGAR NOVO MAPA</span>
          </button>
        </div>
      </aside>

      {/* ============================================================ */}
      {/* MODAL: CRIAR / EDITAR PASTA                                  */}
      {/* ============================================================ */}
      {isFolderModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-sm w-full bg-stone-950 border border-amber-700/60 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col font-cinzel">
            <div className="p-3.5 bg-stone-900/60 border-b border-amber-900/40 flex items-center justify-between">
              <h3 className="font-bold text-xs text-amber-200 uppercase tracking-wider flex items-center gap-1.5">
                <FolderPlus size={15} className="text-amber-400" />
                <span>{editingFolderId ? 'EDITAR PASTA' : 'NOVA PASTA DE MAPAS'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsFolderModalOpen(false)}
                className="text-stone-500 hover:text-stone-300 p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveFolder} className="p-4 space-y-3.5">
              {/* Nome da Pasta */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-amber-300 uppercase tracking-wider">
                  Nome da Pasta *
                </label>
                <input
                  type="text"
                  required
                  value={folderFormName}
                  onChange={e => setFolderFormName(e.target.value)}
                  placeholder="Ex: Reino de Realmor"
                  className="w-full px-3 py-2 bg-stone-900 border border-amber-900/50 focus:border-amber-500 rounded-lg text-xs text-stone-100 placeholder-stone-400 outline-none font-sans"
                />
              </div>

              {/* Descrição Opcional */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-amber-300/80 uppercase tracking-wider">
                  Descrição (Opcional)
                </label>
                <input
                  type="text"
                  value={folderFormDesc}
                  onChange={e => setFolderFormDesc(e.target.value)}
                  placeholder="Ex: Reino principal da campanha"
                  className="w-full px-3 py-2 bg-stone-900 border border-amber-900/30 focus:border-amber-500 rounded-lg text-xs text-stone-100 placeholder-stone-400 outline-none font-sans"
                />
              </div>

              {/* Seletor de Ícone / Emoji */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-amber-300/80 uppercase tracking-wider">
                  Ícone da Pasta
                </label>
                <div className="grid grid-cols-8 gap-1 p-2 bg-stone-900/80 rounded-lg border border-stone-800 max-h-28 overflow-y-auto">
                  {AVAILABLE_FOLDER_ICONS.map(icon => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => setFolderFormIcon(icon)}
                      className={`h-8 rounded text-sm flex items-center justify-center transition-all ${
                        folderFormIcon === icon 
                          ? 'bg-amber-900/70 border border-amber-400 scale-110 shadow-sm' 
                          : 'hover:bg-stone-800'
                      }`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              {/* Botões do Formulário */}
              <div className="pt-2 border-t border-stone-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsFolderModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-lg bg-stone-850 hover:bg-stone-800 text-stone-300 text-xs font-bold uppercase tracking-wider"
                >
                  CANCELAR
                </button>
                <button
                  type="submit"
                  disabled={!folderFormName.trim()}
                  className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-amber-700 to-amber-600 hover:from-amber-600 hover:to-amber-500 text-stone-950 text-xs font-black uppercase tracking-wider shadow-md disabled:opacity-50"
                >
                  {editingFolderId ? 'SALVAR' : 'CRIAR'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL: MOVER MAPA PARA OUTRA PASTA                          */}
      {/* ============================================================ */}
      {movingMapId && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-sm w-full bg-stone-950 border border-amber-700/60 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col font-cinzel">
            <div className="p-3.5 bg-stone-900/60 border-b border-amber-900/40 flex items-center justify-between">
              <h3 className="font-bold text-xs text-amber-200 uppercase tracking-wider flex items-center gap-1.5">
                <FolderInput size={15} className="text-cyan-400" />
                <span>MOVER MAPA</span>
              </h3>
              <button
                type="button"
                onClick={() => setMovingMapId(null)}
                className="text-stone-500 hover:text-stone-300 p-1"
              >
                ✕
              </button>
            </div>

            <div className="p-4 space-y-3">
              <p className="text-xs text-stone-300 font-sans">
                Selecione a pasta de destino para o mapa:
              </p>

              <div className="space-y-1.5 max-h-56 overflow-y-auto">
                {folders.length === 0 ? (
                  <p className="text-xs text-stone-400 py-4 text-center font-sans">
                    Nenhuma pasta criada. Crie uma pasta primeiro para mover o mapa.
                  </p>
                ) : (
                  folders.map(f => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setSelectedTargetFolderId(f.id)}
                      className={`w-full text-left p-2.5 rounded-lg border transition-all flex items-center justify-between ${
                        selectedTargetFolderId === f.id
                          ? 'bg-amber-900/40 border-amber-400 text-amber-200 font-bold'
                          : 'bg-stone-900/60 border-stone-800 hover:bg-stone-850 text-stone-300'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className="text-base">{f.icon || '📁'}</span>
                        <span className="text-xs truncate">{f.name}</span>
                      </div>
                      {selectedTargetFolderId === f.id && <Check size={14} className="text-amber-400" />}
                    </button>
                  ))
                )}
              </div>

              <div className="pt-2 border-t border-stone-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setMovingMapId(null)}
                  className="px-3.5 py-1.5 rounded-lg bg-stone-850 hover:bg-stone-800 text-stone-300 text-xs font-bold uppercase tracking-wider"
                >
                  CANCELAR
                </button>
                <button
                  type="button"
                  onClick={handleConfirmMoveMap}
                  className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-cyan-700 to-cyan-600 hover:from-cyan-600 hover:to-cyan-500 text-white text-xs font-black uppercase tracking-wider shadow-md"
                >
                  MOVER
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL: RENOMEAR MAPA                                         */}
      {/* ============================================================ */}
      {renamingMapId && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-sm w-full bg-stone-950 border border-amber-700/60 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col font-cinzel">
            <div className="p-3.5 bg-stone-900/60 border-b border-amber-900/40 flex items-center justify-between">
              <h3 className="font-bold text-xs text-amber-200 uppercase tracking-wider flex items-center gap-1.5">
                <Edit3 size={15} className="text-amber-400" />
                <span>RENOMEAR MAPA</span>
              </h3>
              <button
                type="button"
                onClick={() => setRenamingMapId(null)}
                className="text-stone-500 hover:text-stone-300 p-1"
              >
                ✕
              </button>
            </div>

            <div className="p-4 space-y-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-amber-300 uppercase tracking-wider">
                  Novo Nome do Mapa
                </label>
                <input
                  type="text"
                  autoFocus
                  value={renameInputValue}
                  onChange={e => setRenameInputValue(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-900 border border-amber-900/50 focus:border-amber-500 rounded-lg text-xs text-stone-100 outline-none font-sans"
                />
              </div>

              <div className="pt-2 border-t border-stone-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRenamingMapId(null)}
                  className="px-3.5 py-1.5 rounded-lg bg-stone-850 hover:bg-stone-800 text-stone-300 text-xs font-bold uppercase tracking-wider"
                >
                  CANCELAR
                </button>
                <button
                  type="button"
                  onClick={handleConfirmRenameMap}
                  disabled={!renameInputValue.trim()}
                  className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-amber-700 to-amber-600 hover:from-amber-600 hover:to-amber-500 text-stone-950 text-xs font-black uppercase tracking-wider shadow-md disabled:opacity-50"
                >
                  SALVAR
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL: CONFIRMAR EXCLUSÃO DE MAPA                            */}
      {/* ============================================================ */}
      {deletingMapId && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-sm w-full bg-stone-950 border border-red-800/80 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col font-cinzel">
            <div className="p-3.5 bg-red-950/40 border-b border-red-900/50 flex items-center justify-between">
              <h3 className="font-bold text-xs text-red-300 uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle size={15} className="text-red-400" />
                <span>CONFIRMAR EXCLUSÃO</span>
              </h3>
              <button
                type="button"
                onClick={() => setDeletingMapId(null)}
                className="text-stone-500 hover:text-stone-300 p-1"
              >
                ✕
              </button>
            </div>

            <div className="p-4 space-y-3 font-sans">
              <p className="text-xs text-stone-200">
                Excluir o mapa <strong className="text-amber-300 font-cinzel">"{mapBeingDeleted?.name}"</strong>?
              </p>
              {mapBeingDeleted?.id === activeMapId && (
                <div className="p-2.5 rounded-lg bg-amber-950/40 border border-amber-700/50 text-[11px] text-amber-200 flex items-start gap-2">
                  <AlertTriangle size={14} className="text-amber-400 shrink-0 mt-0.5" />
                  <span>Atenção: Este mapa está atualmente aberto no editor. Ao excluir, outro mapa será carregado.</span>
                </div>
              )}
              <p className="text-[10px] text-stone-400">
                Esta ação removerá as marcações, grade e configurações associadas a este mapa.
              </p>

              <div className="pt-2 border-t border-stone-800 flex justify-end gap-2 font-cinzel">
                <button
                  type="button"
                  onClick={() => setDeletingMapId(null)}
                  className="px-3.5 py-1.5 rounded-lg bg-stone-850 hover:bg-stone-800 text-stone-300 text-xs font-bold uppercase tracking-wider"
                >
                  CANCELAR
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDeleteMap}
                  className="px-4 py-1.5 rounded-lg bg-red-800 hover:bg-red-700 text-red-100 text-xs font-black uppercase tracking-wider shadow-md"
                >
                  EXCLUIR
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL: CONFIRMAR EXCLUSÃO DE PASTA                           */}
      {/* ============================================================ */}
      {deletingFolderId && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-sm w-full bg-stone-950 border border-red-800/80 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col font-cinzel">
            <div className="p-3.5 bg-red-950/40 border-b border-red-900/50 flex items-center justify-between">
              <h3 className="font-bold text-xs text-red-300 uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle size={15} className="text-red-400" />
                <span>EXCLUIR PASTA</span>
              </h3>
              <button
                type="button"
                onClick={() => setDeletingFolderId(null)}
                className="text-stone-500 hover:text-stone-300 p-1"
              >
                ✕
              </button>
            </div>

            <div className="p-4 space-y-3 font-sans">
              <p className="text-xs text-stone-200">
                Excluir a pasta <strong className="text-amber-300 font-cinzel">"{folderBeingDeleted?.name}"</strong>?
              </p>
              <p className="text-[11px] text-stone-400">
                Os mapas contidos nela NÃO serão excluídos.
              </p>

              <div className="pt-2 border-t border-stone-800 flex justify-end gap-2 font-cinzel">
                <button
                  type="button"
                  onClick={() => setDeletingFolderId(null)}
                  className="px-3.5 py-1.5 rounded-lg bg-stone-850 hover:bg-stone-800 text-stone-300 text-xs font-bold uppercase tracking-wider"
                >
                  CANCELAR
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDeleteFolder}
                  className="px-4 py-1.5 rounded-lg bg-red-800 hover:bg-red-700 text-red-100 text-xs font-black uppercase tracking-wider shadow-md"
                >
                  EXCLUIR PASTA
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
