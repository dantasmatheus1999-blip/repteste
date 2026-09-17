import React from 'react';
import { 
  SelectedObject, 
  MapMarker, 
  MapDrawing, 
  MapShape, 
  ShapeType 
} from './types';
import { 
  Trash2, 
  X, 
  Sliders, 
  Square, 
  Circle, 
  Minus, 
  ArrowRight, 
  MapPin, 
  Sword, 
  Skull, 
  Shield, 
  Star, 
  Package,
  Pencil
} from 'lucide-react';

interface MapPropertiesPanelProps {
  selectedObject: SelectedObject | null;
  onClose: () => void;
  markers: MapMarker[];
  drawings: MapDrawing[];
  shapes: MapShape[];
  onUpdateMarker: (markerId: string, updates: Partial<MapMarker>) => void;
  onUpdateDrawing: (drawingId: string, updates: Partial<MapDrawing>) => void;
  onUpdateShape: (shapeId: string, updates: Partial<MapShape>) => void;
  onDeleteObject: (obj: SelectedObject) => void;
}

const T20_COLORS = [
  { name: 'Âmbar / Ouro', value: '#f59e0b' },
  { name: 'Sangue / Vermelho', value: '#ef4444' },
  { name: 'Arcano / Ciano', value: '#38bdf8' },
  { name: 'Veneno / Verde', value: '#22c55e' },
  { name: 'Trevas / Púrpura', value: '#a855f7' },
  { name: 'Gelo / Branco', value: '#f8fafc' },
  { name: 'Sombra / Grafite', value: '#334155' }
];

