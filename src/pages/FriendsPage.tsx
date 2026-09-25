import React, { useState, useMemo } from 'react';
import { 
  Users, 
  UserPlus, 
  Search, 
  X, 
  ChevronRight, 
  Check, 
  Clock, 
  Loader2, 
  UserCheck, 
  UserX,
  Sparkles
} from 'lucide-react';
import { useFriendship } from '../context/FriendshipContext';
import { useAuth } from '../context/AuthContext';
import { FriendshipService } from '../services/friendshipService';
import { UserSummary } from '../types/friends';
import { FriendProfileModal } from '../components/friends/FriendProfileModal';

type FriendsTab = 'friends' | 'requests' | 'add';

// Componente do Brasão / Estandarte Heráldico perfeitamente escalado para caber na tela sem rolagem
const HeraldicBanner: React.FC = () => (
  <div className="relative w-24 h-24 sm:w-32 sm:h-32 flex items-center justify-center select-none pointer-events-none shrink-0 my-0.5">
    {/* Círculos e runas de fundo */}
    <div className="absolute inset-0 flex items-center justify-center opacity-30">
      <div className="w-22 h-22 sm:w-28 sm:h-28 rounded-full border border-amber-500/40 border-dashed animate-[spin_60s_linear_infinite]" />
      <div className="absolute w-18 h-18 sm:w-24 sm:h-24 rounded-full border border-amber-500/30" />
      <div className="absolute w-24 h-24 sm:w-30 sm:h-30 rounded-full border border-amber-500/20" />
      {/* Raios da bússola */}
      <div className="absolute w-full h-[1px] bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />
      <div className="absolute h-full w-[1px] bg-gradient-to-b from-transparent via-amber-500/30 to-transparent" />
    </div>

    {/* Glow dourado suave central */}
    <div className="absolute w-16 h-16 bg-amber-500/15 rounded-full blur-lg" />

    {/* Estandarte / Brasão Medieval em Vetor SVG de Alta Fidelidade */}
    <svg 
      viewBox="0 0 200 240" 
      className="w-20 h-24 sm:w-26 sm:h-30 drop-shadow-[0_6px_16px_rgba(0,0,0,0.9)] relative z-10"
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Empunhadura da espada no topo */}
      <path d="M100 8V35" stroke="#d4af37" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M92 18H108" stroke="#d4af37" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="100" cy="10" r="2.5" fill="#fef08a" stroke="#d4af37" strokeWidth="1" />
      <path d="M100 22L97 27H103L100 22Z" fill="#d4af37" />

      {/* Barra transversal dourada de suporte do estandarte */}
      <rect x="35" y="34" width="130" height="5" rx="2" fill="url(#goldGradientH)" stroke="#92400e" strokeWidth="1" />
      {/* Ponteiras ornamentais da barra */}
      <path d="M35 36.5L25 31V42L35 36.5Z" fill="url(#goldGradientH)" stroke="#92400e" strokeWidth="0.8" />
      <path d="M165 36.5L175 31V42L165 36.5Z" fill="url(#goldGradientH)" stroke="#92400e" strokeWidth="0.8" />

      {/* Cordas / amarras do estandarte */}
      <path d="M48 34V40M152 34V40M100 34V40" stroke="#fde68a" strokeWidth="1.5" />

      {/* Corpo do Estandarte (Fundo Preto com Textura e Borda Dourada) */}
      <path 
        d="M48 40H152V145L100 185L48 145V40Z" 
        fill="#0c0d11" 
        stroke="url(#goldGradientV)" 
        strokeWidth="3.5" 
      />
      {/* Borda interna decorativa */}
      <path 
        d="M54 46H146V141L100 176L54 141V46Z" 
        fill="#08090b" 
        stroke="#78350f" 
        strokeWidth="1.2" 
      />

      {/* Franja / Recorte inferior estilizado */}
      <path d="M100 185L100 200" stroke="#d4af37" strokeWidth="1.5" strokeDasharray="2 2" />

      {/* Estrela / Sigil Radiante Central de 8 Pontas */}
      <g transform="translate(100, 105)">
        {/* Losango de base */}
        <path d="M0 -36L9 -12L36 0L9 12L0 36L-9 12L-36 0L-9 -12Z" fill="url(#goldStarGradient)" stroke="#fef08a" strokeWidth="1" />
        {/* Raios diagonais menores */}
        <path d="M0 -22L16 -16L22 0L16 16L0 22L-16 16L-22 0L-16 -16Z" fill="#92400e" stroke="#d4af37" strokeWidth="0.8" />
        {/* Núcleo brilhante central */}
        <circle cx="0" cy="0" r="3" fill="#ffffff" />
      </g>

      {/* Gradientes SVG */}
      <defs>
        <linearGradient id="goldGradientH" x1="25" y1="36.5" x2="175" y2="36.5" gradientUnits="userSpaceOnUse">
          <stop stopColor="#92400e" />
          <stop offset="0.3" stopColor="#fde68a" />
          <stop offset="0.5" stopColor="#d4af37" />
          <stop offset="0.7" stopColor="#fde68a" />
          <stop offset="1" stopColor="#92400e" />
        </linearGradient>
        <linearGradient id="goldGradientV" x1="100" y1="40" x2="100" y2="185" gradientUnits="userSpaceOnUse">
          <stop stopColor="#fde68a" />
          <stop offset="0.4" stopColor="#d4af37" />
          <stop offset="0.8" stopColor="#b45309" />
          <stop offset="1" stopColor="#78350f" />
        </linearGradient>
        <linearGradient id="goldStarGradient" x1="0" y1="-36" x2="0" y2="36" gradientUnits="userSpaceOnUse">
          <stop stopColor="#fffbeb" />
          <stop offset="0.4" stopColor="#f59e0b" />
          <stop offset="1" stopColor="#78350f" />
        </linearGradient>
      </defs>
    </svg>
  </div>
);

