# Quick Deployment Guide - Railway + Vercel

## 🚀 5-Minute Deployment

### Backend → Railway

1. **Sign up:** https://railway.app (use GitHub)

2. **New Project → Deploy from GitHub**
   - Select your repo
   - Railway auto-detects Node.js

3. **Configure:**
   - Settings → Root Directory: `backend`
   - Variables → Add:
     ```
     PORT=5000
     JWT_SECRET=your-random-secret-key-here
     FRONTEND_URL=https://your-app.vercel.app
     ```

4. **Add MySQL:**
   - Click "+ New" → "Database" → "Add MySQL"
   - Copy database credentials
   - Add to Variables:
     ```
     DB_HOST=your-mysql-host
     DB_USER=root
     DB_PASSWORD=your-password
     DB_NAME=railway
     DB_PORT=3306
     ```

5. **Get Backend URL:**
   - Settings → Networking → Generate Domain
   - Copy URL (e.g., `https://your-backend.up.railway.app`)

---

### Frontend → Vercel

1. **Sign up:** https://vercel.com (use GitHub)

2. **Add New → Project**
   - Import your GitHub repo

3. **Configure:**
   - Framework: Vite
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`

4. **Environment Variables:**
   - Add: `VITE_API_URL=https://your-backend.up.railway.app/api`
   - (Use your Railway backend URL)

5. **Deploy!**
   - Click "Deploy"
   - Get your URL (e.g., `https://your-app.vercel.app`)

6. **Update Backend CORS:**
   - Go back to Railway
   - Update `FRONTEND_URL` with your Vercel URL
   - Backend will auto-redeploy

---

## ✅ Checklist

- [ ] Backend deployed on Railway
- [ ] Frontend deployed on Vercel
- [ ] Database created and schema run
- [ ] Environment variables set
- [ ] CORS updated
- [ ] Test login/signup
- [ ] Test API endpoints

---

## 🔧 Important Notes

### File Uploads
Railway's file system is temporary. For production, consider:
- Cloudinary (free tier)
- AWS S3
- Railway Volumes

### Database
- Run your SQL schema in Railway MySQL
- Use Railway's SQL editor or connect via MySQL client

### Environment Variables
Make sure all variables are set in both platforms!

---

## 🆘 Troubleshooting

**Backend not working?**
- Check Railway logs
- Verify environment variables
- Test database connection

**Frontend can't connect?**
- Check `VITE_API_URL` in Vercel
- Verify backend URL is correct
- Check CORS settings

**Database errors?**
- Make sure MySQL is running
- Verify credentials
- Run your schema

---

## 📚 Full Guide

See `DEPLOY-RAILWAY-VERCEL.md` for detailed instructions.

