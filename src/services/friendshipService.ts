import { 
  db, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  deleteDoc, 
  updateDoc, 
  onSnapshot, 
  serverTimestamp, 
  limit,
  handleFirestoreError, 
  OperationType 
} from '../firebase/firestore';
import { Friendship, FriendshipStatus, UserSummary, FriendProfileDetail } from '../types/friends';
import { UserProfile } from '../context/AuthContext';

const COLLECTION_NAME = 'friendships';

/**
 * Gera um ID determinístico para amizade entre dois usuários:
 * garante unicidade e evita criação duplicada de registros.
 */
export const getFriendshipDocId = (uid1: string, uid2: string): string => {
  return [uid1, uid2].sort().join('_');
};

export const FriendshipService = {
  /**
   * Atualiza a presença do usuário online/offline no Firestore
   */
  async updatePresence(uid: string, isOnline: boolean = true) {
    if (!uid) return;
    try {
      const userRef = doc(db, 'users', uid);
      await updateDoc(userRef, {
        isOnline,
        lastSeen: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      // Falha silenciosa em caso de permissão de escrita menor
      console.debug('[FriendshipService] Falha ao atualizar presença:', error);
    }
  },

  /**
   * Envia uma solicitação de amizade
   */
  async sendFriendRequest(
    currentUser: { uid: string; name: string; displayName?: string; photoURL?: string },
    targetUser: { uid: string; name: string; displayName?: string; photoURL?: string }
  ): Promise<Friendship> {
    if (currentUser.uid === targetUser.uid) {
      throw new Error('Você não pode adicionar a si mesmo como amigo.');
    }

    const docId = getFriendshipDocId(currentUser.uid, targetUser.uid);
    const docRef = doc(db, COLLECTION_NAME, docId);

    try {
      const existingDoc = await getDoc(docRef);

      if (existingDoc.exists()) {
        const data = existingDoc.data() as Friendship;
        if (data.status === 'accepted') {
          throw new Error('Vocês já são amigos.');
        }
        if (data.status === 'pending') {
          if (data.requesterId === currentUser.uid) {
            throw new Error('Solicitação de amizade já enviada anteriormente.');
          } else {
            // Se o outro usuário já havia solicitado, aceita automaticamente
            await updateDoc(docRef, {
              status: 'accepted',
              updatedAt: serverTimestamp()
            });
            return {
              ...data,
              status: 'accepted'
            };
          }
        }
      }

      const requesterData: UserSummary = {
        uid: currentUser.uid,
        name: currentUser.name || currentUser.displayName || 'Aventureiro',
        displayName: currentUser.displayName || currentUser.name || 'Aventureiro',
        photoURL: currentUser.photoURL || '',
        isOnline: true
      };

      const receiverData: UserSummary = {
        uid: targetUser.uid,
        name: targetUser.name || targetUser.displayName || 'Aventureiro',
        displayName: targetUser.displayName || targetUser.name || 'Aventureiro',
        photoURL: targetUser.photoURL || ''
      };

      const newFriendship: Friendship = {
        id: docId,
        userIds: [currentUser.uid, targetUser.uid],
        requesterId: currentUser.uid,
        receiverId: targetUser.uid,
        status: 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        requesterData,
        receiverData
      };

      await setDoc(docRef, newFriendship);
      return newFriendship;
    } catch (error: any) {
      console.error('[FriendshipService] Erro ao enviar solicitação de amizade:', error);
      throw error;
    }
  },

  /**
   * Aceita uma solicitação de amizade pendente
   */
  async acceptFriendRequest(friendshipId: string): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, friendshipId);
      await updateDoc(docRef, {
        status: 'accepted',
        updatedAt: serverTimestamp()
      });
    } catch (error: any) {
      console.error('[FriendshipService] Erro ao aceitar solicitação:', error);
      handleFirestoreError(error, OperationType.UPDATE, `${COLLECTION_NAME}/${friendshipId}`);
    }
  },

  /**
   * Recusa ou cancela uma solicitação de amizade
   */
  async rejectOrCancelRequest(friendshipId: string): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, friendshipId);
      await deleteDoc(docRef);
    } catch (error: any) {
      console.error('[FriendshipService] Erro ao cancelar/recusar solicitação:', error);
      handleFirestoreError(error, OperationType.DELETE, `${COLLECTION_NAME}/${friendshipId}`);
    }
  },

  /**
   * Remove um amigo existente (desfaz a amizade)
   */
  async removeFriend(friendshipId: string): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, friendshipId);
      await deleteDoc(docRef);
    } catch (error: any) {
      console.error('[FriendshipService] Erro ao remover amigo:', error);
      handleFirestoreError(error, OperationType.DELETE, `${COLLECTION_NAME}/${friendshipId}`);
    }
  },

  /**
   * Assina em tempo real todas as amizades e solicitações do usuário
   */
  subscribeUserFriendships(
    userId: string,
    onUpdate: (friendships: Friendship[]) => void
  ) {
    if (!userId) return () => {};

    const q = query(
      collection(db, COLLECTION_NAME),
      where('userIds', 'array-contains', userId)
    );

    return onSnapshot(
      q,
      (snapshot) => {
        const friendships: Friendship[] = [];
        snapshot.forEach((docSnap) => {
          friendships.push({
            id: docSnap.id,
            ...(docSnap.data() as Omit<Friendship, 'id'>)
          });
        });
        onUpdate(friendships);
      },
      (error) => {
        console.warn('[FriendshipService] Erro no listener de amizades:', error);
      }
    );
  },

  /**
   * Busca jogadores no sistema por nome/username
   */
  async searchPlayers(searchTerm: string, currentUserId: string): Promise<UserSummary[]> {
    if (!searchTerm || searchTerm.trim().length < 2) {
      return [];
    }

    const term = searchTerm.trim().toLowerCase();

    try {
      // Buscar usuários no Firestore
      const usersRef = collection(db, 'users');
      const snapshot = await getDocs(query(usersRef, limit(30)));
      
      const results: UserSummary[] = [];

      for (const docSnap of snapshot.docs) {
        if (docSnap.id === currentUserId) continue; // Pula o próprio usuário

        const data = docSnap.data() as UserProfile & { lastSeen?: any; isOnline?: boolean };
        const name = (data.name || data.displayName || '').toLowerCase();
        const email = (data.email || '').toLowerCase();

        if (name.includes(term) || email.startsWith(term)) {
          // Tentar buscar o personagem principal deste jogador
          let mainCharName: string | undefined;
          let mainCharClass: string | undefined;
          let mainCharLevel: number | undefined;
          let mainCharRace: string | undefined;

          try {
            const charQuery = query(
              collection(db, 'characters'),
              where('uid', '==', docSnap.id),
              limit(1)
            );
            const charSnap = await getDocs(charQuery);
            if (!charSnap.empty) {
              const charData = charSnap.docs[0].data();
              mainCharName = charData.name || charData.characterData?.name;
              mainCharClass = charData.className || charData.classId || charData.characterData?.classId;
              mainCharLevel = charData.level || charData.characterData?.level || 1;
              mainCharRace = charData.raceName || charData.raceId || charData.characterData?.raceId;
            }
          } catch (e) {
            // Personagens podem ter regras mais restritas
          }

          results.push({
            uid: docSnap.id,
            name: data.name || data.displayName || 'Aventureiro',
            displayName: data.displayName || data.name || 'Aventureiro',
            photoURL: data.photoURL || '',
            mainCharacterName: mainCharName,
            mainCharacterClass: mainCharClass,
            mainCharacterLevel: mainCharLevel,
            mainCharacterRace: mainCharRace,
            isOnline: data.isOnline || false,
            lastSeen: data.lastSeen || data.updatedAt,
            createdAt: data.createdAt
          });
        }
      }

      return results;
    } catch (error) {
      console.warn('[FriendshipService] Erro ao buscar jogadores:', error);
      return [];
    }
  },

  /**
   * Busca detalhes completos do perfil de um amigo/jogador
   */
  async getPlayerProfile(targetUid: string, currentUserId?: string): Promise<FriendProfileDetail> {
    try {
      const userRef = doc(db, 'users', targetUid);
      const userSnap = await getDoc(userRef);

      let userSummary: UserSummary = {
        uid: targetUid,
        name: 'Aventureiro de Arton',
        displayName: 'Aventureiro',
        photoURL: ''
      };

      if (userSnap.exists()) {
        const uData = userSnap.data() as UserProfile & { lastSeen?: any; isOnline?: boolean };
        userSummary = {
          uid: targetUid,
          name: uData.name || uData.displayName || 'Aventureiro',
          displayName: uData.displayName || uData.name || 'Aventureiro',
          photoURL: uData.photoURL || '',
          isOnline: uData.isOnline || false,
          lastSeen: uData.lastSeen || uData.updatedAt,
          createdAt: uData.createdAt
        };
      }

      // Buscar personagens públicos do jogador
      const characters: FriendProfileDetail['characters'] = [];
      try {
        const charQuery = query(
          collection(db, 'characters'),
          where('uid', '==', targetUid),
          limit(5)
        );
        const charSnap = await getDocs(charQuery);
        charSnap.forEach((cDoc) => {
          const cData = cDoc.data();
          characters.push({
            id: cDoc.id,
            name: cData.name || cData.characterData?.name || 'Herói sem Nome',
            className: cData.className || cData.classId || cData.characterData?.classId || 'Aventureiro',
            raceName: cData.raceName || cData.raceId || cData.characterData?.raceId,
            level: cData.level || cData.characterData?.level || 1,
            imageUrl: cData.imageUrl || cData.characterData?.identity?.imageUrl
          });
        });
      } catch (err) {
        console.debug('[FriendshipService] Personagens privados ou indisponíveis');
      }

      // Verificar status de amizade
      let isFriend = false;
      let friendshipId: string | undefined;
      let friendshipStatus: FriendshipStatus | undefined;
      let isRequester = false;

      if (currentUserId && currentUserId !== targetUid) {
        friendshipId = getFriendshipDocId(currentUserId, targetUid);
        const friendshipRef = doc(db, COLLECTION_NAME, friendshipId);
        const fSnap = await getDoc(friendshipRef);
        if (fSnap.exists()) {
          const fData = fSnap.data() as Friendship;
          friendshipStatus = fData.status;
          isFriend = fData.status === 'accepted';
          isRequester = fData.requesterId === currentUserId;
        }
      }

      if (characters.length > 0) {
        userSummary.mainCharacterName = characters[0].name;
        userSummary.mainCharacterClass = characters[0].className;
        userSummary.mainCharacterLevel = characters[0].level;
        userSummary.mainCharacterRace = characters[0].raceName;
      }

      return {
        user: userSummary,
        characters,
        isFriend,
        friendshipId,
        friendshipStatus,
        isRequester
      };
    } catch (error) {
      console.error('[FriendshipService] Erro ao carregar perfil do jogador:', error);
      throw error;
    }
  }
};
