import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  Sword, 
  Plus, 
  LogIn, 
  Play, 
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  Users,
  Compass,
  ScrollText,
  Sparkles,
  Shield,
  Crown,
  Dice5
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useProfile } from '../context/ProfileContext';
import { GameService } from '../services/gameService';
import { MasterService } from '../services/masterService';
import { Game, GamePlayer, GameStatus } from '../types/game';
import { Campaign } from '../types/master';
import { CreateGameModal } from '../components/games/CreateGameModal';
import { CornerBracket, FantasyOrnaments } from '../components/common/FantasyOrnaments';

// Imagens de fantasia de altíssima qualidade caso a aventura não possua capa customizada
const DEFAULT_COVERS = [
  'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1514539079130-25950c84af65?w=1600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1600&auto=format&fit=crop&q=80'
];

export const GrimoireCentralPage: React.FC = () => {
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

    setLoadingMaster(true);
    setMasterGames([]);
    const unsubGames = GameService.subscribeToMasterGames(user.uid, (games) => {
      setMasterGames(games);
      setLoadingMaster(false);
    });

    const unsubCampaigns = MasterService.subscribeToCampaigns(user.uid, (camps) => {
      setCampaigns(camps);
      if (camps.length > 0 && !selectedCampaignId) {
        setSelectedCampaignId(camps[0].id);
        setSelectedCampaignSystem(camps[0].identity?.system || 'Tormenta 20');
      }
    });

    return () => {
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

    setLoadingPlayer(true);
    setPlayerGames([]);
    const unsubPlayer = GameService.subscribeToPlayerGames(user.uid, (items) => {
      setPlayerGames(items);
      setLoadingPlayer(false);
    });

    return () => {
      unsubPlayer();
    };
  }, [user?.uid, isMaster]);

  // 3. Jogo em destaque para "CONTINUAR AVENTURA" (UM ÚNICO DESTAQUE)
  const activeOrLobbyMasterGames = masterGames.filter(g => g.status === 'active' || g.status === 'lobby');
  const activeOrLobbyPlayerGames = playerGames
    .map(p => p.game)
    .filter(g => g.status === 'active' || g.status === 'lobby');

  const relevantGames = isMaster ? activeOrLobbyMasterGames : activeOrLobbyPlayerGames;
  const sortedRecent = [...relevantGames].sort((a, b) => (b.updatedAt || b.createdAt || 0) - (a.updatedAt || a.createdAt || 0));
  const featuredGame: Game | null = sortedRecent.length > 0 ? sortedRecent[0] : null;

  // Lista secundária: as outras aventuras além do destaque
  const otherMasterGames = featuredGame 
    ? masterGames.filter(g => g.id !== featuredGame.id)
    : masterGames;

  const otherPlayerGames = featuredGame 
    ? playerGames.filter(p => p.game.id !== featuredGame.id)
    : playerGames;

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
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.2)]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Em Andamento
          </span>
        );
      case 'lobby':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase bg-amber-950/80 border border-amber-500/40 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.2)]">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            Lobby
          </span>
        );
      case 'paused':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-medium tracking-widest uppercase bg-stone-900/90 border border-stone-700/50 text-stone-300">
            <span className="w-1.5 h-1.5 rounded-full bg-stone-500" />
            Pausado
          </span>
        );
      case 'finished':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-medium tracking-widest uppercase bg-stone-950 border border-stone-800 text-stone-400">
            <CheckCircle2 size={11} className="text-stone-400" />
            Encerrado
          </span>
        );
    }
  };

  const isLoading = isMaster ? loadingMaster : loadingPlayer;
  const hasAnyGames = isMaster ? masterGames.length > 0 : playerGames.length > 0;
  // Contagem real total dos jogos do usuário no modo atual
  const totalGamesCount = isMaster ? masterGames.length : playerGames.length;

  return (
    <div className="relative min-h-full w-full pb-10 space-y-5 selection:bg-amber-500/30 selection:text-amber-200">
      
      {/* Camada de Profundidade & Iluminação de Fundo */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 w-72 h-72 bg-amber-600/5 rounded-full blur-3xl" />
        <div className="absolute top-1/3 right-10 w-64 h-64 bg-indigo-950/15 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-1/3 w-[400px] h-[220px] bg-amber-900/5 rounded-full blur-3xl" />
      </div>

      {/* Toast Flutuante */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 animate-in fade-in slide-in-from-top-3 duration-200">
          <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-[#0e1713] border border-emerald-500/40 text-emerald-200 shadow-2xl backdrop-blur-md">
            <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
            <span className="text-xs font-cinzel font-semibold tracking-wide">{toastMessage}</span>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 1. CABEÇALHO COMPACTO & IMERSIVO (1366x768 Otimizado)     */}
      {/* ========================================================= */}
      <header className="relative z-10 rounded-xl border border-amber-700/30 bg-[#0d0a08]/90 backdrop-blur-md overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.85)] px-4 py-3.5 sm:px-6 sm:py-4">
        {/* Cantoneiras ornamentais de metal/ouro envelhecido */}
        <CornerBracket position="top-left" className="text-amber-500/40" />
        <CornerBracket position="top-right" className="text-amber-500/40" />
        <CornerBracket position="bottom-left" className="text-amber-500/40" />
        <CornerBracket position="bottom-right" className="text-amber-500/40" />

        {/* Texturas e Linhas Divisórias Feudais */}
        <div className="absolute inset-0 bg-radial from-amber-500/5 via-transparent to-transparent pointer-events-none" />
        <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-amber-400/40 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-amber-800/30 to-transparent" />

        <div className="relative z-10 flex items-center justify-between gap-4">
          <div className="space-y-1 max-w-2xl">
            {/* Título Principal Compacto */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="text-amber-400 text-xl sm:text-2xl drop-shadow-[0_0_10px_rgba(245,158,11,0.5)]">
                {isMaster ? '⚔️' : '📖'}
              </span>
              <h1 className="text-xl sm:text-2xl font-cinzel font-black tracking-wider bg-gradient-to-b from-stone-100 via-amber-100 to-amber-300 bg-clip-text text-transparent">
                GRIMÓRIO {isMaster ? 'DO MESTRE' : 'DO JOGADOR'}
              </h1>
              <span className="text-stone-600 hidden xs:inline">•</span>
              <span className="text-[11px] font-mono text-amber-300/80 uppercase tracking-widest hidden xs:inline">
                {isMaster ? `${masterGames.length} ${masterGames.length === 1 ? 'Mesa' : 'Mesas'}` : `${playerGames.length} ${playerGames.length === 1 ? 'Aventura' : 'Aventuras'}`}
              </span>
            </div>
            
            {/* Frase temática concisa */}
            <p className="text-xs text-stone-400 font-serif italic line-clamp-1">
              {isMaster
                ? 'Governe crônicas vivas, forje destinos e comande seus heróis através de Arton.'
                : 'Abra os portais da sua imaginação. Seu legado e companheiros de armas o aguardam.'}
            </p>
          </div>

          {/* Selo / Brasão decorativo lateral compacto */}
          <div className="hidden md:flex items-center gap-3 px-3.5 py-1.5 rounded-lg bg-[#14100c] border border-amber-600/30 shrink-0">
            <div className="w-7 h-7 rounded-full bg-amber-950/70 border border-amber-500/40 flex items-center justify-center text-amber-400">
              {isMaster ? <Crown size={15} /> : <Shield size={15} />}
            </div>
            <div className="text-left">
              <div className="font-cinzel text-[11px] font-bold uppercase tracking-wider text-amber-200">
                {isMaster ? 'Mestre' : 'Jogador'}
              </div>
              <div className="text-[10px] text-stone-400 truncate max-w-[120px]">
                {profile?.name || user?.displayName || 'Aventureiro'}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ESTADO DE CARREGAMENTO */}
      {isLoading ? (
        <div className="relative z-10 py-16 text-center space-y-3">
          <div className="relative w-10 h-10 mx-auto">
            <div className="w-10 h-10 rounded-full border-2 border-amber-900/40 border-t-amber-400 animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Sparkles size={14} className="text-amber-400 animate-pulse" />
            </div>
          </div>
          <p className="text-xs font-cinzel text-amber-300/70 tracking-[0.2em] uppercase">
            Consultando anais arcanos do Grimório...
          </p>
        </div>
      ) : !hasAnyGames ? (
        /* ========================================================= */
        /* ESTADO VAZIO ELEGANTE                                     */
        /* ========================================================= */
        <div className="relative z-10 rounded-xl border border-amber-800/30 bg-[#0e0c0a]/90 backdrop-blur-md p-8 sm:p-12 text-center space-y-5 max-w-xl mx-auto shadow-2xl">
          <CornerBracket position="top-left" className="text-amber-500/30" />
          <CornerBracket position="bottom-right" className="text-amber-500/30" />

          <div className="w-14 h-14 rounded-xl bg-gradient-to-b from-amber-950/60 to-black border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.15)]">
            {isMaster ? <Sword size={26} /> : <ScrollText size={26} />}
          </div>

          <div className="space-y-1.5">
            <h3 className="text-lg sm:text-xl font-cinzel font-bold text-stone-100">
              {isMaster ? 'Nenhuma mesa de jogo forjada ainda' : 'Nenhuma aventura no seu diário'}
            </h3>
            <p className="text-xs text-stone-400 font-serif leading-relaxed max-w-md mx-auto">
              {isMaster
                ? 'Forje sua primeira mesa de jogo, convide seus companheiros e dê início a batalhas lendárias.'
                : 'Peça o código de convite ao seu Mestre para juntar-se à mesa e ingressar nesta jornada épica.'}
            </p>
          </div>

          <div className="pt-2">
            {isMaster ? (
              <button
                onClick={handleOpenCreateGame}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-400 text-stone-950 font-cinzel font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-[0_0_20px_rgba(245,158,11,0.3)] border border-amber-300/40 active:scale-95"
              >
                <Plus size={15} strokeWidth={2.5} />
                <span>+ CRIAR PRIMEIRO JOGO</span>
              </button>
            ) : (
              <button
                onClick={() => setIsJoinModalOpen(true)}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-400 text-stone-950 font-cinzel font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-[0_0_20px_rgba(245,158,11,0.3)] border border-amber-300/40 active:scale-95"
              >
                <LogIn size={15} strokeWidth={2.5} />
                <span>+ ENTRAR EM UM JOGO</span>
              </button>
            )}
          </div>
        </div>
      ) : (
        /* ========================================================= */
        /* UMA ÚNICA SEÇÃO: 🎲 MINHAS AVENTURAS                     */
        /* ========================================================= */
        <section className="relative z-10 space-y-4">
          
          {/* Cabeçalho da Seção com Contador Real e Ação Única (+ ENTRAR / + CRIAR) */}
          <div className="flex items-center justify-between gap-3 border-b border-amber-800/25 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-amber-950/60 border border-amber-600/30 flex items-center justify-center text-amber-400">
                <Compass size={15} />
              </div>
              <div className="flex items-baseline gap-2 flex-wrap">
                <h2 className="text-sm sm:text-base font-cinzel font-bold tracking-wider text-stone-100 uppercase flex items-center gap-1.5">
                  <span>🎲 MINHAS AVENTURAS</span>
                  <span className="text-amber-400 font-mono font-bold text-xs">
                    ({totalGamesCount})
                  </span>
                </h2>
                <span className="text-[11px] text-stone-400 font-serif hidden sm:inline">
                  {isMaster ? '— Mesas sob sua maestria' : '— Mesas em que seu personagem está participando'}
                </span>
              </div>
            </div>

            {/* Ação ÚNICA da seção: [ + ENTRAR EM UM JOGO ] / [ + CRIAR NOVO JOGO ] */}
            <div>
              {isMaster ? (
                <button
                  id="grimoire-create-game-btn"
                  onClick={handleOpenCreateGame}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-gradient-to-r from-amber-600/25 to-amber-700/15 hover:from-amber-600/35 hover:to-amber-700/25 border border-amber-600/40 hover:border-amber-400/60 text-amber-200 text-xs font-cinzel font-bold uppercase tracking-wider transition-all duration-200 shadow-sm active:scale-95 cursor-pointer whitespace-nowrap"
                >
                  <Plus size={14} className="text-amber-400" strokeWidth={2.5} />
                  <span>+ CRIAR NOVO JOGO</span>
                </button>
              ) : (
                <button
                  id="grimoire-join-game-btn"
                  onClick={() => setIsJoinModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-gradient-to-r from-amber-600/25 to-amber-700/15 hover:from-amber-600/35 hover:to-amber-700/25 border border-amber-600/40 hover:border-amber-400/60 text-amber-200 text-xs font-cinzel font-bold uppercase tracking-wider transition-all duration-200 shadow-sm active:scale-95 cursor-pointer whitespace-nowrap"
                >
                  <LogIn size={14} className="text-amber-400" strokeWidth={2.5} />
                  <span>+ ENTRAR EM UM JOGO</span>
                </button>
              )}
            </div>
          </div>

          {/* ========================================================= */}
          {/* 1. AVENTURA PRINCIPAL / ATIVA (RECEBE DESTAQUE)           */}
          {/* ========================================================= */}
          {featuredGame && (
            <div className="group relative rounded-xl border-2 border-amber-600/40 hover:border-amber-500/60 bg-[#0a0806] overflow-hidden shadow-[0_15px_40px_rgba(0,0,0,0.9)] transition-all duration-300">
              <CornerBracket position="top-left" className="text-amber-400/50" />
              <CornerBracket position="top-right" className="text-amber-400/50" />
              <CornerBracket position="bottom-left" className="text-amber-400/50" />
              <CornerBracket position="bottom-right" className="text-amber-400/50" />

              {/* IMAGEM DO MESTRE PROTAGONISTA: Fundo com Overlay para Legibilidade */}
              <div 
                className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 ease-out group-hover:scale-105 opacity-45 filter contrast-125"
                style={{
                  backgroundImage: `url(${featuredGame.coverUrl?.trim() ? featuredGame.coverUrl.trim() : DEFAULT_COVERS[0]})`
                }}
              />

              {/* Degradês Escuros Sobrepostos para Legibilidade Imersiva */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#080605] via-[#080605]/95 to-[#080605]/60" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#080605] via-[#080605]/40 to-transparent" />

              {/* Conteúdo Compacto do Card da Partida Ativa */}
              <div className="relative z-10 p-4 sm:p-6 lg:p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                <div className="space-y-3 max-w-2xl">
                  
                  {/* Badges de Status e Sistema */}
                  <div className="flex flex-wrap items-center gap-2">
                    {getStatusBadge(featuredGame.status)}
                    <span className="text-amber-600/50 text-xs">•</span>
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-serif font-semibold text-amber-300 uppercase px-2 py-0.5 rounded bg-black/60 border border-amber-700/30">
                      <Dice5 size={12} className="text-amber-400" />
                      {featuredGame.system || 'Tormenta 20'}
                    </span>
                    <span className="text-amber-600/50 text-xs">•</span>
                    <span className="text-[10px] font-cinzel text-amber-400/90 font-bold uppercase tracking-widest bg-amber-950/60 px-2 py-0.5 rounded border border-amber-600/30">
                      Partida Ativa
                    </span>
                  </div>

                  {/* Nome do Jogo e Mestre */}
                  <div className="space-y-1">
                    <h3 className="text-xl sm:text-2xl lg:text-3xl font-cinzel font-black tracking-wide text-stone-100 group-hover:text-amber-100 transition-colors flex items-center gap-2.5">
                      <span className="text-amber-400 text-lg sm:text-xl">⚔️</span>
                      <span>{featuredGame.name}</span>
                    </h3>

                    {featuredGame.description ? (
                      <p className="text-xs sm:text-sm text-stone-300 font-serif italic line-clamp-2 leading-relaxed">
                        « {featuredGame.description} »
                      </p>
                    ) : (
                      <p className="text-xs text-stone-400 font-serif italic">
                        {isMaster 
                          ? 'Mesa sob sua condução. Seus jogadores aguardam ordens.' 
                          : `Mesa comandada pelo Mestre ${featuredGame.masterName || 'Mestre da Mesa'}.`}
                      </p>
                    )}
                  </div>

                  {/* Metadados: Mestre e Convite */}
                  <div className="flex flex-wrap items-center gap-4 text-xs text-stone-300 pt-0.5">
                    <div className="flex items-center gap-1.5 font-cinzel text-[11px]">
                      <Users size={14} className="text-amber-400" />
                      <span>Mestre: <strong className="text-amber-100 font-bold">{featuredGame.masterName || 'Mestre da Mesa'}</strong></span>
                    </div>

                    {isMaster && (
                      <div className="flex items-center gap-1.5 font-mono text-[11px] bg-black/60 px-2.5 py-1 rounded border border-amber-800/30 text-stone-300">
                        <span className="text-stone-500">Convite:</span>
                        <span className="text-amber-300 font-bold tracking-widest">{featuredGame.inviteCode}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Botão ÚNICO de ação da partida ativa: [ CONTINUAR → ] */}
                <div className="shrink-0 w-full sm:w-auto flex items-center justify-end">
                  <button
                    onClick={() => navigate(`/campaigns/${featuredGame.campaignId}/games/${featuredGame.id}`)}
                    className="w-full sm:w-auto px-6 py-3 sm:py-3.5 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-400 text-stone-950 font-cinzel font-black text-xs sm:text-sm uppercase tracking-[0.15em] transition-all duration-300 shadow-[0_0_25px_rgba(245,158,11,0.35)] hover:shadow-[0_0_35px_rgba(245,158,11,0.5)] border border-amber-300/60 cursor-pointer flex items-center justify-center gap-2.5 active:scale-95 group/btn whitespace-nowrap"
                  >
                    <span>CONTINUAR</span>
                    <ChevronRight size={16} strokeWidth={3} className="transition-transform group-hover/btn:translate-x-1" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* 2. OUTRAS AVENTURAS (SE HOUVER)                           */}
          {/* ========================================================= */}
          {((isMaster && otherMasterGames.length > 0) || (!isMaster && otherPlayerGames.length > 0)) && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-2 text-xs font-cinzel font-bold text-stone-400 uppercase tracking-widest">
                <span>OUTRAS AVENTURAS</span>
                <div className="h-[1px] flex-1 bg-amber-900/30" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {isMaster
                  ? otherMasterGames.map((game, idx) => (
                      <div
                        key={game.id}
                        className="group relative rounded-xl border border-amber-900/30 bg-[#0e0c0a] hover:bg-[#13100d] overflow-hidden transition-all duration-300 hover:border-amber-600/50 hover:shadow-[0_8px_25px_rgba(0,0,0,0.8)] flex flex-col justify-between"
                      >
                        {/* Imagem do Mestre protagonista do card com degradê escuro */}
                        <div className="relative h-28 w-full overflow-hidden bg-stone-950">
                          <img 
                            src={game.coverUrl?.trim() ? game.coverUrl.trim() : DEFAULT_COVERS[(idx + 1) % DEFAULT_COVERS.length]} 
                            alt={game.name}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-70 filter contrast-110"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#0e0c0a] via-black/40 to-transparent" />
                          
                          {/* Badge de Status no topo da imagem */}
                          <div className="absolute top-2 right-2">
                            {getStatusBadge(game.status)}
                          </div>

                          {/* Sistema sobre a imagem */}
                          <div className="absolute bottom-1.5 left-2.5">
                            <span className="text-[10px] font-cinzel font-bold text-amber-300/90 tracking-widest uppercase px-2 py-0.5 rounded bg-black/75 border border-amber-800/40 backdrop-blur-xs">
                              {game.system || 'Tormenta 20'}
                            </span>
                          </div>
                        </div>

                        {/* Corpo Compacto do Card */}
                        <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between space-y-3">
                          <div className="space-y-1">
                            <h3 className="font-cinzel font-bold text-sm sm:text-base text-stone-100 group-hover:text-amber-200 transition-colors line-clamp-1">
                              {game.name}
                            </h3>

                            {game.description ? (
                              <p className="text-[11px] text-stone-400 font-serif italic line-clamp-1 leading-relaxed">
                                « {game.description} »
                              </p>
                            ) : null}

                            <div className="text-[11px] font-serif text-stone-400 pt-0.5 flex items-center justify-between">
                              <span>Mestre: <strong className="text-stone-200 font-cinzel">{game.masterName || 'Você'}</strong></span>
                              <span className="font-mono text-stone-500 text-[10px]">{game.inviteCode}</span>
                            </div>
                          </div>

                          {/* Ação ÚNICA por Card Secundário: [ ABRIR ] */}
                          <div className="pt-2 border-t border-amber-900/20 flex items-center justify-end">
                            <button
                              onClick={() => navigate(`/campaigns/${game.campaignId}/games/${game.id}`)}
                              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-amber-950/60 hover:bg-amber-900/80 border border-amber-600/40 hover:border-amber-400/70 text-amber-200 text-xs font-cinzel font-bold tracking-wider uppercase transition-all duration-200 cursor-pointer shadow-sm group-hover:text-amber-100"
                            >
                              <span>ABRIR</span>
                              <ChevronRight size={13} className="text-amber-400 transition-transform group-hover:translate-x-0.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  : otherPlayerGames.map(({ game, player }, idx) => (
                      <div
                        key={player.id}
                        className="group relative rounded-xl border border-amber-900/30 bg-[#0e0c0a] hover:bg-[#13100d] overflow-hidden transition-all duration-300 hover:border-amber-600/50 hover:shadow-[0_8px_25px_rgba(0,0,0,0.8)] flex flex-col justify-between"
                      >
                        {/* Imagem do Mestre protagonista do card com degradê escuro */}
                        <div className="relative h-28 w-full overflow-hidden bg-stone-950">
                          <img 
                            src={game.coverUrl?.trim() ? game.coverUrl.trim() : DEFAULT_COVERS[(idx + 1) % DEFAULT_COVERS.length]} 
                            alt={game.name}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-70 filter contrast-110"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#0e0c0a] via-black/40 to-transparent" />
                          
                          {/* Badge de Status no topo da imagem */}
                          <div className="absolute top-2 right-2">
                            {getStatusBadge(game.status)}
                          </div>

                          {/* Sistema sobre a imagem */}
                          <div className="absolute bottom-1.5 left-2.5">
                            <span className="text-[10px] font-cinzel font-bold text-amber-300/90 tracking-widest uppercase px-2 py-0.5 rounded bg-black/75 border border-amber-800/40 backdrop-blur-xs">
                              {game.system || 'Tormenta 20'}
                            </span>
                          </div>
                        </div>

                        {/* Corpo Compacto do Card */}
                        <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between space-y-3">
                          <div className="space-y-1">
                            <h3 className="font-cinzel font-bold text-sm sm:text-base text-stone-100 group-hover:text-amber-200 transition-colors line-clamp-1">
                              {game.name}
                            </h3>

                            <div className="text-[11px] font-serif text-stone-400 space-y-0.5">
                              <p>
                                Mestre: <strong className="text-stone-200 font-cinzel">{game.masterName || 'Mestre da Mesa'}</strong>
                              </p>
                              <p className="text-amber-300/90 font-cinzel">
                                Personagem: <strong className="text-amber-200">{player.displayName}</strong>
                              </p>
                            </div>
                          </div>

                          {/* Ação ÚNICA por Card Secundário: [ ABRIR ] */}
                          <div className="pt-2 border-t border-amber-900/20 flex items-center justify-end">
                            <button
                              onClick={() => navigate(`/campaigns/${game.campaignId}/games/${game.id}`)}
                              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-amber-950/60 hover:bg-amber-900/80 border border-amber-600/40 hover:border-amber-400/70 text-amber-200 text-xs font-cinzel font-bold tracking-wider uppercase transition-all duration-200 cursor-pointer shadow-sm group-hover:text-amber-100"
                            >
                              <span>ABRIR</span>
                              <ChevronRight size={13} className="text-amber-400 transition-transform group-hover:translate-x-0.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
              </div>
            </div>
          )}
        </section>
      )}

      {/* ========================================================= */}
      {/* MODAL [ + ENTRAR EM UM JOGO ] (CÓDIGO DE CONVITE)         */}
      {/* ========================================================= */}
      {isJoinModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl border-2 border-amber-600/40 bg-[#0d0a08] p-6 sm:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.9)] space-y-6 relative">
            <CornerBracket position="top-left" className="text-amber-500/50" />
            <CornerBracket position="top-right" className="text-amber-500/50" />
            <CornerBracket position="bottom-left" className="text-amber-500/50" />
            <CornerBracket position="bottom-right" className="text-amber-500/50" />

            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-xl bg-amber-950/60 border border-amber-500/40 flex items-center justify-center mx-auto text-amber-400">
                <LogIn size={22} />
              </div>
              <h3 className="text-xl font-cinzel font-bold text-amber-100 tracking-wide uppercase">
                ⚔️ Entrar em um Jogo
              </h3>
              <p className="text-xs text-stone-400 font-serif">
                Insira o selo ou código rúnico de convite fornecido pelo seu Mestre
              </p>
            </div>

            <form onSubmit={handleJoinByCode} className="space-y-5">
              {joinError && (
                <div className="p-3.5 rounded-xl bg-red-950/70 border border-red-800/60 text-red-300 text-xs font-serif flex items-center gap-2.5">
                  <AlertCircle size={16} className="shrink-0 text-red-400" />
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
                  className="w-full text-center text-2xl font-mono font-bold tracking-[0.25em] uppercase py-3.5 px-4 rounded-xl bg-[#060504] border-2 border-amber-600/50 text-amber-300 focus:outline-none focus:border-amber-400 placeholder:text-stone-700 shadow-inner"
                  autoFocus
                />
              </div>

              <div className="space-y-2.5 pt-2">
                <button
                  type="submit"
                  disabled={isJoining || !inviteCodeInput.trim()}
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-400 text-stone-950 font-cinzel font-bold text-xs uppercase tracking-[0.15em] shadow-lg border border-amber-300/50 transition-all active:scale-95 cursor-pointer disabled:opacity-50"
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
                  className="w-full py-2.5 px-4 rounded-xl text-stone-400 hover:text-stone-200 text-xs font-cinzel uppercase tracking-wider transition-colors cursor-pointer"
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
