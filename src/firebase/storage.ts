import { 
  getStorage, 
  ref, 
  uploadBytes, 
  uploadBytesResumable,
  getDownloadURL,
  deleteObject
} from 'firebase/storage';
import app, { firebaseConfig } from './config';

const storage = getStorage(app, `gs://${firebaseConfig.storageBucket}`);

export { 
  storage, 
  ref, 
  uploadBytes, 
  uploadBytesResumable,
  getDownloadURL,
  deleteObject
};
