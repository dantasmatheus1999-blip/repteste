import { doc, getDoc, setDoc, deleteDoc, onSnapshot, serverTimestamp, updateDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase/firestore';

export interface CampaignMapData {
  campaignId: string;
  imageUrl: string;
  name?: string;
  updatedAt: number;
  uploadedBy?: string;
  originalWidth?: number;
  originalHeight?: number;
}

export type AnnotationTool = 'pan' | 'pen' | 'circle' | 'arrow' | 'text' | 'pin' | 'eraser';

export interface Point {
  x: number; // Porcentagem de 0 a 100 em relação à largura original da imagem
  y: number; // Porcentagem de 0 a 100 em relação à altura original da imagem
}

export interface FreehandStroke {
  id: string;
  type: 'stroke';
  points: Point[];
  color: string;
  width: number;
  createdAt: number;
}

export interface ShapeAnnotation {
  id: string;
  type: 'circle' | 'arrow';
  start: Point;
  end: Point;
  color: string;
  width: number;
  createdAt: number;
}

export interface TextAnnotation {
  id: string;
  type: 'text';
  point: Point;
  text: string;
  color: string;
  fontSize: number;
  createdAt: number;
}

export interface PinAnnotation {
  id: string;
  type: 'pin';
  point: Point;
  icon: string; // 'pin' | 'combat' | 'castle' | 'danger' | 'treasure' | 'star'
  label?: string;
  color: string;
  createdAt: number;
}

export type MapAnnotationItem = FreehandStroke | ShapeAnnotation | TextAnnotation | PinAnnotation;

export interface PlayerAnnotationsData {
  campaignId: string;
  playerId: string;
  playerName?: string;
  items: MapAnnotationItem[];
  updatedAt: number;
}

const LOCAL_STORAGE_PREFIX_MAP = 'mythos_campaign_map_';
const LOCAL_STORAGE_PREFIX_ANNOTATIONS = 'mythos_campaign_annotations_';

export const CampaignMapService = {
  /**
   * Obtém os dados do Mapa da Campanha a partir do Firestore (com fallback para cache local)
   */
  async getCampaignMap(campaignId: string): Promise<CampaignMapData | null> {
    if (!campaignId) return null;

    // 1. Tenta carregar do Firestore (campaign_maps/{campaignId})
    try {
      const mapDocRef = doc(db, 'campaign_maps', campaignId);
      const snap = await getDoc(mapDocRef);
      if (snap.exists()) {
        const data = snap.data() as CampaignMapData;
        try {
          localStorage.setItem(`${LOCAL_STORAGE_PREFIX_MAP}${campaignId}`, JSON.stringify(data));
        } catch (_) {}
        return data;
      }
    } catch (err) {
      console.warn('[CampaignMapService] Falha ao ler campaign_maps, tentando campaigns/{id}:', err);
    }

    // 2. Tenta carregar do próprio documento da campanha (campaigns/{campaignId})
    try {
      const campDocRef = doc(db, 'campaigns', campaignId);
      const campSnap = await getDoc(campDocRef);
      if (campSnap.exists()) {
        const campData = campSnap.data();
        if (campData?.campaignMap?.imageUrl) {
          const mapData: CampaignMapData = {
            campaignId,
            imageUrl: campData.campaignMap.imageUrl,
            name: campData.campaignMap.name || 'Mapa da Campanha',
            updatedAt: campData.campaignMap.updatedAt || Date.now(),
            uploadedBy: campData.campaignMap.uploadedBy,
            originalWidth: campData.campaignMap.originalWidth,
            originalHeight: campData.campaignMap.originalHeight
          };
          try {
            localStorage.setItem(`${LOCAL_STORAGE_PREFIX_MAP}${campaignId}`, JSON.stringify(mapData));
          } catch (_) {}
          return mapData;
        }
      }
    } catch (err) {
      console.warn('[CampaignMapService] Falha ao ler campaigns/{id}:', err);
    }

    // 3. Fallback: cache local
    try {
      const cached = localStorage.getItem(`${LOCAL_STORAGE_PREFIX_MAP}${campaignId}`);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (_) {}

    return null;
  },

  /**
   * Assina em tempo real o Mapa da Campanha para Mestre e Jogadores
   */
  subscribeToCampaignMap(campaignId: string, callback: (map: CampaignMapData | null) => void): () => void {
    if (!campaignId) {
      callback(null);
      return () => {};
    }

    // Carrega cache local instantâneo enquanto o Firestore sincroniza
    try {
      const cached = localStorage.getItem(`${LOCAL_STORAGE_PREFIX_MAP}${campaignId}`);
      if (cached) {
        callback(JSON.parse(cached));
      }
    } catch (_) {}

    const mapDocRef = doc(db, 'campaign_maps', campaignId);
    const unsubscribe = onSnapshot(
      mapDocRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data() as CampaignMapData;
          try {
            localStorage.setItem(`${LOCAL_STORAGE_PREFIX_MAP}${campaignId}`, JSON.stringify(data));
          } catch (_) {}
          callback(data);
        } else {
          // Se não existir em campaign_maps, tenta verificar a campanha
          CampaignMapService.getCampaignMap(campaignId).then((mapData) => {
            if (mapData) {
              callback(mapData);
            } else {
              callback(null);
            }
          });
        }
      },
      (error) => {
        console.warn('[CampaignMapService] Erro no listener do mapa da campanha:', error);
        // Fallback para cache local se disponível
        try {
          const cached = localStorage.getItem(`${LOCAL_STORAGE_PREFIX_MAP}${campaignId}`);
          if (cached) callback(JSON.parse(cached));
        } catch (_) {}
      }
    );

    return unsubscribe;
  },

  /**
   * Salva ou atualiza a imagem do Mapa da Campanha enviado pelo Mestre
   */
  async saveCampaignMap(campaignId: string, mapData: {
    imageUrl: string;
    name?: string;
    uploadedBy?: string;
    originalWidth?: number;
    originalHeight?: number;
  }): Promise<void> {
    if (!campaignId || !mapData.imageUrl) {
      throw new Error('ID da campanha e URL da imagem são obrigatórios');
    }

    const payload: CampaignMapData = {
      campaignId,
      imageUrl: mapData.imageUrl,
      name: mapData.name || 'Mapa da Campanha',
      updatedAt: Date.now(),
      uploadedBy: mapData.uploadedBy,
      originalWidth: mapData.originalWidth,
      originalHeight: mapData.originalHeight
    };

    // 1. Atualiza cache local imediatamente
    try {
      localStorage.setItem(`${LOCAL_STORAGE_PREFIX_MAP}${campaignId}`, JSON.stringify(payload));
    } catch (_) {}

    // 2. Salva em campaign_maps/{campaignId}
    const mapDocRef = doc(db, 'campaign_maps', campaignId);
    try {
      await setDoc(mapDocRef, payload, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `campaign_maps/${campaignId}`);
    }

    // 3. Sincroniza também no documento da campanha campaigns/{campaignId}
    try {
      const campDocRef = doc(db, 'campaigns', campaignId);
      await updateDoc(campDocRef, {
        campaignMap: payload,
        campaignMapUrl: payload.imageUrl,
        updatedAt: serverTimestamp()
      });
    } catch (campErr) {
      console.warn('[CampaignMapService] Aviso ao atualizar campo na campanha:', campErr);
    }
  },

  /**
   * Remove o Mapa da Campanha
   */
  async deleteCampaignMap(campaignId: string): Promise<void> {
    if (!campaignId) return;

    try {
      localStorage.removeItem(`${LOCAL_STORAGE_PREFIX_MAP}${campaignId}`);
    } catch (_) {}

    try {
      await deleteDoc(doc(db, 'campaign_maps', campaignId));
    } catch (err) {
      console.warn('[CampaignMapService] Falha ao deletar campaign_maps:', err);
    }

    try {
      const campDocRef = doc(db, 'campaigns', campaignId);
      await updateDoc(campDocRef, {
        campaignMap: null,
        campaignMapUrl: null
      });
    } catch (_) {}
  },

  // =========================================================================
  // ANOTAÇÕES PESSOAIS DO JOGADOR
  // =========================================================================

  /**
   * Assina em tempo real as anotações pessoais do jogador nesta campanha
   */
  subscribeToPlayerAnnotations(
    campaignId: string,
    playerId: string,
    callback: (data: PlayerAnnotationsData | null) => void
  ): () => void {
    if (!campaignId || !playerId) {
      callback(null);
      return () => {};
    }

    const docId = `${campaignId}_${playerId}`;
    const storageKey = `${LOCAL_STORAGE_PREFIX_ANNOTATIONS}${docId}`;

    // Leitura imediata do cache local
    try {
      const cached = localStorage.getItem(storageKey);
      if (cached) {
        callback(JSON.parse(cached));
      }
    } catch (_) {}

    const docRef = doc(db, 'campaign_annotations', docId);
    const unsubscribe = onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data() as PlayerAnnotationsData;
          try {
            localStorage.setItem(storageKey, JSON.stringify(data));
          } catch (_) {}
          callback(data);
        } else {
          // Se não existir no Firestore, tenta manter o local se houver
          try {
            const cached = localStorage.getItem(storageKey);
            if (cached) {
              callback(JSON.parse(cached));
              return;
            }
          } catch (_) {}
          callback({
            campaignId,
            playerId,
            items: [],
            updatedAt: Date.now()
          });
        }
      },
      (error) => {
        console.warn('[CampaignMapService] Erro ao sincronizar anotações:', error);
        // Usa cache local
        try {
          const cached = localStorage.getItem(storageKey);
          if (cached) callback(JSON.parse(cached));
        } catch (_) {}
      }
    );

    return unsubscribe;
  },

  /**
   * Salva a lista de anotações do jogador no Firestore e no cache local
   */
  async savePlayerAnnotations(
    campaignId: string,
    playerId: string,
    items: MapAnnotationItem[],
    playerName?: string
  ): Promise<void> {
    if (!campaignId || !playerId) return;

    const docId = `${campaignId}_${playerId}`;
    const storageKey = `${LOCAL_STORAGE_PREFIX_ANNOTATIONS}${docId}`;

    const payload: PlayerAnnotationsData = {
      campaignId,
      playerId,
      playerName: playerName || '',
      items,
      updatedAt: Date.now()
    };

    // 1. Salva no localStorage imediatamente para UX sem latência
    try {
      localStorage.setItem(storageKey, JSON.stringify(payload));
    } catch (_) {}

    // 2. Salva no Firestore
    try {
      const docRef = doc(db, 'campaign_annotations', docId);
      await setDoc(docRef, payload, { merge: true });
    } catch (err) {
      console.warn('[CampaignMapService] Erro ao salvar anotações no Firestore:', err);
      // O localStorage garante persistência local mesmo offline
    }
  },

  /**
   * Limpa todas as anotações pessoais do jogador
   */
  async clearPlayerAnnotations(campaignId: string, playerId: string): Promise<void> {
    await this.savePlayerAnnotations(campaignId, playerId, []);
  }
};
