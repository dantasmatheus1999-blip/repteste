import React, { useState, useMemo } from 'react';
import { Search, Check, Info, Sparkles, X, Shield, ChevronRight } from 'lucide-react';
import { WizardData } from './types';
import { T20_RACES } from '../../../data/t20Races';

interface StepRaceProps {
  data: WizardData;
  onChange: (updates: Partial<WizardData>) => void;
}

export const StepRace: React.FC<StepRaceProps> = ({ data, onChange }) => {
  const [search, setSearch] = useState('');
  const [inspectRace, setInspectRace] = useState<typeof T20_RACES[0] | null>(null);

  const filteredRaces = useMemo(() => {
    return T20_RACES.filter((race) =>
      race.name.toLowerCase().includes(search.toLowerCase()) ||
      race.summary.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  const selectedRace = useMemo(() => {
    return T20_RACES.find((r) => r.id === data.raceId) || T20_RACES[0];
  }, [data.raceId]);

  const handleSelectRace = (race: typeof T20_RACES[0]) => {
    let size = 'Médio';
    let movement = '9m';

    if (race.id === 'hynne' || race.id === 'goblin' || race.id === 'silfide') {
      size = 'Pequeno';
    }
    if (race.id === 'anao') {
      movement = '6m';
    }

    onChange({
      raceId: race.id,
      raceName: race.name,
      size,
      movement
    });
  };

  return (
    <div className="w-full space-y-3 max-w-2xl mx-auto flex flex-col h-full">
      {/* Search Bar & Selected Race Banner */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-stone-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar raça (ex: Humano, Elfo, Lefou)..."
            className="w-full bg-stone-900 border border-amber-900/50 rounded-xl pl-9 pr-3 py-2 text-xs sm:text-sm text-stone-200 placeholder-stone-500 focus:outline-none focus:ring-1 focus:ring-amber-500/60"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2.5 top-2.5 text-stone-500 hover:text-stone-300"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Selected Race indicator */}
        <div
          onClick={() => setInspectRace(selectedRace)}
          className="px-3 py-1.5 rounded-xl bg-amber-950/60 border border-amber-600/50 flex items-center gap-2 cursor-pointer hover:bg-amber-900/60 transition-colors shrink-0"
          title="Ver detalhes da raça selecionada"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-xs font-cinzel font-bold text-amber-200 truncate max-w-[90px] sm:max-w-none">
            {selectedRace.name}
          </span>
          <Info className="w-3 h-3 text-amber-400/70" />
        </div>
      </div>

      {/* 2-Column Responsive Grid of Races */}
      <div className="grid grid-cols-2 gap-2 sm:gap-2.5 overflow-y-auto pr-0.5 pb-2 custom-scrollbar flex-1 min-h-0">
        {filteredRaces.map((race) => {
          const isSelected = data.raceId === race.id;
          return (
            <div
              key={race.id}
              onClick={() => handleSelectRace(race)}
              className={`relative text-left p-3 rounded-xl border transition-all cursor-pointer select-none flex flex-col justify-between ${
                isSelected
                  ? 'bg-gradient-to-b from-amber-950/90 to-stone-900 border-amber-400 ring-2 ring-amber-500/50 shadow-[0_0_15px_rgba(217,119,6,0.3)]'
                  : 'bg-stone-900/70 border-stone-800/80 hover:border-amber-700/50 hover:bg-stone-900'
              }`}
            >
              {/* Card Header */}
              <div>
                <div className="flex items-start justify-between gap-1 mb-1">
                  <h3
                    className={`font-cinzel text-xs sm:text-sm font-bold uppercase tracking-wider leading-tight ${
                      isSelected ? 'text-amber-300' : 'text-stone-200'
                    }`}
                  >
                    {race.name}
                  </h3>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setInspectRace(race);
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

                {/* Modifiers Badges */}
                <div className="flex flex-wrap gap-1 my-1.5">
                  {race.attributeModifiers.slice(0, 2).map((mod, idx) => (
                    <span
                      key={idx}
                      className="text-[9px] px-1.5 py-0.5 rounded bg-stone-950/80 text-amber-400 font-mono font-medium border border-amber-900/30 truncate max-w-full"
                    >
                      {mod.attribute.slice(0, 3)}: {mod.value > 0 ? `+${mod.value}` : mod.value}
                    </span>
                  ))}
                  {race.attributeModifiers.length > 2 && (
                    <span className="text-[9px] px-1 py-0.5 rounded bg-stone-950/80 text-stone-400 font-mono">
                      +{race.attributeModifiers.length - 2}
                    </span>
                  )}
                </div>

                <p className="text-[11px] text-stone-400 line-clamp-2 leading-tight">
                  {race.summary}
                </p>
              </div>

              {/* Bottom selection hint */}
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

      {/* Inspect Race Modal / Bottom Sheet */}
      {inspectRace && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn">
          <div className="w-full sm:max-w-lg bg-stone-950 border border-amber-600/50 rounded-t-3xl sm:rounded-2xl p-5 shadow-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-amber-900/40 pb-3 mb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-cinzel text-lg font-bold text-amber-200">
                    {inspectRace.name}
                  </h3>
                  <span className="text-[11px] text-amber-500 uppercase tracking-widest font-semibold">
                    Linhagem de Tormenta 20
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setInspectRace(null)}
                className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-stone-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto space-y-4 pr-1 custom-scrollbar text-xs leading-relaxed flex-1">
              <div>
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block mb-1">
                  Visão Geral
                </span>
                <p className="text-stone-300">{inspectRace.summary}</p>
                {inspectRace.description && (
                  <p className="text-stone-400 mt-1">{inspectRace.description}</p>
                )}
              </div>

              {/* Attribute Modifiers */}
              <div>
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block mb-1.5">
                  Modificadores de Atributo
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  {inspectRace.attributeModifiers.map((mod, idx) => (
                    <div
                      key={idx}
                      className="p-2 rounded-lg bg-stone-900 border border-amber-900/30 flex items-center justify-between font-mono"
                    >
                      <span className="text-stone-300">{mod.attribute}</span>
                      <span className="text-amber-400 font-bold">
                        {mod.value > 0 ? `+${mod.value}` : mod.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Racial Abilities */}
              {inspectRace.racialAbilities && inspectRace.racialAbilities.length > 0 && (
                <div>
                  <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block mb-1.5">
                    Habilidades Raciais
                  </span>
                  <div className="space-y-2">
                    {inspectRace.racialAbilities.map((ab, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-lg bg-stone-900/90 border border-stone-800"
                      >
                        <h4 className="font-cinzel text-amber-300 font-bold text-xs mb-0.5">
                          {ab.name}
                        </h4>
                        <p className="text-stone-400 text-[11px] leading-relaxed">
                          {ab.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-amber-900/40 flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  handleSelectRace(inspectRace);
                  setInspectRace(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-stone-950 font-cinzel font-bold text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer"
              >
                <Check className="w-4 h-4 stroke-[2.5]" />
                <span>Escolher {inspectRace.name}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
