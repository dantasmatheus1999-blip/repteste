import React from 'react';
import { Sparkles, Check, User, Activity } from 'lucide-react';
import { 
  SKIN_TONES, 
  BODY_PRESETS, 
  SkinToneOption, 
  BodyProportionPreset 
} from '../../data/makehuman/presets';

interface SkinSelectorProps {
  selectedSkinToneId: string;
  selectedBodyPresetId: string;
  onSelectSkinTone: (toneId: string) => void;
  onSelectBodyPreset: (presetId: string) => void;
}

export const SkinSelector: React.FC<SkinSelectorProps> = ({
  selectedSkinToneId,
  selectedBodyPresetId,
  onSelectSkinTone,
  onSelectBodyPreset
}) => {
  return (
    <div className="space-y-4">
      {/* 1. Tons de Pele */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="font-cinzel text-xs sm:text-sm font-bold text-amber-200 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles size={14} className="text-amber-400" />
            <span>Tom de Pele (PBR Melanina & Warmth)</span>
          </h4>
          <span className="text-[10px] text-stone-400 font-mono">
            {SKIN_TONES.find(s => s.id === selectedSkinToneId)?.name || 'Selecionar'}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
          {SKIN_TONES.map((tone) => {
            const isSelected = selectedSkinToneId === tone.id;

            return (
              <button
                key={tone.id}
                onClick={() => onSelectSkinTone(tone.id)}
                className={`p-2.5 rounded-xl flex flex-col items-center gap-1.5 border transition-all cursor-pointer group relative ${
                  isSelected
                    ? 'bg-amber-950/50 border-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.25)]'
                    : 'bg-[#121118]/80 hover:bg-[#191724] border-stone-800'
                }`}
                title={tone.description}
              >
                <div 
                  className="w-8 h-8 rounded-full border-2 border-white/20 shadow-md relative flex items-center justify-center transition-transform group-hover:scale-105"
                  style={{ backgroundColor: tone.hex }}
                >
                  {isSelected && (
                    <Check size={14} className={tone.id === 'pale_nordic' || tone.id === 'fair_light' ? 'text-black' : 'text-white'} strokeWidth={3} />
                  )}
                </div>
                <span className="text-[10px] font-sans font-medium text-stone-300 text-center truncate w-full">
                  {tone.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Proporções Corporais MakeHuman */}
      <div className="space-y-2 pt-2 border-t border-amber-900/20">
        <div className="flex items-center justify-between">
          <h4 className="font-cinzel text-xs sm:text-sm font-bold text-amber-200 uppercase tracking-wider flex items-center gap-1.5">
            <Activity size={14} className="text-amber-400" />
            <span>Estrutura Corporal & Proporções</span>
          </h4>
          <span className="text-[10px] text-stone-400 font-mono">
            {BODY_PRESETS.length} biotipos anatômicos
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
          {BODY_PRESETS.map((preset) => {
            const isSelected = selectedBodyPresetId === preset.id;

            return (
              <button
                key={preset.id}
                onClick={() => onSelectBodyPreset(preset.id)}
                className={`p-2.5 rounded-xl text-left transition-all border cursor-pointer flex flex-col justify-between gap-1 ${
                  isSelected
                    ? 'bg-amber-950/40 border-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.2)]'
                    : 'bg-[#121118]/80 hover:bg-[#181622] border-stone-800 hover:border-amber-900/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-cinzel font-bold text-xs text-stone-200">
                    {preset.name}
                  </span>
                  {isSelected && (
                    <span className="w-4 h-4 rounded-full bg-amber-500 text-black flex items-center justify-center">
                      <Check size={10} strokeWidth={3} />
                    </span>
                  )}
                </div>

                <p className="text-[10px] text-stone-400 font-sans line-clamp-2">
                  {preset.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
