import React from 'react';
import { 
  ChevronRight, 
  Heart, 
  BookOpen
} from 'lucide-react';
import { UnifiedLibraryItem, LibraryCategoryId } from './types';
import { getCleanCategoryIcon, getCleanSchoolIcon } from './LibraryIcons';

// School background color styles inspired by the reference
const getSchoolStyle = (school?: string) => {
  switch (school) {
    case 'Necromancia':
      return 'bg-emerald-950/50 text-emerald-300 border-emerald-800/30';
    case 'Abjuração':
      return 'bg-sky-950/50 text-sky-300 border-sky-800/30';
    case 'Transmutação':
      return 'bg-amber-950/50 text-amber-300 border-amber-800/30';
    case 'Evocação':
      return 'bg-rose-950/50 text-rose-300 border-rose-800/30';
    case 'Encantamento':
      return 'bg-purple-950/50 text-purple-300 border-purple-800/30';
    case 'Ilusão':
      return 'bg-indigo-950/50 text-indigo-300 border-indigo-800/30';
    case 'Adivinhação':
      return 'bg-cyan-950/50 text-cyan-300 border-cyan-800/30';
    case 'Convocação':
      return 'bg-teal-950/50 text-teal-300 border-teal-800/30';
    default:
      return 'bg-stone-900/80 text-amber-300 border-stone-800/80';
  }
};

interface LibraryItemListProps {
  items: UnifiedLibraryItem[];
  category: LibraryCategoryId;
  onSelectItem: (item: UnifiedLibraryItem) => void;
  favorites: string[];
  onToggleFavorite: (id: string) => void;
  hasMore: boolean;
  onLoadMore: () => void;
}

export const LibraryItemList: React.FC<LibraryItemListProps> = ({
  items,
  category,
  onSelectItem,
  favorites,
  onToggleFavorite,
  hasMore,
  onLoadMore
}) => {
  if (items.length === 0) {
    return (
      <div className="py-12 text-center space-y-2.5 px-4 my-2">
        <div className="w-11 h-11 mx-auto rounded-full bg-stone-900/80 border border-stone-800 flex items-center justify-center text-stone-500">
          <BookOpen size={20} />
        </div>
        <div className="space-y-1">
          <h4 className="font-cinzel text-sm font-bold text-stone-300">Nenhum registro encontrado</h4>
          <p className="text-xs text-stone-500 max-w-sm mx-auto font-sans">
            Tente ajustar os termos de busca ou limpar os filtros da Biblioteca.
          </p>
        </div>
      </div>
    );
  }

  // Helper to pick the clean vector icon
  const getItemIcon = (item: UnifiedLibraryItem) => {
    if (category === 'magias') {
      const school = item.rawItem?.school;
      return getCleanSchoolIcon(school);
    }
    return getCleanCategoryIcon(category);
  };

  return (
    <div className="w-full">
      {/* 
        NO OUTER BOX, NO CARD BACKGROUND, NO BORDER WRAPPER.
        Direct list sitting seamlessly on the library background with subtle hairline dividers.
      */}
      <div className="w-full">
        {items.map((item) => {
          const isFav = favorites.includes(item.id);
          const Icon = getItemIcon(item);
          const schoolStyle = category === 'magias' 
            ? getSchoolStyle(item.rawItem?.school) 
            : 'bg-stone-900/80 text-amber-300 border-stone-800/80';

          return (
            <div
              key={item.id}
              onClick={() => onSelectItem(item)}
              className="group flex items-center justify-between py-3 px-1 sm:px-2 border-b border-stone-800/40 hover:bg-white/[0.02] active:bg-white/[0.04] transition-colors duration-150 cursor-pointer select-none"
            >
              {/* Left Slot: Icon & Details */}
              <div className="flex items-center gap-3 sm:gap-3.5 min-w-0 flex-1 pr-2">
                {/* Icon container */}
                <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-lg border flex items-center justify-center shrink-0 transition-colors ${schoolStyle}`}>
                  <Icon size={20} strokeWidth={1.7} />
                </div>

                {/* Text Details */}
                <div className="min-w-0 flex-1">
                  {/* Row 1: Name */}
                  <h3 className="font-bold text-sm sm:text-[15px] text-stone-100 group-hover:text-amber-300 transition-colors truncate">
                    {item.name}
                  </h3>

                  {/* Row 2: Subtitle Metadata (e.g. 1º Círculo • Necromancia) */}
                  <p className="text-xs text-stone-400 font-sans tracking-tight mt-0.5 truncate">
                    {item.subtitle}
                  </p>

                  {/* Row 3: Short Description Snippet / Source */}
                  {item.description && (
                    <p className="text-xs text-stone-500 font-sans line-clamp-1 mt-0.5 leading-snug">
                      {item.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Right Slot: Pill Tag, Heart & Chevron */}
              <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
                {/* Subtle Tag Badge */}
                {item.badge && (
                  <span className="text-[10px] font-sans font-medium uppercase tracking-wider px-2 py-0.5 rounded bg-stone-900/90 border border-stone-800 text-stone-400 hidden sm:inline-block">
                    {item.badge}
                  </span>
                )}

                {/* Favorite Heart Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite(item.id);
                  }}
                  className={`p-1.5 rounded-full transition-colors cursor-pointer ${
                    isFav 
                      ? 'text-rose-400 hover:text-rose-300' 
                      : 'text-stone-600 hover:text-rose-400'
                  }`}
                  title={isFav ? "Remover dos favoritos" : "Adicionar aos favoritos"}
                  aria-label={isFav ? "Remover dos favoritos" : "Adicionar aos favoritos"}
                >
                  <Heart size={16} className={isFav ? 'fill-rose-400' : ''} />
                </button>

                {/* Minimal Chevron */}
                <ChevronRight 
                  size={16} 
                  className="text-stone-600 group-hover:text-stone-400 transition-colors" 
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Load More Button */}
      {hasMore && (
        <div className="pt-4 pb-8 flex justify-center">
          <button
            onClick={onLoadMore}
            className="px-5 py-2 rounded-lg bg-stone-900/60 hover:bg-stone-900 border border-stone-800 hover:border-stone-700 text-stone-300 font-cinzel text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
          >
            Carregar Mais
          </button>
        </div>
      )}
    </div>
  );
};
