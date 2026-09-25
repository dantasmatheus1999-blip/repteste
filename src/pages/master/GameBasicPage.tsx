import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Shield, 
  Users, 
  Copy, 
  ChevronLeft, 
  Settings, 
  CheckCircle2, 
  Radio,
  Scroll,
  Info,
  AlertTriangle,
  Play,
  Key,
  Crown,
  Activity,
  Map,
  BookOpen,
  FileText,
  ChevronRight,
  UserMinus,
  Check,
  X,
  LogOut,
  ExternalLink,
  Plus
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

// Brasão / Estandarte Heráldico Medieval do Canto Superior Esquerdo da Capa
const HeraldicBannerBadge: React.FC = () => (
  <div className="absolute top-2.5 left-2.5 z-20 select-none pointer-events-none drop-shadow-[0_4px_10px_rgba(0,0,0,0.9)]">
    <div className="relative w-12 h-16 sm:w-14 sm:h-18 flex items-center justify-center">
      {/* Estandarte com cauda em V */}
      <svg viewBox="0 0 40 56" className="w-full h-full filter drop-shadow">
        <defs>
          <linearGradient id="bannerBgGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1a1410" />
            <stop offset="60%" stopColor="#0d0a08" />
            <stop offset="100%" stopColor="#050403" />
          </linearGradient>
          <linearGradient id="bannerGoldGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#f59e0b" />
            <stop offset="50%" stopColor="#d97706" />
            <stop offset="100%" stopColor="#78350f" />
          </linearGradient>
        </defs>
        {/* Corpo do Estandarte */}
        <path
          d="M 2,0 L 38,0 L 38,44 L 20,54 L 2,44 Z"
          fill="url(#bannerBgGrad)"
          stroke="url(#bannerGoldGrad)"
          strokeWidth="1.2"
        />
        {/* Linha interna decorativa */}
        <path
          d="M 5,3 L 35,3 L 35,41 L 20,49 L 5,41 Z"
          fill="none"
          stroke="#92400e"
          strokeWidth="0.6"
          opacity="0.7"
        />
        {/* Rosa dos Ventos / Estrela de 8 pontas dourada */}
        <g transform="translate(20, 22) scale(0.75)" stroke="#fbbf24" strokeWidth="0.8">
          {/* Pontas Cardeais */}
          <polygon points="0,-14 3,-3 14,0 3,3 0,14 -3,3 -14,0 -3,-3" fill="#f59e0b" />
          {/* Pontas Colaterais */}
          <polygon points="0,-10 2,-2 10,0 2,2 0,10 -2,2 -10,0 -2,-2" fill="#d97706" transform="rotate(45)" />
          {/* Centro Radiante */}
          <circle cx="0" cy="0" r="2.5" fill="#fef08a" />
        </g>
      </svg>
    </div>
  </div>
);

