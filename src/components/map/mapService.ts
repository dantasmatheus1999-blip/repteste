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
  where,
  orderBy, 
  serverTimestamp 
} from '../../firebase/firestore';
import { auth } from '../../firebase/auth';
import { storage, ref, uploadBytes, getDownloadURL, deleteObject } from '../../firebase/storage';
import { StorageService } from '../../services/storageService';
import { TestMap, MapFolder, TvSyncState } from './types';

// Chaves locais isoladas por UID
const TV_LOCAL_KEY = 'realmor_tv_sync_current';

function getMapsStorageKey(userId?: string): string {
  const uid = userId || auth.currentUser?.uid;
  return uid ? `realmor_local_test_maps_${uid}` : 'realmor_local_test_maps_guest';
}

function getFoldersStorageKey(userId?: string): string {
  const uid = userId || auth.currentUser?.uid;
  return uid ? `realmor_local_map_folders_${uid}` : 'realmor_local_map_folders_guest';
}

// Canal local de transmissão instantânea com 0 chamadas/escritas ao Firestore
let localTvChannel: BroadcastChannel | null = null;
try {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    localTvChannel = new BroadcastChannel('realmor_tv_sync_channel');
  }
} catch (e) {
  // Ignora se não for suportado
}

// Constantes vazias para assegurar que novas contas começam sem dados de demonstração
export const SAMPLE_FOLDERS: MapFolder[] = [];
export const SAMPLE_MAPS: TestMap[] = [];

function getLocalFolders(userId?: string): MapFolder[] {
  try {
    const raw = localStorage.getItem(getFoldersStorageKey(userId));
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
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

function setLocalFolders(folders: MapFolder[], userId?: string) {
  try {
    localStorage.setItem(getFoldersStorageKey(userId), JSON.stringify(folders));
  } catch (e) {}
}

function getLocalMaps(userId?: string): TestMap[] {
  try {
    const raw = localStorage.getItem(getMapsStorageKey(userId));
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (e) {}
  return [];
}

function setLocalMaps(maps: TestMap[], userId?: string) {
  try {
    localStorage.setItem(getMapsStorageKey(userId), JSON.stringify(maps));
  } catch (e) {}
}

const MAPS_COLLECTION = 'testMaps';
const FOLDERS_COLLECTION = 'mapFolders';

/**
 * Busca todas as pastas de mapas criadas exclusivamente pelo usuário autenticado.
 * Não cria pastas automáticas e não traz dados de outros usuários.
 */
export async function fetchMapFolders(userId?: string): Promise<MapFolder[]> {
  const uid = userId || auth.currentUser?.uid;
  if (!uid) {
    return [];
  }

  const local = getLocalFolders(uid);

  try {
    const colRef = collection(db, FOLDERS_COLLECTION);
    let snap = await getDocs(query(colRef, where('userId', '==', uid)));
    if (snap.empty) {
      snap = await getDocs(query(colRef, where('ownerId', '==', uid)));
    }

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
        userId: data.userId || uid,
        ownerId: data.ownerId || data.userId || uid,
        name: data.name || 'Nova Pasta',
        description: data.description || '',
        icon: data.icon || '📁',
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : (data.createdAt || new Date().toISOString()),
        updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : (data.updatedAt || new Date().toISOString())
      });
    });

    setLocalFolders(folders, uid);
    return folders;
  } catch (err: any) {
    console.warn('[MapService] Não foi possível consultar pastas do Firestore, usando armazenamento local do usuário:', err?.message || err);
  }

  return local;
}

/**
 * Salva ou atualiza uma pasta de mapas no Firestore e localmente vinculada ao UID.
 */
