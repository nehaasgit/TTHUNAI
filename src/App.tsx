import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './frontend/contexts/AppContext.js';
import MainLayout from './frontend/layouts/MainLayout.js';
import SplashScreen from './frontend/pages/SplashScreen.js';
import LanguageSelection from './frontend/pages/LanguageSelection.js';
import PhoneLogin from './frontend/pages/PhoneLogin.js';
import RegisterProfile from './frontend/pages/RegisterProfile.js';
import Dashboard from './frontend/pages/Dashboard.js';
import GovernmentSchemes from './frontend/pages/GovernmentSchemes.js';
import DocumentVault from './frontend/pages/DocumentVault.js';
import Profile from './frontend/pages/Profile.js';
import Settings from './frontend/pages/Settings.js';
import BenefitsDiscovery from './frontend/pages/BenefitsDiscovery.js';
import VoiceAssistantPage from './frontend/pages/VoiceAssistant.js';
import { RefreshCw } from 'lucide-react';

// protected routing utility for internal dashboard modules
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading, user } = useApp();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    // If authenticated on Firebase but hasn't completed onboarding registration
    if (user && !user.profileSetupCompleted) {
      return <Navigate to="/register" replace />;
    }
    return <Navigate to="/login" replace />;
  }

  return <MainLayout>{children}</MainLayout>;
};

// routing utility for public onboarding screens
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading } = useApp();

  if (loading) {
    return <LoadingScreen />;
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

// Full Page loading state to prevent layout flash during auth retrieval
const LoadingScreen = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center text-slate-900 dark:text-slate-50">
      <div className="flex flex-col items-center gap-4">
        <RefreshCw className="w-10 h-10 text-blue-600 dark:text-blue-400 animate-spin" strokeWidth={1.5} />
        <span className="text-xs font-mono font-bold tracking-widest text-slate-400 uppercase">
          ThunAI Loading...
        </span>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <Router>
        <Routes>
          {/* Public Entrance routes */}
          <Route path="/" element={<SplashScreen />} />
          <Route path="/select-language" element={<LanguageSelection />} />
          <Route path="/login" element={<PublicRoute><PhoneLogin /></PublicRoute>} />
          
          {/* Registration onboarding profile setup */}
          <Route path="/register" element={<RegisterProfile />} />

          {/* Protected Main app routes */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/schemes" element={<ProtectedRoute><GovernmentSchemes /></ProtectedRoute>} />
          <Route path="/documents" element={<ProtectedRoute><DocumentVault /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          <Route path="/benefits-discovery" element={<ProtectedRoute><BenefitsDiscovery /></ProtectedRoute>} />
          <Route path="/voice-assistant" element={<ProtectedRoute><VoiceAssistantPage /></ProtectedRoute>} />

          {/* Catch-all redirection path */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AppProvider>
  );
}
