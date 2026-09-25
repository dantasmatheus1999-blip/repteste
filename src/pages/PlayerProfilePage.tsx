import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  User, 
  Sparkles, 
  Sword, 
  Shield, 
  Users, 
  Dices, 
  Calendar, 
  Edit3, 
  Plus, 
  ChevronRight, 
  ArrowLeft, 
  UserPlus, 
  UserCheck, 
  UserX, 
  Check, 
  Clock, 
  Share2, 
  Settings, 
  LogOut, 
  Trophy, 
  Scroll, 
  Flame, 
  ExternalLink,
  Loader2,
  Award
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { useFriendship } from '../context/FriendshipContext';
import { UserProfileService, PlayerProfileData, UserStats } from '../services/userProfileService';
import { CharacterService } from '../services/characterService';
import { EditProfileModal } from '../components/profile/EditProfileModal';
import { T20Character } from '../types/t20';

export const PlayerProfilePage: React.FC = () => {
  const { userId: routeUserId } = useParams<{ userId?: string }>();
  const navigate = useNavigate();
  const { user: currentUser, profile: authProfile, logout } = useAuth();
  const { 
    friends, 
    incomingRequests, 
    outgoingRequests, 
    sendRequest, 
    acceptRequest, 
    rejectRequest, 
    cancelRequest, 
    removeFriend 
  } = useFriendship();

  // Profile data state
  const [profileData, setProfileData] = useState<PlayerProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<UserStats>({ charactersCount: 0, campaignsCount: 0, friendsCount: 0 });
  const [characters, setCharacters] = useState<(T20Character & { id: string })[]>([]);
  const [loadingChars, setLoadingChars] = useState(false);

  // Edit Modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Determine if viewing own profile
  const targetUid = routeUserId || currentUser?.uid || '';
  const isOwner = Boolean(currentUser && currentUser.uid === targetUid);

  // Load profile, stats and characters
  const loadProfile = async () => {
    if (!targetUid) return;
    setLoading(true);

    try {
      // 1. Fetch user profile
      const prof = await UserProfileService.getUserProfile(targetUid);
      if (prof) {
        setProfileData(prof);
      } else if (isOwner && authProfile) {
        setProfileData(authProfile as PlayerProfileData);
      }

      // 2. Fetch stats
      const userStats = await UserProfileService.fetchRealUserStats(targetUid);
      setStats(userStats);

      // 3. Fetch user characters
      setLoadingChars(true);
      const userChars = await CharacterService.getUserCharacters(targetUid);
      if (userChars) {
        setCharacters(userChars);
      }
    } catch (err) {
      console.error('Erro ao carregar dados do perfil:', err);
    } finally {
      setLoading(false);
      setLoadingChars(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, [targetUid, isOwner]);

  // Friendship state relative to current user
  const isFriend = useMemo(() => {
    return friends.some(f => f.friendUser.uid === targetUid);
  }, [friends, targetUid]);

  const outgoingReq = useMemo(() => {
    return outgoingRequests.find(r => r.receiverId === targetUid);
  }, [outgoingRequests, targetUid]);

  const incomingReq = useMemo(() => {
    return incomingRequests.find(r => r.requesterId === targetUid);
  }, [incomingRequests, targetUid]);

  // Handle Friend Actions
  const handleSendFriendRequest = async () => {
    if (!profileData) return;
    setActionLoading(true);
    try {
      await sendRequest({
        uid: targetUid,
        name: profileData.displayName || profileData.name || 'Aventureiro',
        displayName: profileData.displayName || profileData.name,
        photoURL: profileData.avatarUrl || profileData.photoURL
      });
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(false);
    }
  };

  const handleAcceptFriendRequest = async () => {
    if (!incomingReq) return;
    setActionLoading(true);
    try {
      await acceptRequest(incomingReq.id);
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectFriendRequest = async () => {
    if (!incomingReq) return;
    setActionLoading(true);
    try {
      await rejectRequest(incomingReq.id);
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelFriendRequest = async () => {
    if (!outgoingReq) return;
    setActionLoading(true);
    try {
      await cancelRequest(outgoingReq.id);
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(false);
    }
  };

  const handleShareProfile = () => {
    if (navigator.clipboard) {
      const url = `${window.location.origin}/profile/${targetUid}`;
      navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  // Format creation date
  const memberSince = useMemo(() => {
    const rawDate = profileData?.createdAt;
    if (!rawDate) return 'Aventureiro de Artón';
    try {
      if (typeof rawDate?.toDate === 'function') {
        return rawDate.toDate().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
      }
      if (typeof rawDate === 'string') {
        return new Date(rawDate).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
      }
    } catch {
      return 'Guardião de Artón';
    }
    return 'Guardião de Artón';
  }, [profileData?.createdAt]);

  // Main Character snapshot
  const mainCharacter = useMemo(() => {
    if (profileData?.mainCharacterId) {
      const foundInList = characters.find(c => c.id === profileData.mainCharacterId);
      if (foundInList) return foundInList;
    }
    // If no explicit main character id but characters exist and is first character
    if (characters.length > 0 && !profileData?.mainCharacterId) {
      return characters[0];
    }
    return null;
  }, [profileData?.mainCharacterId, characters]);

  // Conquistas Baseadas em Marcos Reais do Sistema
  const achievements = useMemo(() => {
    const totalChars = stats.charactersCount || characters.length;
    const totalFriends = stats.friendsCount || 0;
    const hasSpellcaster = characters.some(c => 
      c.classId === 'arcanista' || c.classId === 'clerigo' || c.classId === 'druida' || c.classId === 'bardo'
    );
    const hasHighLevel = characters.some(c => (c.level || 1) >= 5);

    return [
      {
        id: 'ach-first-hero',
        title: 'Primeiro Herói',
        description: 'Forjou seu primeiro aventureiro nas terras de Artón.',
        icon: Sword,
        unlocked: totalChars >= 1,
        progress: totalChars >= 1 ? '1/1' : '0/1'
      },
      {
        id: 'ach-fellowship',
        title: 'Companheirismo',
        description: 'Conectou-se com seu primeiro companheiro de guilda.',
        icon: Users,
        unlocked: totalFriends >= 1,
        progress: totalFriends >= 1 ? '1/1' : '0/1'
      },
      {
        id: 'ach-explorer',
        title: 'Explorador de Artón',
        description: 'Criou 3 ou mais heróis distintos no Portal Arcano.',
        icon: Scroll,
        unlocked: totalChars >= 3,
        progress: `${Math.min(totalChars, 3)}/3`
      },
      {
        id: 'ach-arcane-master',
        title: 'Mestre das Magias',
        description: 'Possui um conjurador arcano ou divino experiente.',
        icon: Flame,
        unlocked: hasSpellcaster,
        progress: hasSpellcaster ? '1/1' : '0/1'
      },
      {
        id: 'ach-veteran',
        title: 'Veterano de Batalha',
        description: 'Alcançou o nível 5 ou superior com um personagem.',
        icon: Trophy,
        unlocked: hasHighLevel,
        progress: hasHighLevel ? '1/1' : '0/1'
      }
    ];
  }, [stats, characters]);

  const unlockedAchievementsCount = achievements.filter(a => a.unlocked).length;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-3">
        <Loader2 size={32} className="animate-spin text-amber-400" />
        <p className="font-cinzel text-xs text-stone-400 uppercase tracking-widest">
          Abrindo Registro do Aventureiro...
        </p>
      </div>
    );
  }

  const defaultCover = 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1600&auto=format&fit=crop&q=80';
  const activeCover = profileData?.coverUrl || defaultCover;
  const activeAvatar = profileData?.avatarUrl || profileData?.photoURL;
  const displayName = profileData?.displayName || profileData?.name || 'Aventureiro de Artón';
  const username = profileData?.username ? `@${profileData.username.replace(/^@/, '')}` : `@${targetUid.substring(0, 8)}`;
  const bio = profileData?.bio || '“Um aventureiro desbravando os mistérios e perigos de Artón.”';
  const isOnline = Boolean((profileData as any)?.isOnline);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-5 animate-in fade-in duration-300 pb-16">
      {/* 1. Header de Navegação do Perfil */}
      <div className="flex items-center justify-between px-1">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-lg bg-[#0d0e12] hover:bg-[#151720] border border-amber-900/40 text-amber-300 font-cinzel text-xs font-bold tracking-wider uppercase transition-colors cursor-pointer"
        >
          <ArrowLeft size={14} />
          <span>Voltar</span>
        </button>

        <div className="flex items-center gap-2">
          {/* Botão de Compartilhar Link do Perfil */}
          <button
            onClick={handleShareProfile}
            className="p-2 rounded-lg bg-[#0d0e12] hover:bg-[#151720] border border-amber-900/40 text-stone-400 hover:text-amber-300 transition-colors cursor-pointer"
            title="Compartilhar Perfil"
          >
            {copiedLink ? <Check size={16} className="text-emerald-400" /> : <Share2 size={16} />}
          </button>

          {/* Se for o próprio perfil: Botão de Configurações / Sair */}
          {isOwner && (
            <Link
              to="/settings"
              className="p-2 rounded-lg bg-[#0d0e12] hover:bg-[#151720] border border-amber-900/40 text-stone-400 hover:text-amber-300 transition-colors"
              title="Configurações"
            >
              <Settings size={16} />
            </Link>
          )}
        </div>
      </div>

      {/* 2. CARD PRINCIPAL DO PERFIL COM CAPA E AVATAR SOBREPOSTO */}
      <div className="relative rounded-2xl bg-[#0b0c10] border border-amber-600/40 overflow-hidden shadow-[0_10px_35px_rgba(0,0,0,0.8)]">
        {/* Cantoneiras douradas decorativas do card */}
        <span className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-amber-300 z-20 pointer-events-none" />
        <span className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-amber-300 z-20 pointer-events-none" />
        <span className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-amber-300 z-20 pointer-events-none" />
        <span className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-amber-300 z-20 pointer-events-none" />

        {/* CAPA DO PERFIL (Hero Banner) */}
        <div className="relative w-full h-40 sm:h-56 md:h-64 bg-stone-950 overflow-hidden select-none">
          <img 
            src={activeCover} 
            alt="Capa do Perfil" 
            className="w-full h-full object-cover object-center transform hover:scale-105 transition-transform duration-700"
          />
          {/* Gradientes e vinhetas atmosféricas */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0b0c10] via-black/40 to-black/30 pointer-events-none" />
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-400/50 to-transparent" />

          {/* Botão de Editar Capa Rápido (para o dono) */}
          {isOwner && (
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="absolute top-3 right-3 py-1.5 px-3 rounded-lg bg-black/70 hover:bg-black/90 backdrop-blur-md border border-amber-500/60 text-amber-200 text-[10px] sm:text-xs font-cinzel font-bold tracking-wider uppercase flex items-center gap-1.5 shadow-lg transition-all cursor-pointer"
            >
              <Edit3 size={12} />
              <span>Editar Capa</span>
            </button>
          )}
        </div>

        {/* ÁREA DE IDENTIDADE E AVATAR */}
        <div className="relative px-4 sm:px-6 md:px-8 pb-6 pt-0">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 -mt-14 sm:-mt-18 relative z-10 mb-4">
            {/* AVATAR COM MOLDURA DOURADA SOBREPOSTA À CAPA */}
            <div className="flex items-end gap-4">
              <div className="relative group">
                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl bg-[#0d0e12] border-2 border-amber-400 shadow-[0_0_25px_rgba(212,175,55,0.4)] overflow-hidden shrink-0 flex items-center justify-center p-0.5">
                  {activeAvatar ? (
                    <img 
                      src={activeAvatar} 
                      alt={displayName} 
                      className="w-full h-full object-cover rounded-xl"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-full h-full bg-[#13141a] rounded-xl flex items-center justify-center text-amber-300 font-cinzel font-black text-3xl sm:text-4xl">
                      {displayName?.[0]?.toUpperCase() || 'A'}
                    </div>
                  )}
                </div>

                {/* Indicador de Status Online / Offline */}
                <span 
                  className={`absolute bottom-1 right-1 w-4 h-4 rounded-full border-2 border-stone-950 shadow-md ${
                    isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-stone-500'
                  }`} 
                  title={isOnline ? 'Online em Artón' : 'Offline'}
                />

                {/* Botão de Editar Avatar se for o dono */}
                {isOwner && (
                  <button
                    onClick={() => setIsEditModalOpen(true)}
                    className="absolute inset-0 bg-black/60 rounded-2xl flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-amber-200 cursor-pointer"
                  >
                    <Edit3 size={18} />
                    <span className="text-[9px] font-cinzel uppercase font-bold mt-1">Alterar</span>
                  </button>
                )}
              </div>

              {/* Títulos e Tag Principal (Mobile & Desktop) */}
              <div className="space-y-0.5 pb-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl sm:text-2xl md:text-3xl font-cinzel font-black text-transparent bg-clip-text bg-gradient-to-b from-[#fffbeb] via-[#fde68a] to-[#d97706] tracking-wide uppercase drop-shadow-[0_2px_10px_rgba(212,175,55,0.3)]">
                    {displayName}
                  </h1>
                  
                  {/* Badge de Role */}
                  <span className={`px-2 py-0.5 rounded text-[9px] sm:text-[10px] font-cinzel font-bold tracking-wider uppercase border ${
                    profileData?.role === 'admin' 
                      ? 'bg-rose-950/60 border-rose-500/60 text-rose-300' 
                      : profileData?.role === 'master'
                        ? 'bg-amber-950/60 border-amber-500/60 text-amber-300'
                        : 'bg-stone-900 border-stone-700 text-stone-300'
                  }`}>
                    {profileData?.role === 'admin' ? 'Guardião / Admin' : profileData?.role === 'master' ? 'Mestre' : 'Jogador'}
                  </span>
                </div>

                <p className="text-xs sm:text-sm font-mono text-amber-400/90 font-medium">
                  {username}
                </p>
              </div>
            </div>

            {/* BOTÕES DE AÇÃO DO PERFIL (Dono vs Social) */}
            <div className="w-full sm:w-auto flex items-center gap-2 pt-2 sm:pt-0">
              {isOwner ? (
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="w-full sm:w-auto py-2 px-5 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-400 text-stone-950 font-cinzel text-xs font-black uppercase tracking-wider rounded-lg shadow-[0_0_15px_rgba(212,175,55,0.3)] transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Edit3 size={14} strokeWidth={2.5} />
                  <span>Editar Perfil</span>
                </button>
              ) : (
                /* Ações de Amizade quando visualizando outro jogador */
                <div className="w-full sm:w-auto flex items-center gap-2">
                  {isFriend ? (
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <span className="py-2 px-4 rounded-lg bg-emerald-950/40 border border-emerald-500/50 text-emerald-300 font-cinzel text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                        <UserCheck size={14} />
                        <span>Amigos</span>
                      </span>
                    </div>
                  ) : incomingReq ? (
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <button
                        onClick={handleAcceptFriendRequest}
                        disabled={actionLoading}
                        className="flex-1 sm:flex-none py-2 px-4 bg-amber-500 hover:bg-amber-400 text-stone-950 font-cinzel text-xs font-black uppercase tracking-wider rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        {actionLoading ? <Loader2 size={13} className="animate-spin" /> : <><Check size={14} /> Aceitar</>}
                      </button>
                      <button
                        onClick={handleRejectFriendRequest}
                        disabled={actionLoading}
                        className="py-2 px-3 border border-stone-800 hover:border-stone-700 text-stone-400 hover:text-stone-200 font-cinzel text-xs font-bold uppercase rounded-lg transition-colors cursor-pointer"
                      >
                        Recusar
                      </button>
                    </div>
                  ) : outgoingReq ? (
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <span className="py-2 px-3.5 rounded-lg bg-stone-900 border border-stone-800 text-stone-400 font-cinzel text-xs font-medium uppercase tracking-wider flex items-center gap-1.5">
                        <Clock size={13} />
                        <span>Solicitação Enviada</span>
                      </span>
                      <button
                        onClick={handleCancelFriendRequest}
                        disabled={actionLoading}
                        className="py-2 px-2.5 rounded-lg border border-stone-800 hover:border-stone-700 text-stone-500 hover:text-stone-300 font-cinzel text-[11px] uppercase transition-colors cursor-pointer"
                      >
                        Cancelar
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={handleSendFriendRequest}
                      disabled={actionLoading}
                      className="w-full sm:w-auto py-2 px-5 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-400 text-stone-950 font-cinzel text-xs font-black uppercase tracking-wider rounded-lg shadow-[0_0_15px_rgba(212,175,55,0.3)] transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      {actionLoading ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <>
                          <UserPlus size={14} strokeWidth={2.5} />
                          <span>Adicionar Amigo</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* FRASE / STATUS / BIO DO JOGADOR */}
          <div className="mt-2 p-3.5 rounded-xl bg-[#0d0e12]/90 border border-amber-900/30">
            <p className="text-xs sm:text-sm text-stone-300 italic font-serif leading-relaxed">
              {bio}
            </p>
            <div className="flex items-center gap-4 mt-2 pt-2 border-t border-stone-800/40 text-[11px] text-stone-400 font-sans">
              <span className="flex items-center gap-1.5 text-stone-400">
                <Calendar size={12} className="text-amber-500/80" />
                Membro desde {memberSince}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. GRID DE ESTATÍSTICAS DO JOGADOR */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Stat 1: Personagens */}
        <div className="p-3.5 rounded-xl bg-[#0d0e12] border border-amber-900/40 text-center space-y-1 relative group hover:border-amber-500/50 transition-colors shadow-md">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 mx-auto flex items-center justify-center">
            <Sword size={16} />
          </div>
          <div className="text-xl sm:text-2xl font-cinzel font-black text-amber-200">
            {stats.charactersCount || characters.length}
          </div>
          <div className="text-[10px] font-cinzel font-bold text-stone-400 uppercase tracking-wider">
            Personagens
          </div>
        </div>

        {/* Stat 2: Aventuras / Campanhas */}
        <div className="p-3.5 rounded-xl bg-[#0d0e12] border border-amber-900/40 text-center space-y-1 relative group hover:border-amber-500/50 transition-colors shadow-md">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 mx-auto flex items-center justify-center">
            <Dices size={16} />
          </div>
          <div className="text-xl sm:text-2xl font-cinzel font-black text-amber-200">
            {stats.campaignsCount}
          </div>
          <div className="text-[10px] font-cinzel font-bold text-stone-400 uppercase tracking-wider">
            Campanhas
          </div>
        </div>

        {/* Stat 3: Amigos */}
        <div className="p-3.5 rounded-xl bg-[#0d0e12] border border-amber-900/40 text-center space-y-1 relative group hover:border-amber-500/50 transition-colors shadow-md">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 mx-auto flex items-center justify-center">
            <Users size={16} />
          </div>
          <div className="text-xl sm:text-2xl font-cinzel font-black text-amber-200">
            {stats.friendsCount}
          </div>
          <div className="text-[10px] font-cinzel font-bold text-stone-400 uppercase tracking-wider">
            Amigos
          </div>
        </div>

        {/* Stat 4: Conquistas */}
        <div className="p-3.5 rounded-xl bg-[#0d0e12] border border-amber-900/40 text-center space-y-1 relative group hover:border-amber-500/50 transition-colors shadow-md">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 mx-auto flex items-center justify-center">
            <Trophy size={16} />
          </div>
          <div className="text-xl sm:text-2xl font-cinzel font-black text-amber-200">
            {unlockedAchievementsCount}/{achievements.length}
          </div>
          <div className="text-[10px] font-cinzel font-bold text-stone-400 uppercase tracking-wider">
            Conquistas
          </div>
        </div>
      </div>

      {/* 4. SEÇÃO: PERSONAGEM PRINCIPAL EM DESTAQUE */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-sm sm:text-base font-cinzel font-black uppercase text-amber-200 tracking-wider flex items-center gap-2">
            <span className="w-1.5 h-1.5 rotate-45 bg-amber-400" />
            Personagem Principal
          </h2>

          {isOwner && (
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="text-xs font-cinzel text-amber-400 hover:text-amber-200 transition-colors cursor-pointer"
            >
              Trocar Destaque
            </button>
          )}
        </div>

        {mainCharacter ? (
          <div className="p-4 sm:p-5 rounded-xl bg-[#0b0c10] border border-amber-600/40 relative overflow-hidden group shadow-lg">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                {/* Character Avatar */}
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-stone-900 border border-amber-500/50 overflow-hidden shrink-0 flex items-center justify-center">
                  {mainCharacter.imageUrl ? (
                    <img src={mainCharacter.imageUrl} alt={mainCharacter.name} className="w-full h-full object-cover" />
                  ) : (
                    <Shield size={24} className="text-amber-400/70" />
                  )}
                </div>

                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-cinzel font-bold text-amber-400 uppercase tracking-widest">
                      Destaque de Artón
                    </span>
                    <span className="w-1 h-1 rounded-full bg-amber-500/50" />
                    <span className="text-xs font-cinzel text-stone-400">
                      Nível {mainCharacter.level || 1}
                    </span>
                  </div>

                  <h3 className="text-lg sm:text-xl font-cinzel font-bold text-stone-100 group-hover:text-amber-300 transition-colors">
                    {mainCharacter.name}
                  </h3>

                  <p className="text-xs text-stone-400 font-sans">
                    {mainCharacter.raceId || 'Artoniano'} • {mainCharacter.classId || 'Aventureiro'}
                  </p>
                </div>
              </div>

              {/* Botão para abrir a ficha */}
              <Link
                to={`/characters/${mainCharacter.id}`}
                className="w-full sm:w-auto py-2 px-4 rounded-lg bg-[#13141a] hover:bg-stone-800 border border-amber-500/40 text-amber-200 text-xs font-cinzel font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors shadow-sm"
              >
                <span>Ver Ficha Completa</span>
                <ChevronRight size={14} />
              </Link>
            </div>
          </div>
        ) : (
          <div className="p-6 rounded-xl bg-[#0d0e12] border border-stone-800 text-center space-y-2">
            <Shield size={24} className="mx-auto text-stone-600" />
            <p className="text-xs font-cinzel text-stone-400 uppercase tracking-wider">
              Nenhum herói em destaque selecionado
            </p>
            {isOwner && (
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="py-1.5 px-3 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-cinzel font-bold uppercase tracking-wider transition-colors cursor-pointer"
              >
                Escolher Personagem Principal
              </button>
            )}
          </div>
        )}
      </div>

      {/* 5. SEÇÃO: COLEÇÃO / MEUS PERSONAGENS */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-sm sm:text-base font-cinzel font-black uppercase text-amber-200 tracking-wider flex items-center gap-2">
            <span className="w-1.5 h-1.5 rotate-45 bg-amber-400" />
            {isOwner ? 'Meus Personagens' : 'Personagens do Jogador'} ({characters.length})
          </h2>

          {isOwner && (
            <Link
              to="/characters/sheet"
              className="py-1 px-2.5 rounded-md bg-[#13141a] hover:bg-stone-800 border border-amber-600/40 text-amber-300 text-[11px] font-cinzel font-bold uppercase tracking-wider flex items-center gap-1 transition-colors"
            >
              <Plus size={12} />
              <span>Novo Personagem</span>
            </Link>
          )}
        </div>

        {loadingChars ? (
          <div className="py-6 text-center text-xs text-stone-400 font-cinzel">
            <Loader2 size={18} className="animate-spin text-amber-400 mx-auto mb-2" />
            Consultando grimórios...
          </div>
        ) : characters.length === 0 ? (
          <div className="p-6 rounded-xl bg-[#0d0e12] border border-stone-800 text-center space-y-2">
            <p className="text-xs font-cinzel text-stone-400">
              Nenhum personagem registrado ainda.
            </p>
            {isOwner && (
              <Link
                to="/characters/sheet"
                className="inline-flex items-center gap-1.5 py-1.5 px-3.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 font-cinzel text-xs font-black uppercase tracking-wider transition-colors"
              >
                <Plus size={14} />
                <span>Criar Primeiro Personagem</span>
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {characters.map((char) => (
              <Link
                key={char.id}
                to={`/characters/${char.id}`}
                className="p-3 rounded-xl bg-[#0d0e12] hover:bg-[#151720] border border-stone-800/80 hover:border-amber-600/40 flex items-center justify-between gap-3 transition-colors group shadow-sm"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-stone-900 border border-stone-800 overflow-hidden shrink-0 flex items-center justify-center">
                    {char.imageUrl ? (
                      <img src={char.imageUrl} alt={char.name} className="w-full h-full object-cover" />
                    ) : (
                      <Shield size={16} className="text-amber-500/70" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <h4 className="font-cinzel font-bold text-xs sm:text-sm text-stone-200 group-hover:text-amber-300 transition-colors truncate">
                      {char.name}
                    </h4>
                    <p className="text-[11px] text-stone-400 font-sans truncate">
                      {char.raceId || 'Raça'} • {char.classId || 'Classe'} Nv. {char.level || 1}
                    </p>
                  </div>
                </div>

                <ChevronRight size={16} className="text-stone-600 group-hover:text-amber-400 transition-colors shrink-0" />
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* 6. SEÇÃO: CONQUISTAS DO JOGADOR */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-sm sm:text-base font-cinzel font-black uppercase text-amber-200 tracking-wider flex items-center gap-2">
            <span className="w-1.5 h-1.5 rotate-45 bg-amber-400" />
            Conquistas de Artón ({unlockedAchievementsCount}/{achievements.length})
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {achievements.map((ach) => {
            const Icon = ach.icon;
            return (
              <div
                key={ach.id}
                className={`p-3 rounded-xl border transition-all flex items-start gap-3 ${
                  ach.unlocked
                    ? 'bg-[#0e1017] border-amber-500/50 shadow-[0_0_15px_rgba(212,175,55,0.1)]'
                    : 'bg-[#090a0d]/60 border-stone-800/60 opacity-60'
                }`}
              >
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border ${
                  ach.unlocked
                    ? 'bg-amber-500/15 border-amber-500/50 text-amber-300 shadow-sm'
                    : 'bg-stone-900 border-stone-800 text-stone-600'
                }`}>
                  <Icon size={18} />
                </div>

                <div className="min-w-0 flex-1 space-y-0.5">
                  <div className="flex items-center justify-between">
                    <h4 className={`font-cinzel text-xs font-bold ${
                      ach.unlocked ? 'text-amber-200' : 'text-stone-400'
                    }`}>
                      {ach.title}
                    </h4>
                    <span className="text-[10px] font-mono text-stone-500">
                      {ach.progress}
                    </span>
                  </div>

                  <p className="text-[10px] text-stone-400 font-sans leading-tight">
                    {ach.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 7. OPÇÃO DE LOGOUT SE FOR O PRÓPRIO PERFIL */}
      {isOwner && (
        <div className="pt-6 border-t border-stone-800/60 flex justify-center">
          <button
            onClick={() => {
              logout();
              navigate('/auth');
            }}
            className="py-2 px-6 rounded-lg bg-rose-950/40 hover:bg-rose-950/60 border border-rose-800/40 text-rose-300 hover:text-rose-200 font-cinzel text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-colors cursor-pointer"
          >
            <LogOut size={14} />
            <span>Sair do RealmOR</span>
          </button>
        </div>
      )}

      {/* Modal de Edição */}
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        currentProfile={profileData}
        onProfileUpdated={(updated) => {
          setProfileData(prev => prev ? { ...prev, ...updated } : (updated as PlayerProfileData));
          loadProfile();
        }}
        userId={targetUid}
      />
    </div>
  );
};

export default PlayerProfilePage;
