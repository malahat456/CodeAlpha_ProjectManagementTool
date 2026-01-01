# Quick Setup - Follow These Steps

Since Docker is not installed, we'll deploy manually. Follow these steps:

## ✅ Step 1: Create Backend .env File

1. In Cursor, go to the `backend` folder
2. Right-click → **New File**
3. Name it: `.env` (exactly, with the dot)
4. Copy and paste this content:

```
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=project_management
DB_PORT=3306
JWT_SECRET=my-super-secret-key-change-this-in-production-12345
FRONTEND_URL=http://localhost:5173
```

**Important:** Replace `DB_PASSWORD=` with your MySQL password if you have one.

## ✅ Step 2: Create Frontend .env File

1. In Cursor, go to the `frontend` folder
2. Right-click → **New File**
3. Name it: `.env` (exactly, with the dot)
4. Copy and paste this content:

```
VITE_API_URL=http://localhost:5000/api
```

## ✅ Step 3: Make Sure MySQL is Running

- Start MySQL service on your computer
- Create the database: `CREATE DATABASE project_management;`
- Run your SQL schema to create tables

## ✅ Step 4: Start Backend

In Cursor terminal, run:
```powershell
cd backend
npm start
```

You should see: `Backend running on port 5000`

**Keep this terminal open!**

## ✅ Step 5: Start Frontend (New Terminal)

1. Press `` Ctrl + Shift + ` `` to open a NEW terminal
2. Run:
```powershell
cd frontend
npm run dev
```

You should see: `Local: http://localhost:5173/`

## ✅ Step 6: Open Your App

Open your browser and go to: **http://localhost:5173**

---

## 🎉 That's It!

Your app should now be running!

