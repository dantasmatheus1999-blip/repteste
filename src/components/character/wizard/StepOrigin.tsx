import React, { useState, useMemo } from 'react';
import { Search, Check, Info, Compass, X, ChevronRight, Briefcase } from 'lucide-react';
import { WizardData } from './types';
import { T20_ORIGINS } from '../../../data/t20Origins';

interface StepOriginProps {
  data: WizardData;
  onChange: (updates: Partial<WizardData>) => void;
}

export const StepOrigin: React.FC<StepOriginProps> = ({ data, onChange }) => {
  const [search, setSearch] = useState('');
  const [inspectOrigin, setInspectOrigin] = useState<typeof T20_ORIGINS[0] | null>(null);

  const filteredOrigins = useMemo(() => {
    return T20_ORIGINS.filter((origin) =>
      origin.name.toLowerCase().includes(search.toLowerCase()) ||
      origin.summary.toLowerCase().includes(search.toLowerCase()) ||
      origin.skills.some((s) => s.toLowerCase().includes(search.toLowerCase()))
    );
  }, [search]);

  const selectedOrigin = useMemo(() => {
    return T20_ORIGINS.find((o) => o.id === data.originId) || T20_ORIGINS[0];
  }, [data.originId]);

  const handleSelectOrigin = (origin: typeof T20_ORIGINS[0]) => {
    onChange({
      originId: origin.id,
      originName: origin.name
    });
  };

  return (
    <div className="w-full space-y-3 max-w-2xl mx-auto flex flex-col h-full">
      {/* Search Bar & Selected Origin Indicator */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-stone-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar origem (ex: Soldado, Guarda, Acólito)..."
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

        <div
          onClick={() => setInspectOrigin(selectedOrigin)}
          className="px-3 py-1.5 rounded-xl bg-amber-950/60 border border-amber-600/50 flex items-center gap-2 cursor-pointer hover:bg-amber-900/60 transition-colors shrink-0"
          title="Ver detalhes da origem selecionada"
        >
          <Compass className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-xs font-cinzel font-bold text-amber-200 truncate max-w-[90px] sm:max-w-none">
            {selectedOrigin.name}
          </span>
          <Info className="w-3 h-3 text-amber-400/70" />
        </div>
      </div>

      {/* 2-Column Responsive Grid of Origins */}
      <div className="grid grid-cols-2 gap-2 sm:gap-2.5 overflow-y-auto pr-0.5 pb-2 custom-scrollbar flex-1 min-h-0">
        {filteredOrigins.map((origin) => {
          const isSelected = data.originId === origin.id;
          return (
            <div
              key={origin.id}
              onClick={() => handleSelectOrigin(origin)}
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
                    {origin.name}
                  </h3>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setInspectOrigin(origin);
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

                {/* Main Skills Badges */}
                <div className="flex flex-wrap gap-1 my-1.5">
                  {origin.skills.slice(0, 2).map((sk, idx) => (
                    <span
                      key={idx}
                      className="text-[9px] px-1.5 py-0.5 rounded bg-amber-950/40 text-amber-300 border border-amber-900/40 truncate max-w-full"
                    >
                      {sk}
                    </span>
                  ))}
                </div>

                <p className="text-[11px] text-stone-400 line-clamp-2 leading-tight">
                  {origin.summary}
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

      {/* Inspect Origin Modal */}
      {inspectOrigin && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn">
          <div className="w-full sm:max-w-lg bg-stone-950 border border-amber-600/50 rounded-t-3xl sm:rounded-2xl p-5 shadow-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-amber-900/40 pb-3 mb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-cinzel text-lg font-bold text-amber-200">
                    {inspectOrigin.name}
                  </h3>
                  <span className="text-[11px] text-amber-500 uppercase tracking-widest font-semibold">
                    Origem de Aventureiro
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setInspectOrigin(null)}
                className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-stone-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto space-y-4 pr-1 custom-scrollbar text-xs leading-relaxed flex-1">
              <div>
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block mb-1">
                  Passado do Herói
                </span>
                <p className="text-stone-300">{inspectOrigin.summary}</p>
                {inspectOrigin.description && (
                  <p className="text-stone-400 mt-1">{inspectOrigin.description}</p>
                )}
              </div>

              {/* Skills Gained */}
              <div>
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block mb-1.5">
                  Perícias Concedidas
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {inspectOrigin.skills.map((sk, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg bg-stone-900 border border-amber-900/40 text-amber-300 font-medium text-xs"
                    >
                      {sk}
                    </span>
                  ))}
                </div>
              </div>

              {/* Items and Powers */}
              {inspectOrigin.originPowers && inspectOrigin.originPowers.length > 0 && (
                <div>
                  <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block mb-1.5">
                    Poderes da Origem
                  </span>
                  <div className="space-y-1.5">
                    {inspectOrigin.originPowers.map((pow, idx) => (
                      <div key={idx} className="p-2 rounded-lg bg-stone-900/80 border border-stone-800">
                        <span className="font-semibold text-amber-300 text-xs block">{pow.name}</span>
                        <p className="text-stone-400 text-[11px]">{pow.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {inspectOrigin.startingItems && inspectOrigin.startingItems.length > 0 && (
                <div>
                  <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block mb-1">
                    Itens Iniciais
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {inspectOrigin.startingItems.map((item, idx) => (
                      <span key={idx} className="text-[10px] px-2 py-0.5 rounded bg-stone-900 text-stone-300 border border-stone-800">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-amber-900/40 flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  handleSelectOrigin(inspectOrigin);
                  setInspectOrigin(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-stone-950 font-cinzel font-bold text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer"
              >
                <Check className="w-4 h-4 stroke-[2.5]" />
                <span>Escolher {inspectOrigin.name}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
