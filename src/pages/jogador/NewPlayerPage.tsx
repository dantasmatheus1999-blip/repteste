import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sword, 
  Sparkles, 
  User, 
  Plus, 
  Crown, 
  Shield, 
  ChevronRight, 
  ArrowRight, 
  Users, 
  AlertCircle,
  Scroll,
  Radio
} from 'lucide-react';
import { Button } from '../../components/Button';
import { useAuth } from '../../context/AuthContext';
import { GameService } from '../../services/gameService';
import { CharacterService } from '../../services/characterService';
import { Game, GamePlayer } from '../../types/game';
import { JoinGameFlowModal } from '../../components/games/JoinGameFlowModal';
import { extractCharacterSummary, getClassEmoji, CharacterSummary } from '../../utils/characterUtils';
import { RealmorLoading } from '../../components/common/RealmorLoading';

export const NewPlayerPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [playerGames, setPlayerGames] = useState<Array<{ game: Game; player: GamePlayer }>>([]);
  const [loadingGames, setLoadingGames] = useState(true);

  const [userCharacters, setUserCharacters] = useState<CharacterSummary[]>([]);
  const [loadingCharacters, setLoadingCharacters] = useState(true);

  // Modal para Entrar em um Jogo (fluxo guiado)
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [selectedGameForModal, setSelectedGameForModal] = useState<{ game: Game; campaignId: string; masterName: string } | undefined>(undefined);

  // Listener em tempo real dos jogos onde o usuário é participante
  useEffect(() => {
    if (!user?.uid) {
      setLoadingGames(false);
      return;
    }

    setLoadingGames(true);
    const unsubGames = GameService.subscribeToPlayerGames(user.uid, (items) => {
      setPlayerGames(items);
      setLoadingGames(false);
    });

    return () => unsubGames();
  }, [user?.uid]);

  // Listener dos personagens do usuário
  useEffect(() => {
    if (!user?.uid) {
      setLoadingCharacters(false);
      return;
    }

    setLoadingCharacters(true);
    const unsubChars = CharacterService.subscribeToUserCharacters(user.uid, (chars) => {
      const summaries = chars.map(c => extractCharacterSummary(c));
      setUserCharacters(summaries);
      setLoadingCharacters(false);
    });

    return () => unsubChars();
  }, [user?.uid]);

  const handleOpenJoinModal = () => {
    setSelectedGameForModal(undefined);
    setIsJoinModalOpen(true);
  };

  const handleChooseHeroForGame = (game: Game) => {
    setSelectedGameForModal({
      game,
      campaignId: game.campaignId,
      masterName: game.masterName || 'Mestre'
    });
    setIsJoinModalOpen(true);
  };

  const handleBackToSelection = () => {
    localStorage.removeItem('mythos_active_profile');
    window.location.href = '/select-profile';
  };

  return (
    <div className="min-h-screen pb-20 pt-3 px-3 sm:px-6 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Topo / Barra de Navegação */}
      <div className="flex items-center justify-between border-b border-amber-900/30 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-700/30 to-amber-950 border border-amber-500/50 flex items-center justify-center text-amber-300 shadow-md">
            <Sword size={22} className="text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-widest text-amber-400/90 font-cinzel font-bold">
                REALMOR
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400/60" />
              <span className="text-[10px] text-stone-400 font-cinzel">Tormenta 20</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-cinzel font-black text-amber-100 tracking-wide uppercase">
              MESAS DE RPG
            </h1>
          </div>
        </div>

        {/* Botão: Entrar com Código */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleOpenJoinModal}
            className="py-2.5 px-4 sm:px-5 rounded-xl bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700 hover:from-amber-600 hover:to-amber-500 text-stone-950 font-cinzel font-bold tracking-wider uppercase text-xs sm:text-sm shadow-[0_0_20px_rgba(217,119,6,0.3)] transition-all flex items-center gap-2 active:scale-95 border border-amber-400/60 cursor-pointer"
          >
            <Plus size={16} className="text-stone-950 stroke-[3]" />
            <span>Código da Mesa</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SEÇÃO 1: MINHAS MESAS / JOGOS ATIVOS                                       */}
      {/* ========================================================================= */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-cinzel font-bold text-amber-200 uppercase tracking-wider">
            <Scroll size={16} className="text-amber-400" />
            <span>MINHAS AVENTURAS ({playerGames.length})</span>
          </div>

          <span className="text-xs text-stone-400 font-serif italic">
            Mesas em que você está participando como jogador
          </span>
        </div>

        {loadingGames ? (
          <div className="p-10 rounded-2xl border border-amber-900/30 bg-[#120e0b]/80 flex justify-center">
            <RealmorLoading message="Buscando suas aventuras..." size="sm" />
          </div>
        ) : playerGames.length === 0 ? (
          <div 
            className="p-8 sm:p-10 rounded-2xl border border-dashed border-amber-900/50 bg-[#120e0b]/60 text-center space-y-4"
          >
            <div className="w-14 h-14 rounded-full bg-amber-950/40 border border-amber-800/40 flex items-center justify-center mx-auto text-amber-400/70">
              <Sword size={26} />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-cinzel font-bold text-stone-200">
                Você ainda não está em nenhuma mesa de jogo
              </h3>
              <p className="text-xs text-stone-400 font-serif max-w-md mx-auto">
                Peça o código da partida ao seu Mestre e entre na jornada com o seu herói de Tormenta 20!
              </p>
            </div>
            <button
              onClick={handleOpenJoinModal}
              className="py-3 px-6 rounded-xl bg-amber-950/80 hover:bg-amber-900 border border-amber-600/50 text-amber-200 font-cinzel font-bold text-xs uppercase tracking-wider inline-flex items-center gap-2 shadow-lg transition-all active:scale-95 cursor-pointer"
            >
              <Plus size={15} />
              <span>[ + ENTRAR EM UM JOGO ]</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {playerGames.map(({ game, player }) => {
              const defaultCover = "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80";
              const hasHero = Boolean(player.characterId);
              const heroEmoji = getClassEmoji(player.characterClass || '');

              return (
                <div
                  key={player.id}
                  className="rounded-xl border border-amber-800/40 bg-gradient-to-b from-[#18130e] via-[#120e0b] to-[#0d0a08] overflow-hidden shadow-lg hover:border-amber-600/60 transition-all flex flex-col justify-between"
                >
                  {/* Topo do Card com Capa Reduzida */}
                  <div className="relative h-28 w-full bg-[#0a0806] overflow-hidden">
                    <img
                      src={game.coverUrl || defaultCover}
                      alt={game.name}
                      className="w-full h-full object-cover object-center filter brightness-75"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#120e0b] via-[#120e0b]/60 to-transparent" />
                    
                    <div className="absolute top-2.5 left-3 z-10 flex items-center gap-1.5">
                      <span className="px-2.5 py-0.5 rounded-full bg-[#0a0806]/90 border border-amber-700/40 text-amber-300 text-[10px] font-cinzel font-bold uppercase">
                        {game.system || 'Tormenta 20'}
                      </span>
                    </div>

                    <div className="absolute top-2.5 right-3 z-10">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-cinzel font-bold uppercase bg-amber-950/80 border border-amber-700/50 text-amber-300">
                        {game.status === 'lobby' ? 'SALA DE ESPERA' : game.status === 'active' ? '● EM ANDAMENTO' : game.status}
                      </span>
                    </div>

                    <div className="absolute bottom-2 left-3 right-3 z-10">
                      <h3 className="text-base font-cinzel font-bold text-amber-100 truncate">
                        ⚔️ {game.name}
                      </h3>
                      <p className="text-[11px] text-stone-400 font-serif">
                        Mestre: <strong className="text-stone-200">{game.masterName || 'Mestre'}</strong>
                      </p>
                    </div>
                  </div>

                  {/* Corpo do Card: Informação do Personagem Vinculado */}
                  <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                    <div className="p-3 rounded-lg bg-[#090705] border border-amber-950/70">
                      <span className="text-[10px] font-cinzel uppercase text-amber-400/80 font-bold block mb-1">
                        Herói Vinculado:
                      </span>
                      {hasHero ? (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{heroEmoji}</span>
                            <div>
                              <span className="font-cinzel font-bold text-sm text-stone-100 block leading-tight">
                                {player.characterName || 'Herói'}
                              </span>
                              <span className="text-xs text-amber-300/80 font-serif">
                                {player.characterClass || 'Aventureiro'}
                                {player.characterLevel ? ` • Nível ${player.characterLevel}` : ''}
                                {player.characterRace ? ` (${player.characterRace})` : ''}
                              </span>
                            </div>
                          </div>

                          {game.status === 'lobby' && (
                            <button
                              onClick={() => handleChooseHeroForGame(game)}
                              className="text-[10px] font-cinzel uppercase font-bold text-amber-400 hover:text-amber-300 hover:underline py-1 px-2 rounded hover:bg-amber-950/40 cursor-pointer"
                            >
                              Trocar
                            </button>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center justify-between py-0.5">
                          <span className="text-xs text-amber-400/70 font-serif italic">
                            Nenhum herói vinculado ainda
                          </span>
                          <button
                            onClick={() => handleChooseHeroForGame(game)}
                            className="py-1 px-2.5 rounded bg-amber-950 hover:bg-amber-900 border border-amber-700 text-amber-200 text-[10px] font-cinzel font-bold uppercase tracking-wider cursor-pointer"
                          >
                            [ ESCOLHER HERÓI ]
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Botão Entrar na Mesa */}
                    <button
                      onClick={() => navigate(`/campaigns/${game.campaignId}/games/${game.id}`)}
                      className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-700 to-amber-800 hover:from-amber-600 hover:to-amber-700 text-stone-950 font-cinzel font-bold text-xs uppercase tracking-wider shadow transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                    >
                      <Sword size={14} className="text-stone-950" />
                      <span>ENTRAR NA MESA</span>
                      <ArrowRight size={13} className="text-stone-950" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* SEÇÃO 2: MEUS HERÓIS DE TORMENTA 20                                       */}
      {/* ========================================================================= */}
      <div className="space-y-4 pt-4 border-t border-amber-900/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-cinzel font-bold text-amber-200 uppercase tracking-wider">
            <Shield size={16} className="text-amber-400" />
            <span>MEUS HERÓIS ({userCharacters.length})</span>
          </div>

          <button
            onClick={() => navigate('/characters/sheet')}
            className="inline-flex items-center gap-1.5 text-xs font-cinzel font-bold uppercase tracking-wider text-amber-400 hover:text-amber-300 hover:underline cursor-pointer"
          >
            <Plus size={14} />
            <span>+ CRIAR NOVO PERSONAGEM</span>
          </button>
        </div>

        {loadingCharacters ? (
          <div className="p-8 text-center text-xs font-cinzel text-stone-400">
            Carregando seus heróis...
          </div>
        ) : userCharacters.length === 0 ? (
          <div className="p-6 rounded-xl bg-[#100d0a] border border-amber-900/40 text-center space-y-2">
            <p className="text-xs text-stone-300 font-serif">
              Você ainda não criou nenhum personagem em Arton.
            </p>
            <button
              onClick={() => navigate('/characters/sheet')}
              className="py-2 px-4 rounded-lg bg-amber-950/70 hover:bg-amber-900 border border-amber-700/50 text-amber-300 text-xs font-cinzel font-bold uppercase tracking-wider inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Plus size={13} />
              <span>[ + CRIAR NOVO PERSONAGEM ]</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {userCharacters.map((char) => {
              const emoji = getClassEmoji(char.className);
              return (
                <div
                  key={char.id}
                  onClick={() => navigate(`/characters/${char.id}`)}
                  className="p-3.5 rounded-xl bg-[#100d0a] border border-amber-950 hover:border-amber-700/50 transition-all flex items-center justify-between cursor-pointer group shadow-sm hover:bg-[#14100c]"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{emoji}</span>
                    <div>
                      <h4 className="font-cinzel font-bold text-sm text-stone-200 group-hover:text-amber-200 transition-colors">
                        {char.name}
                      </h4>
                      <p className="text-xs text-amber-400/80 font-serif">
                        {char.className} • Nível {char.level}
                      </p>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-stone-500 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all" />
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Rodapé / Voltar para Seleção */}
      <div className="pt-6 border-t border-amber-900/20 text-center">
        <Button
          variant="secondary"
          onClick={handleBackToSelection}
          className="text-xs tracking-widest uppercase py-2 px-6 border-amber-900/40 hover:border-amber-600/50 bg-black/40 text-stone-400 hover:text-amber-200"
        >
          Voltar para seleção de perfil
        </Button>
      </div>

      {/* Modal do Fluxo Completo: Entrar no Jogo / Escolher Personagem */}
      <JoinGameFlowModal
        isOpen={isJoinModalOpen}
        onClose={() => {
          setIsJoinModalOpen(false);
          setSelectedGameForModal(undefined);
        }}
        preloadedGameInfo={selectedGameForModal}
      />
    </div>
  );
};
