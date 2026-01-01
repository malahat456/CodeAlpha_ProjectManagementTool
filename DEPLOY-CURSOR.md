# Deploy Using Cursor - Quick Guide

Cursor is based on VS Code, so all VS Code features work! Here's your quick deployment guide.

## 🚀 Quick Start (3 Steps)

### Step 1: Open Terminal in Cursor
- Press `` Ctrl + ` `` (backtick key, usually above Tab)
- Or: View → Terminal
- Terminal appears at the bottom

### Step 2: Run This Command

**If you have Docker:**
```bash
docker-compose up -d --build
```

**If you DON'T have Docker:**
See "Manual Deployment" section below

### Step 3: Open Your App
- Frontend: http://localhost:3000 (Docker) or http://localhost:5173 (Manual)
- Backend: http://localhost:5000

---

## 📋 Detailed Steps

### Method 1: Docker (Easiest - Recommended)

#### 1. Check Docker
```bash
docker --version
```
If not installed: https://www.docker.com/products/docker-desktop

#### 2. Create .env File
In Cursor's file explorer (left sidebar):
1. Right-click root folder → New File
2. Name it: `.env`
3. Paste this:
```
JWT_SECRET=my-super-secret-key-change-this-12345
DB_ROOT_PASSWORD=rootpassword
DB_USER=appuser
DB_PASSWORD=apppassword
DB_NAME=project_management
```

#### 3. Deploy
```bash
docker-compose up -d --build
```

#### 4. Check Status
```bash
docker-compose ps
```

#### 5. View Logs (if needed)
```bash
docker-compose logs -f
```

#### 6. Stop When Done
```bash
docker-compose down
```

---

### Method 2: Manual Deployment (Without Docker)

You need **2 terminals** in Cursor.

#### Terminal 1: Backend

1. **Open terminal:** `` Ctrl + ` ``
2. **Navigate and install:**
   ```bash
   cd backend
   npm install
   ```
3. **Create `.env` file:**
   - In Cursor, go to `backend` folder
   - Right-click → New File → `.env`
   - Paste:
   ```
   PORT=5000
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_NAME=project_management
   DB_PORT=3306
   JWT_SECRET=my-super-secret-key-change-this-12345
   FRONTEND_URL=http://localhost:5173
   ```
4. **Start backend:**
   ```bash
   npm start
   ```
   Keep this terminal open!

#### Terminal 2: Frontend

1. **Open second terminal:** `` Ctrl + Shift + ` ``
2. **Navigate and install:**
   ```bash
   cd frontend
   npm install
   ```
3. **Create `.env` file:**
   - In Cursor, go to `frontend` folder
   - Right-click → New File → `.env`
   - Paste:
   ```
   VITE_API_URL=http://localhost:5000/api
   ```
4. **Start frontend:**
   ```bash
   npm run dev
   ```

#### Access Your App
Open browser: http://localhost:5173

---

## 🎯 Cursor-Specific Tips

### Using Cursor's AI Terminal
- Cursor has AI-powered terminal features
- You can ask Cursor AI to help with commands
- Use `Ctrl+L` to chat with AI about deployment

### Multiple Terminals
- `` Ctrl + ` `` - Toggle terminal
- `` Ctrl + Shift + ` `` - New terminal
- Click terminal tabs to switch
- Right-click terminal → Split Terminal

### Quick Commands
- `Ctrl+C` - Stop running process
- `Ctrl+L` - Clear terminal
- `Ctrl+Click` on URLs - Open in browser

### Using Tasks (Already Set Up!)
1. Press `Ctrl+Shift+P`
2. Type: `Tasks: Run Task`
3. Choose:
   - 🚀 Start All (Docker)
   - 🛑 Stop All (Docker)
   - 🔧 Start Backend
   - 🎨 Start Frontend
   - 📊 View Logs

---

## 🔧 Troubleshooting

### Port Already in Use
```bash
# Find what's using port 5000
netstat -ano | findstr :5000

# Kill process (replace PID)
taskkill /PID <PID> /F
```

### Docker Not Working
1. Make sure Docker Desktop is running
2. Restart Cursor
3. Try: `docker-compose down` then `docker-compose up -d --build`

### Can't See .env Files
- `.env` files might be hidden
- File → Preferences → Settings
- Search "files.exclude"
- Make sure `.env` is not excluded

### Database Connection Error
1. Make sure MySQL is running
2. Check `.env` file credentials
3. Create database: `CREATE DATABASE project_management;`

---

## 📝 Environment Files Checklist

### Root `.env` (for Docker)
```
JWT_SECRET=your-secret-key
DB_ROOT_PASSWORD=rootpassword
DB_USER=appuser
DB_PASSWORD=apppassword
DB_NAME=project_management
```

### `backend/.env` (for Manual)
```
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=project_management
DB_PORT=3306
JWT_SECRET=your-secret-key
FRONTEND_URL=http://localhost:5173
```

### `frontend/.env` (for Manual)
```
VITE_API_URL=http://localhost:5000/api
```

---

## 🎬 Quick Reference

### Docker Commands
```bash
docker-compose up -d --build    # Start everything
docker-compose ps                # Check status
docker-compose logs -f           # View logs
docker-compose down              # Stop everything
```

### Manual Commands
```bash
# Backend
cd backend
npm install
npm start

# Frontend (new terminal)
cd frontend
npm install
npm run dev
```

---

## 🆘 Need Help?

1. **Check terminal output** - Error messages are usually clear
2. **View logs:** `docker-compose logs -f`
3. **Check status:** `docker-compose ps`
4. **Ask Cursor AI:** Press `Ctrl+L` and describe your issue

---

## ✅ Success Checklist

- [ ] Terminal is open in Cursor
- [ ] `.env` files are created
- [ ] Docker is running (if using Docker method)
- [ ] MySQL is running (if using manual method)
- [ ] Backend shows "Backend running on port 5000"
- [ ] Frontend shows "Local: http://localhost:5173"
- [ ] Browser opens and shows your app

---

**Ready?** Open terminal (`` Ctrl + ` ``) and run:
```bash
docker-compose up -d --build
```

Then open http://localhost:3000 🎉

