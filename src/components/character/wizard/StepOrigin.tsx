import React, { useState, useMemo } from 'react';
import {
  Search,
  Check,
  Info,
  X,
  ChevronDown,
  ChevronRight,
  Filter,
  Sun,
  Heart,
  Eye,
  Crown,
  Swords,
  BookOpen,
  Shield,
  Compass,
  Sparkles,
  Award,
  Anchor,
  Flame,
  Music,
  Hammer,
  Pickaxe,
  Briefcase,
  Crosshair,
  Skull,
  Feather,
  Coins
} from 'lucide-react';
import { WizardData } from './types';
import { T20_ORIGINS } from '../../../data/t20Origins';

interface StepOriginProps {
  data: WizardData;
  onChange: (updates: Partial<WizardData>) => void;
}

// Helper to assign a rich thematic fantasy emblem for each origin
const getOriginEmblem = (originId: string) => {
  switch (originId) {
    case 'acolito':
      return Sun;
    case 'amigo-dos-animais':
      return Heart;
    case 'amnesico':
      return Eye;
    case 'aristocrata':
      return Crown;
    case 'soldado':
    case 'gladiador':
    case 'guarda':
      return Swords;
    case 'erudito':
    case 'estudioso':
      return BookOpen;
    case 'artesao':
      return Hammer;
    case 'artista':
      return Music;
    case 'assistente-de-laboratorio':
      return Sparkles;
    case 'batedor':
    case 'explorador':
      return Compass;
    case 'capanga':
    case 'criminoso':
      return Skull;
    case 'cavaleiro':
      return Shield;
    case 'charlatao':
      return Feather;
    case 'circense':
      return Award;
    case 'fazendeiro':
    case 'minerador':
      return Pickaxe;
    case 'marinheiro':
      return Anchor;
    case 'membro-de-seita':
      return Flame;
    case 'mercador':
      return Coins;
    case 'nobre':
      return Crown;
    case 'cacador':
      return Crosshair;
    default:
      return Briefcase;
  }
};

