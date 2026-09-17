import React, { useState, useEffect } from 'react';
import { 
  MousePointer, 
  Hand, 
  Ruler, 
  MapPin, 
  Cloud, 
  Grid as GridIcon, 
  Pencil, 
  Shapes, 
  Eraser, 
  BookOpen, 
  RotateCcw, 
  ChevronLeft, 
  Square, 
  Circle, 
  Minus, 
  ArrowRight,
  Sliders,
  Check,
  Maximize2
} from 'lucide-react';
import { 
  ToolType, 
  GridSettings, 
  FogSettings, 
  FogMode, 
  FogShape, 
  ShapeType, 
  SelectedObject, 
  MapMarker, 
  MapDrawing, 
  MapShape
} from './types';
import { MapPropertiesPanel } from './MapPropertiesPanel';

interface MapToolbarProps {
  activeTool: ToolType;
  onSelectTool: (tool: ToolType) => void;
  // Identificação do Mapa Ativo
  activeMapName?: string;
  activeQuadrantIndex?: number;
  activeQuadrantNumber?: number;
  // Grade
  gridSettings: GridSettings;
  onUpdateGrid: (settings: Partial<GridSettings>) => void;
  // Névoa
  fogSettings: FogSettings;
  onUpdateFogSettings: (settings: Partial<FogSettings>) => void;
  onClearFog: () => void;
  onCoverAllFog: () => void;
  // Ferramenta Formas
  activeShapeType: ShapeType;
  onSelectShapeType: (type: ShapeType) => void;
  shapeStrokeColor: string;
  onSetShapeStrokeColor: (color: string) => void;
  shapeStrokeWidth: number;
  onSetShapeStrokeWidth: (width: number) => void;
  // Ferramenta Desenho
  drawColor: string;
  onSetDrawColor: (color: string) => void;
  drawWidth: number;
  onSetDrawWidth: (width: number) => void;
  // Ferramenta Medir (Régua)
  scaleMeters: number;
  onSetScaleMeters: (scale: number) => void;
  // Seleção e Propriedades
  selectedObject: SelectedObject | null;
  onCloseProperties: () => void;
  markers: MapMarker[];
  drawings: MapDrawing[];
  shapes: MapShape[];
  onUpdateMarker: (markerId: string, updates: Partial<MapMarker>) => void;
  onUpdateDrawing: (drawingId: string, updates: Partial<MapDrawing>) => void;
  onUpdateShape: (shapeId: string, updates: Partial<MapShape>) => void;
  onDeleteObject: (obj: SelectedObject) => void;
  // Ações globais
  onOpenImageModal?: () => void;
  onResetView: () => void;
  zoomLevel: number;
  isLibraryOpen?: boolean;
  onToggleLibrary?: () => void;
  onCloseLibrary?: () => void;
  isBestiaryOpen?: boolean;
  onToggleBestiary?: () => void;
  onCloseBestiary?: () => void;
}

const T20_PALETTE = [
  { name: 'Ouro Âmbar', color: '#f59e0b' },
  { name: 'Sangue Rubro', color: '#ef4444' },
  { name: 'Arcano Ciano', color: '#38bdf8' },
  { name: 'Veneno Verde', color: '#22c55e' },
  { name: 'Trevas Púrpura', color: '#a855f7' },
  { name: 'Gelo Branco', color: '#f8fafc' },
  { name: 'Sombra Grafite', color: '#334155' }
];

const MonsterIcon: React.FC<{ size?: number; className?: string }> = ({ size = 18, className }) => (
  <span style={{ fontSize: size * 0.95 }} className={`leading-none select-none ${className || ''}`}>
    👹
  </span>
);

