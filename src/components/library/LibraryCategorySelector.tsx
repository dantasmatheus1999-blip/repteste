import React, { useState } from 'react';
import { 
  ChevronDown, 
  Check, 
  X,
  BookOpen
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { LibraryCategoryId, LibraryCategoryDef } from './types';
import { getCleanCategoryIcon } from './LibraryIcons';

export const LIBRARY_CATEGORIES: LibraryCategoryDef[] = [
  {
    id: 'magias',
    label: 'MAGIAS',
    singular: 'Magia',
    searchPlaceholder: 'Buscar magia pelo nome, círculo ou escola...',
    description: 'Círculos arcanos, divinos e universais de Arton.',
    iconName: 'MagiasIcon',
    color: 'from-amber-500/10 to-yellow-600/10',
    badgeBg: 'bg-amber-950/60',
    badgeText: 'text-amber-300'
  },
  {
    id: 'classes',
    label: 'CLASSES',
    singular: 'Classe',
    searchPlaceholder: 'Buscar classe, papel ou habilidades...',
    description: 'Especializações e caminhos dos heróis de Arton.',
    iconName: 'ClassesIcon',
    color: 'from-blue-500/10 to-indigo-600/10',
    badgeBg: 'bg-blue-950/60',
    badgeText: 'text-blue-300'
  },
  {
    id: 'racas',
    label: 'RAÇAS',
    singular: 'Raça',
    searchPlaceholder: 'Buscar raça, bônus ou características...',
    description: 'Povos, linhagens e habilidades ancestrais.',
    iconName: 'RacasIcon',
    color: 'from-emerald-500/10 to-teal-600/10',
    badgeBg: 'bg-emerald-950/60',
    badgeText: 'text-emerald-300'
  },
  {
    id: 'origens',
    label: 'ORIGENS',
    singular: 'Origem',
    searchPlaceholder: 'Buscar origem, perícias ou benefícios...',
    description: 'Histórico de vida e itens de partida.',
    iconName: 'OrigensIcon',
    color: 'from-cyan-500/10 to-blue-600/10',
    badgeBg: 'bg-cyan-950/60',
    badgeText: 'text-cyan-300'
  },
  {
    id: 'poderes',
    label: 'PODERES',
    singular: 'Poder',
    searchPlaceholder: 'Buscar poder geral, combate ou tormenta...',
    description: 'Poderes gerais, combate, tormenta e magia.',
    iconName: 'PoderesIcon',
    color: 'from-purple-500/10 to-pink-600/10',
    badgeBg: 'bg-purple-950/60',
    badgeText: 'text-purple-300'
  },
  {
    id: 'equipamentos',
    label: 'EQUIPAMENTOS',
    singular: 'Equipamento',
    searchPlaceholder: 'Buscar arma, armadura ou escudo...',
    description: 'Armas simples, marciais, armaduras e escudos.',
    iconName: 'EquipamentosIcon',
    color: 'from-amber-600/10 to-red-600/10',
    badgeBg: 'bg-orange-950/60',
    badgeText: 'text-orange-300'
  },
  {
    id: 'divindades',
    label: 'DIVINDADES',
    singular: 'Divindade',
    searchPlaceholder: 'Buscar divindade do Panteão ou dogmas...',
    description: 'O Panteão dos Vinte Deuses e poderes concedidos.',
    iconName: 'DivindadesIcon',
    color: 'from-yellow-500/10 to-orange-600/10',
    badgeBg: 'bg-yellow-950/60',
    badgeText: 'text-yellow-300'
  },
  {
    id: 'monstros',
    label: 'MONSTROS',
    singular: 'Monstro',
    searchPlaceholder: 'Buscar monstros por ND ou tipo...',
    description: 'Bestiário canônico e criaturas de Arton.',
    iconName: 'MonstrosIcon',
    color: 'from-red-600/10 to-rose-700/10',
    badgeBg: 'bg-red-950/60',
    badgeText: 'text-red-300'
  }
];

interface LibraryCategorySelectorProps {
  activeCategory: LibraryCategoryId;
  onSelectCategory: (category: LibraryCategoryId) => void;
  itemCounts: Record<LibraryCategoryId, number>;
}

export const LibraryCategorySelector: React.FC<LibraryCategorySelectorProps> = ({
  activeCategory,
  onSelectCategory,
  itemCounts
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const currentCategory = LIBRARY_CATEGORIES.find(c => c.id === activeCategory) || LIBRARY_CATEGORIES[0];
  const CurrentIcon = getCleanCategoryIcon(currentCategory.id);

  return (
    <div className="relative w-full select-none">
      {/* Category Header Card (Modeled on Image 1 "Spells" banner) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full group relative flex items-center justify-between px-3.5 sm:px-4 py-2.5 sm:py-3 bg-stone-900/90 hover:bg-stone-900 border border-stone-800 hover:border-amber-500/50 rounded-lg shadow-sm transition-all duration-150 cursor-pointer"
      >
        {/* Left: Icon and Category Title */}
        <div className="flex items-center gap-3 relative z-10 min-w-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-stone-950 border border-stone-800 group-hover:border-amber-400/60 flex items-center justify-center text-amber-300 shrink-0 transition-colors">
            <CurrentIcon size={20} strokeWidth={1.75} />
          </div>

          <div className="text-left min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm sm:text-base font-cinzel font-bold tracking-wider text-amber-100 group-hover:text-amber-200 uppercase truncate">
                {currentCategory.label}
              </span>
              <span className="text-[11px] font-sans text-stone-500 hidden xs:inline">
                ({itemCounts[currentCategory.id] || 0})
              </span>
            </div>
          </div>
        </div>

        {/* Right: Clean Dropdown Indicator */}
        <div className="flex items-center gap-2 text-stone-400 group-hover:text-amber-300 relative z-10 shrink-0">
          <span className="text-[11px] font-cinzel uppercase tracking-wider font-semibold text-stone-400 hidden sm:inline">
            Trocar Categoria
          </span>
          <div className={`p-1 rounded-md text-stone-400 group-hover:text-amber-300 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
            <ChevronDown size={17} />
          </div>
        </div>
      </button>

      {/* Category Selection Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 z-40 bg-black/70 backdrop-blur-xs"
              onClick={() => setIsOpen(false)}
            />

            {/* Menu */}
            <motion.div
              initial={{ opacity: 0, y: -6, scale: 0.99 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.99 }}
              transition={{ duration: 0.15 }}
              className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-stone-950 border border-stone-800 rounded-xl shadow-2xl overflow-hidden max-h-[80vh] flex flex-col"
            >
              {/* Header inside picker */}
              <div className="p-3 border-b border-stone-800 bg-stone-900/90 flex items-center justify-between">
                <span className="font-cinzel text-xs font-bold uppercase tracking-wider text-stone-300">
                  Categorias da Biblioteca
                </span>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 text-stone-400 hover:text-stone-200 rounded-md transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Grid of Categories */}
              <div className="p-2 grid grid-cols-1 sm:grid-cols-2 gap-1.5 overflow-y-auto max-h-[60vh] custom-scrollbar">
                {LIBRARY_CATEGORIES.map((cat) => {
                  const Icon = getCleanCategoryIcon(cat.id);
                  const isSelected = cat.id === activeCategory;
                  const count = itemCounts[cat.id] || 0;

                  return (
                    <button
                      key={cat.id}
                      onClick={() => {
                        onSelectCategory(cat.id);
                        setIsOpen(false);
                      }}
                      className={`flex items-center justify-between p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                        isSelected 
                          ? 'bg-amber-500/10 border-amber-500/60 text-amber-200' 
                          : 'bg-stone-900/50 hover:bg-stone-900 border-stone-800/80 hover:border-stone-700 text-stone-300'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className={`w-8 h-8 rounded-md flex items-center justify-center shrink-0 border ${
                          isSelected 
                            ? 'bg-amber-500/20 border-amber-400/60 text-amber-300' 
                            : 'bg-stone-950 border-stone-800 text-stone-400'
                        }`}>
                          <Icon size={16} strokeWidth={1.75} />
                        </div>

                        <div className="min-w-0">
                          <span className={`font-cinzel font-bold text-xs tracking-wide block ${
                            isSelected ? 'text-amber-200' : 'text-stone-200'
                          }`}>
                            {cat.label}
                          </span>
                          <span className="text-[10px] text-stone-500 font-sans">
                            {count} itens
                          </span>
                        </div>
                      </div>

                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-amber-400/20 border border-amber-400/80 flex items-center justify-center text-amber-300 shrink-0">
                          <Check size={12} strokeWidth={2.5} />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
