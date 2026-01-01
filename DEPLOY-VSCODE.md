# Deploy Using VS Code - Step by Step

This guide shows you exactly how to deploy your project using VS Code's integrated terminal.

## Prerequisites

1. **Open your project in VS Code:**
   - File → Open Folder
   - Select: `P:\Semesters\7th semester\WT\project-management-system`

2. **Open Terminal in VS Code:**
   - Press `` Ctrl + ` `` (backtick key, usually above Tab)
   - Or go to: Terminal → New Terminal
   - You'll see a terminal at the bottom of VS Code

---

## Method 1: Deploy with Docker (Easiest)

### Step 1: Check Docker Installation

In the VS Code terminal, type:
```bash
docker --version
```

If you see a version number, you're good! If not:
- Install Docker Desktop: https://www.docker.com/products/docker-desktop
- Restart VS Code after installing

### Step 2: Create Environment File

**Option A: Using VS Code File Explorer**
1. In VS Code's left sidebar, right-click on the root folder
2. Select "New File"
3. Name it: `.env`
4. Paste this content:
```
JWT_SECRET=my-super-secret-key-change-this-12345
DB_ROOT_PASSWORD=rootpassword
DB_USER=appuser
DB_PASSWORD=apppassword
DB_NAME=project_management
```

**Option B: Using Terminal**
In the VS Code terminal, run:
```powershell
@"
JWT_SECRET=my-super-secret-key-change-this-12345
DB_ROOT_PASSWORD=rootpassword
DB_USER=appuser
DB_PASSWORD=apppassword
DB_NAME=project_management
"@ | Out-File -FilePath .env -Encoding utf8
```

### Step 3: Deploy Everything

In the VS Code terminal, run:
```bash
docker-compose up -d --build
```

**What happens:**
- Docker will download images (first time only - takes a few minutes)
- Build your frontend and backend
- Start MySQL, backend, and frontend
- Wait 1-2 minutes for everything to start

### Step 4: Check Status

```bash
docker-compose ps
```

You should see 3 services with "Up" status.

### Step 5: View Logs (Optional)

To see what's happening:
```bash
docker-compose logs -f
```

Press `Ctrl+C` to stop viewing logs.

### Step 6: Open Your Application

1. In VS Code, press `Ctrl+Click` on this link: http://localhost:3000
2. Or open your browser and go to: http://localhost:3000

### Step 7: Initialize Database

You need to create your database tables. In the terminal:

```bash
docker exec -it project-management-db mysql -u appuser -papppassword project_management
```

Then run your SQL schema, or import a file:
```bash
docker exec -i project-management-db mysql -u appuser -papppassword project_management < your-schema.sql
```

### Step 8: Stop When Done

```bash
docker-compose down
```

---

## Method 2: Deploy Without Docker (Manual)

### Part A: Deploy Backend

#### Step 1: Open Backend Terminal

1. In VS Code, go to: Terminal → New Terminal
2. Click the dropdown arrow next to the terminal name (usually shows "1: powershell")
3. Select "New Terminal"
4. This opens a second terminal

**Or use the split terminal:**
- Press `` Ctrl + Shift + ` `` to open a new terminal
- You'll have 2 terminals side by side

#### Step 2: Navigate to Backend

In the first terminal, type:
```bash
cd backend
```

#### Step 3: Install Dependencies

```bash
npm install
```

Wait for it to finish (may take 1-2 minutes).

#### Step 4: Create Backend .env File

1. In VS Code's left sidebar, go to the `backend` folder
2. Right-click → New File
3. Name it: `.env`
4. Paste this content (update with your MySQL password):
```
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password_here
DB_NAME=project_management
DB_PORT=3306
JWT_SECRET=my-super-secret-key-change-this-12345
FRONTEND_URL=http://localhost:5173
```

**Important:** Replace `your_mysql_password_here` with your actual MySQL password!

#### Step 5: Make Sure MySQL is Running

- Open MySQL Workbench or command line
- Create database: `CREATE DATABASE project_management;`
- Run your SQL schema to create tables

#### Step 6: Start Backend

