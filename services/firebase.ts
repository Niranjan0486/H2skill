import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "your-api-key",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "your-project.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "your-project-id",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "your-project.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "your-app-id"
};

// Validate Firebase configuration
const isConfigValid = () => {
  const hasPlaceholder = 
    firebaseConfig.apiKey === "your-api-key" ||
    firebaseConfig.authDomain.includes("your-project") ||
    firebaseConfig.projectId === "your-project-id" ||
    firebaseConfig.storageBucket.includes("your-project") ||
    firebaseConfig.messagingSenderId === "123456789" ||
    firebaseConfig.appId === "your-app-id";
  
  return !hasPlaceholder;
};

// Warn if configuration is not set up
if (!isConfigValid()) {
  console.warn(
    '⚠️ Firebase Configuration Warning:\n' +
    'Your Firebase environment variables are not configured or are using default values.\n' +
    'Please create a .env.local file with your Firebase project configuration.\n' +
    'See README.md for setup instructions.\n'
  );
} else {
  console.log('✅ Firebase configuration loaded successfully');
  console.log(`📦 Project ID: ${firebaseConfig.projectId}`);
}

// Initialize Firebase
let app;
try {
  app = initializeApp(firebaseConfig);
} catch (error: any) {
  console.error('❌ Firebase initialization error:', error.message);
  if (!isConfigValid()) {
    console.error('💡 This is likely because Firebase configuration is not set up. Please check your .env.local file.');
  }
  throw error;
}

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export default app;

