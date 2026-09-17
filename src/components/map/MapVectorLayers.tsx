import React, { useState, useRef } from 'react';
import { MapDrawing, MapShape, SelectedObject, ToolType } from './types';
import { NATIVE_MAP_WIDTH, NATIVE_MAP_HEIGHT } from './fogUtils';

interface MapVectorLayersProps {
  drawings: MapDrawing[];
  shapes: MapShape[];
  selectedObject: SelectedObject | null;
  onSelectObject: (obj: SelectedObject | null) => void;
  onDeleteObject: (obj: SelectedObject) => void;
  onUpdateShape: (shapeId: string, updates: Partial<MapShape>) => void;
  onUpdateDrawing: (drawingId: string, updates: Partial<MapDrawing>) => void;
  activeTool: ToolType;
  isReadOnly?: boolean;
}

export const MapVectorLayers: React.FC<MapVectorLayersProps> = ({
  drawings,
  shapes,
  selectedObject,
  onSelectObject,
  onDeleteObject,
  onUpdateShape,
  onUpdateDrawing,
  activeTool,
  isReadOnly = false
}) => {
  // Estado local de arraste de objeto selecionado (para 0 writes durante o movimento)
  const [dragOffset, setDragOffset] = useState<{ id: string; dx: number; dy: number } | null>(null);
  const dragRef = useRef<{ startX: number; startY: number; obj: SelectedObject } | null>(null);

  // Manipulador de início de arraste para objeto vetorial selecionado
  const handleStartDrag = (e: React.PointerEvent, obj: SelectedObject) => {
    if (isReadOnly) return;
    if (activeTool === 'eraser') {
      e.stopPropagation();
      onDeleteObject(obj);
      return;
    }
    if (activeTool !== 'select') return;

    e.stopPropagation();
    onSelectObject(obj);

    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      obj
    };

    const container = (e.currentTarget.closest('#map-transform-layer') as HTMLElement);
    const rect = container?.getBoundingClientRect();
    const scale = rect ? rect.width / NATIVE_MAP_WIDTH : 1;

    let totalDx = 0;
    let totalDy = 0;

    const handlePointerMove = (moveEv: PointerEvent) => {
      if (!dragRef.current) return;
      const clientDx = moveEv.clientX - dragRef.current.startX;
      const clientDy = moveEv.clientY - dragRef.current.startY;
      totalDx = clientDx / scale;
      totalDy = clientDy / scale;

      setDragOffset({
        id: obj.id,
        dx: totalDx,
        dy: totalDy
      });
    };

    const handlePointerUp = () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);

      if (dragRef.current && (Math.abs(totalDx) > 1 || Math.abs(totalDy) > 1)) {
        if (obj.type === 'shape') {
          const target = shapes.find(s => s.id === obj.id);
          if (target) {
            onUpdateShape(obj.id, {
              start: { x: target.start.x + totalDx, y: target.start.y + totalDy },
              end: { x: target.end.x + totalDx, y: target.end.y + totalDy }
            });
          }
        } else if (obj.type === 'drawing') {
          const target = drawings.find(d => d.id === obj.id);
          if (target) {
            onUpdateDrawing(obj.id, {
              points: target.points.map(pt => ({
                x: pt.x + totalDx,
                y: pt.y + totalDy
              }))
            });
          }
        }
      }

      dragRef.current = null;
      setDragOffset(null);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  return (
    <svg
      id="map-vector-layers-svg"
      className="absolute inset-0 w-full h-full pointer-events-none z-18 overflow-visible"
      width={NATIVE_MAP_WIDTH}
      height={NATIVE_MAP_HEIGHT}
      viewBox={`0 0 ${NATIVE_MAP_WIDTH} ${NATIVE_MAP_HEIGHT}`}
    >
      <defs>
        {/* Marcadores de Seta para Shapes */}
        <marker
          id="shape-arrow-head"
          viewBox="0 0 10 10"
          refX="7"
          refY="5"
          markerWidth="7"
          markerHeight="7"
          orient="auto-start-reverse"
        >
          <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="currentColor" />
        </marker>
        <marker
          id="shape-arrow-head-amber"
          viewBox="0 0 10 10"
          refX="7"
          refY="5"
          markerWidth="7"
          markerHeight="7"
          orient="auto-start-reverse"
        >
          <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#f59e0b" />
        </marker>
      </defs>

      {/* ============================================================ */}
      {/* 1. CAMADA DE DESENHOS LIVRES                                 */}
      {/* ============================================================ */}
      {drawings.map(d => {
        const isSelected = selectedObject?.id === d.id && selectedObject?.type === 'drawing';
        const isDragging = dragOffset?.id === d.id;
        const dx = isDragging ? dragOffset.dx : 0;
        const dy = isDragging ? dragOffset.dy : 0;

        if (d.points.length < 2) return null;

        const pathData = d.points.reduce((acc, pt, idx) => {
          const px = pt.x + dx;
          const py = pt.y + dy;
          return idx === 0 ? `M ${px} ${py}` : `${acc} L ${px} ${py}`;
        }, '');

        return (
          <g 
            key={d.id} 
            id={`drawing-group-${d.id}`}
            className={activeTool === 'select' || activeTool === 'eraser' ? 'pointer-events-auto cursor-pointer' : 'pointer-events-none'}
            onPointerDown={(e) => handleStartDrag(e, { id: d.id, type: 'drawing' })}
          >
            {/* Traço de Destaque quando Selecionado */}
            {isSelected && (
              <path
                d={pathData}
                fill="none"
                stroke="#38bdf8"
                strokeWidth={d.width + 8}
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity={0.6}
                strokeDasharray="6 4"
                className="animate-pulse"
              />
            )}

            {/* Linha Invisível mais Larga para Facilitar Clique/Hover */}
            <path
              d={pathData}
              fill="none"
              stroke="transparent"
              strokeWidth={Math.max(d.width + 16, 24)}
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Traço Principal do Desenho */}
            <path
              d={pathData}
              fill="none"
              stroke={d.color || '#f59e0b'}
              strokeWidth={d.width || 4}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={d.opacity ?? 1}
              className="transition-opacity"
            />
          </g>
        );
      })}

      {/* ============================================================ */}
      {/* 2. CAMADA DE FORMAS GEOMÉTRICAS                             */}
      {/* ============================================================ */}
      {shapes.map(s => {
        const isSelected = selectedObject?.id === s.id && selectedObject?.type === 'shape';
        const isDragging = dragOffset?.id === s.id;
        const dx = isDragging ? dragOffset.dx : 0;
        const dy = isDragging ? dragOffset.dy : 0;

        const x1 = s.start.x + dx;
        const y1 = s.start.y + dy;
        const x2 = s.end.x + dx;
        const y2 = s.end.y + dy;

        const minX = Math.min(x1, x2);
        const minY = Math.min(y1, y2);
        const width = Math.abs(x2 - x1);
        const height = Math.abs(y2 - y1);
        const centerX = (x1 + x2) / 2;
        const centerY = (y1 + y2) / 2;
        const radiusX = width / 2;
        const radiusY = height / 2;

        return (
          <g
            key={s.id}
            id={`shape-group-${s.id}`}
            className={activeTool === 'select' || activeTool === 'eraser' ? 'pointer-events-auto cursor-pointer' : 'pointer-events-none'}
            onPointerDown={(e) => handleStartDrag(e, { id: s.id, type: 'shape' })}
          >
            {/* RETÂNGULO */}
            {s.type === 'rect' && (
              <>
                <rect
                  x={minX}
                  y={minY}
                  width={Math.max(width, 2)}
                  height={Math.max(height, 2)}
                  fill={s.fillColor || 'rgba(245, 158, 11, 0.15)'}
                  stroke={s.color || '#f59e0b'}
                  strokeWidth={s.strokeWidth || 3}
                  opacity={s.opacity ?? 1}
                  rx="4"
                />
                {isSelected && (
                  <rect
                    x={minX - 4}
                    y={minY - 4}
                    width={width + 8}
                    height={height + 8}
                    fill="none"
                    stroke="#38bdf8"
                    strokeWidth="2"
                    strokeDasharray="6 4"
                    className="animate-pulse"
                  />
                )}
              </>
            )}

            {/* CÍRCULO / ELIPSE (ÁREA DE EFEITO) */}
            {s.type === 'circle' && (
              <>
                <ellipse
                  cx={centerX}
                  cy={centerY}
                  rx={Math.max(radiusX, 2)}
                  ry={Math.max(radiusY, 2)}
                  fill={s.fillColor || 'rgba(239, 68, 68, 0.2)'}
                  stroke={s.color || '#ef4444'}
                  strokeWidth={s.strokeWidth || 3}
                  opacity={s.opacity ?? 1}
                />
                {isSelected && (
                  <ellipse
                    cx={centerX}
                    cy={centerY}
                    rx={radiusX + 4}
                    ry={radiusY + 4}
                    fill="none"
                    stroke="#38bdf8"
                    strokeWidth="2"
                    strokeDasharray="6 4"
                    className="animate-pulse"
                  />
                )}
              </>
            )}

            {/* LINHA */}
            {s.type === 'line' && (
              <>
                {/* Linha grossa transparente para hit test */}
                <line
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="transparent"
                  strokeWidth={Math.max(s.strokeWidth + 16, 24)}
                />
                <line
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={s.color || '#f59e0b'}
                  strokeWidth={s.strokeWidth || 3}
                  opacity={s.opacity ?? 1}
                  strokeLinecap="round"
                />
                {isSelected && (
                  <line
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke="#38bdf8"
                    strokeWidth={s.strokeWidth + 6}
                    opacity={0.6}
                    strokeDasharray="6 4"
                    className="animate-pulse"
                  />
                )}
              </>
            )}

            {/* SETA */}
            {s.type === 'arrow' && (
              <>
                <line
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="transparent"
                  strokeWidth={Math.max(s.strokeWidth + 16, 24)}
                />
                <line
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={s.color || '#f59e0b'}
                  strokeWidth={s.strokeWidth || 3}
                  opacity={s.opacity ?? 1}
                  strokeLinecap="round"
                  markerEnd="url(#shape-arrow-head-amber)"
                />
                {isSelected && (
                  <line
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke="#38bdf8"
                    strokeWidth={s.strokeWidth + 6}
                    opacity={0.6}
                    strokeDasharray="6 4"
                    className="animate-pulse"
                  />
                )}
              </>
            )}

            {/* Rótulo / Label da Forma (se houver) */}
            {s.label && (
              <text
                x={centerX}
                y={minY - 8}
                textAnchor="middle"
                fill="#fde68a"
                fontSize="14"
                fontFamily="Cinzel, serif"
                fontWeight="bold"
                className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] select-none pointer-events-none"
              >
                {s.label}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
};
