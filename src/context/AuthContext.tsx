import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
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
  googleProvider
} from '../firebase/auth';
import { db, doc, setDoc, getDoc, serverTimestamp, OperationType, handleFirestoreError } from '../firebase/firestore';
import { StorageService } from '../services/storageService';

export type AppUserRole = "player" | "master" | "admin";

export interface UserProfile {
  uid: string;
  name: string;
  displayName?: string;
  email: string;
  photoURL?: string;
  provider?: string;
  createdAt: any;
  updatedAt: any;
  role: AppUserRole;
  plan: "free" | "premium";
  onboardingCompleted: boolean;
  preferences?: {
    language: "pt-BR";
  };
  stats?: {
    charactersCount: number;
    campaignsCount: number;
  };
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
  refreshProfile: () => Promise<UserProfile | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  /**
   * Garante a criação ou obtenção do documento Firestore `users/{uid}`
   * para qualquer usuário autenticado (Google ou E-mail/Senha).
   */
  const syncUserProfile = useCallback(async (
    firebaseUser: User, 
    extraData?: { name?: string; role?: AppUserRole; photoURL?: string; provider?: string }
  ): Promise<UserProfile> => {
    const uid = firebaseUser.uid;
    const email = firebaseUser.email || '';
    const isGoogle = firebaseUser.providerData?.some(p => p.providerId === 'google.com');
    const defaultProvider = isGoogle ? 'google' : (extraData?.provider || 'password');
    const defaultName = extraData?.name || firebaseUser.displayName || (email ? email.split('@')[0] : 'Aventureiro');
    const defaultPhoto = extraData?.photoURL || firebaseUser.photoURL || '';
    const defaultRole: AppUserRole = extraData?.role || (email === 'dantasmatheus1999@outlook.com.br' ? 'admin' : 'player');

    try {
      const docRef = doc(db, 'users', uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data() as UserProfile;
        setProfile(data);
        try {
          localStorage.setItem(`profile_${uid}`, JSON.stringify(data));
        } catch {}
        return data;
      }

      // Se o documento ainda não existe (primeiro acesso do usuário), cria automaticamente
      const newProfile: UserProfile = {
        uid,
        name: defaultName,
        displayName: defaultName,
        email,
        photoURL: defaultPhoto,
        provider: defaultProvider,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        role: defaultRole,
        plan: 'free',
        onboardingCompleted: false,
        preferences: {
          language: 'pt-BR'
        },
        stats: {
          charactersCount: 0,
          campaignsCount: 0
        }
      };

      await setDoc(docRef, newProfile);
      setProfile(newProfile);
      try {
        localStorage.setItem(`profile_${uid}`, JSON.stringify({
          ...newProfile,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }));
      } catch {}
      return newProfile;
    } catch (error: any) {
      console.warn('[AuthContext] Erro ao sincronizar perfil no Firestore:', error?.message || error);

      // Fallback local caso Firestore esteja temporariamente offline
      const fallbackProfile: UserProfile = {
        uid,
        name: defaultName,
        displayName: defaultName,
        email,
        photoURL: defaultPhoto,
        provider: defaultProvider,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        role: defaultRole,
        plan: 'free',
        onboardingCompleted: false,
        preferences: {
          language: 'pt-BR'
        },
        stats: {
          charactersCount: 0,
          campaignsCount: 0
        }
      };
      setProfile(fallbackProfile);
      return fallbackProfile;
    }
  }, []);

  // Monitorar o estado de autenticação do Firebase (onAuthStateChanged)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          await syncUserProfile(currentUser);
        } catch (err) {
          console.error('[AuthContext] Erro ao sincronizar sessão:', err);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, [syncUserProfile]);

  const refreshProfile = async (): Promise<UserProfile | null> => {
    if (!auth.currentUser) return null;
    return await syncUserProfile(auth.currentUser);
  };

  const handleUploadAvatar = async (file: File): Promise<string> => {
    if (!auth.currentUser) throw new Error('Nenhum usuário autenticado');
    const metadata = await StorageService.uploadFile(file, {
      category: 'avatar',
      name: 'avatar_profile',
      folder: 'users'
    });
    return metadata.url;
  };

  const register = async (
    name: string, 
    email: string, 
    password: string, 
    avatar?: File, 
    role: AppUserRole = "player"
  ) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      let photoURL = '';
      
      if (avatar) {
        try {
          photoURL = await handleUploadAvatar(avatar);
        } catch (uploadErr) {
          console.warn('[AuthContext] Falha no upload de avatar inicial:', uploadErr);
        }
      }

      try {
        await updateProfile(result.user, { displayName: name, photoURL });
      } catch (profErr) {
        console.warn('[AuthContext] Erro ao atualizar displayName no Firebase Auth:', profErr);
      }

      await syncUserProfile(result.user, { name, role, photoURL, provider: 'password' });
    } catch (error: any) {
      console.error('[AuthContext] Erro no registro de conta:', error);
      throw error;
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      if (result.user) {
        await syncUserProfile(result.user);
      }
    } catch (error: any) {
      console.error('[AuthContext] Erro no login por email:', error);
      throw error;
    }
  };

  /**
   * Fluxo Oficial de Login com Google via Popup
   * Abre seletor de contas Google, autentica no Firebase Auth,
   * e cria ou carrega o documento do usuário no Firestore users/{uid}.
   */
  const loginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      if (result && result.user) {
        await syncUserProfile(result.user, {
          provider: 'google'
        });
      }
    } catch (error: any) {
      console.error('[AuthContext] Erro no login com Google:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      localStorage.removeItem('mythos_active_profile');
      localStorage.removeItem('realmor_active_mode');
      await signOut(auth);
      setUser(null);
      setProfile(null);
    } catch (error) {
      console.error('[AuthContext] Erro no logout:', error);
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      console.error('[AuthContext] Erro na redefinição de senha:', error);
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
      uploadAvatar: handleUploadAvatar,
      refreshProfile
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
