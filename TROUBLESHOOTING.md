# Troubleshooting: Running Locally

## Quick Fix Steps

### 1. Install Dependencies
```bash
cd H2skill
npm install
```

### 2. Check Node.js Version
```bash
node --version
```
Should be Node.js 18+ (recommended: 20+)

### 3. Run Development Server
```bash
npm run dev
```

## Common Issues

### Issue: "Cannot find module" or Import Errors

**Solution:**
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

On Windows PowerShell:
```powershell
Remove-Item -Recurse -Force node_modules, package-lock.json
npm install
```

### Issue: Port 3000 Already in Use

**Solution:** Change port in `vite.config.ts`:
```typescript
server: {
  port: 3001,  // Change to 3001 or any available port
  host: '0.0.0.0',
}
```

Or run with different port:
```bash
npm run dev -- --port 3001
```

### Issue: TypeScript Errors

**Solution:**
```bash
# Check for TypeScript errors
npx tsc --noEmit

# If errors, try reinstalling types
npm install --save-dev @types/node @types/leaflet
```

### Issue: "import.meta.env is undefined"

**Solution:** This is normal - Vite handles `import.meta.env` automatically. Make sure:
1. You're using `VITE_` prefix for environment variables
2. Variables are in `.env.local` file (not `.env`)
3. Restart dev server after changing `.env.local`

### Issue: Leaflet Map Not Rendering

**Solution:** 
1. Check browser console for errors
2. Ensure `leaflet` and `react-leaflet` are installed:
```bash
npm install leaflet react-leaflet @types/leaflet
```

### Issue: Firebase Errors

**Solution:** If you see Firebase errors but want to run locally:
1. Create `.env.local` file
2. Add (optional - app will work without these):
```bash
VITE_LOCAL_SATELLITE_MODE=false
```

The app will gracefully fall back when these are not set.

## Step-by-Step Setup

1. **Navigate to project directory:**
   ```bash
   cd H2skill
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create `.env.local` file** (optional):
   ```bash
   # Create file: H2skill/.env.local
   VITE_LOCAL_SATELLITE_MODE=false
   ```

4. **Start dev server:**
   ```bash
   npm run dev
   ```

5. **Open browser:**
   - Should see: `http://localhost:3000`
   - If port is different, check terminal output

## Still Having Issues?

### Check Browser Console
1. Open browser DevTools (F12)
2. Check Console tab for errors
3. Check Network tab for failed requests

### Check Terminal Output
Look for:
- TypeScript compilation errors
- Module resolution errors
- Port conflicts
- Missing dependencies

### Verify File Structure
Make sure these files exist:
- `H2skill/package.json`
- `H2skill/vite.config.ts`
- `H2skill/index.html`
- `H2skill/index.tsx`
- `H2skill/App.tsx`

### Clean Install
```bash
# Remove all dependencies
rm -rf node_modules package-lock.json

# Clear npm cache
npm cache clean --force

# Reinstall
npm install

# Try again
npm run dev
```

## Getting Help

If you're still stuck, check:
1. **Browser console** for specific error messages
2. **Terminal output** for build/compilation errors
3. **Node.js version** (should be 18+)
4. **npm version** (should be 9+)

Share the specific error message for more targeted help!
