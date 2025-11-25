# Quick Start Guide (NeonDB + Upstash)

## Prerequisites
- Node.js 18+ installed
- Docker Desktop installed (for code execution only)
- NeonDB account with database created
- Upstash account with Redis database created

## Setup Steps

### 1. Install Dependencies
```powershell
cd Backend
npm install
```

### 2. Create .env File
```powershell
New-Item -Path .env -ItemType File
notepad .env
```

### 3. Add Your Credentials to .env

Paste this template and fill in your credentials:

```env
# Server
NODE_ENV=development
PORT=5000
API_VERSION=v1

# NeonDB PostgreSQL - Replace with your connection string
DATABASE_URL=postgresql://username:password@ep-xxx-xxx.region.aws.neon.tech/dbname?sslmode=require

# Upstash Redis - Replace with your Redis URL
REDIS_URL=rediss://default:your-password@region.upstash.io:6379

# JWT - REQUIRED: Generate a random string (40+ characters)
JWT_SECRET=your-random-secure-string-here-min-32-chars-long

# Frontend
FRONTEND_URL=http://localhost:5173
CORS_ORIGIN=http://localhost:5173

# Docker (for code execution)
DOCKER_SOCKET_PATH=/var/run/docker.sock

# Code Execution
EXECUTION_TIMEOUT=10000
EXECUTION_MEMORY_LIMIT=128m
EXECUTION_CPU_LIMIT=1
```

**Important:**
- Replace `DATABASE_URL` with your NeonDB connection string
- Replace `REDIS_URL` with your Upstash Redis URL (starts with `rediss://`)
- Change `JWT_SECRET` to a random secure string

### 4. Set Up Database Tables
```powershell
npm run setup-db
```

This creates all required tables in your NeonDB database.

### 5. Start the Server
```powershell
npm run dev
```

You should see:
```
Server running on port 5000
Redis Client Connected
```

### 6. Test It Works
```powershell
curl http://localhost:5000/api/health
```

## Getting Your Credentials

### NeonDB Connection String
1. Go to [NeonDB Dashboard](https://console.neon.tech)
2. Select your project
3. Click on your database
4. Copy the connection string (looks like: `postgresql://user:pass@ep-xxx.region.aws.neon.tech/dbname?sslmode=require`)
5. Paste as `DATABASE_URL` in `.env`

### Upstash Redis URL
1. Go to [Upstash Dashboard](https://console.upstash.com)
2. Select your Redis database
3. Copy the "Redis URL" (looks like: `rediss://default:password@region.upstash.io:6379`)
4. Paste as `REDIS_URL` in `.env`

**Note:** Upstash URLs use `rediss://` (with double 's') for TLS/SSL.

## Generate JWT_SECRET

In PowerShell:
```powershell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 40 | ForEach-Object {[char]$_})
```

Copy the output and use it as your `JWT_SECRET`.

## Troubleshooting

### "Cannot connect to database"
- Check your `DATABASE_URL` is correct
- Verify NeonDB database is not paused
- Ensure connection string includes `?sslmode=require`

### "Redis connection failed"
- Check your `REDIS_URL` is correct
- Verify it starts with `rediss://` (TLS)
- Check password is correct

### "Docker not found"
- Install Docker Desktop for Windows
- Make sure Docker Desktop is running
- Docker is needed for code execution sandboxing

## Next Steps

1. ✅ Backend is running on `http://localhost:5000`
2. Connect your frontend to the backend
3. Test API endpoints
4. Start building features!

For detailed information, see [CLOUD_SETUP.md](./CLOUD_SETUP.md)

