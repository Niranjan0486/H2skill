# Render Backend

Standalone Express.js backend for EcoVerify, deployed on Render (free tier).

## Architecture

- **Frontend**: Vite + React on Firebase Hosting
- **Backend**: Express.js on Render (this folder)
- **Auth**: Firebase Authentication (frontend) + Firebase Admin SDK (backend)

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

**Required variables:**
- `FIREBASE_PROJECT_ID` - Your Firebase project ID
- `FIREBASE_CLIENT_EMAIL` - Firebase Admin SDK service account email
- `FIREBASE_PRIVATE_KEY` - Firebase Admin SDK private key (keep the `\n` characters)

**Optional:**
- `PORT` - Server port (default: 3000)
- `CORS_ORIGIN` - Allowed CORS origin (default: `*`)
- `GEMINI_API_KEY` - For AI features
- `SATELLITE_API_KEY` - For satellite imagery APIs

### 3. Run Locally

```bash
npm run dev
```

Server will start on `http://localhost:3000`

## API Endpoints

### Public

- `GET /health` - Health check

### Protected (Requires Firebase ID Token)

- `GET /api/me` - Get current user info
- `POST /api/analyze-factory` - Run environmental compliance analysis pipeline

**Example request:**
```bash
curl -X POST http://localhost:3000/api/analyze-factory \
  -H "Authorization: Bearer <FIREBASE_ID_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "factoryName": "Textile Manufacturing Unit",
    "latitude": 11.1085,
    "longitude": 77.3411,
    "establishedYear": 2017
  }'
```

## Deployment on Render

### Prerequisites

1. Push this code to GitHub
2. Have a Render account (free tier works)

### Steps

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **New > Web Service**
3. Connect your GitHub repository
4. Configure:
   - **Name**: `ecoverify-backend` (or your choice)
   - **Root Directory**: `render-backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Add Environment Variables (same as `.env` file):
   - `FIREBASE_PROJECT_ID`
   - `FIREBASE_CLIENT_EMAIL`
   - `FIREBASE_PRIVATE_KEY` (paste the full key with `\n` characters)
   - `CORS_ORIGIN` (your Firebase Hosting URL, e.g., `https://your-project.web.app`)
   - Any API keys you need
6. Click **Create Web Service**

Render will automatically deploy on every push to your main branch.

## Getting Firebase Admin SDK Credentials

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Click the gear icon > **Project Settings**
4. Go to **Service Accounts** tab
5. Click **Generate New Private Key**
6. Download the JSON file
7. Extract these values:
   - `project_id` → `FIREBASE_PROJECT_ID`
   - `client_email` → `FIREBASE_CLIENT_EMAIL`
   - `private_key` → `FIREBASE_PRIVATE_KEY` (keep the `\n` characters)

## Troubleshooting

### Backend returns 401 Unauthorized

- Check that the frontend is sending the Firebase ID token in the `Authorization` header
- Verify Firebase Admin SDK credentials are correct
- Check Render logs for detailed error messages

### CORS errors

- Set `CORS_ORIGIN` to your exact frontend URL (e.g., `https://your-project.web.app`)
- Don't include trailing slashes

### Backend fails to start on Render

- Check that all required environment variables are set
- Verify Node version is 18+ (Render should auto-detect from `package.json`)
