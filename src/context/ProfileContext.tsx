import React, { createContext, useContext, useState, useEffect } from 'react';

export type UserRole = 'MASTER' | 'PLAYER';

interface ProfileContextType {
  activeProfile: UserRole | null;
  selectProfile: (role: UserRole) => void;
  clearProfile: () => void;
  isLoading: boolean;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const ProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeProfile, setActiveProfile] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedProfile = localStorage.getItem('mythos_active_profile');
    if (savedProfile) {
      setActiveProfile(savedProfile as UserRole);
    }
    setIsLoading(false);
  }, []);

  const selectProfile = (role: UserRole) => {
    setActiveProfile(role);
    localStorage.setItem('mythos_active_profile', role);
  };

  const clearProfile = () => {
    setActiveProfile(null);
    localStorage.removeItem('mythos_active_profile');
    localStorage.removeItem('active_profile');
    localStorage.removeItem('selectedProfile');
    localStorage.removeItem('userMode');
    sessionStorage.removeItem('mythos_active_profile');
    sessionStorage.removeItem('active_profile');
    sessionStorage.removeItem('selectedProfile');
    sessionStorage.removeItem('userMode');
  };

  return (
    <ProfileContext.Provider value={{ activeProfile, selectProfile, clearProfile, isLoading }}>
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
