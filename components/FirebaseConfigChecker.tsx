import React, { useEffect, useState } from 'react';
import { auth } from '../services/firebase';

/**
 * Component to verify Firebase configuration at runtime
 * This can be temporarily added to your app to check if Firebase is properly configured
 */
const FirebaseConfigChecker: React.FC = () => {
  const [status, setStatus] = useState<{
    configValid: boolean;
    firebaseConnected: boolean;
    authAvailable: boolean;
    issues: string[];
  }>({
    configValid: false,
    firebaseConnected: false,
    authAvailable: false,
    issues: []
  });

  useEffect(() => {
    const issues: string[] = [];
    let configValid = true;
    let firebaseConnected = false;
    let authAvailable = false;

    // Check if environment variables are loaded
    const envVars = {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID
    };

    // Check for placeholder values
    if (!envVars.apiKey || envVars.apiKey === 'your-api-key' || envVars.apiKey.length < 20) {
      issues.push('API Key is not configured or invalid');
      configValid = false;
    }
    if (!envVars.projectId || envVars.projectId.includes('your-project')) {
      issues.push('Project ID is not configured');
      configValid = false;
    }
    if (!envVars.authDomain || envVars.authDomain.includes('your-project')) {
      issues.push('Auth Domain is not configured');
      configValid = false;
    }

    // Check if Firebase Auth is available
    try {
      if (auth) {
        firebaseConnected = true;
        authAvailable = true;
      }
    } catch (error) {
      issues.push('Firebase Auth is not initialized');
      firebaseConnected = false;
    }

    setStatus({
      configValid,
      firebaseConnected,
      authAvailable,
      issues
    });
  }, []);

  // Only show in development
  if (import.meta.env.PROD) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white border-2 rounded-lg shadow-xl p-4 max-w-md z-50">
      <h3 className="font-bold text-sm mb-2">Firebase Configuration Status</h3>
      
      <div className="space-y-1 text-xs">
        <div className={status.configValid ? "text-green-600" : "text-red-600"}>
          {status.configValid ? "✅ Config Valid" : "❌ Config Invalid"}
        </div>
        <div className={status.firebaseConnected ? "text-green-600" : "text-red-600"}>
          {status.firebaseConnected ? "✅ Firebase Connected" : "❌ Firebase Not Connected"}
        </div>
        <div className={status.authAvailable ? "text-green-600" : "text-red-600"}>
          {status.authAvailable ? "✅ Auth Available" : "❌ Auth Not Available"}
        </div>
      </div>

      {status.issues.length > 0 && (
        <div className="mt-3 pt-3 border-t">
          <p className="text-xs font-semibold text-red-600 mb-1">Issues:</p>
          <ul className="text-xs text-red-600 list-disc list-inside space-y-0.5">
            {status.issues.map((issue, idx) => (
              <li key={idx}>{issue}</li>
            ))}
          </ul>
          <p className="text-xs text-gray-600 mt-2">
            Check your .env.local file and make sure you've restarted the dev server.
          </p>
        </div>
      )}

      {status.configValid && status.firebaseConnected && status.authAvailable && (
        <div className="mt-3 pt-3 border-t">
          <p className="text-xs text-green-600 font-semibold">
            ✅ All checks passed! Firebase is properly configured.
          </p>
        </div>
      )}
    </div>
  );
};

export default FirebaseConfigChecker;