export const MapToolbar: React.FC<MapToolbarProps> = ({
  activeTool,
  onSelectTool,
  activeMapName,
  activeQuadrantIndex,
  activeQuadrantNumber,
  gridSettings,
  onUpdateGrid,
  fogSettings,
  onUpdateFogSettings,
  onClearFog,
  onCoverAllFog,
  activeShapeType,
  onSelectShapeType,
  shapeStrokeColor,
  onSetShapeStrokeColor,
  shapeStrokeWidth,
  onSetShapeStrokeWidth,
  drawColor,
  onSetDrawColor,
  drawWidth,
  onSetDrawWidth,
  scaleMeters,
  onSetScaleMeters,
  selectedObject,
  onCloseProperties,
  markers,
  drawings,
  shapes,
  onUpdateMarker,
  onUpdateDrawing,
  onUpdateShape,
  onDeleteObject,
  onOpenImageModal,
  onResetView,
  zoomLevel,
  isLibraryOpen,
  onToggleLibrary,
  onCloseLibrary,
  isBestiaryOpen,
  onToggleBestiary,
  onCloseBestiary
}) => {
  // Painel de configuração acoplado ('grid' | 'fog' | 'draw' | 'shape' | 'measure' | null)
  const [activeConfigPanel, setActiveConfigPanel] = useState<'grid' | 'fog' | 'draw' | 'shape' | 'measure' | null>(null);

  const isFogActive = activeTool === 'fog' || activeTool === 'fog-paint' || activeTool === 'fog-reveal';
  const currentFogMode: FogMode = fogSettings.mode || (activeTool === 'fog-reveal' ? 'reveal' : 'hide');
  const currentFogShape: FogShape = fogSettings.shape || 'rect';

  // Regra de Painel Exclusivo: se a Biblioteca ou Bestiário forem abertos, fecha o painel de ferramentas e desseleciona objetos
  useEffect(() => {
    if (isLibraryOpen || isBestiaryOpen) {
      setActiveConfigPanel(null);
      onCloseProperties();
    }
  }, [isLibraryOpen, isBestiaryOpen, onCloseProperties]);

  // Se um objeto for selecionado, fecha o painel de ferramentas, fecha a biblioteca e o bestiário
  useEffect(() => {
    if (selectedObject !== null) {
      setActiveConfigPanel(null);
      if (isLibraryOpen) {
        if (onCloseLibrary) onCloseLibrary();
        else if (onToggleLibrary) onToggleLibrary();
      }
      if (isBestiaryOpen) {
        if (onCloseBestiary) onCloseBestiary();
        else if (onToggleBestiary) onToggleBestiary();
      }
    }
  }, [selectedObject, isLibraryOpen, isBestiaryOpen, onCloseLibrary, onToggleLibrary, onCloseBestiary, onToggleBestiary]);

  const closeDrawersIfOpen = () => {
    if (isLibraryOpen) {
      if (onCloseLibrary) onCloseLibrary();
      else if (onToggleLibrary) onToggleLibrary();
    }
    if (isBestiaryOpen) {
      if (onCloseBestiary) onCloseBestiary();
      else if (onToggleBestiary) onToggleBestiary();
    }
  };

  const handleToolClick = (toolId: ToolType) => {
    onSelectTool(toolId);
    if (selectedObject !== null) {
      onCloseProperties();
    }

    if (toolId === 'grid') {
      const willOpen = activeConfigPanel !== 'grid';
      setActiveConfigPanel(willOpen ? 'grid' : null);
      if (willOpen) closeDrawersIfOpen();
    } else if (toolId === 'fog' || toolId === 'fog-paint' || toolId === 'fog-reveal') {
      onSelectTool('fog');
      const willOpen = activeConfigPanel !== 'fog';
      setActiveConfigPanel(willOpen ? 'fog' : null);
      if (willOpen) closeDrawersIfOpen();
    } else if (toolId === 'draw') {
      const willOpen = activeConfigPanel !== 'draw';
      setActiveConfigPanel(willOpen ? 'draw' : null);
      if (willOpen) closeDrawersIfOpen();
    } else if (toolId === 'shape') {
      const willOpen = activeConfigPanel !== 'shape';
      setActiveConfigPanel(willOpen ? 'shape' : null);
      if (willOpen) closeDrawersIfOpen();
    } else if (toolId === 'measure') {
      const willOpen = activeConfigPanel !== 'measure';
      setActiveConfigPanel(willOpen ? 'measure' : null);
      if (willOpen) closeDrawersIfOpen();
    } else {
      setActiveConfigPanel(null);
    }
  };

  const handleToggleLibraryExclusive = () => {
    if (!isLibraryOpen) {
      setActiveConfigPanel(null);
      onCloseProperties();
      if (onCloseBestiary) onCloseBestiary();
      else if (onToggleBestiary && isBestiaryOpen) onToggleBestiary();
    }
    if (onToggleLibrary) {
      onToggleLibrary();
    }
  };

  const handleToggleBestiaryExclusive = () => {
    if (!isBestiaryOpen) {
      setActiveConfigPanel(null);
      onCloseProperties();
      if (onCloseLibrary) onCloseLibrary();
      else if (onToggleLibrary && isLibraryOpen) onToggleLibrary();
    }
    if (onToggleBestiary) {
      onToggleBestiary();
    }
  };

  const handleSetFogMode = (mode: FogMode) => {
    onUpdateFogSettings({ mode });
    onSelectTool('fog');
  };

  const handleSetFogShape = (shape: FogShape) => {
    onUpdateFogSettings({ shape });
    onSelectTool('fog');
  };

  // Determinar se a barra lateral tem painel expandido acoplado
  const isExpanded = selectedObject !== null || activeConfigPanel !== null;

  return (
    <aside 
      id="map-left-toolbar-container"
      className={`h-full bg-stone-950/95 border-r border-amber-900/40 flex flex-row shrink-0 select-none z-20 shadow-[4px_0_15px_rgba(0,0,0,0.5)] transition-all duration-200 overflow-hidden ${
        isExpanded ? 'w-72 sm:w-80' : 'w-14 sm:w-16'
      }`}
      style={{
        backgroundImage: 'radial-gradient(ellipse at top left, rgba(217, 119, 6, 0.05) 0%, transparent 70%)'
      }}
    >
      {/* ============================================================ */}
      {/* COLUNA 1: FAIXA DE ÍCONES PRINCIPAIS (FOUNDRY / PHOTOSHOP)   */}
      {/* ============================================================ */}
      <div className="w-14 sm:w-16 h-full flex flex-col items-center py-2.5 px-1 justify-between shrink-0 border-r border-amber-950/50 overflow-y-auto scrollbar-none">
        <div className="w-full flex flex-col items-center space-y-1">
          {/* 1. Biblioteca de Mapas */}
          {onToggleLibrary && (
            <ToolIconBtn
              id="tool-library-toggle"
              active={!!isLibraryOpen}
              title="Biblioteca de Mapas e Pastas"
              icon={BookOpen}
              badge={!!isLibraryOpen}
              badgeColor="bg-amber-400"
              onClick={handleToggleLibraryExclusive}
            />
          )}

          {/* 1.1 👹 Bestiário / Monstros */}
          {onToggleBestiary && (
            <ToolIconBtn
              id="tool-bestiary-toggle"
              active={!!isBestiaryOpen}
              title="Bestiário & Criaturas (👹 Monstros)"
              icon={MonsterIcon}
              badge={!!isBestiaryOpen}
              badgeColor="bg-red-500"
              onClick={handleToggleBestiaryExclusive}
            />
          )}

          {(onToggleLibrary || onToggleBestiary) && (
            <div className="w-8 h-px bg-amber-900/30 my-0.5" />
          )}

          {/* 2. 🖱️ SELECIONAR (V) */}
          <ToolIconBtn
            id="tool-select"
            active={activeTool === 'select'}
            title="Selecionar / Mover Elementos (V)"
            icon={MousePointer}
            onClick={() => handleToolClick('select')}
          />

          {/* 3. ✋ MOVER / PAN (H) */}
          <ToolIconBtn
            id="tool-pan"
            active={activeTool === 'pan'}
            title="Mover Mapa / Pan (H ou Espaço)"
            icon={Hand}
            onClick={() => handleToolClick('pan')}
          />

          {/* 4. 📏 MEDIR (M) */}
          <ToolIconBtn
            id="tool-measure"
            active={activeTool === 'measure'}
            title="Medir Distância / Régua T20 (M)"
            icon={Ruler}
            badge={activeTool === 'measure'}
            badgeColor="bg-amber-400"
            onClick={() => handleToolClick('measure')}
          />

          <div className="w-8 h-px bg-amber-900/30 my-0.5" />

          {/* 6. 📍 MARCADOR */}
          <ToolIconBtn
            id="tool-marker"
            active={activeTool === 'marker'}
            title="Adicionar Marcador"
            icon={MapPin}
            onClick={() => handleToolClick('marker')}
          />

          {/* 7. 🌫️ NÉVOA DE GUERRA (N / F) */}
          <ToolIconBtn
            id="tool-fog"
            active={isFogActive || activeConfigPanel === 'fog'}
            title="Névoa de Guerra: Ocultar / Revelar (N)"
            icon={Cloud}
            badge={currentFogMode === 'reveal'}
            badgeColor="bg-cyan-400"
            onClick={() => handleToolClick('fog')}
          />

          {/* 8. ▣ GRADE TÁTICA (G) */}
          <ToolIconBtn
            id="tool-grid"
            active={activeTool === 'grid' || activeConfigPanel === 'grid'}
            title="Grade Tática Tormenta 20 (G)"
            icon={GridIcon}
            badge={gridSettings.enabled}
            onClick={() => handleToolClick('grid')}
          />

          <div className="w-8 h-px bg-amber-900/30 my-0.5" />

          {/* 9. ✏️ DESENHAR (D) */}
          <ToolIconBtn
            id="tool-draw"
            active={activeTool === 'draw' || activeConfigPanel === 'draw'}
            title="Desenho Livre no Mapa (D)"
            icon={Pencil}
            badge={activeTool === 'draw'}
            badgeColor="bg-amber-400"
            onClick={() => handleToolClick('draw')}
          />

          {/* 10. ⭕ FORMAS GEOMÉTRICAS (R / C / L) */}
          <ToolIconBtn
            id="tool-shape"
            active={activeTool === 'shape' || activeConfigPanel === 'shape'}
            title="Formas Geométricas / Áreas (R, C, L)"
            icon={Shapes}
            badge={activeTool === 'shape'}
            badgeColor="bg-amber-400"
            onClick={() => handleToolClick('shape')}
          />

          {/* 11. 🗑️ APAGAR / BORRACHA (E) */}
          <ToolIconBtn
            id="tool-eraser"
            active={activeTool === 'eraser'}
            title="Borracha / Apagar Elemento (E)"
            icon={Eraser}
            badge={activeTool === 'eraser'}
            badgeColor="bg-red-400"
            onClick={() => handleToolClick('eraser')}
          />
        </div>

        {/* Rodapé: Centralizar e Enquadrar Mapa 16:9 */}
        <div className="w-full flex flex-col items-center pt-2 border-t border-amber-900/30">
          <button
            type="button"
            id="tool-reset-view"
            onClick={onResetView}
            className="w-10 h-10 rounded-lg flex flex-col items-center justify-center text-stone-400 hover:text-amber-300 hover:bg-stone-900 border border-transparent hover:border-amber-900/40 transition-all cursor-pointer group"
            title="Centralizar e Enquadrar Mapa 16:9"
          >
            <RotateCcw size={15} className="group-hover:rotate-[-90deg] transition-transform" />
            <span className="text-[9px] font-mono font-bold text-amber-400/80 mt-0.5">
              {Math.round(zoomLevel * 100)}%
            </span>
          </button>
        </div>
      </div>

      {/* ============================================================ */}
      {/* COLUNA 2: PAINEL ACOPLADO (PROPRIEDADES OU CONFIGURAÇÕES)    */}
      {/* ============================================================ */}
      {isExpanded && (
        <div 
          id="docked-tool-config-panel"
          className="flex-1 h-full flex flex-col justify-between p-3.5 bg-stone-900/95 overflow-y-auto font-cinzel text-xs text-stone-300"
        >
          {/* Se um Objeto estiver Selecionado, dar Prioridade ao Painel de Propriedades */}
          {selectedObject ? (
            <MapPropertiesPanel
              selectedObject={selectedObject}
              onClose={onCloseProperties}
              markers={markers}
              drawings={drawings}
              shapes={shapes}
              onUpdateMarker={onUpdateMarker}
              onUpdateDrawing={onUpdateDrawing}
              onUpdateShape={onUpdateShape}
              onDeleteObject={onDeleteObject}
            />
          ) : (
            <>
              {/* ==================================================== */}
              {/* 1. CONFIGURAÇÃO: MEDIR / RÉGUA T20                   */}
              {/* ==================================================== */}
              {activeConfigPanel === 'measure' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-amber-900/40">
                    <div className="flex items-center gap-2 text-amber-300">
                      <Ruler size={16} />
                      <span className="font-bold tracking-wider text-xs">📏 RÉGUA TÁTICA T20</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveConfigPanel(null)}
                      className="text-stone-400 hover:text-amber-200 text-xs flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-stone-800 transition-colors"
                      title="Fechar"
                    >
                      <ChevronLeft size={14} />
                      <span className="text-[10px] uppercase">Fechar</span>
                    </button>
                  </div>

                  <div className="bg-stone-950/70 p-2.5 rounded-lg border border-amber-900/30 text-[11px] text-stone-300 space-y-2 font-sans">
                    <p className="font-semibold text-amber-300 font-cinzel">Como Funciona:</p>
                    <p>Clique e arraste no mapa de um ponto até outro para medir a distância em metros e quadrados.</p>
                    <p className="text-stone-400 italic text-[10px]">A medição é temporária e não grava no banco de dados.</p>
                  </div>

                  {/* Escala por Quadrado */}
                  <div className="space-y-2 bg-stone-950/60 p-2.5 rounded-lg border border-amber-900/30">
                    <span className="text-[11px] font-bold text-stone-300 block">Escala por Quadrado:</span>
                    <div className="grid grid-cols-3 gap-1.5">
                      {[
                        { label: '1,5 metros (1q = 1,5m)', value: 1.5 },
                        { label: '3 metros (1q = 3m)', value: 3 },
                        { label: '6 metros (1q = 6m)', value: 6 }
                      ].map(sc => (
                        <button
                          key={sc.value}
                          type="button"
                          onClick={() => {
                            onSetScaleMeters(sc.value);
                            onUpdateGrid({ scaleMeters: sc.value });
                          }}
                          className={`py-1.5 px-1 rounded text-[10px] font-mono border transition-all text-center ${
                            scaleMeters === sc.value
                              ? 'border-amber-500 bg-amber-950 text-amber-300 font-bold shadow-sm'
                              : 'border-stone-800 bg-stone-900 text-stone-400 hover:border-stone-700'
                          }`}
                        >
                          {sc.value}m
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ==================================================== */}
              {/* 2. CONFIGURAÇÃO: DESENHAR                            */}
              {/* ==================================================== */}
              {activeConfigPanel === 'draw' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-amber-900/40">
                    <div className="flex items-center gap-2 text-amber-300">
                      <Pencil size={16} />
                      <span className="font-bold tracking-wider text-xs">✏️ DESENHO LIVRE</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveConfigPanel(null)}
                      className="text-stone-400 hover:text-amber-200 text-xs flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-stone-800 transition-colors"
                      title="Fechar"
                    >
                      <ChevronLeft size={14} />
                      <span className="text-[10px] uppercase">Fechar</span>
                    </button>
                  </div>

                  {/* Cor do Traço */}
                  <div className="space-y-1.5 bg-stone-950/60 p-2.5 rounded-lg border border-amber-900/30">
                    <span className="text-[11px] text-stone-400 block mb-1">Cor do Lápis:</span>
                    <div className="grid grid-cols-7 gap-1">
                      {T20_PALETTE.map(c => (
                        <button
                          key={c.color}
                          type="button"
                          onClick={() => onSetDrawColor(c.color)}
                          className={`w-6 h-6 rounded-full border-2 transition-transform ${
                            drawColor === c.color ? 'scale-125 border-white shadow-md' : 'border-stone-800 hover:scale-110'
                          }`}
                          style={{ backgroundColor: c.color }}
                          title={c.name}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Espessura do Traço */}
                  <div className="space-y-1.5 bg-stone-950/60 p-2.5 rounded-lg border border-amber-900/30">
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-stone-400">Espessura do Traço:</span>
                      <span className="text-amber-400 font-mono font-bold text-xs">{drawWidth}px</span>
                    </div>
                    <input
                      type="range"
                      min={2}
                      max={20}
                      step={1}
                      value={drawWidth}
                      onChange={(e) => onSetDrawWidth(Number(e.target.value))}
                      className="w-full accent-amber-500 h-1.5 bg-stone-800 rounded-lg cursor-pointer"
                    />
                    <div className="flex gap-1.5 pt-1">
                      {[2, 4, 8, 14].map(w => (
                        <button
                          key={w}
                          type="button"
                          onClick={() => onSetDrawWidth(w)}
                          className={`flex-1 py-1 rounded text-[10px] font-mono border transition-all ${
                            drawWidth === w
                              ? 'border-amber-500 bg-amber-950 text-amber-300 font-bold shadow-sm'
                              : 'border-stone-800 bg-stone-900 text-stone-400 hover:border-stone-700'
                          }`}
                        >
                          {w}px
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ==================================================== */}
              {/* 3. CONFIGURAÇÃO: FORMAS GEOMÉTRICAS                  */}
              {/* ==================================================== */}
              {activeConfigPanel === 'shape' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-amber-900/40">
                    <div className="flex items-center gap-2 text-amber-300">
                      <Shapes size={16} />
                      <span className="font-bold tracking-wider text-xs">⭕ FORMAS GEOMÉTRICAS</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveConfigPanel(null)}
                      className="text-stone-400 hover:text-amber-200 text-xs flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-stone-800 transition-colors"
                      title="Fechar"
                    >
                      <ChevronLeft size={14} />
                      <span className="text-[10px] uppercase">Fechar</span>
                    </button>
                  </div>

                  {/* Subopções de Forma */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block">
                      SELECIONE A FORMA
                    </span>
                    <div className="grid grid-cols-2 gap-2 bg-stone-950/70 p-1.5 rounded-lg border border-amber-900/30">
                      {[
                        { id: 'rect', label: '▭ Retângulo', icon: Square, shortcut: 'R' },
                        { id: 'circle', label: '⭕ Círculo / Raio', icon: Circle, shortcut: 'C' },
                        { id: 'line', label: '━ Linha', icon: Minus, shortcut: 'L' },
                        { id: 'arrow', label: '➤ Seta', icon: ArrowRight, shortcut: 'A' }
                      ].map(item => {
                        const isSelected = activeShapeType === item.id;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => {
                              onSelectShapeType(item.id as ShapeType);
                              onSelectTool('shape');
                            }}
                            className={`py-2 px-2 rounded flex items-center justify-center gap-1.5 text-[10px] font-bold tracking-wider uppercase border transition-all ${
                              isSelected
                                ? 'bg-amber-950 border-amber-500 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.25)]'
                                : 'bg-stone-900 border-stone-800 text-stone-400 hover:text-stone-200'
                            }`}
                          >
                            <span>{item.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Cor da Borda */}
                  <div className="space-y-1.5 bg-stone-950/60 p-2.5 rounded-lg border border-amber-900/30">
                    <span className="text-[11px] text-stone-400 block mb-1">Cor da Borda:</span>
                    <div className="grid grid-cols-7 gap-1">
                      {T20_PALETTE.map(c => (
                        <button
                          key={c.color}
                          type="button"
                          onClick={() => onSetShapeStrokeColor(c.color)}
                          className={`w-6 h-6 rounded-full border-2 transition-transform ${
                            shapeStrokeColor === c.color ? 'scale-125 border-white shadow-md' : 'border-stone-800 hover:scale-110'
                          }`}
                          style={{ backgroundColor: c.color }}
                          title={c.name}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Espessura da Linha */}
                  <div className="space-y-1.5 bg-stone-950/60 p-2.5 rounded-lg border border-amber-900/30">
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-stone-400">Espessura da Linha:</span>
                      <span className="text-amber-400 font-mono font-bold text-xs">{shapeStrokeWidth}px</span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={12}
                      step={1}
                      value={shapeStrokeWidth}
                      onChange={(e) => onSetShapeStrokeWidth(Number(e.target.value))}
                      className="w-full accent-amber-500 h-1.5 bg-stone-800 rounded-lg cursor-pointer"
                    />
                  </div>
                </div>
              )}

              {/* ==================================================== */}
              {/* 4. CONFIGURAÇÃO DA GRADE INDEPENDENTE POR MAPA       */}
              {/* ==================================================== */}
              {activeConfigPanel === 'grid' && (
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between pb-2 border-b border-amber-900/40">
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-1.5 text-amber-300">
                        <GridIcon size={15} />
                        <span className="font-cinzel font-bold tracking-wider text-xs uppercase">
                          GRADE — MAPA {activeQuadrantNumber || (activeQuadrantIndex !== undefined ? activeQuadrantIndex + 1 : 1)}
                        </span>
                      </div>
                      {activeMapName && (
                        <span className="text-[10px] text-stone-400 truncate max-w-[170px] italic">
                          {activeMapName}
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveConfigPanel(null)}
                      className="text-stone-400 hover:text-amber-200 text-xs flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-stone-800 transition-colors"
                      title="Fechar Configuração"
                    >
                      <ChevronLeft size={14} />
                      <span className="text-[10px] tracking-wider uppercase">Fechar</span>
                    </button>
                  </div>

                  {/* Interruptor Exibir Grade [✓ GRADE ATIVA] */}
                  <button
                    type="button"
                    id="grid-active-toggle-btn"
                    onClick={() => onUpdateGrid({ enabled: !gridSettings.enabled })}
                    className={`w-full py-2 px-3 rounded-lg text-xs font-cinzel font-bold tracking-wider uppercase flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                      gridSettings.enabled
                        ? 'bg-amber-950/90 border-amber-500 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.25)] ring-1 ring-amber-500/40'
                        : 'bg-stone-900/90 border-stone-800 text-stone-500 hover:border-stone-700 hover:text-stone-300'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${gridSettings.enabled ? 'bg-amber-400 shadow-[0_0_6px_rgba(245,158,11,0.8)]' : 'bg-stone-600'}`} />
                    <span>{gridSettings.enabled ? '✓ GRADE ATIVA' : '✕ GRADE DESATIVADA'}</span>
                  </button>

                  {/* Tamanho do Quadrado (com botões - e +) */}
                  <div className="space-y-1.5 bg-stone-950/60 p-2.5 rounded-lg border border-amber-900/30">
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-stone-300 font-medium">Tamanho do Quadrado:</span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => onUpdateGrid({ size: Math.max(15, (gridSettings.size || 50) - 5) })}
                          className="w-5 h-5 rounded bg-stone-900 border border-stone-800 hover:border-amber-700 text-stone-300 hover:text-amber-300 flex items-center justify-center text-xs font-bold transition-all"
                          title="Diminuir 5px"
                        >
                          −
                        </button>
                        <span className="text-amber-400 font-mono font-bold text-xs px-1.5 py-0.5 rounded bg-stone-900 border border-amber-900/40 min-w-[42px] text-center">
                          {gridSettings.size || 50}px
                        </span>
                        <button
                          type="button"
                          onClick={() => onUpdateGrid({ size: Math.min(200, (gridSettings.size || 50) + 5) })}
                          className="w-5 h-5 rounded bg-stone-900 border border-stone-800 hover:border-amber-700 text-stone-300 hover:text-amber-300 flex items-center justify-center text-xs font-bold transition-all"
                          title="Aumentar 5px"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <input
                      type="range"
                      min={20}
                      max={160}
                      step={5}
                      value={gridSettings.size || 50}
                      onChange={(e) => onUpdateGrid({ size: Number(e.target.value) })}
                      className="w-full accent-amber-500 h-1.5 bg-stone-800 rounded-lg cursor-pointer"
                    />
                    <div className="flex gap-1 pt-1">
                      {[30, 40, 50, 60, 80, 100].map(sz => (
                        <button
                          key={sz}
                          type="button"
                          onClick={() => onUpdateGrid({ size: sz })}
                          className={`flex-1 py-1 rounded text-[10px] font-mono border transition-all ${
                            (gridSettings.size || 50) === sz
                              ? 'border-amber-500 bg-amber-950 text-amber-300 font-bold shadow-sm'
                              : 'border-stone-800 bg-stone-900 text-stone-400 hover:border-stone-700'
                          }`}
                        >
                          {sz}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Opacidade da Grade */}
                  <div className="space-y-1.5 bg-stone-950/60 p-2.5 rounded-lg border border-amber-900/30">
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-stone-300 font-medium">Opacidade:</span>
                      <span className="text-amber-400 font-mono font-bold text-xs">{Math.round((gridSettings.opacity ?? 0.4) * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min={0.05}
                      max={1.0}
                      step={0.05}
                      value={gridSettings.opacity ?? 0.4}
                      onChange={(e) => onUpdateGrid({ opacity: Number(e.target.value) })}
                      className="w-full accent-amber-500 h-1.5 bg-stone-800 rounded-lg cursor-pointer"
                    />
                    <div className="flex gap-1 pt-0.5">
                      {[0.2, 0.4, 0.6, 0.8, 1.0].map(op => (
                        <button
                          key={op}
                          type="button"
                          onClick={() => onUpdateGrid({ opacity: op })}
                          className={`flex-1 py-0.5 rounded text-[9px] font-mono border transition-all ${
                            Math.abs((gridSettings.opacity ?? 0.4) - op) < 0.04
                              ? 'border-amber-500 bg-amber-950 text-amber-300 font-bold shadow-sm'
                              : 'border-stone-800 bg-stone-900 text-stone-500 hover:border-stone-700'
                          }`}
                        >
                          {Math.round(op * 100)}%
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Espessura da Linha (Thickness) */}
                  <div className="space-y-1.5 bg-stone-950/60 p-2.5 rounded-lg border border-amber-900/30">
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-stone-300 font-medium">Espessura da Linha:</span>
                      <span className="text-amber-400 font-mono font-bold text-xs">{(gridSettings.thickness ?? 1.2).toFixed(1)}px</span>
                    </div>
                    <input
                      type="range"
                      min={0.5}
                      max={5}
                      step={0.25}
                      value={gridSettings.thickness ?? 1.2}
                      onChange={(e) => onUpdateGrid({ thickness: Number(e.target.value) })}
                      className="w-full accent-amber-500 h-1.5 bg-stone-800 rounded-lg cursor-pointer"
                    />
                    <div className="flex gap-1 pt-0.5">
                      {[1, 1.5, 2, 3].map(th => (
                        <button
                          key={th}
                          type="button"
                          onClick={() => onUpdateGrid({ thickness: th })}
                          className={`flex-1 py-0.5 rounded text-[9px] font-mono border transition-all ${
                            Math.abs((gridSettings.thickness ?? 1.2) - th) < 0.1
                              ? 'border-amber-500 bg-amber-950 text-amber-300 font-bold shadow-sm'
                              : 'border-stone-800 bg-stone-900 text-stone-500 hover:border-stone-700'
                          }`}
                        >
                          {th}px
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Cor da Grade */}
                  <div className="space-y-1.5 bg-stone-950/60 p-2.5 rounded-lg border border-amber-900/30">
                    <span className="text-[11px] text-stone-300 font-medium block mb-1">Cor da Grade:</span>
                    <div className="grid grid-cols-4 gap-1.5">
                      {[
                        { label: 'Branco', color: '#FFFFFF' },
                        { label: 'Âmbar', color: 'rgb(217, 119, 6)' },
                        { label: 'Ciano', color: 'rgb(34, 211, 238)' },
                        { label: 'Gelo', color: 'rgb(240, 240, 240)' },
                        { label: 'Sangue', color: 'rgb(239, 68, 68)' },
                        { label: 'Verde', color: 'rgb(34, 197, 94)' },
                        { label: 'Roxo', color: 'rgb(168, 85, 247)' },
                        { label: 'Preto', color: 'rgb(15, 15, 15)' }
                      ].map(c => {
                        const currentColor = (gridSettings.color || '#FFFFFF').trim().toLowerCase();
                        const isSelected = currentColor === c.color.toLowerCase() || 
                          (c.color === '#FFFFFF' && (currentColor === 'white' || currentColor === '#fff' || currentColor === '#ffffff'));
                        return (
                          <button
                            key={c.label}
                            type="button"
                            onClick={() => onUpdateGrid({ color: c.color })}
                            className={`py-1 px-1 rounded text-[10px] border flex items-center justify-center gap-1 transition-all ${
                              isSelected
                                ? 'border-amber-500 bg-amber-950 text-amber-200 font-bold shadow-sm ring-1 ring-amber-500/40'
                                : 'border-stone-800 bg-stone-900 hover:border-amber-700/60 text-stone-300'
                            }`}
                          >
                            <span className="w-2 h-2 rounded-full shrink-0 border border-black/40" style={{ backgroundColor: c.color }} />
                            <span className="truncate">{c.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Escala */}
                  <div className="space-y-1.5 bg-stone-950/60 p-2.5 rounded-lg border border-amber-900/30">
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-stone-300 font-medium">Escala:</span>
                      <span className="text-amber-400 font-mono font-bold text-xs">1 quadrado = {gridSettings.scaleMeters ?? 1.5}m</span>
                    </div>
                    <div className="grid grid-cols-3 gap-1.5 pt-0.5">
                      {[
                        { label: '1,5 m', value: 1.5 },
                        { label: '3,0 m', value: 3 },
                        { label: '6,0 m', value: 6 }
                      ].map(sc => (
                        <button
                          key={sc.value}
                          type="button"
                          onClick={() => onUpdateGrid({ scaleMeters: sc.value })}
                          className={`py-1 px-1 rounded text-[10px] font-mono border transition-all text-center ${
                            (gridSettings.scaleMeters ?? 1.5) === sc.value
                              ? 'border-amber-500 bg-amber-950 text-amber-300 font-bold shadow-sm'
                              : 'border-stone-800 bg-stone-900 text-stone-400 hover:border-stone-700'
                          }`}
                        >
                          {sc.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ==================================================== */}
              {/* 5. CONFIGURAÇÃO DA NÉVOA (PRESERVADO 100%)           */}
              {/* ==================================================== */}
              {activeConfigPanel === 'fog' && (
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between pb-2 border-b border-amber-900/40">
                    <div className="flex items-center gap-2 text-amber-300">
                      <Cloud size={16} />
                      <span className="font-bold tracking-wider text-xs">🌫️ NÉVOA</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveConfigPanel(null)}
                      className="text-stone-400 hover:text-amber-200 text-xs flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-stone-800 transition-colors"
                      title="Fechar Configuração"
                    >
                      <ChevronLeft size={14} />
                      <span className="text-[10px] tracking-wider uppercase">Fechar</span>
                    </button>
                  </div>

                  {/* 1. SEÇÃO MODO: OCULTAR vs REVELAR */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block">
                      MODO
                    </span>
                    <div className="grid grid-cols-2 gap-2 bg-stone-950/70 p-1.5 rounded-lg border border-amber-900/30">
                      <button
                        type="button"
                        id="fog-mode-hide-btn"
                        onClick={() => handleSetFogMode('hide')}
                        className={`py-2 px-2 rounded flex items-center justify-center gap-1.5 text-[11px] font-bold tracking-wider uppercase border transition-all ${
                          currentFogMode === 'hide'
                            ? 'bg-amber-950 border-amber-500 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.3)]'
                            : 'bg-stone-900 border-stone-800 text-stone-400 hover:text-stone-200'
                        }`}
                      >
                        <Cloud size={14} />
                        <span>OCULTAR</span>
                      </button>
                      <button
                        type="button"
                        id="fog-mode-reveal-btn"
                        onClick={() => handleSetFogMode('reveal')}
                        className={`py-2 px-2 rounded flex items-center justify-center gap-1.5 text-[11px] font-bold tracking-wider uppercase border transition-all ${
                          currentFogMode === 'reveal'
                            ? 'bg-cyan-950/90 border-cyan-500 text-cyan-300 shadow-[0_0_12px_rgba(34,211,238,0.3)]'
                            : 'bg-stone-900 border-stone-800 text-stone-400 hover:text-stone-200'
                        }`}
                      >
                        <Eraser size={14} />
                        <span>REVELAR</span>
                      </button>
                    </div>
                  </div>

                  {/* 2. SEÇÃO FORMA: RETÂNGULO vs LIVRE (LASSO) */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block">
                      FORMA
                    </span>
                    <div className="grid grid-cols-2 gap-2 bg-stone-950/70 p-1.5 rounded-lg border border-amber-900/30">
                      <button
                        type="button"
                        id="fog-shape-rect-btn"
                        onClick={() => handleSetFogShape('rect')}
                        className={`py-2 px-2 rounded flex items-center justify-center gap-1.5 text-[11px] font-bold tracking-wider uppercase border transition-all ${
                          currentFogShape === 'rect'
                            ? 'bg-stone-800 border-amber-400 text-amber-200 shadow-sm'
                            : 'bg-stone-900 border-stone-800 text-stone-400 hover:text-stone-200'
                        }`}
                      >
                        <Square size={13} />
                        <span>▣ RETÂNGULO</span>
                      </button>
                      <button
                        type="button"
                        id="fog-shape-freehand-btn"
                        onClick={() => handleSetFogShape('freehand')}
                        className={`py-2 px-2 rounded flex items-center justify-center gap-1.5 text-[11px] font-bold tracking-wider uppercase border transition-all ${
                          currentFogShape === 'freehand'
                            ? 'bg-stone-800 border-amber-400 text-amber-200 shadow-sm'
                            : 'bg-stone-900 border-stone-800 text-stone-400 hover:text-stone-200'
                        }`}
                      >
                        <Pencil size={13} />
                        <span>✏️ LIVRE</span>
                      </button>
                    </div>
                  </div>

                  {/* Densidade */}
                  <div className="space-y-1.5 bg-stone-950/60 p-2.5 rounded-lg border border-amber-900/30">
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-stone-400">Densidade:</span>
                      <span className="text-amber-400 font-mono font-bold text-xs">
                        {Math.round((fogSettings.density || 0.95) * 100)}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0.15}
                      max={1.0}
                      step={0.05}
                      value={fogSettings.density ?? 0.95}
                      onChange={(e) => onUpdateFogSettings({ density: Number(e.target.value) })}
                      className="w-full accent-amber-500 h-1.5 bg-stone-800 rounded-lg cursor-pointer"
                    />
                  </div>

                  {/* Suavidade / Bordas */}
                  <div className="space-y-1.5 bg-stone-950/60 p-2.5 rounded-lg border border-amber-900/30">
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-stone-400">Suavidade:</span>
                      <span className="text-amber-400 font-mono font-bold text-xs">{fogSettings.feather ?? 20}px</span>
                    </div>
                    <input
                      type="range"
                      min={4}
                      max={45}
                      step={2}
                      value={fogSettings.feather ?? 20}
                      onChange={(e) => onUpdateFogSettings({ feather: Number(e.target.value) })}
                      className="w-full accent-amber-500 h-1.5 bg-stone-800 rounded-lg cursor-pointer"
                    />
                  </div>

                  {/* Tipo de Névoa */}
                  <div className="space-y-1.5 bg-stone-950/60 p-2.5 rounded-lg border border-amber-900/30">
                    <span className="text-[11px] text-stone-400 block mb-1">Aparência:</span>
                    <div className="grid grid-cols-3 gap-1.5">
                      {(['dense', 'dark', 'spectral'] as const).map(tp => (
                        <button
                          key={tp}
                          type="button"
                          onClick={() => onUpdateFogSettings({ type: tp })}
                          className={`py-1.5 px-1 rounded text-[10px] font-bold uppercase tracking-wider border transition-all ${
                            (fogSettings.type || 'dense') === tp
                              ? 'border-amber-500 bg-amber-950 text-amber-300'
                              : 'border-stone-800 bg-stone-900 text-stone-400 hover:border-stone-700'
                          }`}
                        >
                          {tp === 'dense' ? 'Densa' : tp === 'dark' ? 'Sombria' : 'Espectral'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Ações Globais */}
                  <div className="pt-2 border-t border-amber-900/30 space-y-2">
                    <button
                      type="button"
                      onClick={onCoverAllFog}
                      className="w-full py-2 px-3 rounded bg-stone-900 hover:bg-stone-800 border border-stone-700 text-stone-200 text-[10px] tracking-wider uppercase font-bold text-center block transition-all hover:border-amber-700/60 cursor-pointer"
                    >
                      🌫️ Cobrir Mapa Inteiro
                    </button>
                    <button
                      type="button"
                      onClick={onClearFog}
                      className="w-full py-2 px-3 rounded bg-amber-950/40 hover:bg-amber-950 border border-amber-900/50 text-amber-300 text-[10px] tracking-wider uppercase font-bold text-center block transition-all cursor-pointer"
                    >
                      ✨ Revelar Mapa Inteiro
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Botão de Fechar Painel Acoplado no Rodapé */}
          <div className="pt-3 border-t border-amber-900/30">
            <button
              type="button"
              onClick={() => {
                setActiveConfigPanel(null);
                onCloseProperties();
              }}
              className="w-full py-1.5 px-3 rounded bg-stone-950 hover:bg-stone-900 border border-stone-800 hover:border-amber-900/50 text-stone-400 hover:text-stone-200 text-[10px] tracking-widest uppercase font-bold text-center transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <ChevronLeft size={13} />
              <span>FECHAR PAINEL</span>
            </button>
          </div>
        </div>
      )}
    </aside>
  );
};

interface ToolIconBtnProps {
  id: string;
  active: boolean;
  disabled?: boolean;
  title: string;
  icon: React.ElementType;
  badge?: boolean;
  badgeColor?: string;
  onClick: () => void;
}

const ToolIconBtn: React.FC<ToolIconBtnProps> = ({
  id,
  active,
  disabled,
  title,
  icon: Icon,
  badge,
  badgeColor = 'bg-amber-400',
  onClick
}) => {
  return (
    <div className="relative group w-full flex justify-center">
      <button
        type="button"
        id={id}
        disabled={disabled}
        onClick={onClick}
        className={`w-10 h-10 sm:w-11 sm:h-11 rounded-lg flex items-center justify-center transition-all cursor-pointer relative ${
          active
            ? 'bg-amber-900/40 text-amber-300 border border-amber-500/70 shadow-[0_0_12px_rgba(245,158,11,0.3)]'
            : disabled
            ? 'text-stone-700 cursor-not-allowed border border-transparent opacity-40'
            : 'text-stone-400 hover:text-amber-200 hover:bg-stone-900 border border-transparent hover:border-amber-900/30'
        }`}
        title={title}
      >
        <Icon size={19} className={active ? 'text-amber-400 stroke-[2.2]' : 'text-stone-400 group-hover:text-amber-300'} />
        
        {badge && (
          <span className={`absolute bottom-1 right-1 w-1.5 h-1.5 rounded-full ${badgeColor} shadow-sm`} />
        )}
      </button>

      {/* Tooltip Lateral Elegante */}
      <div className="absolute left-full ml-2.5 top-1/2 -translate-y-1/2 px-2 py-1 bg-stone-900 border border-amber-700/50 rounded shadow-xl text-stone-200 text-xs font-cinzel font-medium whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50">
        {title}
      </div>
    </div>
  );
};
