# Simple Start Guide - Run Locally Without Backend

## 🚀 Quick Start (Frontend Only - No Backend Required)

You can run the frontend **without** the Python or Node.js backends. The app will use mock/computed data and work perfectly fine.

### Step 1: Install Dependencies
```bash
cd H2skill
npm install
```

### Step 2: Create .env.local (Optional)
Create a file named `.env.local` in the `H2skill` folder:

```bash
# H2skill/.env.local
VITE_LOCAL_SATELLITE_MODE=false
```

This tells the app to use computed data instead of trying to connect to GEE backends.

### Step 3: Start the Frontend
```bash
npm run dev
```

The app should start at `http://localhost:3000` (or check the terminal for the actual port).

### Step 4: Use the App
1. Open `http://localhost:3000` in your browser
2. The app will work with mock/computed data
3. All features work except real satellite tiles (which will show OpenStreetMap instead)

---

## 🔧 Troubleshooting

### Issue: "Cannot find module" or Import Errors

**Solution:**
```bash
# Delete node_modules and reinstall
cd H2skill
rm -rf node_modules package-lock.json
npm install
```

On Windows PowerShell:
```powershell
cd H2skill
Remove-Item -Recurse -Force node_modules, package-lock.json
npm install
```

### Issue: Port 3000 Already in Use

**Solution:** The app will automatically try another port. Check the terminal output for the actual URL (usually `http://localhost:5173`).

Or manually change port in `vite.config.ts`:
```typescript
server: {
  port: 3001,  // Change to any available port
  host: '0.0.0.0',
}
```

### Issue: TypeScript Errors

**Solution:**
```bash
# Check for TypeScript errors
npx tsc --noEmit

# If errors, try reinstalling types
npm install --save-dev @types/node @types/leaflet
```

### Issue: "npm: command not found"

**Solution:** Install Node.js from [nodejs.org](https://nodejs.org/) (version 18+ recommended)

### Issue: Map Not Showing

**Solution:** This is normal if `LOCAL_SATELLITE_MODE=false`. The map will show OpenStreetMap tiles instead of satellite imagery. This is expected behavior.

---

## 📋 What Works Without Backend

✅ **All UI features** - Everything looks and works the same
✅ **Mock data** - Realistic computed NDVI data
✅ **Charts and visualizations** - All charts work
✅ **Compliance scoring** - Score calculation works
✅ **Anomaly detection** - Statistical methods work
✅ **Map visualization** - Shows OpenStreetMap (not satellite tiles)

❌ **Real satellite tiles** - Requires Python GEE backend
❌ **Real Sentinel-2 NDVI** - Requires Python GEE backend

---

## 🎯 Next Steps (Optional - For Real Satellite Data)

If you want real satellite data later, you'll need:

1. **Python GEE Backend** (optional):
   ```bash
   cd gee-python-backend
   pip install -r requirements.txt
   python server.py
   ```

2. **Node.js Backend** (optional):
   ```bash
   cd render-backend
   npm install
   npm run dev
   ```

3. **Update .env.local**:
   ```bash
   VITE_LOCAL_SATELLITE_MODE=true
   VITE_BACKEND_URL=http://localhost:3000
   ```

But for now, **you don't need any of this** - just run `npm run dev` and it works!

---

## 💡 Still Having Issues?

1. **Check Node.js version:**
   ```bash
   node --version
   ```
   Should be 18+ (recommended: 20+)

2. **Check npm version:**
   ```bash
   npm --version
   ```
   Should be 9+

3. **Check browser console** (F12) for any errors

4. **Check terminal output** for specific error messages

Share the specific error message if you're still stuck!
