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
    currentUser: { uid: string; name: string; displayName?: string; photoURL?: string; username?: string },
    targetUser: { uid: string; name: string; displayName?: string; photoURL?: string; username?: string }
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
        username: currentUser.username || '',
        photoURL: currentUser.photoURL || '',
        isOnline: true
      };

      const receiverData: UserSummary = {
        uid: targetUser.uid,
        name: targetUser.name || targetUser.displayName || 'Aventureiro',
        displayName: targetUser.displayName || targetUser.name || 'Aventureiro',
        username: targetUser.username || '',
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
      if (error?.message?.includes('já') || error?.message?.includes('mesmo')) {
        throw error;
      }
      handleFirestoreError(error, OperationType.WRITE, `${COLLECTION_NAME}/${docId}`);
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
   * Busca jogadores no sistema por username, nome, displayName ou email.
   * Consulta diretamente o Firestore em tempo real para obter o estado mais recente.
   */
  async searchPlayers(searchTerm: string, currentUserId: string): Promise<UserSummary[]> {
    if (!searchTerm || searchTerm.trim().length === 0) {
      return [];
    }

    const rawTerm = searchTerm.trim();
    const cleanTerm = rawTerm.toLowerCase();
    const cleanUsername = cleanTerm.replace(/^@+/, '');

    try {
      const usersRef = collection(db, 'users');
      const foundDocsMap = new Map<string, any>();

      // 1. Executar buscas paralelas direcionadas no Firestore para máxima precisão e cobertura
      const queries: Promise<any>[] = [];

      // A. Busca exata por username
      if (cleanUsername) {
        queries.push(getDocs(query(usersRef, where('username', '==', cleanUsername), limit(10))));
        // B. Busca por prefixo de username
        queries.push(
          getDocs(
            query(
              usersRef,
              where('username', '>=', cleanUsername),
              where('username', '<=', cleanUsername + '\uf8ff'),
              limit(20)
            )
          )
        );
      }

      // C. Se o termo tiver formato de email
      if (cleanTerm.includes('@')) {
        queries.push(getDocs(query(usersRef, where('email', '==', cleanTerm), limit(5))));
      }

      // D. Busca ampla para permitir matches parciais/insensíveis de nome e display name
      queries.push(getDocs(query(usersRef, limit(80))));

      const querySnapshots = await Promise.allSettled(queries);

      for (const res of querySnapshots) {
        if (res.status === 'fulfilled' && res.value?.docs) {
          for (const docSnap of res.value.docs) {
            if (docSnap.id !== currentUserId && !foundDocsMap.has(docSnap.id)) {
              foundDocsMap.set(docSnap.id, docSnap.data());
            }
          }
        }
      }

      const results: UserSummary[] = [];

      for (const [uid, rawData] of foundDocsMap.entries()) {
        const data = rawData as UserProfile & { 
          lastSeen?: any; 
          isOnline?: boolean;
          username?: string;
          mainCharacterName?: string;
          mainCharacterClass?: string;
          mainCharacterLevel?: number;
          mainCharacterRace?: string;
          mainCharacterAvatar?: string;
        };

        const uUsername = (data.username || '').toLowerCase().replace(/^@+/, '');
        const uName = (data.name || '').toLowerCase();
        const uDisplayName = (data.displayName || '').toLowerCase();
        const uEmail = (data.email || '').toLowerCase();

        // Critérios de correspondência
        const isExactUsername = cleanUsername.length > 0 && uUsername === cleanUsername;
        const isPrefixUsername = cleanUsername.length > 0 && uUsername.startsWith(cleanUsername);
        const isSubstringUsername = cleanUsername.length >= 2 && uUsername.includes(cleanUsername);
        const isNameMatch = cleanTerm.length >= 2 && (uName.includes(cleanTerm) || uDisplayName.includes(cleanTerm));
        const isEmailMatch = cleanTerm.length >= 2 && (uEmail === cleanTerm || uEmail.startsWith(cleanTerm));

        if (isExactUsername || isPrefixUsername || isSubstringUsername || isNameMatch || isEmailMatch) {
          let mainCharName = data.mainCharacterName;
          let mainCharClass = data.mainCharacterClass;
          let mainCharLevel = data.mainCharacterLevel;
          let mainCharRace = data.mainCharacterRace;

          // Se não houver dados de personagem no perfil, busca o primeiro personagem público
          if (!mainCharName) {
            try {
              const charQuery = query(
                collection(db, 'characters'),
                where('uid', '==', uid),
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
              // Silencioso
            }
          }

          results.push({
            uid,
            name: data.displayName || data.name || 'Aventureiro',
            displayName: data.displayName || data.name || 'Aventureiro',
            username: uUsername,
            photoURL: data.avatarUrl || data.photoURL || '',
            mainCharacterName: mainCharName,
            mainCharacterClass: mainCharClass,
            mainCharacterLevel: mainCharLevel,
            mainCharacterRace: mainCharRace,
            isOnline: Boolean(data.isOnline),
            lastSeen: data.lastSeen || data.updatedAt,
            createdAt: data.createdAt
          });
        }
      }

      // Ordenar por relevância (exato primeiro, depois prefixo de username, etc.)
      results.sort((a, b) => {
        const aUser = (a.username || '').toLowerCase();
        const bUser = (b.username || '').toLowerCase();

        if (aUser === cleanUsername && bUser !== cleanUsername) return -1;
        if (bUser === cleanUsername && aUser !== cleanUsername) return 1;

        if (aUser.startsWith(cleanUsername) && !bUser.startsWith(cleanUsername)) return -1;
        if (bUser.startsWith(cleanUsername) && !aUser.startsWith(cleanUsername)) return 1;

        return (a.displayName || a.name || '').localeCompare(b.displayName || b.name || '');
      });

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
        username: '',
        photoURL: ''
      };

      if (userSnap.exists()) {
        const uData = userSnap.data() as UserProfile & { lastSeen?: any; isOnline?: boolean; username?: string; avatarUrl?: string };
        userSummary = {
          uid: targetUid,
          name: uData.displayName || uData.name || 'Aventureiro',
          displayName: uData.displayName || uData.name || 'Aventureiro',
          username: uData.username ? uData.username.toLowerCase().replace(/^@+/, '') : '',
          photoURL: uData.avatarUrl || uData.photoURL || '',
          isOnline: Boolean(uData.isOnline),
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
