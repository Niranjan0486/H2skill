# Firebase Setup Verification Guide

This guide will help you verify that your Firebase configuration is correct.

## ✅ Quick Verification Steps

### 1. Check Your `.env.local` File

Make sure you have a `.env.local` file in the project root with all these variables:

```env
VITE_FIREBASE_API_KEY=AIzaSy... (should be a long string starting with AIzaSy)
VITE_FIREBASE_AUTH_DOMAIN=your-project-name.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-name (no .firebaseapp.com)
VITE_FIREBASE_STORAGE_BUCKET=your-project-name.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012 (numeric string)
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdefghijklmnop
```

**⚠️ Important:** 
- Do NOT include quotes around the values
- Make sure there are no spaces around the `=` sign
- Values should NOT contain "your-project" or "your-api-key" - these are placeholders

### 2. Check Browser Console

1. Start your dev server: `npm run dev`
2. Open your app in the browser
3. Open Developer Tools (F12) and go to the Console tab
4. Look for these messages:

**✅ Good signs:**
- `✅ Firebase configuration loaded successfully`
- `📦 Project ID: your-actual-project-id`
- No red error messages about Firebase

**❌ Warning signs:**
- `⚠️ Firebase Configuration Warning:` - Your .env.local is not configured
- `❌ Firebase initialization error:` - Check your configuration values
- `auth/api-key-not-valid` - Your API key is incorrect
- `auth/operation-not-allowed` - Sign-in method not enabled in Firebase Console

### 3. Check the Visual Indicator

When you run the app, you should see a **Firebase Configuration Status** widget in the bottom-right corner (development mode only).

**✅ All green checkmarks** = Configuration is correct!

**❌ Red X marks** = There are issues to fix

### 4. Verify Firebase Console Settings

#### Enable Authentication Methods:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Click **Authentication** in the left sidebar
4. Click **Sign-in method** tab
5. Enable these methods:

   **Email/Password:**
   - Click "Email/Password"
   - Toggle "Enable" to ON
   - Click "Save"

   **Google:**
   - Click "Google"
   - Toggle "Enable" to ON
   - Enter a support email
   - Click "Save"

#### Check Authorized Domains:

1. In Firebase Console > Authentication
2. Click **Settings** tab
3. Scroll to **Authorized domains**
4. Make sure `localhost` is in the list (for local development)

### 5. Test Authentication

1. Try to sign in with email/password:
   - If you don't have an account, the error message will tell you
   - If you do, it should work

2. Try Google sign-in:
   - Click the Google button
   - A popup should appear for Google sign-in
   - If it doesn't, check the console for errors

## 🔍 Common Issues and Solutions

### Issue: "Firebase Configuration Warning" in console

**Solution:**
- Check that `.env.local` exists in the project root
- Verify all variables start with `VITE_FIREBASE_`
- Make sure values are not placeholders
- Restart your dev server after editing `.env.local`

### Issue: "auth/api-key-not-valid"

**Solution:**
- Double-check your API key in `.env.local`
- Get a fresh API key from Firebase Console > Project Settings > General > Your apps

### Issue: "auth/operation-not-allowed"

**Solution:**
- Go to Firebase Console > Authentication > Sign-in method
- Enable the sign-in method you're trying to use (Email/Password or Google)

### Issue: "auth/unauthorized-domain"

**Solution:**
- Go to Firebase Console > Authentication > Settings
- Add your domain to "Authorized domains"
- For local development, `localhost` should already be there

### Issue: Environment variables not loading

**Solution:**
1. Make sure the file is named exactly `.env.local` (not `.env` or `.env.example`)
2. Restart your dev server completely (stop and start again)
3. Make sure you're using `VITE_` prefix for all variables
4. Clear your browser cache

## ✅ Final Checklist

Before considering Firebase setup complete, verify:

- [ ] `.env.local` file exists with all 6 Firebase variables
- [ ] All variables have real values (not placeholders)
- [ ] Dev server restarted after adding/editing `.env.local`
- [ ] Browser console shows "Firebase configuration loaded successfully"
- [ ] Firebase Config Checker widget shows all green checkmarks
- [ ] Email/Password sign-in method enabled in Firebase Console
- [ ] Google sign-in method enabled in Firebase Console
- [ ] `localhost` is in authorized domains
- [ ] Can see the login page without errors
- [ ] (Optional) Successfully created a test account

## 🎯 Quick Test

Run these commands to verify:

```bash
# 1. Check if .env.local exists
if (Test-Path .env.local) { Write-Host "✅ .env.local exists" } else { Write-Host "❌ .env.local missing" }

# 2. Start dev server
npm run dev

# 3. Open browser console and check for Firebase messages
```

## 📝 Still Having Issues?

1. Double-check that you copied the config values correctly from Firebase Console
2. Make sure there are no extra spaces or quotes in `.env.local`
3. Verify your Firebase project is active and not paused
4. Check that your internet connection is working
5. Try clearing browser cache and restarting the dev server

---

**Need Help?** Check the browser console for specific error messages - they usually point to the exact issue!

