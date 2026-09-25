import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { Friendship, UserSummary } from '../types/friends';
import { FriendshipService } from '../services/friendshipService';

export interface EnrichedFriend {
  friendshipId: string;
  friendUser: UserSummary;
  friendship: Friendship;
  isOnline: boolean;
}

interface FriendshipContextType {
  friendships: Friendship[];
  friends: EnrichedFriend[];
  incomingRequests: Friendship[];
  outgoingRequests: Friendship[];
  pendingCount: number;
  loading: boolean;
  sendRequest: (targetUser: { uid: string; name: string; displayName?: string; photoURL?: string }) => Promise<void>;
  acceptRequest: (friendshipId: string) => Promise<void>;
  rejectRequest: (friendshipId: string) => Promise<void>;
  removeFriend: (friendshipId: string) => Promise<void>;
  cancelRequest: (friendshipId: string) => Promise<void>;
  refreshPresence: () => Promise<void>;
}

const FriendshipContext = createContext<FriendshipContextType | undefined>(undefined);

export const FriendshipProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, profile } = useAuth();
  const [friendships, setFriendships] = useState<Friendship[]>([]);
  const [loading, setLoading] = useState(true);

  // Manter presença online do usuário ativo
  useEffect(() => {
    if (!user?.uid) return;

    FriendshipService.updatePresence(user.uid, true);

    const handleFocus = () => {
      FriendshipService.updatePresence(user.uid, true);
    };

    const handleBlur = () => {
      // Quando sai da aba, podemos manter ativo com lastSeen
      FriendshipService.updatePresence(user.uid, true);
    };

    window.addEventListener('focus', handleFocus);
    window.addEventListener('visibilitychange', handleFocus);

    // Intervalo de heartbeat a cada 2 minutos
    const interval = setInterval(() => {
      FriendshipService.updatePresence(user.uid, true);
    }, 120000);

    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('visibilitychange', handleFocus);
      clearInterval(interval);
    };
  }, [user?.uid]);

  // Listener em tempo real de amizades e solicitações do usuário
  useEffect(() => {
    if (!user?.uid) {
      setFriendships([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = FriendshipService.subscribeUserFriendships(user.uid, (data) => {
      setFriendships(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user?.uid]);

  // Filtragem de amigos confirmados
  const friends = useMemo<EnrichedFriend[]>(() => {
    if (!user?.uid) return [];

    return friendships
      .filter(f => f.status === 'accepted')
      .map(f => {
        const isRequester = f.requesterId === user.uid;
        const friendUser = isRequester ? f.receiverData : f.requesterData;

        // Se o amigo não tiver os dados anexados, cria estrutura básica
        const safeFriendUser: UserSummary = friendUser || {
          uid: isRequester ? f.receiverId : f.requesterId,
          name: 'Aventureiro',
          displayName: 'Aventureiro'
        };

        return {
          friendshipId: f.id,
          friendUser: safeFriendUser,
          friendship: f,
          isOnline: !!safeFriendUser.isOnline
        };
      })
      .sort((a, b) => {
        // Ordenar primeiro por status online, depois por ordem alfabética
        if (a.isOnline === b.isOnline) {
          return (a.friendUser.name || '').localeCompare(b.friendUser.name || '');
        }
        return a.isOnline ? -1 : 1;
      });
  }, [friendships, user?.uid]);

  // Solicitações recebidas pendentes
  const incomingRequests = useMemo(() => {
    if (!user?.uid) return [];
    return friendships.filter(f => f.status === 'pending' && f.receiverId === user.uid);
  }, [friendships, user?.uid]);

  // Solicitações enviadas pendentes
  const outgoingRequests = useMemo(() => {
    if (!user?.uid) return [];
    return friendships.filter(f => f.status === 'pending' && f.requesterId === user.uid);
  }, [friendships, user?.uid]);

  const pendingCount = incomingRequests.length;

  const sendRequest = useCallback(async (targetUser: { uid: string; name: string; displayName?: string; photoURL?: string }) => {
    if (!user?.uid) throw new Error('Usuário não autenticado.');
    const currentUserInfo = {
      uid: user.uid,
      name: profile?.name || profile?.displayName || user.displayName || 'Aventureiro',
      displayName: profile?.displayName || profile?.name || user.displayName || 'Aventureiro',
      photoURL: profile?.photoURL || user.photoURL || ''
    };
    await FriendshipService.sendFriendRequest(currentUserInfo, targetUser);
  }, [user, profile]);

  const acceptRequest = useCallback(async (friendshipId: string) => {
    await FriendshipService.acceptFriendRequest(friendshipId);
  }, []);

  const rejectRequest = useCallback(async (friendshipId: string) => {
    await FriendshipService.rejectOrCancelRequest(friendshipId);
  }, []);

  const removeFriend = useCallback(async (friendshipId: string) => {
    await FriendshipService.removeFriend(friendshipId);
  }, []);

  const cancelRequest = useCallback(async (friendshipId: string) => {
    await FriendshipService.rejectOrCancelRequest(friendshipId);
  }, []);

  const refreshPresence = useCallback(async () => {
    if (user?.uid) {
      await FriendshipService.updatePresence(user.uid, true);
    }
  }, [user?.uid]);

  return (
    <FriendshipContext.Provider value={{
      friendships,
      friends,
      incomingRequests,
      outgoingRequests,
      pendingCount,
      loading,
      sendRequest,
      acceptRequest,
      rejectRequest,
      removeFriend,
      cancelRequest,
      refreshPresence
    }}>
      {children}
    </FriendshipContext.Provider>
  );
};

export const useFriendship = () => {
  const context = useContext(FriendshipContext);
  if (context === undefined) {
    throw new Error('useFriendship must be used within a FriendshipProvider');
  }
  return context;
};
