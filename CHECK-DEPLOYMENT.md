# Quick Deployment Check

Run through this checklist to verify your deployment:

## ✅ Backend (Railway) Checklist

1. **Backend is accessible:**
   - Open: `https://your-backend.up.railway.app`
   - Should see JSON with API info
   - If error → Backend not running

2. **Health check:**
   - Open: `https://your-backend.up.railway.app/health`
   - Should see: `{"status":"ok",...}`

3. **Environment variables set in Railway:**
   ```
   PORT=5000
   DB_HOST=your-mysql-host
   DB_USER=root
   DB_PASSWORD=your-password
   DB_NAME=railway
   DB_PORT=3306
   JWT_SECRET=your-secret-key
   FRONTEND_URL=https://your-app.vercel.app
   ```

4. **Database is running:**
   - Check Railway → MySQL service is running
   - Tables exist (especially `users` table)

5. **Test login endpoint:**
   ```bash
   curl -X POST https://your-backend.up.railway.app/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"test123"}'
   ```

## ✅ Frontend (Vercel) Checklist

1. **Frontend is accessible:**
   - Open: `https://your-app.vercel.app`
   - Should see login page

2. **Environment variable set in Vercel:**
   ```
   VITE_API_URL=https://your-backend.up.railway.app/api
   ```
   **Important:** Must end with `/api`

3. **Redeployed after adding env var:**
   - Vercel → Deployments → Redeploy

4. **Check browser console:**
   - F12 → Console tab
   - Try to login
   - Look for errors

## 🔧 Common Fixes

### Fix 1: VITE_API_URL Not Set
1. Vercel → Settings → Environment Variables
2. Add: `VITE_API_URL=https://your-backend.up.railway.app/api`
3. Redeploy

### Fix 2: CORS Error
1. Railway → Variables
2. Set: `FRONTEND_URL=https://your-app.vercel.app`
3. Backend auto-redeploys

### Fix 3: Database Not Connected
1. Check Railway MySQL is running
2. Verify DB credentials in environment variables
3. Run your SQL schema

### Fix 4: JWT_SECRET Missing
1. Railway → Variables
2. Add: `JWT_SECRET=your-random-secret-key`
3. Backend auto-redeploys

## 🧪 Test Steps

1. **Test backend directly:**
   ```
   https://your-backend.up.railway.app/health
   ```

2. **Test login API:**
   - Use Postman or browser console
   - POST to: `https://your-backend.up.railway.app/api/auth/login`
   - Body: `{"email":"test@example.com","password":"test123"}`

3. **Test from frontend:**
   - Open browser console (F12)
   - Try to login
   - Check Network tab for API calls
   - Look for errors

## 📊 Debug Information

After updating the code, you'll see more detailed errors:
- Network errors will show connection issues
- API errors will show backend problems
- CORS errors will show origin issues

Check browser console for detailed error messages!

