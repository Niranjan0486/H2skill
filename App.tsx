import React, { useState } from 'react';
import Navbar from './components/Navbar';
import LandingPage from './components/LandingPage';
import AuthPage from './components/AuthPage';
import Dashboard from './components/Dashboard';
import { ViewState, User } from './types';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('landing');
  const [user, setUser] = useState<User | null>(null);

  const handleLoginSuccess = (userData: User) => {
    setUser(userData);
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentView('landing');
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <Navbar 
        currentView={currentView}
        user={user}
        onNavigate={setCurrentView}
        onLogout={handleLogout}
      />

      <main>
        {currentView === 'landing' && (
          <LandingPage onGetStarted={() => setCurrentView('auth')} />
        )}

        {currentView === 'auth' && (
          <AuthPage onLoginSuccess={handleLoginSuccess} />
        )}

        {currentView === 'dashboard' && (
          <Dashboard />
        )}
      </main>
    </div>
  );
};

export default App;