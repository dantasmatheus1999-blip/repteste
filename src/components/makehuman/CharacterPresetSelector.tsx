import React from 'react';
import { 
  Sparkles, 
  Shield, 
  Flame, 
  Compass, 
  Crown, 
  Wand2, 
  Check, 
  User 
} from 'lucide-react';
import { 
  CharacterPreset, 
  CHARACTER_PRESETS, 
  GenderType 
} from '../../data/makehuman/presets';

interface CharacterPresetSelectorProps {
  gender: GenderType;
  selectedPresetId: string | null;
  onSelectPreset: (preset: CharacterPreset) => void;
}

export const CharacterPresetSelector: React.FC<CharacterPresetSelectorProps> = ({
  gender,
  selectedPresetId,
  onSelectPreset
}) => {
  const filteredPresets = CHARACTER_PRESETS.filter(p => p.gender === gender);

  const getBadgeIcon = (archetype: string) => {
    switch (archetype.toLowerCase()) {
      case 'combatente':
      case 'guerreiro':
        return <Shield size={12} className="text-amber-400" />;
      case 'guardião':
      case 'paladino':
        return <Crown size={12} className="text-amber-300" />;
      case 'conjuradora':
      case 'arcanista':
      case 'místico':
        return <Wand2 size={12} className="text-indigo-400" />;
      case 'bárbaro':
        return <Flame size={12} className="text-rose-400" />;
      default:
        return <Compass size={12} className="text-emerald-400" />;
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="font-cinzel text-xs sm:text-sm font-bold text-amber-200 uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles size={14} className="text-amber-400" />
          <span>Presets de Aparência ({gender === 'male' ? 'Masculinos' : 'Femininos'})</span>
        </h4>
        <span className="text-[10px] text-stone-400 font-mono">
          {filteredPresets.length} arquétipos
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {filteredPresets.map((preset) => {
          const isSelected = selectedPresetId === preset.id;

          return (
            <button
              key={preset.id}
              onClick={() => onSelectPreset(preset)}
              className={`p-3 rounded-xl text-left transition-all duration-200 border cursor-pointer relative overflow-hidden group flex flex-col justify-between gap-2 ${
                isSelected
                  ? 'bg-gradient-to-br from-amber-950/60 via-[#181422] to-[#121018] border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                  : 'bg-[#121118]/80 hover:bg-[#191724] border-stone-800/80 hover:border-amber-900/50'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className="font-cinzel font-bold text-xs sm:text-sm text-stone-200 group-hover:text-amber-200 transition-colors">
                      {preset.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] font-mono text-stone-400">
                    {getBadgeIcon(preset.archetype)}
                    <span>{preset.archetype}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <span className="text-[9px] px-1.5 py-0.5 rounded font-mono font-bold uppercase bg-black/50 text-amber-300/90 border border-amber-900/40">
                    {preset.badge}
                  </span>
                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-amber-500 text-black flex items-center justify-center shadow-md">
                      <Check size={12} strokeWidth={3} />
                    </div>
                  )}
                </div>
              </div>

              <p className="text-[11px] text-stone-400 font-sans line-clamp-2 leading-relaxed">
                {preset.description}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
};
