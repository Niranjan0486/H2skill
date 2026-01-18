# Environment Variables Setup

## Local Development Setup

This application requires environment variables to be configured in `.env.local` file (located at the root of the project).

### Required Environment Variables

#### Frontend (.env.local in H2skill/)
```bash
# Enable local satellite mode (must be 'true' to use real GEE data)
VITE_LOCAL_SATELLITE_MODE=true

# Backend URL (Node.js backend that proxies to Python GEE service)
VITE_BACKEND_URL=http://localhost:3001
```

#### Node.js Backend (.env.local in render-backend/)
```bash
# Enable local satellite mode
LOCAL_SATELLITE_MODE=true

# Python GEE backend URL
GEE_PYTHON_BACKEND_URL=http://localhost:5000

# CORS origin (for local dev)
CORS_ORIGIN=http://localhost:3000

# Gemini API (semantic extraction only - optional)
GEMINI_API_KEY=your_gemini_api_key_here

# Firebase Admin SDK (for authentication)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY=your-private-key
FIREBASE_CLIENT_EMAIL=your-client-email
```

#### Python GEE Backend (.env.local in gee-python-backend/)
```bash
# Google Earth Engine service account key path
GEE_SERVICE_ACCOUNT_KEY=path/to/service-account-key.json

# GEE project ID
GEE_PROJECT_ID=your-gee-project-id

# Server port
PORT=5000
```

### Setup Instructions

1. **Create `.env.local` files** in each directory:
   - `H2skill/.env.local` (frontend)
   - `H2skill/render-backend/.env.local` (Node.js backend)
   - `H2skill/gee-python-backend/.env.local` (Python GEE backend)

2. **For Real Satellite Data (Optional)**:
   ```bash
   # Frontend
   VITE_LOCAL_SATELLITE_MODE=true
   VITE_BACKEND_URL=http://localhost:3000
   
   # Node.js Backend
   LOCAL_SATELLITE_MODE=true
   GEE_PYTHON_BACKEND_URL=http://localhost:5000
   
   # Python Backend
   GEE_SERVICE_ACCOUNT_KEY=./service-account-key.json
   GEE_PROJECT_ID=your-project-id
   PORT=5000
   ```

3. **For Fallback Mode (No Real Data)**:
   ```bash
   # Frontend
   VITE_LOCAL_SATELLITE_MODE=false
   ```
   The app will use computed/mock data and won't crash.

### Local-Only Safety

✅ All changes run locally only and do not affect Firebase Hosting or Render until explicitly deployed
✅ When `VITE_LOCAL_SATELLITE_MODE=false`, app falls back gracefully (no crashes)
✅ API keys are loaded from `.env.local` only (never hardcoded)
✅ All `.env.local` files are gitignored

### Setting Up Google Earth Engine

1. **Create a Google Cloud Project**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing project
   - Enable "Earth Engine API"

2. **Create Service Account**:
   - Go to "IAM & Admin" > "Service Accounts"
   - Create a new service account
   - Grant "Earth Engine User" role
   - Create and download JSON key file

3. **Authenticate GEE**:
   ```bash
   cd gee-python-backend
   earthengine authenticate --service-account path/to/service-account-key.json
   ```

4. **Install Python Dependencies**:
   ```bash
   cd gee-python-backend
   pip install -r requirements.txt
   ```

5. **Start Python Backend**:
   ```bash
   python server.py
   ```

### Running the Full Stack Locally

1. **Start Python GEE Backend** (Terminal 1):
   ```bash
   cd gee-python-backend
   python server.py
   # Runs on http://localhost:5000
   ```

2. **Start Node.js Backend** (Terminal 2):
   ```bash
   cd render-backend
   npm run dev
   # Runs on http://localhost:3001
   ```

3. **Start Frontend** (Terminal 3):
   ```bash
   cd H2skill
   npm run dev
   # Runs on http://localhost:3000
   ```

### Architecture

```
Frontend (Vite/React)
  ↓ (calls /api/compute-ndvi, /api/generate-tiles)
Node.js Backend (Express)
  ↓ (proxies to Python service)
Python GEE Backend (Flask)
  ↓ (uses GEE Python SDK)
Google Earth Engine
```

### Important Notes

- **Real GEE integration requires the Python backend to be running**
- If Python backend is not available, the app gracefully falls back to computed data
- All satellite data processing happens server-side (GEE doesn't allow client-side processing)
- The frontend receives tile URLs and NDVI data from the backend services
- No API keys are hardcoded - all read from `.env.local`
