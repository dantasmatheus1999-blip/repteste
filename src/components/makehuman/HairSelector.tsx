import React from 'react';
import { Sparkles, Check, Scissors } from 'lucide-react';
import { 
  HAIR_STYLES, 
  HAIR_COLORS, 
  HairStyleOption, 
  HairColorOption 
} from '../../data/makehuman/hairstyles';

interface HairSelectorProps {
  selectedHairStyleId: string;
  selectedHairColorId: string;
  onSelectHairStyle: (styleId: string) => void;
  onSelectHairColor: (colorId: string) => void;
}

export const HairSelector: React.FC<HairSelectorProps> = ({
  selectedHairStyleId,
  selectedHairColorId,
  onSelectHairStyle,
  onSelectHairColor
}) => {
  return (
    <div className="space-y-4">
      {/* 1. Estilos de Cabelo */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="font-cinzel text-xs sm:text-sm font-bold text-amber-200 uppercase tracking-wider flex items-center gap-1.5">
            <Scissors size={14} className="text-amber-400" />
            <span>Estilo de Cabelo (Hair Layer)</span>
          </h4>
          <span className="text-[10px] text-stone-400 font-mono">
            {HAIR_STYLES.length} opções disponíveis
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {HAIR_STYLES.map((style) => {
            const isSelected = selectedHairStyleId === style.id;

            return (
              <button
                key={style.id}
                onClick={() => onSelectHairStyle(style.id)}
                className={`p-2.5 rounded-xl text-left transition-all duration-200 border cursor-pointer relative flex flex-col justify-between gap-1.5 ${
                  isSelected
                    ? 'bg-amber-950/40 border-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.2)]'
                    : 'bg-[#121118]/80 hover:bg-[#181622] border-stone-800/80 hover:border-amber-900/50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <span className="font-cinzel font-bold text-xs text-stone-200">
                    {style.name}
                  </span>
                  {isSelected ? (
                    <span className="w-4 h-4 rounded-full bg-amber-500 text-black flex items-center justify-center">
                      <Check size={10} strokeWidth={3} />
                    </span>
                  ) : style.badge ? (
                    <span className="text-[9px] px-1 py-0.2 rounded bg-black/50 text-stone-400 font-mono">
                      {style.badge}
                    </span>
                  ) : null}
                </div>

                <p className="text-[10px] text-stone-400 font-sans line-clamp-2">
                  {style.description}
                </p>

                <div className="text-[9px] font-mono text-amber-400/80 pt-0.5 border-t border-white/5 flex justify-between">
                  <span>Geometria:</span>
                  <span>{style.polyEstimate}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Cores do Cabelo (Somente visível quando não é careca) */}
      {selectedHairStyleId !== 'none' && (
        <div className="space-y-2 pt-2 border-t border-amber-900/20">
          <div className="flex items-center justify-between">
            <h4 className="font-cinzel text-xs sm:text-sm font-bold text-amber-200 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles size={14} className="text-amber-400" />
              <span>Cor do Cabelo</span>
            </h4>
            <span className="text-[10px] text-stone-400 font-mono">
              {HAIR_COLORS.find(c => c.id === selectedHairColorId)?.name || 'Selecionar'}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
            {HAIR_COLORS.map((color) => {
              const isSelected = selectedHairColorId === color.id;

              return (
                <button
                  key={color.id}
                  onClick={() => onSelectHairColor(color.id)}
                  className={`p-2 rounded-xl flex flex-col items-center gap-1.5 border transition-all cursor-pointer group relative ${
                    isSelected
                      ? 'bg-amber-950/50 border-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.25)]'
                      : 'bg-[#121118]/80 hover:bg-[#191724] border-stone-800'
                  }`}
                  title={color.description}
                >
                  <div 
                    className="w-7 h-7 rounded-full border-2 border-white/20 shadow-md relative flex items-center justify-center transition-transform group-hover:scale-105"
                    style={{ backgroundColor: color.hex }}
                  >
                    {isSelected && (
                      <Check size={14} className={color.id === 'white' || color.id === 'blonde' ? 'text-black' : 'text-white'} strokeWidth={3} />
                    )}
                  </div>
                  <span className="text-[10px] font-sans font-medium text-stone-300 text-center truncate w-full">
                    {color.name.split(' ')[0]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
