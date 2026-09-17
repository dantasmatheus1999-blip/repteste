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
  MoreHorizontal
} from 'lucide-react';
import { Button } from '../components/Button';
import { BottomNavBar } from '../components/navigation/BottomNavBar';
import { SecondaryMenuSheet } from '../components/navigation/SecondaryMenuSheet';

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
  }, [activeProfile, isLoading, authLoading, user, location, navigate]);

  // Itens de Navegação do Mestre para Desktop Sidebar
  // 📖 Grimório, 🏰 Campanhas, ⚔️ Mesa do Mestre, 🗺️ Mapas, 📚 Compêndio, ⚙️ Configurações
  const masterNav = [
    { icon: BookOpen, label: 'Grimório', path: '/' },
    { icon: Castle, label: 'Campanhas', path: '/master/campaigns' },
    { icon: Swords, label: 'Mesa do Mestre', path: '/master' },
    { icon: Map, label: 'Mapas', path: '/map/test-map' },
    { icon: Library, label: 'Compêndio', path: '/codex' },
    { icon: Settings, label: 'Configurações', path: '/settings' },
  ];

  // Itens de Navegação do Jogador para Desktop Sidebar
  // 📖 Grimório, 🧙 Personagens, 🎲 Minhas Aventuras, 📚 Compêndio, ⚙️ Configurações
  const playerNav = [
    { icon: BookOpen, label: 'Grimório', path: '/' },
    { icon: Users, label: 'Personagens', path: '/characters' },
    { icon: Dices, label: 'Minhas Aventuras', path: '/immersive-rpg' },
    { icon: Library, label: 'Compêndio', path: '/codex' },
    { icon: Settings, label: 'Configurações', path: '/settings' },
  ];

  const navItems = isMaster ? masterNav : playerNav;
  const isMapRoute = location.pathname.startsWith('/map') || 
                     location.pathname.startsWith('/master/maps') || 
                     location.pathname === '/maps';

  if (location.pathname === '/select-profile' || location.pathname === '/characters/sheet' || isMapRoute) {
    return <>{children}</>;
  }

  return (
    <div className={`flex min-h-screen bg-mythos-bg text-mythos-text overflow-x-hidden ${isMapRoute ? 'h-screen overflow-hidden' : ''}`}>
      {/* ============================================================ */}
      {/* DESKTOP SIDEBAR - Visível apenas em telas grandes (lg+)      */}
      {/* Em rotas de mapa (/map/*), torna-se uma rail estreita (56px) */}
      {/* ============================================================ */}
      <aside className={`hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:z-30 bg-mythos-card border-r border-gold/20 shadow-[5px_0_25px_rgba(0,0,0,0.5)] overflow-y-auto no-scrollbar transition-all duration-200 ${
        isMapRoute ? 'lg:w-14' : 'lg:w-72'
      }`}>
        <div className="flex flex-col h-full bg-[url('https://www.transparenttextures.com/patterns/dark-leather.png')]">
          {/* Logo & Marca Desktop */}
          {isMapRoute ? (
            <div className="p-3 flex items-center justify-center border-b border-gold/10" title="REALMOR Portal Arcano">
              <Link to="/" className="w-8 h-8 rounded bg-gold/10 border border-gold/30 flex items-center justify-center text-gold hover:scale-105 transition-transform">
                <Castle size={18} className="text-gold drop-shadow-[0_0_8px_rgba(212,175,55,0.4)]" />
              </Link>
            </div>
          ) : (
            <div className="p-7 flex items-center justify-between border-b border-gold/10">
              <div>
                <h1 className="text-3xl font-cinzel text-gold tracking-widest uppercase text-gold-gradient font-black">
                  REALMOR
                </h1>
                <p className="text-[10px] text-gold/50 tracking-[0.4em] uppercase font-bold">
                  Portal Arcano
                </p>
              </div>
            </div>
          )}

          {/* Badge de Modo */}
          {!isMapRoute && (
            <div className="px-6 py-4 relative">
              <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" />
              <div className={`px-4 py-1.5 rounded-sm text-[10px] font-bold uppercase tracking-[0.2em] inline-block border-2 ${
                isMaster ? 'bg-gold/10 text-gold border-gold/30' : 'bg-magic/10 text-magic border-magic/30'
              }`}>
                {isMaster ? 'Grimório do Mestre' : 'Diário do Jogador'}
              </div>
              <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" />
            </div>
          )}

          {/* Links de Navegação Desktop */}
          <nav className={`flex-1 space-y-1 ${isMapRoute ? 'px-1.5 py-3' : 'px-4 py-3'}`}>
            {navItems.map((item) => {
              const isActive = location.pathname === item.path || 
                (item.path !== '/' && location.pathname.startsWith(item.path));
              
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
                  className={`flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 group relative overflow-hidden ${
                    isActive 
                      ? 'bg-gradient-to-r from-amber-950/60 to-transparent border-l-4 border-amber-400 text-amber-200 shadow-md' 
                      : 'text-stone-400 hover:text-amber-300 hover:bg-stone-900/40'
                  }`}
                >
                  <div className="flex items-center gap-3.5 relative z-10">
                    <item.icon size={20} className={isActive ? 'text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]' : 'text-stone-500 group-hover:text-amber-400 transition-colors'} />
                    <span className={`font-cinzel tracking-wide text-xs uppercase ${isActive ? 'font-bold text-amber-100' : 'font-medium'}`}>
                      {item.label}
                    </span>
                  </div>
                  {isActive && <ChevronRight size={15} className="text-amber-400/70 relative z-10" />}
                </Link>
              );
            })}
          </nav>

          {/* Rodapé da Sidebar Desktop: Troca de Modo & Logout */}
          {isMapRoute ? (
            <div className="p-1.5 border-t border-gold/10 flex flex-col items-center space-y-1.5 pb-3">
              <button 
                id="sidebar-toggle-mode-btn"
                onClick={() => {
                  toggleMode();
                  navigate('/');
                }}
                className="w-10 h-10 flex items-center justify-center text-gold/90 hover:text-gold transition-all rounded-lg hover:bg-gold/10 border border-gold/20 bg-gold/5 cursor-pointer"
                title={`Trocar de Modo (Ativo: ${isMaster ? 'Mestre' : 'Jogador'})`}
              >
                <ArrowLeftRight size={17} className="text-gold" />
              </button>

              <button 
                id="sidebar-logout-btn"
                onClick={() => {
                  logout();
                  navigate('/auth');
                }}
                className="w-10 h-10 flex items-center justify-center text-health/70 hover:text-health transition-colors rounded-lg hover:bg-health/10 cursor-pointer"
                title="Sair do RealmOR"
              >
                <LogOut size={17} />
              </button>
            </div>
          ) : (
            <div className="p-4 border-t border-gold/10 space-y-2">
              <button 
                id="sidebar-toggle-mode-btn"
                onClick={() => {
                  toggleMode();
                  navigate('/');
                }}
                className="w-full flex items-center justify-between px-4 py-3 text-gold/90 hover:text-gold transition-all rounded-sm hover:bg-gold/10 border border-gold/20 bg-gold/5 cursor-pointer group"
                title="Trocar entre Modo Mestre e Modo Jogador"
              >
                <div className="flex items-center gap-3">
                  <ArrowLeftRight size={18} className="text-gold group-hover:rotate-180 transition-transform duration-500" />
                  <span className="font-cinzel text-xs font-bold uppercase tracking-wider">Trocar de Modo</span>
                </div>
                <span className={`text-[9px] font-cinzel font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${
                  isMaster 
                    ? 'bg-gold/20 text-gold border-gold/40' 
                    : 'bg-magic/20 text-magic border-magic/40'
                }`}>
                  {isMaster ? 'Mestre' : 'Jogador'}
                </span>
              </button>

              <button 
                id="sidebar-logout-btn"
                onClick={() => {
                  logout();
                  navigate('/auth');
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-health/70 hover:text-health transition-colors rounded-sm hover:bg-health/5 cursor-pointer text-xs font-cinzel tracking-wider uppercase font-bold"
              >
                <LogOut size={16} />
                <span>Sair</span>
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* ============================================================ */}
      {/* ÁREA PRINCIPAL: Header, Conteúdo e Barra Inferior Mobile     */}
      {/* ============================================================ */}
      <div className={`flex-1 flex flex-col min-w-0 relative ${
        isMapRoute ? 'lg:pl-14 h-screen overflow-hidden' : 'lg:pl-72'
      }`}>
        {/* Header Superior Responsivo (Oculto no editor de mapa, que já tem sua barra 16:9) */}
        {!isMapRoute && (
          <header className="h-16 border-b border-gold/20 flex items-center justify-between px-4 sm:px-6 lg:px-8 bg-mythos-card/95 backdrop-blur-md sticky top-0 z-30 shadow-[0_4px_20px_rgba(0,0,0,0.4)] w-full">
            {/* Lado Esquerdo: Identidade do App e Badge Mobile */}
            <div className="flex items-center gap-2 sm:gap-3">
              <Link to="/" className="flex items-center gap-2 group">
                <h1 className="text-xl sm:text-2xl font-cinzel text-gold tracking-tight font-black uppercase text-gold-gradient drop-shadow-sm">
                  REALMOR
                </h1>
              </Link>

              {/* Badge Indicador de Modo no Mobile */}
              <span className={`text-[9px] font-cinzel font-black px-2 py-0.5 rounded border uppercase tracking-widest ${
                isMaster 
                  ? 'bg-gold/15 text-gold border-gold/40' 
                  : 'bg-arcane/15 text-arcane border-arcane/40'
              }`}>
                {isMaster ? 'Mestre' : 'Jogador'}
              </span>
            </div>
            
            {/* Lado Direito: Troca Rápida, Perfil e Botões */}
            <div className="flex items-center gap-2 sm:gap-4">
              {user ? (
                <>
                  {/* Botão de Troca Rápida de Modo (Mobile & Desktop) */}
                  <button
                    id="header-toggle-mode-btn"
                    onClick={() => {
                      toggleMode();
                      navigate('/');
                    }}
                    className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded border text-[10px] sm:text-xs font-cinzel font-bold tracking-wider transition-all cursor-pointer ${
                      isMaster 
                        ? 'bg-gold/10 border-gold/40 text-gold hover:bg-gold/20' 
                        : 'bg-arcane/10 border-arcane/40 text-arcane hover:bg-arcane/20'
                    }`}
                    title="Trocar entre Modo Mestre e Modo Jogador"
                  >
                    <ArrowLeftRight size={13} />
                    <span className="hidden xs:inline">Modo</span>
                    <span>{isMaster ? 'Mestre' : 'Jogador'}</span>
                  </button>

                  {/* Nome do Usuário no Desktop */}
                  <div className="text-right hidden sm:block">
                    <p className="text-[10px] text-gold/60 uppercase font-bold leading-none tracking-widest">
                      {isMaster ? 'Mestre dos Reinos' : 'Aventureiro'}
                    </p>
                    <p className="text-sm font-cinzel text-mythos-text leading-tight truncate max-w-[120px]">
                      {profile?.name || user.displayName || 'Herói'}
                    </p>
                  </div>

                  {/* Avatar do Usuário (no mobile, tocar também abre o menu de ações "Mais") */}
                  <button
                    onClick={() => setIsMoreSheetOpen(prev => !prev)}
                    className="rounded-sm focus:outline-none focus:ring-1 focus:ring-gold/50 cursor-pointer"
                    title="Perfil e Opções"
                    aria-label="Abrir perfil e opções"
                  >
                    {profile?.photoURL || user.photoURL ? (
                      <img 
                        src={profile?.photoURL || user.photoURL || ''} 
                        alt={profile?.name || user.displayName || 'Avatar'} 
                        className="w-8 h-8 sm:w-9 sm:h-9 rounded-sm border-2 border-gold/70 shadow-[0_0_12px_rgba(212,175,55,0.25)] object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-sm bg-mythos-card border-2 border-gold/70 shadow-[0_0_12px_rgba(212,175,55,0.25)] flex items-center justify-center text-gold font-cinzel text-sm sm:text-base font-bold">
                        {(profile?.name || user.displayName)?.[0] || 'H'}
                      </div>
                    )}
                  </button>

                  {/* Logout direto no Desktop */}
                  <button 
                    onClick={() => {
                      logout();
                      navigate('/auth');
                    }}
                    className="hidden sm:block p-2 text-health/60 hover:text-health hover:bg-health/10 rounded-sm transition-colors cursor-pointer"
                    title="Sair"
                  >
                    <LogOut size={18} />
                  </button>
                </>
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
        )}
        
        {/* ============================================================ */}
        {/* ÁREA DE CONTEÚDO DA PÁGINA                                  */}
        {/* Para o editor de mapa, ocupa 100% da viewport disponível     */}
        {/* Para outras páginas, mantém o container centralizado padrão  */}
        {/* ============================================================ */}
        {isMapRoute ? (
          <main className="flex-1 w-full h-full p-0 m-0 overflow-hidden bg-stone-950 flex flex-col min-h-0">
            {children}
          </main>
        ) : (
          <main className="flex-1 overflow-y-auto p-3 sm:p-5 lg:p-6 pb-24 sm:pb-28 lg:pb-8 scroll-smooth bg-[url('https://www.transparenttextures.com/patterns/dark-leather.png')]">
            <div className="max-w-7xl mx-auto w-full">
              {children}
            </div>
          </main>
        )}

        {/* ============================================================ */}
        {/* NOVA BARRA DE NAVEGAÇÃO INFERIOR FIXA (MOBILE/TABLET)       */}
        {/* ============================================================ */}
        {!isMapRoute && (
          <BottomNavBar 
            isMaster={isMaster}
            onToggleMore={() => setIsMoreSheetOpen(prev => !prev)}
            isMoreOpen={isMoreSheetOpen}
          />
        )}

        {/* ============================================================ */}
        {/* GAVETA / BOTTOM SHEET DE OPÇÕES SECUNDÁRIAS ("MAIS")        */}
        {/* ============================================================ */}
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
