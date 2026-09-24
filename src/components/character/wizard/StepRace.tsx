import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Check,
  Info,
  X,
  ChevronDown,
  Shield,
  Hexagon
} from 'lucide-react';
import { ref, getDownloadURL } from 'firebase/storage';
import { WizardData } from './types';
import { T20_RACES } from '../../../data/t20Races';
import { storage, resolveStorageUrlWithFallback } from '../../../firebase/storage';

interface StepRaceProps {
  data: WizardData;
  onChange: (updates: Partial<WizardData>) => void;
}

export const RACE_STORAGE_PATH_MAP: Record<string, string> = {
  'humano': 'img-capas/racas/01_humano.png',
  'anao': 'img-capas/racas/02_anao.png',
  'dahllan': 'img-capas/racas/03_dahllan.png',
  'elfo': 'img-capas/racas/04_elfo.png',
  'goblin': 'img-capas/racas/05_goblin.png',
  'lefou': 'img-capas/racas/06_lefou.png',
  'minotauro': 'img-capas/racas/07_minotauro.png',
  'qareen': 'img-capas/racas/08_qareen.png',
  'golem': 'img-capas/racas/09_golem.png',
  'hynne': 'img-capas/racas/10_hynne.png',
  'kliren': 'img-capas/racas/11_kliren.png',
  'medusa': 'img-capas/racas/12_medusa.png',
  'osteon': 'img-capas/racas/13_osteon.png',
  'sereia-tritao': 'img-capas/racas/14_sereia_tritao.png',
  'sereia': 'img-capas/racas/14_sereia_tritao.png',
  'silfide': 'img-capas/racas/15_silfide.png',
  'suraggel': 'img-capas/racas/16_suraggel.png',
  'trog': 'img-capas/racas/17_trog.png'
};