In the backend terminal:
```bash
npm start
```

You should see: `Backend running on port 5000`

**Keep this terminal open!** The backend must keep running.

---

### Part B: Deploy Frontend

#### Step 1: Use the Second Terminal

Click on the second terminal (or open a new one with `` Ctrl + Shift + ` ``)

#### Step 2: Navigate to Frontend

```bash
cd frontend
```

#### Step 3: Install Dependencies

```bash
npm install
```

Wait for it to finish.

#### Step 4: Create Frontend .env File

1. In VS Code's left sidebar, go to the `frontend` folder
2. Right-click → New File
3. Name it: `.env`
4. Paste this content:
```
VITE_API_URL=http://localhost:5000/api
```

#### Step 5: Start Frontend

```bash
npm run dev
```

You should see:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

#### Step 6: Open Your Application

1. In VS Code, press `Ctrl+Click` on the `http://localhost:5173/` link
2. Or open your browser and go to: http://localhost:5173

---

## VS Code Tips & Tricks

### 1. Use Multiple Terminals

- **Split Terminal:** `` Ctrl + Shift + ` ``
- **New Terminal Tab:** `` Ctrl + Shift + ` ``
- **Switch Between Terminals:** Click on terminal tabs at the bottom

### 2. Terminal Shortcuts

- `` Ctrl + ` `` - Toggle terminal visibility
- `` Ctrl + Shift + ` `` - Create new terminal
- `Ctrl + C` - Stop running process
- `Ctrl + L` - Clear terminal

### 3. Run Commands Easily

- Right-click on any file → "Open in Integrated Terminal"
- Use the terminal's dropdown to switch between terminals

### 4. View Logs in VS Code

For Docker:
```bash
docker-compose logs -f backend
docker-compose logs -f frontend
```

### 5. Use VS Code Tasks (Optional)

I can create tasks.json for you to run commands with shortcuts. Would you like me to set that up?

---

## Quick Reference: Commands to Copy

### Docker Method (All-in-One)
```bash
docker-compose up -d --build
docker-compose ps
docker-compose logs -f
docker-compose down
```

### Manual Method
**Terminal 1 (Backend):**
```bash
cd backend
npm install
npm start
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm install
npm run dev
```

---

## Troubleshooting in VS Code

### Terminal Shows Errors

1. **Check which terminal you're in:**
   - Look at the terminal tab name
   - Make sure you're in the right folder (`cd backend` or `cd frontend`)

2. **Clear terminal and try again:**
   - `Ctrl + L` to clear
   - Re-run the command

### Port Already in Use

1. **Find what's using the port:**
   ```bash
   netstat -ano | findstr :5000
   ```

2. **Kill the process** (replace PID with the number from above):
   ```bash
   taskkill /PID <PID> /F
   ```

### Can't See .env Files

- `.env` files might be hidden
- In VS Code: File → Preferences → Settings
- Search for "files.exclude"
- Make sure `.env` is not excluded

### Docker Commands Not Found

1. Make sure Docker Desktop is running (check system tray)
2. Restart VS Code
3. Close and reopen the terminal

---

## Visual Guide: VS Code Layout

```
┌─────────────────────────────────────────┐
│  VS Code Window                         │
├─────────────────────────────────────────┤
│  [File Explorer]  │  [Editor]          │
│                   │                     │
│  📁 backend       │  Your code files   │
│  📁 frontend      │                     │
│  📄 .env          │                     │
│  📄 docker-       │                     │
│     compose.yml   │                     │
├─────────────────────────────────────────┤
│  [Terminal]                             │
│  PS> cd backend                         │
│  PS> npm start                          │
│  Backend running on port 5000           │
│                                         │
│  [Terminal 2]                           │
│  PS> cd frontend                        │
│  PS> npm run dev                        │
│  Local: http://localhost:5173/          │
└─────────────────────────────────────────┘
```

---

## Next Steps

1. **Choose your method** (Docker is easier!)
2. **Follow the steps** above
3. **Open your browser** to see your app
4. **Initialize your database** with your schema

Need help? Check the terminal output for error messages!

