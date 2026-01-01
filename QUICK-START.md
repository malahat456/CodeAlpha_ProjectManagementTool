# Quick Start Guide

Get your Project Management System up and running in minutes!

## Prerequisites

- Docker and Docker Compose installed
- Git (to clone the repository)

## Quick Start with Docker Compose

1. **Clone the repository** (if you haven't already):
   ```bash
   git clone <your-repo-url>
   cd project-management-system
   ```

2. **Create environment file** (optional, defaults are provided):
   ```bash
   # Create .env file in root directory
   echo "JWT_SECRET=$(openssl rand -hex 32)" > .env
   echo "DB_ROOT_PASSWORD=rootpassword" >> .env
   echo "DB_USER=appuser" >> .env
   echo "DB_PASSWORD=apppassword" >> .env
   echo "DB_NAME=project_management" >> .env
   ```

   Or on Windows PowerShell:
   ```powershell
   "JWT_SECRET=your-secret-key-here" | Out-File -FilePath .env -Encoding utf8
   "DB_ROOT_PASSWORD=rootpassword" | Out-File -FilePath .env -Append -Encoding utf8
   "DB_USER=appuser" | Out-File -FilePath .env -Append -Encoding utf8
   "DB_PASSWORD=apppassword" | Out-File -FilePath .env -Append -Encoding utf8
   "DB_NAME=project_management" | Out-File -FilePath .env -Append -Encoding utf8
   ```

3. **Start all services**:
   ```bash
   docker-compose up -d --build
   ```

4. **Wait for services to be ready** (about 30-60 seconds):
   ```bash
   docker-compose logs -f
   ```
   Press `Ctrl+C` to exit logs view.

5. **Access your application**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - MySQL: localhost:3306

## Initialize Database

You'll need to create the database tables. You can either:

1. **Connect to MySQL and run your schema**:
   ```bash
   docker exec -it project-management-db mysql -u appuser -papppassword project_management
   ```
   Then run your SQL schema file.

2. **Or import a SQL file**:
   ```bash
   docker exec -i project-management-db mysql -u appuser -papppassword project_management < your-schema.sql
   ```

## Stop the Application

```bash
docker-compose down
```

To also remove volumes (deletes database data):
```bash
docker-compose down -v
```

## Troubleshooting

### Port already in use
If ports 3000, 5000, or 3306 are already in use, you can change them in `docker-compose.yml`.

### Database connection issues
Wait a bit longer for MySQL to fully start. Check logs:
```bash
docker-compose logs mysql
```

### Frontend can't connect to backend
Make sure both services are running:
```bash
docker-compose ps
```

## Next Steps

- See `README-DEPLOYMENT.md` for detailed deployment options
- Configure production environment variables
- Set up SSL/HTTPS for production
- Configure database backups

