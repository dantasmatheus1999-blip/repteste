import React, { useState } from 'react';
import { 
  Search, 
  SlidersHorizontal, 
  X, 
  RotateCcw, 
  Heart, 
  Filter
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { LibraryCategoryId } from './types';
import { LIBRARY_CATEGORIES } from './LibraryCategorySelector';

export interface LibraryFilterState {
  searchQuery: string;
  onlyFavorites: boolean;
  // Specific facets in the Filter Modal
  spellCircle?: string; // 'all', '1'..'5'
  spellType?: string; // 'all', 'arcana', 'divina', 'universal'
  spellSchool?: string; // 'all', 'Evocação', etc.
  classCategory?: string; // 'all', 'combatente', 'conjurador', 'especialista'
  classDifficulty?: string; // 'all', 'iniciante', 'intermediario', 'avancado'
  powerCategory?: string; // 'all', 'combate', 'tormenta', 'concessao', 'geral', 'destino', 'magia'
  equipmentType?: string; // 'all', 'simples', 'marcial', 'exotica', 'fogo', 'armadura_leve', 'armadura_pesada', 'escudo'
  deityChannel?: string; // 'all', 'Positiva', 'Negativa', 'Ambas'
  monsterND?: string; // 'all', 'baixo', 'medio', 'alto', 'chefe'
}

interface LibrarySearchAndFiltersProps {
  category: LibraryCategoryId;
  filters: LibraryFilterState;
  onFilterChange: (updater: Partial<LibraryFilterState>) => void;
  onResetFilters: () => void;
  totalResultsCount: number;
  totalCategoryCount: number;
}

const SPELL_SCHOOLS = [
  'Abjuração', 'Adivinhação', 'Convocação', 'Encantamento', 
  'Evocação', 'Ilusão', 'Necromancia', 'Transmutação', 'Universal'
];

export const LibrarySearchAndFilters: React.FC<LibrarySearchAndFiltersProps> = ({
  category,
  filters,
  onFilterChange,
  onResetFilters,
  totalResultsCount,
  totalCategoryCount
}) => {
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const currentCategoryDef = LIBRARY_CATEGORIES.find(c => c.id === category) || LIBRARY_CATEGORIES[0];

  // Calculate active filter count (excluding raw text search)
  const activeFiltersCount = [
    filters.onlyFavorites,
    filters.spellCircle && filters.spellCircle !== 'all',
    filters.spellType && filters.spellType !== 'all',
    filters.spellSchool && filters.spellSchool !== 'all',
    filters.classCategory && filters.classCategory !== 'all',
    filters.classDifficulty && filters.classDifficulty !== 'all',
    filters.powerCategory && filters.powerCategory !== 'all',
    filters.equipmentType && filters.equipmentType !== 'all',
    filters.deityChannel && filters.deityChannel !== 'all',
    filters.monsterND && filters.monsterND !== 'all',
  ].filter(Boolean).length;

  return (
    <div className="space-y-2 w-full">
      {/* 1. Search & Filter Bar (Minimalist, aligned with reference) */}
      <div className="flex items-center gap-2.5 w-full">
        {/* Search Field */}
        <div className="relative flex-1 group">
          <Search 
            size={17} 
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-500 group-focus-within:text-amber-400 transition-colors pointer-events-none" 
          />
          <input
            type="text"
            value={filters.searchQuery}
            onChange={(e) => onFilterChange({ searchQuery: e.target.value })}
            placeholder={currentCategoryDef.searchPlaceholder}
            className="w-full bg-stone-900/90 text-stone-100 placeholder-stone-500 text-sm font-sans pl-10 pr-9 py-2.5 sm:py-3 rounded-lg border border-stone-800 focus:border-amber-500/60 focus:bg-stone-900 outline-none transition-all"
          />
          {filters.searchQuery && (
            <button
              onClick={() => onFilterChange({ searchQuery: '' })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300 p-1 cursor-pointer transition-colors"
              title="Limpar busca"
            >
              <X size={15} />
            </button>
          )}
        </div>

        {/* Favorite Filter Toggle */}
        <button
          onClick={() => onFilterChange({ onlyFavorites: !filters.onlyFavorites })}
          className={`h-10 sm:h-11 px-3 rounded-lg border flex items-center justify-center gap-1.5 transition-all cursor-pointer select-none ${
            filters.onlyFavorites 
              ? 'bg-rose-950/70 border-rose-500 text-rose-300 shadow-[0_0_12px_rgba(244,63,94,0.25)]' 
              : 'bg-stone-900/80 hover:bg-stone-900 border-stone-800 hover:border-stone-700 text-stone-400 hover:text-stone-200'
          }`}
          title={filters.onlyFavorites ? "Exibindo apenas favoritos" : "Filtrar por favoritos"}
        >
          <Heart size={17} className={filters.onlyFavorites ? 'fill-rose-400 text-rose-400' : ''} />
        </button>

        {/* Filters Trigger Button */}
        <button
          onClick={() => setIsFilterDrawerOpen(true)}
          className={`h-10 sm:h-11 px-3.5 sm:px-4 rounded-lg border flex items-center justify-center gap-2 font-cinzel font-bold text-xs uppercase tracking-wider transition-all cursor-pointer select-none ${
            activeFiltersCount > 0
              ? 'bg-amber-500 text-stone-950 border-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.3)]'
              : 'bg-stone-900/80 hover:bg-stone-900 text-amber-300 hover:text-amber-200 border-stone-800 hover:border-stone-700'
          }`}
        >
          <SlidersHorizontal size={15} />
          <span>Filtros</span>
          {activeFiltersCount > 0 && (
            <span className="w-4 h-4 rounded-full bg-stone-950 text-amber-300 text-[10px] flex items-center justify-center font-bold">
              {activeFiltersCount}
            </span>
          )}
        </button>
      </div>

      {/* 2. Results Count line (Clean, uncluttered, matching reference) */}
      <div className="flex items-center justify-between text-xs text-stone-400 px-1 pt-0.5">
        <span className="font-sans text-stone-400">
          Mostrando <strong className="text-amber-300 font-semibold">{totalResultsCount}</strong> de {totalCategoryCount} {currentCategoryDef.label.toLowerCase()}
        </span>

        {activeFiltersCount > 0 && (
          <button
            onClick={onResetFilters}
            className="flex items-center gap-1 text-amber-400 hover:text-amber-200 text-[11px] font-cinzel uppercase font-bold tracking-wider cursor-pointer transition-colors"
          >
            <RotateCcw size={11} />
            <span>Limpar Filtros</span>
          </button>
        )}
      </div>

      {/* 3. Detailed Filters Drawer / Modal */}
      <AnimatePresence>
        {isFilterDrawerOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
              onClick={() => setIsFilterDrawerOpen(false)}
            />

            {/* Filter Drawer / Modal */}
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-x-3 bottom-3 sm:inset-x-auto sm:right-6 sm:top-20 sm:bottom-20 z-50 sm:w-[420px] bg-stone-950 border border-stone-800 rounded-xl shadow-[0_20px_60px_rgba(0,0,0,0.95)] flex flex-col overflow-hidden max-h-[85vh]"
            >
              {/* Header */}
              <div className="p-4 border-b border-stone-800 bg-stone-900/90 flex items-center justify-between">
                <div className="flex items-center gap-2 text-amber-300">
                  <Filter size={17} />
                  <h3 className="font-cinzel font-bold text-sm uppercase tracking-wider text-amber-100">
                    Filtros de {currentCategoryDef.label}
                  </h3>
                </div>
                <button
                  onClick={() => setIsFilterDrawerOpen(false)}
                  className="p-1.5 text-stone-400 hover:text-stone-100 rounded-lg hover:bg-stone-800 transition-colors"
                >
                  <X size={17} />
                </button>
              </div>

              {/* Scrollable Filter Content */}
              <div className="p-4 space-y-5 overflow-y-auto custom-scrollbar flex-1">
                {/* Specific Filters for MAGIAS */}
                {category === 'magias' && (
                  <>
                    {/* Círculo */}
                    <div className="space-y-2">
                      <label className="text-[11px] uppercase font-cinzel font-bold tracking-wider text-amber-400">
                        Círculo de Magia
                      </label>
                      <div className="grid grid-cols-3 gap-1.5">
                        {['all', '1', '2', '3', '4', '5'].map((c) => (
                          <button
                            key={c}
                            onClick={() => onFilterChange({ spellCircle: c })}
                            className={`py-2 px-2 text-xs font-cinzel rounded-md border text-center transition-all cursor-pointer ${
                              (filters.spellCircle || 'all') === c
                                ? 'bg-amber-500 text-stone-950 font-bold border-amber-400'
                                : 'bg-stone-900 text-stone-300 border-stone-800 hover:border-stone-700'
                            }`}
                          >
                            {c === 'all' ? 'Todos' : `${c}º Círculo`}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Natureza */}
                    <div className="space-y-2">
                      <label className="text-[11px] uppercase font-cinzel font-bold tracking-wider text-amber-400">
                        Natureza Arcana / Divina
                      </label>
                      <div className="grid grid-cols-3 gap-1.5">
                        {[
                          { id: 'all', label: 'Todas' },
                          { id: 'arcana', label: 'Arcana' },
                          { id: 'divina', label: 'Divina' }
                        ].map((t) => (
                          <button
                            key={t.id}
                            onClick={() => onFilterChange({ spellType: t.id })}
                            className={`py-2 px-2 text-xs font-cinzel rounded-md border text-center transition-all cursor-pointer ${
                              (filters.spellType || 'all') === t.id
                                ? 'bg-amber-500 text-stone-950 font-bold border-amber-400'
                                : 'bg-stone-900 text-stone-300 border-stone-800 hover:border-stone-700'
                            }`}
                          >
                            {t.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Escolas de Magia */}
                    <div className="space-y-2">
                      <label className="text-[11px] uppercase font-cinzel font-bold tracking-wider text-amber-400">
                        Escola de Magia
                      </label>
                      <div className="grid grid-cols-2 gap-1.5">
                        <button
                          onClick={() => onFilterChange({ spellSchool: 'all' })}
                          className={`py-2 px-3 text-xs font-cinzel rounded-md border text-left transition-all cursor-pointer col-span-2 ${
                            (filters.spellSchool || 'all') === 'all'
                              ? 'bg-amber-500 text-stone-950 font-bold border-amber-400'
                              : 'bg-stone-900 text-stone-300 border-stone-800 hover:border-stone-700'
                          }`}
                        >
                          Todas as Escolas
                        </button>
                        {SPELL_SCHOOLS.map((school) => (
                          <button
                            key={school}
                            onClick={() => onFilterChange({ spellSchool: school })}
                            className={`py-2 px-3 text-xs font-cinzel rounded-md border text-left transition-all cursor-pointer truncate ${
                              filters.spellSchool === school
                                ? 'bg-amber-500 text-stone-950 font-bold border-amber-400'
                                : 'bg-stone-900 text-stone-300 border-stone-800 hover:border-stone-700'
                            }`}
                          >
                            {school}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* Specific Filters for CLASSES */}
                {category === 'classes' && (
                  <>
                    <div className="space-y-2">
                      <label className="text-[11px] uppercase font-cinzel font-bold tracking-wider text-amber-400">
                        Papel de Combate
                      </label>
                      <div className="grid grid-cols-1 gap-1.5">
                        {[
                          { id: 'all', label: 'Todos os Papéis' },
                          { id: 'combatente', label: 'Combatente (Dano & Defesa)' },
                          { id: 'conjurador', label: 'Conjurador (Magias)' },
                          { id: 'especialista', label: 'Especialista (Perícias & Suporte)' }
                        ].map((cat) => (
                          <button
                            key={cat.id}
                            onClick={() => onFilterChange({ classCategory: cat.id })}
                            className={`py-2.5 px-3 text-xs font-cinzel rounded-md border text-left transition-all cursor-pointer ${
                              (filters.classCategory || 'all') === cat.id
                                ? 'bg-amber-500 text-stone-950 font-bold border-amber-400'
                                : 'bg-stone-900 text-stone-300 border-stone-800 hover:border-stone-700'
                            }`}
                          >
                            {cat.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[11px] uppercase font-cinzel font-bold tracking-wider text-amber-400">
                        Dificuldade de Domínio
                      </label>
                      <div className="grid grid-cols-3 gap-1.5">
                        {[
                          { id: 'all', label: 'Todas' },
                          { id: 'iniciante', label: 'Iniciante' },
                          { id: 'avancado', label: 'Avançado' }
                        ].map((d) => (
                          <button
                            key={d.id}
                            onClick={() => onFilterChange({ classDifficulty: d.id })}
                            className={`py-2 px-2 text-xs font-cinzel rounded-md border text-center transition-all cursor-pointer ${
                              (filters.classDifficulty || 'all') === d.id
                                ? 'bg-amber-500 text-stone-950 font-bold border-amber-400'
                                : 'bg-stone-900 text-stone-300 border-stone-800 hover:border-stone-700'
                            }`}
                          >
                            {d.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* Specific Filters for PODERES */}
                {category === 'poderes' && (
                  <div className="space-y-2">
                    <label className="text-[11px] uppercase font-cinzel font-bold tracking-wider text-amber-400">
                      Categoria do Poder
                    </label>
                    <div className="grid grid-cols-2 gap-1.5">
                      {[
                        { id: 'all', label: 'Todos os Poderes' },
                        { id: 'combate', label: 'Combate' },
                        { id: 'tormenta', label: 'Tormenta' },
                        { id: 'concessao', label: 'Concessão Divina' },
                        { id: 'destino', label: 'Destino' },
                        { id: 'magia', label: 'Magia' },
                        { id: 'geral', label: 'Gerais' },
                      ].map((p) => (
                        <button
                          key={p.id}
                          onClick={() => onFilterChange({ powerCategory: p.id })}
                          className={`py-2 px-3 text-xs font-cinzel rounded-md border text-left transition-all cursor-pointer ${
                            (filters.powerCategory || 'all') === p.id
                              ? 'bg-amber-500 text-stone-950 font-bold border-amber-400'
                              : 'bg-stone-900 text-stone-300 border-stone-800 hover:border-stone-700'
                          }`}
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Specific Filters for EQUIPAMENTOS */}
                {category === 'equipamentos' && (
                  <div className="space-y-2">
                    <label className="text-[11px] uppercase font-cinzel font-bold tracking-wider text-amber-400">
                      Tipo de Equipamento
                    </label>
                    <div className="grid grid-cols-1 gap-1.5">
                      {[
                        { id: 'all', label: 'Todos os Itens' },
                        { id: 'armas_simples', label: 'Armas Simples' },
                        { id: 'armas_marciais', label: 'Armas Marciais' },
                        { id: 'armas_exoticas', label: 'Armas Exóticas' },
                        { id: 'armas_fogo', label: 'Armas de Fogo' },
                        { id: 'armaduras_leves', label: 'Armaduras Leves' },
                        { id: 'armaduras_pesadas', label: 'Armaduras Pesadas' },
                        { id: 'escudos', label: 'Escudos' },
                      ].map((e) => (
                        <button
                          key={e.id}
                          onClick={() => onFilterChange({ equipmentType: e.id })}
                          className={`py-2 px-3 text-xs font-cinzel rounded-md border text-left transition-all cursor-pointer ${
                            (filters.equipmentType || 'all') === e.id
                              ? 'bg-amber-500 text-stone-950 font-bold border-amber-400'
                              : 'bg-stone-900 text-stone-300 border-stone-800 hover:border-stone-700'
                          }`}
                        >
                          {e.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Specific Filters for DIVINDADES */}
                {category === 'divindades' && (
                  <div className="space-y-2">
                    <label className="text-[11px] uppercase font-cinzel font-bold tracking-wider text-amber-400">
                      Canalização de Energia
                    </label>
                    <div className="grid grid-cols-1 gap-1.5">
                      {[
                        { id: 'all', label: 'Qualquer Canalização' },
                        { id: 'Positiva', label: 'Energia Positiva (Cura & Luz)' },
                        { id: 'Negativa', label: 'Energia Negativa (Trevas & Dano)' },
                        { id: 'Ambas', label: 'Ambas as Energias (Escolha)' },
                      ].map((ch) => (
                        <button
                          key={ch.id}
                          onClick={() => onFilterChange({ deityChannel: ch.id })}
                          className={`py-2 px-3 text-xs font-cinzel rounded-md border text-left transition-all cursor-pointer ${
                            (filters.deityChannel || 'all') === ch.id
                              ? 'bg-amber-500 text-stone-950 font-bold border-amber-400'
                              : 'bg-stone-900 text-stone-300 border-stone-800 hover:border-stone-700'
                          }`}
                        >
                          {ch.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Specific Filters for MONSTROS */}
                {category === 'monstros' && (
                  <div className="space-y-2">
                    <label className="text-[11px] uppercase font-cinzel font-bold tracking-wider text-amber-400">
                      Nível de Desafio (ND)
                    </label>
                    <div className="grid grid-cols-2 gap-1.5">
                      {[
                        { id: 'all', label: 'Todos os NDs' },
                        { id: 'baixo', label: 'ND 1/4 até ND 1' },
                        { id: 'medio', label: 'ND 2 até ND 4' },
                        { id: 'alto', label: 'ND 5 até ND 8' },
                        { id: 'chefe', label: 'Chefes & Dragões' },
                      ].map((nd) => (
                        <button
                          key={nd.id}
                          onClick={() => onFilterChange({ monsterND: nd.id })}
                          className={`py-2 px-3 text-xs font-cinzel rounded-md border text-left transition-all cursor-pointer ${
                            (filters.monsterND || 'all') === nd.id
                              ? 'bg-amber-500 text-stone-950 font-bold border-amber-400'
                              : 'bg-stone-900 text-stone-300 border-stone-800 hover:border-stone-700'
                          }`}
                        >
                          {nd.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Actions */}
              <div className="p-3.5 border-t border-stone-800 bg-stone-900/90 flex items-center gap-2.5">
                <button
                  onClick={onResetFilters}
                  className="flex-1 py-2.5 px-3 rounded-lg border border-stone-800 hover:border-stone-700 text-stone-300 hover:text-white font-cinzel text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Restaurar
                </button>
                <button
                  onClick={() => setIsFilterDrawerOpen(false)}
                  className="flex-1 py-2.5 px-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 font-cinzel text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-md"
                >
                  Ver Resultados ({totalResultsCount})
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
