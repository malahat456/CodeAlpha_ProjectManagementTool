# Troubleshooting Login Error on Vercel

If you're getting "Login failed" error, follow these steps:

## 🔍 Step 1: Check Environment Variables in Vercel

1. Go to your Vercel project dashboard
2. Click **Settings** → **Environment Variables**
3. Make sure you have:
   ```
   VITE_API_URL=https://your-backend.up.railway.app/api
   ```
   **Important:** 
   - Must start with `https://`
   - Must end with `/api`
   - Must be your actual Railway backend URL

4. **Redeploy** after adding/changing environment variables:
   - Go to **Deployments** tab
   - Click the 3 dots on latest deployment
   - Click **Redeploy**

## 🔍 Step 2: Check Backend is Running

1. Open your Railway backend URL in browser:
   ```
   https://your-backend.up.railway.app
   ```
   
2. You should see JSON response with API info
3. If you see error, backend is not running properly

## 🔍 Step 3: Check Backend Logs

1. Go to Railway dashboard
2. Click on your backend service
3. Click **View Logs**
4. Look for errors:
   - Database connection errors
   - Missing environment variables
   - Port binding errors

## 🔍 Step 4: Check Database Connection

1. In Railway, verify MySQL database is running
2. Check environment variables in Railway:
   ```
   DB_HOST=your-mysql-host
   DB_USER=root
   DB_PASSWORD=your-password
   DB_NAME=railway
   DB_PORT=3306
   ```
3. Make sure database tables exist (users table)

## 🔍 Step 5: Check CORS Settings

1. In Railway, check `FRONTEND_URL` environment variable:
   ```
   FRONTEND_URL=https://your-app.vercel.app
   ```
2. Must match your exact Vercel URL (with https://)
3. Redeploy backend after changing

## 🔍 Step 6: Test API Directly

Open browser console (F12) and test:

```javascript
fetch('https://your-backend.up.railway.app/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'test@example.com',
    password: 'test123'
  })
})
.then(res => res.json())
.then(data => console.log('Response:', data))
.catch(err => console.error('Error:', err));
```

This will show you the exact error.

## 🔍 Step 7: Check Browser Console

1. Open your Vercel app
2. Press F12 to open Developer Tools
3. Go to **Console** tab
4. Try to login
5. Look for errors:
   - Network errors (CORS, 404, 500)
   - API URL errors
   - Connection refused

## 🔍 Step 8: Common Issues

### Issue: "Network Error" or "Failed to fetch"
**Solution:** 
- Backend URL is wrong
- Backend is not running
- CORS is blocking the request

### Issue: "404 Not Found"
**Solution:**
- API URL is wrong (should end with `/api`)
- Route doesn't exist

### Issue: "500 Internal Server Error"
**Solution:**
- Database connection issue
- Missing environment variables
- Check Railway logs

### Issue: "401 Unauthorized" or "Invalid credentials"
**Solution:**
- User doesn't exist in database
- Wrong password
- Database not initialized

## 🔧 Quick Fixes

### Fix 1: Update VITE_API_URL
1. Vercel → Settings → Environment Variables
2. Update `VITE_API_URL` with correct backend URL
3. Redeploy

### Fix 2: Update CORS
1. Railway → Variables
2. Update `FRONTEND_URL` with your Vercel URL
3. Backend will auto-redeploy

### Fix 3: Initialize Database
1. Connect to Railway MySQL
2. Run your SQL schema
3. Create a test user:
   ```sql
   INSERT INTO users (name, email, password, role) 
   VALUES ('Test User', 'test@example.com', '$2a$10$hashedpassword', 'member');
   ```

### Fix 4: Check JWT_SECRET
1. Railway → Variables
2. Make sure `JWT_SECRET` is set
3. Should be a long random string

## 🧪 Test Checklist

- [ ] Backend URL accessible in browser
- [ ] VITE_API_URL set correctly in Vercel
- [ ] FRONTEND_URL set correctly in Railway
- [ ] Database is running and connected
- [ ] Database tables exist (especially `users` table)
- [ ] JWT_SECRET is set in Railway
- [ ] Both services redeployed after env changes
- [ ] Browser console shows no CORS errors
- [ ] Test user exists in database

## 🆘 Still Not Working?

1. Check Railway logs for backend errors
2. Check browser console for frontend errors
3. Test API endpoint directly with Postman or curl
4. Verify all environment variables are set
5. Make sure you're using HTTPS URLs (not HTTP)

