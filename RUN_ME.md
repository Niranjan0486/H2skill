# 🚀 How to Run the App - Step by Step

## ✅ Your Setup is Ready!

I've checked your system:
- ✅ Node.js v20.19.6 installed
- ✅ Dependencies installed
- ✅ Configuration files ready

## 📝 Step-by-Step Instructions

### Option 1: Use PowerShell (Recommended)

1. **Open PowerShell**
   - Press `Win + X`
   - Select "Windows PowerShell" or "Terminal"

2. **Copy and paste this command:**
   ```powershell
   cd "C:\Users\niran\OneDrive\Documents\Desktop\H2skill\H2skill"; npm run dev
   ```

3. **Wait for the message:**
   ```
   VITE v6.x.x  ready in xxx ms
   
   ➜  Local:   http://localhost:3000/
   ```

4. **Open your browser** and go to the URL shown (usually `http://localhost:3000`)

### Option 2: Use the Startup Script (Easiest)

1. **Navigate to the folder** in File Explorer:
   ```
   C:\Users\niran\OneDrive\Documents\Desktop\H2skill\H2skill
   ```

2. **Right-click** on `start.ps1`
   
3. **Select** "Run with PowerShell"

4. **Wait for it to start** and open the URL shown

### Option 3: Manual Steps

1. **Open PowerShell**

2. **Navigate:**
   ```powershell
   cd "C:\Users\niran\OneDrive\Documents\Desktop\H2skill\H2skill"
   ```

3. **Start the app:**
   ```powershell
   npm run dev
   ```

4. **Open browser** to the URL shown in terminal

---

## 🔍 What Should Happen?

When you run `npm run dev`, you should see:

```
  VITE v6.x.x  ready in xxx ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose

  ready in xxx ms.
```

Then:
1. **Open** `http://localhost:3000` in your browser
2. You should see the **EcoVerify AI** landing page
3. The app is now running! 🎉

---

## ⚠️ Common Issues

### "Port 3000 already in use"

**Don't worry!** The app will automatically use another port. Look for:
```
➜  Local:   http://localhost:5173/
```
Just use that URL instead!

### "npm: command not found"

**Solution:** Node.js might not be in PATH. Try:
```powershell
# Check if npm works
npm --version

# If it doesn't work, restart PowerShell or reinstall Node.js
```

### Blank Page in Browser

**Solution:**
1. Press `F12` to open DevTools
2. Check the **Console** tab for errors
3. Check the **Network** tab for failed requests
4. Try **hard refresh**: `Ctrl + Shift + R`

### "Cannot find module" Error

**Solution:**
```powershell
cd "C:\Users\niran\OneDrive\Documents\Desktop\H2skill\H2skill"
Remove-Item -Recurse -Force node_modules, package-lock.json
npm install
npm run dev
```

---

## 🎯 Quick Test

To verify everything works, run this in PowerShell:

```powershell
cd "C:\Users\niran\OneDrive\Documents\Desktop\H2skill\H2skill"
node --version
npm --version
npm run dev
```

If all three commands work, the app should start!

---

## 📞 Still Having Issues?

**Please share:**
1. **The exact command** you're running
2. **The exact error message** (copy/paste from PowerShell)
3. **What happens** when you run `npm run dev`:
   - Does it start?
   - What URL does it show?
   - Any error messages?

---

## 💡 Pro Tips

- **Keep PowerShell open** - Don't close it while the app is running
- **Use Ctrl+C** to stop the server when done
- **Check the terminal** - The URL might be different (5173 instead of 3000)
- **No backend needed** - The app works fine without Python/Node.js backends

---

## ✅ Success Checklist

When it's working, you should see:
- ✅ Terminal shows "VITE ready"
- ✅ Browser shows EcoVerify AI landing page
- ✅ No error messages in terminal
- ✅ No error messages in browser console (F12)

**You're all set!** 🎉
