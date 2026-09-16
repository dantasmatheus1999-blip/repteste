import React from 'react';
import { Swords, Plus, Trash2, Crosshair } from 'lucide-react';
import { WizardData } from './types';
import { CharacterAttack } from '../../../types/character';
import { T20_WEAPONS } from '../../../data/t20Equipment';

interface StepAttacksProps {
  data: WizardData;
  onChange: (updates: Partial<WizardData>) => void;
}

export const StepAttacks: React.FC<StepAttacksProps> = ({ data, onChange }) => {
  const forMod = data.attrModifiers.FOR || 0;
  const desMod = data.attrModifiers.DES || 0;
  const halfLevel = Math.floor(data.level / 2);
  const trainingBonus = data.level >= 15 ? 6 : data.level >= 7 ? 4 : 2;

  const isTrainedLuta = data.trainedSkills.includes('luta');
  const isTrainedPontaria = data.trainedSkills.includes('pontaria');

  const defaultMeleeBonus = halfLevel + forMod + (isTrainedLuta ? trainingBonus : 0);
  const defaultRangedBonus = halfLevel + desMod + (isTrainedPontaria ? trainingBonus : 0);

  const addPredefinedWeapon = (weaponId: string) => {
    const weapon = T20_WEAPONS.find((w) => w.id === weaponId);
    if (!weapon) return;

    const isRanged = weapon.type === 'distancia';
    const bonus = isRanged ? defaultRangedBonus : defaultMeleeBonus;
    const bonusStr = bonus >= 0 ? `+${bonus}` : `${bonus}`;

    const attrDanoMod = weapon.attrDano === 'FOR' ? forMod : weapon.attrDano === 'DES' ? desMod : 0;
    const damageWithAttr = attrDanoMod !== 0
      ? `${weapon.damage}${attrDanoMod > 0 ? `+${attrDanoMod}` : `${attrDanoMod}`}`
      : weapon.damage;

    const newAttack: CharacterAttack = {
      id: `atk-${Date.now()}-${weapon.id}`,
      name: weapon.name,
      attackTest: bonusStr,
      damage: damageWithAttr,
      crit: weapon.crit,
      type: weapon.properties[0] || (isRanged ? 'Perfuração' : 'Corte'),
      range: weapon.range === '-' ? 'Corpo a corpo' : weapon.range
    };

    onChange({ attacks: [...data.attacks, newAttack] });
  };

  const removeAttack = (id: string) => {
    onChange({ attacks: data.attacks.filter((a) => a.id !== id) });
  };

  const addEmptyAttack = () => {
    const newAttack: CharacterAttack = {
      id: `atk-${Date.now()}`,
      name: 'Novo Ataque',
      attackTest: defaultMeleeBonus >= 0 ? `+${defaultMeleeBonus}` : `${defaultMeleeBonus}`,
      damage: `1d6${forMod !== 0 ? (forMod > 0 ? `+${forMod}` : `${forMod}`) : ''}`,
      crit: '20/x2',
      type: 'Impacto',
      range: 'Corpo a corpo'
    };
    onChange({ attacks: [...data.attacks, newAttack] });
  };

  return (
    <div className="w-full space-y-3 max-w-xl mx-auto flex flex-col h-full justify-between">
      {/* Quick Add Weapons Chips */}
      <div className="bg-stone-900/80 border border-amber-900/40 rounded-xl p-2.5 space-y-2 shadow-md">
        <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block">
          Adicionar Armas Populares de Arton:
        </span>
        <div className="flex flex-wrap gap-1.5">
          {T20_WEAPONS.slice(0, 6).map((wep) => (
            <button
              key={wep.id}
              type="button"
              onClick={() => addPredefinedWeapon(wep.id)}
              className="px-2.5 py-1 rounded-lg bg-stone-950 hover:bg-amber-950/50 border border-amber-900/40 hover:border-amber-500/50 text-[11px] text-amber-200 flex items-center gap-1 active:scale-95 transition-all"
            >
              <Plus className="w-3 h-3 text-amber-400" />
              <span>{wep.name}</span>
            </button>
          ))}
          <button
            type="button"
            onClick={addEmptyAttack}
            className="px-2.5 py-1 rounded-lg bg-amber-950/40 border border-amber-700/50 text-[11px] text-amber-300 flex items-center gap-1 active:scale-95 transition-all font-medium"
          >
            <Plus className="w-3 h-3" />
            <span>Personalizado</span>
          </button>
        </div>
      </div>

      {/* Equipped Attacks List */}
      <div className="space-y-2 flex-1 overflow-y-auto pr-0.5 custom-scrollbar min-h-0">
        {data.attacks.length === 0 ? (
          <div className="h-40 border-2 border-dashed border-stone-800 rounded-xl flex flex-col items-center justify-center text-stone-500 p-4 text-center">
            <Swords className="w-8 h-8 mb-2 text-stone-600" />
            <span className="text-xs">Nenhum ataque adicionado ainda.</span>
            <span className="text-[11px] text-stone-600 mt-0.5">
              Toque em uma arma acima para equipar no seu herói.
            </span>
          </div>
        ) : (
          data.attacks.map((atk) => (
            <div
              key={atk.id}
              className="bg-stone-900/80 border border-amber-900/40 rounded-xl p-3 flex items-center justify-between gap-3 shadow-md"
            >
              <div className="min-w-0">
                <h4 className="font-cinzel text-sm font-bold text-amber-200 truncate">
                  {atk.name}
                </h4>
                <div className="flex flex-wrap gap-2 text-xs mt-1">
                  <span className="text-amber-400 font-mono font-bold">
                    Ataque: {atk.attackTest}
                  </span>
                  <span className="text-stone-300 font-mono">
                    Dano: <strong>{atk.damage}</strong>
                  </span>
                  <span className="text-stone-400 font-mono">
                    Crítico: {atk.crit}
                  </span>
                  <span className="text-stone-500 text-[10px] truncate">
                    ({atk.range} • {atk.type})
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => removeAttack(atk.id)}
                className="p-2 text-stone-500 hover:text-red-400 hover:bg-red-950/40 rounded-lg transition-colors shrink-0"
                title="Remover ataque"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Footer Info */}
      <div className="text-[11px] text-stone-400 bg-stone-900/50 p-2 rounded-lg border border-amber-900/20 text-center">
        {data.attacks.length} {data.attacks.length === 1 ? 'ataque configurado' : 'ataques configurados'}. Bônus de acerto e dano calculados de acordo com seus atributos e perícias.
      </div>
    </div>
  );
};
