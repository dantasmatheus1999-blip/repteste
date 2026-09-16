import { 
  db,
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  collection, 
  deleteDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  serverTimestamp 
} from '../../firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../../firebase/storage';
import { TestMap, TvSyncState } from './types';

const LOCAL_MAPS_KEY = 'realmor_local_test_maps';
const TV_LOCAL_KEY = 'realmor_tv_sync_current';

// Canal local de transmissão instantânea com 0 chamadas/escritas ao Firestore
let localTvChannel: BroadcastChannel | null = null;
try {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    localTvChannel = new BroadcastChannel('realmor_tv_sync_channel');
  }
} catch (e) {
  // Ignora se não for suportado
}

function getLocalMaps(): TestMap[] {
  try {
    const raw = localStorage.getItem(LOCAL_MAPS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {}
  return [];
}

function setLocalMaps(maps: TestMap[]) {
  try {
    localStorage.setItem(LOCAL_MAPS_KEY, JSON.stringify(maps));
  } catch (e) {}
}

// Mapas padrão de teste para garantir usabilidade imediata
export const SAMPLE_MAPS: TestMap[] = [
  {
    id: 'sample-taverna',
    name: 'Taverna do Javali Dourado',
    imageUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=1600&q=80',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    grid: { enabled: true, size: 50, color: 'rgba(217, 119, 6, 0.4)', opacity: 0.4 },
    markers: [
      { id: 'm-1', x: 35, y: 40, label: 'Balcão do Taverneiro', color: '#f59e0b', icon: 'chest' },
      { id: 'm-2', x: 62, y: 65, label: 'Mesa dos Aventureiros', color: '#10b981', icon: 'shield' }
    ]
  },
  {
    id: 'sample-cripta',
    name: 'Cripta dos Antigos Reis',
    imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1600&q=80',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    grid: { enabled: true, size: 60, color: 'rgba(147, 197, 253, 0.35)', opacity: 0.35 },
    markers: [
      { id: 'm-3', x: 50, y: 30, label: 'Sarcófago de Kaelen', color: '#ef4444', icon: 'skull' }
    ]
  },
  {
    id: 'sample-floresta',
    name: 'Clareira da Névoa Sombria',
    imageUrl: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1600&q=80',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    grid: { enabled: false, size: 50, color: 'rgba(217, 119, 6, 0.35)', opacity: 0.35 },
    markers: []
  }
];

const MAPS_COLLECTION = 'testMaps';

/**
 * Busca todos os mapas de teste.
 * Prioriza o cache local e sincroniza com o Firestore se disponível,
 * protegendo contra limites de cota gratuita (resource-exhausted).
 */
export async function fetchTestMaps(): Promise<TestMap[]> {
  const local = getLocalMaps();

  try {
    const colRef = collection(db, MAPS_COLLECTION);
    const snap = await getDocs(query(colRef));
    
    if (snap.empty) {
      if (local.length > 0) return local;
      setLocalMaps(SAMPLE_MAPS);
      return SAMPLE_MAPS;
    }

    const maps: TestMap[] = [];
    snap.forEach(docSnap => {
      const data = docSnap.data();
      maps.push({
        id: docSnap.id,
        name: data.name || 'Mapa Sem Nome',
        imageUrl: data.imageUrl || '',
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : (data.createdAt || new Date().toISOString()),
        updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : (data.updatedAt || new Date().toISOString()),
        grid: data.grid || { enabled: true, size: 50, color: 'rgba(217, 119, 6, 0.4)', opacity: 0.4 },
        fogData: data.fogData || '',
        markers: data.markers || []
      });
    });

    if (maps.length > 0) {
      setLocalMaps(maps);
      return maps;
    }
  } catch (err: any) {
    console.warn('[MapService] Não foi possível consultar mapas do Firestore (cota ou rede), usando armazenamento local:', err?.message || err);
  }

  // Fallback garantido usando cache local ou mapas de exemplo
  return local.length > 0 ? local : SAMPLE_MAPS;
}

/**
 * Salva ou atualiza um mapa de teste no armazenamento local e tenta o Firestore.
 * Não quebra caso a cota do Firestore tenha sido atingida.
 */
export async function saveTestMap(map: TestMap, contextTag?: string): Promise<void> {
  // 1. Sempre persiste imediatamente no armazenamento local
  const currentMaps = getLocalMaps();
  const existingIdx = currentMaps.findIndex(m => m.id === map.id);
  if (existingIdx >= 0) {
    currentMaps[existingIdx] = map;
  } else {
    currentMaps.push(map);
  }
  setLocalMaps(currentMaps);

  // 2. Tenta persistência remota no Firestore de forma não-bloqueante
  try {
    const reason = contextTag || 'map update';
    const docRef = doc(db, MAPS_COLLECTION, map.id);
    await setDoc(docRef, {
      ...map,
      updatedAt: serverTimestamp(),
      __diagnosticReason: reason
    }, { merge: true });
  } catch (err: any) {
    if (err?.code === 'resource-exhausted' || err?.message?.includes('Quota limit exceeded')) {
      console.warn('[MapService] Cota diária do Firestore atingida. O mapa está salvo com segurança no armazenamento local.');
      return;
    }
    console.warn('[MapService] Aviso ao salvar mapa no Firestore:', err);
  }
}

/**
 * Exclui um mapa de teste no armazenamento local e tenta o Firestore.
 */
export async function deleteTestMap(mapId: string): Promise<void> {
  // Remove localmente
  const currentMaps = getLocalMaps();
  setLocalMaps(currentMaps.filter(m => m.id !== mapId));

  try {
    console.log(`[Firestore WRITE] map delete - id: ${mapId}`);
    const docRef = doc(db, MAPS_COLLECTION, mapId);
    await deleteDoc(docRef);
  } catch (err: any) {
    if (err?.code === 'resource-exhausted' || err?.message?.includes('Quota limit exceeded')) {
      return;
    }
    console.warn('Erro ao excluir mapa no Firestore:', err);
  }
}

/**
 * Upload de imagem do mapa:
 * 1. Tenta Firebase Storage.
 * 2. Se falhar (ex.: regras ou CORS), faz fallback transparente para /api/upload-map do servidor Node/Express.
 */
export async function uploadMapImage(file: File): Promise<{ url: string; name: string }> {
  const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const uniqueName = `map_${Date.now()}_${cleanName}`;

  // 1. Tentar Firebase Storage
  try {
    const storageRef = ref(storage, `test_maps/${uniqueName}`);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadUrl = await getDownloadURL(snapshot.ref);
    return { url: downloadUrl, name: file.name.replace(/\.[^/.]+$/, '') };
  } catch (storageError) {
    console.warn('Firebase Storage indisponível ou bloqueado, utilizando servidor local Express...', storageError);
  }

  // 2. Fallback para /api/upload-map
  try {
    const formData = new FormData();
    formData.append('map', file);
    const response = await fetch('/api/upload-map', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error(`Falha no upload do servidor: ${response.statusText}`);
    }

    const data = await response.json();
    if (!data.url) {
      throw new Error('Servidor não retornou URL do arquivo');
    }

    return { url: data.url, name: file.name.replace(/\.[^/.]+$/, '') };
  } catch (serverError) {
    console.error('Erro em ambos os métodos de upload:', serverError);
    // Último recurso: Leitor local como base64 data URL
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve({
          url: reader.result as string,
          name: file.name.replace(/\.[^/.]+$/, '')
        });
      };
      reader.onerror = () => reject(new Error('Erro ao ler arquivo localmente'));
      reader.readAsDataURL(file);
    });
  }
}

