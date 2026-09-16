import { 
  db,
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  onSnapshot,
  Timestamp,
  serverTimestamp,
  addDoc,
  deleteDoc,
  handleFirestoreError, 
  OperationType 
} from '../firebase/firestore';
import { auth } from '../firebase/auth';
import { T20Character } from '../types/t20';
import { optimizeAvatar } from '../utils/imageCompression';

const COLLECTION_NAME = 'characters';

const cleanUndefined = (obj: any): any => {
  if (Array.isArray(obj)) {
    return obj.map(item => cleanUndefined(item));
  }
  if (obj !== null && typeof obj === 'object' && !(obj instanceof Date) && !(obj instanceof Timestamp)) {
    const newObj: any = {};
    Object.keys(obj).forEach(key => {
      if (obj[key] !== undefined) {
        newObj[key] = cleanUndefined(obj[key]);
      }
    });
    return newObj;
  }
  return obj;
};

export const CharacterService = {
  async createCharacter(uid: string, characterData: Partial<T20Character>) {
    try {
      const sanitized = { ...characterData } as any;
      if (sanitized.imageUrl) {
        sanitized.imageUrl = await optimizeAvatar(sanitized.imageUrl);
      }
      if (sanitized.characterData?.identity?.imageUrl) {
        delete sanitized.characterData.identity.imageUrl;
      }
      if (sanitized.skillsList) {
        delete sanitized.skillsList;
      }

      const charData = cleanUndefined({
        ...sanitized,
        uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      const docRef = await addDoc(collection(db, COLLECTION_NAME), charData);
      return docRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, COLLECTION_NAME);
    }
  },

  async updateCharacter(charId: string, characterData: Partial<T20Character>) {
    try {
      const sanitized = { ...characterData } as any;
      if (sanitized.imageUrl) {
        sanitized.imageUrl = await optimizeAvatar(sanitized.imageUrl);
      }
      if (sanitized.characterData?.identity?.imageUrl) {
        delete sanitized.characterData.identity.imageUrl;
      }
      if (sanitized.skillsList) {
        delete sanitized.skillsList;
      }

      const docRef = doc(db, COLLECTION_NAME, charId);
      await setDoc(docRef, cleanUndefined({
        ...sanitized,
        updatedAt: serverTimestamp(),
      }), { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `${COLLECTION_NAME}/${charId}`);
    }
  },

  async getCharacter(charId: string) {
    try {
      const docRef = doc(db, COLLECTION_NAME, charId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as T20Character & { id: string };
      }
      return null;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, `${COLLECTION_NAME}/${charId}`);
    }
  },

  async getUserCharacters(uid: string) {
    try {
      const q = query(collection(db, COLLECTION_NAME), where('uid', '==', uid));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as (T20Character & { id: string })[];
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, COLLECTION_NAME);
    }
  },

  subscribeToCharacter(charId: string, callback: (char: T20Character & { id: string }) => void) {
    const docRef = doc(db, COLLECTION_NAME, charId);
    return onSnapshot(docRef, (doc) => {
      if (doc.exists()) {
        callback({ id: doc.id, ...doc.data() } as T20Character & { id: string });
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `${COLLECTION_NAME}/${charId}`);
    });
  },

  subscribeToUserCharacters(uid: string, callback: (chars: (T20Character & { id: string })[]) => void) {
    const q = query(collection(db, COLLECTION_NAME), where('uid', '==', uid));
    return onSnapshot(q, (snapshot) => {
      const chars = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as (T20Character & { id: string })[];
      callback(chars);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, COLLECTION_NAME);
    });
  },

  async deleteCharacter(charId: string) {
    try {
      const docRef = doc(db, COLLECTION_NAME, charId);
      await deleteDoc(docRef);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `${COLLECTION_NAME}/${charId}`);
    }
  },

  async duplicateCharacter(uid: string, char: T20Character & { id: string }) {
    try {
      const { id, createdAt, updatedAt, ...rest } = char;
      const copyData = cleanUndefined({
        ...rest,
        name: `${char.name} (Cópia)`,
        uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      const docRef = await addDoc(collection(db, COLLECTION_NAME), copyData);
      return docRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, COLLECTION_NAME);
    }
  }
};
