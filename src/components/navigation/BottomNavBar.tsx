import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  BookOpen, 
  Dices, 
  Swords, 
  Library, 
  Users,
  Map,
  Settings
} from 'lucide-react';
import { useFriendship } from '../../context/FriendshipContext';

interface BottomNavBarProps {
  isMaster: boolean;
  onToggleMore?: () => void;
  isMoreOpen?: boolean;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  isMaster
}) => {
  const location = useLocation();
  const currentPath = location.pathname;
  const { pendingCount } = useFriendship();

  // Itens do Mestre (Grimório, Mapas, Compêndio, Amigos, Configurações)
  const masterNavItems = [
    {
      id: 'grimorio',
      label: 'GRIMÓRIO',
      icon: BookOpen,
      path: '/',
      isActive: (path: string) => path === '/' || path === '/grimorio' || path === '/mestre' || path === '/master'
    },
    {
      id: 'mapas',
      label: 'MAPAS',
      icon: Map,
      path: '/maps',
      isActive: (path: string) => path.startsWith('/map') || path.startsWith('/master/maps') || path === '/maps'
    },
    {
      id: 'compendio',
      label: 'COMPÊNDIO',
      icon: Library,
      path: '/codex',
      isActive: (path: string) => path.startsWith('/codex') || path.startsWith('/spells') || path.startsWith('/biblioteca')
    },
    {
      id: 'amigos',
      label: 'AMIGOS',
      icon: Users,
      path: '/amigos',
      badge: pendingCount,
      isActive: (path: string) => path.startsWith('/amigos') || path.startsWith('/friends')
    },
    {
      id: 'configuracoes',
      label: 'CONFIG...',
      icon: Settings,
      path: '/settings',
      isActive: (path: string) => path.startsWith('/settings') || path.startsWith('/configuracoes') || path.startsWith('/profile') || path.startsWith('/perfil')
    }
  ];

  // Itens do Jogador
  const playerNavItems = [
    {
      id: 'inicio',
      label: 'INÍCIO',
      icon: BookOpen,
      path: '/',
      isActive: (path: string) => path === '/' || path === '/grimorio'
    },
    {
      id: 'aventuras',
      label: 'AVENTUR...',
      icon: Dices,
      path: '/immersive-rpg',
      isActive: (path: string) => path.startsWith('/jogador') || path.startsWith('/immersive-rpg')
    },
    {
      id: 'personagens',
      label: 'PERSONA...',
      icon: Users,
      path: '/characters',
      isActive: (path: string) => path.startsWith('/characters')
    },
    {
      id: 'compendio',
      label: 'BIBLIOTEC...',
      icon: Library,
      path: '/codex',
      isActive: (path: string) => path.startsWith('/codex') || path.startsWith('/spells') || path.startsWith('/biblioteca')
    },
    {
      id: 'amigos',
      label: 'MAIS',
      icon: Users,
      path: '/amigos',
      badge: pendingCount,
      isActive: (path: string) => path.startsWith('/amigos') || path.startsWith('/friends')
    }
  ];

  const navItems = isMaster ? masterNavItems : playerNavItems;

  return (
    <nav 
      id="mobile-bottom-navigation"
      aria-label="Navegação Principal Mobile"
      className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-[#0a0a0c]/98 backdrop-blur-xl border-t border-amber-900/40 shadow-[0_-10px_35px_rgba(0,0,0,0.95)] pb-[max(0.35rem,env(safe-area-inset-bottom))]"
    >
      {/* Sutil linha dourada no topo */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />

      <div className="grid grid-cols-5 h-16 items-stretch max-w-lg mx-auto px-0.5">
        {navItems.map((item) => {
          const active = item.isActive(currentPath);
          const Icon = item.icon;

          return (
            <Link
              key={item.id}
              to={item.path}
              className={`flex flex-col items-center justify-center py-1.5 px-0.5 relative transition-all duration-200 select-none group min-h-[52px] ${
                active ? 'text-amber-300' : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              {/* Destaque dourado exatamente como na referência */}
              {active && (
                <>
                  {/* Top diamond accent */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
                    <span className="w-2 h-2 rotate-45 bg-amber-400 border border-amber-200 shadow-[0_0_8px_rgba(245,158,11,1)]" />
                  </div>
                  {/* Vertical rich gold ambient wash */}
                  <div className="absolute inset-0 bg-gradient-to-b from-amber-500/25 via-amber-500/10 to-amber-950/20 pointer-events-none rounded-t-xl border-t border-amber-400/70" />
                </>
              )}

              <div className="relative z-10 flex flex-col items-center justify-center">
                <div className="relative">
                  <Icon 
                    size={21} 
                    strokeWidth={active ? 2.2 : 1.7}
                    className={`transition-all duration-200 ${
                      active 
                        ? 'text-amber-300 drop-shadow-[0_0_10px_rgba(245,158,11,0.8)] scale-105' 
                        : 'text-stone-400 group-hover:text-stone-200'
                    }`} 
                  />
                  {/* Badge de notificações */}
                  {item.badge && item.badge > 0 ? (
                    <span className="absolute -top-1.5 -right-2.5 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-sans font-bold flex items-center justify-center border border-stone-950 shadow-sm animate-pulse">
                      {item.badge}
                    </span>
                  ) : null}
                </div>

                <span className={`text-[10px] font-cinzel uppercase tracking-wider mt-1 truncate max-w-[68px] leading-none ${
                  active ? 'font-bold text-amber-200 drop-shadow-[0_0_6px_rgba(245,158,11,0.5)]' : 'font-medium text-stone-400'
                }`}>
                  {item.label}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