export const MapPropertiesPanel: React.FC<MapPropertiesPanelProps> = ({
  selectedObject,
  onClose,
  markers,
  drawings,
  shapes,
  onUpdateMarker,
  onUpdateDrawing,
  onUpdateShape,
  onDeleteObject
}) => {
  if (!selectedObject) return null;

  const currentMarker = selectedObject.type === 'marker' 
    ? markers.find(m => m.id === selectedObject.id) 
    : null;

  const currentDrawing = selectedObject.type === 'drawing' 
    ? drawings.find(d => d.id === selectedObject.id) 
    : null;

  const currentShape = selectedObject.type === 'shape' 
    ? shapes.find(s => s.id === selectedObject.id) 
    : null;

  if (!currentMarker && !currentDrawing && !currentShape) return null;

  return (
    <div 
      id="docked-object-properties-panel"
      className="w-full flex flex-col justify-between p-3.5 bg-stone-900/95 overflow-y-auto font-cinzel text-xs text-stone-300 space-y-3.5"
    >
      {/* Cabeçalho do Painel */}
      <div className="flex items-center justify-between pb-2 border-b border-amber-900/40">
        <div className="flex items-center gap-1.5 text-amber-300 font-bold">
          <Sliders size={14} className="text-amber-400" />
          <span className="tracking-wider uppercase">
            {selectedObject.type === 'marker' && '📍 PROPRIEDADES DO MARCADOR'}
            {selectedObject.type === 'drawing' && '✏️ PROPRIEDADES DO DESENHO'}
            {selectedObject.type === 'shape' && '⭕ PROPRIEDADES DA FORMA'}
          </span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-stone-400 hover:text-amber-300 p-1 rounded hover:bg-stone-800 transition-colors"
          title="Fechar propriedades"
        >
          <X size={14} />
        </button>
      </div>

      {/* ============================================================ */}
      {/* 1. PROPRIEDADES DE MARCADOR                                  */}
      {/* ============================================================ */}
      {currentMarker && (
        <div className="space-y-3">
          {/* Nome / Rótulo */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block">
              Nome / Rótulo
            </label>
            <input
              type="text"
              value={currentMarker.label}
              onChange={(e) => onUpdateMarker(currentMarker.id, { label: e.target.value })}
              className="w-full px-2.5 py-1.5 bg-stone-950 border border-stone-800 focus:border-amber-500 rounded text-xs text-amber-200 outline-none font-sans"
              placeholder="Ex: Entrada Secreta"
            />
          </div>

          {/* Ícone */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block">
              Ícone
            </label>
            <div className="grid grid-cols-6 gap-1 bg-stone-950 p-1.5 rounded border border-stone-800">
              {[
                { id: 'pin', icon: MapPin, title: 'Pino' },
                { id: 'sword', icon: Sword, title: 'Espada / Combate' },
                { id: 'skull', icon: Skull, title: 'Inimigo / Perigo' },
                { id: 'shield', icon: Shield, title: 'Defesa / Aliado' },
                { id: 'star', icon: Star, title: 'Objetivo' },
                { id: 'chest', icon: Package, title: 'Tesouro' }
              ].map(item => {
                const IconComponent = item.icon;
                const isSelected = (currentMarker.icon || 'pin') === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onUpdateMarker(currentMarker.id, { icon: item.id as any })}
                    className={`p-1.5 rounded flex items-center justify-center transition-all ${
                      isSelected
                        ? 'bg-amber-950 border border-amber-500 text-amber-300 shadow-sm'
                        : 'text-stone-400 hover:text-amber-200 hover:bg-stone-900 border border-transparent'
                    }`}
                    title={item.title}
                  >
                    <IconComponent size={14} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Cor do Marcador */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block">
              Cor
            </label>
            <div className="grid grid-cols-7 gap-1">
              {T20_COLORS.map(c => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => onUpdateMarker(currentMarker.id, { color: c.value })}
                  className={`w-6 h-6 rounded-full border-2 transition-transform ${
                    currentMarker.color === c.value ? 'scale-125 border-white shadow-md' : 'border-stone-800 hover:scale-110'
                  }`}
                  style={{ backgroundColor: c.value }}
                  title={c.name}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 2. PROPRIEDADES DE DESENHO                                   */}
      {/* ============================================================ */}
      {currentDrawing && (
        <div className="space-y-3">
          {/* Cor do Traço */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block">
              Cor do Traço
            </label>
            <div className="grid grid-cols-7 gap-1">
              {T20_COLORS.map(c => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => onUpdateDrawing(currentDrawing.id, { color: c.value })}
                  className={`w-6 h-6 rounded-full border-2 transition-transform ${
                    currentDrawing.color === c.value ? 'scale-125 border-white shadow-md' : 'border-stone-800 hover:scale-110'
                  }`}
                  style={{ backgroundColor: c.value }}
                  title={c.name}
                />
              ))}
            </div>
          </div>

          {/* Espessura do Traço */}
          <div className="space-y-1">
            <div className="flex justify-between items-center text-[10px]">
              <span className="font-bold text-stone-400 uppercase tracking-widest">Espessura</span>
              <span className="font-mono text-amber-400 font-bold">{currentDrawing.width}px</span>
            </div>
            <input
              type="range"
              min={2}
              max={24}
              step={1}
              value={currentDrawing.width}
              onChange={(e) => onUpdateDrawing(currentDrawing.id, { width: Number(e.target.value) })}
              className="w-full accent-amber-500 h-1.5 bg-stone-800 rounded-lg cursor-pointer"
            />
          </div>

          {/* Opacidade */}
          <div className="space-y-1">
            <div className="flex justify-between items-center text-[10px]">
              <span className="font-bold text-stone-400 uppercase tracking-widest">Opacidade</span>
              <span className="font-mono text-amber-400 font-bold">{Math.round((currentDrawing.opacity ?? 1) * 100)}%</span>
            </div>
            <input
              type="range"
              min={0.1}
              max={1.0}
              step={0.05}
              value={currentDrawing.opacity ?? 1}
              onChange={(e) => onUpdateDrawing(currentDrawing.id, { opacity: Number(e.target.value) })}
              className="w-full accent-amber-500 h-1.5 bg-stone-800 rounded-lg cursor-pointer"
            />
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 3. PROPRIEDADES DE FORMA                                     */}
      {/* ============================================================ */}
      {currentShape && (
        <div className="space-y-3">
          {/* Rótulo Opcional */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block">
              Rótulo / Nome da Área
            </label>
            <input
              type="text"
              value={currentShape.label || ''}
              onChange={(e) => onUpdateShape(currentShape.id, { label: e.target.value })}
              className="w-full px-2.5 py-1.5 bg-stone-950 border border-stone-800 focus:border-amber-500 rounded text-xs text-amber-200 outline-none font-sans"
              placeholder="Ex: Bola de Fogo (6m)"
            />
          </div>

          {/* Tipo de Forma */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block">
              Tipo de Forma
            </label>
            <div className="grid grid-cols-4 gap-1 bg-stone-950 p-1 rounded border border-stone-800">
              {[
                { id: 'rect', icon: Square, title: 'Retângulo' },
                { id: 'circle', icon: Circle, title: 'Círculo / Raio' },
                { id: 'line', icon: Minus, title: 'Linha' },
                { id: 'arrow', icon: ArrowRight, title: 'Seta' }
              ].map(item => {
                const IconComponent = item.icon;
                const isSelected = currentShape.type === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onUpdateShape(currentShape.id, { type: item.id as ShapeType })}
                    className={`py-1 rounded flex items-center justify-center transition-all ${
                      isSelected
                        ? 'bg-amber-950 border border-amber-500 text-amber-300 shadow-sm'
                        : 'text-stone-400 hover:text-amber-200 hover:bg-stone-900 border border-transparent'
                    }`}
                    title={item.title}
                  >
                    <IconComponent size={14} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Cor da Linha / Borda */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block">
              Cor da Borda
            </label>
            <div className="grid grid-cols-7 gap-1">
              {T20_COLORS.map(c => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => onUpdateShape(currentShape.id, { color: c.value })}
                  className={`w-6 h-6 rounded-full border-2 transition-transform ${
                    currentShape.color === c.value ? 'scale-125 border-white shadow-md' : 'border-stone-800 hover:scale-110'
                  }`}
                  style={{ backgroundColor: c.value }}
                  title={c.name}
                />
              ))}
            </div>
          </div>

          {/* Espessura da Borda */}
          <div className="space-y-1">
            <div className="flex justify-between items-center text-[10px]">
              <span className="font-bold text-stone-400 uppercase tracking-widest">Espessura</span>
              <span className="font-mono text-amber-400 font-bold">{currentShape.strokeWidth}px</span>
            </div>
            <input
              type="range"
              min={1}
              max={16}
              step={1}
              value={currentShape.strokeWidth}
              onChange={(e) => onUpdateShape(currentShape.id, { strokeWidth: Number(e.target.value) })}
              className="w-full accent-amber-500 h-1.5 bg-stone-800 rounded-lg cursor-pointer"
            />
          </div>

          {/* Opacidade */}
          <div className="space-y-1">
            <div className="flex justify-between items-center text-[10px]">
              <span className="font-bold text-stone-400 uppercase tracking-widest">Opacidade</span>
              <span className="font-mono text-amber-400 font-bold">{Math.round((currentShape.opacity ?? 1) * 100)}%</span>
            </div>
            <input
              type="range"
              min={0.1}
              max={1.0}
              step={0.05}
              value={currentShape.opacity ?? 1}
              onChange={(e) => onUpdateShape(currentShape.id, { opacity: Number(e.target.value) })}
              className="w-full accent-amber-500 h-1.5 bg-stone-800 rounded-lg cursor-pointer"
            />
          </div>
        </div>
      )}

      {/* Botão Excluir Objeto */}
      <div className="pt-2 border-t border-amber-900/30">
        <button
          type="button"
          onClick={() => onDeleteObject(selectedObject)}
          className="w-full py-2 px-3 rounded bg-red-950/60 hover:bg-red-900/80 border border-red-800/60 text-red-300 text-[11px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm"
        >
          <Trash2 size={13} />
          <span>Excluir Objeto (Del)</span>
        </button>
      </div>
    </div>
  );
};
