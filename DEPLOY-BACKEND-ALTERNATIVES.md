# Backend Deployment - Free Alternatives

Railway ke alawa ye free platforms use kar sakte hain:

## Option 1: Render (Recommended - Bahut Easy) ⭐

### Steps:

1. **Sign Up:**
   - https://render.com par jao
   - "Get Started for Free" click karo
   - GitHub se sign up karo

2. **New Web Service:**
   - Dashboard me "New +" button click karo
   - "Web Service" select karo
   - GitHub repo connect karo
   - Apna repository select karo

3. **Configure:**
   - **Name:** Apna service name (e.g., `project-management-backend`)
   - **Region:** Closest region select karo
   - **Branch:** `main` ya `master`
   - **Root Directory:** `backend` (important!)
   - **Runtime:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`

4. **Add PostgreSQL Database (Free):**
   - Dashboard me "New +" → "PostgreSQL"
   - Free tier select karo
   - Database create ho jayega

5. **Environment Variables:**
   - Service ke "Environment" tab me jao
   - Add karo:
     ```
     PORT=5000
     NODE_ENV=production
     JWT_SECRET=your-random-secret-key
     FRONTEND_URL=https://your-app.vercel.app
     ```
   - PostgreSQL ke liye:
     - Service ke "Info" tab me database URL milega
     - Usse parse karke add karo:
     ```
     DB_HOST=<from database URL>
     DB_USER=<from database URL>
     DB_PASSWORD=<from database URL>
     DB_NAME=<from database URL>
     DB_PORT=5432
     ```

6. **Deploy:**
   - "Create Web Service" click karo
   - 5-10 minutes me deploy ho jayega
   - URL milega: `https://your-service.onrender.com`

**Note:** Free tier me service sleep ho sakti hai agar 15 minutes se use na ho. Pehli request slow ho sakti hai.

---

## Option 2: Fly.io (Fast, No Sleep) ⚡

### Steps:

1. **Install Fly CLI:**
   ```powershell
   # Windows PowerShell me
   powershell -Command "iwr https://fly.io/install.ps1 -useb | iex"
   ```

2. **Sign Up:**
   - https://fly.io par jao
   - Sign up karo
   - Email verify karo

3. **Login:**
   ```powershell
   fly auth login
   ```

4. **Create App:**
   ```powershell
   cd backend
   fly launch
   ```
   - App name enter karo
   - Region select karo
   - PostgreSQL add karo (yes)

5. **Configure:**
   - `fly.toml` file automatically create hogi
   - Edit karo if needed

6. **Set Secrets (Environment Variables):**
   ```powershell
   fly secrets set JWT_SECRET=your-secret-key
   fly secrets set FRONTEND_URL=https://your-app.vercel.app
   fly secrets set DB_HOST=<from fly postgres>
   fly secrets set DB_USER=<from fly postgres>
   fly secrets set DB_PASSWORD=<from fly postgres>
   fly secrets set DB_NAME=<from fly postgres>
   fly secrets set DB_PORT=5432
   ```

7. **Deploy:**
   ```powershell
   fly deploy
   ```

**Note:** Free tier me 3 VMs, 160GB outbound data per month.

---

## Option 3: Cyclic.sh (Simple, No Config) 🚀

### Steps:

1. **Sign Up:**
   - https://cyclic.sh par jao
   - GitHub se sign up karo

2. **Deploy:**
   - "Deploy Now" click karo
   - GitHub repo select karo
   - Cyclic automatically detect karega

3. **Configure:**
   - Root Directory: `backend`
   - Build Command: `npm install`
   - Start Command: `npm start`

4. **Environment Variables:**
   - Dashboard me "Env Vars" tab
   - Add karo:
     ```
     PORT=5000
     JWT_SECRET=your-secret
     FRONTEND_URL=https://your-app.vercel.app
     ```

5. **Database:**
   - Cyclic me built-in database nahi hai
   - External database use karo (MongoDB Atlas free, ya Railway MySQL)

**Note:** Free tier unlimited, no sleep!

---

## Option 4: Koyeb (European, Fast) 🌍

### Steps:

1. **Sign Up:**
   - https://www.koyeb.com par jao
   - GitHub se sign up karo

2. **Create App:**
   - "Create App" click karo
   - GitHub repo select karo

3. **Configure:**
   - **Type:** Web Service
   - **Root Directory:** `backend`
   - **Build Command:** `npm install`
   - **Run Command:** `npm start`

4. **Environment Variables:**
   - "Environment Variables" section me add karo
   - Same variables as above

5. **Deploy:**
   - "Deploy" click karo

