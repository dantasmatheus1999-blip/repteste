import React, { useState, useRef } from 'react';
import { 
  MapPin, 
  Sword, 
  Skull, 
  Shield, 
  Star, 
  Package
} from 'lucide-react';
import { MapMarker } from './types';

interface MapMarkersProps {
  markers: MapMarker[];
  selectedMarkerId: string | null;
  onSelectMarker: (markerId: string | null) => void;
  onUpdateMarkerPosition: (markerId: string, x: number, y: number) => void;
  isInteractive: boolean;
}

export const MapMarkers: React.FC<MapMarkersProps> = ({
  markers,
  selectedMarkerId,
  onSelectMarker,
  onUpdateMarkerPosition,
  isInteractive
}) => {
  const [dragState, setDragState] = useState<{ id: string; x: number; y: number } | null>(null);
  const lastPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const getMarkerIcon = (iconType: MapMarker['icon']) => {
    switch (iconType) {
      case 'sword': return Sword;
      case 'skull': return Skull;
      case 'shield': return Shield;
      case 'star': return Star;
      case 'chest': return Package;
      case 'pin':
      default:
        return MapPin;
    }
  };

  const handlePointerDown = (e: React.PointerEvent, marker: MapMarker) => {
    if (!isInteractive) return;
    e.stopPropagation();
    onSelectMarker(marker.id);

    const startX = e.clientX;
    const startY = e.clientY;
    const initialMarkerX = marker.x;
    const initialMarkerY = marker.y;
    lastPosRef.current = { x: initialMarkerX, y: initialMarkerY };

    // Obter dimensões do contêiner do mapa (pai relativo)
    const mapContainer = (e.currentTarget.parentElement as HTMLElement);
    if (!mapContainer) return;
    const rect = mapContainer.getBoundingClientRect();

    const handlePointerMove = (moveEvent: PointerEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;

      // Calcular nova porcentagem relativa ao contêiner
      const deltaPercentX = (deltaX / rect.width) * 100;
      const deltaPercentY = (deltaY / rect.height) * 100;

      const newX = Math.max(1, Math.min(99, initialMarkerX + deltaPercentX));
      const newY = Math.max(1, Math.min(99, initialMarkerY + deltaPercentY));
      const roundedX = Math.round(newX * 10) / 10;
      const roundedY = Math.round(newY * 10) / 10;

      lastPosRef.current = { x: roundedX, y: roundedY };
      // Renderização local fluida sem disparar requisições ao Firestore durante o movimento
      setDragState({ id: marker.id, x: roundedX, y: roundedY });
    };

    const handlePointerUp = () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      setDragState(null);
      // Persiste a posição final no Firestore uma única vez ao soltar
      onUpdateMarkerPosition(marker.id, lastPosRef.current.x, lastPosRef.current.y);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  return (
    <div className="absolute inset-0 pointer-events-none z-20">
      {markers.map((marker) => {
        const isSelected = selectedMarkerId === marker.id;
        const Icon = getMarkerIcon(marker.icon);
        const posX = (dragState && dragState.id === marker.id) ? dragState.x : marker.x;
        const posY = (dragState && dragState.id === marker.id) ? dragState.y : marker.y;

        return (
          <div
            key={marker.id}
            id={`map-marker-${marker.id}`}
            style={{
              left: `${posX}%`,
              top: `${posY}%`,
              transform: 'translate(-50%, -100%)'
            }}
            onPointerDown={(e) => handlePointerDown(e, marker)}
            className={`absolute pointer-events-auto cursor-grab active:cursor-grabbing transition-transform duration-75 select-none ${
              isSelected ? 'scale-125 z-30' : 'hover:scale-110 z-10'
            }`}
          >
            {/* Visual do Marcador */}
            <div className="relative flex flex-col items-center group">
              {/* Badge Icon */}
              <div 
                className={`w-8 h-8 rounded-full flex items-center justify-center text-stone-950 font-bold shadow-lg border-2 transition-all ${
                  isSelected 
                    ? 'border-white ring-4 ring-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.8)]' 
                    : 'border-stone-950 shadow-md'
                }`}
                style={{ backgroundColor: marker.color || '#f59e0b' }}
              >
                <Icon size={16} className="text-stone-950 stroke-[2.4]" />
              </div>

              {/* Ponteiro inferior */}
              <div 
                className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[6px]"
                style={{ borderTopColor: marker.color || '#f59e0b' }}
              />

              {/* Rótulo / Nomeplate do Marcador */}
              <div 
                className={`mt-1 px-2 py-0.5 rounded text-[11px] font-cinzel font-bold tracking-wide whitespace-nowrap border shadow-md pointer-events-none transition-opacity ${
                  isSelected 
                    ? 'bg-stone-950/95 text-amber-300 border-amber-500/80 opacity-100' 
                    : 'bg-stone-950/85 text-stone-200 border-stone-800 opacity-90 group-hover:opacity-100'
                }`}
              >
                {marker.label}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