export async function saveMapFolder(folder: MapFolder, userId?: string): Promise<void> {
  const uid = userId || folder.userId || auth.currentUser?.uid;
  if (!uid) {
    throw new Error('Usuário não autenticado para salvar pasta.');
  }

  const folderWithUser: MapFolder = {
    ...folder,
    userId: uid,
    ownerId: uid
  };

  const currentFolders = getLocalFolders(uid);
  const existingIdx = currentFolders.findIndex(f => f.id === folder.id);
  if (existingIdx >= 0) {
    currentFolders[existingIdx] = folderWithUser;
  } else {
    currentFolders.push(folderWithUser);
  }
  setLocalFolders(currentFolders, uid);

  try {
    const docRef = doc(db, FOLDERS_COLLECTION, folder.id);
    await setDoc(docRef, sanitizeForFirestore({
      ...folderWithUser,
      updatedAt: serverTimestamp(),
      __diagnosticReason: 'folder save'
    }), { merge: true });
  } catch (err: any) {
    if (err?.code === 'resource-exhausted' || err?.message?.includes('Quota limit exceeded')) {
      console.warn('[MapService] Cota atingida. Pasta salva localmente com segurança.');
      return;
    }
    console.warn('[MapService] Aviso ao salvar pasta no Firestore:', err);
  }
}

/**
 * Exclui uma pasta de mapas no Firestore e localmente.
 */