**Note:** Free tier me 2 services, 512MB RAM each.

---

## Option 5: Heroku (Classic, But Limited Free Tier) 💜

### Steps:

1. **Sign Up:**
   - https://www.heroku.com par jao
   - Free account banaye (limited now)

2. **Install Heroku CLI:**
   ```powershell
   # Download from: https://devcenter.heroku.com/articles/heroku-cli
   ```

3. **Login:**
   ```powershell
   heroku login
   ```

4. **Create App:**
   ```powershell
   cd backend
   heroku create your-app-name
   ```

5. **Add PostgreSQL:**
   ```powershell
   heroku addons:create heroku-postgresql:mini
   ```

6. **Set Config Vars:**
   ```powershell
   heroku config:set JWT_SECRET=your-secret
   heroku config:set FRONTEND_URL=https://your-app.vercel.app
   ```

7. **Deploy:**
   ```powershell
   git push heroku main
   ```

**Note:** Heroku ne free tier band kar diya hai, but paid plans available hain.

---

## Option 6: MongoDB Atlas + MongoDB Realm (For MongoDB) 🍃

Agar aap MongoDB use karna chahte hain:

1. **MongoDB Atlas:**
   - https://www.mongodb.com/cloud/atlas
   - Free cluster banaye
   - Connection string le

2. **MongoDB Realm:**
   - Atlas dashboard me "Realm" tab
   - New app create karo
   - Functions/API endpoints define karo

---

## Comparison Table

| Platform | Free Tier | Sleep? | Database | Ease of Use | Best For |
|----------|-----------|--------|----------|-------------|----------|
| **Render** | ✅ Good | ⚠️ Yes (15min) | ✅ PostgreSQL | ⭐⭐⭐⭐⭐ | Beginners |
| **Fly.io** | ✅ Good | ❌ No | ✅ PostgreSQL | ⭐⭐⭐⭐ | Production |
| **Cyclic** | ✅ Unlimited | ❌ No | ❌ External | ⭐⭐⭐⭐⭐ | Simple apps |
| **Koyeb** | ✅ Limited | ❌ No | ❌ External | ⭐⭐⭐⭐ | European users |
| **Heroku** | ❌ Paid now | ❌ No | ✅ PostgreSQL | ⭐⭐⭐ | Legacy apps |

---

## Recommendation: Render ⭐

**Kyun?**
- ✅ Bahut easy setup
- ✅ Free PostgreSQL included
- ✅ Auto-deploy from GitHub
- ✅ Good documentation
- ⚠️ Free tier me sleep (but acceptable)

---

## Quick Start: Render (Step by Step)

### 1. Sign Up
- https://render.com
- GitHub se connect karo

### 2. New Web Service
- Dashboard → "New +" → "Web Service"
- GitHub repo connect karo

### 3. Settings
```
Name: project-backend
Region: Singapore (ya closest)
Branch: main
Root Directory: backend
Runtime: Node
Build Command: npm install
Start Command: npm start
```

### 4. Add PostgreSQL
- "New +" → "PostgreSQL"
- Free tier select karo
- Database URL copy karo

### 5. Environment Variables
Service ke "Environment" tab me:
```
PORT=5000
NODE_ENV=production
JWT_SECRET=your-secret-key-here
FRONTEND_URL=https://your-app.vercel.app
DB_HOST=<from PostgreSQL URL>
DB_USER=<from PostgreSQL URL>
DB_PASSWORD=<from PostgreSQL URL>
DB_NAME=<from PostgreSQL URL>
DB_PORT=5432
```

**Note:** MySQL ki jagah PostgreSQL use hoga. Agar MySQL chahiye, to Railway better hai.

### 6. Deploy
- "Create Web Service" click karo
- 5-10 minutes wait karo
- URL milega: `https://your-service.onrender.com`

### 7. Update Vercel
- Vercel me `VITE_API_URL` update karo:
```
VITE_API_URL=https://your-service.onrender.com/api
```

---

## MySQL vs PostgreSQL

Agar aap MySQL use kar rahe ho, to:
- **Railway** - MySQL free tier available
- **Render** - PostgreSQL (MySQL nahi hai free me)
- **Fly.io** - PostgreSQL

Agar PostgreSQL use karna hai, to code me kuch changes chahiye:
- `mysql2` ki jagah `pg` package
- Connection syntax thoda different

---

## Need Help?

Kisi bhi platform par issue aaye to:
1. Platform ke logs check karo
2. Environment variables verify karo
3. Database connection test karo
4. Documentation dekh lo

**Best Choice:** **Render** - Sabse easy aur reliable! 🚀