export const FriendsPage: React.FC = () => {
  const { user } = useAuth();
  const { 
    friends, 
    incomingRequests, 
    outgoingRequests, 
    pendingCount, 
    loading, 
    sendRequest, 
    acceptRequest, 
    rejectRequest, 
    cancelRequest 
  } = useFriendship();

  const [activeTab, setActiveTab] = useState<FriendsTab>('friends');
  const [filterQuery, setFilterQuery] = useState('');
  
  // Tab Adicionar: busca de jogadores
  const [searchPlayerTerm, setSearchPlayerTerm] = useState('');
  const [searchResults, setSearchResults] = useState<UserSummary[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Modal de perfil
  const [selectedUserSummary, setSelectedUserSummary] = useState<UserSummary | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Ações em andamento
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  // Filtragem dos amigos
  const filteredFriends = useMemo(() => {
    if (!filterQuery.trim()) return friends;
    const q = filterQuery.toLowerCase();
    return friends.filter(f => 
      (f.friendUser.name || '').toLowerCase().includes(q) ||
      (f.friendUser.displayName || '').toLowerCase().includes(q) ||
      (f.friendUser.mainCharacterName || '').toLowerCase().includes(q) ||
      (f.friendUser.mainCharacterClass || '').toLowerCase().includes(q)
    );
  }, [friends, filterQuery]);

  // Busca de jogadores
  const handleSearchPlayers = async (termToSearch: string) => {
    if (!termToSearch.trim() || termToSearch.trim().length < 2) {
      setSearchResults([]);
      setHasSearched(false);
      return;
    }

    setIsSearching(true);
    setHasSearched(true);

    try {
      const results = await FriendshipService.searchPlayers(termToSearch, user?.uid || '');
      setSearchResults(results);
    } catch (err) {
      console.error('Erro na busca de jogadores:', err);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleOpenProfile = (userSummary: UserSummary) => {
    setSelectedUserSummary(userSummary);
    setIsProfileModalOpen(true);
  };

  const handleSendRequest = async (targetUser: UserSummary) => {
    setActionInProgress(targetUser.uid);
    try {
      await sendRequest(targetUser);
    } catch (err) {
      console.error(err);
    } finally {
      setActionInProgress(null);
    }
  };

  const handleAcceptRequest = async (friendshipId: string) => {
    setActionInProgress(friendshipId);
    try {
      await acceptRequest(friendshipId);
    } catch (err) {
      console.error(err);
    } finally {
      setActionInProgress(null);
    }
  };

  const handleRejectRequest = async (friendshipId: string) => {
    setActionInProgress(friendshipId);
    try {
      await rejectRequest(friendshipId);
    } catch (err) {
      console.error(err);
    } finally {
      setActionInProgress(null);
    }
  };

  const handleCancelRequest = async (friendshipId: string) => {
    setActionInProgress(friendshipId);
    try {
      await cancelRequest(friendshipId);
    } catch (err) {
      console.error(err);
    } finally {
      setActionInProgress(null);
    }
  };

  const friendUids = useMemo(() => new Set(friends.map(f => f.friendUser.uid)), [friends]);
  const outgoingUids = useMemo(() => new Set(outgoingRequests.map(r => r.receiverId)), [outgoingRequests]);
  const incomingUids = useMemo(() => new Set(incomingRequests.map(r => r.requesterId)), [incomingRequests]);

  const isEmptyFriendsState = activeTab === 'friends' && !loading && friends.length === 0;

  return (
    <div className={`w-full max-w-lg mx-auto flex flex-col h-full animate-in fade-in duration-300 ${
      isEmptyFriendsState ? 'flex-1 justify-between min-h-0 py-0.5' : 'space-y-2.5 sm:space-y-3 py-1'
    }`}>
      {/* 1. Header do Título */}
      <div className="flex flex-col items-center text-center space-y-0.5 relative pt-0.5 select-none shrink-0">
        {/* Diamante decorativo superior */}
        <div className="flex items-center justify-center">
          <span className="w-1.5 h-1.5 rotate-45 bg-amber-400/90 border border-amber-300/80 shadow-[0_0_6px_rgba(245,158,11,0.8)]" />
        </div>

        {/* Título AMIGOS ladeado por linhas douradas finas */}
        <div className="flex items-center justify-center gap-2.5 sm:gap-3 w-full">
          <span className="flex-1 max-w-[45px] sm:max-w-[70px] h-[1px] bg-gradient-to-r from-transparent to-amber-500/70" />
          
          <h1 className="text-lg sm:text-2xl font-cinzel font-black tracking-[0.15em] uppercase text-transparent bg-clip-text bg-gradient-to-b from-[#fffbeb] via-[#fde68a] to-[#d97706] drop-shadow-[0_2px_10px_rgba(212,175,55,0.4)] leading-tight">
            AMIGOS
          </h1>
          
          <span className="flex-1 max-w-[45px] sm:max-w-[70px] h-[1px] bg-gradient-to-l from-transparent to-amber-500/70" />
        </div>

        {/* Subtítulo em caixa alta dourada */}
        <p className="text-[9px] sm:text-[10px] font-cinzel font-semibold text-[#c59a52] tracking-[0.15em] sm:tracking-[0.2em] uppercase">
          CONECTE-SE COM OUTROS AVENTUREIROS DE ARTÓN.
        </p>
      </div>

      {/* 2. Campo de Busca */}
      <div className="relative w-full shrink-0">
        <div className="relative flex items-center bg-[#0d0e12] border border-amber-600/40 focus-within:border-amber-400 rounded-lg h-9 sm:h-10 px-3 shadow-inner transition-colors group">
          <Search 
            size={15} 
            className="text-amber-500/80 group-focus-within:text-amber-300 transition-colors pointer-events-none shrink-0 mr-2" 
          />
          <input
            type="text"
            value={activeTab === 'add' ? searchPlayerTerm : filterQuery}
            onChange={(e) => {
              if (activeTab === 'add') {
                setSearchPlayerTerm(e.target.value);
                handleSearchPlayers(e.target.value);
              } else {
                setFilterQuery(e.target.value);
              }
            }}
            placeholder="Buscar jogador entre seus amigos..."
            className="w-full bg-transparent text-stone-100 placeholder-[#78716c] text-xs sm:text-sm font-sans outline-none"
          />

          {(activeTab === 'add' ? searchPlayerTerm : filterQuery) && (
            <button
              onClick={() => {
                if (activeTab === 'add') {
                  setSearchPlayerTerm('');
                  setSearchResults([]);
                  setHasSearched(false);
                } else {
                  setFilterQuery('');
                }
              }}
              className="p-1 text-stone-500 hover:text-stone-300 cursor-pointer mr-1"
            >
              <X size={13} />
            </button>
          )}

          {/* Ícone de Estrela / Sigil à direita com divisor vertical */}
          <div className="flex items-center pl-2 border-l border-amber-600/30 shrink-0 text-amber-500/70">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5L12 0Z" />
            </svg>
          </div>
        </div>
      </div>

      {/* 3. Componente de Abas */}
      <div className="relative w-full shrink-0">
        <div className="flex items-center justify-between gap-1 p-0.5 rounded-lg border-b border-amber-900/40 relative">
          {/* Aba 1: AMIGOS */}
          <button
            onClick={() => setActiveTab('friends')}
            className={`flex-1 py-1 px-1.5 sm:px-2 rounded-md text-[10px] sm:text-xs font-cinzel uppercase font-bold tracking-wider transition-all duration-150 cursor-pointer flex items-center justify-center gap-1 relative ${
              activeTab === 'friends'
                ? 'bg-gradient-to-r from-[#d97706] via-[#f59e0b] to-[#d97706] text-black shadow-[0_0_12px_rgba(245,158,11,0.5)] border border-amber-200'
                : 'text-stone-400 hover:text-amber-200 hover:bg-stone-900/40'
            }`}
          >
            <Users size={14} strokeWidth={activeTab === 'friends' ? 2.5 : 1.8} className={activeTab === 'friends' ? 'text-black' : 'text-stone-400'} />
            <span className={activeTab === 'friends' ? 'font-black text-black' : 'font-medium'}>
              AMIGOS
            </span>
            <span className={`text-[9px] font-bold px-1.5 py-0.1 rounded-full leading-tight ${
              activeTab === 'friends' ? 'bg-black text-amber-300' : 'bg-stone-900 text-stone-400 border border-stone-800'
            }`}>
              {friends.length}
            </span>
          </button>

          <span className="w-[1px] h-3.5 bg-amber-900/30" />

          {/* Aba 2: SOLICITAÇÕES */}
          <button
            onClick={() => setActiveTab('requests')}
            className={`flex-1 py-1 px-1.5 sm:px-2 rounded-md text-[10px] sm:text-xs font-cinzel uppercase tracking-wider transition-all duration-150 cursor-pointer flex items-center justify-center gap-1 relative ${
              activeTab === 'requests'
                ? 'bg-gradient-to-r from-[#d97706] via-[#f59e0b] to-[#d97706] text-black shadow-[0_0_12px_rgba(245,158,11,0.5)] border border-amber-200 font-bold'
                : 'text-stone-400 hover:text-amber-200 hover:bg-stone-900/40'
            }`}
          >
            <Clock size={14} strokeWidth={activeTab === 'requests' ? 2.5 : 1.8} className={activeTab === 'requests' ? 'text-black' : 'text-stone-400'} />
            <span className={activeTab === 'requests' ? 'font-black text-black' : 'font-medium'}>
              SOLICITAÇÕES
            </span>
            {pendingCount > 0 && (
              <span className={`w-3.5 h-3.5 rounded-full text-[8px] font-sans font-bold flex items-center justify-center ${
                activeTab === 'requests' ? 'bg-black text-rose-400' : 'bg-rose-500 text-white animate-pulse'
              }`}>
                {pendingCount}
              </span>
            )}
          </button>

          <span className="w-[1px] h-3.5 bg-amber-900/30" />

          {/* Aba 3: ADICIONAR */}
          <button
            onClick={() => setActiveTab('add')}
            className={`flex-1 py-1 px-1.5 sm:px-2 rounded-md text-[10px] sm:text-xs font-cinzel uppercase tracking-wider transition-all duration-150 cursor-pointer flex items-center justify-center gap-1 relative ${
              activeTab === 'add'
                ? 'bg-gradient-to-r from-[#d97706] via-[#f59e0b] to-[#d97706] text-black shadow-[0_0_12px_rgba(245,158,11,0.5)] border border-amber-200 font-bold'
                : 'text-stone-400 hover:text-amber-200 hover:bg-stone-900/40'
            }`}
          >
            <UserPlus size={14} strokeWidth={activeTab === 'add' ? 2.5 : 1.8} className={activeTab === 'add' ? 'text-black' : 'text-stone-400'} />
            <span className={activeTab === 'add' ? 'font-black text-black' : 'font-medium'}>
              ADICIONAR
            </span>
          </button>
        </div>

        {/* Diamante inferior central da barra de abas */}
        <div className="flex items-center justify-center -mt-1">
          <span className="w-1.5 h-1.5 rotate-45 bg-amber-400/80 border border-amber-300" />
        </div>
      </div>

      {/* 4. Conteúdo Principal */}

      {/* ABA 1: AMIGOS */}
      {activeTab === 'friends' && (
        <div className="flex-1 flex flex-col justify-center min-h-0">
          {loading ? (
            <div className="py-8 text-center space-y-2">
              <Loader2 size={22} className="animate-spin text-amber-400 mx-auto" />
              <p className="text-xs font-cinzel text-stone-400 uppercase tracking-wider">
                Consultando aventureiros...
              </p>
            </div>
          ) : friends.length === 0 ? (
            /* ESTADO SEM AMIGOS — ENQUADRAMENTO PERFEITO 100% VISÍVEL */
            <div className="flex-1 flex flex-col items-center justify-evenly text-center my-auto py-1 select-none animate-in fade-in duration-300 min-h-0">
              {/* Estandarte Heráldico Central */}
              <HeraldicBanner />

              {/* Diamante decorativo abaixo do estandarte */}
              <div className="flex items-center justify-center -my-0.5">
                <span className="w-1.5 h-1.5 rotate-45 bg-amber-400/90 border border-amber-300/80 shadow-[0_0_6px_rgba(245,158,11,0.8)]" />
              </div>

              {/* Mensagem Principal */}
              <div className="space-y-0.5 px-2">
                <h2 className="text-base sm:text-lg font-cinzel font-black tracking-[0.15em] uppercase text-transparent bg-clip-text bg-gradient-to-b from-[#fffbeb] via-[#fde68a] to-[#d97706] drop-shadow-[0_2px_12px_rgba(212,175,55,0.4)] leading-tight">
                  VOCÊ AINDA NÃO POSSUI<br />AMIGOS.
                </h2>
                
                <p className="text-[11px] sm:text-xs text-stone-400 font-sans tracking-wide pt-0.5">
                  Encontre outros aventureiros e comece<br />sua jornada.
                </p>
              </div>

              {/* Botão Cartela Medieval [ 👤+ ENCONTRAR JOGADORES ] */}
              <div className="w-full max-w-xs px-3 pt-0.5">
                <button
                  onClick={() => setActiveTab('add')}
                  className="w-full relative group py-2 px-4 bg-[#0b0c0f] hover:bg-[#12141a] border-2 border-amber-500/80 hover:border-amber-400 rounded-lg text-amber-200 hover:text-amber-100 font-cinzel text-xs font-bold tracking-[0.14em] uppercase transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(212,175,55,0.2)] hover:shadow-[0_0_20px_rgba(212,175,55,0.35)] active:scale-[0.98]"
                >
                  <span className="absolute -top-1 -left-1 w-1.5 h-1.5 border-t-2 border-l-2 border-amber-300" />
                  <span className="absolute -top-1 -right-1 w-1.5 h-1.5 border-t-2 border-r-2 border-amber-300" />
                  <span className="absolute -bottom-1 -left-1 w-1.5 h-1.5 border-b-2 border-l-2 border-amber-300" />
                  <span className="absolute -bottom-1 -right-1 w-1.5 h-1.5 border-b-2 border-r-2 border-amber-300" />

                  <UserPlus size={14} className="text-amber-400 group-hover:scale-110 transition-transform" />
                  <span>ENCONTRAR JOGADORES</span>
                </button>
              </div>
            </div>
          ) : (
            /* Lista de Amigos quando já existem amigos */
            <div className="w-full divide-y divide-stone-800/40 overflow-y-auto max-h-[calc(100dvh-15rem)] custom-scrollbar">
              {filteredFriends.map(({ friendshipId, friendUser, isOnline }) => (
                <div
                  key={friendshipId}
                  onClick={() => handleOpenProfile(friendUser)}
                  className="group flex items-center justify-between py-2.5 px-1 sm:px-2 hover:bg-white/[0.02] active:bg-white/[0.04] transition-colors duration-150 cursor-pointer select-none"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1 pr-2">
                    <div className="relative shrink-0">
                      {friendUser.photoURL ? (
                        <img 
                          src={friendUser.photoURL} 
                          alt={friendUser.name} 
                          className="w-10 h-10 rounded-lg border border-amber-600/30 object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-[#0d0e12] border border-amber-600/40 flex items-center justify-center text-amber-300 font-cinzel font-bold text-sm">
                          {friendUser.name?.[0]?.toUpperCase() || 'A'}
                        </div>
                      )}
                      <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-stone-950 ${
                        isOnline ? 'bg-emerald-400' : 'bg-stone-600'
                      }`} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-sm text-stone-100 group-hover:text-amber-300 transition-colors truncate">
                        {friendUser.name || friendUser.displayName}
                      </h3>

                      <p className="text-xs text-stone-400 font-sans tracking-tight truncate">
                        {friendUser.mainCharacterName || 'Aventureiro de Arton'}
                      </p>

                      <div className="flex items-center gap-1 mt-0.5">
                        <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-400' : 'bg-stone-500'}`} />
                        <span className={`text-[10px] font-sans ${isOnline ? 'text-emerald-400 font-medium' : 'text-stone-500'}`}>
                          {isOnline ? 'Online' : 'Offline'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center text-stone-600 group-hover:text-amber-300 transition-colors">
                    <ChevronRight size={16} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ABA 2: SOLICITAÇÕES */}
      {activeTab === 'requests' && (
        <div className="space-y-3 pt-1 overflow-y-auto max-h-[calc(100dvh-18rem)] custom-scrollbar">
          <div className="space-y-2">
            <h3 className="font-cinzel text-xs font-bold uppercase tracking-wider text-amber-400 px-1">
              Solicitações Recebidas ({incomingRequests.length})
            </h3>

            {incomingRequests.length === 0 ? (
              <div className="py-8 text-center space-y-1.5 px-4 bg-[#0d0e12]/80 rounded-xl border border-stone-800/60">
                <UserCheck size={20} className="mx-auto text-stone-600" />
                <p className="text-xs font-cinzel text-stone-400">
                  Você não possui novas solicitações.
                </p>
              </div>
            ) : (
              <div className="w-full space-y-1.5">
                {incomingRequests.map((req) => {
                  const requester = req.requesterData || { uid: req.requesterId, name: 'Aventureiro' };
                  const isProcessing = actionInProgress === req.id;

                  return (
                    <div
                      key={req.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-2.5 rounded-xl bg-[#0d0e12] border border-stone-800/80 gap-2.5"
                    >
                      <div 
                        onClick={() => handleOpenProfile(requester)}
                        className="flex items-center gap-2.5 min-w-0 cursor-pointer flex-1"
                      >
                        {requester.photoURL ? (
                          <img 
                            src={requester.photoURL} 
                            alt={requester.name} 
                            className="w-9 h-9 rounded-lg border border-stone-800 object-cover shrink-0" 
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-lg bg-stone-900 border border-stone-800 flex items-center justify-center text-amber-300 font-cinzel font-bold text-xs shrink-0">
                            {requester.name?.[0]?.toUpperCase() || 'A'}
                          </div>
                        )}
                        <div className="min-w-0">
                          <h4 className="font-bold text-xs sm:text-sm text-stone-100 truncate">
                            {requester.name || requester.displayName}
                          </h4>
                          <p className="text-[11px] text-stone-400 truncate">
                            Deseja se conectar com você
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleAcceptRequest(req.id)}
                          disabled={isProcessing}
                          className="flex-1 sm:flex-none py-1.5 px-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 font-cinzel text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-1"
                        >
                          {isProcessing ? <Loader2 size={12} className="animate-spin" /> : <><Check size={13} /> Aceitar</>}
                        </button>
                        <button
                          onClick={() => handleRejectRequest(req.id)}
                          disabled={isProcessing}
                          className="flex-1 sm:flex-none py-1.5 px-2.5 rounded-lg border border-stone-800 hover:border-stone-700 text-stone-400 hover:text-stone-200 font-cinzel text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer"
                        >
                          Recusar
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {outgoingRequests.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-stone-800/60">
              <h3 className="font-cinzel text-xs font-bold uppercase tracking-wider text-stone-400 px-1">
                Solicitações Enviadas ({outgoingRequests.length})
              </h3>

              <div className="w-full space-y-1">
                {outgoingRequests.map((req) => {
                  const receiver = req.receiverData || { uid: req.receiverId, name: 'Aventureiro' };
                  const isProcessing = actionInProgress === req.id;

                  return (
                    <div
                      key={req.id}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-[#0d0e12]/60 border border-stone-800/60"
                    >
                      <div 
                        onClick={() => handleOpenProfile(receiver)}
                        className="flex items-center gap-2.5 min-w-0 cursor-pointer flex-1 pr-2"
                      >
                        {receiver.photoURL ? (
                          <img 
                            src={receiver.photoURL} 
                            alt={receiver.name} 
                            className="w-8 h-8 rounded-lg border border-stone-800 object-cover shrink-0" 
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-lg bg-stone-900 border border-stone-800 flex items-center justify-center text-amber-300 font-cinzel font-bold text-xs shrink-0">
                            {receiver.name?.[0]?.toUpperCase() || 'A'}
                          </div>
                        )}
                        <div className="min-w-0">
                          <h4 className="font-bold text-xs text-stone-200 truncate">
                            {receiver.name || receiver.displayName}
                          </h4>
                          <span className="text-[10px] text-amber-400/80 flex items-center gap-1 font-sans">
                            <Clock size={10} />
                            Solicitação enviada
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleCancelRequest(req.id)}
                        disabled={isProcessing}
                        className="py-1 px-2 rounded-md border border-stone-800 hover:border-stone-700 text-stone-500 hover:text-stone-300 font-cinzel text-[10px] uppercase font-semibold transition-colors cursor-pointer shrink-0"
                      >
                        {isProcessing ? <Loader2 size={11} className="animate-spin" /> : 'Cancelar'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ABA 3: ADICIONAR */}
      {activeTab === 'add' && (
        <div className="space-y-3 pt-1 overflow-y-auto max-h-[calc(100dvh-18rem)] custom-scrollbar">
          {isSearching ? (
            <div className="py-10 text-center space-y-2">
              <Loader2 size={20} className="animate-spin text-amber-400 mx-auto" />
              <p className="text-xs font-cinzel text-stone-400 uppercase tracking-wider">
                Buscando em Arton...
              </p>
            </div>
          ) : hasSearched && searchResults.length === 0 ? (
            <div className="py-10 text-center space-y-2 px-4 bg-[#0d0e12] rounded-xl border border-stone-800/60">
              <UserX size={22} className="mx-auto text-stone-600" />
              <h4 className="font-cinzel text-xs font-bold text-stone-300">
                Nenhum jogador encontrado
              </h4>
              <p className="text-[11px] text-stone-500 font-sans max-w-xs mx-auto">
                Não encontramos nenhum aventureiro com o termo informado.
              </p>
            </div>
          ) : (
            <div className="w-full space-y-1">
              {searchResults.map((target) => {
                const isFriend = friendUids.has(target.uid);
                const isOutgoing = outgoingUids.has(target.uid);
                const isIncoming = incomingUids.has(target.uid);
                const isBusy = actionInProgress === target.uid;

                return (
                  <div
                    key={target.uid}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-[#0d0e12] border border-stone-800/80 gap-2.5"
                  >
                    <div 
                      onClick={() => handleOpenProfile(target)}
                      className="flex items-center gap-2.5 min-w-0 flex-1 cursor-pointer"
                    >
                      {target.photoURL ? (
                        <img 
                          src={target.photoURL} 
                          alt={target.name} 
                          className="w-9 h-9 rounded-lg border border-stone-800 object-cover shrink-0" 
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-lg bg-stone-900 border border-stone-800 flex items-center justify-center text-amber-300 font-cinzel font-bold text-xs shrink-0">
                          {target.name?.[0]?.toUpperCase() || 'A'}
                        </div>
                      )}
                      <div className="min-w-0">
                        <h4 className="font-bold text-xs sm:text-sm text-stone-100 truncate">
                          {target.name || target.displayName}
                        </h4>
                        <p className="text-[11px] text-stone-400 truncate">
                          {target.mainCharacterName || 'Aventureiro'}
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0">
                      {isFriend ? (
                        <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/40 text-amber-300 font-cinzel text-[11px] font-bold uppercase tracking-wider inline-flex items-center gap-1">
                          <Check size={12} />
                          Amigo
                        </span>
                      ) : isOutgoing ? (
                        <span className="px-2.5 py-1 rounded-lg bg-stone-900 border border-stone-800 text-stone-400 font-cinzel text-[11px] font-medium uppercase tracking-wider inline-flex items-center gap-1">
                          <Clock size={12} />
                          Enviada
                        </span>
                      ) : isIncoming ? (
                        <button
                          onClick={() => setActiveTab('requests')}
                          className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 font-cinzel text-[11px] font-bold uppercase tracking-wider transition-colors cursor-pointer"
                        >
                          Responder
                        </button>
                      ) : (
                        <button
                          onClick={() => handleSendRequest(target)}
                          disabled={isBusy}
                          className="px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 font-cinzel text-[11px] font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1 shadow-sm"
                        >
                          {isBusy ? (
                            <Loader2 size={13} className="animate-spin" />
                          ) : (
                            <>
                              <UserPlus size={13} />
                              <span>Adicionar</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 5. Modal Detalhado de Perfil */}
      <FriendProfileModal 
        userSummary={selectedUserSummary}
        isOpen={isProfileModalOpen}
        onClose={() => {
          setIsProfileModalOpen(false);
          setSelectedUserSummary(null);
        }}
      />
    </div>
  );
};

export default FriendsPage;