/**
 * Transmite o estado completo do mapa atual para a TV:
 * - Publica diretamente no documento do Firestore test_tv_sync/current (Fonte da Verdade)
 * - Transmite via BroadcastChannel exclusivo para atualização instantânea na mesma máquina
 */
export async function broadcastToTv(state: TvSyncState): Promise<void> {
  // 1. Envio local imediato via BroadcastChannel seguro
  try {
    if (localTvChannel) {
      localTvChannel.postMessage({
        type: 'tv_sync_update',
        state
      });
    }
  } catch (e) {}

  // 2. Armazenamento local auxiliar
  try {
    localStorage.setItem(TV_LOCAL_KEY, JSON.stringify(state));
  } catch (e) {}

  // 3. Firestore como Fonte de Verdade para sincronização (com proteção de cota)
  try {
    const docRef = doc(db, 'test_tv_sync', 'current');
    await setDoc(docRef, {
      ...state,
      updatedAt: new Date().toISOString(),
      serverTimestamp: serverTimestamp(),
      __diagnosticReason: 'tv broadcast'
    });
  } catch (err: any) {
    if (err?.code === 'resource-exhausted' || err?.message?.includes('Quota limit exceeded')) {
      // Ignora erro de cota pois a transmissão local já foi concluída
      return;
    }
    console.warn('[TvSync] Erro ao transmitir para a TV no Firestore:', err);
    throw err;
  }
}

/**
 * Escuta atualizações de transmissão da TV em tempo real:
 * - FONTE DA VERDADE: Firestore onSnapshot no documento test_tv_sync/current
 * - SUPORTE LOCAL: BroadcastChannel (filtrado estritamente para não aceitar dados espúrios)
 * A TV é estritamente de leitura (não faz escritas nem heartbeats no Firestore).
 */
export function subscribeTvSync(callback: (state: TvSyncState | null) => void): () => void {
  // Listener seguro do BroadcastChannel (mesma máquina)
  const handleBroadcast = (event: MessageEvent) => {
    if (event.data && event.data.type === 'tv_sync_update' && event.data.state?.imageUrl) {
      callback(event.data.state as TvSyncState);
    }
  };

  if (localTvChannel) {
    localTvChannel.addEventListener('message', handleBroadcast);
  }

  // Listener principal do Firestore onSnapshot (Fonte da Verdade)
  let unsubFirestore = () => {};
  try {
    const docRef = doc(db, 'test_tv_sync', 'current');
    unsubFirestore = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as TvSyncState;
        if (data && data.imageUrl) {
          callback(data);
        }
      }
    }, (err) => {
      console.warn('[TvSync] Listener remoto do Firestore em test_tv_sync:', err?.message || err);
    });
  } catch (e) {
    console.warn('[TvSync] Falha ao iniciar listener onSnapshot:', e);
  }

  return () => {
    if (localTvChannel) {
      localTvChannel.removeEventListener('message', handleBroadcast);
    }
    unsubFirestore();
  };
}

/**
 * Heartbeat desativado conforme especificações (TV é somente leitura, sem heartbeat no Firestore ou canal).
 */
export async function sendTvHeartbeat(): Promise<void> {
  // No-op intencional para manter compatibilidade com chamadas antigas sem poluir canais
}
