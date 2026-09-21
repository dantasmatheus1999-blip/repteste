import { 
  db, 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  onSnapshot 
} from '../../firebase/firestore';
import { storage, ref, uploadBytes, getDownloadURL } from '../../firebase/storage';
import { auth, signInAnon } from '../../firebase/auth';
import { DiceType, DiceSkin, DiceSkinConfig } from './types';
import { DICE_SKINS } from './diceSkins';
import { normalizeTextureTo1024 } from './DiceTemplateManager';
import { registerMultipleCustomSkinLookups, registerCustomSkinLookup } from './DiceTextureLoader';

const LOCAL_STORAGE_KEY = 'realmor_custom_dice_skins_v1';

// Active listeners registry to notify all subscribers immediately on local/remote saves
const activeSubscribers = new Map<DiceType, Set<(skins: DiceSkinConfig[]) => void>>();

function notifySubscribers(diceType: DiceType) {
  const subscribers = activeSubscribers.get(diceType);
  if (!subscribers || subscribers.size === 0) return;
  const builtIns = getBuiltInSkins(diceType);
  const localCustom = getLocalCustomSkins().filter(s => !s.diceType || s.diceType === diceType);
  const fullList = [...builtIns, ...localCustom];
  subscribers.forEach(cb => {
    try {
      cb(fullList);
    } catch (e) {
      console.warn('[DiceSkinService] Subscriber callback error:', e);
    }
  });
}

/**
 * Loads cached custom skins from localStorage for offline-first instant boot.
 */
function getLocalCustomSkins(): DiceSkinConfig[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return [];
    const parsed: DiceSkinConfig[] = JSON.parse(raw);
    registerMultipleCustomSkinLookups(parsed);
    return parsed;
  } catch {
    return [];
  }
}

/**
 * Saves cached custom skins to localStorage.
 */
function setLocalCustomSkins(skins: DiceSkinConfig[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(skins));
    registerMultipleCustomSkinLookups(skins);
  } catch (err) {
    console.warn('[DiceSkinService] Failed to cache skins in localStorage', err);
  }
}

/**
 * Returns all built-in skins formatted as DiceSkinConfig list.
 */
export function getBuiltInSkins(diceType?: DiceType): DiceSkinConfig[] {
  return Object.values(DICE_SKINS).map(skin => ({
    ...skin,
    diceType: diceType || 'd20',
    isBuiltIn: true
  }));
}

/**
 * Fetches all available skins (Built-in + Custom from Firestore & LocalStorage).
 */
export async function fetchAllSkins(diceType: DiceType = 'd20'): Promise<DiceSkinConfig[]> {
  const builtIns = getBuiltInSkins(diceType);
  const localCustom = getLocalCustomSkins().filter(s => !s.diceType || s.diceType === diceType);

  try {
    const skinsRef = collection(db, 'dice_skins');
    const q = query(skinsRef, where('diceType', '==', diceType));
    const snapshot = await getDocs(q);

    const remoteCustom: DiceSkinConfig[] = [];
    snapshot.forEach(docSnap => {
      const data = docSnap.data() as any;
      remoteCustom.push({
        id: docSnap.id,
        name: data.name || 'Skin Personalizada',
        description: data.description || 'Skin criada pela comunidade',
        diceType: data.diceType || diceType,
        isBuiltIn: false,
        textureUrl: data.textureUrl,
        previewUrl: data.previewUrl,
        baseColor: data.baseColor || '#1e293b',
        edgeColor: data.edgeColor || '#0f172a',
        numberColor: data.numberColor || '#f8fafc',
        highlightColor: data.highlightColor || '#38bdf8',
        roughness: data.roughness ?? 0.3,
        metalness: data.metalness ?? 0.2,
        glow: data.glowColor,
        authorId: data.authorId,
        authorName: data.authorName,
        createdAt: data.createdAt
      });
    });

    // Merge: Remote is source of truth, preserve any offline items not yet synced
    const mergedCustomMap = new Map<string, DiceSkinConfig>();
    localCustom.forEach(s => mergedCustomMap.set(s.id, s));
    remoteCustom.forEach(s => mergedCustomMap.set(s.id, s));

    const allCustom = Array.from(mergedCustomMap.values());
    setLocalCustomSkins(allCustom);

    return [...builtIns, ...allCustom];
  } catch (err) {
    console.warn('[DiceSkinService] Remote skin fetch failed, falling back to local storage', err);
    return [...builtIns, ...localCustom];
  }
}

