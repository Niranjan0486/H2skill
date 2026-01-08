import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  GoogleAuthProvider
} from 'firebase/auth';
import { auth, googleProvider } from './firebase';
import { User } from '../types';

/**
 * Convert Firebase User to our User type
 */
const mapFirebaseUserToUser = (firebaseUser: FirebaseUser): User => {
  return {
    id: firebaseUser.uid,
    name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
    email: firebaseUser.email || '',
    avatar: firebaseUser.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(firebaseUser.displayName || firebaseUser.email || 'User')}&background=10b981&color=fff`
  };
};

/**
 * Sign in with email and password
 */
export const signInWithEmail = async (email: string, password: string): Promise<User> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return mapFirebaseUserToUser(userCredential.user);
  } catch (error: any) {
    throw new Error(error.message || 'Failed to sign in');
  }
};

/**
 * Sign up with email and password
 */
export const signUpWithEmail = async (email: string, password: string, displayName?: string): Promise<User> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Update display name if provided
    if (displayName && userCredential.user) {
      // Note: To update display name, you'd need to use updateProfile
      // For now, we'll just return the user as is
    }
    
    return mapFirebaseUserToUser(userCredential.user);
  } catch (error: any) {
    throw new Error(error.message || 'Failed to sign up');
  }
};

/**
 * Sign in with Google
 */
export const signInWithGoogle = async (): Promise<User> => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return mapFirebaseUserToUser(result.user);
  } catch (error: any) {
    throw new Error(error.message || 'Failed to sign in with Google');
  }
};

/**
 * Sign out
 */
export const signOutUser = async (): Promise<void> => {
  try {
    console.log('signOutUser called, current auth state:', auth.currentUser?.email || 'No user');
    if (!auth) {
      throw new Error('Firebase auth is not initialized');
    }
    await signOut(auth);
    console.log('Firebase signOut completed successfully');
  } catch (error: any) {
    console.error('Firebase signOut error:', error);
    throw new Error(error.message || 'Failed to sign out');
  }
};

/**
 * Listen to auth state changes
 */
export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, (firebaseUser) => {
    if (firebaseUser) {
      callback(mapFirebaseUserToUser(firebaseUser));
    } else {
      callback(null);
    }
  });
};

/**
 * Get current user
 */
export const getCurrentUser = (): User | null => {
  const firebaseUser = auth.currentUser;
  return firebaseUser ? mapFirebaseUserToUser(firebaseUser) : null;
};

