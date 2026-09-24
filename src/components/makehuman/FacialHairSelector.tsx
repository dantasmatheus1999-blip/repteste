import React from 'react';
import { Sparkles, Check, UserCheck, Shield } from 'lucide-react';
import { FACIAL_HAIR_OPTIONS, FacialHairOption } from '../../data/makehuman/hairstyles';
import { GenderType } from '../../data/makehuman/presets';

interface FacialHairSelectorProps {
  gender: GenderType;
  selectedFacialHairId: string;
  onSelectFacialHair: (id: string) => void;
}

export const FacialHairSelector: React.FC<FacialHairSelectorProps> = ({
  gender,
  selectedFacialHairId,
  onSelectFacialHair
}) => {
  if (gender === 'female') {
    return (
      <div className="p-4 rounded-xl bg-[#121118]/60 border border-stone-800/80 text-center space-y-1">
        <p className="text-xs text-stone-400 font-sans">
          Barba e pelos faciais não se aplicam ao preset base feminino.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="font-cinzel text-xs sm:text-sm font-bold text-amber-200 uppercase tracking-wider flex items-center gap-1.5">
          <UserCheck size={14} className="text-amber-400" />
          <span>Barba & Bigode (Pelos Faciais)</span>
        </h4>
        <span className="text-[10px] text-stone-400 font-mono">
          {FACIAL_HAIR_OPTIONS.find(f => f.id === selectedFacialHairId)?.name || 'Selecionar'}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
        {FACIAL_HAIR_OPTIONS.map((option) => {
          const isSelected = selectedFacialHairId === option.id;

          return (
            <button
              key={option.id}
              onClick={() => onSelectFacialHair(option.id)}
              className={`p-2.5 rounded-xl text-left transition-all border cursor-pointer flex flex-col justify-between gap-1 ${
                isSelected
                  ? 'bg-amber-950/40 border-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.2)]'
                  : 'bg-[#121118]/80 hover:bg-[#181622] border-stone-800 hover:border-amber-900/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-cinzel font-bold text-xs text-stone-200">
                  {option.name}
                </span>
                {isSelected && (
                  <span className="w-4 h-4 rounded-full bg-amber-500 text-black flex items-center justify-center">
                    <Check size={10} strokeWidth={3} />
                  </span>
                )}
              </div>

              <p className="text-[10px] text-stone-400 font-sans line-clamp-2">
                {option.description}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
};
