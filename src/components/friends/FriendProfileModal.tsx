import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  X, 
  User, 
  Shield, 
  Sparkles, 
  MessageSquare, 
  UserMinus, 
  UserPlus, 
  Check, 
  Calendar, 
  Sword, 
  AlertTriangle,
  Loader2,
  ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { FriendProfileDetail, UserSummary } from '../../types/friends';
import { FriendshipService } from '../../services/friendshipService';
import { useFriendship } from '../../context/FriendshipContext';
import { useAuth } from '../../context/AuthContext';

interface FriendProfileModalProps {
  userSummary: UserSummary | null;
  isOpen: boolean;
  onClose: () => void;
}

export const FriendProfileModal: React.FC<FriendProfileModalProps> = ({
  userSummary,
  isOpen,
  onClose
}) => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const { acceptRequest, rejectRequest, removeFriend, sendRequest, cancelRequest } = useFriendship();
  const [profileDetail, setProfileDetail] = useState<FriendProfileDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [showConfirmRemove, setShowConfirmRemove] = useState(false);
  const [messageNotice, setMessageNotice] = useState(false);

  useEffect(() => {
    if (isOpen && userSummary?.uid) {
      setLoading(true);
      setShowConfirmRemove(false);
      setMessageNotice(false);
      FriendshipService.getPlayerProfile(userSummary.uid, currentUser?.uid)
        .then((res) => {
          setProfileDetail(res);
        })
        .catch((err) => {
          console.error('Erro ao carregar perfil detalhado:', err);
          setProfileDetail({
            user: userSummary,
            isFriend: false
          });
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setProfileDetail(null);
    }
  }, [isOpen, userSummary, currentUser?.uid]);

  if (!isOpen || !userSummary) return null;

  const targetUser = profileDetail?.user || userSummary;
  const isSelf = currentUser?.uid === targetUser.uid;
  const isFriend = profileDetail?.isFriend;
  const isPending = profileDetail?.friendshipStatus === 'pending';
  const isRequester = profileDetail?.isRequester;

  const formatDate = (dateVal: any) => {
    if (!dateVal) return 'Aventureiro recente';
    try {
      if (typeof dateVal?.toDate === 'function') {
        return dateVal.toDate().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
      }
      if (typeof dateVal === 'string') {
        return new Date(dateVal).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
      }
    } catch {
      return 'Artoniano';
    }
    return 'Artoniano';
  };

  const handleSendFriendRequest = async () => {
    if (!targetUser) return;
    setActionLoading(true);
    try {
      await sendRequest(targetUser);
      setProfileDetail(prev => prev ? { ...prev, friendshipStatus: 'pending', isRequester: true } : null);
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(false);
    }
  };

  const handleAccept = async () => {
    if (!profileDetail?.friendshipId) return;
    setActionLoading(true);
    try {
      await acceptRequest(profileDetail.friendshipId);
      setProfileDetail(prev => prev ? { ...prev, isFriend: true, friendshipStatus: 'accepted' } : null);
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveFriend = async () => {
    if (!profileDetail?.friendshipId) return;
    setActionLoading(true);
    try {
      await removeFriend(profileDetail.friendshipId);
      setShowConfirmRemove(false);
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelRequest = async () => {
    if (!profileDetail?.friendshipId) return;
    setActionLoading(true);
    try {
      await cancelRequest(profileDetail.friendshipId);
      setProfileDetail(prev => prev ? { ...prev, friendshipStatus: undefined, isFriend: false } : null);
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(false);
    }
  };

  const mainChar = profileDetail?.characters?.[0];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm">
        {/* Backdrop */}
        <div className="fixed inset-0" onClick={onClose} />

        {/* Modal Box */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="relative z-10 w-full max-w-md bg-stone-950 border border-amber-500/40 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.95)] overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header Bar */}
          <div className="p-3.5 sm:p-4 border-b border-stone-800 bg-stone-900/90 flex items-center justify-between">
            <div className="flex items-center gap-2 text-amber-300">
              <User size={18} />
              <span className="font-cinzel text-xs sm:text-sm font-bold uppercase tracking-wider text-stone-200">
                Perfil do Aventureiro
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1 text-stone-400 hover:text-stone-100 rounded-md transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Content */}
          <div className="p-4 sm:p-6 overflow-y-auto custom-scrollbar space-y-5">
            {loading ? (
              <div className="py-12 flex flex-col items-center justify-center space-y-3">
                <Loader2 size={28} className="animate-spin text-amber-400" />
                <span className="text-xs font-cinzel text-stone-400 uppercase tracking-wider">
                  Consultando os registros de Arton...
                </span>
              </div>
            ) : (
              <>
                {/* Avatar & Online status lockup */}
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className="relative">
                    {targetUser.photoURL ? (
                      <img 
                        src={targetUser.photoURL} 
                        alt={targetUser.name} 
                        className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl border-2 border-amber-500/50 object-cover shadow-[0_0_20px_rgba(212,175,55,0.2)]"
                      />
                    ) : (
                      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-stone-900 border-2 border-amber-500/50 flex items-center justify-center text-amber-300 font-cinzel text-2xl font-bold shadow-[0_0_20px_rgba(212,175,55,0.2)]">
                        {targetUser.name?.[0]?.toUpperCase() || 'A'}
                      </div>
                    )}
                    {/* Status Badge Dot */}
                    <div 
                      className={`absolute -bottom-1 -right-1 px-2 py-0.5 rounded-full border text-[10px] font-sans font-semibold flex items-center gap-1 ${
                        targetUser.isOnline 
                          ? 'bg-stone-950 border-emerald-500/60 text-emerald-400' 
                          : 'bg-stone-950 border-stone-700 text-stone-400'
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full ${targetUser.isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-stone-500'}`} />
                      <span>{targetUser.isOnline ? 'Online' : 'Offline'}</span>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg sm:text-xl font-cinzel font-bold text-amber-100 uppercase tracking-wider">
                      {targetUser.name || targetUser.displayName}
                    </h3>
                    {targetUser.username && (
                      <p className="text-xs text-amber-400 font-mono mt-0.5 tracking-wide">
                        @{targetUser.username.replace(/^@+/, '')}
                      </p>
                    )}
                    <p className="text-xs text-stone-400 font-sans mt-0.5">
                      {targetUser.mainCharacterName ? (
                        <span className="text-amber-300 font-medium">"{targetUser.mainCharacterName}"</span>
                      ) : (
                        <span>Explorador de Arton</span>
                      )}
                    </p>
                  </div>
                </div>

                {/* Primary Character Information Card (if available) */}
                <div className="p-3.5 rounded-xl bg-stone-900/60 border border-stone-800 space-y-2">
                  <div className="flex items-center gap-2 text-amber-400 text-xs font-cinzel font-bold uppercase tracking-wider">
                    <Sword size={14} />
                    <span>Personagem Principal</span>
                  </div>

                  {mainChar ? (
                    <div className="flex items-center justify-between text-xs pt-1">
                      <div>
                        <p className="font-bold text-stone-100 text-sm">{mainChar.name}</p>
                        <p className="text-stone-400">
                          {mainChar.raceName || 'Raça não definida'} • {mainChar.className || 'Classe'}
                        </p>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/40 text-amber-300 font-cinzel font-bold text-[11px]">
                        Nível {mainChar.level || 1}
                      </span>
                    </div>
                  ) : (
                    <p className="text-xs text-stone-500 font-sans italic">
                      Nenhum personagem registrado publicamente.
                    </p>
                  )}
                </div>

                {/* Botão para Acessar Perfil Completo */}
                <button
                  onClick={() => {
                    onClose();
                    navigate(`/profile/${targetUser.uid}`);
                  }}
                  className="w-full py-2 px-3 rounded-lg bg-[#12141a] hover:bg-[#1a1d26] border border-amber-500/40 text-amber-200 text-xs font-cinzel font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-sm"
                >
                  <ExternalLink size={14} />
                  <span>Ver Perfil Completo do Jogador</span>
                </button>

                {/* Meta details */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-lg bg-stone-900/40 border border-stone-800/80">
                    <span className="text-stone-500 text-[10px] uppercase font-cinzel block">Membro Desde</span>
                    <span className="text-stone-300 font-medium">{formatDate(targetUser.createdAt)}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-stone-900/40 border border-stone-800/80">
                    <span className="text-stone-500 text-[10px] uppercase font-cinzel block">Relação</span>
                    <span className={`font-medium ${isFriend ? 'text-amber-300' : 'text-stone-300'}`}>
                      {isSelf ? 'Você' : isFriend ? 'Amigos' : isPending ? 'Solicitação Pendente' : 'Não adicionado'}
                    </span>
                  </div>
                </div>

                {/* Message Notice toast */}
                {messageNotice && (
                  <div className="p-3 rounded-lg bg-amber-950/40 border border-amber-500/30 text-amber-200 text-xs flex items-center gap-2">
                    <Sparkles size={16} className="text-amber-400 shrink-0" />
                    <span>O sistema de mensagens privadas e convites para mesas estará disponível na próxima atualização!</span>
                  </div>
                )}

                {/* Remove Confirmation prompt */}
                {showConfirmRemove && (
                  <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-500/40 space-y-3">
                    <div className="flex items-center gap-2 text-rose-300 text-xs font-bold">
                      <AlertTriangle size={16} />
                      <span>Remover {targetUser.name} da sua lista de amigos?</span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowConfirmRemove(false)}
                        className="flex-1 py-1.5 px-3 rounded-lg border border-stone-700 text-stone-300 text-xs font-cinzel uppercase font-semibold hover:bg-stone-800 cursor-pointer"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={handleRemoveFriend}
                        disabled={actionLoading}
                        className="flex-1 py-1.5 px-3 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-cinzel uppercase font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        {actionLoading ? <Loader2 size={14} className="animate-spin" /> : 'Confirmar Remoção'}
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Action Footer */}
          {!loading && !isSelf && (
            <div className="p-3.5 sm:p-4 border-t border-stone-800 bg-stone-900/90 flex flex-col sm:flex-row items-center gap-2">
              {isFriend ? (
                <>
                  <button
                    onClick={() => setMessageNotice(true)}
                    className="w-full sm:flex-1 py-2.5 px-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 font-cinzel text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-sm"
                  >
                    <MessageSquare size={16} />
                    <span>Enviar Mensagem</span>
                  </button>
                  
                  {!showConfirmRemove && (
                    <button
                      onClick={() => setShowConfirmRemove(true)}
                      className="w-full sm:w-auto py-2.5 px-3 rounded-lg border border-stone-800 hover:border-red-500/50 text-stone-400 hover:text-rose-300 text-xs font-cinzel font-semibold uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                      title="Desfazer amizade"
                    >
                      <UserMinus size={15} />
                      <span className="sm:hidden">Remover Amigo</span>
                    </button>
                  )}
                </>
              ) : isPending ? (
                isRequester ? (
                  <button
                    onClick={handleCancelRequest}
                    disabled={actionLoading}
                    className="w-full py-2.5 px-3 rounded-lg border border-stone-700 hover:border-stone-500 text-stone-300 font-cinzel text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-2"
                  >
                    {actionLoading ? <Loader2 size={15} className="animate-spin" /> : 'Cancelar Solicitação'}
                  </button>
                ) : (
                  <div className="flex gap-2 w-full">
                    <button
                      onClick={handleAccept}
                      disabled={actionLoading}
                      className="flex-1 py-2.5 px-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 font-cinzel text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      {actionLoading ? <Loader2 size={15} className="animate-spin" /> : <><Check size={15} /> Aceitar</>}
                    </button>
                    <button
                      onClick={handleCancelRequest}
                      disabled={actionLoading}
                      className="flex-1 py-2.5 px-3 rounded-lg border border-stone-800 hover:border-stone-700 text-stone-400 font-cinzel text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer"
                    >
                      Recusar
                    </button>
                  </div>
                )
              ) : (
                <button
                  onClick={handleSendFriendRequest}
                  disabled={actionLoading}
                  className="w-full py-2.5 px-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 font-cinzel text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-sm"
                >
                  {actionLoading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <>
                      <UserPlus size={16} />
                      <span>Adicionar Amigo</span>
                    </>
                  )}
                </button>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
