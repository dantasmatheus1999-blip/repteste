import { 
  db, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  query, 
  where, 
  getDocs, 
  limit, 
  serverTimestamp, 
  handleFirestoreError, 
  OperationType 
} from '../firebase/firestore';
import { StorageService } from './storageService';
import { UserProfile } from '../context/AuthContext';
import { CharacterService } from './characterService';

export interface UserStats {
  charactersCount: number;
  campaignsCount: number;
  friendsCount: number;
}

export interface PlayerProfileData extends UserProfile {
  username?: string;
  bio?: string;
  avatarUrl?: string;
  coverUrl?: string;
  mainCharacterId?: string;
  mainCharacterName?: string;
  mainCharacterClass?: string;
  mainCharacterRace?: string;
  mainCharacterLevel?: number;
  mainCharacterAvatar?: string;
  stats?: {
    charactersCount: number;
    campaignsCount: number;
    friendsCount?: number;
  };
}

// Avatares temáticos padrão e elegantes do REALMOR
export const PRESET_AVATARS = [
  {
    id: 'avatar-arcanista',
    name: 'Arcanista de Wynna',
    url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=500&auto=format&fit=crop&q=80',
    description: 'Conjurador dos mistérios arcanos'
  },
  {
    id: 'avatar-guerreiro',
    name: 'Campeão de Khalmyr',
    url: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=500&auto=format&fit=crop&q=80',
    description: 'Guerreiro de armadura pesada'
  },
  {
    id: 'avatar-clerigo',
    name: 'Devoto de Valkaria',
    url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=500&auto=format&fit=crop&q=80',
    description: 'Guardião da fé e dos aventureiros'
  },
  {
    id: 'avatar-ladino',
    name: 'Sombra de Vectora',
    url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&auto=format&fit=crop&q=80',
    description: 'Especialista furtivo das tavernas'
  },
  {
    id: 'avatar-paladino',
    name: 'Paladino Sagrado',
    url: 'https://images.unsplash.com/photo-1514539079130-25950c84af65?w=500&auto=format&fit=crop&q=80',
    description: 'Defensor da justiça e da luz'
  },
  {
    id: 'avatar-druida',
    name: 'Guardião de Allihanna',
    url: 'https://images.unsplash.com/photo-1509281373149-e957c6296406?w=500&auto=format&fit=crop&q=80',
    description: 'Espírito livre da grande floresta'
  }
];

// Capas temáticas medievais de alta definição para o cabeçalho do perfil
export const PRESET_COVERS = [
  {
    id: 'cover-arton-citadel',
    name: 'Cidadela de Valkaria',
    url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1600&auto=format&fit=crop&q=80',
    tag: 'Reino'
  },
  {
    id: 'cover-dark-fortress',
    name: 'Fortaleza dos Ancestrais',
    url: 'https://images.unsplash.com/photo-1533158307587-828f0a76ef46?w=1600&auto=format&fit=crop&q=80',
    tag: 'Castelo'
  },
  {
    id: 'cover-mystic-library',
    name: 'Santuário dos Grimórios',
    url: 'https://images.unsplash.com/photo-1507842229451-9f0180ce270b?w=1600&auto=format&fit=crop&q=80',
    tag: 'Arcano'
  },
  {
    id: 'cover-mountain-peak',
    name: 'Picos Uivantes de Lannestull',
    url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1600&auto=format&fit=crop&q=80',
    tag: 'Montanha'
  },
  {
    id: 'cover-tormenta-sky',
    name: 'Céu Rubro de Artón',
    url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1600&auto=format&fit=crop&q=80',
    tag: 'Tormenta'
  }
];

