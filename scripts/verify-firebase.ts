// Firebase Configuration Verification Script
// Run this with: npx tsx scripts/verify-firebase.ts (or add to package.json scripts)

import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';

const requiredEnvVars = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID'
];

console.log('\n🔍 Firebase Configuration Verification\n');
console.log('='.repeat(50));

// Load environment variables (using dotenv in Node context)
const env = process.env;

// Check environment variables
let allSet = true;
const config: Record<string, string> = {};

requiredEnvVars.forEach(envVar => {
  const value = env[envVar];
  if (!value || value.startsWith('your-') || value === '123456789' || value === 'your-api-key') {
    console.log(`❌ ${envVar}: Not configured (using placeholder/default)`);
    allSet = false;
    config[envVar] = '';
  } else {
    const maskedValue = value.length > 20 ? value.substring(0, 20) + '...' : value;
    console.log(`✅ ${envVar}: Configured`);
    config[envVar] = value;
  }
});

console.log('\n' + '='.repeat(50));

if (allSet) {
  console.log('\n✅ All Firebase environment variables are configured!\n');
  
  // Try to initialize Firebase
  try {
    const firebaseConfig = {
      apiKey: config.VITE_FIREBASE_API_KEY,
      authDomain: config.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: config.VITE_FIREBASE_PROJECT_ID,
      storageBucket: config.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: config.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: config.VITE_FIREBASE_APP_ID
    };
    
    // Validate config values
    if (!firebaseConfig.apiKey || firebaseConfig.apiKey.length < 20) {
      throw new Error('API Key appears to be invalid (too short or empty)');
    }
    
    if (!firebaseConfig.projectId || firebaseConfig.projectId.includes('your-')) {
      throw new Error('Project ID appears to be invalid');
    }
    
    if (!firebaseConfig.authDomain || firebaseConfig.authDomain.includes('your-')) {
      throw new Error('Auth Domain appears to be invalid');
    }
    
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    
    console.log('✅ Firebase initialized successfully!');
    console.log('✅ Firebase Auth service ready');
    console.log(`✅ Project ID: ${firebaseConfig.projectId}`);
    console.log(`✅ Auth Domain: ${firebaseConfig.authDomain}`);
    
    console.log('\n📋 Next Steps:');
    console.log('1. Verify in Firebase Console that Authentication is enabled');
    console.log('2. Enable Email/Password sign-in method');
    console.log('3. Enable Google sign-in method');
    console.log('4. Make sure your domain is authorized in Firebase Console');
    console.log('   (For localhost: Check Authentication > Settings > Authorized domains)');
    
  } catch (error: any) {
    console.error('\n❌ Error initializing Firebase:', error.message);
    console.log('\n💡 Troubleshooting:');
    console.log('- Double-check your .env.local file values');
    console.log('- Make sure you copied the config from Firebase Console correctly');
    console.log('- Restart your dev server after changing .env.local');
  }
} else {
  console.log('\n❌ Some Firebase environment variables are missing or not configured.');
  console.log('\n📝 Please:');
  console.log('1. Check your .env.local file exists in the project root');
  console.log('2. Add all required Firebase configuration variables');
  console.log('3. Get the values from Firebase Console > Project Settings > Your Apps');
  console.log('4. Restart your dev server after updating .env.local');
}

console.log('\n' + '='.repeat(50) + '\n');

