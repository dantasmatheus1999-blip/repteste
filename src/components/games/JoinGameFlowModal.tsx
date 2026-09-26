import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sword, 
  Shield, 
  Crown, 
  Sparkles, 
  Plus, 
  AlertCircle, 
  Check, 
  ArrowRight, 
  X, 
  Heart, 
  Flame, 
  Search, 
  CheckCircle2,
  ChevronLeft
} from 'lucide-react';
import { Game } from '../../types/game';
import { T20Character } from '../../types/t20';
import { GameService } from '../../services/gameService';
import { CharacterService } from '../../services/characterService';
import { useAuth } from '../../context/AuthContext';
import { extractCharacterSummary, getClassEmoji, CharacterSummary } from '../../utils/characterUtils';

interface JoinGameFlowModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialInviteCode?: string;
  preloadedGameInfo?: { game: Game; campaignId: string; masterName: string };
  // Modo de troca de personagem dentro do lobby
  isChangingCharacter?: boolean;
  existingPlayerId?: string;
  onCharacterChanged?: (newCharacter: CharacterSummary) => void;
}

export const JoinGameFlowModal: React.FC<JoinGameFlowModalProps> = ({
  isOpen,
  onClose,
  initialInviteCode = '',
  preloadedGameInfo,
  isChangingCharacter = false,
  existingPlayerId,
  onCharacterChanged
}) => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  // Etapas:
  // 1 = DIGITA CÓDIGO DO MESTRE (se não veio precarregado)
  // 2 = SISTEMA ENCONTRA O JOGO & ESCOLHER PERSONAGEM
  // 3 = CONFIRMAÇÃO DO HERÓI (Nome, Raça, Classe, Nível, PV, PM)
  const [step, setStep] = useState<1 | 2 | 3>(preloadedGameInfo ? 2 : 1);

  const [inviteCodeInput, setInviteCodeInput] = useState(initialInviteCode);
  const [searchingGame, setSearchingGame] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const [gameInfo, setGameInfo] = useState<{ game: Game; campaignId: string; masterName: string } | null>(
    preloadedGameInfo || null
  );

  const [userCharacters, setUserCharacters] = useState<CharacterSummary[]>([]);
  const [loadingCharacters, setLoadingCharacters] = useState(false);
  const [selectedCharacter, setSelectedCharacter] = useState<CharacterSummary | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Efeito ao abrir o modal ou mudar inviteCode
  useEffect(() => {
    if (!isOpen) {
      // Reset ao fechar
      if (!preloadedGameInfo) {
        setStep(1);
        setInviteCodeInput(initialInviteCode);
        setGameInfo(null);
      }
      setSelectedCharacter(null);
      setSearchError(null);
      setSubmitError(null);
      return;
    }

    if (preloadedGameInfo) {
      setGameInfo(preloadedGameInfo);
      setStep(2);
    } else if (initialInviteCode) {
      setInviteCodeInput(initialInviteCode);
      handleSearchCode(initialInviteCode);
    }
  }, [isOpen, initialInviteCode, preloadedGameInfo]);

  // Carrega os personagens do usuário autenticado
  useEffect(() => {
    if (!isOpen || !user?.uid) return;

    setLoadingCharacters(true);
    const unsubscribe = CharacterService.subscribeToUserCharacters(user.uid, (chars) => {
      const summaries = chars.map(c => extractCharacterSummary(c));
      setUserCharacters(summaries);
      setLoadingCharacters(false);
    });

    return () => unsubscribe();
  }, [isOpen, user?.uid]);

  // Busca o jogo pelo código
  const handleSearchCode = async (codeToSearch?: string) => {
    const code = (codeToSearch || inviteCodeInput).trim().toUpperCase();
    if (!code) {
      setSearchError('Por favor, informe o código do mestre.');
      return;
    }

    setSearchingGame(true);
    setSearchError(null);

    try {
      const result = await GameService.getGameByInviteCode(code);
      if (!result) {
        setSearchError(`Nenhuma mesa encontrada com o código "${code}". Verifique o código e tente novamente.`);
        setGameInfo(null);
      } else {
        setGameInfo(result);
        setStep(2); // Avança para a tela de Informações da Aventura + Escolha do Herói
      }
    } catch (err) {
      console.error('Erro ao buscar jogo:', err);
      setSearchError('Ocorreu uma falha ao buscar a mesa. Tente novamente.');
    } finally {
      setSearchingGame(false);
    }
  };

  // Escolha do personagem -> vai para a tela de confirmação
  const handleSelectHero = (hero: CharacterSummary) => {
    setSelectedCharacter(hero);
    setStep(3);
  };

  // Confirmação e entrada no jogo
  const handleConfirmAndEnter = async () => {
    if (!gameInfo || !selectedCharacter) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const displayName = selectedCharacter.name || profile?.name || user?.displayName || 'Aventureiro';

      // Se for modo de troca de personagem dentro do lobby
      if (isChangingCharacter && existingPlayerId) {
        await GameService.updatePlayerCharacter(
          gameInfo.campaignId,
          gameInfo.game.id,
          existingPlayerId,
          {
            id: selectedCharacter.id,
            name: selectedCharacter.name,
            className: selectedCharacter.className,
            level: selectedCharacter.level,
            race: selectedCharacter.race,
            avatarUrl: selectedCharacter.avatarUrl
          }
        );
        if (onCharacterChanged) {
          onCharacterChanged(selectedCharacter);
        }
        onClose();
        return;
      }

      // Fluxo normal: entrar no jogo registrando characterId
      await GameService.joinGame(gameInfo.campaignId, gameInfo.game.id, {
        displayName,
        userId: user?.uid,
        characterId: selectedCharacter.id,
        characterName: selectedCharacter.name,
        characterClass: selectedCharacter.className,
        characterLevel: selectedCharacter.level,
        characterRace: selectedCharacter.race,
        characterAvatar: selectedCharacter.avatarUrl
      });

      // Redireciona para o LOBBY da mesa
      onClose();
      navigate(`/campaigns/${gameInfo.campaignId}/games/${gameInfo.game.id}`);
    } catch (err: any) {
      console.error('Erro ao vincular personagem ao jogo:', err);
      setSubmitError(err.message || 'Falha ao ingressar no jogo com este herói.');
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg rounded-2xl border border-amber-800/60 bg-gradient-to-b from-[#1b1510] via-[#14100c] to-[#0c0907] p-4 sm:p-6 shadow-[0_25px_65px_rgba(0,0,0,0.95)] relative overflow-hidden flex flex-col max-h-[92vh]"
        style={{
          boxShadow: 'inset 0 1px 0 rgba(212,175,55,0.25), inset 0 0 40px rgba(0,0,0,0.8), 0 25px 60px rgba(0,0,0,0.95)'
        }}
      >
        {/* Cantoneiras metálicas decorativas */}
        <div className="absolute top-2.5 left-2.5 w-3.5 h-3.5 border-t-2 border-l-2 border-amber-500/50 pointer-events-none" />
        <div className="absolute top-2.5 right-2.5 w-3.5 h-3.5 border-t-2 border-r-2 border-amber-500/50 pointer-events-none" />
        <div className="absolute bottom-2.5 left-2.5 w-3.5 h-3.5 border-b-2 border-l-2 border-amber-500/50 pointer-events-none" />
        <div className="absolute bottom-2.5 right-2.5 w-3.5 h-3.5 border-b-2 border-r-2 border-amber-500/50 pointer-events-none" />

        {/* Botão Fechar Modal */}
        <button
          onClick={onClose}
          disabled={isSubmitting}
          className="absolute top-4 right-4 text-stone-400 hover:text-amber-200 p-1 rounded-lg hover:bg-amber-950/40 transition-colors z-20 cursor-pointer"
        >
          <X size={18} />
        </button>

        {/* ======================================================================= */}
        {/* ETAPA 1: DIGITA CÓDIGO DO MESTRE                                        */}
        {/* ======================================================================= */}
        {step === 1 && (
          <div className="space-y-6 pt-2">
            <div className="text-center space-y-1.5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#18130e] border border-amber-800/40 text-amber-300 text-xs font-cinzel font-bold tracking-widest uppercase">
                <Sword size={13} className="text-amber-400" />
                <span>REALMOR • MODO JOGADOR</span>
              </div>
              <h2 className="text-2xl font-cinzel font-bold text-amber-100 tracking-wide">
                Entrar em um Jogo
              </h2>
              <p className="text-xs font-serif italic text-stone-400">
                Digite o código da mesa compartilhado pelo seu Mestre
              </p>
            </div>

            <form 
              onSubmit={(e) => {
                e.preventDefault();
                handleSearchCode();
              }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <label className="block text-xs font-cinzel font-bold uppercase tracking-wider text-amber-300">
                  CÓDIGO DO MESTRE
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    autoFocus
                    value={inviteCodeInput}
                    onChange={(e) => setInviteCodeInput(e.target.value.toUpperCase())}
                    placeholder="Ex: K7F-92A"
                    className="w-full px-4 py-3 rounded-xl bg-[#090705] border border-amber-900/70 text-amber-100 font-mono text-center text-lg tracking-widest placeholder-stone-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50 uppercase"
                  />
                </div>
              </div>

              {searchError && (
                <div className="p-3 rounded-xl bg-red-950/60 border border-red-800/60 text-red-300 text-xs flex items-center gap-2">
                  <AlertCircle size={15} className="shrink-0 text-red-400" />
                  <span>{searchError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={searchingGame || !inviteCodeInput.trim()}
                className="w-full py-3.5 px-5 rounded-xl bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700 hover:from-amber-600 hover:to-amber-500 text-stone-950 font-cinzel font-bold tracking-widest uppercase text-xs sm:text-sm shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {searchingGame ? (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-stone-950 border-t-transparent animate-spin" />
                    <span>Localizando mesa...</span>
                  </>
                ) : (
                  <>
                    <Search size={16} />
                    <span>ENCONTRAR JOGO</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* ======================================================================= */}
        {/* ETAPA 2: MOSTRA INFORMAÇÕES DA AVENTURA + ESCOLHER PERSONAGEM           */}
        {/* ======================================================================= */}
        {step === 2 && gameInfo && (
          <div className="space-y-4 flex flex-col overflow-hidden">
            {/* Header da Aventura */}
            <div className="text-center space-y-1 border-b border-amber-900/40 pb-3">
              <div className="inline-flex items-center gap-1.5 text-xs font-cinzel font-bold uppercase tracking-widest text-amber-400">
                <Sword size={13} className="text-amber-400" />
                {isChangingCharacter ? 'TROCAR HERÓI DA AVENTURA' : '⚔️ ENTRAR NA AVENTURA'}
              </div>
              <h2 className="text-xl sm:text-2xl font-cinzel font-bold text-amber-100 tracking-wide">
                {gameInfo.game.name}
              </h2>
              <div className="flex items-center justify-center gap-3 text-xs text-stone-400 font-serif">
                <span className="flex items-center gap-1 text-amber-300/90 font-semibold">
                  <Shield size={12} className="text-amber-400" />
                  Sistema: {gameInfo.game.system || 'Tormenta 20'}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Crown size={12} className="text-amber-400" />
                  Mestre: <strong className="text-stone-200">{gameInfo.masterName}</strong>
                </span>
              </div>
            </div>

            {/* Chamada para Escolher Personagem */}
            <div className="flex items-center justify-between pt-1">
              <span className="text-xs font-cinzel font-bold uppercase tracking-wider text-amber-300">
                "ESCOLHA SEU HERÓI"
              </span>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  navigate('/characters/sheet');
                }}
                className="inline-flex items-center gap-1 text-[11px] font-cinzel font-bold uppercase tracking-wider text-amber-400 hover:text-amber-300 hover:underline cursor-pointer"
              >
                <Plus size={13} />
                <span>+ CRIAR NOVO PERSONAGEM</span>
              </button>
            </div>

            {/* Lista de Personagens pertencentes ao usuário autenticado */}
            <div className="overflow-y-auto space-y-2.5 pr-1 max-h-[44vh] custom-scrollbar">
              {loadingCharacters ? (
                <div className="py-10 text-center space-y-2">
                  <div className="w-8 h-8 rounded-full border-2 border-amber-500 border-t-transparent animate-spin mx-auto" />
                  <p className="text-xs font-cinzel text-amber-200/70">Consultando seus heróis...</p>
                </div>
              ) : userCharacters.length === 0 ? (
                <div className="p-6 rounded-xl bg-[#090705] border border-dashed border-amber-900/40 text-center space-y-3">
                  <p className="text-xs font-serif text-stone-300">
                    Você ainda não possui nenhum herói criado na sua conta.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      navigate('/characters/sheet');
                    }}
                    className="py-2.5 px-4 rounded-xl bg-amber-950/80 hover:bg-amber-900 border border-amber-600/50 text-amber-200 text-xs font-cinzel font-bold uppercase tracking-wider inline-flex items-center gap-2 cursor-pointer shadow"
                  >
                    <Plus size={14} className="text-amber-400" />
                    <span>[ + CRIAR NOVO PERSONAGEM ]</span>
                  </button>
                </div>
              ) : (
                userCharacters.map((char) => {
                  const emoji = getClassEmoji(char.className);
                  return (
                    <div
                      key={char.id}
                      className="p-3 rounded-xl bg-[#0e0a07] border border-amber-900/40 hover:border-amber-600/70 transition-all flex items-center justify-between gap-3 group shadow-sm min-h-[58px]"
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <div className="w-10 h-10 rounded-lg bg-stone-900 border border-amber-900/50 flex items-center justify-center text-lg shrink-0 select-none">
                          {emoji}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="font-cinzel font-bold text-xs sm:text-sm text-stone-100 group-hover:text-amber-200 transition-colors truncate leading-tight">
                            {char.name.toUpperCase()}
                          </h4>
                          <p className="text-[11px] sm:text-xs text-amber-400/80 font-serif truncate mt-0.5 leading-tight">
                            {char.className} • Nível {char.level}
                            {char.race && <span className="text-stone-400"> ({char.race})</span>}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleSelectHero(char)}
                        className="shrink-0 self-center px-3 py-1.5 rounded-lg bg-amber-950/80 hover:bg-amber-800 border border-amber-600/60 hover:border-amber-400 text-amber-200 hover:text-amber-100 text-xs font-cinzel font-bold uppercase tracking-wider transition-all shadow-sm active:scale-95 cursor-pointer whitespace-nowrap"
                      >
                        ESCOLHER
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            {/* Rodapé da Etapa 2 */}
            <div className="pt-2 border-t border-amber-900/30 flex items-center justify-between">
              {!preloadedGameInfo && !isChangingCharacter ? (
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="inline-flex items-center gap-1.5 text-xs text-stone-400 hover:text-stone-200 font-cinzel uppercase tracking-wider py-1 px-2 cursor-pointer"
                >
                  <ChevronLeft size={14} />
                  <span>Trocar Código</span>
                </button>
              ) : <div />}

              <button
                type="button"
                onClick={() => {
                  onClose();
                  navigate('/characters/sheet');
                }}
                className="inline-flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 font-cinzel font-bold uppercase tracking-wider py-1 px-2 cursor-pointer"
              >
                <Plus size={14} />
                <span>Criar Novo Herói</span>
              </button>
            </div>
          </div>
        )}

        {/* ======================================================================= */}
        {/* ETAPA 3: CONFIRMAÇÃO DO RESUMO DO HERÓI                                 */}
        {/* ======================================================================= */}
        {step === 3 && selectedCharacter && gameInfo && (
          <div className="flex flex-col max-h-[calc(90vh-3rem)] overflow-y-auto custom-scrollbar pr-0.5 space-y-3.5 pt-0.5">
            <div className="text-center space-y-0.5 border-b border-amber-900/40 pb-2.5 shrink-0">
              <div className="inline-flex items-center gap-1.5 text-[11px] font-cinzel font-bold uppercase tracking-widest text-amber-400">
                <CheckCircle2 size={12} className="text-amber-400" />
                <span>CONFIRMAR SELEÇÃO</span>
              </div>
              <h2 className="text-lg sm:text-xl font-cinzel font-bold text-amber-100 tracking-wide">
                SEU HERÓI
              </h2>
              <p className="text-xs font-serif text-stone-400">
                Mesa: <strong className="text-amber-200">{gameInfo.game.name}</strong>
              </p>
            </div>

            {/* Card com o Resumo Especificado: Nome, Raça, Classe, Nível, PV, PM */}
            <div className="rounded-xl border border-amber-800/50 bg-[#090705] p-3 sm:p-4 space-y-2.5 shadow-inner shrink-0">
              <div className="flex items-center gap-2.5 border-b border-amber-900/30 pb-2.5">
                <span className="text-2xl sm:text-3xl shrink-0">
                  {getClassEmoji(selectedCharacter.className)}
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="text-base font-cinzel font-bold text-amber-100 truncate leading-tight">
                    {selectedCharacter.name}
                  </h3>
                  <p className="text-[11px] font-serif text-amber-400/80 truncate">
                    Herói vinculado ao usuário
                  </p>
                </div>
              </div>

              {/* Tabela Resumo Vertical / Grade Limpa */}
              <div className="grid grid-cols-2 gap-2 text-xs font-serif">
                <div className="p-1.5 sm:p-2 rounded-lg bg-[#14100c] border border-amber-950 flex flex-col">
                  <span className="text-[9px] font-cinzel uppercase text-stone-400 font-bold">Raça</span>
                  <span className="font-semibold text-stone-200 mt-0.5 text-xs truncate">{selectedCharacter.race || 'Humano'}</span>
                </div>

                <div className="p-1.5 sm:p-2 rounded-lg bg-[#14100c] border border-amber-950 flex flex-col">
                  <span className="text-[9px] font-cinzel uppercase text-stone-400 font-bold">Classe</span>
                  <span className="font-semibold text-stone-200 mt-0.5 text-xs truncate">{selectedCharacter.className}</span>
                </div>

                <div className="p-1.5 sm:p-2 rounded-lg bg-[#14100c] border border-amber-950 flex flex-col">
                  <span className="text-[9px] font-cinzel uppercase text-stone-400 font-bold">Nível</span>
                  <span className="font-semibold text-amber-300 mt-0.5 font-mono text-xs">Nível {selectedCharacter.level}</span>
                </div>

                <div className="p-1.5 sm:p-2 rounded-lg bg-[#14100c] border border-amber-950 flex flex-col">
                  <span className="text-[9px] font-cinzel uppercase text-stone-400 font-bold flex items-center gap-1">
                    <Heart size={10} className="text-red-400 shrink-0" /> PV
                  </span>
                  <span className="font-semibold text-red-300 mt-0.5 font-mono text-xs">
                    {selectedCharacter.currentPV} / {selectedCharacter.maxPV}
                  </span>
                </div>

                <div className="col-span-2 p-1.5 sm:p-2 rounded-lg bg-[#14100c] border border-amber-950 flex items-center justify-between">
                  <span className="text-[9px] font-cinzel uppercase text-stone-400 font-bold flex items-center gap-1">
                    <Sparkles size={10} className="text-blue-400 shrink-0" /> PM (Mana)
                  </span>
                  <span className="font-semibold text-blue-300 font-mono text-xs">
                    {selectedCharacter.currentPM} / {selectedCharacter.maxPM}
                  </span>
                </div>
              </div>
            </div>

            {submitError && (
              <div className="p-2.5 rounded-xl bg-red-950/60 border border-red-800/60 text-red-300 text-xs flex items-center gap-2 shrink-0">
                <AlertCircle size={14} className="shrink-0 text-red-400" />
                <span>{submitError}</span>
              </div>
            )}

            {/* Botões de Ação */}
            <div className="space-y-2 pt-1 pb-1 shrink-0">
              <button
                type="button"
                onClick={handleConfirmAndEnter}
                disabled={isSubmitting}
                className="w-full py-2.5 sm:py-3 px-4 rounded-xl bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700 hover:from-amber-600 hover:to-amber-500 text-stone-950 font-cinzel font-bold tracking-wider uppercase text-xs sm:text-sm shadow-xl transition-all flex items-center justify-center gap-2 active:scale-[0.98] cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-stone-950 border-t-transparent animate-spin shrink-0" />
                    <span>Vinculando Herói...</span>
                  </>
                ) : (
                  <>
                    <Sword size={15} className="shrink-0" />
                    <span>{isChangingCharacter ? 'CONFIRMAR TROCA' : 'CONFIRMAR E ENTRAR'}</span>
                    <ArrowRight size={15} className="shrink-0" />
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setStep(2)}
                disabled={isSubmitting}
                className="w-full py-1.5 text-xs font-cinzel font-semibold uppercase tracking-wider text-stone-400 hover:text-stone-200 transition-colors cursor-pointer"
              >
                Escolher outro herói
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
