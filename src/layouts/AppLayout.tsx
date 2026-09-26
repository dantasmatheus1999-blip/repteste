import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useProfile } from '../context/ProfileContext';
import { 
  Users, 
  Settings, 
  LogOut, 
  Library, 
  ChevronRight, 
  Map, 
  Dices, 
  Castle, 
  LogIn, 
  BookOpen, 
  ArrowLeftRight, 
  Swords,
  Crown
} from 'lucide-react';
import { Button } from '../components/Button';
import { BottomNavBar } from '../components/navigation/BottomNavBar';
import { SecondaryMenuSheet } from '../components/navigation/SecondaryMenuSheet';
import { PWAInstallButton } from '../components/common/PWAInstallButton';

export const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, logout, loading: authLoading } = useAuth();
  const { activeProfile, isMaster, toggleMode, isLoading } = useProfile();
  const [isMoreSheetOpen, setIsMoreSheetOpen] = useState(false);

  // Fecha o menu secundário sempre que a rota mudar
  useEffect(() => {
    setIsMoreSheetOpen(false);
  }, [location.pathname]);

  // Redireciona para escolha de modo se o usuário estiver logado mas ainda sem modo ativo
  useEffect(() => {
    if (!authLoading && !isLoading && !activeProfile && user && location.pathname !== '/select-profile') {
      navigate('/select-profile');
    }
  }, [activeProfile, isLoading, authLoading, user, location.pathname, navigate]);

  // Itens de Navegação do Mestre para Desktop Sidebar (Reorganizado conforme diretriz do Mestre)
  const masterNav = [
    { icon: BookOpen, label: 'GRIMÓRIO', path: '/' },
    { icon: Map, label: 'MAPAS', path: '/maps' },
    { icon: Library, label: 'COMPÊNDIO', path: '/codex' },
    { icon: Settings, label: 'CONFIGURAÇÕES', path: '/settings' },
  ];

  // Itens de Navegação do Jogador para Desktop Sidebar
  const playerNav = [
    { icon: BookOpen, label: 'GRIMÓRIO', path: '/' },
    { icon: Swords, label: 'PERSONAGENS', path: '/characters' },
    { icon: Dices, label: 'MINHAS AVENTURAS', path: '/jogador' },
    { icon: Library, label: 'COMPÊNDIO', path: '/codex' },
    { icon: Users, label: 'AMIGOS', path: '/amigos' },
    { icon: Settings, label: 'CONFIGURAÇÕES', path: '/settings' },
  ];

  const navItems = isMaster ? masterNav : playerNav;
  const isMapRoute = location.pathname.startsWith('/map') || 
                     location.pathname.startsWith('/master/maps') || 
                     location.pathname === '/maps';

  const isGameRoute = location.pathname.startsWith('/mesa') || 
                      location.pathname.startsWith('/join') ||
                      location.pathname.includes('/games/');

  const isFriendsRoute = location.pathname.startsWith('/amigos') || 
                         location.pathname.startsWith('/friends');

  const isPlayerHome = !isMaster && (location.pathname === '/' || location.pathname === '/grimorio');

  if (location.pathname === '/select-profile' || location.pathname === '/characters/sheet' || isMapRoute || isGameRoute) {
    return <>{children}</>;
  }

  const userDisplayName = profile?.name || user?.displayName || 'Matheus Dantas';
  const userInitial = userDisplayName ? userDisplayName[0].toUpperCase() : 'M';

  return (
    <div className={`flex min-h-screen bg-[#070605] text-stone-200 overflow-x-hidden ${
      isMapRoute ? 'h-screen overflow-hidden' : isFriendsRoute ? 'h-[100dvh] overflow-hidden lg:h-auto lg:min-h-screen lg:overflow-x-hidden' : ''
    }`}>
      {/* ============================================================ */}
      {/* DESKTOP SIDEBAR - Visível apenas no MODO MESTRE em lg+       */}
      {/* ============================================================ */}
      {isMaster && (
        <aside className={`hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:z-30 bg-[#0d0a08] border-r border-amber-900/35 shadow-[5px_0_25px_rgba(0,0,0,0.7)] overflow-y-auto no-scrollbar transition-all duration-200 ${
          isMapRoute ? 'lg:w-14' : 'lg:w-64'
        }`}>
          <div className="flex flex-col h-full bg-[url('https://www.transparenttextures.com/patterns/dark-leather.png')]">
            
            {/* Logo & Marca Desktop */}
            {isMapRoute ? (
              <div className="p-3 flex items-center justify-center border-b border-amber-900/30" title="REALMOR Portal Arcano">
                <Link to="/" className="w-8 h-8 rounded bg-amber-950/40 border border-amber-600/40 flex items-center justify-center text-amber-400 hover:scale-105 transition-transform">
                  <Castle size={18} className="text-amber-400 drop-shadow-[0_0_8px_rgba(212,175,55,0.4)]" />
                </Link>
              </div>
            ) : (
              <div className="pt-6 pb-4 px-6 text-center border-b border-amber-950/60">
                <h1 className="text-2xl font-cinzel text-amber-200 tracking-[0.2em] uppercase font-black drop-shadow-[0_2px_10px_rgba(212,175,55,0.3)]">
                  REALMOR
                </h1>
                <p className="text-[9px] text-amber-400/50 tracking-[0.35em] uppercase font-bold mt-0.5">
                  PORTAL ARCANO
                </p>
              </div>
            )}

            {/* Badge de Modo Mestre */}
            {!isMapRoute && (
              <div className="px-5 py-3">
                <div className="w-full py-1.5 px-3 rounded-sm bg-black/40 border border-amber-600/30 text-center shadow-inner">
                  <span className="text-[10px] font-cinzel font-bold text-amber-300/90 tracking-[0.2em] uppercase">
                    GRIMÓRIO DO MESTRE
                  </span>
                </div>
              </div>
            )}

            {/* Links de Navegação Desktop do Mestre */}
            <nav className={`flex-1 space-y-1.5 ${isMapRoute ? 'px-1.5 py-3' : 'px-4 py-2'}`}>
              {masterNav.map((item) => {
                const isActive = location.pathname === item.path || 
                  (item.path !== '/' && location.pathname.startsWith(item.path)) ||
                  (item.path === '/' && (location.pathname === '/' || location.pathname === '/grimorio'));
                
                if (isMapRoute) {
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      title={item.label}
                      className={`flex items-center justify-center w-10 h-10 mx-auto rounded-lg transition-all duration-200 group relative ${
                        isActive 
                          ? 'bg-amber-950/80 text-amber-200 border border-amber-500/60 shadow-md' 
                          : 'text-stone-400 hover:text-amber-300 hover:bg-stone-900/60'
                      }`}
                    >
                      <item.icon size={20} className={isActive ? 'text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]' : 'text-stone-400 group-hover:text-amber-300 transition-colors'} />
                    </Link>
                  );
                }

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded transition-all duration-200 group relative ${
                      isActive 
                        ? 'bg-gradient-to-r from-amber-950/60 via-amber-950/30 to-transparent border-l-2 border-amber-500 text-amber-200 shadow-sm' 
                        : 'text-stone-400 hover:text-amber-300 hover:bg-black/30'
                    }`}
                  >
                    <div className="flex items-center gap-3 relative z-10">
                      <item.icon size={17} className={isActive ? 'text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]' : 'text-stone-500 group-hover:text-amber-400 transition-colors'} />
                      <span className={`font-cinzel tracking-wider text-[11px] uppercase ${isActive ? 'font-bold text-amber-200' : 'font-medium'}`}>
                        {item.label}
                      </span>
                    </div>
                    {isActive && <ChevronRight size={14} className="text-amber-400/80 relative z-10" />}
                  </Link>
                );
              })}
            </nav>

            {/* Rodapé da Sidebar Desktop: Troca de Modo & Logout */}
            <div className="p-4 border-t border-amber-950/60 space-y-2">
              <button 
                id="sidebar-toggle-mode-btn"
                onClick={() => {
                  toggleMode();
                  navigate('/');
                }}
                className="w-full flex items-center justify-between px-3 py-2 text-amber-300/90 hover:text-amber-200 transition-all rounded-sm hover:bg-amber-950/30 border border-amber-600/30 bg-black/40 cursor-pointer group"
                title="Trocar entre Modo Mestre e Modo Jogador"
              >
                <div className="flex items-center gap-2">
                  <ArrowLeftRight size={14} className="text-amber-400 group-hover:rotate-180 transition-transform duration-500" />
                  <span className="font-cinzel text-[10px] font-bold uppercase tracking-wider">Trocar de Modo</span>
                </div>
                <span className="text-[9px] font-cinzel font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider bg-amber-950/80 text-amber-300 border-amber-500/60">
                  Mestre
                </span>
              </button>

              <button 
                id="sidebar-logout-btn"
                onClick={() => {
                  logout();
                  navigate('/auth');
                }}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-stone-400 hover:text-red-400 transition-colors rounded-sm hover:bg-black/30 cursor-pointer text-[10px] font-cinzel tracking-wider uppercase font-bold"
              >
                <LogOut size={14} />
                <span>Sair</span>
              </button>
            </div>
          </div>
        </aside>
      )}

      {/* ============================================================ */}
      {/* ÁREA PRINCIPAL: Header Superior e Conteúdo                   */}
      {/* ============================================================ */}
      <div className={`flex-1 flex flex-col min-w-0 relative ${
        isMaster ? (isMapRoute ? 'lg:pl-14 h-screen overflow-hidden' : 'lg:pl-64') : ''
      }`}>
        {/* ============================================================ */}
        {/* HEADER SUPERIOR RESPONSIVO                                   */}
        {/* ============================================================ */}
        {!isMapRoute && (
          isMaster ? (
            /* Header do MESTRE */
            <header className="h-14 border-b border-amber-900/30 relative flex items-center justify-between px-4 sm:px-6 bg-[#090807]/95 backdrop-blur-md sticky top-0 z-30 shadow-[0_2px_15px_rgba(0,0,0,0.7)] w-full">
              {/* Lado Esquerdo: REALMOR [ MESTRE ] */}
              <div className="flex items-center gap-2.5">
                <Link to="/" className="font-cinzel text-lg sm:text-xl font-black text-amber-200 tracking-[0.15em] uppercase drop-shadow">
                  REALMOR
                </Link>
                <span className="text-[9px] font-cinzel font-bold px-2 py-0.5 rounded border border-amber-600/40 bg-amber-950/70 text-amber-300 uppercase tracking-widest">
                  MESTRE
                </span>
              </div>
              
              {/* Lado Direito: [ 👑 MESTRE ] | MESTRE DOS REINOS / Matheus Dantas | [ M ] | [ → ] */}
              <div className="flex items-center gap-2 sm:gap-3">
                <PWAInstallButton />
                <div className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded border border-amber-600/40 bg-amber-950/50 text-amber-300 text-[10px] font-cinzel font-bold tracking-wider uppercase">
                  <Crown size={12} className="text-amber-400" />
                  <span>MESTRE</span>
                </div>

                {user && (
                  <div className="flex items-center gap-2.5">
                    <div className="text-right hidden sm:block">
                      <span className="text-[8px] uppercase tracking-widest text-amber-400/60 font-cinzel font-bold block leading-none">
                        MESTRE DOS REINOS
                      </span>
                      <span className="text-xs font-cinzel font-bold text-stone-200 truncate max-w-[130px] block leading-tight">
                        {userDisplayName}
                      </span>
                    </div>

                    <div 
                      onClick={() => navigate('/profile')}
                      className="w-8 h-8 rounded bg-[#104a3e] border border-emerald-500/50 flex items-center justify-center text-white font-cinzel font-bold text-xs shadow cursor-pointer overflow-hidden hover:brightness-110 active:scale-95 transition-all"
                    >
                      {profile?.photoURL || user?.photoURL ? (
                        <img 
                          src={profile?.photoURL || user?.photoURL || ''} 
                          alt="Avatar" 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <span>{userInitial}</span>
                      )}
                    </div>

                    <button
                      onClick={() => {
                        logout();
                        navigate('/auth');
                      }}
                      className="p-1.5 text-stone-400 hover:text-red-400 transition-colors rounded hover:bg-black/40 cursor-pointer"
                      title="Encerrar sessão"
                    >
                      <LogOut size={16} />
                    </button>
                  </div>
                )}
              </div>
            </header>
          ) : (
            /* Header do JOGADOR - Exatamente conforme especificado:
               - No topo, apenas o nome HELMOR centralizado com ornamentos
               - Sem texto "Jogador" / "Modo Jogador"
               - No canto superior direito, SOMENTE o ícone/avatar do usuário
               - Sem botão de sair/logout
            */
            <header className="h-16 border-b border-amber-900/30 relative flex items-center justify-between px-4 sm:px-6 lg:px-8 bg-[#090a0d]/95 backdrop-blur-md sticky top-0 z-30 shadow-[0_4px_25px_rgba(0,0,0,0.6)] w-full">
              {/* Lado Esquerdo: Botão de instalação PWA quando disponível */}
              <div className="flex items-center justify-start shrink-0">
                <PWAInstallButton />
              </div>

              {/* Centro: ───◇ HELMOR ◇─── */}
              <div className="flex-1 flex items-center justify-center text-center">
                <Link to="/" className="inline-flex items-center justify-center gap-2 sm:gap-3 group select-none">
                  <div className="hidden xs:flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                    <span className="w-6 sm:w-10 h-[1px] bg-gradient-to-r from-transparent to-amber-500/80" />
                    <span className="w-1.5 h-1.5 rotate-45 bg-amber-400/90 border border-amber-300/80" />
                  </div>

                  <h1 className="text-xl sm:text-2xl font-cinzel font-black tracking-[0.15em] sm:tracking-[0.2em] uppercase text-amber-200 group-hover:text-amber-100 transition-colors drop-shadow-[0_2px_10px_rgba(212,175,55,0.4)]">
                    REALMOR
                  </h1>

                  <div className="hidden xs:flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                    <span className="w-1.5 h-1.5 rotate-45 bg-amber-400/90 border border-amber-300/80" />
                    <span className="w-6 sm:w-10 h-[1px] bg-gradient-to-l from-transparent to-amber-500/80" />
                  </div>
                </Link>
              </div>

              {/* Lado Direito: SOMENTE o Avatar do Usuário */}
              <div className="w-10 sm:w-11 flex items-center justify-end shrink-0">
                {user ? (
                  <button
                    id="header-profile-btn"
                    onClick={() => navigate('/profile')}
                    className="w-8 h-8 sm:w-9 sm:h-9 rounded-md bg-[#0d0e12] border border-amber-500/70 p-[2px] shadow-[0_0_12px_rgba(212,175,55,0.25)] hover:border-amber-400 transition-all cursor-pointer flex items-center justify-center group active:scale-95"
                    title="Perfil do Jogador"
                    aria-label="Abrir perfil do jogador"
                  >
                    <div className="w-full h-full rounded-sm border border-amber-500/30 flex items-center justify-center bg-[#13141a] overflow-hidden">
                      {profile?.photoURL || user?.photoURL ? (
                        <img 
                          src={profile?.photoURL || user?.photoURL || ''} 
                          alt={profile?.name || user?.displayName || 'Avatar'} 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <span className="text-amber-300 font-cinzel text-sm font-bold group-hover:text-amber-200">
                          {(profile?.name || user?.displayName)?.[0]?.toUpperCase() || 'M'}
                        </span>
                      )}
                    </div>
                  </button>
                ) : (
                  <Link to="/auth">
                    <Button 
                      size="sm" 
                      variant="secondary" 
                      icon={LogIn} 
                      className="px-3 sm:px-4 text-xs"
                    >
                      <span>Entrar</span>
                    </Button>
                  </Link>
                )}
              </div>
            </header>
          )
        )}
        
        {/* ============================================================ */}
        {/* CONTEÚDO PRINCIPAL                                           */}
        {/* No Modo Jogador na página inicial: 100% preenchida sem       */}
        {/* margens ou bordas, imagem cobrindo toda a área (cover)       */}
        {/* ============================================================ */}
        {isMapRoute ? (
          <main className="flex-1 w-full h-full p-0 m-0 overflow-hidden bg-stone-950 flex flex-col min-h-0">
            {children}
          </main>
        ) : isPlayerHome ? (
          <main className="flex-1 w-full p-0 m-0 relative overflow-hidden bg-black flex flex-col min-h-0">
            <div className="w-full h-full flex flex-col flex-1">
              {children}
            </div>
          </main>
        ) : (
          <main className={`flex-1 overflow-y-auto scroll-smooth ${
            location.pathname.startsWith('/amigos') || location.pathname.startsWith('/friends')
              ? 'p-2 sm:p-3 pb-16 lg:pb-6 flex flex-col min-h-0 overflow-y-auto lg:overflow-visible'
              : 'p-3 sm:p-5 lg:p-6 pb-24 sm:pb-28 lg:pb-8'
          } bg-[#070605] bg-[url('https://www.transparenttextures.com/patterns/dark-leather.png')]`}>
            <div className={`w-full ${
              location.pathname.startsWith('/amigos') || location.pathname.startsWith('/friends')
                ? 'max-w-lg mx-auto flex-1 flex flex-col min-h-0 h-full'
                : 'max-w-6xl mx-auto'
            }`}>
              {children}
            </div>
          </main>
        )}

        {/* Barra de Navegação Inferior Mobile */}
        {!isMapRoute && (
          <BottomNavBar 
            isMaster={isMaster}
            onToggleMore={() => setIsMoreSheetOpen(prev => !prev)}
            isMoreOpen={isMoreSheetOpen}
          />
        )}

        {/* Menu Secundário Mobile */}
        {!isMapRoute && (
          <SecondaryMenuSheet 
            isOpen={isMoreSheetOpen}
            onClose={() => setIsMoreSheetOpen(false)}
          />
        )}
      </div>
    </div>
  );
};

export default AppLayout;
