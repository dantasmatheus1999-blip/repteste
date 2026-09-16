import React, { useState } from 'react';
import { 
  MousePointer, 
  Hand, 
  Grid as GridIcon, 
  Cloud, 
  Eraser, 
  MapPin, 
  Image as ImageIcon, 
  Trash2, 
  RotateCcw,
  Sliders,
  ChevronLeft,
  Eye,
  EyeOff,
  Sparkles,
  Maximize2
} from 'lucide-react';
import { ToolType, GridSettings, FogSettings } from './types';

interface MapToolbarProps {
  activeTool: ToolType;
  onSelectTool: (tool: ToolType) => void;
  gridSettings: GridSettings;
  onUpdateGrid: (settings: Partial<GridSettings>) => void;
  fogSettings: FogSettings;
  onUpdateFogSettings: (settings: Partial<FogSettings>) => void;
  hasSelectedMarker: boolean;
  onDeleteSelectedMarker: () => void;
  onOpenImageModal: () => void;
  onResetView: () => void;
  onClearFog: () => void;
  onCoverAllFog: () => void;
  zoomLevel: number;
}

export const MapToolbar: React.FC<MapToolbarProps> = ({
  activeTool,
  onSelectTool,
  gridSettings,
  onUpdateGrid,
  fogSettings,
  onUpdateFogSettings,
  hasSelectedMarker,
  onDeleteSelectedMarker,
  onOpenImageModal,
  onResetView,
  onClearFog,
  onCoverAllFog,
  zoomLevel
}) => {
  // Controle do painel acoplado (grid | fog | null)
  const [activeConfigPanel, setActiveConfigPanel] = useState<'grid' | 'fog' | null>(null);

  const handleToolClick = (toolId: ToolType) => {
    onSelectTool(toolId);

    if (toolId === 'grid') {
      setActiveConfigPanel(prev => prev === 'grid' ? null : 'grid');
    } else if (toolId === 'fog-paint' || toolId === 'fog-reveal') {
      setActiveConfigPanel('fog');
    } else if (toolId === 'image') {
      onOpenImageModal();
    } else if (toolId === 'delete') {
      onDeleteSelectedMarker();
    }
  };

  const isExpanded = activeConfigPanel !== null;

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
      {/* COLUNA 1: FAIXA DE ÍCONES PRINCIPAIS                         */}
      {/* ============================================================ */}
      <div className="w-14 sm:w-16 h-full flex flex-col items-center py-3 px-1 justify-between shrink-0 border-r border-amber-950/50">
        <div className="w-full flex flex-col items-center space-y-1.5">
          {/* Selecionar */}
          <ToolIconBtn
            id="tool-select"
            active={activeTool === 'select'}
            title="Selecionar / Mover Marcador (V)"
            icon={MousePointer}
            onClick={() => handleToolClick('select')}
          />

          {/* Pan / Mover */}
          <ToolIconBtn
            id="tool-pan"
            active={activeTool === 'pan'}
            title="Mover Mapa / Pan (H ou Espaço)"
            icon={Hand}
            onClick={() => handleToolClick('pan')}
          />

          <div className="w-8 h-px bg-amber-900/30 my-1" />

          {/* Grade Tática */}
          <ToolIconBtn
            id="tool-grid"
            active={activeTool === 'grid' || activeConfigPanel === 'grid'}
            title="Grade Tática 16:9 (G)"
            icon={GridIcon}
            badge={gridSettings.enabled}
            onClick={() => handleToolClick('grid')}
          />

          {/* Névoa de Guerra (Ocultar) */}
          <ToolIconBtn
            id="tool-fog-paint"
            active={activeTool === 'fog-paint'}
            title="Névoa: Ocultar Retângulo (F)"
            icon={Cloud}
            onClick={() => handleToolClick('fog-paint')}
          />

          {/* Revelar Névoa */}
          <ToolIconBtn
            id="tool-fog-reveal"
            active={activeTool === 'fog-reveal'}
            title="Névoa: Revelar Retângulo (R)"
            icon={Eraser}
            onClick={() => handleToolClick('fog-reveal')}
          />

          <div className="w-8 h-px bg-amber-900/30 my-1" />

          {/* Marcador */}
          <ToolIconBtn
            id="tool-marker"
            active={activeTool === 'marker'}
            title="Adicionar Marcador (M)"
            icon={MapPin}
            onClick={() => handleToolClick('marker')}
          />

          {/* Carregar Imagem */}
          <ToolIconBtn
            id="tool-image"
            active={false}
            title="Trocar Mapa / Imagem"
            icon={ImageIcon}
            onClick={() => handleToolClick('image')}
          />

          {/* Excluir Marcador Selecionado */}
          <ToolIconBtn
            id="tool-delete"
            active={false}
            disabled={!hasSelectedMarker}
            title="Excluir Marcador Selecionado (Del)"
            icon={Trash2}
            badge={hasSelectedMarker}
            badgeColor="bg-red-500"
            onClick={() => handleToolClick('delete')}
          />
        </div>

        {/* Rodapé: Reset de Enquadramento */}
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
      {/* COLUNA 2: PAINEL DE CONFIGURAÇÃO ACOPLADO                    */}
      {/* ============================================================ */}
      {isExpanded && (
        <div 
          id="docked-tool-config-panel"
          className="flex-1 h-full flex flex-col justify-between p-3.5 bg-stone-900/90 overflow-y-auto font-cinzel text-xs text-stone-300"
        >
          {/* CONFIGURAÇÃO DA GRADE */}
          {activeConfigPanel === 'grid' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-amber-900/40">
                <div className="flex items-center gap-2 text-amber-300">
                  <GridIcon size={16} />
                  <span className="font-bold tracking-wider text-xs">CONFIGURAR GRADE</span>
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

              {/* Interruptor Exibir Grade */}
              <div className="flex items-center justify-between bg-stone-950/60 p-2.5 rounded-lg border border-amber-900/30">
                <span className="text-stone-300 font-medium">Exibir Grade:</span>
                <button
                  type="button"
                  onClick={() => onUpdateGrid({ enabled: !gridSettings.enabled })}
                  className={`px-3 py-1 rounded text-[11px] font-bold tracking-wider uppercase border transition-all ${
                    gridSettings.enabled
                      ? 'bg-amber-600/30 border-amber-500 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.2)]'
                      : 'bg-stone-900 border-stone-700 text-stone-500'
                  }`}
                >
                  {gridSettings.enabled ? 'Ligada' : 'Desligada'}
                </button>
              </div>

              {/* Tamanho da Célula */}
              <div className="space-y-1.5 bg-stone-950/60 p-2.5 rounded-lg border border-amber-900/30">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-stone-400">Tamanho da Célula:</span>
                  <span className="text-amber-400 font-mono font-bold text-xs">{gridSettings.size}px</span>
                </div>
                <input
                  type="range"
                  min={25}
                  max={150}
                  step={5}
                  value={gridSettings.size}
                  onChange={(e) => onUpdateGrid({ size: Number(e.target.value) })}
                  className="w-full accent-amber-500 h-1.5 bg-stone-800 rounded-lg cursor-pointer"
                />
                <div className="flex gap-1.5 pt-1">
                  {[25, 35, 50, 75, 100].map(sz => (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => onUpdateGrid({ size: sz })}
                      className={`flex-1 py-1 rounded text-[10px] font-mono border transition-all ${
                        gridSettings.size === sz
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
                  <span className="text-stone-400">Opacidade:</span>
                  <span className="text-amber-400 font-mono font-bold text-xs">{Math.round((gridSettings.opacity || 0.4) * 100)}%</span>
                </div>
                <input
                  type="range"
                  min={0.1}
                  max={1.0}
                  step={0.05}
                  value={gridSettings.opacity || 0.4}
                  onChange={(e) => onUpdateGrid({ opacity: Number(e.target.value) })}
                  className="w-full accent-amber-500 h-1.5 bg-stone-800 rounded-lg cursor-pointer"
                />
              </div>

              {/* Cores Presets */}
              <div className="space-y-1.5 bg-stone-950/60 p-2.5 rounded-lg border border-amber-900/30">
                <span className="text-[11px] text-stone-400 block mb-1">Cor da Linha:</span>
                <div className="grid grid-cols-4 gap-1.5">
                  {[
                    { label: 'Âmbar', color: 'rgb(217, 119, 6)' },
                    { label: 'Ciano', color: 'rgb(34, 211, 238)' },
                    { label: 'Gelo', color: 'rgb(240, 240, 240)' },
                    { label: 'Sangue', color: 'rgb(239, 68, 68)' }
                  ].map(c => (
                    <button
                      key={c.label}
                      type="button"
                      onClick={() => onUpdateGrid({ color: c.color })}
                      className="py-1 px-1.5 rounded text-[10px] border border-stone-800 bg-stone-900 hover:border-amber-700/60 text-stone-300 text-center transition-all"
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* CONFIGURAÇÃO DA NÉVOA */}
          {activeConfigPanel === 'fog' && (
            <div className="space-y-3.5">
              <div className="flex items-center justify-between pb-2 border-b border-amber-900/40">
                <div className="flex items-center gap-2 text-amber-300">
                  <Cloud size={16} />
                  <span className="font-bold tracking-wider text-xs">NÉVOA DE GUERRA</span>
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

              {/* Modos Rápidos: Ocultar Retângulo vs Revelar Retângulo */}
              <div className="grid grid-cols-2 gap-2 bg-stone-950/60 p-1.5 rounded-lg border border-amber-900/30">
                <button
                  type="button"
                  onClick={() => onSelectTool('fog-paint')}
                  className={`py-2 px-2 rounded flex items-center justify-center gap-1.5 text-[11px] font-bold tracking-wider uppercase border transition-all ${
                    activeTool === 'fog-paint'
                      ? 'bg-amber-950 border-amber-500 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.25)]'
                      : 'bg-stone-900 border-stone-800 text-stone-400 hover:text-stone-200'
                  }`}
                >
                  <Cloud size={14} />
                  <span>Ocultar</span>
                </button>
                <button
                  type="button"
                  onClick={() => onSelectTool('fog-reveal')}
                  className={`py-2 px-2 rounded flex items-center justify-center gap-1.5 text-[11px] font-bold tracking-wider uppercase border transition-all ${
                    activeTool === 'fog-reveal'
                      ? 'bg-cyan-950/80 border-cyan-500 text-cyan-300 shadow-[0_0_10px_rgba(34,211,238,0.25)]'
                      : 'bg-stone-900 border-stone-800 text-stone-400 hover:text-stone-200'
                  }`}
                >
                  <Eraser size={14} />
                  <span>Revelar</span>
                </button>
              </div>

              {/* Guia de Seleção Retangular */}
              <div className="bg-stone-950/70 p-2.5 rounded-lg border border-amber-900/20 text-[11px] text-stone-400 leading-relaxed font-sans">
                <p className="font-semibold text-amber-300/90 font-cinzel mb-0.5">
                  {activeTool === 'fog-paint' ? '🌫️ Seleção de Ocultação' : '🧹 Seleção de Revelação'}
                </p>
                Clique no mapa e arraste em qualquer direção (esquerda, direita, cima, baixo) para formar uma área retangular com névoa orgânica.
              </div>

              {/* Densidade */}
              <div className="space-y-1.5 bg-stone-950/60 p-2.5 rounded-lg border border-amber-900/30">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-stone-400">Densidade / Opacidade:</span>
                  <span className="text-amber-400 font-mono font-bold text-xs">
                    {Math.round((fogSettings.density || 0.95) * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min={0.15}
                  max={1.0}
                  step={0.05}
                  value={fogSettings.density}
                  onChange={(e) => onUpdateFogSettings({ density: Number(e.target.value) })}
                  className="w-full accent-amber-500 h-1.5 bg-stone-800 rounded-lg cursor-pointer"
                />
              </div>

              {/* Suavidade / Bordas */}
              <div className="space-y-1.5 bg-stone-950/60 p-2.5 rounded-lg border border-amber-900/30">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-stone-400">Suavidade / Borda:</span>
                  <span className="text-amber-400 font-mono font-bold text-xs">{fogSettings.feather}px</span>
                </div>
                <input
                  type="range"
                  min={6}
                  max={45}
                  step={2}
                  value={fogSettings.feather}
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
                        fogSettings.type === tp
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

          {/* Botão de Fechar Painel Acoplado no Rodapé */}
          <div className="pt-3 border-t border-amber-900/30">
            <button
              type="button"
              onClick={() => setActiveConfigPanel(null)}
              className="w-full py-1.5 px-3 rounded bg-stone-950 hover:bg-stone-900 border border-stone-800 hover:border-amber-900/50 text-stone-400 hover:text-stone-200 text-[10px] tracking-widest uppercase font-bold text-center transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <ChevronLeft size={13} />
              <span>FECHAR CONFIGURAÇÃO</span>
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
