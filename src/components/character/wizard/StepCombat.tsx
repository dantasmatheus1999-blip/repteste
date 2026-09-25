import React from 'react';
import { Shield, Heart, Zap, Footprints } from 'lucide-react';
import { WizardData } from './types';
import { T20_ARMORS, T20_SHIELDS } from '../../../data/t20Equipment';

interface StepCombatProps {
  data: WizardData;
  onChange: (updates: Partial<WizardData>) => void;
}

export const StepCombat: React.FC<StepCombatProps> = ({ data, onChange }) => {
  const desMod = data.attrModifiers.DES || 0;
  const isHeavyArmor = data.armor?.type === 'pesada';
  const effectiveDexBonus = isHeavyArmor ? 0 : desMod;
  const armorBonus = data.armor?.defenseBonus || 0;
  const shieldBonus = data.shield?.defenseBonus || 0;
  const calculatedDefense = 10 + effectiveDexBonus + armorBonus + shieldBonus;

  const handleArmorChange = (armorId: string) => {
    if (armorId === 'nenhuma') {
      const newDef = 10 + desMod + shieldBonus;
      onChange({
        armor: { name: 'Nenhuma', defenseBonus: 0, penalty: 0, type: 'nenhuma' },
        defense: newDef
      });
      return;
    }

    const found = T20_ARMORS.find((a) => a.id === armorId);
    if (found) {
      const isHeavy = found.type === 'pesada';
      const def = 10 + (isHeavy ? 0 : desMod) + found.defenseBonus + shieldBonus;
      onChange({
        armor: {
          id: found.id,
          name: found.name,
          defenseBonus: found.defenseBonus,
          penalty: found.penalty,
          type: found.type
        },
        defense: def
      });
    }
  };

  const handleShieldChange = (shieldId: string) => {
    if (shieldId === 'nenhum') {
      const newDef = 10 + effectiveDexBonus + armorBonus;
      onChange({
        shield: { name: 'Nenhum', defenseBonus: 0, penalty: 0 },
        defense: newDef
      });
      return;
    }

    const found = T20_SHIELDS.find((s) => s.id === shieldId);
    if (found) {
      const def = 10 + effectiveDexBonus + armorBonus + found.defenseBonus;
      onChange({
        shield: {
          id: found.id,
          name: found.name,
          defenseBonus: found.defenseBonus,
          penalty: found.penalty
        },
        defense: def
      });
    }
  };

  return (
    <div className="w-full space-y-4 max-w-xl mx-auto flex flex-col h-full justify-between">
      {/* 4 Core Hero Stats Badges in a grid - Individual cards maintain their backgrounds */}
      <div className="grid grid-cols-4 gap-2">
        <div className="bg-[#0e1219]/90 border border-red-900/40 rounded-xl p-2.5 text-center shadow">
          <Heart className="w-4 h-4 text-red-400 mx-auto mb-1 fill-red-400/30" />
          <span className="text-[10px] text-stone-400 block uppercase font-bold">PV Máx</span>
          <span className="text-lg font-cinzel font-bold text-red-300">{data.hpMax}</span>
        </div>

        <div className="bg-[#0e1219]/90 border border-blue-900/40 rounded-xl p-2.5 text-center shadow">
          <Zap className="w-4 h-4 text-blue-400 mx-auto mb-1 fill-blue-400/30" />
          <span className="text-[10px] text-stone-400 block uppercase font-bold">PM Máx</span>
          <span className="text-lg font-cinzel font-bold text-blue-300">{data.manaMax}</span>
        </div>

        <div className="bg-[#0e1219]/90 border border-amber-600/50 rounded-xl p-2.5 text-center shadow ring-1 ring-amber-500/40">
          <Shield className="w-4 h-4 text-amber-400 mx-auto mb-1 fill-amber-400/30" />
          <span className="text-[10px] text-amber-400 block uppercase font-bold">Defesa</span>
          <span className="text-lg font-cinzel font-bold text-amber-200">{calculatedDefense}</span>
        </div>

        <div className="bg-[#0e1219]/90 border border-emerald-900/40 rounded-xl p-2.5 text-center shadow">
          <Footprints className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
          <span className="text-[10px] text-stone-400 block uppercase font-bold">Desloc.</span>
          <span className="text-lg font-cinzel font-bold text-emerald-300">{data.movement || '9m'}</span>
        </div>
      </div>

      {/* Equipment Selection Area - Transparent container */}
      <div className="space-y-4 flex-1 overflow-y-auto pr-0.5 custom-scrollbar min-h-0">
        {/* Armor Section - No outer background container */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-300 font-cinzel flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-amber-400" />
              Armadura Equipada
            </span>
            <span className="text-[11px] text-amber-400/90 font-mono">
              Bônus: +{armorBonus}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleArmorChange('nenhuma')}
              className={`p-2 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                (!data.armor?.id || data.armor.name === 'Nenhuma')
                  ? 'bg-amber-950/70 border-amber-400 text-amber-200 font-bold ring-1 ring-amber-500/50'
                  : 'bg-[#0f121a]/90 border-stone-800/80 text-stone-400 hover:text-stone-200 hover:border-stone-700'
              }`}
            >
              <span>Nenhuma (Sem Armadura)</span>
            </button>

            {T20_ARMORS.map((arm) => {
              const isSelected = data.armor?.id === arm.id;
              return (
                <button
                  key={arm.id}
                  type="button"
                  onClick={() => handleArmorChange(arm.id)}
                  className={`p-2 rounded-xl border text-left text-xs transition-all flex items-center justify-between cursor-pointer ${
                    isSelected
                      ? 'bg-amber-950/70 border-amber-400 text-amber-200 font-bold ring-1 ring-amber-500/50'
                      : 'bg-[#0f121a]/90 border-stone-800/80 text-stone-400 hover:text-stone-200 hover:border-stone-700'
                  }`}
                >
                  <div className="truncate">
                    <span className="block truncate">{arm.name}</span>
                    <span className="text-[10px] text-stone-500 capitalize">{arm.type}</span>
                  </div>
                  <span className="text-[11px] font-mono text-amber-400 ml-1 shrink-0">
                    +{arm.defenseBonus}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Shield Section - No outer background container */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-300 font-cinzel flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-amber-400" />
              Escudo Equipado
            </span>
            <span className="text-[11px] text-amber-400/90 font-mono">
              Bônus: +{shieldBonus}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleShieldChange('nenhum')}
              className={`p-2 rounded-xl border text-center text-xs transition-all cursor-pointer ${
                (!data.shield?.id || data.shield.name === 'Nenhum')
                  ? 'bg-amber-950/70 border-amber-400 text-amber-200 font-bold ring-1 ring-amber-500/50'
                  : 'bg-[#0f121a]/90 border-stone-800/80 text-stone-400 hover:text-stone-200 hover:border-stone-700'
              }`}
            >
              <span>Nenhum</span>
            </button>

            {T20_SHIELDS.map((shd) => {
              const isSelected = data.shield?.id === shd.id;
              return (
                <button
                  key={shd.id}
                  type="button"
                  onClick={() => handleShieldChange(shd.id)}
                  className={`p-2 rounded-xl border text-center text-xs transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-amber-950/70 border-amber-400 text-amber-200 font-bold ring-1 ring-amber-500/50'
                      : 'bg-[#0f121a]/90 border-stone-800/80 text-stone-400 hover:text-stone-200 hover:border-stone-700'
                  }`}
                >
                  <span className="block truncate">{shd.name}</span>
                  <span className="text-[10px] font-mono text-amber-400">+{shd.defenseBonus} Def</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Defense Formula Footer - Directly over background */}
      <div className="text-[11px] text-stone-400 border-t border-amber-900/30 pt-2 text-center">
        Defesa Total = 10 + Destreza ({effectiveDexBonus >= 0 ? `+${effectiveDexBonus}` : effectiveDexBonus}) + Armadura (+{armorBonus}) + Escudo (+{shieldBonus}) = <strong className="text-amber-300 font-cinzel">{calculatedDefense}</strong>
      </div>
    </div>
  );
};