/**
 * Subscribes to realtime updates of custom skins.
 */
export function subscribeToCustomSkins(
  diceType: DiceType,
  onUpdate: (skins: DiceSkinConfig[]) => void
): () => void {
  // Register in local broadcast map
  if (!activeSubscribers.has(diceType)) {
    activeSubscribers.set(diceType, new Set());
  }
  activeSubscribers.get(diceType)!.add(onUpdate);

  const builtIns = getBuiltInSkins(diceType);
  const localCustom = getLocalCustomSkins().filter(s => !s.diceType || s.diceType === diceType);
  onUpdate([...builtIns, ...localCustom]);

  try {
    const skinsRef = collection(db, 'dice_skins');
    const q = query(skinsRef, where('diceType', '==', diceType));

    const unsubscribe = onSnapshot(
      q,
      (snapshot: any) => {
        const remoteCustom: DiceSkinConfig[] = [];
        snapshot.forEach((docSnap: any) => {
          const data = docSnap.data();
          remoteCustom.push({
            id: docSnap.id,
            name: data.name || 'Skin Personalizada',
            description: data.description || 'Skin criada pela comunidade',
            diceType: data.diceType || diceType,
            isBuiltIn: false,
            textureUrl: data.textureUrl,
            previewUrl: data.previewUrl,
            baseColor: data.baseColor || '#1e293b',
            edgeColor: data.edgeColor || '#0f172a',
            numberColor: data.numberColor || '#f8fafc',
            highlightColor: data.highlightColor || '#38bdf8',
            roughness: data.roughness ?? 0.3,
            metalness: data.metalness ?? 0.2,
            glow: data.glowColor,
            authorId: data.authorId,
            authorName: data.authorName,
            createdAt: data.createdAt
          });
        });

        // Merge keeping remote as ground truth
        const mergedMap = new Map<string, DiceSkinConfig>();
        const currentLocal = getLocalCustomSkins();
        currentLocal.filter(s => !s.diceType || s.diceType === diceType).forEach(s => mergedMap.set(s.id, s));
        remoteCustom.forEach(s => mergedMap.set(s.id, s));

        const allCustom = Array.from(mergedMap.values());
        setLocalCustomSkins(allCustom);

        onUpdate([...builtIns, ...allCustom]);
      },
      (error: any) => {
        console.warn('[DiceSkinService] Firestore onSnapshot error:', error);
      }
    );

    return () => {
      const subs = activeSubscribers.get(diceType);
      if (subs) {
        subs.delete(onUpdate);
      }
      unsubscribe();
    };
  } catch (err) {
    console.warn('[DiceSkinService] Failed to initialize live snapshot', err);
    return () => {
      const subs = activeSubscribers.get(diceType);
      if (subs) {
        subs.delete(onUpdate);
      }
    };
  }
}

/**
 * Uploads a newly authored planified texture image to Firebase Storage
 * and creates the metadata record in Firestore.
 */
