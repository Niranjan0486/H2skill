import React, { useState } from 'react';
import { Eye, EyeOff, Leaf } from 'lucide-react';
import { signInWithEmail, signInWithGoogle } from '../services/auth';
import { User } from '../types';

interface AuthPageProps {
  onLoginSuccess: (user: User) => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      const user = await signInWithEmail(email, password);
      onLoginSuccess(user);
    } catch (err: any) {
      setError(err.message || 'Failed to sign in. Please check your credentials.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    setError(null);
    
    try {
      const user = await signInWithGoogle();
      onLoginSuccess(user);
    } catch (err: any) {
      setError(err.message || 'Failed to sign in with Google.');
      console.error(err);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Login Form */}
      <div className="w-full lg:w-1/2 bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-950 flex flex-col justify-center px-8 lg:px-16">
        <div className="max-w-md mx-auto w-full">
          {/* Logo */}
          <div className="flex items-center gap-2 mb-12">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <span className="text-white text-xl font-bold">Eco Verify</span>
          </div>

          <h2 className="text-4xl font-bold text-white mb-3">Welcome Back</h2>
          <p className="text-white/80 mb-8">Secure access to your Environmental Compliance Dashboard.</p>

          {/* Google Sign In */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isLoading || isGoogleLoading}
            className="w-full bg-slate-800 border border-slate-700 text-white py-3 rounded-lg font-medium hover:bg-slate-750 transition-colors flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed mb-6"
          >
            {isGoogleLoading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            ) : (
              <>
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Sign in with Google
              </>
            )}
          </button>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-emerald-900 text-white/60">or continue with email</span>
            </div>
          </div>

          {/* Email Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-white mb-2">Work Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full bg-slate-800 border border-slate-700 text-white px-4 py-3 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all placeholder:text-slate-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full bg-slate-800 border border-slate-700 text-white px-4 py-3 pr-12 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all placeholder:text-slate-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              <a href="#" className="text-emerald-400 hover:text-emerald-300 text-sm mt-2 inline-block">
                Forgot Password?
              </a>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || isGoogleLoading}
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-white py-3 rounded-lg font-bold transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block"></span>
              ) : (
                'Log In'
              )}
            </button>
          </form>


          <p className="text-white/40 text-xs mt-6 text-center">
            By clicking continue, you agree to our <a href="#" className="text-emerald-400">Terms of Service</a> and <a href="#" className="text-emerald-400">Privacy Policy</a>.
          </p>
        </div>
      </div>

      {/* Right Panel - Forest Background */}
      <div 
        className="hidden lg:flex lg:w-1/2 bg-cover bg-center relative"
        style={{
          backgroundImage: 'url("https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1920&q=80")'
        }}
      >
        <div className="absolute inset-0 bg-emerald-950/40"></div>
        <div className="relative z-10 p-12 flex flex-col justify-between h-full">
          <div className="bg-emerald-500/20 border border-emerald-400/30 text-emerald-200 px-4 py-2 rounded-full text-sm font-medium w-fit">
            <span className="w-2 h-2 bg-emerald-400 rounded-full inline-block mr-2"></span>
            AI-POWERED COMPLIANCE
          </div>
          <div className="text-white">
            <blockquote className="text-3xl font-bold leading-relaxed">
              "EcoDiligence has transformed how we monitor our factory footprint, ensuring we stay green and compliant effortlessly."
            </blockquote>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
