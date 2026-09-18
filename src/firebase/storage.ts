import { 
  getStorage, 
  ref, 
  uploadBytes, 
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  listAll
} from 'firebase/storage';
import app, { firebaseConfig } from './config';

// Inicializa o storage utilizando o bucket padrão configurado no app
const storage = getStorage(app);

export { 
  storage, 
  ref, 
  uploadBytes, 
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  listAll,
  firebaseConfig
};