export async function uploadCustomDiceSkin(params: {
  name: string;
  diceType: DiceType;
  textureBlobOrFile: Blob | File;
  previewDataUrl?: string;
  roughness?: number;
  metalness?: number;
  glowColor?: string;
  description?: string;
}): Promise<DiceSkinConfig> {
  const { name, diceType, textureBlobOrFile, previewDataUrl, roughness = 0.3, metalness = 0.2, glowColor, description } = params;

  // Ensure authenticated user session exists (or sign in anonymously to satisfy firestore/storage security rules)
  let currentUser = auth.currentUser;
  if (!currentUser) {
    try {
      const cred = await signInAnon();
      currentUser = cred.user;
    } catch (authErr) {
      console.warn('[DiceSkinService] Anonymous sign-in attempt:', authErr);
    }
  }

  const skinId = `skin_${diceType}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  const authorId = currentUser?.uid || 'guest_user';
  const authorName = currentUser?.displayName || 'Aventureiro de Realmor';

  // Always ensure texture is normalized to standard 1024x1024
  let finalTextureBlob: Blob = textureBlobOrFile;
  let finalDataUrl: string = previewDataUrl || '';

  try {
    const normalized = await normalizeTextureTo1024(textureBlobOrFile, `${skinId}_texture.png`);
    finalTextureBlob = normalized.blob;
    if (!finalDataUrl) {
      finalDataUrl = normalized.dataUrl;
    }
  } catch (normErr) {
    console.warn('[DiceSkinService] Normalization notice:', normErr);
  }

  let textureUrl = '';
  let previewUrl = finalDataUrl;

  try {
    // 1. Upload Standard 1024x1024 Texture to Firebase Storage (dice_skins/${diceType}/skins/${skinId}/texture.png)
    const textureStorageRef = ref(storage, `dice_skins/${diceType}/skins/${skinId}/texture.png`);
    const uploadResult = await uploadBytes(textureStorageRef, finalTextureBlob, {
      contentType: 'image/png'
    });
    textureUrl = await getDownloadURL(uploadResult.ref);
  } catch (storageErr) {
    console.warn('[DiceSkinService] Firebase Storage upload failed, converting to local data URL.', storageErr);
    // Fallback to Data URL for offline / local preview
    if (finalDataUrl) {
      textureUrl = finalDataUrl;
    } else {
      textureUrl = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(finalTextureBlob);
      });
    }
  }

  const newSkin: DiceSkinConfig = {
    id: skinId,
    name: name.trim() || 'Nova Skin Customizada',
    description: description || `Skin planificada para ${diceType.toUpperCase()}`,
    diceType,
    isBuiltIn: false,
    textureUrl,
    previewUrl,
    baseColor: '#1e293b',
    edgeColor: '#0f172a',
    numberColor: '#f8fafc',
    highlightColor: '#38bdf8',
    roughness,
    metalness,
    glow: glowColor,
    authorId,
    authorName,
    createdAt: new Date().toISOString()
  };

  // Register immediately in texture loader lookup
  registerCustomSkinLookup(newSkin);

  // 2. Save to Firestore if connected
  try {
    const skinDocRef = doc(db, 'dice_skins', skinId);
    await setDoc(skinDocRef, {
      id: skinId,
      name: newSkin.name,
      description: newSkin.description,
      diceType: newSkin.diceType,
      textureUrl: newSkin.textureUrl,
      previewUrl: newSkin.previewUrl || '',
      isDefault: false,
      authorId: newSkin.authorId,
      authorName: newSkin.authorName,
      roughness: newSkin.roughness,
      metalness: newSkin.metalness,
      glowColor: newSkin.glow || null,
      createdAt: newSkin.createdAt
    });
  } catch (firestoreErr) {
    console.warn('[DiceSkinService] Firestore write failed, keeping in local cache only.', firestoreErr);
  }

  // 3. Save to LocalStorage cache immediately
  const localSkins = getLocalCustomSkins().filter(s => s.id !== skinId);
  localSkins.unshift(newSkin);
  setLocalCustomSkins(localSkins);

  // 4. Notify all active UI listeners immediately
  notifySubscribers(diceType);

  return newSkin;
}

/**
 * Deletes a custom skin from Firestore and localStorage.
 */
export async function deleteCustomDiceSkin(skinId: string): Promise<void> {
  // Find skin to know diceType for notification
  const local = getLocalCustomSkins();
  const skinToDelete = local.find(s => s.id === skinId);
  const updated = local.filter(s => s.id !== skinId);
  setLocalCustomSkins(updated);

  if (skinToDelete?.diceType) {
    notifySubscribers(skinToDelete.diceType);
  }

  try {
    const skinDocRef = doc(db, 'dice_skins', skinId);
    await deleteDoc(skinDocRef);
  } catch (err) {
    console.warn('[DiceSkinService] Failed to delete remote document', err);
  }
}
