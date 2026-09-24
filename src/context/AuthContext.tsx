import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { 
  auth, 
  onAuthStateChanged, 
  signOut, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  sendPasswordResetEmail, 
  updateProfile, 
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  googleProvider
} from '../firebase/auth';
import { db, doc, setDoc, getDoc, serverTimestamp, OperationType, handleFirestoreError } from '../firebase/firestore';
import { StorageService } from '../services/storageService';

export type AppUserRole = "player" | "master" | "admin";

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  photoURL: string;
  createdAt: any;
  updatedAt: any;
  role: AppUserRole;
  plan: "free" | "premium";
  onboardingCompleted: boolean;
  preferences: {
    language: "pt-BR"
  };
  stats: {
    charactersCount: 0,
    campaignsCount: 0
  }
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  register: (name: string, email: string, password: string, avatar?: File, role?: AppUserRole) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  uploadAvatar: (file: File) => Promise<string>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Processa retorno de redirect auth (caso o navegador tenha bloqueado popup e usado redirect)
  useEffect(() => {
    getRedirectResult(auth)
      .then(async (result) => {
        if (result && result.user) {
          const docRef = doc(db, 'users', result.user.uid);
          const docSnap = await getDoc(docRef);
          if (!docSnap.exists()) {
            await createUserProfile(
              result.user.uid,
              result.user.displayName || 'Herói',
              result.user.email || '',
              result.user.photoURL || ''
            );
          }
        }
      })
      .catch((err) => {
        console.debug('[Firebase Auth] Verificação de redirect:', err);
      });
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await fetchProfile(currentUser.uid);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const fetchProfile = async (uid: string) => {
    try {
      const docRef = doc(db, 'users', uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data() as UserProfile;
        setProfile(data);
        try {
          localStorage.setItem(`profile_${uid}`, JSON.stringify(data));
        } catch {}
        return;
      }
    } catch (error: any) {
      console.warn('[AuthContext] Perfil não carregado do servidor remoto (offline/cache):', error?.message || error);
    }

    // Fallback: Recuperar do cache local se disponível
    try {
      const cached = localStorage.getItem(`profile_${uid}`);
      if (cached) {
        setProfile(JSON.parse(cached));
        return;
      }
    } catch {}

    // Fallback para perfil autenticado
    if (auth.currentUser && auth.currentUser.uid === uid) {
      const fallbackProfile: UserProfile = {
        uid,
        name: auth.currentUser.displayName || auth.currentUser.email?.split('@')[0] || 'Herói',
        email: auth.currentUser.email || '',
        photoURL: auth.currentUser.photoURL || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        role: auth.currentUser.email === 'dantasmatheus1999@outlook.com.br' ? 'admin' : 'player',
        plan: 'free',
        onboardingCompleted: true,
        preferences: {
          language: 'pt-BR'
        },
        stats: {
          charactersCount: 0,
          campaignsCount: 0
        }
      };
      setProfile(fallbackProfile);
    }
  };

  const createUserProfile = async (uid: string, name: string, email: string, photoURL: string = '', role: AppUserRole = "player") => {
    const profileData: UserProfile = {
      uid,
      name,
      email,
      photoURL,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      role,
      plan: "free",
      onboardingCompleted: false,
      preferences: {
        language: "pt-BR"
      },
      stats: {
        charactersCount: 0,
        campaignsCount: 0
      }
    };

    try {
      await setDoc(doc(db, 'users', uid), profileData);
      setProfile(profileData);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `users/${uid}`);
    }
  };

  const handleUploadAvatar = async (file: File): Promise<string> => {
    if (!auth.currentUser) throw new Error('No user logged in');
    const metadata = await StorageService.uploadFile(file, {
      category: 'avatar',
      name: 'avatar_profile',
      folder: 'users'
    });
    return metadata.url;
  };

  const register = async (name: string, email: string, password: string, avatar?: File, role: AppUserRole = "player") => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      let photoURL = '';
      
      if (avatar) {
        photoURL = await handleUploadAvatar(avatar);
      }

      await updateProfile(result.user, { displayName: name, photoURL });
      await createUserProfile(result.user.uid, name, email, photoURL, role);
    } catch (error: any) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const login = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const loginWithGoogle = async () => {
    try {
      let result;
      try {
        result = await signInWithPopup(auth, googleProvider);
      } catch (popupErr: any) {
        // Se popup foi bloqueado pelo navegador ou pelo iframe
        if (popupErr?.code === 'auth/popup-blocked' || popupErr?.code === 'auth/cancelled-popup-request') {
          console.warn('[Firebase Auth] Pop-up bloqueado. Tentando autenticação via redirecionamento...', popupErr);
          try {
            await signInWithRedirect(auth, googleProvider);
            return;
          } catch (redirectErr) {
            console.error('[Firebase Auth] Falha ao redirecionar:', redirectErr);
            throw popupErr;
          }
        }
        throw popupErr;
      }

      if (result && result.user) {
        const docRef = doc(db, 'users', result.user.uid);
        const docSnap = await getDoc(docRef);
        
        if (!docSnap.exists()) {
          await createUserProfile(
            result.user.uid, 
            result.user.displayName || 'Herói', 
            result.user.email || '', 
            result.user.photoURL || ''
          );
        }
      }
    } catch (error: any) {
      console.error('Google login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      localStorage.removeItem('mythos_active_profile');
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      console.error('Reset password error:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      profile, 
      loading, 
      register, 
      login, 
      loginWithGoogle, 
      logout, 
      resetPassword,
      uploadAvatar: handleUploadAvatar
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
