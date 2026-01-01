# Deploy to Railway (Backend) + Vercel (Frontend)

This guide will help you deploy your project to production using Railway for the backend and Vercel for the frontend.

---

## Part 1: Deploy Backend to Railway

### Step 1: Create Railway Account

1. Go to https://railway.app
2. Sign up with GitHub (recommended) or email
3. Click "New Project"

### Step 2: Connect Your Repository

1. Click "Deploy from GitHub repo"
2. Select your repository: `project-management-system`
3. Railway will detect your project

### Step 3: Configure Backend Service

1. **Set Root Directory:**
   - Click on your service
   - Go to Settings → Root Directory
   - Set to: `backend`

2. **Add Environment Variables:**
   - Go to Variables tab
   - Add these variables:

   ```
   PORT=5000
   DB_HOST=your-railway-mysql-host
   DB_USER=root
   DB_PASSWORD=your-railway-mysql-password
   DB_NAME=railway
   DB_PORT=3306
   JWT_SECRET=your-very-secure-random-secret-key-here
   FRONTEND_URL=https://your-frontend-domain.vercel.app
   ```

3. **Add MySQL Database:**
   - Click "+ New" → "Database" → "Add MySQL"
   - Railway will create a MySQL database
   - Copy the connection details
   - Update your environment variables with the database credentials

### Step 4: Deploy

1. Railway will automatically detect `package.json` and deploy
2. Wait for deployment to complete (2-5 minutes)
3. Railway will give you a URL like: `https://your-app.up.railway.app`

### Step 5: Get Your Backend URL

1. Click on your service
2. Go to Settings → Networking
3. Generate a domain (or use the provided one)
4. Copy the URL (e.g., `https://your-backend.up.railway.app`)

---

## Part 2: Deploy Frontend to Vercel

### Step 1: Create Vercel Account

1. Go to https://vercel.com
2. Sign up with GitHub (recommended)

### Step 2: Import Your Project

1. Click "Add New" → "Project"
2. Import your GitHub repository
3. Select the repository: `project-management-system`

### Step 3: Configure Frontend

1. **Framework Preset:** Vite (should auto-detect)

2. **Root Directory:** 
   - Click "Edit" next to Root Directory
   - Set to: `frontend`

3. **Build Command:**
   ```
   npm run build
   ```

4. **Output Directory:**
   ```
   dist
   ```

5. **Environment Variables:**
   - Click "Environment Variables"
   - Add:
   ```
   VITE_API_URL=https://your-backend.up.railway.app/api
   ```
   (Replace with your actual Railway backend URL)

### Step 4: Deploy

1. Click "Deploy"
2. Wait for deployment (1-2 minutes)
3. Vercel will give you a URL like: `https://your-app.vercel.app`

### Step 5: Update Backend CORS

1. Go back to Railway
2. Update the `FRONTEND_URL` environment variable:
   ```
   FRONTEND_URL=https://your-app.vercel.app
   ```
3. Redeploy the backend (Railway will auto-redeploy when you change variables)

---

## Part 3: Database Setup

### Step 1: Connect to Railway MySQL

1. In Railway, click on your MySQL database
2. Go to "Connect" tab
3. Copy the connection string or use the credentials

### Step 2: Run Your Database Schema

**Option A: Using Railway MySQL Console**
1. In Railway, click on MySQL database
2. Go to "Data" tab
3. Use the SQL editor to run your schema

**Option B: Using MySQL Workbench or Command Line**
1. Get connection details from Railway
2. Connect using MySQL client
3. Run your SQL schema file

### Step 3: Verify Database

Make sure your tables are created:
- users
- projects
- tasks
- comments
- etc.

---

## Part 4: File Uploads (Important!)

Railway's file system is ephemeral. For file uploads, you need to use cloud storage:

### Option 1: Use Cloudinary (Recommended)

1. Sign up at https://cloudinary.com (free tier available)
2. Install: `npm install cloudinary multer-storage-cloudinary`
3. Update your file upload controller to use Cloudinary
4. Add Cloudinary credentials to Railway environment variables

### Option 2: Use Railway Volumes

1. In Railway, add a Volume
2. Mount it to `/app/uploads`
3. Files will persist

---

## Quick Checklist

### Backend (Railway)
- [ ] Repository connected
- [ ] Root directory set to `backend`
- [ ] MySQL database added
- [ ] Environment variables set
- [ ] Backend URL copied
- [ ] Database schema run
- [ ] CORS updated with frontend URL

### Frontend (Vercel)
- [ ] Repository connected
- [ ] Root directory set to `frontend`
- [ ] Build settings configured
- [ ] `VITE_API_URL` environment variable set
- [ ] Frontend URL copied

### Both
- [ ] Frontend URL updated in backend CORS
- [ ] Database tables created
- [ ] Test login/signup
- [ ] Test API endpoints

---

## Troubleshooting

### Backend Not Connecting to Database

1. Check environment variables in Railway
2. Verify database credentials
3. Make sure database is running
4. Check Railway logs: `railway logs`

### Frontend Can't Connect to Backend

1. Check `VITE_API_URL` in Vercel
2. Verify backend URL is correct
3. Check CORS settings in backend
4. Make sure `FRONTEND_URL` in Railway matches Vercel URL

### Build Errors

1. Check Vercel build logs
2. Make sure all dependencies are in `package.json`
3. Verify Node.js version compatibility

### Database Connection Errors

1. Check Railway MySQL is running
2. Verify connection credentials
3. Make sure database exists
4. Check network connectivity

---

## Alternative: Deploy Both to Railway

If you prefer to use Railway for both:

1. **Backend:** Follow Part 1 above
2. **Frontend:** 
   - Add another service in Railway
   - Set root directory to `frontend`
   - Use Railway's static site hosting
   - Or use a Node.js service with a simple server

---

## Cost

- **Railway:** Free tier includes $5 credit/month
- **Vercel:** Free tier is generous for personal projects
- **Total:** Free for small projects! 🎉

---

## Next Steps After Deployment

1. Set up custom domains (optional)
2. Enable HTTPS (automatic on both platforms)
3. Set up monitoring
4. Configure backups for database
5. Set up CI/CD for automatic deployments

---

## Need Help?

- Railway Docs: https://docs.railway.app
- Vercel Docs: https://vercel.com/docs
- Check deployment logs in both platforms
- Test API endpoints using Postman or browser

