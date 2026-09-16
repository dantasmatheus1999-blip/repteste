import React from 'react';
import { Sparkles, RotateCcw, Info, Plus, Minus } from 'lucide-react';
import { Attribute } from '../../../types/character';
import { WizardData, ATTRIBUTES_LIST, calcMod, buildSkillsList } from './types';
import { T20_CLASSES } from '../../../data/t20Data';

interface StepAttributesProps {
  data: WizardData;
  onChange: (updates: Partial<WizardData>) => void;
}

export const StepAttributes: React.FC<StepAttributesProps> = ({ data, onChange }) => {
  const updateAttribute = (attr: Attribute, delta: number) => {
    const currentBase = data.baseAttributes[attr] ?? 0;
    const newBaseVal = Math.max(-5, Math.min(10, currentBase + delta));
    const newBase = { ...data.baseAttributes, [attr]: newBaseVal };

    const raceBonus = data.raceBonusAttrs[attr] || 0;
    const finalVal = newBaseVal + raceBonus;

    const newAttributes = { ...data.attributes, [attr]: finalVal };
    const newModifiers: Record<Attribute, number> = {
      FOR: calcMod(newAttributes.FOR),
      DES: calcMod(newAttributes.DES),
      CON: calcMod(newAttributes.CON),
      INT: calcMod(newAttributes.INT),
      SAB: calcMod(newAttributes.SAB),
      CAR: calcMod(newAttributes.CAR)
    };

    const stats = T20_CLASSES[data.classId as keyof typeof T20_CLASSES] || T20_CLASSES['guerreiro'];
    const conMod = newModifiers.CON;
    const desMod = newModifiers.DES;
    const calculatedPV = stats.pvBase + conMod + ((stats.pvPerLevel + conMod) * (data.level - 1));
    const calculatedPM = stats.pmBase + (stats.pmPerLevel * (data.level - 1));
    const armorBonus = data.armor?.defenseBonus || 0;
    const shieldBonus = data.shield?.defenseBonus || 0;
    const isHeavy = data.armor?.type === 'pesada';
    const calculatedDefense = 10 + (isHeavy ? 0 : desMod) + armorBonus + shieldBonus;

    const updatedSkills = buildSkillsList(data.level, newModifiers, data.trainedSkills);

    onChange({
      baseAttributes: newBase,
      attributes: newAttributes,
      attrModifiers: newModifiers,
      hp: Math.max(1, calculatedPV),
      hpMax: Math.max(1, calculatedPV),
      mana: Math.max(0, calculatedPM),
      manaMax: Math.max(0, calculatedPM),
      defense: calculatedDefense,
      skills: updatedSkills
    });
  };

  const applyPreset = (values: Record<Attribute, number>) => {
    const calculatedAttrs: Record<Attribute, number> = {
      FOR: values.FOR + (data.raceBonusAttrs.FOR || 0),
      DES: values.DES + (data.raceBonusAttrs.DES || 0),
      CON: values.CON + (data.raceBonusAttrs.CON || 0),
      INT: values.INT + (data.raceBonusAttrs.INT || 0),
      SAB: values.SAB + (data.raceBonusAttrs.SAB || 0),
      CAR: values.CAR + (data.raceBonusAttrs.CAR || 0)
    };

    const newModifiers: Record<Attribute, number> = {
      FOR: calcMod(calculatedAttrs.FOR),
      DES: calcMod(calculatedAttrs.DES),
      CON: calcMod(calculatedAttrs.CON),
      INT: calcMod(calculatedAttrs.INT),
      SAB: calcMod(calculatedAttrs.SAB),
      CAR: calcMod(calculatedAttrs.CAR)
    };

    const stats = T20_CLASSES[data.classId as keyof typeof T20_CLASSES] || T20_CLASSES['guerreiro'];
    const conMod = newModifiers.CON;
    const desMod = newModifiers.DES;
    const calculatedPV = stats.pvBase + conMod + ((stats.pvPerLevel + conMod) * (data.level - 1));
    const calculatedPM = stats.pmBase + (stats.pmPerLevel * (data.level - 1));
    const armorBonus = data.armor?.defenseBonus || 0;
    const shieldBonus = data.shield?.defenseBonus || 0;
    const isHeavy = data.armor?.type === 'pesada';
    const calculatedDefense = 10 + (isHeavy ? 0 : desMod) + armorBonus + shieldBonus;

    const updatedSkills = buildSkillsList(data.level, newModifiers, data.trainedSkills);

    onChange({
      baseAttributes: values,
      attributes: calculatedAttrs,
      attrModifiers: newModifiers,
      hp: Math.max(1, calculatedPV),
      hpMax: Math.max(1, calculatedPV),
      mana: Math.max(0, calculatedPM),
      manaMax: Math.max(0, calculatedPM),
      defense: calculatedDefense,
      skills: updatedSkills
    });
  };

  return (
    <div className="w-full space-y-3 max-w-xl mx-auto flex flex-col h-full justify-between">
      {/* Presets Bar (Tormenta 20 Edição Jogo do Ano) */}
      <div className="bg-stone-900/80 border border-amber-900/40 rounded-xl p-2.5 flex items-center justify-between gap-2 shadow-md">
        <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Presets:
        </span>
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => applyPreset({ FOR: 3, DES: 2, CON: 2, INT: 1, SAB: 0, CAR: -1 })}
            className="px-2.5 py-1 rounded-lg bg-stone-950 border border-amber-900/50 hover:border-amber-500/60 text-[11px] text-amber-300 whitespace-nowrap active:scale-95 transition-all cursor-pointer"
          >
            Padrão (+3, +2, +2, +1, 0, -1)
          </button>
          <button
            type="button"
            onClick={() => applyPreset({ FOR: 2, DES: 2, CON: 1, INT: 1, SAB: 1, CAR: 0 })}
            className="px-2.5 py-1 rounded-lg bg-stone-950 border border-amber-900/50 hover:border-amber-500/60 text-[11px] text-stone-300 whitespace-nowrap active:scale-95 transition-all cursor-pointer"
          >
            Equilibrado
          </button>
          <button
            type="button"
            onClick={() => applyPreset({ FOR: 4, DES: 2, CON: 2, INT: 0, SAB: 0, CAR: -1 })}
            className="px-2.5 py-1 rounded-lg bg-stone-950 border border-amber-900/50 hover:border-amber-500/60 text-[11px] text-stone-300 whitespace-nowrap active:scale-95 transition-all cursor-pointer"
          >
            Físico
          </button>
          <button
            type="button"
            onClick={() => applyPreset({ FOR: -1, DES: 2, CON: 1, INT: 4, SAB: 2, CAR: 0 })}
            className="px-2.5 py-1 rounded-lg bg-stone-950 border border-amber-900/50 hover:border-amber-500/60 text-[11px] text-stone-300 whitespace-nowrap active:scale-95 transition-all cursor-pointer"
          >
            Místico
          </button>
        </div>
      </div>

      {/* 6 Attributes Grid (Tormenta 20 JdA: Atributo direto) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 flex-1 min-h-0">
        {ATTRIBUTES_LIST.map((attrItem) => {
          const key = attrItem.key as Attribute;
          const value = data.attributes[key] ?? 0;
          const modStr = value >= 0 ? `+${value}` : `${value}`;
          const raceBonus = data.raceBonusAttrs[key] || 0;

          return (
            <div
              key={key}
              className="bg-stone-900/80 border border-amber-900/40 rounded-xl p-2.5 sm:p-3 flex flex-col justify-between shadow-lg relative group"
            >
              {/* Header: Key & Name */}
              <div className="flex items-center justify-between border-b border-amber-900/20 pb-1.5">
                <div>
                  <span className="font-cinzel text-sm sm:text-base font-bold text-amber-200 block">
                    {key}
                  </span>
                  <span className="text-[10px] text-stone-400 block -mt-0.5">
                    {attrItem.name}
                  </span>
                </div>
                {/* Modifier Badge */}
                <span className="px-2 py-0.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-mono font-bold shadow-sm">
                  {modStr}
                </span>
              </div>

              {/* Value & Stepper Controls */}
              <div className="flex items-center justify-between my-2">
                <button
                  type="button"
                  onClick={() => updateAttribute(key, -1)}
                  disabled={value <= -5}
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-stone-950 border border-amber-900/60 text-amber-400 hover:bg-amber-900/40 disabled:opacity-25 flex items-center justify-center font-bold text-base active:scale-95 transition-all cursor-pointer"
                  aria-label={`Diminuir ${attrItem.name}`}
                >
                  <Minus className="w-4 h-4" />
                </button>

                <div className="text-center">
                  <span className="text-2xl sm:text-3xl font-cinzel font-bold text-stone-100">
                    {modStr}
                  </span>
                  {raceBonus !== 0 && (
                    <span className="text-[9px] text-amber-400 block font-mono">
                      (Raça {raceBonus > 0 ? `+${raceBonus}` : raceBonus})
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => updateAttribute(key, 1)}
                  disabled={value >= 10}
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-stone-950 border border-amber-900/60 text-amber-400 hover:bg-amber-900/40 disabled:opacity-25 flex items-center justify-center font-bold text-base active:scale-95 transition-all cursor-pointer"
                  aria-label={`Aumentar ${attrItem.name}`}
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Mini flavor hint */}
              <span className="text-[9px] text-stone-500 truncate block text-center">
                {attrItem.desc}
              </span>
            </div>
          );
        })}
      </div>

      {/* Info footer */}
      <div className="text-[11px] text-stone-400 bg-stone-900/50 p-2 rounded-lg border border-amber-900/20 text-center">
        Regra Oficial Tormenta 20 — Edição Jogo do Ano: <strong className="text-amber-300">o valor utilizado diretamente nas regras é o próprio modificador (+0, +1, +3, etc.)</strong>.
      </div>
    </div>
  );
};
