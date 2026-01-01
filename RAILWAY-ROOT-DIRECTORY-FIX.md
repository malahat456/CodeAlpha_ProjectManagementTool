# Railway Root Directory Fix - Step by Step

## ⚠️ Problem
Railway root directory ko analyze kar raha hai, `backend` folder ko nahi. Isliye `package.json` nahi mil raha.

## ✅ Solution: Railway Dashboard Me Root Directory Set Karo

### Method 1: Settings Me (Recommended)

1. **Railway Dashboard Kholo:**
   - https://dashboard.railway.app
   - Apne project par click karo

2. **Service Select Karo:**
   - Jo service fail ho rahi hai, us par click karo
   - (Usually first service jo create hui thi)

3. **Settings Tab:**
   - Top me **"Settings"** tab par click karo
   - (Not "Variables", "Settings" tab)

4. **Root Directory Find Karo:**
   - Settings page me scroll down karo
   - **"Root Directory"** section dhundho
   - Currently empty ya `/` hoga

5. **Change Karo:**
   - **"Change"** button click karo (Root Directory ke saath)
   - Text box me type karo: `backend`
   - **"Save"** click karo

6. **Wait for Redeploy:**
   - Railway automatically redeploy karega
   - Ab `backend` folder me `package.json` dhundhega
   - Build successfully ho jayega!

---

### Method 2: Service Settings (Alternative)

Agar Settings tab me Root Directory nahi dikh raha:

1. Service par click karo
2. **"Settings"** → **"General"** section
3. Ya **"Deploy"** section me dhundho
4. Root Directory option milega

---

### Method 3: New Service Create Karo (If Nothing Works)

1. **Delete Current Service:**
   - Service → Settings → Delete Service

2. **New Service Create Karo:**
   - Project me "+ New" → "GitHub Repo"
   - Same repo select karo

3. **Immediately Root Directory Set Karo:**
   - Service create hote hi
   - Settings → Root Directory → `backend`
   - Save karo

4. **Deploy:**
   - Ab automatically deploy hoga

---

## 🔍 Verification

Root Directory set hone ke baad:

1. **Logs Check Karo:**
   - Service → "Deployments" → Latest deployment → "View Logs"
   - Ab yeh dikhega:
     ```
     Found package.json in backend/
     Installing dependencies...
     npm install
     Starting application...
     Backend running on port 5000
     ```

2. **Service Status:**
   - Service successfully running dikhega
   - URL accessible hoga

---

## 📝 Files I Created

1. **`backend/nixpacks.toml`** - Build configuration (helps Railway detect Node.js)
2. **`backend/railway.json`** - Railway specific config
3. **`RAILWAY-FIX.md`** - Quick fix guide

---

## ⚡ Quick Steps (Copy-Paste)

```
1. Railway Dashboard → Your Project
2. Click on failing service
3. Settings Tab (top menu)
4. Scroll to "Root Directory"
5. Click "Change"
6. Type: backend
7. Click "Save"
8. Wait for redeploy
9. Done! ✅
```

---

## 🆘 Still Not Working?

### Check These:

1. **Root Directory Correct Hai?**
   - Exactly `backend` (no spaces, no `/`, no `./backend`)
   - Just: `backend`

2. **Service Redeploy Hoa?**
   - Settings change ke baad automatically redeploy hota hai
   - Ya manually "Redeploy" button click karo

3. **package.json Backend Me Hai?**
   - Verify: `backend/package.json` exists
   - Content sahi hai?

4. **GitHub Repo Updated?**
   - Changes commit aur push kiye?
   - Railway latest code pull kar raha hai?

### Alternative: Manual Build Command

Agar phir bhi nahi ho raha:

1. Settings → **"Build Command"**
2. Set karo: `cd backend && npm install`
3. Settings → **"Start Command"**
4. Set karo: `cd backend && npm start`

---

## ✅ Success Indicators

Jab sab theek ho jaye:
- ✅ Build logs me "Installing dependencies" dikhega
- ✅ "Backend running on port 5000" dikhega
- ✅ Service status "Active" hoga
- ✅ Service URL accessible hoga

---

**Most Important:** Railway Dashboard me jao aur Root Directory set karo! 🚀

