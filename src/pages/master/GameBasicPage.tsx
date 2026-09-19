import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Sword, 
  Shield, 
  Users, 
  Copy, 
  ChevronLeft, 
  Settings, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  Share2, 
  Crown, 
  UserMinus, 
  Radio,
  Scroll,
  Info,
  Maximize2,
  ExternalLink,
  BookOpen,
  Compass
} from 'lucide-react';
import { Button } from '../../components/Button';
import { GameService } from '../../services/gameService';
import { Game, GamePlayer, GameStatus } from '../../types/game';
import { EditGameModal } from '../../components/games/EditGameModal';
import { JoinGameFlowModal } from '../../components/games/JoinGameFlowModal';
import { getClassEmoji } from '../../utils/characterUtils';
import { useAuth } from '../../context/AuthContext';
import { MapEditor } from '../../components/map/MapEditor';
import { MobilePlayerSessionPage } from '../jogador/MobilePlayerSessionPage';

type TabType = 'overview' | 'players' | 'settings';

export const GameBasicPage: React.FC = () => {
  const { campaignId, gameId } = useParams<{ campaignId: string; gameId: string }>();
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  const [game, setGame] = useState<Game | null>(null);
  const [players, setPlayers] = useState<GamePlayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Aba selecionada: [ VISÃO GERAL ] [ JOGADORES ] [ CONFIG ]
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isChangeHeroModalOpen, setIsChangeHeroModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  // Modal de "Mesa do Mestre em preparação"
  const [isPreparationModalOpen, setIsPreparationModalOpen] = useState(false);
  const [isStartingGame, setIsStartingGame] = useState(false);
  const [isTogglingReady, setIsTogglingReady] = useState(false);

  // Armazena referência ao player atual (seja mestre ou aventureiro)
  const currentPlayerIdRef = useRef<string | null>(null);

  // 1. Inscrição em tempo real no jogo e nos jogadores
  useEffect(() => {
    if (!campaignId || !gameId) {
      setError('Identificadores de campanha ou jogo inválidos.');
      setLoading(false);
      return;
    }

    setLoading(true);

    // Listener do jogo
    const unsubGame = GameService.subscribeToGame(campaignId, gameId, (loadedGame) => {
      if (!loadedGame) {
        setError('Mesa de jogo não encontrada nesta campanha.');
      } else {
        setGame(loadedGame);
        setError(null);
      }
      setLoading(false);
    });

    // Listener dos jogadores (tempo real)
    const unsubPlayers = GameService.subscribeToGamePlayers(campaignId, gameId, (loadedPlayers) => {
      setPlayers(loadedPlayers);
    });

    return () => {
      unsubGame();
      unsubPlayers();
    };
  }, [campaignId, gameId]);

  // 2. Gerenciamento de Presença & Heartbeat
  useEffect(() => {
    if (!campaignId || !gameId || !game) return;

    const isMaster = Boolean(user?.uid && user.uid === game.masterId);

    if (isMaster && user?.uid) {
      currentPlayerIdRef.current = user.uid;
      // O Mestre comanda a mesa como proprietário (game.masterId) e não é inserido em players
    } else {
      const storedId = localStorage.getItem(`realmor_game_player_${gameId}`);
      if (storedId) {
        currentPlayerIdRef.current = storedId;
        GameService.updatePlayerStatus(campaignId, gameId, storedId, 'online');
      } else if (user?.uid) {
        const matched = players.find(p => p.userId === user.uid && p.role === 'player' && p.userId !== game.masterId);
        if (matched) {
          currentPlayerIdRef.current = matched.id;
          GameService.updatePlayerStatus(campaignId, gameId, matched.id, 'online');
        }
      }
    }

    const heartbeatInterval = setInterval(() => {
      if (typeof document !== 'undefined' && document.hidden) return;
      const idToPing = currentPlayerIdRef.current;
      if (idToPing) {
        GameService.updatePlayerStatus(campaignId, gameId, idToPing, 'online');
      }
    }, 120000);

    const handleLeave = () => {
      const idToOffline = currentPlayerIdRef.current;
      if (idToOffline) {
        GameService.updatePlayerStatus(campaignId, gameId, idToOffline, 'offline');
      }
    };

    window.addEventListener('beforeunload', handleLeave);

    return () => {
      clearInterval(heartbeatInterval);
      window.removeEventListener('beforeunload', handleLeave);
      handleLeave();
    };
  }, [campaignId, gameId, game?.id, game?.masterId, user?.uid]);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleCopyInvite = () => {
    if (!game) return;
    const inviteUrl = `${window.location.origin}/join/${game.inviteCode}`;
    navigator.clipboard.writeText(inviteUrl);
    setCopiedCode(true);
    showToast('Convite copiado para a área de transferência!');
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleCopyOnlyCode = () => {
    if (!game) return;
    navigator.clipboard.writeText(game.inviteCode);
    setCopiedCode(true);
    showToast(`Código ${game.inviteCode} copiado!`);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleRemovePlayer = async (playerId: string, playerName: string) => {
    if (!campaignId || !gameId) return;
    if (!window.confirm(`Deseja remover o aventureiro "${playerName}" desta mesa de jogo?`)) {
      return;
    }
    try {
      await GameService.removePlayer(campaignId, gameId, playerId);
      showToast(`Aventureiro "${playerName}" removido da mesa.`);
    } catch (err: any) {
      console.error('Erro ao remover jogador:', err);
      showToast('Falha ao remover jogador.');
    }
  };

  // Helper de presença
  const isPlayerOnline = (player: GamePlayer): boolean => {
    if (player.status === 'offline') return false;
    if (player.status === 'online') {
      if (player.lastSeenAt) {
        const lastSeenMs = typeof player.lastSeenAt.toMillis === 'function'
          ? player.lastSeenAt.toMillis()
          : typeof player.lastSeenAt === 'number'
            ? player.lastSeenAt
            : 0;
        if (lastSeenMs > 0 && Date.now() - lastSeenMs > 75000) {
          return false;
        }
      }
      return true;
    }
    return false;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[65vh] space-y-4">
        <div className="relative">
          <div className="w-14 h-14 rounded-full border-2 border-amber-900/40 border-t-amber-500 animate-spin" />
          <Sword className="w-6 h-6 text-amber-500/80 absolute inset-0 m-auto" />
        </div>
        <p className="text-xs font-cinzel text-amber-200/70 tracking-widest uppercase">
          Carregando mesa nos anais de Arton...
        </p>
      </div>
    );
  }

  if (error || !game) {
    return (
      <div className="max-w-xl mx-auto my-12 p-8 rounded-2xl border border-red-900/50 bg-[#14100c] text-center space-y-4 shadow-2xl">
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto" />
        <h2 className="text-xl font-cinzel font-bold text-stone-100">Mesa Inacessível</h2>
        <p className="text-sm text-stone-400 font-serif">{error || 'A mesa solicitada não foi encontrada.'}</p>
        <Button 
          variant="secondary" 
          onClick={() => navigate(campaignId ? `/master/campaigns/${campaignId}` : '/master/campaigns')}
          icon={ChevronLeft}
        >
          Voltar para a Campanha
        </Button>
      </div>
    );
  }

  const isMaster = Boolean(user?.uid && user.uid === game.masterId);
  const defaultCover = "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1600&auto=format&fit=crop&q=80";

  const masterPlayer = players.find(p => p.role === 'master');
  const masterDisplayName = masterPlayer?.displayName || game.masterName || 'Mestre';
  const isMasterOnline = masterPlayer ? isPlayerOnline(masterPlayer) : true;

  const adventurers = players.filter(p => p.role === 'player' && p.userId !== game.masterId);
  const currentAdventurersCount = adventurers.length;
  const maxPlayersCount = game.maxPlayers || 5;

  // Jogador atual logado
  const currentPlayer = adventurers.find(p => p.userId === user?.uid);
  const canChangeHero = Boolean(currentPlayer && game.status === 'lobby' && !currentPlayer.ready);
  const readyCount = adventurers.filter(p => p.ready).length;

  const handleToggleReady = async (newReady: boolean) => {
    if (!campaignId || !gameId || !currentPlayer) return;
    if (newReady && !currentPlayer.characterId) {
      showToast('Escolha seu herói antes de confirmar prontidão!');
      setIsChangeHeroModalOpen(true);
      return;
    }
    setIsTogglingReady(true);
    try {
      await GameService.updatePlayerReady(campaignId, gameId, currentPlayer.id, newReady);
      if (newReady) {
        showToast('✓ Pronto para entrar! Aguardando o Mestre.');
      } else {
        showToast('Prontidão cancelada.');
      }
    } catch (err: any) {
      console.error('Erro ao atualizar prontidão:', err);
      showToast('Falha ao atualizar estado de prontidão.');
    } finally {
      setIsTogglingReady(false);
    }
  };

  const handleStartAdventure = async () => {
    if (!campaignId || !gameId || !user?.uid) return;
    if (!isMaster) return;

    setIsStartingGame(true);
    try {
      await GameService.startGame(campaignId, gameId, user.uid);
      showToast('⚔️ Aventura iniciada! A mesa agora está ativa.');
    } catch (err: any) {
      console.error('Erro ao iniciar aventura:', err);
      showToast(err?.message || 'Falha ao iniciar a aventura.');
    } finally {
      setIsStartingGame(false);
    }
  };

  // Determina se a mesa como um todo está online (se o mestre ou qualquer jogador está conectado)
  const anyOnline = isMasterOnline || adventurers.some(isPlayerOnline);

  // Emojis de classe/herói temáticos para lista de jogadores
  const heroIcons = ['🧙', '🧝', '🛡️', '🏹', '⚔️', '🗡️', '🔮', '📜', '🐺', '🐉'];

  // =========================================================================
  // MESA DO JOGADOR: QUANDO A AVENTURA ESTÁ INICIADA (STATUS = ACTIVE / PAUSED)
  // O JOGADOR ABRE A INTERFACE MOBILE EXCLUSIVA COM SUA FICHA SINCRONIZADA
  // =========================================================================
  if (!isMaster && (game.status === 'active' || game.status === 'paused') && currentPlayer?.characterId) {
    return (
      <div className="fixed inset-0 w-screen h-screen z-40 overflow-y-auto bg-[#0a0806]">
        <MobilePlayerSessionPage
          campaignId={campaignId || game.campaignId || ''}
          gameId={gameId || game.id}
          game={game}
          currentPlayer={currentPlayer}
          onExit={() => navigate('/jogador')}
        />
      </div>
    );
  }

  // =========================================================================
  // MESA DO MESTRE: QUANDO O MESTRE INICIA A AVENTURA (STATUS = ACTIVE / PAUSED)
  // A TELA DE MAPAS PASSA A SER A TELA PRINCIPAL (COCKPIT DA AVENTURA)
  // =========================================================================
  if (isMaster && (game.status === 'active' || game.status === 'paused')) {
    return (
      <div className="fixed inset-0 w-screen h-screen z-40 overflow-hidden flex flex-col bg-stone-950 select-none">
        <MapEditor
          campaignId={campaignId}
          gameId={gameId}
          game={game}
          isMaster={true}
          onExitAdventure={() => navigate(`/master/campaigns/${campaignId}`)}
          onOpenLobbyModal={() => setIsPreparationModalOpen(true)}
        />

        {/* Modal Flutuante com Detalhes do Lobby & Informações da Sessão */}
        {isPreparationModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200 font-cinzel">
            <div 
              className="w-full max-w-xl rounded-2xl border border-amber-700/60 bg-gradient-to-b from-[#1c1611] via-[#14100c] to-[#0c0907] p-5 sm:p-6 shadow-[0_25px_60px_rgba(0,0,0,0.95)] space-y-4 max-h-[85vh] flex flex-col relative"
              style={{
                boxShadow: 'inset 0 1px 0 rgba(212,175,55,0.2), 0 25px 60px rgba(0,0,0,0.95)'
              }}
            >
              {/* Cantoneiras decorativas */}
              <div className="absolute top-2.5 left-2.5 w-3 h-3 border-t-2 border-l-2 border-amber-500/50 pointer-events-none" />
              <div className="absolute top-2.5 right-2.5 w-3 h-3 border-t-2 border-r-2 border-amber-500/50 pointer-events-none" />
              <div className="absolute bottom-2.5 left-2.5 w-3 h-3 border-b-2 border-l-2 border-amber-500/50 pointer-events-none" />
              <div className="absolute bottom-2.5 right-2.5 w-3 h-3 border-b-2 border-r-2 border-amber-500/50 pointer-events-none" />

              <div className="flex items-center justify-between pb-3 border-b border-amber-900/40">
                <div className="flex items-center gap-2 text-amber-300">
                  <Scroll size={18} />
                  <h3 className="font-bold text-sm uppercase tracking-wider">
                    Informações da Sala & Código de Convite
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsPreparationModalOpen(false)}
                  className="w-8 h-8 rounded-lg bg-stone-900 hover:bg-stone-850 text-stone-400 hover:text-stone-200 flex items-center justify-center cursor-pointer border border-stone-800"
                >
                  ✕
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                {/* Código de Convite */}
                <div className="p-3.5 rounded-xl bg-stone-900/70 border border-amber-900/40 flex items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest block">
                      Código de Acesso dos Jogadores
                    </span>
                    <span className="font-mono text-base font-black text-amber-200 tracking-wider">
                      {game.inviteCode || game.id}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleCopyOnlyCode}
                      className="px-3 py-1.5 rounded-lg bg-amber-950/80 hover:bg-amber-900 border border-amber-600/50 text-amber-200 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow"
                    >
                      <Copy size={13} />
                      <span>{copiedCode ? 'COPIADO!' : 'COPIAR CÓDIGO'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleCopyInvite}
                      className="px-3 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-850 border border-amber-900/50 text-stone-300 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
                      title="Copiar link direto de convite"
                    >
                      <Share2 size={13} />
                      <span>LINK</span>
                    </button>
                  </div>
                </div>

                {/* Resumo da Aventura */}
                <div className="p-3.5 rounded-xl bg-stone-900/40 border border-stone-800 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-300 uppercase">{game.name}</span>
                    <span className="text-[10px] text-stone-400 font-mono">{game.system}</span>
                  </div>
                  {game.description && (
                    <p className="text-xs text-stone-300 font-serif leading-relaxed line-clamp-3">
                      {game.description}
                    </p>
                  )}
                </div>

                {/* Lista Rápida dos Jogadores na Sala */}
                <div>
                  <h4 className="text-xs font-bold text-stone-300 uppercase tracking-wider mb-2">
                    Aventureiros na Sala ({adventurers.length})
                  </h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {adventurers.length === 0 ? (
                      <p className="text-xs text-stone-500 font-serif italic py-3 text-center">
                        Nenhum jogador conectado nesta sala ainda.
                      </p>
                    ) : (
                      adventurers.map((p, idx) => (
                        <div key={p.id} className="p-2.5 rounded-lg bg-stone-900/60 border border-amber-950/80 flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <span className="text-base">{heroIcons[idx % heroIcons.length]}</span>
                            <div>
                              <p className="font-bold text-xs text-amber-200">{p.displayName}</p>
                              <p className="text-[10px] text-stone-400 font-serif">
                                {p.characterName || 'Sem herói vinculado'} {p.characterClass ? `• ${p.characterClass}` : ''} {p.characterLevel ? `(Nv. ${p.characterLevel})` : ''}
                              </p>
                            </div>
                          </div>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                            isPlayerOnline(p) 
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40' 
                              : 'bg-stone-900 text-stone-500 border border-stone-800'
                          }`}>
                            {isPlayerOnline(p) ? '● ONLINE' : '● OFFLINE'}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-amber-900/30 flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsPreparationModalOpen(false)}
                  className="px-5 py-2 rounded-xl bg-amber-950/80 hover:bg-amber-900 border border-amber-600/50 text-amber-200 text-xs font-bold uppercase tracking-wider cursor-pointer shadow"
                >
                  [ RETORNAR AO COCKPIT ]
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-16 pt-2 px-3 sm:px-6 max-w-5xl mx-auto space-y-5 animate-in fade-in duration-300">
      
      {/* Toast Flutuante */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 animate-in fade-in slide-in-from-top-3 duration-300">
          <div className="flex items-center gap-3 px-5 py-3 rounded-xl bg-emerald-950/95 border border-emerald-500/60 text-emerald-200 shadow-[0_10px_35px_rgba(0,0,0,0.85)]">
            <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
            <span className="text-xs font-cinzel font-semibold tracking-wide">{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Barra de Navegação Superior Minimalista */}
      <div className="flex items-center justify-between pt-1">
        <button
          onClick={() => navigate(isMaster ? `/master/campaigns/${campaignId}` : '/jogador')}
          className="group inline-flex items-center gap-2 text-stone-400 hover:text-amber-300 transition-colors text-xs font-cinzel font-bold uppercase tracking-wider py-1.5 px-2 rounded-lg hover:bg-amber-950/20"
        >
          <ChevronLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
          <span>{isMaster ? 'Campanha' : 'Painel do Jogador'}</span>
        </button>

        {/* Indicador de Status Realtime do Servidor */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#110d0a] border border-amber-900/30 text-[11px] font-cinzel text-stone-400">
          <Radio size={12} className="text-emerald-400 animate-pulse" />
          <span className="hidden sm:inline">Conectado ao Salão</span>
          <span className="sm:hidden">Ao Vivo</span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* CARD PRINCIPAL DA MESA (INSPIRADO EM FOUNDRY VTT / ROLL20 / ALCHEMY RPG)   */}
      {/* ========================================================================= */}
      <div 
        className="rounded-2xl border border-amber-700/40 bg-gradient-to-b from-[#1c1611] via-[#14100c] to-[#0d0a08] shadow-[0_20px_55px_rgba(0,0,0,0.9)] overflow-hidden relative"
        style={{
          boxShadow: 'inset 0 1px 0 rgba(212,175,55,0.22), inset 0 0 30px rgba(0,0,0,0.7), 0 25px 60px rgba(0,0,0,0.95)'
        }}
      >
        {/* Cantoneiras metálicas ornamentais */}
        <div className="absolute top-2.5 left-2.5 w-3.5 h-3.5 border-t-2 border-l-2 border-amber-500/50 pointer-events-none z-10" />
        <div className="absolute top-2.5 right-2.5 w-3.5 h-3.5 border-t-2 border-r-2 border-amber-500/50 pointer-events-none z-10" />
        <div className="absolute bottom-2.5 left-2.5 w-3.5 h-3.5 border-b-2 border-l-2 border-amber-500/50 pointer-events-none z-10" />
        <div className="absolute bottom-2.5 right-2.5 w-3.5 h-3.5 border-b-2 border-r-2 border-amber-500/50 pointer-events-none z-10" />

        {/* ------------------------------------------------------------- */}
        {/* TOPO: ⚔️ NOME DO JOGO / SISTEMA / STATUS ONLINE               */}
        {/* ------------------------------------------------------------- */}
        <div className="px-5 sm:px-8 py-4 sm:py-5 border-b border-amber-900/40 bg-gradient-to-r from-[#17120e] via-[#1a140f] to-[#17120e] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-amber-600/30 to-amber-950 border border-amber-500/50 flex items-center justify-center text-amber-300 shadow-md shrink-0">
              <Sword size={20} className="text-amber-400" />
            </div>
            <div>
              <h1 className="text-lg sm:text-2xl font-cinzel font-bold text-amber-100 tracking-wide flex items-center gap-2">
                <span>⚔️ {game.name}</span>
              </h1>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs font-serif font-semibold text-amber-300/80 tracking-wide flex items-center gap-1.5">
                  <Shield size={12} className="text-amber-400" />
                  {game.system || 'Tormenta 20'}
                </span>
                <span className="text-stone-600">•</span>
                <span className="text-[11px] font-serif text-stone-400">
                  Mestre: <strong className="text-stone-200 font-cinzel font-semibold">{masterDisplayName}</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Badge de Presença Global: ● ONLINE */}
          <div className="flex items-center gap-2">
            {anyOnline ? (
              <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-cinzel font-bold bg-emerald-950/80 border border-emerald-500/60 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.25)] tracking-wider uppercase">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                ● ONLINE
              </span>
            ) : (
              <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-cinzel font-semibold bg-stone-900/90 border border-stone-700/60 text-stone-400 tracking-wider uppercase">
                <span className="w-2 h-2 rounded-full bg-stone-500" />
                ● OFFLINE
              </span>
            )}
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* NAVEGAÇÃO POR ABAS: [ VISÃO GERAL ] [ JOGADORES ] [ CONFIG ]  */}
        {/* ------------------------------------------------------------- */}
        <div className="px-5 sm:px-8 border-b border-amber-900/40 bg-[#110e0b]/90 flex items-center gap-2 sm:gap-4 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 px-3.5 sm:px-5 font-cinzel text-xs sm:text-sm font-bold uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
              activeTab === 'overview'
                ? 'border-amber-400 text-amber-200 bg-amber-950/20'
                : 'border-transparent text-stone-400 hover:text-stone-200 hover:border-amber-900/50'
            }`}
          >
            <Compass size={15} className={activeTab === 'overview' ? 'text-amber-400' : 'text-stone-500'} />
            [ VISÃO GERAL ]
          </button>

          <button
            onClick={() => setActiveTab('players')}
            className={`py-3 px-3.5 sm:px-5 font-cinzel text-xs sm:text-sm font-bold uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
              activeTab === 'players'
                ? 'border-amber-400 text-amber-200 bg-amber-950/20'
                : 'border-transparent text-stone-400 hover:text-stone-200 hover:border-amber-900/50'
            }`}
          >
            <Users size={15} className={activeTab === 'players' ? 'text-amber-400' : 'text-stone-500'} />
            [ JOGADORES ({currentAdventurersCount}/{maxPlayersCount}) ]
          </button>

          {isMaster && (
            <button
              onClick={() => setActiveTab('settings')}
              className={`py-3 px-3.5 sm:px-5 font-cinzel text-xs sm:text-sm font-bold uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
                activeTab === 'settings'
                  ? 'border-amber-400 text-amber-200 bg-amber-950/20'
                  : 'border-transparent text-stone-400 hover:text-stone-200 hover:border-amber-900/50'
              }`}
            >
              <Settings size={15} className={activeTab === 'settings' ? 'text-amber-400' : 'text-stone-500'} />
              [ CONFIG ]
            </button>
          )}
        </div>

        {/* ------------------------------------------------------------- */}
        {/* CONTEÚDO DINÂMICO CONFORME A ABA ATIVA                        */}
        {/* ------------------------------------------------------------- */}
        <div className="p-5 sm:p-8 space-y-7">
          {activeTab === 'overview' && (
            <>
              {/* CAPA DO JOGO + NOME DA AVENTURA */}
              <div className="space-y-4">
                <div 
                  className="relative h-60 sm:h-80 w-full rounded-xl overflow-hidden border border-amber-900/50 shadow-2xl bg-[#0a0705] group"
                >
                  <img
                    src={game.coverUrl || defaultCover}
                    alt={game.name}
                    className="w-full h-full object-cover object-center filter contrast-110 brightness-90 group-hover:scale-105 transition-transform duration-700"
                  />
                  {/* Vinhetas imersivas dark fantasy */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0c0907] via-[#0c0907]/60 to-transparent" />
                  <div className="absolute inset-0 bg-gradient-to-r from-[#0c0907]/80 via-transparent to-[#0c0907]/80" />

                  {/* Brasão central / Marca de Sistema & Status */}
                  <div className="absolute top-4 left-4 z-10 flex flex-wrap items-center gap-2">
                    <span className="px-3 py-1 rounded-lg bg-[#0d0a08]/90 border border-amber-700/50 text-amber-300 text-xs font-cinzel font-bold tracking-widest uppercase shadow-lg">
                      {game.system || 'Tormenta 20'}
                    </span>
                    {game.status === 'active' ? (
                      <span className="px-3 py-1 rounded-lg bg-emerald-950/90 border border-emerald-500/60 text-emerald-300 text-xs font-cinzel font-bold tracking-widest uppercase shadow-lg flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        AVENTURA ATIVA
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-lg bg-[#0d0a08]/90 border border-amber-800/50 text-amber-400/90 text-xs font-cinzel font-bold tracking-widest uppercase shadow-lg flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-amber-400" />
                        SALA DE ESPERA (LOBBY)
                      </span>
                    )}
                  </div>

                  {/* Nome da Aventura Sobreposto */}
                  <div className="absolute bottom-4 sm:bottom-6 inset-x-4 sm:inset-x-6 z-10 text-center space-y-1.5">
                    <p className="text-[11px] font-cinzel uppercase tracking-widest text-amber-400/90 font-bold">
                      CRÔNICA & AVENTURA
                    </p>
                    <h2 className="text-xl sm:text-3xl lg:text-4xl font-cinzel font-bold text-amber-100 tracking-wide drop-shadow-[0_2px_12px_rgba(0,0,0,0.95)]">
                      {game.name}
                    </h2>
                    {game.description && (
                      <p className="text-xs sm:text-sm text-stone-300 font-serif italic max-w-2xl mx-auto line-clamp-2 drop-shadow">
                        "{game.description}"
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* BANNER SE O JOGADOR AINDA NÃO VINCULOU SEU HERÓI */}
              {currentPlayer && !currentPlayer.characterId && (
                <div className="p-4 rounded-xl bg-amber-950/70 border border-amber-500/60 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-amber-900/80 border border-amber-400/50 flex items-center justify-center text-amber-300 shrink-0">
                      <Sword size={20} />
                    </div>
                    <div>
                      <h4 className="font-cinzel font-bold text-sm text-amber-100">
                        Você ainda não escolheu seu herói para esta aventura
                      </h4>
                      <p className="text-xs font-serif text-stone-300">
                        Selecione o personagem com o qual você jogará nesta crônica de Tormenta 20.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsChangeHeroModalOpen(true)}
                    className="w-full sm:w-auto py-2 px-4 rounded-lg bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-stone-950 font-cinzel font-bold text-xs uppercase tracking-wider shadow active:scale-95 cursor-pointer shrink-0"
                  >
                    [ ESCOLHER HERÓI ]
                  </button>
                </div>
              )}

              {/* ----------------------------------------------------------- */}
              {/* SEÇÃO 👥 JOGADORES / AVENTUREIROS (FORMATO ESPECIFICADO)     */}
              {/* ----------------------------------------------------------- */}
              <div className="rounded-xl border border-amber-900/40 bg-[#120e0b]/90 p-5 sm:p-6 space-y-4 shadow-lg">
                <div className="flex items-center justify-between border-b border-amber-900/30 pb-3">
                  <div className="flex items-center gap-2 text-sm sm:text-base font-cinzel font-bold text-amber-100 uppercase tracking-wider">
                    <Users className="text-amber-400 w-5 h-5" />
                    <span>{isMaster ? 'JOGADORES' : '🧙 AVENTUREIROS'}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    {canChangeHero && currentPlayer?.characterId && (
                      <button
                        type="button"
                        onClick={() => setIsChangeHeroModalOpen(true)}
                        className="text-xs font-cinzel font-bold uppercase tracking-wider text-amber-400 hover:text-amber-300 hover:underline cursor-pointer"
                      >
                        [ TROCAR PERSONAGEM ]
                      </button>
                    )}
                    <span className="text-xs font-cinzel font-bold text-amber-300/90 px-3 py-1 rounded-full bg-[#0a0806] border border-amber-900/50">
                      {currentAdventurersCount} / {maxPlayersCount} jogadores
                    </span>
                  </div>
                </div>

                {/* VISUALIZAÇÃO: MESTRE E JOGADORES */}
                <div className="space-y-3">
                  {/* Bloco do Mestre */}
                  <div className="p-3.5 rounded-xl bg-[#0d0a08] border border-amber-800/40 flex items-center justify-between shadow-inner">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl" title="Mestre">👑</span>
                      <div>
                        <span className="text-[10px] uppercase font-cinzel text-amber-400/80 font-bold tracking-wider block">
                          MESTRE
                        </span>
                        <span className="font-cinzel font-bold text-sm text-stone-100 block">
                          {masterDisplayName}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {isMasterOnline ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-950/70 border border-emerald-500/50 text-emerald-400">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                          ● ONLINE
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-stone-900/80 border border-stone-700/50 text-stone-400">
                          <span className="w-2 h-2 rounded-full bg-stone-500" />
                          ● OFFLINE
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Demais Aventureiros / Jogadores */}
                  {adventurers.length === 0 ? (
                    <div className="p-6 rounded-xl bg-[#0a0806]/70 border border-dashed border-amber-900/30 text-center space-y-1">
                      <p className="text-xs font-cinzel text-stone-400">
                        Nenhum herói entrou na mesa ainda. Compartilhe o código de convite abaixo.
                      </p>
                    </div>
                  ) : isMaster ? (
                    /* MODO MESTRE:
                       JOGADORES
                       👤 João
                       ⚔️ Arthan
                       ✓ PRONTO
                    */
                    <div className="space-y-2.5">
                      {adventurers.map((player) => {
                        const online = isPlayerOnline(player);
                        const emoji = getClassEmoji(player.characterClass || '');

                        return (
                          <div
                            key={player.id}
                            className="p-3.5 rounded-xl bg-[#0d0a08] border border-amber-950/70 hover:border-amber-900/50 transition-all flex items-center justify-between"
                          >
                            <div className="flex items-start gap-3">
                              <span className="text-2xl mt-0.5" title="Jogador">👤</span>
                              <div className="space-y-1">
                                <span className="font-cinzel font-bold text-sm text-stone-100 block">
                                  {player.displayName}
                                </span>
                                {player.characterId ? (
                                  <div className="pl-2 border-l-2 border-amber-600/50 space-y-0.5">
                                    <div className="flex items-center gap-1.5 text-xs font-cinzel font-bold text-amber-200">
                                      <span>{emoji}</span>
                                      <span>{player.characterName}</span>
                                    </div>
                                    <p className="text-[11px] text-amber-400/80 font-serif">
                                      {player.characterClass || 'Aventureiro'} {player.characterLevel ? `• Nível ${player.characterLevel}` : ''}
                                      {player.characterRace ? ` (${player.characterRace})` : ''}
                                    </p>
                                  </div>
                                ) : (
                                  <p className="text-[11px] text-stone-500 font-serif italic pl-2 border-l-2 border-stone-800">
                                    Nenhum herói vinculado ainda
                                  </p>
                                )}

                                {/* ESTADO DE PRONTIDÃO DO JOGADOR */}
                                <div className="pt-0.5">
                                  {player.ready ? (
                                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-cinzel font-bold bg-emerald-950/70 border border-emerald-500/50 text-emerald-400">
                                      <span className="font-bold">✓</span> PRONTO
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-cinzel font-semibold bg-stone-900/80 border border-amber-900/40 text-amber-400/80">
                                      <span>⌛</span> NÃO PRONTO
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2.5">
                              {online ? (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-950/70 border border-emerald-500/50 text-emerald-400">
                                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                  ● ONLINE
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-stone-900/80 border border-stone-700/50 text-stone-400">
                                  <span className="w-2 h-2 rounded-full bg-stone-500" />
                                  ● OFFLINE
                                </span>
                              )}

                              <button
                                onClick={() => handleRemovePlayer(player.id, player.displayName)}
                                title="Remover jogador"
                                className="p-1 rounded text-stone-500 hover:text-red-400 hover:bg-red-950/30 transition-colors ml-1 cursor-pointer"
                              >
                                <UserMinus size={14} />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    /* MODO LOBBY / JOGADOR:
                       🧙 AVENTUREIROS
                       Jogador 1
                       ⚔️ Arthan
                       Guerreiro • Nível 5
                       ● ONLINE
                    */
                    <div className="space-y-2.5">
                      {adventurers.map((player, idx) => {
                        const online = isPlayerOnline(player);
                        const emoji = getClassEmoji(player.characterClass || '');
                        const isCurrent = user?.uid === player.userId;

                        return (
                          <div
                            key={player.id}
                            className="p-3.5 rounded-xl bg-[#0d0a08] border border-amber-950/70 hover:border-amber-900/50 transition-all flex items-center justify-between"
                          >
                            <div className="flex items-start gap-3">
                              <span className="text-2xl mt-0.5">{emoji}</span>
                              <div className="space-y-0.5">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-stone-400 font-serif">
                                    {player.displayName || `Jogador ${idx + 1}`}
                                  </span>
                                  {isCurrent && (
                                    <span className="text-[9px] font-cinzel uppercase px-1.5 py-0.5 rounded bg-amber-950/70 border border-amber-700/40 text-amber-300 font-bold">
                                      Você
                                    </span>
                                  )}
                                </div>

                                {player.characterId ? (
                                  <>
                                    <h4 className="font-cinzel font-bold text-sm text-stone-100 flex items-center gap-1.5">
                                      <span>{emoji}</span>
                                      <span>{player.characterName}</span>
                                    </h4>
                                    <p className="text-xs text-amber-400/80 font-serif">
                                      {player.characterClass || 'Aventureiro'} • Nível {player.characterLevel || 1}
                                      {player.characterRace ? ` (${player.characterRace})` : ''}
                                    </p>
                                  </>
                                ) : (
                                  <div className="flex items-center gap-2 pt-0.5">
                                    <span className="text-xs text-stone-500 font-serif italic">
                                      Nenhum herói escolhido
                                    </span>
                                    {isCurrent && (
                                      <button
                                        type="button"
                                        onClick={() => setIsChangeHeroModalOpen(true)}
                                        className="text-[10px] font-cinzel font-bold text-amber-400 hover:underline uppercase cursor-pointer"
                                      >
                                        [ ESCOLHER ]
                                      </button>
                                    )}
                                  </div>
                                )}

                                {/* ESTADO DE PRONTIDÃO */}
                                <div className="pt-0.5 flex items-center gap-2">
                                  {player.ready ? (
                                    <span className="inline-flex items-center gap-1 text-[11px] font-cinzel font-bold text-emerald-400">
                                      <span>✓</span> PRONTO
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 text-[11px] font-cinzel font-semibold text-stone-500">
                                      <span>⌛</span> NÃO PRONTO
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2.5">
                              {isCurrent && player.characterId && game.status === 'lobby' && !player.ready && (
                                <button
                                  type="button"
                                  onClick={() => setIsChangeHeroModalOpen(true)}
                                  className="py-1 px-2.5 rounded-lg bg-amber-950/80 hover:bg-amber-900 border border-amber-700/50 text-amber-200 text-[10px] font-cinzel font-bold uppercase tracking-wider transition-all cursor-pointer shadow"
                                >
                                  [ TROCAR PERSONAGEM ]
                                </button>
                              )}

                              {online ? (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-950/70 border border-emerald-500/50 text-emerald-400">
                                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                  ● ONLINE
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-stone-900/80 border border-stone-700/50 text-stone-400">
                                  <span className="w-2 h-2 rounded-full bg-stone-500" />
                                  ● OFFLINE
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="text-center pt-1">
                  <span className="text-xs font-cinzel font-semibold text-stone-400">
                    {currentAdventurersCount} / {maxPlayersCount} jogadores
                  </span>
                </div>
              </div>

              {/* ----------------------------------------------------------- */}
              {/* SEÇÃO 🔗 CONVITE (CÓDIGO + BOTÃO COPIAR CONVITE)            */}
              {/* ----------------------------------------------------------- */}
              <div className="rounded-xl border border-amber-900/40 bg-[#120e0b]/90 p-5 sm:p-6 space-y-3.5 shadow-lg">
                <div className="flex items-center gap-2 text-xs font-cinzel font-bold uppercase tracking-wider text-amber-300">
                  <Share2 size={15} className="text-amber-400" />
                  <span>🔗 CONVITE</span>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#0a0806] p-3.5 rounded-xl border border-amber-900/60">
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div 
                      onClick={handleCopyOnlyCode}
                      className="bg-[#17120e] px-4 py-2 rounded-lg border border-amber-700/50 shadow-inner cursor-pointer hover:border-amber-500 transition-colors"
                      title="Clique para copiar apenas o código"
                    >
                      <span className="font-mono font-bold tracking-widest text-amber-300 text-lg">
                        {game.inviteCode}
                      </span>
                    </div>
                    <span className="text-xs text-stone-400 font-mono hidden sm:inline truncate max-w-xs">
                      /join/{game.inviteCode}
                    </span>
                  </div>

                  {/* BOTÃO [ COPIAR CONVITE ] */}
                  <button
                    onClick={handleCopyInvite}
                    type="button"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-amber-950/80 hover:bg-amber-900/90 border border-amber-600/50 text-amber-200 hover:text-amber-100 text-xs font-cinzel font-bold tracking-wider uppercase transition-all shadow-md active:scale-95 cursor-pointer"
                  >
                    <Copy size={14} className="text-amber-400" />
                    <span>{copiedCode ? 'COPIADO!' : '[ COPIAR CONVITE ]'}</span>
                  </button>
                </div>
              </div>

              {/* ----------------------------------------------------------- */}
              {/* CONTROLES DE ENTRADA / PRONTIDÃO / INÍCIO DE AVENTURA       */}
              {/* ----------------------------------------------------------- */}
              <div className="pt-2">
                {game.status === 'active' ? (
                  /* CASO: Aventura já está ativa */
                  <div className="space-y-2.5">
                    <div className="p-3 rounded-xl bg-emerald-950/70 border border-emerald-500/50 text-center flex items-center justify-center gap-2 shadow-md">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-xs sm:text-sm font-cinzel font-bold text-emerald-300 uppercase tracking-widest">
                        Aventura em Andamento
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (isMaster) {
                          setIsPreparationModalOpen(true);
                        } else if (!currentPlayer?.characterId) {
                          setIsChangeHeroModalOpen(true);
                        }
                      }}
                      className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700 hover:from-amber-600 hover:to-amber-500 text-stone-950 font-cinzel font-bold tracking-widest uppercase text-base sm:text-lg shadow-[0_0_35px_rgba(217,119,6,0.35)] transition-all flex items-center justify-center gap-3 active:scale-[0.99] border border-amber-300/60 cursor-pointer"
                    >
                      <Sword size={22} className="text-stone-950" />
                      <span>[ ⚔️ ENTRAR NA MESA DE JOGO ]</span>
                    </button>
                  </div>
                ) : isMaster ? (
                  /* MODO MESTRE (LOBBY):
                     O Mestre deve possuir o ÚNICO botão capaz de iniciar a partida:
                     [ ⚔️ INICIAR AVENTURA ]
                     Somente o Mestre pode iniciar o jogo.
                  */
                  <div className="space-y-2.5">
                    <button
                      type="button"
                      onClick={handleStartAdventure}
                      disabled={isStartingGame}
                      className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-400 text-stone-950 font-cinzel font-bold tracking-widest uppercase text-base sm:text-lg shadow-[0_0_35px_rgba(217,119,6,0.35)] transition-all flex items-center justify-center gap-3 active:scale-[0.99] border border-amber-300/60 cursor-pointer disabled:opacity-50"
                    >
                      <Sword size={22} className="text-stone-950" />
                      <span>{isStartingGame ? 'INICIANDO AVENTURA...' : '[ ⚔️ INICIAR AVENTURA ]'}</span>
                    </button>
                    <div className="flex items-center justify-between text-[11px] font-cinzel text-stone-400 px-1">
                      <span>👑 Apenas o Mestre pode iniciar a partida</span>
                      <span className="text-amber-400 font-bold">
                        {readyCount} de {adventurers.length} jogadores prontos
                      </span>
                    </div>
                  </div>
                ) : (
                  /* MODO JOGADOR (LOBBY):
                     Jogador nunca possui botão de iniciar jogo.
                     Se já escolheu herói:
                       Se não estiver pronto: [ ✓ PRONTO PARA ENTRAR ]
                       Se estiver pronto: ✓ PRONTO / AGUARDANDO O MESTRE... / [ CANCELAR PRONTIDÃO ]
                     Se não escolheu herói ainda:
                       [ ESCOLHER HERÓI PARA ENTRAR ]
                  */
                  !currentPlayer?.characterId ? (
                    <div className="space-y-2">
                      <button
                        type="button"
                        onClick={() => setIsChangeHeroModalOpen(true)}
                        className="w-full py-4 px-6 rounded-xl bg-amber-950/80 hover:bg-amber-900 border border-amber-600/50 text-amber-200 font-cinzel font-bold tracking-widest uppercase text-sm sm:text-base shadow transition-all flex items-center justify-center gap-3 cursor-pointer"
                      >
                        <Sword size={20} className="text-amber-400" />
                        <span>[ ESCOLHER HERÓI PARA ENTRAR ]</span>
                      </button>
                      <p className="text-center text-xs font-serif text-stone-400">
                        Vincule um herói à aventura para poder confirmar sua prontidão ao Mestre.
                      </p>
                    </div>
                  ) : !currentPlayer.ready ? (
                    <div className="space-y-2">
                      <button
                        type="button"
                        onClick={() => handleToggleReady(true)}
                        disabled={isTogglingReady}
                        className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-600 hover:from-emerald-500 hover:to-emerald-400 text-stone-950 font-cinzel font-bold tracking-widest uppercase text-base sm:text-lg shadow-[0_0_30px_rgba(16,185,129,0.35)] transition-all flex items-center justify-center gap-3 active:scale-[0.99] border border-emerald-300/60 cursor-pointer disabled:opacity-50"
                      >
                        <CheckCircle2 size={22} className="text-stone-950" />
                        <span>{isTogglingReady ? 'SALVANDO...' : '[ ✓ PRONTO PARA ENTRAR ]'}</span>
                      </button>
                      <p className="text-center text-xs font-serif text-stone-400">
                        Clique quando estiver preparado. O Mestre iniciará a partida para todos.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="p-4 rounded-xl bg-emerald-950/70 border border-emerald-500/60 text-center space-y-1.5 shadow-[0_0_25px_rgba(16,185,129,0.2)]">
                        <div className="flex items-center justify-center gap-2 text-emerald-400 font-cinzel font-bold text-base sm:text-lg tracking-wider">
                          <CheckCircle2 size={22} className="text-emerald-400 shrink-0" />
                          <span>✓ PRONTO</span>
                        </div>
                        <p className="text-xs sm:text-sm font-cinzel text-emerald-200/90 tracking-widest uppercase font-bold">
                          AGUARDANDO O MESTRE...
                        </p>
                        <p className="text-[11px] font-serif text-stone-400">
                          Seu herói ({currentPlayer.characterName}) está posicionado. A aventura começará quando o Mestre iniciar.
                        </p>
                      </div>

                      <div className="flex justify-center">
                        <button
                          type="button"
                          onClick={() => handleToggleReady(false)}
                          disabled={isTogglingReady}
                          className="text-xs font-cinzel font-semibold text-stone-400 hover:text-amber-300 underline tracking-wider uppercase transition-colors cursor-pointer disabled:opacity-50"
                        >
                          [ CANCELAR PRONTIDÃO ]
                        </button>
                      </div>
                    </div>
                  )
                )}
              </div>
            </>
          )}

          {/* ABA: JOGADORES */}
          {activeTab === 'players' && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-amber-900/30 pb-4">
                <div>
                  <h3 className="text-base font-cinzel font-bold text-amber-100">
                    Aventureiros na Mesa
                  </h3>
                  <p className="text-xs text-stone-400 font-serif">
                    Membros da guilda registrados nesta jornada
                  </p>
                </div>
                <div className="text-xs font-cinzel font-bold text-amber-300 bg-[#0d0a08] px-3.5 py-1.5 rounded-full border border-amber-900/50">
                  {currentAdventurersCount} / {maxPlayersCount} vagas ocupadas
                </div>
              </div>

              {/* Mestre */}
              <div className="p-4 rounded-xl bg-[#0e0b08] border border-amber-800/50 flex items-center justify-between">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-700 to-amber-950 border border-amber-500/60 flex items-center justify-center text-amber-300">
                    <Crown size={20} />
                  </div>
                  <div>
                    <span className="font-cinzel font-bold text-stone-100 block">
                      {masterDisplayName}
                    </span>
                    <span className="text-xs text-amber-400/80 font-cinzel">
                      Mestre da Mesa (Narrador)
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {isMasterOnline ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-950/70 border border-emerald-500/50 text-emerald-400">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      ● ONLINE
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-stone-900/80 border border-stone-700/50 text-stone-400">
                      <span className="w-2 h-2 rounded-full bg-stone-500" />
                      ● OFFLINE
                    </span>
                  )}
                </div>
              </div>

              {/* Lista dos Aventureiros */}
              <div className="space-y-3">
                {adventurers.length === 0 ? (
                  <div className="p-8 rounded-xl bg-[#0a0806] border border-dashed border-amber-900/40 text-center space-y-3">
                    <Users className="w-10 h-10 text-amber-500/40 mx-auto" />
                    <p className="text-sm font-cinzel text-stone-300">
                      Nenhum aventureiro entrou ainda nesta mesa
                    </p>
                    <p className="text-xs text-stone-400 font-serif">
                      Envie o link ou o código <strong className="font-mono text-amber-300">{game.inviteCode}</strong> para seus jogadores.
                    </p>
                    <button
                      onClick={handleCopyInvite}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-950/70 hover:bg-amber-900/80 border border-amber-700/50 text-amber-200 text-xs font-cinzel font-bold uppercase tracking-wider cursor-pointer"
                    >
                      <Copy size={13} className="text-amber-400" />
                      Copiar Convite
                    </button>
                  </div>
                ) : (
                  adventurers.map((player, idx) => {
                    const online = isPlayerOnline(player);
                    const emoji = getClassEmoji(player.characterClass || '');
                    const isCurrent = user?.uid === player.userId;

                    return (
                      <div
                        key={player.id}
                        className="p-4 rounded-xl bg-[#0e0b08] border border-amber-950/70 hover:border-amber-900/50 transition-all flex items-center justify-between"
                      >
                        <div className="flex items-start gap-3.5">
                          <div className="w-10 h-10 rounded-lg bg-stone-900 border border-amber-900/40 flex items-center justify-center text-lg shrink-0">
                            {emoji}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-cinzel font-bold text-sm text-stone-200">
                                {player.displayName}
                              </span>
                              {isCurrent && (
                                <span className="text-[10px] font-cinzel uppercase px-1.5 py-0.5 rounded bg-amber-950/60 border border-amber-700/40 text-amber-300 font-bold">
                                  Você
                                </span>
                              )}
                            </div>

                            {player.characterId ? (
                              <div className="mt-1 space-y-0.5">
                                <div className="text-xs font-cinzel font-bold text-amber-200">
                                  {emoji} {player.characterName}
                                </div>
                                <p className="text-[11px] text-amber-400/80 font-serif">
                                  {player.characterClass || 'Aventureiro'} {player.characterLevel ? `• Nível ${player.characterLevel}` : ''}
                                  {player.characterRace ? ` (${player.characterRace})` : ''}
                                </p>
                              </div>
                            ) : (
                              <p className="text-[11px] text-stone-500 font-serif italic mt-0.5">
                                Nenhum herói vinculado
                              </p>
                            )}

                            {/* ESTADO DE PRONTIDÃO */}
                            <div className="pt-1">
                              {player.ready ? (
                                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-cinzel font-bold bg-emerald-950/70 border border-emerald-500/50 text-emerald-400">
                                  ✓ PRONTO
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-cinzel font-semibold bg-stone-900/80 border border-amber-900/40 text-amber-400/80">
                                  ⌛ NÃO PRONTO
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          {isCurrent && player.characterId && game.status === 'lobby' && !player.ready && (
                            <button
                              type="button"
                              onClick={() => setIsChangeHeroModalOpen(true)}
                              className="py-1 px-2.5 rounded-lg bg-amber-950/80 hover:bg-amber-900 border border-amber-700/50 text-amber-200 text-[10px] font-cinzel font-bold uppercase tracking-wider transition-all cursor-pointer shadow"
                            >
                              [ TROCAR ]
                            </button>
                          )}

                          {online ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-950/70 border border-emerald-500/50 text-emerald-400">
                              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                              ● ONLINE
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-stone-900/80 border border-stone-700/50 text-stone-400">
                              <span className="w-2 h-2 rounded-full bg-stone-500" />
                              ● OFFLINE
                            </span>
                          )}

                          {isMaster && (
                            <button
                              onClick={() => handleRemovePlayer(player.id, player.displayName)}
                              title="Remover aventureiro"
                              className="p-1.5 rounded-lg text-stone-500 hover:text-red-400 hover:bg-red-950/40 transition-colors cursor-pointer"
                            >
                              <UserMinus size={16} />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* ABA: CONFIGURAÇÕES (Mestre) */}
          {activeTab === 'settings' && isMaster && (
            <div className="space-y-6">
              <div className="border-b border-amber-900/30 pb-4">
                <h3 className="text-base font-cinzel font-bold text-amber-100">
                  Configurações da Mesa
                </h3>
                <p className="text-xs text-stone-400 font-serif">
                  Ajuste os parâmetros da mesa, sistema de regras e capacidade de aventureiros
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-[#0e0b08] border border-amber-900/40 space-y-2">
                  <span className="text-xs font-cinzel text-amber-300 font-bold uppercase block">
                    Nome da Mesa
                  </span>
                  <p className="font-cinzel text-stone-100 font-bold text-sm">
                    {game.name}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#0e0b08] border border-amber-900/40 space-y-2">
                  <span className="text-xs font-cinzel text-amber-300 font-bold uppercase block">
                    Sistema de Regras
                  </span>
                  <p className="font-cinzel text-stone-100 font-bold text-sm">
                    {game.system}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#0e0b08] border border-amber-900/40 space-y-2">
                  <span className="text-xs font-cinzel text-amber-300 font-bold uppercase block">
                    Limite de Jogadores
                  </span>
                  <p className="font-cinzel text-stone-100 font-bold text-sm">
                    {maxPlayersCount} jogadores
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#0e0b08] border border-amber-900/40 space-y-2">
                  <span className="text-xs font-cinzel text-amber-300 font-bold uppercase block">
                    Código de Convite
                  </span>
                  <p className="font-mono text-amber-300 font-bold text-sm">
                    {game.inviteCode}
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <Button
                  variant="secondary"
                  onClick={() => setIsEditModalOpen(true)}
                  icon={Settings}
                  className="w-full sm:w-auto text-xs border-amber-800/50 text-amber-200"
                >
                  Editar Informações da Mesa
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL: "Mesa do Mestre em preparação." (CONFORME SOLICITADO)               */}
      {/* ========================================================================= */}
      {isPreparationModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
          <div 
            className="w-full max-w-md rounded-2xl border border-amber-700/60 bg-gradient-to-b from-[#1c1611] via-[#14100c] to-[#0c0907] p-6 sm:p-7 shadow-[0_25px_60px_rgba(0,0,0,0.95)] text-center space-y-5 relative"
            style={{
              boxShadow: 'inset 0 1px 0 rgba(212,175,55,0.2), 0 25px 60px rgba(0,0,0,0.95)'
            }}
          >
            {/* Cantoneiras decorativas */}
            <div className="absolute top-2.5 left-2.5 w-3 h-3 border-t-2 border-l-2 border-amber-500/50 pointer-events-none" />
            <div className="absolute top-2.5 right-2.5 w-3 h-3 border-t-2 border-r-2 border-amber-500/50 pointer-events-none" />
            <div className="absolute bottom-2.5 left-2.5 w-3 h-3 border-b-2 border-l-2 border-amber-500/50 pointer-events-none" />
            <div className="absolute bottom-2.5 right-2.5 w-3 h-3 border-b-2 border-r-2 border-amber-500/50 pointer-events-none" />

            <div className="w-14 h-14 rounded-full bg-amber-950/60 border border-amber-600/50 flex items-center justify-center mx-auto text-amber-400 shadow-md">
              <Sword size={26} className="text-amber-400 animate-pulse" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-cinzel font-bold text-amber-100 tracking-wide">
                Mesa do Mestre em preparação.
              </h3>
              <p className="text-xs text-stone-400 font-serif leading-relaxed">
                Os mapas de batalha, dados rúnicos e fichas integradas estão sendo forjados para o ambiente virtual de jogo.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsPreparationModalOpen(false)}
              className="w-full py-3 px-4 rounded-xl bg-amber-950/80 hover:bg-amber-900/90 border border-amber-600/50 text-amber-200 text-xs font-cinzel font-bold uppercase tracking-wider transition-all active:scale-95 cursor-pointer"
            >
              Compreendido
            </button>
          </div>
        </div>
      )}

      {/* Modal de Edição de Configurações (apenas Mestre) */}
      <EditGameModal
        campaignId={campaignId!}
        game={game}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onGameUpdated={() => {
          // Atualizado automaticamente pelo listener realtime
        }}
      />

      {/* Modal de Troca / Escolha de Herói no Lobby */}
      {currentPlayer && (
        <JoinGameFlowModal
          isOpen={isChangeHeroModalOpen}
          onClose={() => setIsChangeHeroModalOpen(false)}
          preloadedGameInfo={{
            game,
            campaignId: campaignId!,
            masterName: masterDisplayName
          }}
          isChangingCharacter={true}
          existingPlayerId={currentPlayer.id}
          onCharacterChanged={() => {
            showToast('Herói da aventura atualizado com sucesso!');
          }}
        />
      )}
    </div>
  );
};
