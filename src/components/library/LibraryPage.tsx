import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { LibraryCategoryId, UnifiedLibraryItem } from './types';
import { LibraryCategorySelector } from './LibraryCategorySelector';
import { LibrarySearchAndFilters, LibraryFilterState } from './LibrarySearchAndFilters';
import { LibraryItemList } from './LibraryItemList';
import { LibraryDetailModal } from './LibraryDetailModal';

// Raw Data imports
import { T20_SPELLS } from '../../data/t20Spells';
import { T20_CLASSES_DETAILED } from '../../data/t20ClassesDetailed';
import { T20_RACES } from '../../data/t20Races';
import { T20_ORIGINS } from '../../data/t20Origins';
import { T20_POWERS } from '../../data/t20Powers';
import { T20_WEAPONS, T20_ARMORS, T20_SHIELDS } from '../../data/t20Equipment';
import { T20_DEITIES } from '../../data/t20Deities';
import { T20_STANDARD_MONSTERS } from '../../data/t20MonstersLibrary';

const PAGE_SIZE = 25;

// Helper to normalize search text
const normalize = (txt: string) => {
  return (txt || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
};

const INITIAL_FILTERS: LibraryFilterState = {
  searchQuery: '',
  onlyFavorites: false,
  spellCircle: 'all',
  spellType: 'all',
  spellSchool: 'all',
  classCategory: 'all',
  classDifficulty: 'all',
  powerCategory: 'all',
  equipmentType: 'all',
  deityChannel: 'all',
  monsterND: 'all'
};

export const LibraryPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Active Category synced with URL query or default 'magias'
  const activeCategory = (searchParams.get('category') as LibraryCategoryId) || 'magias';

  // Filters State
  const [filters, setFilters] = useState<LibraryFilterState>(() => {
    return {
      ...INITIAL_FILTERS,
      searchQuery: searchParams.get('search') || '',
      spellCircle: searchParams.get('circle') || 'all',
      spellType: searchParams.get('type') || 'all',
      spellSchool: searchParams.get('school') || 'all'
    };
  });

  // Favorites in LocalStorage
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('realmor_library_favorites') || '[]');
    } catch {
      return [];
    }
  });

  // Selected item for modal
  const [selectedItem, setSelectedItem] = useState<UnifiedLibraryItem | null>(null);

  // Pagination
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  // Sync favorites with LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('realmor_library_favorites', JSON.stringify(favorites));
    } catch (e) {
      console.error('Error saving favorites', e);
    }
  }, [favorites]);

  const toggleFavorite = (id: string) => {
    setFavorites(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // Switch category and reset pagination / facet filters
  const handleSelectCategory = (category: LibraryCategoryId) => {
    const params = new URLSearchParams();
    params.set('category', category);
    setSearchParams(params);
    setFilters(prev => ({
      ...INITIAL_FILTERS,
      searchQuery: prev.searchQuery,
      onlyFavorites: prev.onlyFavorites
    }));
    setVisibleCount(PAGE_SIZE);
  };

  // Convert all raw datasets into UnifiedLibraryItem representations
  const allUnifiedItems = useMemo<Record<LibraryCategoryId, UnifiedLibraryItem[]>>(() => {
    // 1. Magias
    const spells: UnifiedLibraryItem[] = T20_SPELLS.map(s => ({
      id: s.id,
      categoryId: 'magias',
      name: s.name,
      subtitle: `${s.circle}º Círculo • ${s.school} • ${s.execution}`,
      description: s.description.replace(/\n/g, ' ').slice(0, 130) + '...',
      badge: `${s.type.toUpperCase()}`,
      secondaryBadge: `${s.circle}º CÍRCULO`,
      rawItem: s
    }));

    // 2. Classes
    const classes: UnifiedLibraryItem[] = T20_CLASSES_DETAILED.map(c => ({
      id: c.id,
      categoryId: 'classes',
      name: c.name,
      subtitle: `${c.role} • Atributos: ${c.primaryAttributes.join(', ')}`,
      description: c.summary.slice(0, 130) + '...',
      badge: c.category.toUpperCase(),
      secondaryBadge: c.difficulty === 'iniciante' ? 'INICIANTE' : 'AVANÇADO',
      rawItem: c
    }));

    // 3. Raças
    const racas: UnifiedLibraryItem[] = T20_RACES.map(r => {
      const attrSummary = r.attributeModifiers
        .map(a => `${a.attribute} ${a.value > 0 ? '+' : ''}${a.value}`)
        .join(', ');

      return {
        id: r.id,
        categoryId: 'racas',
        name: r.name,
        subtitle: `${attrSummary || 'Atributos Variados'}`,
        description: r.summary.slice(0, 130) + '...',
        badge: 'RAÇA',
        rawItem: r
      };
    });

    // 4. Origens
    const origens: UnifiedLibraryItem[] = T20_ORIGINS.map(o => ({
      id: o.id,
      categoryId: 'origens',
      name: o.name,
      subtitle: `Perícias: ${o.skills.slice(0, 2).join(', ')}...`,
      description: o.description.slice(0, 130) + '...',
      badge: 'ORIGEM',
      rawItem: o
    }));

    // 5. Poderes
    const poderes: UnifiedLibraryItem[] = T20_POWERS.map(p => ({
      id: p.id,
      categoryId: 'poderes',
      name: p.name,
      subtitle: `${p.category.toUpperCase()} • Pré-requisitos: ${p.prerequisites || 'Nenhum'}`,
      description: p.description.slice(0, 130) + '...',
      badge: p.category.toUpperCase(),
      rawItem: p
    }));

    // 6. Equipamentos (Armas + Armaduras + Escudos)
    const weapons: UnifiedLibraryItem[] = T20_WEAPONS.map(w => ({
      id: w.id,
      categoryId: 'equipamentos',
      name: w.name,
      subtitle: `Arma ${w.category} • Dano: ${w.damage} (Crítico ${w.crit}) • Alcance: ${w.range}`,
      description: w.properties?.length ? `Propriedades: ${w.properties.join(', ')}` : `Peso: ${w.weight} kg`,
      badge: w.category.toUpperCase(),
      rawItem: w
    }));

    const armors: UnifiedLibraryItem[] = T20_ARMORS.map(a => ({
      id: a.id,
      categoryId: 'equipamentos',
      name: a.name,
      subtitle: `Armadura ${a.type} • Defesa +${a.defenseBonus} • Penalidade ${a.penalty}`,
      description: `Peso: ${a.weight} kg ${a.properties?.length ? `• ${a.properties.join(', ')}` : ''}`,
      badge: a.type === 'pesada' ? 'ARMADURA PESADA' : 'ARMADURA LEVE',
      rawItem: a
    }));

    const shields: UnifiedLibraryItem[] = T20_SHIELDS.map(s => ({
      id: s.id,
      categoryId: 'equipamentos',
      name: s.name,
      subtitle: `Escudo • Defesa +${s.defenseBonus} • Penalidade ${s.penalty}`,
      description: `Peso: ${s.weight} kg ${s.properties?.length ? `• ${s.properties.join(', ')}` : ''}`,
      badge: 'ESCUDO',
      rawItem: s
    }));

    const equipamentos = [...weapons, ...armors, ...shields];

    // 7. Divindades
    const divindades: UnifiedLibraryItem[] = T20_DEITIES.map(d => ({
      id: d.id,
      categoryId: 'divindades',
      name: d.name,
      subtitle: `${d.summary} • Energia: ${d.channelDivinity}`,
      description: `Crenças & Objetivos: ${d.beliefsAndGoals.slice(0, 120)}...`,
      badge: 'DEUS MAIOR',
      rawItem: d
    }));

    // 8. Monstros & Ameaças
    const monstros: UnifiedLibraryItem[] = T20_STANDARD_MONSTERS.map(m => ({
      id: m.id,
      categoryId: 'monstros',
      name: m.name,
      subtitle: `ND ${m.nd} • ${m.type} • ${m.size} • PV ${m.hp} | Defesa ${m.defense}`,
      description: `Ataques: ${m.attacks.slice(0, 2).map(a => a.name).join(', ')} | ${m.description.slice(0, 80)}...`,
      badge: `ND ${m.nd}`,
      secondaryBadge: m.scale?.toUpperCase(),
      rawItem: m
    }));

    return {
      magias: spells,
      classes,
      racas,
      origens,
      poderes,
      equipamentos,
      divindades,
      monstros
    };
  }, []);

  // Item counts per category
  const itemCounts = useMemo<Record<LibraryCategoryId, number>>(() => {
    return {
      magias: allUnifiedItems.magias?.length || 0,
      classes: allUnifiedItems.classes?.length || 0,
      racas: allUnifiedItems.racas?.length || 0,
      origens: allUnifiedItems.origens?.length || 0,
      poderes: allUnifiedItems.poderes?.length || 0,
      equipamentos: allUnifiedItems.equipamentos?.length || 0,
      divindades: allUnifiedItems.divindades?.length || 0,
      monstros: allUnifiedItems.monstros?.length || 0
    };
  }, [allUnifiedItems]);

  // Filter and Search logic
  const filteredItems = useMemo(() => {
    const rawList = allUnifiedItems[activeCategory] || [];
    const query = normalize(filters.searchQuery);

    return rawList.filter(item => {
      // 1. Favorites only filter
      if (filters.onlyFavorites && !favorites.includes(item.id)) {
        return false;
      }

      // 2. Search query check
      if (query) {
        const matchName = normalize(item.name).includes(query);
        const matchSub = normalize(item.subtitle).includes(query);
        const matchDesc = normalize(item.description).includes(query);
        const matchBadge = normalize(item.badge || '').includes(query);
        if (!matchName && !matchSub && !matchDesc && !matchBadge) {
          return false;
        }
      }

      // 3. Category Facet Filters from Modal
      if (activeCategory === 'magias') {
        if (filters.spellCircle && filters.spellCircle !== 'all') {
          if (item.rawItem.circle !== parseInt(filters.spellCircle)) return false;
        }
        if (filters.spellType && filters.spellType !== 'all') {
          if (item.rawItem.type !== filters.spellType && item.rawItem.type !== 'universal') return false;
        }
        if (filters.spellSchool && filters.spellSchool !== 'all') {
          if (item.rawItem.school !== filters.spellSchool) return false;
        }
      }

      if (activeCategory === 'classes') {
        if (filters.classCategory && filters.classCategory !== 'all') {
          if (item.rawItem.category !== filters.classCategory) return false;
        }
        if (filters.classDifficulty && filters.classDifficulty !== 'all') {
          if (item.rawItem.difficulty !== filters.classDifficulty) return false;
        }
      }

      if (activeCategory === 'poderes') {
        if (filters.powerCategory && filters.powerCategory !== 'all') {
          if (item.rawItem.category !== filters.powerCategory) return false;
        }
      }

      if (activeCategory === 'equipamentos') {
        if (filters.equipmentType && filters.equipmentType !== 'all') {
          const eq = filters.equipmentType;
          if (eq === 'armas_simples' && item.rawItem.category !== 'simples') return false;
          if (eq === 'armas_marciais' && item.rawItem.category !== 'marcial') return false;
          if (eq === 'armas_exoticas' && item.rawItem.category !== 'exotica') return false;
          if (eq === 'armas_fogo' && item.rawItem.category !== 'fogo') return false;
          if (eq === 'armaduras_leves' && item.rawItem.type !== 'leve') return false;
          if (eq === 'armaduras_pesadas' && item.rawItem.type !== 'pesada') return false;
          if (eq === 'escudos' && !item.id.includes('escudo')) return false;
        }
      }

      if (activeCategory === 'divindades') {
        if (filters.deityChannel && filters.deityChannel !== 'all') {
          if (item.rawItem.channelDivinity !== filters.deityChannel) return false;
        }
      }

      if (activeCategory === 'monstros') {
        if (filters.monsterND && filters.monsterND !== 'all') {
          const val = item.rawItem.ndValue;
          if (filters.monsterND === 'baixo' && val > 1) return false;
          if (filters.monsterND === 'medio' && (val < 2 || val > 4)) return false;
          if (filters.monsterND === 'alto' && (val < 5 || val > 8)) return false;
          if (filters.monsterND === 'chefe' && (item.rawItem.scale !== 'Chefe' && val < 8)) return false;
        }
      }

      return true;
    }).sort((a, b) => a.name.localeCompare(b.name));
  }, [allUnifiedItems, activeCategory, filters, favorites]);

  // Paginated slice
  const displayedItems = filteredItems.slice(0, visibleCount);
  const hasMore = visibleCount < filteredItems.length;

  const handleLoadMore = () => {
    setVisibleCount(prev => prev + PAGE_SIZE);
  };

  const handleFilterUpdate = (updater: Partial<LibraryFilterState>) => {
    setFilters(prev => ({ ...prev, ...updater }));
    setVisibleCount(PAGE_SIZE);
  };

  const handleResetFilters = () => {
    setFilters(INITIAL_FILTERS);
    setVisibleCount(PAGE_SIZE);
  };

  return (
    <div className="space-y-3 max-w-4xl mx-auto px-3 sm:px-4 py-2 sm:py-3">
      {/* 1. Header Title */}
      <div className="flex flex-col items-center text-center space-y-0.5 pb-1">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-cinzel font-black uppercase text-amber-100 tracking-wider">
          BIBLIOTECA
        </h1>
        <p className="text-[11px] sm:text-xs font-cinzel text-amber-400/70 tracking-wider">
          Compêndio & Regras de Arton
        </p>
      </div>

      {/* 2. Category Selector */}
      <LibraryCategorySelector 
        activeCategory={activeCategory}
        onSelectCategory={handleSelectCategory}
        itemCounts={itemCounts}
      />

      {/* 3. Search + Filters Row + Counter */}
      <LibrarySearchAndFilters 
        category={activeCategory}
        filters={filters}
        onFilterChange={handleFilterUpdate}
        onResetFilters={handleResetFilters}
        totalResultsCount={filteredItems.length}
        totalCategoryCount={itemCounts[activeCategory] || 0}
      />

      {/* 4. Direct Item List (Directly below search and count - no intermediate layers) */}
      <LibraryItemList 
        items={displayedItems}
        category={activeCategory}
        onSelectItem={(item) => setSelectedItem(item)}
        favorites={favorites}
        onToggleFavorite={toggleFavorite}
        hasMore={hasMore}
        onLoadMore={handleLoadMore}
      />

      {/* 5. Detail Modal */}
      <LibraryDetailModal 
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
        isFavorite={selectedItem ? favorites.includes(selectedItem.id) : false}
        onToggleFavorite={toggleFavorite}
      />
    </div>
  );
};

export default LibraryPage;
