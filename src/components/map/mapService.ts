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
import { StorageService } from '../../services/storageService';
import { TestMap, MapFolder, TvSyncState } from './types';

const LOCAL_MAPS_KEY = 'realmor_local_test_maps';
const LOCAL_FOLDERS_KEY = 'realmor_local_map_folders';
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

export const SAMPLE_FOLDERS: MapFolder[] = [];

function getLocalFolders(): MapFolder[] {
  try {
    const raw = localStorage.getItem(LOCAL_FOLDERS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        // Filtra pastas de exemplo legadas e qualquer pasta física automática
        return parsed.filter((f: any) => 
          f && f.id &&
          f.id !== 'folder-realmor' &&
          f.id !== 'folder-norte' &&
          f.id !== 'folder-aventuras' &&
          f.name !== 'MAPAS SEM ORGANIZAÇÃO' &&
          f.name !== 'Mapas sem organização' &&
          f.id !== 'unorganized'
        );
      }
    }
  } catch (e) {}
  return [];
}

function setLocalFolders(folders: MapFolder[]) {
  try {
    localStorage.setItem(LOCAL_FOLDERS_KEY, JSON.stringify(folders));
  } catch (e) {}
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

// Mapas padrão de teste (iniciam sem pasta)
export const SAMPLE_MAPS: TestMap[] = [
  {
    id: 'sample-taverna',
    name: 'Taverna do Javali Dourado',
    imageUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=1600&q=80',
    folderId: undefined,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    grid: { enabled: true, size: 50, color: '#FFFFFF', opacity: 0.35, thickness: 1.2 },
    markers: [
      { id: 'm-1', x: 35, y: 40, label: 'Balcão do Taverneiro', color: '#f59e0b', icon: 'chest' },
      { id: 'm-2', x: 62, y: 65, label: 'Mesa dos Aventureiros', color: '#10b981', icon: 'shield' }
    ]
  },
  {
    id: 'sample-cripta',
    name: 'Cripta dos Antigos Reis',
    imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1600&q=80',
    folderId: undefined,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    grid: { enabled: true, size: 60, color: '#FFFFFF', opacity: 0.35, thickness: 1.2 },
    markers: [
      { id: 'm-3', x: 50, y: 30, label: 'Sarcófago de Kaelen', color: '#ef4444', icon: 'skull' }
    ]
  },
  {
    id: 'sample-floresta',
    name: 'Clareira da Névoa Sombria',
    imageUrl: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1600&q=80',
    folderId: undefined,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    grid: { enabled: false, size: 50, color: '#FFFFFF', opacity: 0.35, thickness: 1.2 },
    markers: []
  }
];

const MAPS_COLLECTION = 'testMaps';
const FOLDERS_COLLECTION = 'mapFolders';

/**
 * Busca todas as pastas de mapas criadas pelo usuário.
 * Não cria pastas automáticas.
 */
export async function fetchMapFolders(): Promise<MapFolder[]> {
  const local = getLocalFolders();

  try {
    const colRef = collection(db, FOLDERS_COLLECTION);
    const snap = await getDocs(query(colRef));

    if (snap.empty) {
      return local;
    }

    const folders: MapFolder[] = [];
    snap.forEach(docSnap => {
      const data = docSnap.data();
      const folderId = docSnap.id;
      // Não carregar pastas automáticas legadas
      if (
        folderId === 'folder-realmor' ||
        folderId === 'folder-norte' ||
        folderId === 'folder-aventuras' ||
        folderId === 'unorganized' ||
        data.name === 'MAPAS SEM ORGANIZAÇÃO' ||
        data.name === 'Mapas sem organização'
      ) {
        return;
      }

      folders.push({
        id: folderId,
        name: data.name || 'Nova Pasta',
        description: data.description || '',
        icon: data.icon || '📁',
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : (data.createdAt || new Date().toISOString()),
        updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : (data.updatedAt || new Date().toISOString())
      });
    });

    setLocalFolders(folders);
    return folders;
  } catch (err: any) {
    console.warn('[MapService] Não foi possível consultar pastas do Firestore (cota ou rede), usando armazenamento local:', err?.message || err);
  }

  return local;
}

/**
 * Salva ou atualiza uma pasta de mapas no Firestore e localmente (1 write pontual).
 */
export async function saveMapFolder(folder: MapFolder): Promise<void> {
  const currentFolders = getLocalFolders();
  const existingIdx = currentFolders.findIndex(f => f.id === folder.id);
  if (existingIdx >= 0) {
    currentFolders[existingIdx] = folder;
  } else {
    currentFolders.push(folder);
  }
  setLocalFolders(currentFolders);

  try {
    const docRef = doc(db, FOLDERS_COLLECTION, folder.id);
    await setDoc(docRef, {
      ...folder,
      updatedAt: serverTimestamp(),
      __diagnosticReason: 'folder save'
    }, { merge: true });
  } catch (err: any) {
    if (err?.code === 'resource-exhausted' || err?.message?.includes('Quota limit exceeded')) {
      console.warn('[MapService] Cota atingida. Pasta salva localmente com segurança.');
      return;
    }
    console.warn('[MapService] Aviso ao salvar pasta no Firestore:', err);
  }
}

/**
 * Exclui uma pasta de mapas no Firestore e localmente (1 delete pontual).
 */
export async function deleteMapFolder(folderId: string): Promise<void> {
  const currentFolders = getLocalFolders();
  setLocalFolders(currentFolders.filter(f => f.id !== folderId));

  // Também desvincula os mapas que pertenciam a essa pasta para 'unorganized'
  const currentMaps = getLocalMaps();
  let updatedAnyMap = false;
  const newMaps = currentMaps.map(m => {
    if (m.folderId === folderId) {
      updatedAnyMap = true;
      return { ...m, folderId: undefined };
    }
    return m;
  });
  if (updatedAnyMap) {
    setLocalMaps(newMaps);
  }

  try {
    const docRef = doc(db, FOLDERS_COLLECTION, folderId);
    await deleteDoc(docRef);
  } catch (err: any) {
    if (err?.code === 'resource-exhausted' || err?.message?.includes('Quota limit exceeded')) {
      return;
    }
    console.warn('[MapService] Erro ao excluir pasta no Firestore:', err);
  }
}

/**
 * Busca todos os mapas de teste.
 * Prioriza o cache local e sincroniza com o Firestore se disponível.
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
        folderId: data.folderId || undefined,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : (data.createdAt || new Date().toISOString()),
        updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : (data.updatedAt || new Date().toISOString()),
        grid: data.grid || { enabled: true, size: 50, color: 'rgba(217, 119, 6, 0.4)', opacity: 0.4 },
        fogData: data.fogData || '',
        fogSettings: data.fogSettings || undefined,
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
 * Mover mapa de pasta sem duplicar imagens nem outros dados (1 write no Firestore).
 */
export async function moveMapToFolder(mapId: string, folderId: string | undefined): Promise<void> {
  const currentMaps = getLocalMaps();
  const targetMap = currentMaps.find(m => m.id === mapId);
  if (targetMap) {
    targetMap.folderId = folderId;
    targetMap.updatedAt = new Date().toISOString();
    setLocalMaps(currentMaps);
    await saveTestMap(targetMap, 'map move folder');
  }
}

/**
 * Renomear mapa pontualmente (1 write no Firestore).
 */
export async function renameMap(mapId: string, newName: string): Promise<void> {
  const currentMaps = getLocalMaps();
  const targetMap = currentMaps.find(m => m.id === mapId);
  if (targetMap) {
    targetMap.name = newName;
    targetMap.updatedAt = new Date().toISOString();
    setLocalMaps(currentMaps);
    await saveTestMap(targetMap, 'map rename');
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
 * Armazena PERMANENTEMENTE no Firebase Storage e registra metadados no Firestore.
 */
export async function uploadMapImage(file: File): Promise<{ url: string; name: string }> {
  const baseName = file.name.replace(/\.[^/.]+$/, '');
  const metadata = await StorageService.uploadFile(file, {
    category: 'map',
    name: baseName,
    folder: 'maps'
  });

  return {
    url: metadata.url,
    name: metadata.name
  };
}

/**
 * Remove recursivamente todas as propriedades undefined ou valores inválidos
 * para evitar rejeição de escrita no Firestore (FirebaseError: Unsupported field value: undefined).
 */
export function sanitizeForFirestore<T>(obj: T): T {
  if (obj === null || obj === undefined) {
    return null as any;
  }
  if (Array.isArray(obj)) {
    return obj
      .filter(item => item !== undefined)
      .map(item => sanitizeForFirestore(item)) as any;
  }
  if (typeof obj === 'object') {
    if (obj.constructor && obj.constructor.name !== 'Object') {
      return obj;
    }
    const cleanObj: Record<string, any> = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined) {
        cleanObj[key] = sanitizeForFirestore(value);
      }
    }
    return cleanObj as any;
  }
  return obj;
}

/**
 * Obtém o último estado transmitido para a TV salvo localmente.
 */
export function getStoredTvState(): TvSyncState | null {
  try {
    const saved = localStorage.getItem(TV_LOCAL_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && (parsed.imageUrl || (parsed.quadrants && parsed.quadrants.length > 0))) {
        return parsed as TvSyncState;
      }
    }
  } catch (e) {}
  return null;
}

