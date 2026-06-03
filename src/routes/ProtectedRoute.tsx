import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-black/95 select-none">
        {/* Subtle glow / circular aura */}
        <div className="absolute w-48 h-48 rounded-full bg-gold/10 blur-[40px] animate-pulse" />
        <div className="relative flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-gold shadow-[0_0_20px_rgba(212,175,55,0.4)]"></div>
          <p className="mt-6 text-stone-400 font-cinzel text-xs tracking-[0.2em] uppercase">Autenticando investigações...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
