# Deployment Guide

This guide covers deploying the Project Management System frontend and backend.

## Prerequisites

- Docker and Docker Compose installed
- Node.js 18+ (for local development)
- MySQL 8.0+ (if not using Docker)

## Environment Variables

### Backend Environment Variables

Create a `.env` file in the `backend/` directory:

```env
# Server Configuration
PORT=5000

# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=project_management
DB_PORT=3306

# JWT Secret (Use a strong random string in production)
JWT_SECRET=your-very-secure-secret-key-change-this

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000
```

### Frontend Environment Variables

Create a `.env` file in the `frontend/` directory:

```env
# Backend API URL
VITE_API_URL=http://localhost:5000/api
```

For production, update `VITE_API_URL` to your backend URL:
```env
VITE_API_URL=https://your-backend-domain.com/api
```

## Deployment Options

### Option 1: Docker Compose (Recommended)

This is the easiest way to deploy everything together.

1. **Create environment file for Docker Compose:**

   Create a `.env` file in the root directory:

   ```env
   DB_ROOT_PASSWORD=rootpassword
   DB_USER=appuser
   DB_PASSWORD=apppassword
   DB_NAME=project_management
   JWT_SECRET=your-very-secure-secret-key-change-this
   ```

2. **Build and start all services:**

   ```bash
   docker-compose up -d --build
   ```

3. **Access the application:**

   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - MySQL: localhost:3306

4. **Stop the services:**

   ```bash
   docker-compose down
   ```

5. **View logs:**

   ```bash
   docker-compose logs -f
   ```

### Option 2: Deploy Backend Separately

#### Using Docker:

1. **Navigate to backend directory:**

   ```bash
   cd backend
   ```

2. **Create `.env` file** (see Backend Environment Variables above)

3. **Build and run:**

   ```bash
   docker build -t project-management-backend .
   docker run -p 5000:5000 --env-file .env project-management-backend
   ```

#### Using Node.js directly:

1. **Install dependencies:**

   ```bash
   cd backend
   npm install
   ```

2. **Create `.env` file** (see Backend Environment Variables above)

3. **Start the server:**

   ```bash
   npm start
   ```

### Option 3: Deploy Frontend Separately

#### Using Docker:

1. **Navigate to frontend directory:**

   ```bash
   cd frontend
   ```

2. **Create `.env` file** with your backend URL:

   ```env
   VITE_API_URL=https://your-backend-domain.com/api
   ```

3. **Build and run:**

   ```bash
   docker build -t project-management-frontend .
   docker run -p 3000:80 project-management-frontend
   ```

#### Using Vite (for development):

1. **Install dependencies:**

   ```bash
   cd frontend
   npm install
   ```

2. **Create `.env` file** (see Frontend Environment Variables above)

3. **Start development server:**

   ```bash
   npm run dev
   ```

4. **Build for production:**

   ```bash
   npm run build
   ```

   The built files will be in the `dist/` directory.

## Cloud Deployment

### Deploy to Railway

1. **Backend:**
   - Connect your GitHub repository
   - Set root directory to `backend`
   - Add environment variables
   - Railway will auto-detect Node.js and deploy

2. **Frontend:**
   - Connect your GitHub repository
   - Set root directory to `frontend`
   - Build command: `npm run build`
   - Output directory: `dist`
   - Add `VITE_API_URL` environment variable

### Deploy to Render

1. **Backend:**
   - Create a new Web Service
   - Set root directory to `backend`
   - Build command: `npm install`
   - Start command: `npm start`
   - Add environment variables

2. **Frontend:**
   - Create a new Static Site
   - Set root directory to `frontend`
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Add `VITE_API_URL` environment variable

### Deploy to Vercel (Frontend)

1. Install Vercel CLI: `npm i -g vercel`
2. Navigate to frontend directory: `cd frontend`
3. Run: `vercel`
4. Add environment variable `VITE_API_URL` in Vercel dashboard

### Deploy to Heroku

1. **Backend:**
   ```bash
   cd backend
   heroku create your-app-name
   heroku addons:create cleardb:ignite  # For MySQL
   heroku config:set JWT_SECRET=your-secret
   git push heroku main
   ```

2. **Frontend:**
   - Use Vercel, Netlify, or similar for frontend
   - Update `VITE_API_URL` to your Heroku backend URL

## Database Setup

### Initial Database Setup

1. **Connect to MySQL:**

   ```bash
   mysql -u root -p
   ```

2. **Create database:**

   ```sql
   CREATE DATABASE project_management;
   ```

3. **Import schema** (if you have a SQL file):

   ```bash
   mysql -u root -p project_management < schema.sql
   ```

### Using Docker MySQL

The database is automatically created when using Docker Compose. You may need to run your migration scripts or create tables manually.

## Production Checklist

- [ ] Change `JWT_SECRET` to a strong random string
- [ ] Update database passwords
- [ ] Set `FRONTEND_URL` to your production frontend URL
- [ ] Set `VITE_API_URL` to your production backend URL
- [ ] Enable HTTPS/SSL certificates
- [ ] Configure CORS properly for production domains
- [ ] Set up database backups
- [ ] Configure proper logging
- [ ] Set up monitoring and error tracking
- [ ] Review and update security settings

## Troubleshooting

### Backend won't start

- Check if port 5000 is already in use
- Verify database connection settings
- Ensure all environment variables are set
- Check logs: `docker-compose logs backend`

### Frontend can't connect to backend

- Verify `VITE_API_URL` is correct
- Check CORS settings in backend
- Ensure backend is running and accessible
- Check browser console for errors

### Database connection errors

- Verify database is running
- Check database credentials
- Ensure database exists
- Check network connectivity between services

## Support

For issues or questions, please check the main README or open an issue in the repository.

