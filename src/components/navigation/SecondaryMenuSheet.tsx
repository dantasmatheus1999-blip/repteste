import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  ArrowLeftRight, 
  Library, 
  Skull, 
  Users, 
  StickyNote, 
  Plus, 
  Wand2, 
  Zap, 
  Settings, 
  LogOut, 
  User as UserIcon,
  ChevronRight,
  Shield,
  BookOpen
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useProfile } from '../../context/ProfileContext';

interface SecondaryMenuSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SecondaryMenuSheet: React.FC<SecondaryMenuSheetProps> = ({
  isOpen,
  onClose
}) => {
  const navigate = useNavigate();
  const { user, profile, logout } = useAuth();
  const { isMaster, toggleMode } = useProfile();

  const handleNavigate = (path: string) => {
    onClose();
    navigate(path);
  };

  const handleToggleMode = () => {
    toggleMode();
    onClose();
    navigate('/');
  };

  const handleLogout = () => {
    onClose();
    logout();
    navigate('/auth');
  };

  // Itens secundários de navegação do MESTRE
  const masterSecondaryLinks = [
    {
      label: 'Compêndio & Regras',
      description: 'Classes, raças, magias e regras de Tormenta20',
      icon: Library,
      path: '/codex',
      color: 'text-amber-400'
    },
    {
      label: 'Bestiário',
      description: 'Catálogo de ameaças e fichas de monstros',
      icon: Skull,
      path: '/master/monsters',
      color: 'text-red-400'
    },
    {
      label: 'NPCs & Aliados',
      description: 'Fichas de personagens não-jogadores e gerador',
      icon: Users,
      path: '/master/npcs',
      color: 'text-amber-300'
    },
    {
      label: 'Notas do Mestre',
      description: 'Anotações, segredos e rascunhos de sessões',
      icon: StickyNote,
      path: '/master/notes',
      color: 'text-amber-400'
    },
    {
      label: 'Criar Campanha',
      description: 'Iniciar uma nova mesa ou jornada',
      icon: Plus,
      path: '/master/campaigns/new',
      color: 'text-emerald-400'
    }
  ];

  // Itens secundários de navegação do JOGADOR
  const playerSecondaryLinks = [
    {
      label: 'Criar Personagem',
      description: 'Forjar novo herói através do assistente',
      icon: Plus,
      path: '/characters/sheet',
      color: 'text-emerald-400'
    },
    {
      label: 'Grimório de Magias',
      description: 'Consultar magias arcanas e divinas',
      icon: Wand2,
      path: '/spells',
      color: 'text-arcane'
    },
    {
      label: 'Poderes & Talentos',
      description: 'Lista de poderes concedidos e gerais',
      icon: Zap,
      path: '/codex/poderes',
      color: 'text-amber-400'
    },
    {
      label: 'Classes & Raças',
      description: 'Consultar opções de classe e raça do sistema',
      icon: Shield,
      path: '/codex/classes',
      color: 'text-amber-300'
    }
  ];

  const secondaryLinks = isMaster ? masterSecondaryLinks : playerSecondaryLinks;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 lg:hidden"
            aria-hidden="true"
          />

          {/* Bottom Sheet Drawer */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 250 }}
            className="fixed bottom-0 left-0 right-0 z-50 max-h-[85vh] overflow-y-auto bg-[#0a0a0e] border-t border-gold/30 rounded-t-2xl shadow-[0_-15px_40px_rgba(0,0,0,0.95)] pb-[max(1.5rem,env(safe-area-inset-bottom))] lg:hidden no-scrollbar"
            id="mobile-secondary-menu-sheet"
          >
            {/* Puxador decorativo */}
            <div className="pt-3 pb-2 flex justify-center sticky top-0 bg-[#0a0a0e]/95 backdrop-blur-md z-10">
              <div className="w-12 h-1.5 bg-gold/25 rounded-full" />
            </div>

            <div className="px-5 pb-6 space-y-6">
              {/* Header do Drawer */}
              <div className="flex items-center justify-between border-b border-gold/15 pb-4">
                <div className="flex items-center gap-3">
                  {profile?.photoURL || user?.photoURL ? (
                    <img 
                      src={profile?.photoURL || user?.photoURL || ''} 
                      alt="Avatar" 
                      className="w-11 h-11 rounded-sm border border-gold/50 shadow-[0_0_12px_rgba(212,175,55,0.25)] object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-11 h-11 rounded-sm bg-black/60 border border-gold/40 flex items-center justify-center text-gold font-cinzel font-bold text-lg">
                      {(profile?.name || user?.displayName)?.[0] || 'H'}
                    </div>
                  )}
                  <div>
                    <h3 className="font-cinzel text-sm text-gold-light font-bold truncate max-w-[180px]">
                      {profile?.name || user?.displayName || 'Aventureiro'}
                    </h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`text-[9px] font-cinzel font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${
                        isMaster 
                          ? 'bg-gold/15 text-gold border-gold/40' 
                          : 'bg-arcane/15 text-arcane border-arcane/40'
                      }`}>
                        {isMaster ? 'Mestre dos Reinos' : 'Aventureiro'}
                      </span>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={onClose}
                  className="p-2 text-stone-400 hover:text-gold rounded-full bg-stone-900/60 border border-stone-800 transition-colors"
                  aria-label="Fechar menu"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Botão de Troca Rápida de Modo */}
              <div className="bg-gradient-to-r from-stone-900/80 to-stone-950/80 p-3 rounded-lg border border-gold/20 shadow-inner">
                <button
                  onClick={handleToggleMode}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded text-left transition-all group bg-black/40 hover:bg-gold/10 border border-gold/20"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-gold/10 border border-gold/30 flex items-center justify-center text-gold group-hover:rotate-180 transition-transform duration-500">
                      <ArrowLeftRight size={16} />
                    </div>
                    <div>
                      <p className="text-[11px] font-cinzel uppercase font-bold text-gold tracking-wider">
                        Trocar de Modo
                      </p>
                      <p className="text-[10px] text-stone-400">
                        Alternar para {isMaster ? 'Modo Jogador' : 'Modo Mestre'}
                      </p>
                    </div>
                  </div>
                  <span className={`text-[9px] font-cinzel font-bold px-2 py-1 rounded border uppercase tracking-wider ${
                    !isMaster 
                      ? 'bg-gold/20 text-gold border-gold/50' 
                      : 'bg-arcane/20 text-arcane border-arcane/50'
                  }`}>
                    Ativar {isMaster ? 'Jogador' : 'Mestre'}
                  </span>
                </button>
              </div>

              {/* Ações e Atalhos do Modo Atual */}
              <div className="space-y-2">
                <p className="text-[10px] font-cinzel text-gold/60 uppercase font-bold tracking-[0.2em] px-1">
                  {isMaster ? 'Ferramentas do Mestre' : 'Atalhos do Aventureiro'}
                </p>

                <div className="grid grid-cols-1 gap-2">
                  {secondaryLinks.map((item, idx) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={idx}
                        onClick={() => handleNavigate(item.path)}
                        className="w-full flex items-center justify-between p-3 rounded-lg bg-stone-900/40 hover:bg-stone-900/80 border border-stone-800/80 hover:border-gold/30 transition-all text-left group"
                      >
                        <div className="flex items-center gap-3.5">
                          <div className="w-9 h-9 rounded-md bg-black/50 border border-gold/15 flex items-center justify-center shrink-0 group-hover:border-gold/40 transition-colors">
                            <Icon size={18} className={item.color} />
                          </div>
                          <div>
                            <p className="text-xs font-cinzel font-bold text-stone-200 group-hover:text-amber-200 uppercase tracking-wide">
                              {item.label}
                            </p>
                            <p className="text-[10px] text-stone-400 line-clamp-1">
                              {item.description}
                            </p>
                          </div>
                        </div>
                        <ChevronRight size={16} className="text-stone-400 group-hover:text-gold transition-colors shrink-0 ml-2" />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Sistema & Preferências */}
              <div className="space-y-2 border-t border-gold/15 pt-4">
                <p className="text-[10px] font-cinzel text-gold/60 uppercase font-bold tracking-[0.2em] px-1">
                  Sistema & Conta
                </p>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleNavigate('/select-profile')}
                    className="flex items-center gap-2.5 p-3 rounded-lg bg-stone-900/40 hover:bg-stone-900/80 border border-stone-800 text-left transition-all"
                  >
                    <UserIcon size={16} className="text-gold/70 shrink-0" />
                    <span className="text-[11px] font-cinzel uppercase font-bold text-stone-300 truncate">
                      Perfis
                    </span>
                  </button>

                  <button
                    onClick={() => handleNavigate('/settings')}
                    className="flex items-center gap-2.5 p-3 rounded-lg bg-stone-900/40 hover:bg-stone-900/80 border border-stone-800 text-left transition-all"
                  >
                    <Settings size={16} className="text-gold/70 shrink-0" />
                    <span className="text-[11px] font-cinzel uppercase font-bold text-stone-300 truncate">
                      Ajustes
                    </span>
                  </button>
                </div>

                {/* Botão de Logout */}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 p-3 mt-2 rounded-lg bg-red-950/20 hover:bg-red-950/40 border border-red-900/30 text-red-400 font-cinzel text-xs uppercase font-bold tracking-wider transition-colors"
                >
                  <LogOut size={16} />
                  <span>Encerrar Sessão</span>
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
