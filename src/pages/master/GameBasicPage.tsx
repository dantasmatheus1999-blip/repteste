import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Sword, 
  Shield, 
  Users, 
  Copy, 
  ChevronLeft, 
  Settings, 
  CheckCircle2, 
  Share2, 
  UserMinus, 
  Radio,
  Scroll,
  Info,
  AlertTriangle,
  Play,
  UserCheck
} from 'lucide-react';
import { GameService } from '../../services/gameService';
import { CharacterService } from '../../services/characterService';
import { Game, GamePlayer } from '../../types/game';
import { EditGameModal } from '../../components/games/EditGameModal';
import { JoinGameFlowModal } from '../../components/games/JoinGameFlowModal';
import { getClassEmoji } from '../../utils/characterUtils';
import { useAuth } from '../../context/AuthContext';
import { MapEditor } from '../../components/map/MapEditor';
import { MobilePlayerSessionPage } from '../jogador/MobilePlayerSessionPage';
import { RealmorLoading } from '../../components/common/RealmorLoading';

export const GameBasicPage: React.FC = () => {
  const { campaignId, gameId } = useParams<{ campaignId: string; gameId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [game, setGame] = useState<Game | null>(null);
  const [players, setPlayers] = useState<GamePlayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isChangeHeroModalOpen, setIsChangeHeroModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [isInSession, setIsInSession] = useState(false);

  const [myCharacterDoc, setMyCharacterDoc] = useState<any | null>(null);
  const [isStartingGame, setIsStartingGame] = useState(false);
  const [isTogglingReady, setIsTogglingReady] = useState(false);

  const currentPlayerIdRef = useRef<string | null>(null);
  const lastOnlinePingedIdRef = useRef<string | null>(null);

  // 1. Inscrição em tempo real no jogo e nos jogadores
  useEffect(() => {
    if (!campaignId || !gameId) {
      setError('Identificadores de campanha ou jogo inválidos.');
      setLoading(false);
      return;
    }

    setLoading(true);

    const unsubGame = GameService.subscribeToGame(campaignId, gameId, (loadedGame) => {
      if (!loadedGame) {
        setError('Mesa de jogo não encontrada nesta campanha.');
      } else {
        setGame(loadedGame);
        setError(null);
      }
      setLoading(false);
    });

    const unsubPlayers = GameService.subscribeToGamePlayers(campaignId, gameId, (loadedPlayers) => {
      setPlayers(loadedPlayers);
    });

    return () => {
      unsubGame();
      unsubPlayers();
    };
  }, [campaignId, gameId]);

  // 2. Identificação do jogador e marcação de presença inicial (sem loop com players)
  useEffect(() => {
    if (!campaignId || !gameId || !game) return;

    const isMasterUser = Boolean(user?.uid && user.uid === game.masterId);
    let targetPlayerId: string | null = null;

    if (isMasterUser && user?.uid) {
      targetPlayerId = user.uid;
      currentPlayerIdRef.current = user.uid;
    } else {
      const storedId = localStorage.getItem(`realmor_game_player_${gameId}`);
      if (storedId) {
        targetPlayerId = storedId;
        currentPlayerIdRef.current = storedId;
      } else if (user?.uid) {
        const matched = players.find(p => p.userId === user.uid && p.role === 'player' && p.userId !== game.masterId);
        if (matched) {
          targetPlayerId = matched.id;
          currentPlayerIdRef.current = matched.id;
        }
      }
    }

    // Apenas marca online uma vez por ID detectado nesta sessão, prevenindo re-disparos infinitos
    if (targetPlayerId && lastOnlinePingedIdRef.current !== targetPlayerId) {
      lastOnlinePingedIdRef.current = targetPlayerId;
      GameService.updatePlayerStatus(campaignId, gameId, targetPlayerId, 'online').catch(err => {
        console.warn('Erro ao atualizar presença inicial:', err);
      });
    }
  }, [campaignId, gameId, game?.masterId, user?.uid, players.length]);

  // 3. Heartbeat periódico a cada 2 minutos e saída limpa
  useEffect(() => {
    if (!campaignId || !gameId) return;

    const heartbeatInterval = setInterval(() => {
      if (typeof document !== 'undefined' && document.hidden) return;
      const idToPing = currentPlayerIdRef.current;
      if (idToPing) {
        GameService.updatePlayerStatus(campaignId, gameId, idToPing, 'online').catch(() => {});
      }
    }, 120000);

    const handleLeave = () => {
      const idToOffline = currentPlayerIdRef.current;
      if (idToOffline) {
        GameService.updatePlayerStatus(campaignId, gameId, idToOffline, 'offline').catch(() => {});
      }
    };

    window.addEventListener('beforeunload', handleLeave);

    return () => {
      clearInterval(heartbeatInterval);
      window.removeEventListener('beforeunload', handleLeave);
      handleLeave();
    };
  }, [campaignId, gameId]);

  // Identificação de papéis e aventureiros
  const isMaster = Boolean(user?.uid && game && user.uid === game.masterId);
  const adventurers = players.filter(p => p.role === 'player' && p.userId !== game?.masterId);
  const currentPlayer = adventurers.find(p => p.userId === user?.uid);

  // Carrega ficha do personagem vinculado para detalhes de raça/imagem
  useEffect(() => {
    if (currentPlayer?.characterId) {
      CharacterService.getCharacter(currentPlayer.characterId).then(char => {
        if (char) setMyCharacterDoc(char);
      }).catch(err => console.error('Erro ao carregar personagem:', err));
    } else {
      setMyCharacterDoc(null);
    }
  }, [currentPlayer?.characterId]);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
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
        showToast('✓ Você está pronto na sala! Aguardando o Mestre.');
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
      setIsInSession(true);
    } catch (err: any) {
      console.error('Erro ao iniciar aventura:', err);
      showToast(err?.message || 'Falha ao iniciar a aventura.');
    } finally {
      setIsStartingGame(false);
    }
  };

  const handleEnterRoom = () => {
    if (!game) return;

    if (isMaster) {
      if (game.status === 'lobby') {
        handleStartAdventure();
      } else {
        setIsInSession(true);
      }
      return;
    }

    // Se jogador
    if (!currentPlayer?.characterId) {
      setIsChangeHeroModalOpen(true);
      return;
    }

    if (game.status === 'active' || game.status === 'paused') {
      setIsInSession(true);
    } else {
      handleToggleReady(!currentPlayer.ready);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[65vh] p-6">
        <RealmorLoading message="Carregando mesa de RPG..." subtitle="Sincronizando estado da sessão e jogadores" size="lg" />
      </div>
    );
  }

  if (error || !game) {
    return (
      <div className="max-w-md mx-auto my-12 p-6 rounded-2xl border border-amber-900/40 bg-[#120e0b] text-center space-y-4 shadow-xl">
        <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto" />
        <h2 className="text-lg font-cinzel font-bold text-stone-100">Mesa Inacessível</h2>
        <p className="text-xs text-stone-400 font-serif">{error || 'A mesa solicitada não foi encontrada.'}</p>
        <button 
          onClick={() => navigate(campaignId ? `/master/campaigns/${campaignId}` : '/jogador')}
          className="py-2.5 px-5 rounded-xl bg-amber-950/80 border border-amber-600/50 text-amber-200 text-xs font-cinzel font-bold uppercase tracking-wider cursor-pointer"
        >
          Voltar
        </button>
      </div>
    );
  }

  const defaultCover = "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80";
  const masterPlayer = players.find(p => p.role === 'master');
  const masterDisplayName = masterPlayer?.displayName || game.masterName || 'Mestre';
  const currentAdventurersCount = adventurers.length;
  const maxPlayersCount = game.maxPlayers || 5;
  const availableSlots = Math.max(0, maxPlayersCount - currentAdventurersCount);

  // Se o jogador ou mestre abriu a sessão ativa
  if (isInSession && !isMaster && (game.status === 'active' || game.status === 'paused') && currentPlayer?.characterId) {
    return (
      <div className="fixed inset-0 w-screen h-screen z-50 overflow-y-auto bg-[#0a0806]">
        <MobilePlayerSessionPage
          campaignId={campaignId || game.campaignId || ''}
          gameId={gameId || game.id}
          game={game}
          currentPlayer={currentPlayer}
          onExit={() => setIsInSession(false)}
        />
      </div>
    );
  }

  if (isInSession && isMaster && (game.status === 'active' || game.status === 'paused')) {
    return (
      <div className="fixed inset-0 w-screen h-screen z-50 overflow-hidden flex flex-col bg-stone-950 select-none">
        <MapEditor
          campaignId={campaignId}
          gameId={gameId}
          game={game}
          isMaster={true}
          onExitAdventure={() => setIsInSession(false)}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-36 pt-1 px-3 sm:px-4 max-w-lg mx-auto space-y-4 animate-in fade-in duration-300">
      
      {/* Toast Flutuante */}
      {toastMessage && (
        <div className="fixed top-4 inset-x-4 max-w-sm mx-auto z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-emerald-950/95 border border-emerald-500/60 text-emerald-200 shadow-2xl">
            <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
            <span className="text-xs font-cinzel font-semibold tracking-wide">{toastMessage}</span>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. TOPO: REALMOR                                                          */}
      {/* ========================================================================= */}
      <div className="flex items-center justify-between pt-1 pb-1">
        <button
          onClick={() => navigate(isMaster ? `/master/campaigns/${campaignId}` : '/jogador')}
          className="inline-flex items-center gap-1.5 text-stone-400 hover:text-amber-300 transition-colors text-xs font-cinzel font-semibold py-1 px-2 rounded-lg hover:bg-amber-950/20 cursor-pointer"
        >
          <ChevronLeft size={16} />
          <span>Voltar</span>
        </button>

        <span className="font-cinzel font-bold text-sm tracking-widest text-amber-200/90 uppercase">
          REALMOR
        </span>

        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#120e0b] border border-amber-900/30 text-[10px] font-cinzel text-stone-400">
          <Radio size={10} className="text-emerald-400 animate-pulse" />
          <span>Ao Vivo</span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. CAMPANHA (DESTAQUE PRINCIPAL)                                          */}
      {/* ========================================================================= */}
      <div className="rounded-2xl border border-amber-800/40 bg-gradient-to-b from-[#18130e] via-[#120e0b] to-[#0c0907] overflow-hidden shadow-xl relative">
        {/* Capa Compacta e Elegante */}
        <div className="relative h-28 sm:h-32 w-full overflow-hidden bg-[#0a0705]">
          <img
            src={game.coverUrl || defaultCover}
            alt={game.name}
            className="w-full h-full object-cover object-center filter brightness-85 contrast-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#120e0b] via-[#120e0b]/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#120e0b]/80 via-transparent to-[#120e0b]/80" />

          {/* Status Badge no canto superior */}
          <div className="absolute top-2.5 right-2.5 z-10">
            {game.status === 'active' ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-950/90 border border-emerald-500/50 text-emerald-300 text-[10px] font-cinzel font-bold tracking-wider uppercase shadow">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                ● EM ANDAMENTO
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#120e0b]/90 border border-amber-700/50 text-amber-300 text-[10px] font-cinzel font-bold tracking-wider uppercase shadow">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                ● SALA DE ESPERA
              </span>
            )}
          </div>
        </div>

        {/* Informações Principais da Campanha */}
        <div className="p-4 pt-2 space-y-2 relative -mt-6">
          <div className="space-y-0.5">
            <h1 className="text-xl sm:text-2xl font-cinzel font-bold text-amber-100 tracking-wide drop-shadow-md">
              {game.name}
            </h1>
            <div className="flex items-center flex-wrap gap-2 text-xs font-serif text-stone-300">
              <span className="text-amber-400/90 font-cinzel font-semibold flex items-center gap-1">
                <Shield size={12} className="text-amber-400" />
                {game.system || 'Tormenta 20'}
              </span>
              <span className="text-stone-600">•</span>
              <span>
                Mestre: <strong className="text-stone-200 font-cinzel font-semibold">{masterDisplayName}</strong>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. INFORMAÇÕES DA MESA (A MESA)                                            */}
      {/* ========================================================================= */}
      <div className="rounded-2xl border border-amber-900/40 bg-[#120e0b] p-4 space-y-3 shadow-lg">
        <h2 className="text-xs font-cinzel font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
          <Info size={14} className="text-amber-400" />
          <span>A MESA</span>
        </h2>

        <div className="grid grid-cols-2 gap-2.5">
          <div className="p-2.5 rounded-xl bg-[#0d0a08] border border-amber-950/80">
            <span className="text-[10px] font-cinzel uppercase tracking-wider text-amber-400/70 block">
              Mestre
            </span>
            <span className="text-xs font-cinzel font-bold text-stone-100 truncate block mt-0.5">
              {masterDisplayName}
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-[#0d0a08] border border-amber-950/80">
            <span className="text-[10px] font-cinzel uppercase tracking-wider text-amber-400/70 block">
              Sistema
            </span>
            <span className="text-xs font-cinzel font-bold text-stone-100 truncate block mt-0.5">
              {game.system || 'Tormenta 20'}
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-[#0d0a08] border border-amber-950/80">
            <span className="text-[10px] font-cinzel uppercase tracking-wider text-amber-400/70 block">
              Jogadores
            </span>
            <span className="text-xs font-cinzel font-bold text-stone-100 truncate block mt-0.5">
              {currentAdventurersCount} / {maxPlayersCount}
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-[#0d0a08] border border-amber-950/80">
            <span className="text-[10px] font-cinzel uppercase tracking-wider text-amber-400/70 block">
              Status
            </span>
            <span className="text-xs font-cinzel font-bold text-stone-100 truncate block mt-0.5">
              {game.status === 'active' ? 'Em andamento' : 'Sala de espera'}
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. JOGADORES DA MESA                                                      */}
      {/* ========================================================================= */}
      <div className="rounded-2xl border border-amber-900/40 bg-[#120e0b] p-4 space-y-3 shadow-lg">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-cinzel font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
            <Users size={14} className="text-amber-400" />
            <span>JOGADORES DA MESA</span>
          </h2>
          {availableSlots > 0 && (
            <span className="text-[10px] font-cinzel text-amber-400/70">
              {availableSlots} vaga{availableSlots > 1 ? 's' : ''} disponível{availableSlots > 1 ? 'is' : ''}
            </span>
          )}
        </div>

        <div className="space-y-2">
          {adventurers.length === 0 ? (
            <div className="p-4 rounded-xl bg-[#0a0806] border border-dashed border-amber-900/30 text-center">
              <p className="text-xs font-serif text-stone-400">
                Nenhum jogador entrou na mesa ainda.
              </p>
            </div>
          ) : (
            adventurers.map((player) => {
              const online = isPlayerOnline(player);
              const emoji = getClassEmoji(player.characterClass || '');
              const isCurrent = user?.uid === player.userId;

              return (
                <div
                  key={player.id}
                  className="p-2.5 rounded-xl bg-[#0d0a08] border border-amber-950/70 flex items-center justify-between gap-2.5"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {/* Avatar do Jogador / Personagem */}
                    <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-900/40 to-[#17120e] border border-amber-700/40 flex items-center justify-center shrink-0 text-base shadow-inner overflow-hidden">
                      {player.characterAvatar ? (
                        <img 
                          src={player.characterAvatar} 
                          alt={player.characterName || player.displayName}
                          className="w-full h-full object-cover" 
                        />
                      ) : (
                        <span>{emoji}</span>
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-cinzel font-bold text-xs text-stone-100 truncate block">
                          {player.characterName || player.displayName}
                        </span>
                        {isCurrent && (
                          <span className="text-[9px] font-cinzel uppercase px-1 py-0.2 rounded bg-amber-950/70 border border-amber-700/40 text-amber-300 font-bold shrink-0">
                            Você
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-amber-400/80 font-serif truncate">
                        {player.characterClass || 'Aventureiro'} {player.characterLevel ? `• Nível ${player.characterLevel}` : '• Nível 1'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {player.ready && game.status === 'lobby' && (
                      <span className="text-[10px] font-cinzel font-bold text-emerald-400 bg-emerald-950/70 px-2 py-0.5 rounded border border-emerald-500/40">
                        ✓ Pronto
                      </span>
                    )}

                    {online ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-cinzel font-bold text-emerald-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        Online
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-cinzel text-stone-500">
                        <span className="w-1.5 h-1.5 rounded-full bg-stone-600" />
                        Offline
                      </span>
                    )}

                    {isMaster && (
                      <button
                        onClick={() => handleRemovePlayer(player.id, player.displayName)}
                        title="Remover jogador"
                        className="p-1 rounded text-stone-500 hover:text-red-400 hover:bg-red-950/30 transition-colors cursor-pointer"
                      >
                        <UserMinus size={13} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5. MEU PERSONAGEM                                                         */}
      {/* ========================================================================= */}
      {!isMaster && (
        <div className="rounded-2xl border border-amber-900/40 bg-[#120e0b] p-4 space-y-3 shadow-lg">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-cinzel font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
              <Sword size={14} className="text-amber-400" />
              <span>MEU PERSONAGEM</span>
            </h2>
            {currentPlayer?.characterId && game.status === 'lobby' && (
              <button
                type="button"
                onClick={() => setIsChangeHeroModalOpen(true)}
                className="text-[10px] font-cinzel font-bold uppercase tracking-wider text-amber-400 hover:text-amber-300 hover:underline cursor-pointer"
              >
                [ Trocar ]
              </button>
            )}
          </div>

          {currentPlayer?.characterId ? (
            <div className="p-3 rounded-xl bg-[#0d0a08] border border-amber-800/40 flex items-center gap-3">
              {/* Imagem do Personagem */}
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-800/30 to-[#17120e] border border-amber-600/50 flex items-center justify-center shrink-0 overflow-hidden shadow-md text-xl">
                {myCharacterDoc?.imageUrl || currentPlayer.characterAvatar ? (
                  <img 
                    src={myCharacterDoc?.imageUrl || currentPlayer.characterAvatar} 
                    alt={currentPlayer.characterName || 'Herói'} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>{getClassEmoji(currentPlayer.characterClass || myCharacterDoc?.characterClass || '')}</span>
                )}
              </div>

              <div className="space-y-0.5 min-w-0">
                <h3 className="font-cinzel font-bold text-sm text-stone-100 truncate">
                  {currentPlayer.characterName || myCharacterDoc?.name || 'Meu Herói'}
                </h3>
                <p className="text-xs text-amber-300 font-serif">
                  {currentPlayer.characterClass || myCharacterDoc?.characterClass || 'Aventureiro'} • Nível {currentPlayer.characterLevel || myCharacterDoc?.level || 1}
                </p>
                <p className="text-[11px] text-stone-400 font-serif">
                  {currentPlayer.characterRace || myCharacterDoc?.characterData?.identity?.raceName || myCharacterDoc?.raceName || 'Humano'}
                </p>
              </div>
            </div>
          ) : (
            <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-700/40 flex items-center justify-between gap-3">
              <div className="space-y-0.5">
                <p className="font-cinzel font-bold text-xs text-amber-200">
                  Nenhum personagem vinculado
                </p>
                <p className="text-[11px] font-serif text-stone-400">
                  Selecione seu herói de Tormenta 20 para esta mesa.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsChangeHeroModalOpen(true)}
                className="py-1.5 px-3 rounded-lg bg-amber-600 hover:bg-amber-500 text-stone-950 font-cinzel font-bold text-[11px] uppercase tracking-wider shadow cursor-pointer shrink-0"
              >
                Escolher
              </button>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. SOBRE A CAMPANHA                                                       */}
      {/* ========================================================================= */}
      {game.description && (
        <div className="rounded-2xl border border-amber-900/40 bg-[#120e0b] p-4 space-y-2 shadow-lg">
          <h2 className="text-xs font-cinzel font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
            <Scroll size={14} className="text-amber-400" />
            <span>SOBRE A CAMPANHA</span>
          </h2>
          <p className="text-xs sm:text-sm text-stone-300 font-serif italic leading-relaxed">
            "{game.description}"
          </p>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. CÓDIGO DA SALA                                                         */}
      {/* ========================================================================= */}
      {game.inviteCode && (
        <div className="rounded-2xl border border-amber-900/30 bg-[#120e0b] p-3.5 flex items-center justify-between gap-3 shadow-md">
          <div>
            <span className="text-[10px] font-cinzel font-bold text-amber-400/80 uppercase tracking-wider block">
              CÓDIGO DA SALA
            </span>
            <span className="font-mono font-bold text-amber-200 tracking-widest text-sm">
              {game.inviteCode}
            </span>
          </div>

          <button
            onClick={handleCopyOnlyCode}
            type="button"
            className="py-1.5 px-3 rounded-lg bg-amber-950/70 hover:bg-amber-900 border border-amber-700/40 text-amber-300 text-[11px] font-cinzel font-bold tracking-wider uppercase inline-flex items-center gap-1.5 cursor-pointer transition-all"
          >
            <Copy size={12} />
            <span>{copiedCode ? 'Copiado!' : 'Copiar'}</span>
          </button>
        </div>
      )}

      {/* Mestre: Botão discreto para editar configurações */}
      {isMaster && (
        <div className="text-center pt-1">
          <button
            type="button"
            onClick={() => setIsEditModalOpen(true)}
            className="text-[11px] font-cinzel text-stone-400 hover:text-amber-300 inline-flex items-center gap-1.5 py-1 px-3 rounded-lg hover:bg-amber-950/20 cursor-pointer"
          >
            <Settings size={13} />
            <span>Configurações da Mesa</span>
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 8. BOTÃO PRINCIPAL (FIXO NA PARTE INFERIOR): ENTRAR NA SALA               */}
      {/* ========================================================================= */}
      <div className="fixed bottom-20 inset-x-3 sm:inset-x-6 max-w-lg mx-auto z-30 pointer-events-none">
        <button
          onClick={handleEnterRoom}
          disabled={isStartingGame || isTogglingReady}
          className="pointer-events-auto w-full h-12 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-400 text-stone-950 font-cinzel font-bold text-sm sm:text-base uppercase tracking-widest shadow-[0_8px_25px_rgba(217,119,6,0.35)] active:scale-[0.98] transition-all border border-amber-300/40 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {isMaster ? (
            game.status === 'lobby' ? (
              <>
                <Play size={18} className="fill-stone-950" />
                <span>INICIAR NA SALA</span>
              </>
            ) : (
              <>
                <Sword size={18} />
                <span>ENTRAR NA SALA</span>
              </>
            )
          ) : !currentPlayer?.characterId ? (
            <>
              <Sword size={18} />
              <span>ESCOLHER HERÓI & ENTRAR</span>
            </>
          ) : game.status === 'active' || game.status === 'paused' ? (
            <>
              <Sword size={18} />
              <span>ENTRAR NA SALA</span>
            </>
          ) : currentPlayer.ready ? (
            <>
              <UserCheck size={18} />
              <span>PRONTO NA SALA</span>
            </>
          ) : (
            <>
              <Sword size={18} />
              <span>ENTRAR NA SALA</span>
            </>
          )}
        </button>
      </div>

      {/* Modal de Edição de Configurações (apenas Mestre) */}
      <EditGameModal
        campaignId={campaignId!}
        game={game}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onGameUpdated={() => {}}
      />

      {/* Modal de Troca / Escolha de Herói no Lobby */}
      <JoinGameFlowModal
        isOpen={isChangeHeroModalOpen}
        onClose={() => setIsChangeHeroModalOpen(false)}
        preloadedGameInfo={{
          game,
          campaignId: campaignId!,
          masterName: masterDisplayName
        }}
        isChangingCharacter={Boolean(currentPlayer?.characterId)}
        existingPlayerId={currentPlayer?.id}
        onCharacterChanged={() => {
          showToast('Herói da aventura atualizado com sucesso!');
        }}
      />
    </div>
  );
};
