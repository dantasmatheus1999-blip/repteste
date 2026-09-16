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
  googleProvider
} from '../firebase/auth';
import { db, doc, setDoc, getDoc, serverTimestamp, OperationType, handleFirestoreError } from '../firebase/firestore';
import { storage, ref, uploadBytes, getDownloadURL } from '../firebase/storage';

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
        setProfile(docSnap.data() as UserProfile);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
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
    const storageRef = ref(storage, `users/${auth.currentUser.uid}/profile/avatar.jpg`);
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
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
      const result = await signInWithPopup(auth, googleProvider);
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
