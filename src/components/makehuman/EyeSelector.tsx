import React from 'react';
import { Sparkles, Check, Eye } from 'lucide-react';
import { EYE_COLORS, EyeColorOption } from '../../data/makehuman/presets';

interface EyeSelectorProps {
  selectedEyeColorId: string;
  onSelectEyeColor: (colorId: string) => void;
}

export const EyeSelector: React.FC<EyeSelectorProps> = ({
  selectedEyeColorId,
  onSelectEyeColor
}) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="font-cinzel text-xs sm:text-sm font-bold text-amber-200 uppercase tracking-wider flex items-center gap-1.5">
          <Eye size={14} className="text-sky-400" />
          <span>Cor dos Olhos (Íris PBR & Reflexo)</span>
        </h4>
        <span className="text-[10px] text-stone-400 font-mono">
          {EYE_COLORS.find(e => e.id === selectedEyeColorId)?.name || 'Selecionar'}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
        {EYE_COLORS.map((color) => {
          const isSelected = selectedEyeColorId === color.id;

          return (
            <button
              key={color.id}
              onClick={() => onSelectEyeColor(color.id)}
              className={`p-2.5 rounded-xl flex flex-col items-center gap-1.5 border transition-all cursor-pointer group relative ${
                isSelected
                  ? 'bg-amber-950/50 border-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.25)]'
                  : 'bg-[#121118]/80 hover:bg-[#191724] border-stone-800'
              }`}
              title={color.description}
            >
              <div 
                className="w-8 h-8 rounded-full border-2 border-white/30 shadow-md relative flex items-center justify-center transition-transform group-hover:scale-105"
                style={{ backgroundColor: color.hex }}
              >
                {isSelected && (
                  <Check size={14} className="text-white drop-shadow-md" strokeWidth={3} />
                )}
              </div>
              <span className="text-[10px] font-sans font-medium text-stone-300 text-center truncate w-full">
                {color.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
