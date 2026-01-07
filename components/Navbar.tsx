import React from 'react';
import { Leaf, LogOut, User as UserIcon } from 'lucide-react';
import { User, ViewState } from '../types';

interface NavbarProps {
  currentView: ViewState;
  user: User | null;
  onNavigate: (view: ViewState) => void;
  onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ currentView, user, onNavigate, onLogout }) => {
  return (
    <nav className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div 
            className="flex items-center cursor-pointer gap-2" 
            onClick={() => onNavigate('landing')}
          >
            <div className="bg-emerald-100 p-2 rounded-lg">
              <Leaf className="h-6 w-6 text-emerald-600" />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-600">
              EcoVerify AI
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-4">
                <div className="hidden md:flex items-center gap-2 text-sm text-slate-600">
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-200">
                     <img src={user.avatar} alt="User" className="w-full h-full object-cover" />
                  </div>
                  <span className="font-medium">{user.name}</span>
                </div>
                <button 
                  onClick={onLogout}
                  className="p-2 text-slate-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  title="Logout"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            ) : (
              currentView === 'landing' && (
                <div className="flex gap-3">
                  <button 
                    onClick={() => onNavigate('auth')}
                    className="text-sm font-medium text-slate-600 hover:text-emerald-600 transition-colors"
                  >
                    Log In
                  </button>
                  <button 
                    onClick={() => onNavigate('auth')}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-sm hover:shadow-emerald-200/50"
                  >
                    Get Started
                  </button>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;