import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useProfile } from '../context/ProfileContext';
import { useAuth } from '../context/AuthContext';
import { useLoading } from '../context/LoadingContext';
import { motion } from 'motion/react';
import { 
  Shield, 
  Users, 
  ScrollText, 
  Swords, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  Library,
  ChevronRight,
  Map,
  Compass,
  Skull,
  Wand2,
  Backpack,
  Dices,
  Hourglass,
  Flame,
  Castle,
  LogIn,
  User as UserIcon,
  Gamepad2
} from 'lucide-react';
import { Button } from '../components/Button';

export const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { activeProfile, clearProfile, isLoading } = useProfile();
  const { user, profile, logout, loading: authLoading } = useAuth();
  const { withLoading } = useLoading();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [renderingPath, setRenderingPath] = useState(location.pathname);
  const transitionRef = useRef<string | null>(null);

  useEffect(() => {
    if (!isLoading) {
      if (!activeProfile) {
        if (location.pathname !== '/select-profile') {
          navigate('/select-profile', { replace: true });
        }
      } else if (activeProfile === 'MASTER' && location.pathname === '/jogador') {
        navigate('/mestre', { replace: true });
      } else if (activeProfile === 'PLAYER' && location.pathname === '/mestre') {
        navigate('/jogador', { replace: true });
      }
    }
  }, [activeProfile, isLoading, location.pathname, navigate]);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  // Page-to-page transition trigger
  useEffect(() => {
    if (location.pathname !== renderingPath && transitionRef.current !== location.pathname) {
      transitionRef.current = location.pathname;
      const targetPath = location.pathname;
      
      const transitionMessages = [
        "Espreitando além do véu...",
        "Lendo os registros empoeirados...",
        "Restaurando memórias perdidas...",
        "Seguindo pistas nas sombras...",
        "Adentrando a densa névoa...",
        "Folheando relatos ocultos..."
      ];
      const randomMsg = transitionMessages[Math.floor(Math.random() * transitionMessages.length)];
      
      withLoading(
        new Promise<void>(resolve => {
          setTimeout(() => {
            setRenderingPath(targetPath);
            transitionRef.current = null;
            resolve();
          }, 600);
        }),
        randomMsg
      );
    }
  }, [location.pathname, renderingPath, withLoading]);

  const masterNav = [
    { icon: Castle, label: 'Modo Mestre', path: '/mestre' },
  ];

  const playerNav = [
    { icon: Castle, label: 'Modo Jogador', path: '/jogador' },
  ];

  const navItems = activeProfile === 'MASTER' ? masterNav : playerNav;

  const isSpecialPage = location.pathname === '/mestre' || location.pathname === '/jogador';

  if (location.pathname === '/select-profile') return <>{children}</>;

  return (
    <div className="flex min-h-screen bg-mythos-bg text-mythos-text overflow-x-hidden">
      {/* Overlay para Mobile */}
      {!isSpecialPage && isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar - Responsiva */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-mythos-card border-r border-gold/20 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0
        ${isSpecialPage ? 'hidden lg:block' : ''}
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        shadow-[5px_0_25px_rgba(0,0,0,0.5)] overflow-y-auto no-scrollbar
      `}>
        <div className="flex flex-col h-full bg-[url('https://www.transparenttextures.com/patterns/dark-leather.png')]">
          <div className="p-8 flex items-center justify-between border-b border-gold/10">
            <div>
              <h1 className="text-3xl font-cinzel text-gold tracking-widest uppercase text-gold-gradient">REALMOR</h1>
              <p className="text-[10px] text-gold/50 tracking-[0.4em] uppercase font-bold">Portal Arcano</p>
            </div>
            <button 
              className="lg:hidden text-gold"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <X size={24} />
            </button>
          </div>

          <div className="px-6 py-4 relative">
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" />
            <div className={`px-4 py-1.5 rounded-sm text-[10px] font-bold uppercase tracking-[0.2em] inline-block border-2 ${
              activeProfile === 'MASTER' ? 'bg-gold/10 text-gold border-gold/30' : 'bg-magic/10 text-magic border-magic/30'
            }`}>
              {activeProfile === 'MASTER' ? 'Grimório do Mestre' : 'Diário do Aventureiro'}
            </div>
            <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" />
          </div>

          <nav className="flex-1 px-4 space-y-1 py-2">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center justify-between px-4 py-3 rounded-sm transition-all group relative overflow-hidden ${
                    isActive 
                      ? 'text-gold-gradient font-bold' 
                      : 'text-mythos-text/60 hover:text-gold'
                  }`}
                >
                  {isActive && (
                    <div className="absolute inset-0 bg-gold/5 border-l-4 border-gold" />
                  )}
                  <div className="flex items-center gap-4 relative z-10">
                    <item.icon size={22} className={isActive ? 'text-gold' : 'group-hover:text-gold transition-colors'} />
                    <span className="font-cinzel tracking-wide text-sm">{item.label}</span>
                  </div>
                  {isActive && <ChevronRight size={16} className="text-gold/50 relative z-10" />}
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-gold/10 space-y-1">
            <button 
              onClick={() => {
                clearProfile();
                navigate('/select-profile', { replace: true });
              }}
              className="w-full flex items-center gap-4 px-4 py-3 text-health/80 hover:text-health transition-colors rounded-sm hover:bg-health/5"
            >
              <LogOut size={20} />
              <span className="font-cinzel text-sm">Trocar Perfil</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* Header Responsivo */}
        <header className={`h-16 border-b border-gold/20 flex items-center justify-between px-4 sm:px-6 lg:px-8 bg-mythos-card/95 backdrop-blur-md sticky top-0 z-30 shadow-[0_4px_20px_rgba(0,0,0,0.4)] w-full ${isSpecialPage ? 'hidden lg:flex' : ''}`}>
          <div className="flex items-center gap-4">
            <button 
              className="p-2 -ml-2 text-gold hover:bg-gold/10 rounded-sm transition-colors lg:hidden"
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label="Abrir menu"
            >
              <Menu size={24} />
            </button>
            <h1 className="text-xl sm:text-2xl font-cinzel text-gold tracking-tight lg:hidden truncate max-w-[150px] sm:max-w-none font-bold uppercase text-gold-gradient">REALMOR</h1>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-4">
            {user ? (
              <>
                <div className="text-right hidden sm:block">
                  <p className="text-[10px] text-gold/60 uppercase font-bold leading-none tracking-widest">Aventureiro</p>
                  <p className="text-sm font-cinzel text-mythos-text leading-tight truncate max-w-[120px]">{profile?.name || user.displayName || 'Herói'}</p>
                </div>
                {profile?.photoURL || user.photoURL ? (
                  <img 
                    src={profile?.photoURL || user.photoURL || ''} 
                    alt={profile?.name || user.displayName || 'Avatar'} 
                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-sm border-2 border-gold shadow-[0_0_15px_rgba(212,175,55,0.2)] object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-sm bg-mythos-card border-2 border-gold shadow-[0_0_15px_rgba(212,175,55,0.2)] flex items-center justify-center text-gold font-cinzel text-lg sm:text-xl">
                    {(profile?.name || user.displayName)?.[0] || 'H'}
                  </div>
                )}
                <button 
                  onClick={() => {
                    localStorage.removeItem('mythos_active_profile');
                    logout();
                  }}
                  className="p-2 text-health/60 hover:text-health hover:bg-health/10 rounded-sm transition-colors"
                  title="Sair"
                >
                  <LogOut size={18} className="sm:w-5 sm:h-5" />
                </button>
              </>
            ) : (
              <Link to="/auth">
                <Button 
                  size="sm" 
                  variant="secondary" 
                  icon={LogIn} 
                  className="px-3 sm:px-4"
                >
                  <span className="hidden xs:inline">Entrar</span>
                </Button>
              </Link>
            )}
          </div>
        </header>
        
        {/* Page Content */}
        <main className={`flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 xl:p-10 scroll-smooth bg-[url('https://www.transparenttextures.com/patterns/dark-leather.png')] ${isSpecialPage ? 'p-0 sm:p-0 md:p-6 lg:p-8' : ''}`}>
          <div className="max-w-7xl mx-auto w-full">
            <motion.div
              key={renderingPath}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              {children}
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
};


