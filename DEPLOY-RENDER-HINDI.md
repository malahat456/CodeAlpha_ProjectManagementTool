# Render Par Backend Deploy Karne Ka Complete Guide (Hindi/Urdu)

## 🚀 Step-by-Step: Render Par Backend Deploy

### Step 1: Account Banaye

1. Browser me jao: **https://render.com**
2. "Get Started for Free" button click karo
3. "Sign up with GitHub" select karo
4. GitHub account se authorize karo
5. Account ban jayega!

### Step 2: New Web Service Banaye

1. Dashboard me **"New +"** button dikhega (top right)
2. Click karo
3. **"Web Service"** select karo
4. Agar pehli baar ho to GitHub connect karna padega
5. Apna repository select karo: `project-management-system`
6. "Connect" click karo

### Step 3: Service Configure Karo

Ab ye settings fill karo:

**Basic Settings:**
- **Name:** `project-backend` (ya kuch bhi naam)
- **Region:** Apne najdik wala select karo (Singapore, Mumbai, etc.)
- **Branch:** `main` (ya `master` agar wo use kar rahe ho)
- **Root Directory:** `backend` ⚠️ **Yeh bahut important hai!**
- **Runtime:** `Node`
- **Build Command:** `npm install`
- **Start Command:** `npm start`

**Advanced (Optional):**
- Plan: Free select karo
- Auto-Deploy: Yes (GitHub push par auto deploy)

### Step 4: PostgreSQL Database Add Karo

1. Dashboard me wapas jao
2. **"New +"** → **"PostgreSQL"** click karo
3. Settings:
   - **Name:** `project-db` (ya kuch bhi)
   - **Region:** Same region select karo (jahan service hai)
   - **Plan:** Free select karo
   - **Database Name:** `railway` (ya kuch bhi)
4. **"Create Database"** click karo
5. 2-3 minutes wait karo (database create ho raha hai)

### Step 5: Database Credentials Le

1. Database service par click karo
2. **"Info"** tab me jao
3. **"Internal Database URL"** ya **"Connection String"** copy karo

Yeh kuch aisa hoga:
```
postgresql://user:password@host:5432/dbname
```

Isse parse karke ye values le:
- `user` = DB_USER
- `password` = DB_PASSWORD
- `host` = DB_HOST
- `5432` = DB_PORT (usually)
- `dbname` = DB_NAME

### Step 6: Environment Variables Add Karo

1. Apne **backend service** par click karo
2. **"Environment"** tab me jao
3. **"Add Environment Variable"** click karo
4. Ye variables add karo ek ek karke:

```
Key: PORT
Value: 5000
```

```
Key: NODE_ENV
Value: production
```

