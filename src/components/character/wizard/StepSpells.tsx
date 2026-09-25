import React, { useState, useMemo } from 'react';
import { Wand2, Search, Check, Plus, X, Info, Sparkles } from 'lucide-react';
import { WizardData } from './types';
import { T20_SPELLS } from '../../../data/t20Spells';
import { CharacterSpell } from '../../../types/character';

interface StepSpellsProps {
  data: WizardData;
  onChange: (updates: Partial<WizardData>) => void;
}

export const StepSpells: React.FC<StepSpellsProps> = ({ data, onChange }) => {
  const [selectedCircle, setSelectedCircle] = useState<number>(1);
  const [search, setSearch] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [typeFilter, setTypeFilter] = useState<'all' | 'arcana' | 'divina'>('all');
  const [inspectSpell, setInspectSpell] = useState<typeof T20_SPELLS[0] | null>(null);

  const isSpellcasterClass = ['arcanista', 'clerigo', 'druida', 'bardo'].includes(data.classId);

  const selectedSpellIds = useMemo(() => {
    return new Set(data.spells.map((s) => s.id));
  }, [data.spells]);

  const filteredSpells = useMemo(() => {
    return T20_SPELLS.filter((spell) => {
      const matchesCircle = spell.circle === selectedCircle;
      const matchesType = typeFilter === 'all' || spell.type === typeFilter;
      const matchesSearch =
        spell.name.toLowerCase().includes(search.toLowerCase()) ||
        spell.school.toLowerCase().includes(search.toLowerCase()) ||
        spell.description.toLowerCase().includes(search.toLowerCase());

      return matchesCircle && matchesType && matchesSearch;
    });
  }, [selectedCircle, typeFilter, search]);

  const toggleSpell = (spell: typeof T20_SPELLS[0]) => {
    if (selectedSpellIds.has(spell.id)) {
      const updated = data.spells.filter((s) => s.id !== spell.id);
      onChange({ spells: updated });
    } else {
      const newSpell: CharacterSpell = {
        id: spell.id,
        name: spell.name,
        circle: spell.circle,
        school: spell.school,
        type: spell.type as 'arcana' | 'divina',
        description: spell.description,
        range: spell.range,
        duration: spell.duration
      };
      onChange({ spells: [...data.spells, newSpell] });
    }
  };

  return (
    <div className="w-full space-y-2.5 max-w-2xl mx-auto flex flex-col h-full">
      {/* Top Controls Bar - Compact Single Line [0 Magias] [1º] [2º] [3º] [4º] [5º] [🔍] */}
      <div className="w-full flex items-center justify-between gap-1 sm:gap-1.5 flex-nowrap">
        {/* Counter Badge */}
        <div className="px-2 py-1 rounded-lg bg-purple-950/70 border border-purple-600/50 flex items-center gap-1 shrink-0 shadow-xs">
          <Wand2 className="w-3.5 h-3.5 text-purple-400 shrink-0" />
          <span className="text-[11px] font-mono font-bold text-purple-200 whitespace-nowrap">
            {data.spells.length} Magias
          </span>
        </div>

        {/* 5 Circle Buttons */}
        <div className="flex items-center gap-1 shrink-0">
          {[1, 2, 3, 4, 5].map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setSelectedCircle(c)}
              className={`w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                selectedCircle === c
                  ? 'bg-purple-600 text-white shadow-sm ring-1 ring-purple-400'
                  : 'bg-[#0e1219]/90 text-stone-400 hover:text-stone-200 border border-stone-800'
              }`}
            >
              {c}º
            </button>
          ))}
        </div>

        {/* Search Icon Button */}
        <button
          type="button"
          onClick={() => setIsSearchOpen((prev) => !prev)}
          className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg border flex items-center justify-center transition-all shrink-0 cursor-pointer ${
            isSearchOpen || search
              ? 'bg-purple-600 border-purple-400 text-white ring-1 ring-purple-400 shadow-sm'
              : 'bg-[#0e1219]/90 border-stone-800 text-stone-400 hover:text-stone-200 hover:border-purple-900/60'
          }`}
          title="Buscar magia"
        >
          <Search className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Expandable Search Input */}
      {isSearchOpen && (
        <div className="relative w-full animate-fadeIn">
          <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-stone-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome, escola ou efeito..."
            autoFocus
            className="w-full bg-[#0e1219]/95 border border-purple-600/60 rounded-xl pl-8 pr-8 py-1.5 text-xs text-stone-200 placeholder-stone-500 focus:outline-none focus:ring-1 focus:ring-purple-500 shadow-inner"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="absolute right-2.5 top-2 text-stone-500 hover:text-stone-200 p-0.5 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      {/* Non-caster notice if applicable */}
      {!isSpellcasterClass && (
        <div className="text-[11px] text-amber-300/80 bg-amber-950/30 border border-amber-900/30 px-3 py-1.5 rounded-xl flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span className="truncate">
            {data.className} não usa magias nativas. Você pode avançar ou escolher se tiver poderes arcanos.
          </span>
        </div>
      )}

      {/* 2-Column Responsive Grid of Spells */}
      <div className="grid grid-cols-2 gap-1.5 sm:gap-2 overflow-y-auto pr-0.5 pb-2 custom-scrollbar flex-1 min-h-0">
        {filteredSpells.map((spell) => {
          const isSelected = selectedSpellIds.has(spell.id);
          return (
            <div
              key={spell.id}
              onClick={() => toggleSpell(spell)}
              className={`p-2.5 rounded-xl border flex flex-col justify-between cursor-pointer select-none transition-all ${
                isSelected
                  ? 'bg-purple-950/70 border-purple-400 ring-1 ring-purple-500/50 shadow-sm'
                  : 'bg-stone-900/70 border-stone-800/80 hover:border-purple-900/50 hover:bg-stone-900'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-1 mb-1">
                  <h4 className={`font-cinzel text-xs font-bold leading-tight ${isSelected ? 'text-purple-300' : 'text-stone-200'}`}>
                    {spell.name}
                  </h4>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setInspectSpell(spell);
                      }}
                      className="p-1 text-stone-400 hover:text-purple-300 transition-colors"
                      title="Ver detalhes"
                    >
                      <Info className="w-3.5 h-3.5" />
                    </button>
                    {isSelected ? (
                      <div className="w-4 h-4 rounded-full bg-purple-500 text-white flex items-center justify-center shadow">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-stone-600 text-stone-400 flex items-center justify-center">
                        <Plus className="w-3 h-3" />
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-1 text-[9px] font-mono text-purple-400/90 mb-1">
                  <span>{spell.circle}º Círculo</span>
                  <span>•</span>
                  <span className="capitalize">{spell.type}</span>
                </div>

                <p className="text-[11px] text-stone-400 line-clamp-2 leading-tight">
                  {spell.description}
                </p>
              </div>

              <div className="mt-1.5 pt-1 border-t border-purple-900/20 text-[9px] text-stone-500 truncate flex justify-between">
                <span>Alcance: {spell.range}</span>
                <span>Duração: {spell.duration}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Inspect Spell Modal */}
      {inspectSpell && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn">
          <div className="w-full sm:max-w-md bg-stone-950 border border-purple-600/50 rounded-t-3xl sm:rounded-2xl p-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-purple-900/40 pb-3 mb-3">
              <div>
                <h3 className="font-cinzel text-base font-bold text-purple-200">
                  {inspectSpell.name}
                </h3>
                <span className="text-[10px] text-purple-400 uppercase tracking-widest font-mono">
                  {inspectSpell.circle}º Círculo • {inspectSpell.school} • {inspectSpell.type}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setInspectSpell(null)}
                className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-stone-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs leading-relaxed max-h-[60vh] overflow-y-auto pr-1 custom-scrollbar">
              <div className="grid grid-cols-2 gap-2 text-[11px] text-stone-300 bg-purple-950/30 p-2 rounded-lg border border-purple-900/30">
                <div><strong>Alcance:</strong> {inspectSpell.range}</div>
                <div><strong>Duração:</strong> {inspectSpell.duration}</div>
              </div>
              <p className="text-stone-300 leading-relaxed whitespace-pre-line">{inspectSpell.description}</p>
            </div>

            <div className="mt-4 pt-3 border-t border-purple-900/40">
              <button
                type="button"
                onClick={() => {
                  toggleSpell(inspectSpell);
                  setInspectSpell(null);
                }}
                className="w-full py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-cinzel font-bold text-xs flex items-center justify-center gap-1.5"
              >
                {selectedSpellIds.has(inspectSpell.id) ? 'Remover Magia' : 'Aprender Magia'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
