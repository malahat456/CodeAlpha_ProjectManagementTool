# Step-by-Step Deployment Guide

Follow these exact steps to deploy your project.

## Option 1: Deploy with Docker (Easiest - Recommended)

This method deploys everything (database, backend, frontend) together.

### Step 1: Open Terminal/Command Prompt

- **Windows**: Press `Win + R`, type `cmd` or `powershell`, press Enter
- **Mac/Linux**: Open Terminal

### Step 2: Navigate to Your Project Folder

```bash
cd "P:\Semesters\7th semester\WT\project-management-system"
```

### Step 3: Check if Docker is Installed

```bash
docker --version
docker-compose --version
```

If you see version numbers, you're good! If not, install Docker Desktop from https://www.docker.com/products/docker-desktop

### Step 4: Create Environment File (Optional but Recommended)

Create a file named `.env` in the root folder with this content:

**On Windows (PowerShell):**
```powershell
@"
JWT_SECRET=my-super-secret-key-change-this-12345
DB_ROOT_PASSWORD=rootpassword
DB_USER=appuser
DB_PASSWORD=apppassword
DB_NAME=project_management
"@ | Out-File -FilePath .env -Encoding utf8
```

**On Mac/Linux:**
```bash
cat > .env << EOF
JWT_SECRET=my-super-secret-key-change-this-12345
DB_ROOT_PASSWORD=rootpassword
DB_USER=appuser
DB_PASSWORD=apppassword
DB_NAME=project_management
EOF
```

**Or manually create `.env` file** in the root folder with:
```
JWT_SECRET=my-super-secret-key-change-this-12345
DB_ROOT_PASSWORD=rootpassword
DB_USER=appuser
DB_PASSWORD=apppassword
DB_NAME=project_management
```

### Step 5: Build and Start Everything

```bash
docker-compose up -d --build
```

**What this does:**
- `docker-compose up` - Starts all services
- `-d` - Runs in background (detached mode)
- `--build` - Builds the Docker images

**Wait 1-2 minutes** for everything to start.

### Step 6: Check if Everything is Running

```bash
docker-compose ps
```

You should see 3 services running:
- `project-management-db` (MySQL)
- `project-management-backend` (Backend API)
- `project-management-frontend` (Frontend)

### Step 7: View Logs (Optional)

To see what's happening:
```bash
docker-compose logs -f
```

Press `Ctrl+C` to exit.

### Step 8: Access Your Application

Open your web browser and go to:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000

### Step 9: Initialize Database

You need to create your database tables. Connect to MySQL:

```bash
docker exec -it project-management-db mysql -u appuser -papppassword project_management
```

Then run your SQL schema file, or create tables manually.

**To import a SQL file:**
```bash
docker exec -i project-management-db mysql -u appuser -papppassword project_management < your-schema.sql
```

### Step 10: Stop the Application (When Done)

```bash
docker-compose down
```

---

## Option 2: Deploy Backend and Frontend Separately (Without Docker)

### Part A: Deploy Backend

#### Step 1: Navigate to Backend Folder

```bash
cd "P:\Semesters\7th semester\WT\project-management-system\backend"
```

#### Step 2: Install Dependencies

```bash
npm install
```

#### Step 3: Create Backend Environment File

Create a file named `.env` in the `backend` folder:

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

**Replace `your_mysql_password` with your actual MySQL password.**

#### Step 4: Make Sure MySQL is Running

- Start MySQL service on your computer
- Create database: `CREATE DATABASE project_management;`
- Run your SQL schema to create tables

#### Step 5: Start Backend Server

```bash
npm start
```

You should see: `Backend running on port 5000`

**Keep this terminal open!** The backend must keep running.

---

### Part B: Deploy Frontend

#### Step 1: Open a NEW Terminal Window

Keep the backend terminal running, open a new one.

#### Step 2: Navigate to Frontend Folder

```bash
cd "P:\Semesters\7th semester\WT\project-management-system\frontend"
```

#### Step 3: Install Dependencies

```bash
npm install
```

#### Step 4: Create Frontend Environment File

Create a file named `.env` in the `frontend` folder:

```
VITE_API_URL=http://localhost:5000/api
```

#### Step 5: Start Frontend Development Server

```bash
npm run dev
```

You should see something like: `Local: http://localhost:5173`

#### Step 6: Access Your Application

Open your browser and go to: http://localhost:5173

---

## Option 3: Build Frontend for Production

If you want to build the frontend as static files (for hosting on a web server):

### Step 1: Navigate to Frontend Folder

```bash
cd "P:\Semesters\7th semester\WT\project-management-system\frontend"
```

### Step 2: Create Environment File

Create `.env` file with your production backend URL:

```
VITE_API_URL=https://your-backend-domain.com/api
```

### Step 3: Build Frontend

```bash
npm run build
```

This creates a `dist` folder with all the static files.

### Step 4: Deploy the `dist` Folder

Upload the contents of the `dist` folder to:
- Netlify
- Vercel
- GitHub Pages
- Any static hosting service

---

## Troubleshooting

### "Port already in use" Error

If port 5000 or 3000 is already in use:

**For Docker:** Edit `docker-compose.yml` and change the port numbers:
```yaml
ports:
  - "5001:5000"  # Change 5000 to 5001
```

**For Backend:** Change `PORT=5000` to `PORT=5001` in backend `.env` file.

### "Cannot connect to database" Error

1. Make sure MySQL is running
2. Check database credentials in `.env` file
3. Make sure database exists: `CREATE DATABASE project_management;`

### "Frontend can't connect to backend" Error

1. Make sure backend is running (check terminal)
2. Check `VITE_API_URL` in frontend `.env` file
3. Make sure CORS is configured in backend (it should be)

### Docker Commands Not Working

1. Make sure Docker Desktop is running
2. Restart Docker Desktop
3. Try: `docker-compose down` then `docker-compose up -d --build` again

---

## Summary: What Command to Run?

**For Docker (Easiest):**
```bash
cd "P:\Semesters\7th semester\WT\project-management-system"
docker-compose up -d --build
```
Then open http://localhost:3000

**For Manual Deployment:**
1. Backend: `cd backend` → `npm install` → create `.env` → `npm start`
2. Frontend (new terminal): `cd frontend` → `npm install` → create `.env` → `npm run dev`
3. Open http://localhost:5173

---

## Need Help?

- Check logs: `docker-compose logs -f`
- Check if services are running: `docker-compose ps`
- Stop everything: `docker-compose down`
- Start again: `docker-compose up -d`

