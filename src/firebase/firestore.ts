import { 
  getFirestore, 
  initializeFirestore,
  doc, 
  setDoc as rawSetDoc, 
  getDoc as rawGetDoc, 
  getDocFromServer,
  updateDoc as rawUpdateDoc, 
  serverTimestamp,
  collection,
  getDocs as rawGetDocs, 
  query, 
  where, 
  addDoc as rawAddDoc, 
  deleteDoc as rawDeleteDoc, 
  onSnapshot as rawOnSnapshot,
  orderBy,
  limit,
  collectionGroup,
  Timestamp,
  type DocumentReference,
  type CollectionReference,
  type Query,
  type SetOptions
} from 'firebase/firestore';
import app, { firebaseConfig } from './config';
import { auth } from './auth';
import { firestoreTracker, extractTargetInfo } from './firestoreDiagnostic';

// Inicialização oficial estável com o banco correto do Firebase
let dbInstance: any;
try {
  dbInstance = initializeFirestore(app, {
    ignoreUndefinedProperties: true
  }, firebaseConfig.firestoreDatabaseId);
} catch (e) {
  dbInstance = getFirestore(app, firebaseConfig.firestoreDatabaseId);
}
const db = dbInstance;

let quotaExhausted = false;

export function isQuotaExceededError(error: unknown): boolean {
  if (!error) return false;
  const msg = (error as any)?.message || String(error);
  const code = (error as any)?.code;
  return code === 'resource-exhausted' || msg.includes('Quota limit exceeded') || msg.includes('Quota exceeded');
}

export function setQuotaExhausted(value: boolean) {
  quotaExhausted = value;
}

export function getIsQuotaExhausted(): boolean {
  return quotaExhausted;
}

// Testar conexão com o Firestore conforme diretrizes do Firebase Skill
async function testFirestoreConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log('[Firebase Firestore] Conexão com Cloud Firestore estabelecida.');
  } catch (error: any) {
    if (error?.code === 'permission-denied') {
      // Servidor respondeu normalmente com rejeição de permissão para leitura anônima de teste
      return;
    }
    if (isQuotaExceededError(error)) {
      quotaExhausted = true;
      console.warn('[Firebase Firestore] Cota diária gratuita do Firestore excedida no projeto. Modo offline ativo.');
      return;
    }
    if (error?.message && (error.message.includes('the client is offline') || error.code === 'unavailable')) {
      console.info('[Firebase Firestore] Cliente operando com persistência local (offline-first).');
      return;
    }
    console.debug('[Firebase Firestore] Teste de conectividade:', error?.message || error);
  }
}
testFirestoreConnection();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  if (isQuotaExceededError(error)) {
    quotaExhausted = true;
    console.warn(`[Firestore Quota] A cota diária gratuita do Firestore foi excedida durante "${operationType}" em "${path}". Os dados estão preservados no armazenamento local.`);
    return;
  }

  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// ----------------------------------------------------
// Wrappers Transparentes com Rastreamento de Diagnóstico
// ----------------------------------------------------

export const setDoc = async <T = any>(
  reference: DocumentReference<T>,
  data: any,
  options?: SetOptions
) => {
  const target = extractTargetInfo(reference);
  firestoreTracker.recordWrite({
    collection: target.collection,
    document: target.document,
    reason: (data as any)?.__diagnosticReason || undefined,
  });
  return rawSetDoc(reference, data, options as any);
};

export const updateDoc = async <T = any>(
  reference: DocumentReference<T>,
  ...args: any[]
) => {
  const target = extractTargetInfo(reference);
  firestoreTracker.recordWrite({
    collection: target.collection,
    document: target.document,
    reason: (args[0] as any)?.__diagnosticReason || 'updateDoc call',
  });
  return (rawUpdateDoc as any)(reference, ...args);
};

export const addDoc = async <T = any>(
  reference: CollectionReference<T>,
  data: any
) => {
  const target = extractTargetInfo(reference);
  firestoreTracker.recordWrite({
    collection: target.collection,
    document: '(new doc)',
    reason: (data as any)?.__diagnosticReason || 'addDoc call',
  });
  return rawAddDoc(reference, data);
};

export const deleteDoc = async (reference: DocumentReference<any>) => {
  const target = extractTargetInfo(reference);
  firestoreTracker.recordDelete({
    collection: target.collection,
    document: target.document,
    reason: 'deleteDoc call',
  });
  return rawDeleteDoc(reference);
};

export const getDoc = async <T = any>(reference: DocumentReference<T>) => {
  const target = extractTargetInfo(reference);
  firestoreTracker.recordRead({
    collection: target.collection,
    document: target.document,
    reason: 'getDoc single',
  });
  return rawGetDoc(reference);
};

export const getDocs = async <T = any>(queryRef: Query<T>) => {
  const target = extractTargetInfo(queryRef);
  firestoreTracker.recordRead({
    collection: target.collection,
    document: target.document,
    reason: 'getDocs collection/query',
  });
  return rawGetDocs(queryRef);
};

export const onSnapshot = (reference: any, ...args: any[]) => {
  const target = extractTargetInfo(reference);
  firestoreTracker.recordListenerOpen({
    collection: target.collection,
  });

  let rawUnsub: any;
  try {
    rawUnsub = (rawOnSnapshot as any)(reference, ...args);
  } catch (err) {
    console.warn(`[Firestore onSnapshot] Erro ao registrar listener em ${target.collection}:`, err);
    rawUnsub = () => {};
  }

  return () => {
    firestoreTracker.recordListenerClose({
      collection: target.collection,
    });
    if (typeof rawUnsub === 'function') {
      try {
        rawUnsub();
      } catch (err) {
        // Encerramento silencioso em caso de desmonte
      }
    }
  };
};

export { 
  db, 
  auth,
  doc, 
  getDocFromServer,
  serverTimestamp,
  collection,
  query,
  where,
  orderBy,
  limit,
  collectionGroup,
  Timestamp,
  firestoreTracker
};
