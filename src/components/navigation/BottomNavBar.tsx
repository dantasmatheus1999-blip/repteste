import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  BookOpen, 
  Castle, 
  Swords, 
  Map, 
  MoreHorizontal, 
  Dices, 
  Users, 
  Library
} from 'lucide-react';

interface BottomNavBarProps {
  isMaster: boolean;
  onToggleMore: () => void;
  isMoreOpen: boolean;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  isMaster,
  onToggleMore,
  isMoreOpen
}) => {
  const location = useLocation();
  const currentPath = location.pathname;

  // Definição dos 4 itens principais para o MESTRE + botão "Mais"
  // 1. Início (Grimório)
  // 2. Campanhas
  // 3. Mesa do Mestre
  // 4. Mapas (preservado)
  // 5. Mais (Menu secundário)
  const masterItems = [
    {
      id: 'inicio',
      label: 'Início',
      icon: BookOpen,
      path: '/',
      isActive: (path: string) => path === '/' || path === '/grimorio'
    },
    {
      id: 'campanhas',
      label: 'Campanhas',
      icon: Castle,
      path: '/master/campaigns',
      isActive: (path: string) => path.startsWith('/master/campaigns') || path.startsWith('/campaigns')
    },
    {
      id: 'mesa',
      label: 'Mesa',
      icon: Swords,
      path: '/master',
      isActive: (path: string) => path === '/master' || path === '/mestre'
    },
    {
      id: 'mapas',
      label: 'Mapas',
      icon: Map,
      path: '/map/test-map',
      isActive: (path: string) => path.startsWith('/map') || path === '/maps' || path.startsWith('/master/maps')
    }
  ];

  // Definição dos 4 itens principais para o JOGADOR + botão "Mais"
  // 1. Início (Grimório)
  // 2. Aventuras (Minhas Aventuras - preservado)
  // 3. Personagens
  // 4. Compêndio (Biblioteca)
  // 5. Mais (Menu secundário)
  const playerItems = [
    {
      id: 'inicio',
      label: 'Início',
      icon: BookOpen,
      path: '/',
      isActive: (path: string) => path === '/' || path === '/grimorio'
    },
    {
      id: 'aventuras',
      label: 'Aventuras',
      icon: Dices,
      path: '/immersive-rpg',
      isActive: (path: string) => path.startsWith('/immersive-rpg')
    },
    {
      id: 'personagens',
      label: 'Personagens',
      icon: Users,
      path: '/characters',
      isActive: (path: string) => path.startsWith('/characters')
    },
    {
      id: 'compendio',
      label: 'Biblioteca',
      icon: Library,
      path: '/codex',
      isActive: (path: string) => path.startsWith('/codex') || path.startsWith('/spells')
    }
  ];

  const primaryItems = isMaster ? masterItems : playerItems;

  return (
    <nav 
      id="mobile-bottom-navigation"
      aria-label="Navegação Principal Mobile"
      className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-stone-950/95 backdrop-blur-xl border-t border-amber-900/40 shadow-[0_-8px_30px_rgba(0,0,0,0.9)] pb-[max(0.35rem,env(safe-area-inset-bottom))]"
    >
      {/* Sutil linha dourada no topo */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-gold/40 to-transparent" />

      <div className="grid grid-cols-5 h-15 items-stretch max-w-lg mx-auto px-1">
        {primaryItems.map((item) => {
          const active = !isMoreOpen && item.isActive(currentPath);
          const Icon = item.icon;

          return (
            <Link
              key={item.id}
              to={item.path}
              className={`flex flex-col items-center justify-center py-1.5 px-0.5 relative transition-all duration-200 select-none group min-h-[48px] ${
                active ? 'text-amber-300' : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              {/* Indicador de item ativo */}
              {active && (
                <>
                  <div className="absolute top-0 inset-x-2 h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-transparent shadow-[0_0_8px_rgba(245,158,11,0.9)]" />
                  <div className="absolute inset-0 bg-gradient-to-b from-amber-500/10 via-amber-500/5 to-transparent pointer-events-none rounded-t-lg" />
                </>
              )}

              <div className="relative z-10 flex flex-col items-center">
                <Icon 
                  size={20} 
                  className={`transition-transform duration-200 ${
                    active 
                      ? 'text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.6)] scale-110' 
                      : 'text-stone-400 group-hover:text-stone-200'
                  }`} 
                />
                <span className={`text-[10px] font-cinzel uppercase tracking-wider mt-1 truncate max-w-[64px] leading-tight ${
                  active ? 'font-bold text-amber-200' : 'font-medium text-stone-400'
                }`}>
                  {item.label}
                </span>
              </div>
            </Link>
          );
        })}

        {/* Botão "Mais" para opções secundárias */}
        <button
          id="bottom-nav-more-button"
          onClick={onToggleMore}
          aria-expanded={isMoreOpen}
          className={`flex flex-col items-center justify-center py-1.5 px-0.5 relative transition-all duration-200 select-none group min-h-[48px] cursor-pointer ${
            isMoreOpen ? 'text-amber-300' : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          {isMoreOpen && (
            <>
              <div className="absolute top-0 inset-x-2 h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-transparent shadow-[0_0_8px_rgba(245,158,11,0.9)]" />
              <div className="absolute inset-0 bg-gradient-to-b from-amber-500/10 via-amber-500/5 to-transparent pointer-events-none rounded-t-lg" />
            </>
          )}

          <div className="relative z-10 flex flex-col items-center">
            <MoreHorizontal 
              size={20} 
              className={`transition-transform duration-200 ${
                isMoreOpen 
                  ? 'text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.6)] scale-110 rotate-90' 
                  : 'text-stone-400 group-hover:text-stone-200'
              }`} 
            />
            <span className={`text-[10px] font-cinzel uppercase tracking-wider mt-1 truncate max-w-[64px] leading-tight ${
              isMoreOpen ? 'font-bold text-amber-200' : 'font-medium text-stone-400'
            }`}>
              Mais
            </span>
          </div>
        </button>
      </div>
    </nav>
  );
};
