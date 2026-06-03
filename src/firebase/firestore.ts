import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  getDocFromServer,
  updateDoc, 
  serverTimestamp,
  collection,
  getDocs,
  query,
  where,
  addDoc,
  deleteDoc,
  onSnapshot
} from 'firebase/firestore';
import app, { firebaseConfig } from './config';
import { auth } from './auth';

const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// Testar conexão com o Firestore conforme diretrizes
async function testFirestoreConnection() {
  try {
    console.log('[Firebase Firestore] Testando conexão (ID:', firebaseConfig.firestoreDatabaseId, ')...');
    await getDocFromServer(doc(db, '_connection_test_', 'ping'));
    console.log('[Firebase Firestore] Conexão estabelecida com sucesso.');
  } catch (error: any) {
    if (error.code === 'permission-denied') {
      console.warn('[Firebase Firestore] Permissão negada no teste de conexão. Isso pode ser esperado se o usuário não estiver logado e a regra for restritiva.');
      return;
    }
    console.error('[Firebase Firestore] Erro de conexão:', error);
    if (error.message && (error.message.includes('the client is offline') || error.code === 'unavailable')) {
      console.error('!!! ALERTA DE CONFIGURAÇÃO !!!');
      console.error('O Firestore retornou "unavailable" ou "offline".');
      console.error('Isso geralmente indica que o ID do banco de dados (' + firebaseConfig.firestoreDatabaseId + ') está incorreto ou o banco ainda não foi provisionado.');
    }
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

export { 
  db, 
  auth,
  doc, 
  setDoc, 
  getDoc, 
  getDocFromServer,
  updateDoc, 
  serverTimestamp,
  collection,
  getDocs,
  query,
  where,
  addDoc,
  deleteDoc,
  onSnapshot
};