export const StepRace: React.FC<StepRaceProps> = ({ data, onChange }) => {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [inspectRace, setInspectRace] = useState<typeof T20_RACES[0] | null>(null);
  const [raceImages, setRaceImages] = useState<Record<string, string>>({});

  // Carrega as URLs das imagens das 17 raças a partir de img-capas/racas/ via getDownloadURL
  useEffect(() => {
    let isMounted = true;

    async function loadAllRaceImages() {
      const urls: Record<string, string> = {};

      await Promise.all(
        Object.entries(RACE_STORAGE_PATH_MAP).map(async ([raceId, storagePath]) => {
          try {
            const imageRef = ref(storage, storagePath);
            const imageUrl = await getDownloadURL(imageRef);
            if (imageUrl) {
              urls[raceId] = imageUrl;
            }
          } catch (err: any) {
            try {
              const fallbackUrl = await resolveStorageUrlWithFallback(storagePath);
              if (fallbackUrl) {
                urls[raceId] = fallbackUrl;
              }
            } catch (fallbackErr: any) {
              console.warn(`[RACAS] Falha ao carregar imagem para ${raceId} (${storagePath}):`, fallbackErr?.message || fallbackErr);
            }
          }
        })
      );

      if (isMounted) {
        setRaceImages((prev) => ({ ...prev, ...urls }));
      }
    }

    loadAllRaceImages();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredRaces = useMemo(() => {
    return T20_RACES.filter((race) => {
      // Text Search
      const matchesSearch =
        !search.trim() ||
        race.name.toLowerCase().includes(search.toLowerCase()) ||
        race.summary.toLowerCase().includes(search.toLowerCase()) ||
        race.description.toLowerCase().includes(search.toLowerCase());

      if (!matchesSearch) return false;

      // Filter logic
      if (filter === 'all') return true;
      if (filter === 'small') {
        return race.id === 'hynne' || race.id === 'goblin' || race.id === 'silfide';
      }

      // Attribute filters
      const attrMatch = race.attributeModifiers.some((mod) => {
        const a = mod.attribute.toLowerCase();
        if (filter === 'for') return a.startsWith('for');
        if (filter === 'des') return a.startsWith('des');
        if (filter === 'con') return a.startsWith('con');
        if (filter === 'int') return a.startsWith('int');
        if (filter === 'sab') return a.startsWith('sab');
        if (filter === 'car') return a.startsWith('car');
        if (filter === 'free') {
          return (
            a.includes('três') ||
            a.includes('tres') ||
            a.includes('livre') ||
            a.includes('escolha')
          );
        }
        return false;
      });

      return attrMatch;
    });
  }, [search, filter]);

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

  // Helper to extract attribute modifier chips cleanly
  const getFormattedModifiers = (race: typeof T20_RACES[0]) => {
    const isSpecial = race.attributeModifiers.some(
      (m) =>
        m.attribute.toLowerCase().includes('três') ||
        m.attribute.toLowerCase().includes('tres') ||
        m.attribute.toLowerCase().includes('livre') ||
        m.attribute.toLowerCase().includes('escolha')
    );

    if (isSpecial) {
      const val = race.attributeModifiers[0]?.value || 1;
      return [
        {
          label: 'TRÊ',
          sign: val > 0 ? `+${val}` : `${val}`,
          isSpecial: true
        }
      ];
    }

    const mapAttr = (attr: string): string => {
      const a = attr.toLowerCase();
      if (a.startsWith('for')) return 'FOR';
      if (a.startsWith('des')) return 'DES';
      if (a.startsWith('con')) return 'CON';
      if (a.startsWith('int')) return 'INT';
      if (a.startsWith('sab')) return 'SAB';
      if (a.startsWith('car')) return 'CAR';
      return attr.slice(0, 3).toUpperCase();
    };

    // Sort to show highest bonuses first, take top 2 for card display
    const sorted = [...race.attributeModifiers].sort((a, b) => b.value - a.value);

    return sorted.slice(0, 2).map((mod) => ({
      label: mapAttr(mod.attribute),
      sign: mod.value > 0 ? `+${mod.value}` : `${mod.value}`,
      isSpecial: false
    }));
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
            placeholder="Buscar raça..."
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
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="appearance-none bg-[#0a0d14] border border-[#202533] hover:border-[#384156] focus:border-[#d4af37]/60 rounded-xl pl-4 pr-9 py-2.5 text-xs sm:text-sm text-stone-200 focus:outline-none focus:ring-1 focus:ring-[#d4af37]/40 font-sans cursor-pointer transition-all"
          >
            <option value="all" className="bg-[#0a0d14] text-stone-200">
              Todas
            </option>
            <option value="for" className="bg-[#0a0d14] text-stone-200">
              Bônus em Força
            </option>
            <option value="des" className="bg-[#0a0d14] text-stone-200">
              Bônus em Destreza
            </option>
            <option value="con" className="bg-[#0a0d14] text-stone-200">
              Bônus em Constituição
            </option>
            <option value="int" className="bg-[#0a0d14] text-stone-200">
              Bônus em Inteligência
            </option>
            <option value="sab" className="bg-[#0a0d14] text-stone-200">
              Bônus em Sabedoria
            </option>
            <option value="car" className="bg-[#0a0d14] text-stone-200">
              Bônus em Carisma
            </option>
            <option value="free" className="bg-[#0a0d14] text-stone-200">
              Atributos Livres
            </option>
            <option value="small" className="bg-[#0a0d14] text-stone-200">
              Tamanho Pequeno
            </option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
        </div>
      </div>

      {/* 3-Column Grid of Race Cards (Matches Reference Image Exactly) */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3 md:gap-4 pb-6">
        {filteredRaces.map((race) => {
          const isSelected = data.raceId === race.id;
          const modifiers = getFormattedModifiers(race);
          const raceImage = raceImages[race.id];

          return (
            <div
              key={race.id}
              onClick={() => handleSelectRace(race)}
              className={`group relative text-left rounded-xl sm:rounded-2xl border transition-all duration-200 cursor-pointer select-none flex flex-col justify-between overflow-hidden bg-[#0d1017] ${
                isSelected
                  ? 'border-2 border-[#d4af37] shadow-[0_0_20px_rgba(212,175,55,0.28)] ring-1 ring-[#d4af37]/50'
                  : 'border-[#1e2433] hover:border-amber-700/50 hover:bg-[#10141f]'
              }`}
            >
              {/* TOP: Image Area (Tall Vertical / Portrait with Fade) */}
              <div className="relative w-full aspect-[4/5] sm:aspect-[3/4] overflow-hidden bg-[#07090e] flex items-center justify-center shrink-0">
                {raceImage ? (
                  <img
                    src={raceImage}
                    alt={race.name}
                    className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full bg-[#0d1017] animate-pulse" />
                )}

                {/* Bottom Fade Scrim blending into card body */}
                <div className="absolute inset-x-0 bottom-0 h-12 sm:h-16 bg-gradient-to-t from-[#0d1017] via-[#0d1017]/70 to-transparent pointer-events-none" />

                {/* Selected Checkmark Badge (Top Right) */}
                {isSelected && (
                  <div className="absolute top-1.5 right-1.5 sm:top-2.5 sm:right-2.5 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#d4af37] text-stone-950 flex items-center justify-center shadow-lg font-bold z-10 animate-in fade-in zoom-in duration-200">
                    <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 stroke-[3]" />
                  </div>
                )}

                {/* Details Info Trigger (Top Left) */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setInspectRace(race);
                  }}
                  className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 p-1 rounded-full bg-[#080a0f]/80 border border-stone-700/40 text-stone-400 hover:text-amber-300 hover:border-amber-500/60 transition-colors z-10 backdrop-blur-xs"
                  title="Ver detalhes da raça"
                >
                  <Info className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                </button>
              </div>

              {/* BOTTOM: Card Content (Name -> Modifiers -> Description) */}
              <div className="px-2 sm:px-3 pt-1 pb-2.5 sm:pb-3 flex flex-col items-center flex-1 justify-between text-center">
                <div className="w-full flex flex-col items-center">
                  {/* Race Name */}
                  <h3 className="font-cinzel text-[11px] sm:text-xs md:text-sm font-bold uppercase tracking-widest text-[#f0dfb8] leading-snug">
                    {race.name}
                  </h3>

                  {/* Tiny Ornate Diamond */}
                  <div className="flex items-center justify-center my-0.5 sm:my-1 opacity-70">
                    <div className="w-1.5 h-1.5 rotate-45 bg-[#967432]" />
                  </div>

                  {/* Attribute Modifiers Badges */}
                  <div className="flex flex-wrap items-center justify-center gap-1 my-0.5 sm:my-1 w-full">
                    {modifiers.map((mod, idx) => (
                      <div
                        key={idx}
                        className="inline-flex items-center gap-0.5 sm:gap-1 px-1.5 py-0.5 rounded-md bg-[#080a0f] border border-[#30281b] text-[8px] sm:text-[10px] md:text-[11px] font-mono shadow-xs"
                      >
                        {mod.isSpecial && (
                          <Hexagon className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[#d4af37] stroke-[1.75]" />
                        )}
                        <span className="text-[#a89060] font-bold tracking-wider">
                          {mod.label}
                        </span>
                        <span className="text-[#f3cb69] font-bold">
                          {mod.sign}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Summary Lore / Description */}
                  <p className="text-[9px] sm:text-[10px] md:text-xs text-stone-300/80 line-clamp-3 sm:line-clamp-4 leading-snug sm:leading-relaxed font-sans mt-0.5 sm:mt-1 px-0.5">
                    {race.summary}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Inspect Race Modal */}
      {inspectRace && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-150">
          <div className="w-full sm:max-w-lg bg-[#0d1017] border border-amber-600/50 rounded-t-3xl sm:rounded-2xl p-5 shadow-2xl max-h-[85vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-amber-900/40 pb-3 mb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-500/15 text-[#d4af37] border border-amber-500/30">
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
                      className="p-2 rounded-lg bg-[#080a0f] border border-amber-900/30 flex items-center justify-between font-mono"
                    >
                      <span className="text-stone-300">{mod.attribute}</span>
                      <span className="text-[#f3cb69] font-bold">
                        {mod.value > 0 ? `+${mod.value}` : mod.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Racial Abilities */}
              {inspectRace.racialAbilities &&
                inspectRace.racialAbilities.length > 0 && (
                  <div>
                    <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block mb-1.5">
                      Habilidades Raciais
                    </span>
                    <div className="space-y-2">
                      {inspectRace.racialAbilities.map((ab, idx) => (
                        <div
                          key={idx}
                          className="p-2.5 rounded-lg bg-[#080a0f] border border-stone-800"
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

            {/* Modal Footer */}
            <div className="mt-4 pt-3 border-t border-amber-900/40 flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  handleSelectRace(inspectRace);
                  setInspectRace(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#cfa13e] via-[#e5c07b] to-[#cfa13e] hover:brightness-110 text-stone-950 font-cinzel font-bold text-xs flex items-center justify-center gap-2 shadow-lg cursor-pointer"
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
