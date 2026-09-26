import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Sword, 
  Crown, 
  Shield, 
  Users, 
  Copy, 
  Check, 
  Sparkles, 
  AlertCircle, 
  ArrowRight,
  Scroll,
  CheckCircle2,
  Heart,
  Plus,
  ChevronLeft
} from 'lucide-react';
import { GameService } from '../../services/gameService';
import { CharacterService } from '../../services/characterService';
import { Game } from '../../types/game';
import { useAuth } from '../../context/AuthContext';
import { extractCharacterSummary, getClassEmoji, CharacterSummary } from '../../utils/characterUtils';
import { RealmorLoading } from '../../components/common/RealmorLoading';

export const GameInvitePage: React.FC = () => {
  const { inviteCode } = useParams<{ inviteCode: string }>();
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [gameInfo, setGameInfo] = useState<{ game: Game; campaignId: string; masterName: string } | null>(null);

  // Etapa 1 = Escolha do Herói ("ESCOLHA SEU HERÓI")
  // Etapa 2 = Confirmação do Resumo ("SEU HERÓI" - Nome, Raça, Classe, Nível, PV, PM)
  const [step, setStep] = useState<1 | 2>(1);

  const [userCharacters, setUserCharacters] = useState<CharacterSummary[]>([]);
  const [loadingCharacters, setLoadingCharacters] = useState(true);
  const [selectedCharacter, setSelectedCharacter] = useState<CharacterSummary | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const normalizedCode = (inviteCode || '').trim().toUpperCase();

  // 1. Busca dados da mesa pelo código de convite
  useEffect(() => {
    if (!normalizedCode) {
      setError('Código de convite não informado.');
      setLoading(false);
      return;
    }

    const fetchGame = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await GameService.getGameByInviteCode(normalizedCode);
        if (!result) {
          setError(`Mesa de jogo com o código "${normalizedCode}" não foi encontrada ou foi finalizada.`);
        } else {
          setGameInfo(result);
        }
      } catch (err: any) {
        console.error('Erro ao resolver convite:', err);
        setError('Ocorreu uma falha ao buscar os dados da mesa de jogo.');
      } finally {
        setLoading(false);
      }
    };

    fetchGame();
  }, [normalizedCode]);

  // 2. Carrega personagens do usuário autenticado
  useEffect(() => {
    if (!user?.uid) {
      setLoadingCharacters(false);
      return;
    }

    setLoadingCharacters(true);
    const unsubscribe = CharacterService.subscribeToUserCharacters(user.uid, (chars) => {
      const summaries = chars.map(c => extractCharacterSummary(c));
      setUserCharacters(summaries);
      setLoadingCharacters(false);
    });

    return () => unsubscribe();
  }, [user?.uid]);

  const handleCopyInvite = () => {
    const inviteLink = `${window.location.origin}/join/${normalizedCode}`;
    navigator.clipboard.writeText(inviteLink);
    setToastMessage('Convite copiado para a área de transferência!');
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const handleSelectHero = (hero: CharacterSummary) => {
    setSelectedCharacter(hero);
    setStep(2);
  };

  const handleConfirmAndEnter = async () => {
    if (!gameInfo || !selectedCharacter) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Se for o mestre acessando pelo próprio link de convite, vai direto ao lobby
      if (user?.uid && user.uid === gameInfo.game.masterId) {
        navigate(`/campaigns/${gameInfo.campaignId}/games/${gameInfo.game.id}`);
        return;
      }

      const displayName = selectedCharacter.name || profile?.name || user?.displayName || 'Aventureiro';

      await GameService.joinGame(gameInfo.campaignId, gameInfo.game.id, {
        displayName,
        userId: user?.uid || undefined,
        characterId: selectedCharacter.id,
        characterName: selectedCharacter.name,
        characterClass: selectedCharacter.className,
        characterLevel: selectedCharacter.level,
        characterRace: selectedCharacter.race,
        characterAvatar: selectedCharacter.avatarUrl
      });

      // Redireciona para o LOBBY da mesa
      navigate(`/campaigns/${gameInfo.campaignId}/games/${gameInfo.game.id}`);
    } catch (err: any) {
      console.error('Erro ao entrar no jogo:', err);
      setSubmitError(err.message || 'Não foi possível ingressar na mesa de jogo.');
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-4">
        <RealmorLoading message="Localizando Aventura..." subtitle="Conectando aos anais da mesa de jogo" size="lg" />
      </div>
    );
  }

  if (error || !gameInfo) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full p-6 rounded-2xl border border-red-900/40 bg-[#140e0c] text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-red-950/80 border border-red-800/60 flex items-center justify-center mx-auto text-red-400">
            <AlertCircle size={24} />
          </div>
          <h2 className="text-xl font-cinzel font-bold text-amber-100">Convite Inválido</h2>
          <p className="text-xs text-stone-300 font-serif leading-relaxed">
            {error || 'Não foi possível carregar a mesa de jogo solicitada.'}
          </p>
          <button
            onClick={() => navigate('/jogador')}
            className="w-full py-2.5 rounded-xl bg-amber-950/80 hover:bg-amber-900 border border-amber-700/50 text-amber-200 text-xs font-cinzel font-bold uppercase tracking-wider cursor-pointer"
          >
            Voltar ao Modo Jogador
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-300">
      <div 
        className="w-full max-w-lg rounded-2xl border border-amber-800/60 bg-gradient-to-b from-[#1b1510] via-[#14100c] to-[#0c0907] p-4 sm:p-6 shadow-[0_25px_65px_rgba(0,0,0,0.95)] relative space-y-4 max-h-[92vh] overflow-y-auto custom-scrollbar"
        style={{
          boxShadow: 'inset 0 1px 0 rgba(212,175,55,0.25), inset 0 0 40px rgba(0,0,0,0.8), 0 25px 60px rgba(0,0,0,0.95)'
        }}
      >
        {/* Cantoneiras metálicas decorativas */}
        <div className="absolute top-2.5 left-2.5 w-3.5 h-3.5 border-t-2 border-l-2 border-amber-500/50 pointer-events-none" />
        <div className="absolute top-2.5 right-2.5 w-3.5 h-3.5 border-t-2 border-r-2 border-amber-500/50 pointer-events-none" />
        <div className="absolute bottom-2.5 left-2.5 w-3.5 h-3.5 border-b-2 border-l-2 border-amber-500/50 pointer-events-none" />
        <div className="absolute bottom-2.5 right-2.5 w-3.5 h-3.5 border-b-2 border-r-2 border-amber-500/50 pointer-events-none" />

        {/* TOPO: Informações da Aventura */}
        <div className="text-center space-y-1.5 border-b border-amber-900/40 pb-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#18130e] border border-amber-800/40 text-amber-300 text-xs font-cinzel font-bold tracking-widest uppercase">
            <Sword size={13} className="text-amber-400" />
            <span>⚔️ ENTRAR NA AVENTURA</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-cinzel font-black text-amber-100 tracking-wide">
            {gameInfo.game.name}
          </h1>
          <div className="flex items-center justify-center gap-4 text-xs text-stone-400 font-serif pt-0.5">
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

        {/* ======================================================================= */}
        {/* ETAPA 1: ESCOLHA DO HERÓI                                               */}
        {/* ======================================================================= */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-cinzel font-bold uppercase tracking-wider text-amber-300">
                "ESCOLHA SEU HERÓI"
              </span>
              <button
                type="button"
                onClick={() => navigate('/characters/sheet')}
                className="inline-flex items-center gap-1 text-[11px] font-cinzel font-bold uppercase tracking-wider text-amber-400 hover:text-amber-300 hover:underline cursor-pointer"
              >
                <Plus size={13} />
                <span>+ CRIAR NOVO PERSONAGEM</span>
              </button>
            </div>

            {/* Lista dos heróis do usuário autenticado */}
            <div className="overflow-y-auto space-y-2.5 max-h-[46vh] pr-1 custom-scrollbar">
              {loadingCharacters ? (
                <div className="py-10 text-center space-y-2">
                  <div className="w-8 h-8 rounded-full border-2 border-amber-500 border-t-transparent animate-spin mx-auto" />
                  <p className="text-xs font-cinzel text-amber-200/70">Carregando seus heróis...</p>
                </div>
              ) : userCharacters.length === 0 ? (
                <div className="p-6 rounded-xl bg-[#090705] border border-dashed border-amber-900/40 text-center space-y-3">
                  <p className="text-xs font-serif text-stone-300 leading-relaxed">
                    Você ainda não possui heróis criados na sua conta. Crie o seu personagem para poder ingressar na aventura!
                  </p>
                  <button
                    type="button"
                    onClick={() => navigate('/characters/sheet')}
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

            <div className="pt-2 border-t border-amber-900/30 flex items-center justify-between text-xs">
              <button
                type="button"
                onClick={handleCopyInvite}
                className="inline-flex items-center gap-1.5 text-stone-400 hover:text-amber-300 font-cinzel uppercase tracking-wider cursor-pointer"
              >
                <Copy size={13} />
                <span>Copiar Link</span>
              </button>

              <button
                type="button"
                onClick={() => navigate('/characters/sheet')}
                className="inline-flex items-center gap-1 text-amber-400 hover:text-amber-300 font-cinzel font-bold uppercase tracking-wider cursor-pointer"
              >
                <Plus size={13} />
                <span>Criar Novo Herói</span>
              </button>
            </div>
          </div>
        )}

        {/* ======================================================================= */}
        {/* ETAPA 2: RESUMO E CONFIRMAÇÃO DO HERÓI                                   */}
        {/* ======================================================================= */}
        {step === 2 && selectedCharacter && (
          <div className="flex flex-col space-y-3.5 pt-0.5">
            <div className="text-center space-y-0.5 border-b border-amber-900/40 pb-2.5 shrink-0">
              <div className="inline-flex items-center gap-1.5 text-[11px] font-cinzel font-bold uppercase tracking-widest text-amber-400">
                <CheckCircle2 size={12} className="text-amber-400" />
                <span>CONFIRMAÇÃO DO HERÓI</span>
              </div>
              <h2 className="text-lg sm:text-xl font-cinzel font-bold text-amber-100 tracking-wide">
                SEU HERÓI
              </h2>
            </div>

            {/* Resumo Exigido: Nome, Raça, Classe, Nível, PV, PM */}
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
                    Pronto para se juntar à mesa
                  </p>
                </div>
              </div>

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

            {/* Ações */}
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
                    <span>CONFIRMAR E ENTRAR</span>
                    <ArrowRight size={15} className="shrink-0" />
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setStep(1)}
                disabled={isSubmitting}
                className="w-full py-1.5 text-xs font-cinzel font-semibold uppercase tracking-wider text-stone-400 hover:text-stone-200 transition-colors cursor-pointer"
              >
                Escolher outro herói
              </button>
            </div>
          </div>
        )}

        {/* Notificação Toast */}
        {toastMessage && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-amber-950 border border-amber-600 text-amber-200 text-xs py-2 px-4 rounded-xl shadow-xl flex items-center gap-2 z-50">
            <Check size={14} className="text-amber-400" />
            <span>{toastMessage}</span>
          </div>
        )}
      </div>
    </div>
  );
};
