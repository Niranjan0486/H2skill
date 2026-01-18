# Windows PowerShell - Quick Start Guide

## 🚀 Run the App (Windows PowerShell)

### Step 1: Open PowerShell
Press `Win + X` and select "Windows PowerShell" or "Terminal"

### Step 2: Navigate to Project
```powershell
cd "C:\Users\niran\OneDrive\Documents\Desktop\H2skill\H2skill"
```

### Step 3: Install Dependencies (First Time Only)
```powershell
npm install
```

**Wait for this to complete** - it may take 2-3 minutes.

### Step 4: Create .env.local File (Optional)
Create a file named `.env.local` in the `H2skill` folder with this content:

```bash
VITE_LOCAL_SATELLITE_MODE=false
```

**How to create:**
```powershell
# In PowerShell, run:
Set-Content -Path ".env.local" -Value "VITE_LOCAL_SATELLITE_MODE=false"
```

### Step 5: Start the App
```powershell
npm run dev
```

### Step 6: Open Browser
Look for a message like:
```
  VITE v6.x.x  ready in xxx ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
```

Open that URL in your browser (usually `http://localhost:3000` or `http://localhost:5173`)

---

## 🔧 Common Issues & Fixes

### Issue 1: "npm: command not found"

**Solution:** Install Node.js
1. Go to https://nodejs.org/
2. Download and install the LTS version
3. Restart PowerShell
4. Try again

### Issue 2: "Cannot find module" or Import Errors

**Solution:**
```powershell
cd "C:\Users\niran\OneDrive\Documents\Desktop\H2skill\H2skill"
Remove-Item -Recurse -Force node_modules, package-lock.json -ErrorAction SilentlyContinue
npm install
npm run dev
```

### Issue 3: Port Already in Use

**Solution:** The app will automatically try another port. Check the terminal for the actual URL.

Or change port manually:
1. Open `vite.config.ts`
2. Change `port: 3000` to `port: 3001` (or any available port)
3. Save and restart

### Issue 4: TypeScript Errors

**Solution:**
```powershell
npm install --save-dev @types/node @types/leaflet
npm run dev
```

### Issue 5: "Error: spawn EACCES" or Permission Errors

**Solution:** Run PowerShell as Administrator
1. Right-click PowerShell
2. Select "Run as Administrator"
3. Try again

### Issue 6: App Starts But Shows Blank Page

**Solution:**
1. Open browser DevTools (Press F12)
2. Check Console tab for errors
3. Check Network tab for failed requests
4. Share the error message for help

---

## ✅ Quick Checklist

Before running, make sure:

- [ ] Node.js is installed (`node --version` should show v18+)
- [ ] npm is installed (`npm --version` should show v9+)
- [ ] You're in the correct folder (`H2skill` folder)
- [ ] Dependencies are installed (`node_modules` folder exists)
- [ ] `.env.local` file exists (optional but recommended)

---

## 🎯 What to Expect

When you run `npm run dev`, you should see:

```
  VITE v6.x.x  ready in xxx ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose

  ready in xxx ms.
```

Then open `http://localhost:3000` in your browser.

---

## 📝 Still Not Working?

### Get More Information

1. **Check Node.js version:**
   ```powershell
   node --version
   ```
   Should be v18.0.0 or higher

2. **Check npm version:**
   ```powershell
   npm --version
   ```
   Should be v9.0.0 or higher

3. **Check if dependencies are installed:**
   ```powershell
   Test-Path node_modules
   ```
   Should return `True`

4. **Try clean install:**
   ```powershell
   Remove-Item -Recurse -Force node_modules, package-lock.json -ErrorAction SilentlyContinue
   npm cache clean --force
   npm install
   npm run dev
   ```

### Share Error Details

If you're still stuck, share:
1. The exact error message from PowerShell
2. Any errors from browser console (F12 → Console tab)
3. Your Node.js version (`node --version`)

---

## 💡 Pro Tips

- **Keep PowerShell open** - Don't close the terminal while the app is running
- **Check the URL** - The port might be different (5173 instead of 3000)
- **Use Ctrl+C** to stop the server when done
- **No backend needed** - The app works fine without Python/Node.js backends

---

## 🎉 Success!

Once it's running, you should see:
- Landing page with "EcoVerify AI" branding
- Login/Authentication options
- Dashboard with analysis features

All features work with mock/computed data - no backend required!