export const UserProfileService = {
  /**
   * Obtém o perfil completo do usuário a partir do Firestore
   */
  async getUserProfile(uid: string): Promise<PlayerProfileData | null> {
    if (!uid) return null;
    try {
      const docRef = doc(db, 'users', uid);
      const snap = await getDoc(docRef);
      if (!snap.exists()) return null;
      return snap.data() as PlayerProfileData;
    } catch (error) {
      console.error('[UserProfileService] Erro ao buscar perfil do usuário:', error);
      return null;
    }
  },

  /**
   * Verifica se um username está disponível para uso
   */
  async checkUsernameAvailability(rawUsername: string, currentUid: string): Promise<{ available: boolean; cleanUsername: string; reason?: string }> {
    const cleanUsername = rawUsername
      .toLowerCase()
      .trim()
      .replace(/^@+/, '')
      .replace(/[^a-z0-9_]/g, '');

    if (cleanUsername.length < 3) {
      return { available: false, cleanUsername, reason: 'O nome de usuário deve ter pelo menos 3 caracteres.' };
    }
    if (cleanUsername.length > 30) {
      return { available: false, cleanUsername, reason: 'O nome de usuário deve ter no máximo 30 caracteres.' };
    }

    try {
      const q = query(collection(db, 'users'), where('username', '==', cleanUsername), limit(2));
      const querySnap = await getDocs(q);
      
      const isTaken = querySnap.docs.some(d => d.id !== currentUid);
      if (isTaken) {
        return { available: false, cleanUsername, reason: 'Este @nome de usuário já está em uso por outro aventureiro.' };
      }

      return { available: true, cleanUsername };
    } catch (err) {
      console.warn('[UserProfileService] Erro ao validar disponibilidade de username:', err);
      // Se houver erro de leitura na consulta de lista, permite continuar se for o próprio usuário
      return { available: true, cleanUsername };
    }
  },

  /**
   * Atualiza as informações do perfil do usuário no Firestore
   */
  async updateUserProfile(uid: string, data: Partial<PlayerProfileData>): Promise<void> {
    if (!uid) throw new Error('UID de usuário obrigatório para salvar perfil.');

    try {
      const docRef = doc(db, 'users', uid);
      const updatePayload: Record<string, any> = {
        ...data,
        updatedAt: serverTimestamp()
      };

      // Se displayName mudou, também atualiza name para compatibilidade
      if (data.displayName && !data.name) {
        updatePayload.name = data.displayName;
      }
      // Se photoURL mudou, sincroniza avatarUrl
      if (data.photoURL && !data.avatarUrl) {
        updatePayload.avatarUrl = data.photoURL;
      }
      if (data.avatarUrl && !data.photoURL) {
        updatePayload.photoURL = data.avatarUrl;
      }

      await setDoc(docRef, updatePayload, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${uid}`);
    }
  },

  /**
   * Upload de imagem de avatar para o Firebase Storage na pasta users/{uid}/profile/avatar
   */
  async uploadAvatar(file: File, uid: string): Promise<string> {
    if (!uid) throw new Error('Usuário não autenticado.');
    const result = await StorageService.uploadFile(file, {
      category: 'avatar',
      userId: uid,
      folder: `users/${uid}/profile/avatar`,
      name: `avatar_${Date.now()}`
    });
    return result.url;
  },

  /**
   * Upload de imagem de capa para o Firebase Storage na pasta users/{uid}/profile/cover
   */
  async uploadCover(file: File, uid: string): Promise<string> {
    if (!uid) throw new Error('Usuário não autenticado.');
    const result = await StorageService.uploadFile(file, {
      category: 'other',
      userId: uid,
      folder: `users/${uid}/profile/cover`,
      name: `cover_${Date.now()}`
    });
    return result.url;
  },

  /**
   * Coleta estatísticas reais do jogador a partir do banco de dados Firestore
   */
  async fetchRealUserStats(uid: string): Promise<UserStats> {
    if (!uid) return { charactersCount: 0, campaignsCount: 0, friendsCount: 0 };

    let charactersCount = 0;
    let campaignsCount = 0;
    let friendsCount = 0;

    // 1. Contagem real de personagens
    try {
      const charQuery = query(collection(db, 'characters'), where('uid', '==', uid));
      const charSnap = await getDocs(charQuery);
      charactersCount = charSnap.size;
    } catch (e) {
      console.debug('Erro ao contar personagens:', e);
    }

    // 2. Contagem real de campanhas
    try {
      const campQuery = query(collection(db, 'campaigns'), where('masterId', '==', uid));
      const campSnap = await getDocs(campQuery);
      campaignsCount = campSnap.size;
    } catch (e) {
      console.debug('Erro ao contar campanhas:', e);
    }

    // 3. Contagem real de amizades aceitas
    try {
      const friendsQuery = query(
        collection(db, 'friendships'),
        where('userIds', 'array-contains', uid),
        where('status', '==', 'accepted')
      );
      const friendsSnap = await getDocs(friendsQuery);
      friendsCount = friendsSnap.size;
    } catch (e) {
      console.debug('Erro ao contar amigos:', e);
    }

    return {
      charactersCount,
      campaignsCount,
      friendsCount
    };
  }
};
