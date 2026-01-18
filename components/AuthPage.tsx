import React, { useState } from 'react';
import { Leaf, Shield } from 'lucide-react';
import { signInWithGoogle } from '../services/auth';
import { User } from '../types';

interface AuthPageProps {
  onLoginSuccess: (user: User) => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onLoginSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const user = await signInWithGoogle();
      onLoginSuccess(user);
    } catch (err: any) {
      setError(err.message || 'Failed to sign in with Google.');
      console.error(err);
    } finally {
      setIsLoading(false);
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

          {/* Firebase Security Badge */}
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-500/20 rounded-full flex items-center justify-center">
                <Shield className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-emerald-400 font-semibold text-sm">Enterprise-Grade Security</p>
                <p className="text-white/60 text-xs">Authentication powered by Google Firebase</p>
              </div>
            </div>
          </div>

          {/* Google Sign In - Primary Auth Method */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full bg-white hover:bg-gray-100 text-gray-800 py-4 rounded-lg font-semibold transition-colors flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed mb-4"
          >
            {isLoading ? (
              <span className="w-5 h-5 border-2 border-gray-400 border-t-gray-800 rounded-full animate-spin"></span>
            ) : (
              <>
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Continue with Google (Firebase Secure Sign-In)
              </>
            )}
          </button>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg text-sm mb-4">
              {error}
            </div>
          )}

          {/* Security Notes */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 mb-6">
            <p className="text-white/60 text-xs leading-relaxed">
              <span className="text-white font-medium">Why Google Sign-In?</span><br />
              We use Firebase Authentication for enterprise-grade security. Your credentials are never stored on our servers. All authentication is handled securely by Google's infrastructure.
            </p>
          </div>
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
              "EcoVerify has transformed how we monitor our factory footprint, ensuring we stay green and compliant effortlessly."
            </blockquote>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;

