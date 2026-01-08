<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# EcoVerify AI

An AI-powered environmental compliance platform that uses satellite imagery and NDVI analysis to verify factory environmental compliance.

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`

2. Set up Firebase Authentication:
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Authentication and add Email/Password and Google sign-in methods
   - Go to Project Settings > Your Apps > Web App and copy your config
   - Create a `.env.local` file in the root directory with the following variables:
     ```
     VITE_FIREBASE_API_KEY=your-api-key-here
     VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
     VITE_FIREBASE_PROJECT_ID=your-project-id
     VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
     VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
     VITE_FIREBASE_APP_ID=your-app-id
     ```

3. (Optional) Set the `GEMINI_API_KEY` in `.env.local` to your Gemini API key

4. Run the app:
   `npm run dev`
