import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  setPersistence, 
  browserLocalPersistence,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
  signInAnonymously
} from 'firebase/auth';
import app from './config';

const auth = getAuth(app);

// Configurar persistência local para melhor suporte em iframes
setPersistence(auth, browserLocalPersistence).catch(err => {
  console.error('[Firebase Auth] Erro ao configurar persistência:', err);
});

const googleProvider = new GoogleAuthProvider();

export const signInAnon = async () => {
  return signInAnonymously(auth);
};

export { 
  auth, 
  googleProvider, 
  signInWithPopup, 
  signOut, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged
};
