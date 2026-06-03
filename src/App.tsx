/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './layouts/AppLayout';
import { ProfileProvider, useProfile } from './context/ProfileContext';
import { AuthProvider } from './context/AuthContext';
import { LoadingProvider } from './context/LoadingContext';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { AuthPage } from './pages/AuthPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ProfileSelection } from './pages/ProfileSelection';
import { NewMasterPage } from './pages/NewMasterPage';
import { NewPlayerPage } from './pages/NewPlayerPage';
import { ErrorBoundary } from './components/ErrorBoundary';

const Home = () => {
  const { activeProfile, isLoading } = useProfile();

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-black/95 select-none">
        {/* Subtle glow / circular aura */}
        <div className="absolute w-48 h-48 rounded-full bg-gold/10 blur-[40px] animate-pulse" />
        <div className="relative flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-gold shadow-[0_0_20px_rgba(212,175,55,0.4)]"></div>
          <p className="mt-6 text-stone-400 font-cinzel text-xs tracking-[0.2em] uppercase">Consultando os astros de Realmor...</p>
        </div>
      </div>
    );
  }

  if (activeProfile === 'MASTER') return <Navigate to="/mestre" replace />;
  if (activeProfile === 'PLAYER') return <Navigate to="/jogador" replace />;
  return <Navigate to="/select-profile" replace />;
};

export default function App() {
  return (
    <ErrorBoundary>
      <LoadingProvider>
        <AuthProvider>
          <ProfileProvider>
            <Router>
              <Routes>
                {/* Public Routes */}
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                
                {/* Protected Routes */}
                <Route path="/*" element={
                  <ProtectedRoute>
                    <AppLayout>
                      <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/select-profile" element={<ProfileSelection />} />
                        
                        {/* REALMOR Principal Routes */}
                        <Route path="/mestre" element={<NewMasterPage />} />
                        <Route path="/jogador" element={<NewPlayerPage />} />

                        {/* Fallback to Profile Home */}
                        <Route path="*" element={<Navigate to="/" replace />} />
                      </Routes>
                    </AppLayout>
                  </ProtectedRoute>
                } />
              </Routes>
            </Router>
          </ProfileProvider>
        </AuthProvider>
      </LoadingProvider>
    </ErrorBoundary>
  );
}
