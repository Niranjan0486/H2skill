# Quick Start Guide

## 🚀 Running the Project

The project is now ready to run! Here's how:

### 1. Install Dependencies (if not already done)
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```

The app will start at `http://localhost:3000`

---

## 🧪 Testing the Backend Pipeline

### Option 1: Test from UI (Easiest)

1. Start the dev server (`npm run dev`)
2. Navigate to the Dashboard (login required)
3. Click the **"Test Backend Pipeline (Demo Location)"** button
4. This will run the complete 8-step pipeline with the demo location:
   - **Location**: Tiruppur, Tamil Nadu
   - **Coordinates**: 11.1085, 77.3411
   - **Established**: 2017

The pipeline will:
- ✅ Validate input
- ✅ Create 2km AOI buffer
- ✅ Generate monthly time windows
- ✅ Fetch satellite data (mock)
- ✅ Calculate NDVI
- ✅ Analyze trends
- ✅ Classify risk level
- ✅ Generate results

### Option 2: Test Programmatically

```typescript
import { analyzeFactory, analyzeDemoLocation } from './services/api';

// Quick test with demo location
const result = await analyzeDemoLocation();

// Or custom location
const customResult = await analyzeFactory({
  factoryName: "Your Factory",
  latitude: 19.0760,
  longitude: 72.8777,
  establishedYear: 2020
});
```

### Option 3: Run Backend Example Script

```bash
# If you have tsx installed
npx tsx backend/example.ts
```

---

## 📋 Current Features

### ✅ Working Features

1. **Backend Pipeline**: Complete 8-step pipeline implemented
2. **Input Validation**: Coordinates, year, factory name validation
3. **NDVI Calculation**: Standard vegetation index calculation
4. **Risk Classification**: HIGH/MEDIUM/LOW with explainable reasons
5. **Frontend Integration**: Results display in the UI
6. **Mock Data**: Realistic satellite data simulation for MVP

### ⚠️ Mock vs Real

- **Satellite Data**: Currently uses mock/simulated data
- **Location**: Works with any coordinates in India
- **Production**: Replace `step4_satellite.ts` with real API calls

---

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Change port in vite.config.ts or use:
npm run dev -- --port 3001
```

### TypeScript Errors
```bash
# Check if all dependencies are installed
npm install

# Verify types
npx tsc --noEmit
```

### Module Not Found
- Make sure all backend files are in the `backend/` folder
- Check that imports use relative paths correctly

---

## 📁 Project Structure

```
H2skill/
├── backend/              # Backend pipeline (all 8 steps)
│   ├── pipeline.ts      # Main orchestrator
│   ├── step1-8_*.ts    # Individual pipeline steps
│   └── types.ts         # Type definitions
├── components/          # React components
├── services/            # API services
│   └── api.ts          # Includes analyzeFactory() & analyzeDemoLocation()
└── package.json        # Dependencies
```

---

## 🎯 Next Steps

1. **Run the project**: `npm run dev`
2. **Test the pipeline**: Click "Test Backend Pipeline" button in Dashboard
3. **View results**: See NDVI trends, risk level, and satellite analysis
4. **Customize**: Modify `backend/step4_satellite.ts` for real satellite data

---

## 📚 Documentation

- **Backend Details**: See `backend/README.md`
- **Implementation Summary**: See `BACKEND_PIPELINE_SUMMARY.md`

---

**Ready to go!** 🚀

