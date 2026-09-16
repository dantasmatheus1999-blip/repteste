import React, { useState, useMemo } from 'react';
import { Flame, Search, Check, Plus, X, Info } from 'lucide-react';
import { WizardData } from './types';
import { T20_POWERS } from '../../../data/t20Powers';
import { CharacterPower } from '../../../types/character';

interface StepPowersProps {
  data: WizardData;
  onChange: (updates: Partial<WizardData>) => void;
}

export const StepPowers: React.FC<StepPowersProps> = ({ data, onChange }) => {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [inspectPower, setInspectPower] = useState<typeof T20_POWERS[0] | null>(null);

  const selectedPowerIds = useMemo(() => {
    return new Set(data.powers.map((p) => p.id));
  }, [data.powers]);

  const filteredPowers = useMemo(() => {
    return T20_POWERS.filter((pow) => {
      const matchesSearch =
        pow.name.toLowerCase().includes(search.toLowerCase()) ||
        pow.description.toLowerCase().includes(search.toLowerCase()) ||
        (pow.prerequisites && pow.prerequisites.toLowerCase().includes(search.toLowerCase()));
      const matchesCategory = categoryFilter === 'all' || pow.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [search, categoryFilter]);

  const togglePower = (pow: typeof T20_POWERS[0]) => {
    if (selectedPowerIds.has(pow.id)) {
      const updated = data.powers.filter((p) => p.id !== pow.id);
      onChange({ powers: updated });
    } else {
      const newPower: CharacterPower = {
        id: pow.id,
        name: pow.name,
        type: pow.category,
        description: pow.description,
        source: pow.source || 'Tormenta 20'
      };
      onChange({ powers: [...data.powers, newPower] });
    }
  };

  return (
    <div className="w-full space-y-2.5 max-w-2xl mx-auto flex flex-col h-full">
      {/* Top Bar: Counter, Filter, Search */}
      <div className="flex items-center gap-2">
        <div className="px-2.5 py-1.5 rounded-xl bg-amber-950/60 border border-amber-600/50 flex items-center gap-1.5 shrink-0">
          <Flame className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-xs font-mono font-bold text-amber-200">
            {data.powers.length} Ativos
          </span>
        </div>

        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-stone-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar poder ou talento..."
            className="w-full bg-stone-900 border border-amber-900/40 rounded-xl pl-8 pr-2 py-1.5 text-xs text-stone-200 placeholder-stone-500 focus:outline-none focus:ring-1 focus:ring-amber-500/50"
          />
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex gap-1 overflow-x-auto no-scrollbar shrink-0">
        {['all', 'combate', 'destino', 'magia', 'tormenta', 'concedido'].map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setCategoryFilter(cat)}
            className={`px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase transition-all whitespace-nowrap ${
              categoryFilter === cat
                ? 'bg-amber-500 text-stone-950 shadow'
                : 'bg-stone-900/80 text-stone-400 hover:text-stone-200 border border-stone-800'
            }`}
          >
            {cat === 'all' ? 'Todos' : cat}
          </button>
        ))}
      </div>

      {/* 2-Column Responsive Grid of Powers */}
      <div className="grid grid-cols-2 gap-1.5 sm:gap-2 overflow-y-auto pr-0.5 pb-2 custom-scrollbar flex-1 min-h-0">
        {filteredPowers.map((pow) => {
          const isSelected = selectedPowerIds.has(pow.id);
          return (
            <div
              key={pow.id}
              onClick={() => togglePower(pow)}
              className={`p-2.5 rounded-xl border flex flex-col justify-between cursor-pointer select-none transition-all ${
                isSelected
                  ? 'bg-amber-950/70 border-amber-400 ring-1 ring-amber-500/50 shadow-sm'
                  : 'bg-stone-900/70 border-stone-800/80 hover:border-amber-900/50 hover:bg-stone-900'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-1 mb-1">
                  <h4 className={`font-cinzel text-xs font-bold leading-tight ${isSelected ? 'text-amber-300' : 'text-stone-200'}`}>
                    {pow.name}
                  </h4>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setInspectPower(pow);
                      }}
                      className="p-1 text-stone-400 hover:text-amber-300 transition-colors"
                      title="Ver detalhes"
                    >
                      <Info className="w-3.5 h-3.5" />
                    </button>
                    {isSelected ? (
                      <div className="w-4 h-4 rounded-full bg-amber-500 text-stone-950 flex items-center justify-center shadow">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-stone-600 text-stone-400 flex items-center justify-center">
                        <Plus className="w-3 h-3" />
                      </div>
                    )}
                  </div>
                </div>

                <span className="text-[9px] px-1.5 py-0.5 rounded bg-stone-950 text-amber-400 border border-amber-900/30 uppercase font-mono block mb-1 w-fit">
                  {pow.category}
                </span>

                <p className="text-[11px] text-stone-400 line-clamp-2 leading-tight">
                  {pow.description}
                </p>
              </div>

              {pow.prerequisites && (
                <div className="mt-1.5 pt-1 border-t border-amber-900/20 text-[9px] text-amber-400/80 truncate">
                  Pré: {pow.prerequisites}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Inspect Power Modal */}
      {inspectPower && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn">
          <div className="w-full sm:max-w-md bg-stone-950 border border-amber-600/50 rounded-t-3xl sm:rounded-2xl p-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-amber-900/40 pb-3 mb-3">
              <div>
                <h3 className="font-cinzel text-base font-bold text-amber-200">
                  {inspectPower.name}
                </h3>
                <span className="text-[10px] text-amber-500 uppercase tracking-widest font-mono">
                  {inspectPower.category} • Tormenta 20
                </span>
              </div>
              <button
                type="button"
                onClick={() => setInspectPower(null)}
                className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-stone-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs leading-relaxed max-h-[60vh] overflow-y-auto pr-1 custom-scrollbar">
              {inspectPower.prerequisites && (
                <div className="p-2 rounded bg-amber-950/40 border border-amber-800/40 text-amber-300">
                  <strong>Pré-requisitos:</strong> {inspectPower.prerequisites}
                </div>
              )}
              <p className="text-stone-300 leading-relaxed">{inspectPower.description}</p>
            </div>

            <div className="mt-4 pt-3 border-t border-amber-900/40">
              <button
                type="button"
                onClick={() => {
                  togglePower(inspectPower);
                  setInspectPower(null);
                }}
                className="w-full py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-cinzel font-bold text-xs flex items-center justify-center gap-1.5"
              >
                {selectedPowerIds.has(inspectPower.id) ? 'Remover Poder' : 'Adicionar à Ficha'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