// Cantoneiras douradas decorativas para cards e botões
const OrnateCorners: React.FC<{ color?: string }> = ({ color = 'border-amber-400' }) => (
  <div className="absolute inset-0 pointer-events-none">
    <div className={`absolute top-0.5 left-0.5 w-2 h-2 border-t-2 border-l-2 ${color}`} />
    <div className={`absolute top-0.5 right-0.5 w-2 h-2 border-t-2 border-r-2 ${color}`} />
    <div className={`absolute bottom-0.5 left-0.5 w-2 h-2 border-b-2 border-l-2 ${color}`} />
    <div className={`absolute bottom-0.5 right-0.5 w-2 h-2 border-b-2 border-r-2 ${color}`} />
  </div>
);

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
  const [isExitConfirmOpen, setIsExitConfirmOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'visao_geral' | 'jogadores' | 'mapa' | 'diario' | 'arquivos' | 'configuracoes'>('visao_geral');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [isInSession, setIsInSession] = useState(false);

  // Menu de 3 pontos do jogador
  const [openPlayerMenuId, setOpenPlayerMenuId] = useState<string | null>(null);

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

  // 2. Identificação do jogador e marcação de presença inicial
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
    showToast(`Código ${game.inviteCode} copiado com sucesso!`);
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
      setOpenPlayerMenuId(null);
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

  const handleConfirmExitRoom = async () => {
    setIsExitConfirmOpen(false);
    if (!campaignId || !gameId) return;

    if (currentPlayer?.id && !isMaster) {
      try {
        await GameService.updatePlayerStatus(campaignId, gameId, currentPlayer.id, 'offline');
        localStorage.removeItem(`realmor_game_player_${gameId}`);
      } catch (e) {
        console.warn('Erro ao sair da sala:', e);
      }
    }

    if (isMaster) {
      navigate(campaignId ? `/master/campaigns/${campaignId}` : '/mestre');
    } else {
      navigate('/jogador');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[65vh] p-6">
        <RealmorLoading message="Carregando sala de RPG..." subtitle="Sincronizando estado da mesa e jogadores" size="lg" />
      </div>
    );
  }

  if (error || !game) {
    return (
      <div className="max-w-md mx-auto my-12 p-6 rounded-2xl border border-amber-900/40 bg-[#0d0a08] text-center space-y-4 shadow-xl">
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

  const defaultCover = "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&auto=format&fit=crop&q=85";
  const masterPlayer = players.find(p => p.role === 'master');
  const masterDisplayName = masterPlayer?.displayName || game.masterName || 'MESTRE';
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
    <div className="min-h-screen pb-28 pt-1 px-3 sm:px-5 max-w-xl mx-auto space-y-3.5 sm:space-y-4 animate-in fade-in duration-300 relative text-stone-100 font-sans">
      
      {/* Toast Flutuante de Notificação */}
      {toastMessage && (
        <div className="fixed top-4 inset-x-4 max-w-sm mx-auto z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-[#092218]/95 border border-emerald-500/60 text-emerald-200 shadow-[0_10px_25px_rgba(0,0,0,0.8)] backdrop-blur-md">
            <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
            <span className="text-xs font-cinzel font-semibold tracking-wide">{toastMessage}</span>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. TOPO: ← VOLTAR / SAIR DA SALA | REALMOR | ((•)) AO VIVO                */}
      {/* ========================================================================= */}
      <div className="flex items-center justify-between pt-1 pb-1 px-0.5">
        <button
          type="button"
          onClick={() => setIsExitConfirmOpen(true)}
          className="inline-flex items-center gap-1.5 text-stone-300 hover:text-amber-300 transition-colors text-xs font-cinzel font-semibold py-1.5 px-2.5 rounded-xl hover:bg-amber-950/30 cursor-pointer"
        >
          <ChevronLeft size={16} className="text-stone-400" />
          <span className="tracking-wider uppercase">VOLTAR</span>
        </button>

        <h1 className="font-cinzel font-bold text-base sm:text-lg tracking-[0.22em] text-[#e8c988] uppercase drop-shadow-[0_0_12px_rgba(212,175,55,0.35)]">
          REALMOR
        </h1>

        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#051f1c]/90 border border-emerald-500/40 text-[10px] sm:text-[11px] font-cinzel font-bold tracking-wider text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
          <Radio size={12} className="text-cyan-400 animate-pulse" />
          <span>AO VIVO</span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. GRANDE CAPA DA SALA (HERO CARD COM ESTANDARTE & ILUSTRAÇÃO)            */}
      {/* ========================================================================= */}
      <div className="rounded-2xl border border-amber-600/50 bg-[#0c0907] overflow-hidden shadow-[0_10px_35px_rgba(0,0,0,0.85)] relative">
        {/* Cantoneiras douradas decorativas */}
        <OrnateCorners color="border-amber-400/80" />

        {/* Estandarte Medieval no Canto Superior Esquerdo */}
        <HeraldicBannerBadge />

        {/* Status Badge no Canto Superior Direito (EM ANDAMENTO / SALA DE ESPERA) */}
        <div className="absolute top-3 right-3 z-20">
          {game.status === 'active' || game.status === 'paused' ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#04201c]/95 border border-emerald-500/60 text-emerald-300 text-[10px] sm:text-[11px] font-cinzel font-bold tracking-wider uppercase shadow-[0_0_15px_rgba(16,185,129,0.3)]">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>EM ANDAMENTO</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1b1409]/95 border border-amber-500/60 text-amber-300 text-[10px] sm:text-[11px] font-cinzel font-bold tracking-wider uppercase shadow-[0_0_15px_rgba(245,158,11,0.25)]">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <span>SALA DE ESPERA</span>
            </span>
          )}
        </div>

        {/* Imagem de Capa com Gradiente Medieval */}
        <div className="relative h-44 sm:h-52 w-full overflow-hidden bg-[#070503]">
          <img
            src={game.coverUrl || defaultCover}
            alt={game.name}
            className="w-full h-full object-cover object-center filter brightness-90 contrast-110 select-none pointer-events-none"
          />
          {/* Sombreamento em degradê para leitura perfeita */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0c0907] via-[#0c0907]/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0c0907]/90 via-transparent to-[#0c0907]/80" />

          {/* Textos da Capa (Nome da Campanha e Mestre) */}
          <div className="absolute bottom-3 left-4 right-4 z-20 space-y-1">
            <h2 className="text-2xl sm:text-3xl font-cinzel font-black text-amber-100 tracking-wider uppercase drop-shadow-[0_2px_12px_rgba(0,0,0,0.95)]">
              {game.name}
            </h2>
            <div className="flex items-center flex-wrap gap-2 text-xs font-serif text-stone-200 drop-shadow">
              <span className="text-amber-400 font-cinzel font-bold flex items-center gap-1">
                <Shield size={13} className="text-amber-400" />
                {game.system || 'Tormenta 20'}
              </span>
              <span className="text-stone-500">•</span>
              <span>
                Mestre: <strong className="text-stone-100 font-cinzel font-bold uppercase">{masterDisplayName}</strong>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. NAVEGAÇÃO DA SALA (6 ABAS: VISÃO GERAL, JOGADORES, MAPA, DIÁRIO...)    */}
      {/* ========================================================================= */}
      <div className="w-full overflow-x-auto no-scrollbar py-0.5">
        <div className="flex items-center gap-1.5 min-w-max p-1 rounded-xl bg-[#080604]/90 border border-amber-900/40">
          {[
            { id: 'visao_geral', label: 'VISÃO GERAL', icon: Info },
            { id: 'jogadores', label: 'JOGADORES', icon: Users },
            { id: 'mapa', label: 'MAPA', icon: Map },
            { id: 'diario', label: 'DIÁRIO', icon: BookOpen },
            { id: 'arquivos', label: 'ARQUIVOS', icon: FileText },
            { id: 'configuracoes', label: 'CONFIGURAÇÕES', icon: Settings }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  if (tab.id === 'configuracoes' && isMaster) {
                    setIsEditModalOpen(true);
                  } else if (tab.id === 'mapa' && (game.status === 'active' || game.status === 'paused')) {
                    setIsInSession(true);
                  } else {
                    setActiveTab(tab.id as any);
                  }
                }}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-[10px] sm:text-[11px] font-cinzel font-bold tracking-wider uppercase transition-all cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-b from-[#2e2113] to-[#140e08] border border-amber-500/70 text-amber-200 shadow-[0_0_12px_rgba(212,175,55,0.3)] ring-1 ring-amber-500/30'
                    : 'text-stone-400 hover:text-amber-200 hover:bg-amber-950/20 border border-transparent'
                }`}
              >
                <Icon size={13} className={isActive ? 'text-amber-400' : 'text-stone-500'} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. ÁREA PRINCIPAL: JOGADORES DA MESA + CÓDIGO DA SALA (GRID 2 COLUNAS)     */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5">
        
        {/* COLUNA ESQUERDA: JOGADORES DA MESA */}
        <div className="md:col-span-7 rounded-2xl border border-amber-900/50 bg-[#090705]/95 p-3.5 sm:p-4 space-y-3 shadow-xl backdrop-blur-sm relative">
          <OrnateCorners color="border-amber-500/40" />

          {/* Cabeçalho da Seção de Jogadores */}
          <div className="flex items-center justify-between border-b border-amber-950/80 pb-2">
            <h3 className="text-xs sm:text-sm font-cinzel font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
              <Users size={14} className="text-amber-400" />
              <span>JOGADORES DA MESA</span>
            </h3>
            <span className="font-cinzel font-bold text-xs text-amber-300 tracking-wider">
              {currentAdventurersCount} / {maxPlayersCount}
            </span>
          </div>

          {/* Lista de Jogadores Atuais */}
          <div className="space-y-2">
            {adventurers.length === 0 ? (
              <div className="p-3 text-center text-xs font-serif text-stone-500 italic">
                Nenhum jogador na mesa ainda.
              </div>
            ) : (
              adventurers.map((player) => {
                const online = isPlayerOnline(player);
                const emoji = getClassEmoji(player.characterClass || '');
                const isCurrent = user?.uid === player.userId;
                const isMenuOpen = openPlayerMenuId === player.id;

                return (
                  <div
                    key={player.id}
                    className="p-2 sm:p-2.5 rounded-xl bg-[#0e0b08] border border-amber-900/35 flex items-center justify-between gap-2 shadow-xs relative"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {/* Avatar Quadrado Estilizado */}
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-950 via-amber-950 to-stone-950 border border-amber-600/50 flex items-center justify-center shrink-0 overflow-hidden shadow-inner relative">
                        {player.characterAvatar ? (
                          <img 
                            src={player.characterAvatar} 
                            alt={player.characterName || player.displayName}
                            className="w-full h-full object-cover" 
                          />
                        ) : (
                          <span className="text-base">{emoji}</span>
                        )}
                      </div>

                      {/* Nome, Classe e Nível */}
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-cinzel font-bold text-xs sm:text-sm text-stone-100 truncate block">
                            {player.characterName || player.displayName}
                          </span>
                          {isCurrent && (
                            <span className="text-[9px] font-cinzel font-bold uppercase px-1.5 py-0.2 rounded bg-amber-950/80 border border-amber-500/50 text-amber-300 shrink-0">
                              VOCÊ
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-amber-400/90 font-serif truncate">
                          {player.characterClass || 'Guerreiro'} • Nível {player.characterLevel || 1}
                        </p>
                      </div>
                    </div>

                    {/* Status Online & Menu de Ações (3 Pontos) */}
                    <div className="flex items-center gap-2 shrink-0">
                      {online ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-cinzel font-bold text-emerald-400">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          ONLINE
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-cinzel font-bold text-stone-500">
                          <span className="w-1.5 h-1.5 rounded-full bg-stone-600" />
                          OFFLINE
                        </span>
                      )}

                      {/* Botão de 3 Pontos Contextual */}
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setOpenPlayerMenuId(isMenuOpen ? null : player.id)}
                          className="p-1 rounded-lg text-stone-400 hover:text-amber-200 hover:bg-amber-950/30 transition-colors cursor-pointer"
                          title="Ações do jogador"
                        >
                          <span className="text-base font-bold leading-none">⋮</span>
                        </button>

                        {/* Dropdown do Jogador */}
                        {isMenuOpen && (
                          <div className="absolute right-0 top-full mt-1 w-44 rounded-xl bg-[#140f0b] border border-amber-600/50 shadow-2xl z-40 py-1 text-xs font-cinzel animate-in fade-in zoom-in-95 duration-150">
                            {player.characterId && (
                              <button
                                type="button"
                                onClick={() => {
                                  setOpenPlayerMenuId(null);
                                  navigate(`/characters/${player.characterId}`);
                                }}
                                className="w-full px-3 py-1.5 text-left text-stone-200 hover:text-amber-200 hover:bg-amber-950/50 flex items-center gap-2 cursor-pointer"
                              >
                                <ExternalLink size={12} />
                                <span>Ver Ficha Completa</span>
                              </button>
                            )}

                            {player.userId && (
                              <button
                                type="button"
                                onClick={() => {
                                  setOpenPlayerMenuId(null);
                                  navigate(`/perfil/${player.userId}`);
                                }}
                                className="w-full px-3 py-1.5 text-left text-stone-200 hover:text-amber-200 hover:bg-amber-950/50 flex items-center gap-2 cursor-pointer"
                              >
                                <Users size={12} />
                                <span>Ver Perfil de Jogador</span>
                              </button>
                            )}

                            {isMaster && (
                              <button
                                type="button"
                                onClick={() => handleRemovePlayer(player.id, player.displayName)}
                                className="w-full px-3 py-1.5 text-left text-red-400 hover:text-red-300 hover:bg-red-950/40 flex items-center gap-2 border-t border-amber-950/80 cursor-pointer"
                              >
                                <UserMinus size={12} />
                                <span>Remover da Mesa</span>
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}

            {/* Vagas Disponíveis (+ Aguardando jogador...) */}
            {Array.from({ length: availableSlots }).map((_, index) => (
              <div
                key={`empty-slot-${index}`}
                className="p-2 sm:p-2.5 rounded-xl border border-dashed border-amber-900/30 bg-[#070503]/50 flex items-center gap-2.5 text-stone-500 font-serif text-xs italic select-none"
              >
                <div className="w-9 h-9 rounded-lg border border-dashed border-amber-900/40 flex items-center justify-center shrink-0 text-stone-600">
                  <Plus size={14} />
                </div>
                <span>+ Aguardando jogador...</span>
              </div>
            ))}
          </div>
        </div>

        {/* COLUNA DIREITA: CÓDIGO DA SALA + DETALHES */}
        <div className="md:col-span-5 rounded-2xl border border-amber-900/50 bg-[#090705]/95 p-3.5 sm:p-4 flex flex-col justify-between space-y-3.5 shadow-xl backdrop-blur-sm relative">
          <OrnateCorners color="border-amber-500/40" />

          {/* Seção do Código da Sala */}
          <div className="space-y-1.5 text-center">
            <h3 className="text-xs font-cinzel font-bold text-amber-300 uppercase tracking-wider flex items-center justify-center gap-1.5">
              <Key size={14} className="text-amber-400" />
              <span>CÓDIGO DA SALA</span>
            </h3>

            <div className="py-2">
              <span className="font-cinzel font-black text-2xl sm:text-3xl text-stone-100 tracking-[0.2em] block drop-shadow">
                {game.inviteCode || '7X5-EKE'}
              </span>
            </div>

            <button
              onClick={handleCopyOnlyCode}
              type="button"
              className="py-1.5 px-4 rounded-xl bg-gradient-to-r from-amber-950/90 via-amber-900/80 to-amber-950/90 hover:from-amber-900 hover:to-amber-800 border border-amber-600/60 text-amber-200 text-xs font-cinzel font-bold tracking-wider uppercase inline-flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-sm cursor-pointer"
            >
              <Copy size={13} className="text-amber-400" />
              <span>{copiedCode ? 'COPIADO!' : 'COPIAR'}</span>
            </button>
          </div>

          {/* Divisor com Losango Dourado */}
          <div className="flex items-center justify-center gap-2 opacity-50 py-1">
            <span className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-amber-700" />
            <span className="w-1.5 h-1.5 rotate-45 bg-amber-500" />
            <span className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-amber-700" />
          </div>

          {/* Metadados da Sala (Sistema, Mestre, Status) */}
          <div className="space-y-2 text-xs">
            <div className="flex items-start gap-2.5">
              <BookOpen size={15} className="text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] font-cinzel font-bold uppercase tracking-wider text-amber-400/70 block">
                  SISTEMA
                </span>
                <span className="font-cinzel font-bold text-stone-200 block">
                  {game.system || 'Tormenta 20'}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <Crown size={15} className="text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] font-cinzel font-bold uppercase tracking-wider text-amber-400/70 block">
                  MESTRE
                </span>
                <span className="font-cinzel font-bold text-stone-200 block uppercase">
                  {masterDisplayName}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <Activity size={15} className="text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] font-cinzel font-bold uppercase tracking-wider text-amber-400/70 block">
                  STATUS
                </span>
                <span className="font-cinzel font-bold text-emerald-400 block">
                  ● {game.status === 'active' || game.status === 'paused' ? 'EM ANDAMENTO' : 'SALA DE ESPERA'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5. BOTÃO PRINCIPAL GRANDE: ⚔ ENTRAR NA SALA                               */}
      {/* ========================================================================= */}
      <div className="pt-1">
        <button
          onClick={handleEnterRoom}
          disabled={isStartingGame || isTogglingReady}
          className="relative w-full py-3.5 sm:py-4 rounded-xl bg-gradient-to-r from-[#d97706] via-[#f59e0b] to-[#d97706] hover:brightness-110 active:scale-[0.98] text-stone-950 font-cinzel font-black text-sm sm:text-base tracking-[0.2em] uppercase shadow-[0_0_25px_rgba(245,158,11,0.45)] transition-all border border-amber-200/60 flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50"
        >
          <OrnateCorners color="border-stone-950/70" />
          
          {/* Ícone de Espadas Cruzadas */}
          <span className="text-lg">⚔</span>

          <span>
            {isMaster ? (
              game.status === 'lobby' ? 'INICIAR NA SALA' : 'ENTRAR NA SALA'
            ) : !currentPlayer?.characterId ? (
              'ESCOLHER HERÓI & ENTRAR'
            ) : game.status === 'active' || game.status === 'paused' ? (
              'ENTRAR NA SALA'
            ) : currentPlayer.ready ? (
              'PRONTO NA SALA'
            ) : (
              'ENTRAR NA SALA'
            )}
          </span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 6. MEU PERSONAGEM (SEÇÃO SEPARADA ABAIXO DO BOTÃO PRINCIPAL)              */}
      {/* ========================================================================= */}
      {!isMaster && (
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs sm:text-sm font-cinzel font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
              <span>⚔</span>
              <span>MEU PERSONAGEM</span>
            </h3>
            <button
              type="button"
              onClick={() => setIsChangeHeroModalOpen(true)}
              className="text-[11px] font-cinzel font-bold text-amber-400 hover:text-amber-200 inline-flex items-center gap-0.5 cursor-pointer transition-colors"
            >
              <span>Gerenciar</span>
              <ChevronRight size={13} />
            </button>
          </div>

          {currentPlayer?.characterId ? (
            <div
              onClick={() => setIsChangeHeroModalOpen(true)}
              className="p-3 sm:p-3.5 rounded-2xl bg-[#090705]/95 border border-amber-900/50 flex items-center justify-between gap-3 shadow-xl backdrop-blur-sm relative group cursor-pointer hover:border-amber-600/70 transition-all"
            >
              <OrnateCorners color="border-amber-500/40" />

              <div className="flex items-center gap-3.5 min-w-0">
                {/* Avatar Grande do Personagem com borda dourada */}
                <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-red-950 via-amber-950 to-stone-950 border-2 border-red-800/60 flex items-center justify-center shrink-0 overflow-hidden shadow-md">
                  {myCharacterDoc?.imageUrl || currentPlayer.characterAvatar ? (
                    <img 
                      src={myCharacterDoc?.imageUrl || currentPlayer.characterAvatar} 
                      alt={currentPlayer.characterName || 'Herói'} 
                      className="w-full h-full object-cover select-none"
                    />
                  ) : (
                    <span className="text-2xl">{getClassEmoji(currentPlayer.characterClass || myCharacterDoc?.characterClass || '')}</span>
                  )}
                </div>

                {/* Nome, Classe e Raça */}
                <div className="space-y-0.5 min-w-0">
                  <h4 className="font-cinzel font-bold text-sm sm:text-base text-stone-100 truncate">
                    {currentPlayer.characterName || myCharacterDoc?.name || 'HOHO'}
                  </h4>
                  <p className="text-xs text-amber-400/90 font-serif">
                    {currentPlayer.characterClass || myCharacterDoc?.characterClass || 'Guerreiro'} • Nível {currentPlayer.characterLevel || myCharacterDoc?.level || 1}
                  </p>
                  <p className="text-[11px] text-stone-400 font-serif">
                    {currentPlayer.characterRace || myCharacterDoc?.characterData?.identity?.raceName || myCharacterDoc?.raceName || 'Humano'}
                  </p>
                </div>
              </div>

              <ChevronRight size={20} className="text-amber-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
            </div>
          ) : (
            <div
              onClick={() => setIsChangeHeroModalOpen(true)}
              className="p-3.5 rounded-2xl bg-[#090705]/95 border border-dashed border-amber-600/50 flex items-center justify-between gap-3 shadow-xl backdrop-blur-sm cursor-pointer hover:border-amber-400 transition-all"
            >
              <div className="space-y-0.5">
                <p className="font-cinzel font-bold text-xs text-amber-200">
                  Nenhum personagem vinculado
                </p>
                <p className="text-[11px] font-serif text-stone-400">
                  Selecione seu herói de Tormenta 20 para esta aventura.
                </p>
              </div>
              <button
                type="button"
                className="py-1.5 px-3.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-cinzel font-bold text-xs uppercase tracking-wider shadow cursor-pointer shrink-0"
              >
                ESCOLHER
              </button>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. ILUSTRAÇÃO ATMOSFÉRICA DA MESA MEDIEVAL NO RODAPÉ                      */}
      {/* ========================================================================= */}
      <div className="pt-4 pb-2 text-center opacity-85 select-none pointer-events-none">
        <div className="relative w-full h-24 sm:h-28 overflow-hidden rounded-2xl border border-amber-950/60 bg-gradient-to-t from-[#0d0a08] to-transparent">
          {/* Arte temática com velas, mapa pergaminhado e livros de RPG */}
          <img
            src="https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=900&auto=format&fit=crop&q=80"
            alt="Mesa de RPG"
            className="w-full h-full object-cover filter brightness-50 contrast-125 mix-blend-luminosity opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#070503] via-transparent to-[#070503]/80" />
          
          {/* Efeito sutil de luz de vela dourada */}
          <div className="absolute bottom-2 left-6 w-16 h-16 bg-amber-500/10 rounded-full blur-xl animate-pulse" />
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL DE CONFIRMAÇÃO: SAIR DA SALA                                        */}
      {/* ========================================================================= */}
      {isExitConfirmOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-2xl bg-[#0e0b08] border border-amber-600/60 p-5 space-y-4 shadow-2xl relative text-center">
            <OrnateCorners color="border-amber-400" />

            <div className="w-12 h-12 rounded-full bg-amber-950/60 border border-amber-600/50 flex items-center justify-center mx-auto text-amber-300">
              <LogOut size={20} />
            </div>

            <div className="space-y-1">
              <h3 className="font-cinzel font-bold text-base sm:text-lg text-amber-200 uppercase tracking-wider">
                Sair da Sala
              </h3>
              <p className="text-xs text-stone-300 font-serif leading-relaxed">
                Deseja realmente sair desta sala de RPG?
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => setIsExitConfirmOpen(false)}
                className="py-2.5 px-4 rounded-xl border border-stone-700 bg-stone-900 hover:bg-stone-800 text-stone-300 font-cinzel font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
              >
                CANCELAR
              </button>

              <button
                type="button"
                onClick={handleConfirmExitRoom}
                className="py-2.5 px-4 rounded-xl bg-red-950/90 hover:bg-red-900 border border-red-600/60 text-red-200 font-cinzel font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
              >
                SAIR DA SALA
              </button>
            </div>
          </div>
        </div>
      )}

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
