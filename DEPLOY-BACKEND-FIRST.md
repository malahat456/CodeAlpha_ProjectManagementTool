# Deploy Backend to Railway - Step by Step

Since your frontend is already on Vercel, let's deploy the backend to Railway now.

## 🚀 Step-by-Step: Deploy Backend to Railway

### Step 1: Create Railway Account

1. Go to **https://railway.app**
2. Click **"Start a New Project"** or **"Login"**
3. Sign up with **GitHub** (recommended) or email
4. You'll get $5 free credit per month

### Step 2: Create New Project

1. Click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Authorize Railway to access your GitHub (if first time)
4. Select your repository: `project-management-system`
5. Click **"Deploy Now"**

### Step 3: Configure Backend Service

Railway will auto-detect your project. Now configure it:

1. **Set Root Directory:**
   - Click on the service that was created
   - Go to **Settings** tab
   - Scroll to **"Root Directory"**
   - Click **"Change"**
   - Enter: `backend`
   - Click **"Save"**

2. **Railway will automatically:**
   - Detect `package.json` in backend folder
   - Install dependencies
   - Run `npm start`

### Step 4: Add MySQL Database

1. In your Railway project, click **"+ New"** button
2. Select **"Database"**
3. Choose **"Add MySQL"**
4. Railway will create a MySQL database
5. **Wait for it to provision** (takes 1-2 minutes)

### Step 5: Get Database Credentials

1. Click on the **MySQL** service
2. Go to **"Variables"** tab
3. You'll see these variables:
   - `MYSQLHOST` (this is your DB_HOST)
   - `MYSQLUSER` (usually `root`)
   - `MYSQLPASSWORD` (your password)
   - `MYSQLPORT` (usually `3306`)
   - `MYSQLDATABASE` (your database name)

**Copy these values!** You'll need them in the next step.

### Step 6: Add Environment Variables to Backend

1. Go back to your **backend service** (not MySQL)
2. Click **"Variables"** tab
3. Click **"+ New Variable"**
4. Add these variables one by one:

   ```
   PORT=5000
   ```

   ```
   DB_HOST=<paste MYSQLHOST value>
   ```

   ```
   DB_USER=<paste MYSQLUSER value>
   ```

   ```
   DB_PASSWORD=<paste MYSQLPASSWORD value>
   ```

   ```
   DB_NAME=<paste MYSQLDATABASE value>
   ```

   ```
   DB_PORT=<paste MYSQLPORT value>
   ```

   ```
   JWT_SECRET=your-very-secure-random-secret-key-here-change-this
   ```
   (Generate a random string, e.g., use: https://randomkeygen.com/)

   ```
   FRONTEND_URL=https://your-app.vercel.app
   ```
   (Your Vercel frontend URL)

5. After adding each variable, Railway will **auto-redeploy** your backend

### Step 7: Get Your Backend URL

1. Click on your **backend service**
2. Go to **Settings** tab
3. Scroll to **"Networking"** section
4. Click **"Generate Domain"** (if not already generated)
5. **Copy the URL** (e.g., `https://your-backend.up.railway.app`)

### Step 8: Initialize Database

You need to create your database tables:

**Option A: Using Railway's MySQL Console**
1. Click on your **MySQL** service
2. Go to **"Data"** tab
3. Click **"Open MySQL Console"** or **"Query"**
4. Run your SQL schema file (the CREATE TABLE statements)

**Option B: Using MySQL Workbench or Command Line**
1. Get connection details from Railway MySQL Variables
2. Connect using:
   - Host: `MYSQLHOST` value
   - Port: `MYSQLPORT` value
   - User: `MYSQLUSER` value
   - Password: `MYSQLPASSWORD` value
   - Database: `MYSQLDATABASE` value
3. Run your SQL schema

### Step 9: Test Backend

1. Open your backend URL in browser:
   ```
   https://your-backend.up.railway.app
   ```
   Should see JSON with API info

2. Test health endpoint:
   ```
   https://your-backend.up.railway.app/health
   ```
   Should see: `{"status":"ok",...}`

### Step 10: Update Frontend on Vercel

Now that backend is deployed, update your frontend:

1. Go to **Vercel** dashboard
2. Click on your project
3. Go to **Settings** → **Environment Variables**
4. Add or update:
   ```
   VITE_API_URL=https://your-backend.up.railway.app/api
   ```
   (Use your actual Railway backend URL)

5. Go to **Deployments** tab
6. Click the **3 dots** on latest deployment
7. Click **"Redeploy"**

### Step 11: Test Login

1. Open your Vercel app
2. Try to login
3. Should work now! 🎉

---

## ✅ Checklist

- [ ] Railway account created
- [ ] Project created from GitHub
- [ ] Root directory set to `backend`
- [ ] MySQL database added
- [ ] Database credentials copied
- [ ] Environment variables added to backend
- [ ] Backend URL generated
- [ ] Database schema run (tables created)
- [ ] Backend accessible (test in browser)
- [ ] VITE_API_URL updated in Vercel
- [ ] Frontend redeployed
- [ ] Login tested and working

---

## 🔧 Troubleshooting

### Backend Not Starting
- Check Railway logs: Click service → "View Logs"
- Verify all environment variables are set
- Check if `package.json` has correct start script

### Database Connection Error
- Verify all DB_* variables are correct
- Check MySQL service is running
- Make sure database exists

### CORS Errors
- Verify `FRONTEND_URL` is set correctly
- Must match your exact Vercel URL
- Backend should auto-redeploy after changing

### Frontend Still Can't Connect
- Verify `VITE_API_URL` in Vercel
- Must end with `/api`
- Redeploy frontend after changing

---

## 📝 Quick Reference

**Railway Backend URL Format:**
```
https://your-service-name.up.railway.app
```

**Vercel Environment Variable:**
```
VITE_API_URL=https://your-backend.up.railway.app/api
```

**Railway Environment Variables Needed:**
- `PORT=5000`
- `DB_HOST=...` (from MySQL service)
- `DB_USER=...` (from MySQL service)
- `DB_PASSWORD=...` (from MySQL service)
- `DB_NAME=...` (from MySQL service)
- `DB_PORT=...` (from MySQL service)
- `JWT_SECRET=...` (generate random string)
- `FRONTEND_URL=...` (your Vercel URL)

---

## 🎯 Next Steps After Deployment

1. Test all API endpoints
2. Create a test user in database
3. Test login/signup
4. Monitor Railway logs for errors
5. Set up custom domain (optional)

---

**Ready?** Start with Step 1 and work through each step! 🚀

