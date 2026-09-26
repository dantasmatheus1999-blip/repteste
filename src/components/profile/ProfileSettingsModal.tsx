import React from 'react';
import { 
  X, 
  Crown, 
  Swords, 
  ArrowLeftRight, 
  Check, 
  Shield, 
  User, 
  Mail, 
  Calendar, 
  Sparkles, 
  Edit3, 
  LogOut,
  ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../../context/AuthContext';
import { useProfile } from '../../context/ProfileContext';
import { useNavigate } from 'react-router-dom';

interface ProfileSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenEditProfile?: () => void;
}

export const ProfileSettingsModal: React.FC<ProfileSettingsModalProps> = ({
  isOpen,
  onClose,
  onOpenEditProfile
}) => {
  const { user, profile, logout } = useAuth();
  const { activeMode, isMaster, selectProfile, toggleMode } = useProfile();
  const navigate = useNavigate();

  if (!isOpen) return null;

  const userDisplayName = profile?.displayName || profile?.name || user?.displayName || 'Aventureiro';
  const userEmail = user?.email || 'aventureiro@realmor.com.br';

  const handleSelectMode = (mode: 'master' | 'player') => {
    selectProfile(mode);
  };

  const handleToggleAndNavigate = (targetMode: 'master' | 'player') => {
    selectProfile(targetMode);
    onClose();
    if (targetMode === 'master') {
      navigate('/mestre');
    } else {
      navigate('/jogador');
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-lg bg-[#0d0e12] border border-amber-600/50 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col"
        >
          {/* Cantoneiras douradas decorativas */}
          <span className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-amber-400 z-20 pointer-events-none" />
          <span className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-amber-400 z-20 pointer-events-none" />
          <span className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-amber-400 z-20 pointer-events-none" />
          <span className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-amber-400 z-20 pointer-events-none" />

          {/* Cabeçalho do Modal */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-amber-900/40 bg-[#12141a]/90">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-950/80 border border-amber-600/50 flex items-center justify-center text-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.3)]">
                <Crown size={16} />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-cinzel font-black uppercase text-amber-200 tracking-wider">
                  Configurações do Perfil
                </h2>
                <p className="text-[10px] text-stone-400 font-sans">
                  Gerenciamento de conta e modo de jogo
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-stone-900/80 border border-stone-800 text-stone-400 hover:text-amber-200 hover:border-amber-600/40 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>

          {/* Conteúdo das Configurações */}
          <div className="p-5 space-y-5 overflow-y-auto max-h-[75vh] custom-scrollbar text-stone-200">
            
            {/* SEÇÃO PRINCIPAL: SELETOR DE MODO (MESTRE / JOGADOR) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <label className="text-xs font-cinzel font-black text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                  <ArrowLeftRight size={14} className="text-amber-400" />
                  <span>Modo de Jogo Ativo</span>
                </label>
                <span className="text-[10px] font-mono text-stone-400">
                  Modo atual: <strong className="text-amber-300 uppercase">{isMaster ? 'Mestre' : 'Jogador'}</strong>
                </span>
              </div>

              {/* Grid com os 2 Modos */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* 1. Card Modo Mestre */}
                <div
                  onClick={() => handleSelectMode('master')}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between group ${
                    isMaster
                      ? 'bg-gradient-to-b from-amber-950/80 to-[#120f0a] border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.25)] ring-1 ring-amber-400/50'
                      : 'bg-stone-900/50 hover:bg-stone-900/80 border-stone-800 hover:border-amber-900/60 opacity-75 hover:opacity-100'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${
                          isMaster
                            ? 'bg-amber-500 text-stone-950 border-amber-300 shadow-md font-bold'
                            : 'bg-stone-950 border-stone-800 text-amber-400/70'
                        }`}>
                          <Crown size={16} />
                        </div>
                        <span className="font-cinzel font-black text-xs uppercase tracking-wider text-amber-200">
                          Modo Mestre
                        </span>
                      </div>

                      {isMaster && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-cinzel font-bold bg-amber-500 text-stone-950 flex items-center gap-1">
                          <Check size={10} strokeWidth={3} /> Ativo
                        </span>
                      )}
                    </div>

                    <p className="text-[11px] text-stone-400 font-sans leading-relaxed">
                      Painel completo de narrador: campanhas, bestiário, NPCs, notas e mapas de combate.
                    </p>
                  </div>

                  <div className="pt-3 mt-2 border-t border-amber-900/30 flex items-center justify-between">
                    <span className="text-[10px] font-cinzel text-amber-400 font-bold uppercase">
                      {isMaster ? '✓ Selecionado' : 'Clique para ativar'}
                    </span>
                    {isMaster && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleAndNavigate('master');
                        }}
                        className="text-[10px] font-cinzel text-amber-300 hover:text-amber-100 underline flex items-center gap-0.5"
                      >
                        Abrir Mesa <ExternalLink size={10} />
                      </button>
                    )}
                  </div>
                </div>

                {/* 2. Card Modo Jogador */}
                <div
                  onClick={() => handleSelectMode('player')}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between group ${
                    !isMaster
                      ? 'bg-gradient-to-b from-blue-950/70 to-[#0a0f18] border-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.25)] ring-1 ring-blue-400/50'
                      : 'bg-stone-900/50 hover:bg-stone-900/80 border-stone-800 hover:border-blue-900/60 opacity-75 hover:opacity-100'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${
                          !isMaster
                            ? 'bg-blue-500 text-stone-950 border-blue-300 shadow-md font-bold'
                            : 'bg-stone-950 border-stone-800 text-blue-400/70'
                        }`}>
                          <Swords size={16} />
                        </div>
                        <span className="font-cinzel font-black text-xs uppercase tracking-wider text-blue-200">
                          Modo Jogador
                        </span>
                      </div>

                      {!isMaster && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-cinzel font-bold bg-blue-500 text-stone-950 flex items-center gap-1">
                          <Check size={10} strokeWidth={3} /> Ativo
                        </span>
                      )}
                    </div>

                    <p className="text-[11px] text-stone-400 font-sans leading-relaxed">
                      Experiência de aventureiro: fichas de personagens, dados 3D, grimório e mesas conectadas.
                    </p>
                  </div>

                  <div className="pt-3 mt-2 border-t border-blue-900/30 flex items-center justify-between">
                    <span className="text-[10px] font-cinzel text-blue-400 font-bold uppercase">
                      {!isMaster ? '✓ Selecionado' : 'Clique para ativar'}
                    </span>
                    {!isMaster && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleAndNavigate('player');
                        }}
                        className="text-[10px] font-cinzel text-blue-300 hover:text-blue-100 underline flex items-center gap-0.5"
                      >
                        Abrir Aventuras <ExternalLink size={10} />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Botão Alternador Rápido */}
              <button
                type="button"
                onClick={toggleMode}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-950/60 via-stone-900 to-amber-950/60 hover:from-amber-900/60 hover:to-amber-900/60 border border-amber-600/50 text-amber-200 text-xs font-cinzel font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
              >
                <ArrowLeftRight size={14} className="text-amber-400" />
                <span>Alternar para Modo {isMaster ? 'Jogador' : 'Mestre'}</span>
              </button>
            </div>

            {/* SEÇÃO: DADOS DA CONTA */}
            <div className="space-y-2.5 pt-3 border-t border-amber-900/30">
              <label className="text-xs font-cinzel font-black text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                <User size={14} className="text-amber-400" />
                <span>Informações do Usuário</span>
              </label>

              <div className="p-3 rounded-xl bg-stone-950/80 border border-amber-900/40 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-stone-400">Nome de Exibição:</span>
                  <span className="font-cinzel font-bold text-amber-200">{userDisplayName}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-stone-400">E-mail:</span>
                  <span className="font-mono text-stone-300 text-[11px]">{userEmail}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-stone-400">Status da Conta:</span>
                  <span className="text-emerald-400 font-bold text-[11px] flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Autenticado
                  </span>
                </div>
              </div>

              {onOpenEditProfile && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenEditProfile();
                  }}
                  className="w-full py-2 px-4 rounded-lg bg-stone-900 hover:bg-stone-850 border border-amber-900/40 text-amber-300 font-cinzel text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Edit3 size={13} />
                  <span>Personalizar Avatar e Capa</span>
                </button>
              )}
            </div>

            {/* SEÇÃO: LOGOUT */}
            <div className="pt-3 border-t border-amber-900/30 flex justify-between items-center">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  logout();
                  navigate('/auth');
                }}
                className="py-2 px-4 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/40 text-rose-300 font-cinzel text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-colors cursor-pointer"
              >
                <LogOut size={14} />
                <span>Encerrar Sessão</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="py-2 px-5 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 font-cinzel text-xs font-black uppercase tracking-wider transition-colors cursor-pointer"
              >
                Concluído
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
