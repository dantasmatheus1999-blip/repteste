import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  LogIn, 
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Sword,
  ScrollText
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useProfile } from '../context/ProfileContext';
import { GameService } from '../services/gameService';
import { MasterService } from '../services/masterService';
import { Game, GamePlayer, GameStatus } from '../types/game';
import { Campaign } from '../types/master';
import { CreateGameModal } from '../components/games/CreateGameModal';
import { RealmorLoading } from '../components/common/RealmorLoading';

const DEFAULT_COVERS = [
  'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1514539079130-25950c84af65?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&auto=format&fit=crop&q=80'
];

export const ImmersiveRPGPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { isMaster } = useProfile();

  // Jogos do Mestre e Campanhas para criar novos jogos
  const [masterGames, setMasterGames] = useState<Game[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loadingMaster, setLoadingMaster] = useState(true);

  // Jogos do Jogador
  const [playerGames, setPlayerGames] = useState<Array<{ game: Game; player: GamePlayer }>>([]);
  const [loadingPlayer, setLoadingPlayer] = useState(true);

  // Modais e Estados
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>('');
  const [selectedCampaignSystem, setSelectedCampaignSystem] = useState<string>('Tormenta 20');

  // Modal [ + ENTRAR EM UM JOGO ]
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [inviteCodeInput, setInviteCodeInput] = useState('');
  const [joinError, setJoinError] = useState<string | null>(null);
  const [isJoining, setIsJoining] = useState(false);

  // Notificação Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // 1. MODO MESTRE: Escuta em tempo real dos Jogos do Mestre e das Campanhas do usuário
  useEffect(() => {
    if (!user?.uid || !isMaster) {
      setMasterGames([]);
      setCampaigns([]);
      setLoadingMaster(false);
      return;
    }

    const startTime = Date.now();
    let timeoutId: NodeJS.Timeout | null = null;

    setLoadingMaster(true);
    setMasterGames([]);
    const unsubGames = GameService.subscribeToMasterGames(user.uid, (games) => {
      setMasterGames(games);
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 2000 - elapsed);
      if (remaining > 0) {
        timeoutId = setTimeout(() => {
          setLoadingMaster(false);
        }, remaining);
      } else {
        setLoadingMaster(false);
      }
    });

    const unsubCampaigns = MasterService.subscribeToCampaigns(user.uid, (camps) => {
      setCampaigns(camps);
      if (camps.length > 0 && !selectedCampaignId) {
        setSelectedCampaignId(camps[0].id);
        setSelectedCampaignSystem(camps[0].identity?.system || 'Tormenta 20');
      }
    });

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      unsubGames();
      unsubCampaigns();
    };
  }, [user?.uid, isMaster]);

  // 2. MODO JOGADOR: Escuta em tempo real dos Jogos do Jogador
  useEffect(() => {
    if (!user?.uid || isMaster) {
      setPlayerGames([]);
      setLoadingPlayer(false);
      return;
    }

    const startTime = Date.now();
    let timeoutId: NodeJS.Timeout | null = null;

    setLoadingPlayer(true);
    setPlayerGames([]);
    const unsubPlayer = GameService.subscribeToPlayerGames(user.uid, (items) => {
      setPlayerGames(items);
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 2000 - elapsed);
      if (remaining > 0) {
        timeoutId = setTimeout(() => {
          setLoadingPlayer(false);
        }, remaining);
      } else {
        setLoadingPlayer(false);
      }
    });

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      unsubPlayer();
    };
  }, [user?.uid, isMaster]);

  // Abertura do modal de criação de jogo
  const handleOpenCreateGame = async () => {
    if (!user?.uid) return;

    if (campaigns.length === 0) {
      try {
        const newCampId = await MasterService.createCampaign(user.uid, {
          identity: {
            name: 'Primeira Crônica de Arton',
            subtitle: 'Grimório Central',
            system: 'Tormenta 20',
            setting: 'Arton',
            narrativeTone: 'heroico',
            shortDescription: 'Campanha inaugural forjada no Grimório Central.',
            fullDescription: 'Crônica inicial criada automaticamente para abrigar os jogos do mestre.'
          }
        });
        if (newCampId) {
          setSelectedCampaignId(newCampId);
          setSelectedCampaignSystem('Tormenta 20');
          setIsCreateModalOpen(true);
        }
      } catch (e) {
        console.error('Erro ao criar campanha base:', e);
        navigate('/master/campaigns/new');
      }
    } else {
      setSelectedCampaignId(campaigns[0].id);
      setSelectedCampaignSystem(campaigns[0].identity?.system || 'Tormenta 20');
      setIsCreateModalOpen(true);
    }
  };

  // Processa entrada por código de convite
  const handleJoinByCode = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = inviteCodeInput.trim().toUpperCase();
    if (!cleanCode) {
      setJoinError('Por favor, informe o código de convite.');
      return;
    }

    setIsJoining(true);
    setJoinError(null);

    try {
      const resolved = await GameService.getGameByInviteCode(cleanCode);
      if (!resolved) {
        setJoinError('Código de convite inválido ou mesa não encontrada.');
        setIsJoining(false);
        return;
      }

      const userName = profile?.name || user?.displayName || 'Aventureiro';
      await GameService.joinGame(resolved.campaignId, resolved.game.id, {
        displayName: userName,
        userId: user?.uid
      });

      setIsJoinModalOpen(false);
      setInviteCodeInput('');
      navigate(`/campaigns/${resolved.campaignId}/games/${resolved.game.id}`);
    } catch (err: any) {
      console.error('Erro ao entrar no jogo por código:', err);
      setJoinError(err?.message || 'Falha ao entrar na mesa.');
    } finally {
      setIsJoining(false);
    }
  };

  const getStatusBadge = (status: GameStatus) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-bold tracking-wider uppercase bg-emerald-950/90 border border-emerald-500/50 text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Em Andamento
          </span>
        );
      case 'lobby':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-bold tracking-wider uppercase bg-amber-950/90 border border-amber-500/50 text-amber-300">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            Lobby
          </span>
        );
      case 'paused':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-medium tracking-wider uppercase bg-stone-900 border border-stone-700/60 text-stone-300">
            <span className="w-1.5 h-1.5 rounded-full bg-stone-500" />
            Pausado
          </span>
        );
      case 'finished':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-medium tracking-wider uppercase bg-stone-950 border border-stone-800 text-stone-400">
            <CheckCircle2 size={10} className="text-stone-400" />
            Encerrado
          </span>
        );
    }
  };

  const isLoading = isMaster ? loadingMaster : loadingPlayer;
  const hasAnyGames = isMaster ? masterGames.length > 0 : playerGames.length > 0;
  const totalGamesCount = isMaster ? masterGames.length : playerGames.length;

  return (
    <div className="relative min-h-full w-full px-3 sm:px-4 py-2 pb-16 space-y-3 selection:bg-amber-500/30 selection:text-amber-200">
      
      {/* Toast de Notificação */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 animate-in fade-in slide-in-from-top-3 duration-200">
          <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-lg bg-[#0e1713] border border-emerald-500/40 text-emerald-200 shadow-2xl backdrop-blur-md">
            <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
            <span className="text-xs font-cinzel font-semibold tracking-wide">{toastMessage}</span>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* CABEÇALHO CENTRALIZADO: CAMPANHAS:                        */}
      {/* ========================================================= */}
      <div className="text-center pt-1 pb-1">
        <h2 className="text-sm sm:text-base font-cinzel font-bold tracking-wider text-amber-100 uppercase">
          CAMPANHAS:
        </h2>
      </div>

      {/* ========================================================= */}
      {/* ESTADO DE CARREGAMENTO                                    */}
      {/* ========================================================= */}
      {isLoading ? (
        <div className="py-8 text-center flex justify-center">
          <RealmorLoading message="Carregando campanhas..." size="md" />
        </div>
      ) : !hasAnyGames ? (
        /* ========================================================= */
        /* ESTADO VAZIO COMPACTO                                     */
        /* ========================================================= */
        <div className="rounded-xl border border-amber-800/30 bg-[#0e0c0a]/95 p-6 sm:p-8 text-center space-y-4 max-w-md mx-auto shadow-lg">
          <div className="w-12 h-12 rounded-xl bg-amber-950/60 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
            {isMaster ? <Sword size={22} /> : <ScrollText size={22} />}
          </div>

          <div className="space-y-1">
            <h3 className="text-base font-cinzel font-bold text-stone-100">
              {isMaster ? 'Nenhuma mesa criada ainda' : 'Nenhuma aventura no seu diário'}
            </h3>
            <p className="text-xs text-stone-400 font-serif leading-relaxed">
              {isMaster
                ? 'Forje sua primeira mesa de jogo e convide seus companheiros.'
                : 'Insira o código de convite do seu Mestre para entrar em uma mesa.'}
            </p>
          </div>

          <div className="pt-1">
            {isMaster ? (
              <button
                onClick={handleOpenCreateGame}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-stone-950 font-cinzel font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md active:scale-95"
              >
                <Plus size={14} strokeWidth={2.5} />
                <span>CRIAR PRIMEIRO JOGO</span>
              </button>
            ) : (
              <button
                onClick={() => setIsJoinModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-stone-950 font-cinzel font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md active:scale-95"
              >
                <LogIn size={14} strokeWidth={2.5} />
                <span>ENTRAR EM UM JOGO</span>
              </button>
            )}
          </div>
        </div>
      ) : (
        /* ========================================================= */
        /* LISTA COMPACTA DE CARDS DE CAMPANHA                       */
        /* ========================================================= */
        <div className="space-y-3">
          {isMaster
            ? masterGames.map((game, idx) => {
                const cover = game.coverUrl?.trim() || DEFAULT_COVERS[idx % DEFAULT_COVERS.length];

                return (
                  <div
                    key={game.id}
                    className="group relative rounded-xl border border-amber-900/50 hover:border-amber-500/60 bg-[#0c0907] transition-all duration-200 overflow-hidden shadow-lg flex items-stretch min-h-[135px]"
                  >
                    {/* Imagem de Capa do Livro / Aventura à Esquerda */}
                    <div className="relative w-24 xs:w-28 sm:w-32 shrink-0 bg-stone-950 overflow-hidden border-r border-amber-900/30">
                      <img
                        src={cover}
                        alt={game.name}
                        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 filter contrast-105"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                    </div>

                    {/* Conteúdo à Direita: Informações & Ação */}
                    <div className="flex-1 p-3 sm:p-3.5 flex flex-col justify-between min-w-0 space-y-1.5">
                      {/* Topo: Badges de Status e Sistema */}
                      <div className="flex flex-wrap items-center gap-1.5">
                        {getStatusBadge(game.status)}
                        <span className="text-[9px] font-cinzel font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-950/70 border border-amber-700/50 text-amber-400">
                          {game.system || 'TORMENTA 20'}
                        </span>
                      </div>

                      {/* Nome da Campanha / Jogo */}
                      <div className="space-y-0.5">
                        <h3 className="font-cinzel font-black text-sm sm:text-base text-stone-100 group-hover:text-amber-200 transition-colors truncate flex items-center gap-1.5 uppercase tracking-wider">
                          <span className="text-amber-400 text-xs shrink-0">⚔️</span>
                          <span className="truncate">{game.name}</span>
                        </h3>

                        {/* Detalhes: Mestre */}
                        <p className="text-[11px] font-serif text-stone-400 truncate">
                          Mestre: <strong className="text-stone-100 font-cinzel font-bold uppercase tracking-wide">{game.masterName || 'VOCÊ'}</strong>
                        </p>
                      </div>

                      {/* Botão de Ação "CONTINUAR >" Alinhado à Direita */}
                      <div className="flex items-center justify-end pt-0.5">
                        <button
                          onClick={() => navigate(`/campaigns/${game.campaignId}/games/${game.id}`)}
                          className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-stone-950 font-cinzel font-bold text-[11px] sm:text-xs uppercase tracking-wider transition-all duration-150 shadow-md active:scale-95 cursor-pointer whitespace-nowrap border border-amber-300/40"
                        >
                          <span>CONTINUAR</span>
                          <ChevronRight size={13} strokeWidth={3} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            : playerGames.map(({ game, player }, idx) => {
                const cover = game.coverUrl?.trim() || DEFAULT_COVERS[idx % DEFAULT_COVERS.length];

                return (
                  <div
                    key={player.id || game.id}
                    className="group relative rounded-xl border border-amber-900/50 hover:border-amber-500/60 bg-[#0c0907] transition-all duration-200 overflow-hidden shadow-lg flex items-stretch min-h-[135px]"
                  >
                    {/* Imagem de Capa do Livro / Aventura à Esquerda */}
                    <div className="relative w-24 xs:w-28 sm:w-32 shrink-0 bg-stone-950 overflow-hidden border-r border-amber-900/30">
                      <img
                        src={cover}
                        alt={game.name}
                        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 filter contrast-105"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                    </div>

                    {/* Conteúdo à Direita: Informações & Ação */}
                    <div className="flex-1 p-3 sm:p-3.5 flex flex-col justify-between min-w-0 space-y-1.5">
                      {/* Topo: Badges de Status e Sistema */}
                      <div className="flex flex-wrap items-center gap-1.5">
                        {getStatusBadge(game.status)}
                        <span className="text-[9px] font-cinzel font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-950/70 border border-amber-700/50 text-amber-400">
                          {game.system || 'TORMENTA 20'}
                        </span>
                      </div>

                      {/* Nome da Campanha / Jogo */}
                      <div className="space-y-0.5">
                        <h3 className="font-cinzel font-black text-sm sm:text-base text-stone-100 group-hover:text-amber-200 transition-colors truncate flex items-center gap-1.5 uppercase tracking-wider">
                          <span className="text-amber-400 text-xs shrink-0">⚔️</span>
                          <span className="truncate">{game.name}</span>
                        </h3>

                        {/* Detalhes: Mestre */}
                        <p className="text-[11px] font-serif text-stone-400 truncate">
                          Mestre: <strong className="text-stone-100 font-cinzel font-bold uppercase tracking-wide">{game.masterName || 'MESTRE DA MESA'}</strong>
                        </p>

                        {/* Personagem */}
                        <p className="text-[11px] font-cinzel font-bold text-amber-400 uppercase tracking-wider truncate">
                          PERSONAGEM: <strong className="text-amber-200">{player.displayName || 'Aventureiro'}</strong>
                        </p>
                      </div>

                      {/* Botão de Ação "CONTINUAR >" Alinhado à Direita */}
                      <div className="flex items-center justify-end pt-0.5">
                        <button
                          onClick={() => navigate(`/campaigns/${game.campaignId}/games/${game.id}`)}
                          className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-stone-950 font-cinzel font-bold text-[11px] sm:text-xs uppercase tracking-wider transition-all duration-150 shadow-md active:scale-95 cursor-pointer whitespace-nowrap border border-amber-300/40"
                        >
                          <span>CONTINUAR</span>
                          <ChevronRight size={13} strokeWidth={3} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL ENTRAR EM JOGO (CÓDIGO DE CONVITE)                  */}
      {/* ========================================================= */}
      {isJoinModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl border-2 border-amber-600/40 bg-[#0d0a08] p-6 sm:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.9)] space-y-5 relative">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-xl bg-amber-950/60 border border-amber-500/40 flex items-center justify-center mx-auto text-amber-400">
                <LogIn size={22} />
              </div>
              <h3 className="text-xl font-cinzel font-bold text-amber-100 tracking-wide uppercase">
                ⚔️ Entrar em um Jogo
              </h3>
              <p className="text-xs text-stone-400 font-serif">
                Insira o código rúnico de convite fornecido pelo seu Mestre
              </p>
            </div>

            <form onSubmit={handleJoinByCode} className="space-y-4">
              {joinError && (
                <div className="p-3 rounded-xl bg-red-950/70 border border-red-800/60 text-red-300 text-xs font-serif flex items-center gap-2">
                  <AlertCircle size={15} className="shrink-0 text-red-400" />
                  <span>{joinError}</span>
                </div>
              )}

              <div className="text-center">
                <input
                  type="text"
                  maxLength={10}
                  placeholder="K7F-92A"
                  value={inviteCodeInput}
                  onChange={(e) => setInviteCodeInput(e.target.value.toUpperCase())}
                  className="w-full text-center text-2xl font-mono font-bold tracking-[0.25em] uppercase py-3 px-4 rounded-xl bg-[#060504] border-2 border-amber-600/50 text-amber-300 focus:outline-none focus:border-amber-400 placeholder:text-stone-700 shadow-inner"
                  autoFocus
                />
              </div>

              <div className="space-y-2 pt-1">
                <button
                  type="submit"
                  disabled={isJoining || !inviteCodeInput.trim()}
                  className="w-full py-3 px-4 rounded-xl bg-amber-600 hover:bg-amber-500 active:bg-amber-700 text-stone-950 font-cinzel font-bold text-xs uppercase tracking-[0.15em] shadow-md border border-amber-300/50 transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                >
                  {isJoining ? 'Localizando mesa...' : 'ENTRAR NA AVENTURA'}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsJoinModalOpen(false);
                    setJoinError(null);
                    setInviteCodeInput('');
                  }}
                  className="w-full py-2 px-4 rounded-xl text-stone-400 hover:text-stone-200 text-xs font-cinzel uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Criação de Jogo do Mestre */}
      {selectedCampaignId && user?.uid && (
        <CreateGameModal
          campaignId={selectedCampaignId}
          masterId={user.uid}
          campaignSystem={selectedCampaignSystem}
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onGameCreated={(gameId) => {
            showToast('Mesa de jogo forjada com sucesso!');
            navigate(`/campaigns/${selectedCampaignId}/games/${gameId}`);
          }}
        />
      )}
    </div>
  );
};

export default ImmersiveRPGPage;