/**
 * Transmite o estado completo do mapa atual para a TV:
 * - Publica diretamente no documento do Firestore test_tv_sync/current (Fonte da Verdade)
 * - Transmite via BroadcastChannel exclusivo para atualização instantânea na mesma máquina
 */
export async function broadcastToTv(state: TvSyncState): Promise<void> {
  const sanitized = sanitizeForFirestore(state);

  // 1. Envio local imediato via BroadcastChannel seguro
  try {
    if (localTvChannel) {
      localTvChannel.postMessage({
        type: 'tv_sync_update',
        state: sanitized
      });
    }
  } catch (e) {}

  // 2. Armazenamento local auxiliar
  try {
    localStorage.setItem(TV_LOCAL_KEY, JSON.stringify(sanitized));
  } catch (e) {}

  // 3. Firestore como Fonte de Verdade para sincronização (com proteção de cota)
  try {
    const docRef = doc(db, 'test_tv_sync', 'current');
    await setDoc(docRef, {
      ...sanitized,
      updatedAt: new Date().toISOString(),
      serverTimestamp: serverTimestamp(),
      __diagnosticReason: 'tv broadcast'
    });
  } catch (err: any) {
    if (err?.code === 'resource-exhausted' || err?.message?.includes('Quota limit exceeded')) {
      // Ignora erro de cota pois a transmissão local já foi concluída
      return;
    }
    console.error('[TvSync] Erro ao transmitir para a TV no Firestore:', err);
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
  // Notifica imediatamente com estado local se disponível para evitar tela vazia na inicialização
  const localInitial = getStoredTvState();
  if (localInitial) {
    try {
      callback(localInitial);
    } catch (e) {}
  }

  // Listener seguro do BroadcastChannel (mesma máquina)
  const handleBroadcast = (event: MessageEvent) => {
    if (event.data && event.data.type === 'tv_sync_update') {
      const bState = event.data.state as TvSyncState;
      if (bState && (bState.imageUrl || (bState.quadrants && bState.quadrants.length > 0))) {
        callback(bState);
      }
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
        if (data && (data.imageUrl || (data.quadrants && data.quadrants.length > 0))) {
          try {
            localStorage.setItem(TV_LOCAL_KEY, JSON.stringify(data));
          } catch (e) {}
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