export async function deleteMapFolder(folderId: string, userId?: string): Promise<void> {
  const uid = userId || auth.currentUser?.uid;
  const currentFolders = getLocalFolders(uid);
  setLocalFolders(currentFolders.filter(f => f.id !== folderId), uid);

  // Também desvincula os mapas que pertenciam a essa pasta para 'unorganized'
  const currentMaps = getLocalMaps(uid);
  let updatedAnyMap = false;
  const newMaps = currentMaps.map(m => {
    if (m.folderId === folderId) {
      updatedAnyMap = true;
      return { ...m, folderId: undefined };
    }
    return m;
  });
  if (updatedAnyMap) {
    setLocalMaps(newMaps, uid);
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
 * Busca todos os mapas de teste pertencentes exclusivamente ao UID do usuário autenticado.
 * NUNCA consulta mapas de outros usuários nem insere mapas de demonstração.
 */
export async function fetchTestMaps(userId?: string): Promise<TestMap[]> {
  const uid = userId || auth.currentUser?.uid;
  if (!uid) {
    // Nova conta ou usuário deslogado começa com biblioteca vazia
    return [];
  }

  const local = getLocalMaps(uid);

  try {
    const colRef = collection(db, MAPS_COLLECTION);
    let snap = await getDocs(query(colRef, where('userId', '==', uid)));
    if (snap.empty) {
      snap = await getDocs(query(colRef, where('ownerId', '==', uid)));
    }
    
    if (snap.empty) {
      // Se não há mapas no Firestore para este UID, a biblioteca é vazia
      setLocalMaps([], uid);
      return [];
    }

    const maps: TestMap[] = [];
    snap.forEach(docSnap => {
      const data = docSnap.data();
      maps.push({
        id: docSnap.id,
        userId: data.userId || uid,
        ownerId: data.ownerId || data.userId || uid,
        name: data.name || 'Mapa Sem Nome',
        fileName: data.fileName || '',
        storagePath: data.storagePath || '',
        imageUrl: data.imageUrl || '',
        fileSize: data.fileSize || 0,
        mimeType: data.mimeType || 'image/png',
        folderId: data.folderId || undefined,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : (data.createdAt || new Date().toISOString()),
        updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : (data.updatedAt || new Date().toISOString()),
        grid: data.grid || { enabled: true, size: 50, color: 'rgba(217, 119, 6, 0.4)', opacity: 0.4 },
        fogData: data.fogData || '',
        fogSettings: data.fogSettings || undefined,
        markers: data.markers || [],
        drawings: data.drawings || [],
        shapes: data.shapes || [],
        visionAreas: data.visionAreas || []
      });
    });

    setLocalMaps(maps, uid);
    return maps;
  } catch (err: any) {
    console.warn('[MapService] Não foi possível consultar mapas do Firestore, usando armazenamento local do usuário:', err?.message || err);
  }

  // Fallback seguro usando apenas o cache local deste usuário
  return local;
}

/**
 * Salva ou atualiza um mapa de teste no armazenamento local e no Firestore vinculado ao UID.
 */
export async function saveTestMap(map: TestMap, contextTag?: string): Promise<void> {
  const uid = map.userId || auth.currentUser?.uid;
  if (!uid) {
    throw new Error('Usuário não autenticado para salvar mapas na biblioteca.');
  }

  const mapWithUser: TestMap = {
    ...map,
    userId: uid,
    ownerId: map.ownerId || uid
  };

  // 1. Sempre persiste imediatamente no armazenamento local exclusivo deste usuário
  const currentMaps = getLocalMaps(uid);
  const existingIdx = currentMaps.findIndex(m => m.id === mapWithUser.id);
  if (existingIdx >= 0) {
    currentMaps[existingIdx] = mapWithUser;
  } else {
    currentMaps.push(mapWithUser);
  }
  setLocalMaps(currentMaps, uid);

  // 2. Persistência remota no Firestore com userId e ownerId validados
  try {
    const reason = contextTag || 'map update';
    const docRef = doc(db, MAPS_COLLECTION, mapWithUser.id);
    await setDoc(docRef, sanitizeForFirestore({
      ...mapWithUser,
      userId: uid,
      ownerId: uid,
      updatedAt: serverTimestamp(),
      __diagnosticReason: reason
    }), { merge: true });
  } catch (err: any) {
    if (err?.code === 'resource-exhausted' || err?.message?.includes('Quota limit exceeded')) {
      console.warn('[MapService] Cota diária do Firestore atingida. O mapa está salvo com segurança no armazenamento local.');
      return;
    }
    console.warn('[MapService] Aviso ao salvar mapa no Firestore:', err);
  }
}

/**
 * Mover mapa de pasta (atualiza o proprietário e a pasta).
 */
export async function moveMapToFolder(mapId: string, folderId: string | undefined, userId?: string): Promise<void> {
  const uid = userId || auth.currentUser?.uid;
  const currentMaps = getLocalMaps(uid);
  const targetMap = currentMaps.find(m => m.id === mapId);
  if (targetMap) {
    targetMap.folderId = folderId;
    targetMap.updatedAt = new Date().toISOString();
    setLocalMaps(currentMaps, uid);
    await saveTestMap(targetMap, 'map move folder');
  }
}

/**
 * Renomear mapa pontualmente.
 */
export async function renameMap(mapId: string, newName: string, userId?: string): Promise<void> {
  const uid = userId || auth.currentUser?.uid;
  const currentMaps = getLocalMaps(uid);
  const targetMap = currentMaps.find(m => m.id === mapId);
  if (targetMap) {
    targetMap.name = newName;
    targetMap.updatedAt = new Date().toISOString();
    setLocalMaps(currentMaps, uid);
    await saveTestMap(targetMap, 'map rename');
  }
}

/**
 * Exclui um mapa de teste definitivamente do armazenamento local, do Firestore e do Firebase Storage.
 */
export async function deleteTestMap(mapId: string, storagePath?: string, userId?: string): Promise<void> {
  const uid = userId || auth.currentUser?.uid;
  
  // 1. Remove do cache local do usuário
  if (uid) {
    const currentMaps = getLocalMaps(uid);
    setLocalMaps(currentMaps.filter(m => m.id !== mapId), uid);
  }

  // 2. Remove o arquivo físico correspondente do Firebase Storage se houver caminho
  if (storagePath) {
    try {
      const fileRef = ref(storage, storagePath);
      await deleteObject(fileRef);
      console.log(`[Storage DELETE] Arquivo do mapa excluído com sucesso: ${storagePath}`);
    } catch (storageErr) {
      console.warn('[MapService] Aviso ao excluir arquivo do Firebase Storage (já removido ou inacessível):', storageErr);
    }
  }

  // 3. Remove o registro correspondente do Firestore
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

export const MAX_MAP_FILE_SIZE = 50 * 1024 * 1024; // 50 MB = 52.428.800 bytes

/**
 * Upload de imagem do mapa na Biblioteca Pessoal do Mestre:
 * Salva no caminho exclusivo: maps/{uid}/{mapId}/{arquivo}
 * e retorna metadados completos para gravação no Firestore.
 */
export async function uploadMapImage(
  file: File, 
  mapId?: string, 
  userId?: string
): Promise<{ url: string; name: string; storagePath: string; size: number; mimeType: string }> {
  if (file.size > MAX_MAP_FILE_SIZE) {
    throw new Error('O arquivo é muito grande. O limite máximo para o mapa é de 50 MB.');
  }

  const currentUser = auth.currentUser;
  const uid = userId || currentUser?.uid;
  if (!uid) {
    throw new Error('Usuário não autenticado. Faça login para fazer upload de mapas para sua biblioteca.');
  }

  const uniqueMapId = mapId || `map-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const baseName = file.name.replace(/\.[^/.]+$/, '');

  // Caminho físico exclusivo por UID: maps/{uid}/{mapId}/{arquivo}
  const customStoragePath = `maps/${uid}/${uniqueMapId}/${cleanFileName}`;

  const metadata = await StorageService.uploadFile(file, {
    category: 'map',
    name: baseName,
    userId: uid,
    storagePath: customStoragePath,
    folder: `maps/${uid}/${uniqueMapId}`
  });

  return {
    url: metadata.url,
    name: metadata.name,
    storagePath: metadata.storagePath || customStoragePath,
    size: file.size,
    mimeType: file.type || 'image/png'
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
 * - Persiste em localStorage para sincronização entre abas
 */
export async function broadcastToTv(state: TvSyncState): Promise<void> {
  const sanitized = sanitizeForFirestore(state);
  let localTransmitted = false;

  // 1. Envio local imediato via BroadcastChannel seguro
  try {
    if (localTvChannel) {
      localTvChannel.postMessage({
        type: 'tv_sync_update',
        state: sanitized
      });
      localTransmitted = true;
    }
  } catch (e) {
    console.warn('[TvSync] BroadcastChannel aviso:', e);
  }

  // 2. Armazenamento local auxiliar (notifica outras abas via evento de storage)
  try {
    localStorage.setItem(TV_LOCAL_KEY, JSON.stringify(sanitized));
    localTransmitted = true;
  } catch (e) {
    console.warn('[TvSync] LocalStorage aviso:', e);
  }

  // 3. Firestore como Fonte de Verdade para sincronização remota
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
      console.warn('[TvSync] Cota do Firestore atingida, sincronização mantida localmente.');
    } else {
      console.warn('[TvSync] Aviso na sincronização remota do Firestore:', err?.message || err);
    }
    // Se a transmissão local já foi concluída com sucesso no navegador, não propaga erro falso
    if (!localTransmitted) {
      throw err;
    }
  }
}

/**
 * Escuta atualizações de transmissão da TV em tempo real:
 * - FONTE DA VERDADE: Firestore onSnapshot no documento test_tv_sync/current
 * - SUPORTE LOCAL: BroadcastChannel e Storage Event para sincronização instantânea
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

  // 1. Listener seguro do BroadcastChannel (mesma máquina)
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

  // 2. Listener de Storage Event (entre abas na mesma origem)
  const handleStorage = (event: StorageEvent) => {
    if (event.key === TV_LOCAL_KEY && event.newValue) {
      try {
        const parsed = JSON.parse(event.newValue) as TvSyncState;
        if (parsed && (parsed.imageUrl || (parsed.quadrants && parsed.quadrants.length > 0))) {
          callback(parsed);
        }
      } catch (e) {}
    }
  };
  window.addEventListener('storage', handleStorage);

  // 3. Listener principal do Firestore onSnapshot (Fonte da Verdade remota)
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
    window.removeEventListener('storage', handleStorage);
    unsubFirestore();
  };
}

/**
 * Heartbeat desativado conforme especificações (TV é somente leitura, sem heartbeat no Firestore ou canal).
 */
export async function sendTvHeartbeat(): Promise<void> {
  // No-op intencional para manter compatibilidade com chamadas antigas sem poluir canais
}
