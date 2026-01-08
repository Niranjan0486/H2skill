import React, { useState, useEffect } from 'react';
import LandingPage from './components/LandingPage';
import AuthPage from './components/AuthPage';
import Dashboard from './components/Dashboard';
import { ViewState, User } from './types';
import { onAuthStateChange, signOutUser } from './services/auth';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('landing');
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Listen to Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChange((authUser) => {
      setUser(authUser);
      setIsLoading(false);
      
      // If user is authenticated and on landing/auth page, redirect to dashboard
      if (authUser && (currentView === 'landing' || currentView === 'auth')) {
        setCurrentView('dashboard');
      }
      // If user is not authenticated and on dashboard, redirect to landing
      else if (!authUser && currentView === 'dashboard') {
        setCurrentView('landing');
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [currentView]);

  const handleNavigate = (view: ViewState) => {
    setCurrentView(view);
  };

  const handleLoginSuccess = (loggedInUser: User) => {
    setUser(loggedInUser);
    setCurrentView('dashboard');
  };

  const handleLogout = async () => {
    try {
      console.log('Attempting to sign out from Firebase...');
      await signOutUser();
      console.log('Successfully signed out from Firebase');
      // The auth state listener will automatically update the user state and redirect
      // But we'll also manually update to ensure immediate feedback
      setUser(null);
      setCurrentView('landing');
    } catch (error: any) {
      console.error('Error signing out:', error);
      alert(`Logout failed: ${error.message || 'Unknown error'}`);
      // Still clear local state even if Firebase sign out fails
      setUser(null);
      setCurrentView('landing');
    }
  };

  const handleGetStarted = () => {
    setCurrentView('auth');
  };

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
          <p className="text-slate-600 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <main>
        {currentView === 'landing' && (
          <LandingPage onGetStarted={handleGetStarted} />
        )}
        {currentView === 'auth' && (
          <AuthPage onLoginSuccess={handleLoginSuccess} />
        )}
        {currentView === 'dashboard' && user && (
          <Dashboard onLogout={handleLogout} />
        )}
      </main>
    </div>
  );
};

export default App;