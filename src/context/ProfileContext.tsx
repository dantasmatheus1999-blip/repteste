import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

export type UserRole = 'MASTER' | 'PLAYER';
export type ActiveMode = 'master' | 'player';

interface ProfileContextType {
  activeProfile: UserRole | null;
  activeMode: ActiveMode;
  isMaster: boolean;
  selectProfile: (role: UserRole | ActiveMode) => void;
  setMode: (mode: ActiveMode | UserRole) => void;
  toggleMode: () => void;
  clearProfile: () => void;
  isLoading: boolean;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

const STORAGE_KEY = 'realmor_active_mode';

export const ProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading: authLoading } = useAuth();
  
  // Lê modo inicial salvo no localStorage
  const [activeProfile, setActiveProfile] = useState<UserRole | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) || localStorage.getItem('mythos_active_profile');
      if (saved === 'MASTER' || saved === 'master') return 'MASTER';
      if (saved === 'PLAYER' || saved === 'player') return 'PLAYER';
    } catch (e) {
      console.error(e);
    }
    return null;
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (authLoading) {
      setIsLoading(true);
      return;
    }

    if (!user) {
      setActiveProfile(null);
      setIsLoading(false);
      return;
    }

    try {
      const saved = localStorage.getItem(STORAGE_KEY) || localStorage.getItem('mythos_active_profile');
      if (saved === 'MASTER' || saved === 'master') {
        setActiveProfile('MASTER');
      } else if (saved === 'PLAYER' || saved === 'player') {
        setActiveProfile('PLAYER');
      }
      // Se não houver preferência salva, activeProfile permanece como estava ou null (para redirecionar para /select-profile)
    } catch (e) {
      console.error(e);
    }

    setIsLoading(false);
  }, [user, authLoading]);

  const selectProfile = (role: UserRole | ActiveMode) => {
    const normalizedRole: UserRole = (role === 'master' || role === 'MASTER') ? 'MASTER' : 'PLAYER';
    const normalizedMode: ActiveMode = normalizedRole === 'MASTER' ? 'master' : 'player';
    
    setActiveProfile(normalizedRole);
    try {
      localStorage.setItem(STORAGE_KEY, normalizedMode);
      localStorage.setItem('mythos_active_profile', normalizedRole);
    } catch (e) {
      console.error(e);
    }
  };

  const setMode = (mode: ActiveMode | UserRole) => {
    selectProfile(mode);
  };

  const toggleMode = () => {
    const nextRole: UserRole = activeProfile === 'MASTER' ? 'PLAYER' : 'MASTER';
    selectProfile(nextRole);
  };

  const clearProfile = () => {
    setActiveProfile(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem('mythos_active_profile');
    } catch (e) {
      console.error(e);
    }
  };

  const isMaster = activeProfile === 'MASTER';
  const activeMode: ActiveMode = isMaster ? 'master' : 'player';

  return (
    <ProfileContext.Provider 
      value={{ 
        activeProfile, 
        activeMode, 
        isMaster, 
        selectProfile, 
        setMode, 
        toggleMode, 
        clearProfile,
        isLoading 
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
};