export const StepOrigin: React.FC<StepOriginProps> = ({ data, onChange }) => {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [inspectOrigin, setInspectOrigin] = useState<typeof T20_ORIGINS[0] | null>(null);

  const filteredOrigins = useMemo(() => {
    return T20_ORIGINS.filter((origin) => {
      // Text Search
      const matchesSearch =
        !search.trim() ||
        origin.name.toLowerCase().includes(search.toLowerCase()) ||
        origin.summary.toLowerCase().includes(search.toLowerCase()) ||
        origin.skills.some((s) => s.toLowerCase().includes(search.toLowerCase())) ||
        (origin.description && origin.description.toLowerCase().includes(search.toLowerCase()));

      if (!matchesSearch) return false;

      // Filter Logic
      if (filter === 'all') return true;
      if (filter === 'combat') {
        return (
          origin.skills.some((s) => s.toLowerCase().includes('luta') || s.toLowerCase().includes('pontaria') || s.toLowerCase().includes('atletismo')) ||
          origin.id === 'soldado' ||
          origin.id === 'gladiador' ||
          origin.id === 'guarda'
        );
      }
      if (filter === 'magic') {
        return (
          origin.skills.some((s) => s.toLowerCase().includes('misticismo') || s.toLowerCase().includes('religião') || s.toLowerCase().includes('cura')) ||
          origin.id === 'acolito' ||
          origin.id === 'assistente-de-laboratorio'
        );
      }
      if (filter === 'social') {
        return (
          origin.skills.some((s) => s.toLowerCase().includes('diplomacia') || s.toLowerCase().includes('enganação') || s.toLowerCase().includes('nobreza')) ||
          origin.id === 'aristocrata' ||
          origin.id === 'charlatao'
        );
      }
      if (filter === 'knowledge') {
        return (
          origin.skills.some((s) => s.toLowerCase().includes('conhecimento') || s.toLowerCase().includes('investigação') || s.toLowerCase().includes('percepção')) ||
          origin.id === 'erudito'
        );
      }

      return true;
    });
  }, [search, filter]);

  const handleSelectOrigin = (origin: typeof T20_ORIGINS[0]) => {
    onChange({
      originId: origin.id,
      originName: origin.name
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col space-y-3 sm:space-y-4">
      {/* Search & Filter Bar */}
      <div className="flex items-center gap-2 sm:gap-3 px-0.5">
        {/* Search Field */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar origem..."
            className="w-full bg-[#0a0d14] border border-[#202533] hover:border-[#384156] focus:border-[#d4af37]/60 rounded-xl pl-10 pr-8 py-2.5 text-xs sm:text-sm text-stone-200 placeholder-stone-500 focus:outline-none focus:ring-1 focus:ring-[#d4af37]/40 transition-all font-sans"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300 transition-colors p-0.5"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter Dropdown */}
        <div className="relative shrink-0">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-stone-400">
            <Filter className="w-3.5 h-3.5" />
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="appearance-none bg-[#0a0d14] border border-[#202533] hover:border-[#384156] focus:border-[#d4af37]/60 rounded-xl pl-8 pr-9 py-2.5 text-xs sm:text-sm text-stone-200 focus:outline-none focus:ring-1 focus:ring-[#d4af37]/40 font-sans cursor-pointer transition-all"
          >
            <option value="all" className="bg-[#0a0d14] text-stone-200">
              Todas
            </option>
            <option value="combat" className="bg-[#0a0d14] text-stone-200">
              Combate
            </option>
            <option value="magic" className="bg-[#0a0d14] text-stone-200">
              Mágicas / Religiosas
            </option>
            <option value="social" className="bg-[#0a0d14] text-stone-200">
              Sociais / Nobreza
            </option>
            <option value="knowledge" className="bg-[#0a0d14] text-stone-200">
              Conhecimento
            </option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
        </div>
      </div>

      {/* 2-Column Grid of Origin Cards (Matches Reference Image 2 Exactly) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pb-6">
        {filteredOrigins.map((origin) => {
          const isSelected = data.originId === origin.id;
          const EmblemIcon = getOriginEmblem(origin.id);

          return (
            <div
              key={origin.id}
              onClick={() => handleSelectOrigin(origin)}
              className={`group relative text-left rounded-2xl border p-3.5 sm:p-4 transition-all duration-200 cursor-pointer select-none flex flex-col justify-between overflow-hidden bg-[#0a0d14]/95 ${
                isSelected
                  ? 'border-2 border-[#d4af37] shadow-[0_0_22px_rgba(212,175,55,0.32)] ring-1 ring-[#d4af37]/40'
                  : 'border-[#1e2434] hover:border-amber-700/50 hover:bg-[#0e121c]'
              }`}
            >
              {/* Top Row: Emblem Medallion + Ambient Vignette + Checkmark / Info */}
              <div className="flex items-start justify-between gap-3 mb-2.5">
                {/* Medallion with Dual Ring & Golden Thematic Emblem */}
                <div className="relative flex items-center gap-3">
                  <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-gradient-to-b from-[#1c2230] via-[#0d1017] to-[#080a0f] border-2 border-[#785b28] p-0.5 flex items-center justify-center shadow-inner shrink-0 group-hover:border-[#d4af37] transition-colors">
                    <div className="w-full h-full rounded-full border border-amber-500/20 flex items-center justify-center">
                      <EmblemIcon className="w-6 h-6 sm:w-7 sm:h-7 text-[#e5c07b] stroke-[1.5] transition-transform duration-300 group-hover:scale-110" />
                    </div>
                  </div>
                </div>

                {/* Right Top Actions (Checkmark or Info Button) */}
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setInspectOrigin(origin);
                    }}
                    className="p-1 rounded-full bg-[#080a0f]/80 border border-stone-700/40 text-stone-400 hover:text-amber-300 hover:border-amber-500/60 transition-colors"
                    title="Ver detalhes da origem"
                  >
                    <Info className="w-3.5 h-3.5" />
                  </button>

                  {isSelected && (
                    <div className="w-6 h-6 rounded-full bg-[#d4af37] text-stone-950 flex items-center justify-center shadow-md font-bold animate-in fade-in zoom-in duration-200">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  )}
                </div>
              </div>

              {/* Middle Section: Origin Name & Skill/Benefit Badges */}
              <div className="space-y-1.5 flex-1">
                <h3 className="font-cinzel text-sm sm:text-base font-bold uppercase tracking-wider text-[#f0dfb8] leading-snug">
                  {origin.name}
                </h3>

                {/* Skills Chips / Badges with Ornate Diamond Divider */}
                <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                  {origin.skills.slice(0, 2).map((skill, idx) => (
                    <React.Fragment key={idx}>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-[#080a0f] border border-[#30281b] text-[10px] sm:text-[11px] text-[#f3cb69] font-sans font-medium shadow-xs">
                        {skill}
                      </span>
                      {idx === 0 && origin.skills.length > 1 && (
                        <span className="text-[#785b28] text-[10px]">❖</span>
                      )}
                    </React.Fragment>
                  ))}
                  {origin.skills.length > 2 && (
                    <span className="text-[10px] text-stone-500 font-sans">
                      +{origin.skills.length - 2}
                    </span>
                  )}
                </div>

                {/* Summary Lore / Description */}
                <p className="text-[11px] sm:text-xs text-stone-300/80 line-clamp-3 leading-relaxed font-sans pt-1">
                  {origin.summary}
                </p>
              </div>

              {/* Bottom Subtle Navigation Indicator */}
              <div className="mt-2.5 pt-2 border-t border-[#1e2434]/60 flex items-center justify-between text-[10px]">
                <span className={isSelected ? 'text-[#d4af37] font-semibold' : 'text-stone-500'}>
                  {isSelected ? '✓ Origem Selecionada' : 'Toque para escolher'}
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-[#785b28] group-hover:text-[#d4af37] transition-colors" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Inspect Origin Modal */}
      {inspectOrigin && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-150">
          <div className="w-full sm:max-w-lg bg-[#0d1017] border border-amber-600/50 rounded-t-3xl sm:rounded-2xl p-5 shadow-2xl max-h-[85vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-amber-900/40 pb-3 mb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-500/15 text-[#d4af37] border border-amber-500/30">
                  <Compass className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-cinzel text-lg font-bold text-amber-200">
                    {inspectOrigin.name}
                  </h3>
                  <span className="text-[11px] text-amber-500 uppercase tracking-widest font-semibold">
                    Origem de Tormenta 20
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setInspectOrigin(null)}
                className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-stone-900 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scroll Content */}
            <div className="overflow-y-auto space-y-4 pr-1 custom-scrollbar text-xs leading-relaxed flex-1">
              <div>
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block mb-1">
                  Visão Geral
                </span>
                <p className="text-stone-300">{inspectOrigin.summary}</p>
                {inspectOrigin.description && (
                  <p className="text-stone-400 mt-1">{inspectOrigin.description}</p>
                )}
              </div>

              {/* Skills */}
              <div>
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block mb-1.5">
                  Perícias Disponíveis
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {inspectOrigin.skills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg bg-[#080a0f] border border-amber-900/30 text-stone-200 font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Starting Items */}
              {inspectOrigin.startingItems && inspectOrigin.startingItems.length > 0 && (
                <div>
                  <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block mb-1.5">
                    Itens Iniciais
                  </span>
                  <ul className="list-disc list-inside space-y-1 text-stone-300">
                    {inspectOrigin.startingItems.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Origin Powers */}
              {inspectOrigin.originPowers && inspectOrigin.originPowers.length > 0 && (
                <div>
                  <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block mb-1.5">
                    Poderes da Origem
                  </span>
                  <div className="space-y-2">
                    {inspectOrigin.originPowers.map((pow, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-lg bg-[#080a0f] border border-stone-800"
                      >
                        <h4 className="font-cinzel text-amber-300 font-bold text-xs mb-0.5">
                          {pow.name}
                        </h4>
                        <p className="text-stone-400 text-[11px] leading-relaxed">
                          {pow.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="mt-4 pt-3 border-t border-amber-900/40 flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  handleSelectOrigin(inspectOrigin);
                  setInspectOrigin(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#cfa13e] via-[#e5c07b] to-[#cfa13e] hover:brightness-110 text-stone-950 font-cinzel font-bold text-xs flex items-center justify-center gap-2 shadow-lg cursor-pointer"
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
