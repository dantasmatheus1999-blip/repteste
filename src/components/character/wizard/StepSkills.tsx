import React, { useState, useMemo } from 'react';
import { Search, CheckSquare, Square, X } from 'lucide-react';
import { WizardData, calcHalfLevel, calcTrainingBonus, buildSkillsList } from './types';
import { T20_SKILLS } from '../../../data/t20Data';

interface StepSkillsProps {
  data: WizardData;
  onChange: (updates: Partial<WizardData>) => void;
}

export const StepSkills: React.FC<StepSkillsProps> = ({ data, onChange }) => {
  const [search, setSearch] = useState('');
  const [filterAttr, setFilterAttr] = useState<string>('all');

  const halfLevel = calcHalfLevel(data.level);
  const trainingBonus = calcTrainingBonus(data.level);

  const toggleSkillTraining = (skillId: string) => {
    let newTrained: string[];
    if (data.trainedSkills.includes(skillId)) {
      newTrained = data.trainedSkills.filter((id) => id !== skillId);
    } else {
      newTrained = [...data.trainedSkills, skillId];
    }

    const updatedSkills = buildSkillsList(data.level, data.attrModifiers, newTrained);

    onChange({
      trainedSkills: newTrained,
      skills: updatedSkills
    });
  };

  const filteredSkills = useMemo(() => {
    return T20_SKILLS.filter((sk) => {
      const matchesSearch = sk.name.toLowerCase().includes(search.toLowerCase());
      const matchesAttr = filterAttr === 'all' || sk.attr === filterAttr;
      return matchesSearch && matchesAttr;
    });
  }, [search, filterAttr]);

  return (
    <div className="w-full space-y-2.5 max-w-2xl mx-auto flex flex-col h-full">
      {/* Top Controls: Counter & Filter & Search */}
      <div className="flex items-center gap-2">
        {/* Trained count badge */}
        <div className="px-2.5 py-1.5 rounded-xl bg-amber-950/60 border border-amber-600/50 flex items-center gap-1.5 shrink-0">
          <CheckSquare className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-xs font-mono font-bold text-amber-200">
            {data.trainedSkills.length} Treinadas
          </span>
        </div>

        {/* Compact Search */}
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-stone-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar perícia..."
            className="w-full bg-stone-900 border border-amber-900/40 rounded-xl pl-8 pr-2 py-1.5 text-xs text-stone-200 placeholder-stone-500 focus:outline-none focus:ring-1 focus:ring-amber-500/50"
          />
        </div>
      </div>

      {/* Attribute filter pills in horizontal scroll */}
      <div className="flex gap-1 overflow-x-auto no-scrollbar shrink-0">
        {['all', 'FOR', 'DES', 'CON', 'INT', 'SAB', 'CAR'].map((attr) => (
          <button
            key={attr}
            type="button"
            onClick={() => setFilterAttr(attr)}
            className={`px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase transition-all whitespace-nowrap ${
              filterAttr === attr
                ? 'bg-amber-500 text-stone-950 shadow'
                : 'bg-stone-900/80 text-stone-400 hover:text-stone-200 border border-stone-800'
            }`}
          >
            {attr === 'all' ? 'Todas' : attr}
          </button>
        ))}
      </div>

      {/* 2-Column Responsive Grid of Skills */}
      <div className="grid grid-cols-2 gap-1.5 sm:gap-2 overflow-y-auto pr-0.5 pb-2 custom-scrollbar flex-1 min-h-0">
        {filteredSkills.map((sk) => {
          const isTrained = data.trainedSkills.includes(sk.id);
          const skillObj = data.skills.find((s) => s.id === sk.id);
          const totalBonus = skillObj?.total ?? 0;
          const bonusStr = totalBonus >= 0 ? `+${totalBonus}` : `${totalBonus}`;

          return (
            <div
              key={sk.id}
              onClick={() => toggleSkillTraining(sk.id)}
              className={`p-2 rounded-xl border flex items-center justify-between cursor-pointer select-none transition-all ${
                isTrained
                  ? 'bg-amber-950/60 border-amber-400 ring-1 ring-amber-500/50 shadow-sm'
                  : 'bg-stone-900/70 border-stone-800/80 hover:border-amber-900/50 hover:bg-stone-900'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className="shrink-0 text-amber-400">
                  {isTrained ? (
                    <CheckSquare className="w-4 h-4 fill-amber-500 text-stone-950" />
                  ) : (
                    <Square className="w-4 h-4 text-stone-600" />
                  )}
                </div>
                <div className="truncate">
                  <span className={`text-xs block font-medium truncate ${isTrained ? 'text-amber-200 font-bold' : 'text-stone-300'}`}>
                    {sk.name}
                  </span>
                  <span className="text-[9px] text-stone-500 uppercase font-mono">
                    {sk.attr}
                  </span>
                </div>
              </div>

              {/* Total Bonus Pill */}
              <span className={`text-xs font-mono font-bold px-1.5 py-0.5 rounded shrink-0 ${
                isTrained ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'text-stone-500'
              }`}>
                {bonusStr}
              </span>
            </div>
          );
        })}
      </div>

      {/* Calculation Formula Footer */}
      <div className="text-[10px] text-stone-500 text-center py-1 bg-stone-900/40 rounded-lg border border-amber-900/20">
        Total = Metade do Nível ({halfLevel >= 0 ? `+${halfLevel}` : halfLevel}) + Mod Atributo + Treino (+{trainingBonus})
      </div>
    </div>
  );
};