```
Key: JWT_SECRET
Value: your-very-secure-random-string-here
```
(Iske liye: https://randomkeygen.com/ use karo)

```
Key: FRONTEND_URL
Value: https://your-app.vercel.app
```
(Apna Vercel frontend URL)

```
Key: DB_HOST
Value: <database host from connection string>
```

```
Key: DB_USER
Value: <database user from connection string>
```

```
Key: DB_PASSWORD
Value: <database password from connection string>
```

```
Key: DB_NAME
Value: <database name from connection string>
```

```
Key: DB_PORT
Value: 5432
```

### Step 7: Deploy Karo

1. Sab settings fill karne ke baad
2. Page ke neeche scroll karo
3. **"Create Web Service"** button click karo
4. Ab **5-10 minutes** wait karo
5. Deploy ho raha hai - logs dekh sakte ho

### Step 8: Service URL Le

1. Deploy complete hone ke baad
2. Service ke **"Settings"** tab me jao
3. **"Service Details"** section me
4. **"URL"** dikhega: `https://your-service.onrender.com`
5. **Copy karo ye URL!**

### Step 9: Database Tables Create Karo

1. Database service par click karo
2. **"Connect"** tab me jao
3. **"psql"** command copy karo
4. Ya **"pgAdmin"** use karo
5. Apna SQL schema run karo (CREATE TABLE statements)

**Ya Render ke built-in SQL Editor:**
1. Database service → **"Data"** tab
2. SQL queries run karo

### Step 10: Vercel Update Karo

1. Vercel dashboard me jao
2. Apne project par click karo
3. **Settings** → **Environment Variables**
4. Add/Update karo:
   ```
   VITE_API_URL=https://your-service.onrender.com/api
   ```
5. **Deployments** tab me jao
6. Latest deployment ke 3 dots → **"Redeploy"**

### Step 11: Test Karo

1. Browser me backend URL kholo:
   ```
   https://your-service.onrender.com
   ```
   JSON response aana chahiye

2. Health check:
   ```
   https://your-service.onrender.com/health
   ```
   `{"status":"ok"}` aana chahiye

3. Vercel app me login try karo
4. Kaam karna chahiye! 🎉

---

## ⚠️ Important Notes

### 1. Free Tier Sleep
- Agar 15 minutes se use na ho to service sleep ho jati hai
- Pehli request slow ho sakti hai (wake up time)
- Baad me normal speed

### 2. PostgreSQL vs MySQL
- Render me free PostgreSQL milta hai
- Agar MySQL chahiye to Railway better option
- PostgreSQL use karne ke liye code me changes chahiye:
  - `mysql2` package ki jagah `pg` use karo
  - Connection syntax different hai

### 3. Database Connection
- Internal Database URL use karo (faster)
- External URL bhi use kar sakte ho (but slow)

### 4. Environment Variables
- Har variable add karne ke baad service redeploy hoti hai
- Sab variables ek saath add karo (faster)

---

## 🔧 Troubleshooting

### Service Start Nahi Ho Rahi
- **Logs check karo:** Service → "Logs" tab
- **Build Command verify karo:** `npm install` sahi hai?
- **Start Command verify karo:** `npm start` sahi hai?
- **Root Directory check karo:** `backend` set hai?

### Database Connect Nahi Ho Rahi
- **Credentials verify karo:** Sahi values add ki hain?
- **Database running hai?** Database service check karo
- **Connection string sahi hai?** Internal URL use karo

### CORS Error
- **FRONTEND_URL check karo:** Vercel URL sahi hai?
- **HTTPS use karo:** HTTP nahi
- **Service redeploy karo** after changing FRONTEND_URL

### 404 Errors
- **API routes check karo:** `/api/auth/login` sahi hai?
- **Base URL verify karo:** `/api` included hai?

---

## ✅ Checklist

- [ ] Render account banaya
- [ ] Web Service create kiya
- [ ] Root Directory `backend` set kiya
- [ ] PostgreSQL database add kiya
- [ ] Database credentials copy kiye
- [ ] Environment variables add kiye
- [ ] Service deploy hui
- [ ] Service URL mila
- [ ] Database tables create kiye
- [ ] Vercel me VITE_API_URL update kiya
- [ ] Frontend redeploy kiya
- [ ] Login test kiya - kaam kar raha hai!

---

## 🎯 Quick Commands Reference

**Render Dashboard:**
- https://dashboard.render.com

**Service URL Format:**
```
https://your-service-name.onrender.com
```

**Database Connection:**
```
postgresql://user:password@host:5432/dbname
```

**Environment Variables Needed:**
```
PORT=5000
NODE_ENV=production
JWT_SECRET=your-secret
FRONTEND_URL=https://your-app.vercel.app
DB_HOST=...
DB_USER=...
DB_PASSWORD=...
DB_NAME=...
DB_PORT=5432
```

---

## 🆘 Help Chahiye?

1. **Render Docs:** https://render.com/docs
2. **Render Community:** https://community.render.com
3. **Logs check karo:** Service → Logs tab
4. **Support:** Render dashboard me support option

**Sabse Easy Option: Render!** 🚀

