import React, { useState, useMemo } from 'react';
import { Search, Check, Info, Heart, Zap, Sword, X, ChevronRight, Sliders } from 'lucide-react';
import { WizardData } from './types';
import { T20_CLASSES_DETAILED } from '../../../data/t20ClassesDetailed';
import { T20_CLASSES } from '../../../data/t20Data';

interface StepClassProps {
  data: WizardData;
  onChange: (updates: Partial<WizardData>) => void;
}

export const StepClass: React.FC<StepClassProps> = ({ data, onChange }) => {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'combatente' | 'especialista' | 'conjurador'>('all');
  const [inspectClass, setInspectClass] = useState<typeof T20_CLASSES_DETAILED[0] | null>(null);

  const filteredClasses = useMemo(() => {
    return T20_CLASSES_DETAILED.filter((cls) => {
      const matchesSearch =
        cls.name.toLowerCase().includes(search.toLowerCase()) ||
        cls.role.toLowerCase().includes(search.toLowerCase()) ||
        cls.summary.toLowerCase().includes(search.toLowerCase());
      const matchesCat = categoryFilter === 'all' || cls.category === categoryFilter;
      return matchesSearch && matchesCat;
    });
  }, [search, categoryFilter]);

  const selectedClass = useMemo(() => {
    return T20_CLASSES_DETAILED.find((c) => c.id === data.classId) || T20_CLASSES_DETAILED[0];
  }, [data.classId]);

  const handleSelectClass = (cls: typeof T20_CLASSES_DETAILED[0]) => {
    const stats = T20_CLASSES[cls.id as keyof typeof T20_CLASSES] || T20_CLASSES['guerreiro'];
    const conMod = data.attrModifiers.CON || 0;
    const calculatedPV = stats.pvBase + conMod + ((stats.pvPerLevel + conMod) * (data.level - 1));
    const calculatedPM = stats.pmBase + (stats.pmPerLevel * (data.level - 1));

    onChange({
      classId: cls.id,
      className: cls.name,
      hp: Math.max(1, calculatedPV),
      hpMax: Math.max(1, calculatedPV),
      mana: Math.max(0, calculatedPM),
      manaMax: Math.max(0, calculatedPM)
    });
  };

  const handleLevelChange = (newLevel: number) => {
    const level = Math.max(1, Math.min(20, newLevel));
    const stats = T20_CLASSES[data.classId as keyof typeof T20_CLASSES] || T20_CLASSES['guerreiro'];
    const conMod = data.attrModifiers.CON || 0;
    const calculatedPV = stats.pvBase + conMod + ((stats.pvPerLevel + conMod) * (level - 1));
    const calculatedPM = stats.pmBase + (stats.pmPerLevel * (level - 1));

    onChange({
      level,
      hp: Math.max(1, calculatedPV),
      hpMax: Math.max(1, calculatedPV),
      mana: Math.max(0, calculatedPM),
      manaMax: Math.max(0, calculatedPM)
    });
  };

  return (
    <div className="w-full space-y-3 max-w-2xl mx-auto flex flex-col h-full">
      {/* Level Selector & Search Row */}
      <div className="bg-stone-900/80 border border-amber-900/40 rounded-xl p-2.5 flex items-center justify-between gap-3 shadow-md">
        {/* Level Controls */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Nível</span>
          <div className="flex items-center bg-stone-950 rounded-lg border border-amber-900/50 p-0.5">
            <button
              type="button"
              onClick={() => handleLevelChange(data.level - 1)}
              disabled={data.level <= 1}
              className="w-7 h-7 flex items-center justify-center rounded text-amber-300 hover:bg-amber-900/40 disabled:opacity-30 font-bold"
            >
              -
            </button>
            <span className="w-8 text-center font-cinzel font-bold text-amber-200 text-sm">
              {data.level}
            </span>
            <button
              type="button"
              onClick={() => handleLevelChange(data.level + 1)}
              disabled={data.level >= 20}
              className="w-7 h-7 flex items-center justify-center rounded text-amber-300 hover:bg-amber-900/40 disabled:opacity-30 font-bold"
            >
              +
            </button>
          </div>
        </div>

        {/* Selected Class PV / PM live pills */}
        <div className="flex items-center gap-2 text-xs">
          <span className="px-2 py-1 rounded bg-red-950/60 border border-red-800/50 text-red-300 font-mono flex items-center gap-1">
            <Heart className="w-3 h-3 text-red-400 fill-red-400" />
            <span>{data.hpMax} PV</span>
          </span>
          <span className="px-2 py-1 rounded bg-blue-950/60 border border-blue-800/50 text-blue-300 font-mono flex items-center gap-1">
            <Zap className="w-3 h-3 text-blue-400 fill-blue-400" />
            <span>{data.manaMax} PM</span>
          </span>
        </div>
      </div>

      {/* Category Pills & Search */}
      <div className="flex items-center gap-2">
        {/* Category Pills */}
        <div className="flex gap-1 overflow-x-auto no-scrollbar shrink-0">
          {(['all', 'combatente', 'conjurador', 'especialista'] as const).map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategoryFilter(cat)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium capitalize transition-all whitespace-nowrap ${
                categoryFilter === cat
                  ? 'bg-amber-500 text-stone-950 font-bold shadow'
                  : 'bg-stone-900/80 text-stone-400 hover:text-stone-200 border border-stone-800'
              }`}
            >
              {cat === 'all' ? 'Todas' : cat}
            </button>
          ))}
        </div>

        {/* Compact Search */}
        <div className="relative flex-1 min-w-[100px]">
          <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-stone-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar..."
            className="w-full bg-stone-900 border border-amber-900/40 rounded-lg pl-8 pr-2 py-1 text-xs text-stone-200 placeholder-stone-500 focus:outline-none focus:ring-1 focus:ring-amber-500/50"
          />
        </div>
      </div>

      {/* 2-Column Responsive Grid of Classes */}
      <div className="grid grid-cols-2 gap-2 sm:gap-2.5 overflow-y-auto pr-0.5 pb-2 custom-scrollbar flex-1 min-h-0">
        {filteredClasses.map((cls) => {
          const isSelected = data.classId === cls.id;
          const classData = T20_CLASSES[cls.id as keyof typeof T20_CLASSES];
          return (
            <div
              key={cls.id}
              onClick={() => handleSelectClass(cls)}
              className={`relative text-left p-3 rounded-xl border transition-all cursor-pointer select-none flex flex-col justify-between ${
                isSelected
                  ? 'bg-gradient-to-b from-amber-950/90 to-stone-900 border-amber-400 ring-2 ring-amber-500/50 shadow-[0_0_15px_rgba(217,119,6,0.3)]'
                  : 'bg-stone-900/70 border-stone-800/80 hover:border-amber-700/50 hover:bg-stone-900'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-1 mb-1">
                  <h3
                    className={`font-cinzel text-xs sm:text-sm font-bold uppercase tracking-wider leading-tight ${
                      isSelected ? 'text-amber-300' : 'text-stone-200'
                    }`}
                  >
                    {cls.name}
                  </h3>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setInspectClass(cls);
                      }}
                      className="p-1 text-stone-400 hover:text-amber-300 transition-colors"
                      title="Ver detalhes"
                    >
                      <Info className="w-3.5 h-3.5" />
                    </button>
                    {isSelected && (
                      <div className="w-4 h-4 rounded-full bg-amber-500 text-stone-950 flex items-center justify-center shadow">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Role / Category Badge */}
                <div className="flex items-center gap-1 my-1">
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-stone-950 text-amber-400 border border-amber-900/40 font-medium capitalize truncate">
                    {cls.category}
                  </span>
                  {classData && (
                    <span className="text-[9px] text-stone-400 font-mono">
                      {classData.pvBase} PV / {classData.pmBase} PM
                    </span>
                  )}
                </div>

                <p className="text-[11px] text-stone-400 line-clamp-2 leading-tight">
                  {cls.summary}
                </p>
              </div>

              <div className="mt-2 pt-1.5 border-t border-amber-900/20 flex items-center justify-between text-[10px]">
                <span className={isSelected ? 'text-amber-400 font-bold' : 'text-stone-500'}>
                  {isSelected ? '✓ Selecionada' : 'Toque para escolher'}
                </span>
                <ChevronRight className="w-3 h-3 text-stone-600" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Inspect Class Modal */}
      {inspectClass && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn">
          <div className="w-full sm:max-w-lg bg-stone-950 border border-amber-600/50 rounded-t-3xl sm:rounded-2xl p-5 shadow-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-amber-900/40 pb-3 mb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  <Sword className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-cinzel text-lg font-bold text-amber-200">
                    {inspectClass.name}
                  </h3>
                  <span className="text-[11px] text-amber-500 uppercase tracking-widest font-semibold capitalize">
                    {inspectClass.category} • {inspectClass.role}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setInspectClass(null)}
                className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-stone-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto space-y-4 pr-1 custom-scrollbar text-xs leading-relaxed flex-1">
              <div>
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block mb-1">
                  Conceito da Classe
                </span>
                <p className="text-stone-300">{inspectClass.concept || inspectClass.summary}</p>
              </div>

              {/* Attributes Focus */}
              <div>
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block mb-1">
                  Atributos Chave
                </span>
                <div className="flex gap-2 text-stone-300">
                  <span>Principais: <strong className="text-amber-300">{inspectClass.primaryAttributes.join(', ')}</strong></span>
                  <span>• Secundários: <strong className="text-stone-400">{inspectClass.secondaryAttributes.join(', ')}</strong></span>
                </div>
              </div>

              {/* Strengths & Weaknesses */}
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 rounded-lg bg-stone-900 border border-emerald-900/40">
                  <span className="text-[10px] font-bold text-emerald-400 uppercase block mb-1">Pontos Fortes</span>
                  <ul className="list-disc list-inside space-y-0.5 text-stone-300 text-[11px]">
                    {inspectClass.strengths.slice(0, 3).map((st, i) => (
                      <li key={i}>{st}</li>
                    ))}
                  </ul>
                </div>
                <div className="p-2.5 rounded-lg bg-stone-900 border border-red-900/40">
                  <span className="text-[10px] font-bold text-red-400 uppercase block mb-1">Fraquezas</span>
                  <ul className="list-disc list-inside space-y-0.5 text-stone-300 text-[11px]">
                    {inspectClass.weaknesses.slice(0, 3).map((wk, i) => (
                      <li key={i}>{wk}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-amber-900/40 flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  handleSelectClass(inspectClass);
                  setInspectClass(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-stone-950 font-cinzel font-bold text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer"
              >
                <Check className="w-4 h-4 stroke-[2.5]" />
                <span>Escolher {inspectClass.name}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
