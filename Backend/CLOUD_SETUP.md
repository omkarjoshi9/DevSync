# Cloud Setup Guide (NeonDB + Upstash)

This guide is for using **NeonDB** (PostgreSQL) and **Upstash** (Redis) instead of local Docker containers.

## Environment Variables Setup

Your `.env` file should look like this:

```env
# Server
NODE_ENV=development
PORT=5000
API_VERSION=v1

# NeonDB (PostgreSQL) - Use your NeonDB connection string
DATABASE_URL=postgresql://username:password@ep-xxx-xxx.region.aws.neon.tech/dbname?sslmode=require
# Or if NeonDB provides separate fields:
DB_HOST=ep-xxx-xxx.region.aws.neon.tech
DB_PORT=5432
DB_NAME=dbname
DB_USER=username
DB_PASSWORD=password

# Upstash Redis - Use your Upstash Redis URL
REDIS_URL=rediss://default:password@region.upstash.io:6379
# Or if Upstash provides separate fields:
REDIS_HOST=region.upstash.io
REDIS_PORT=6379
REDIS_PASSWORD=password

# JWT - REQUIRED: Change this to a random secure string!
JWT_SECRET=your-super-secret-jwt-key-change-this-min-32-chars

# Frontend
FRONTEND_URL=http://localhost:5173
CORS_ORIGIN=http://localhost:5173

# Docker (still needed for code execution)
DOCKER_SOCKET_PATH=/var/run/docker.sock

# Code Execution
EXECUTION_TIMEOUT=10000
EXECUTION_MEMORY_LIMIT=128m
EXECUTION_CPU_LIMIT=1
```

## Getting Your Credentials

### NeonDB Setup

1. Go to [NeonDB](https://neon.tech) and create an account
2. Create a new project
3. Copy the connection string from the dashboard
4. It should look like: `postgresql://user:pass@ep-xxx.region.aws.neon.tech/dbname?sslmode=require`
5. Paste it as `DATABASE_URL` in your `.env`

### Upstash Setup

1. Go to [Upstash](https://upstash.com) and create an account
2. Create a new Redis database
3. Copy the Redis URL from the dashboard
4. It should look like: `rediss://default:password@region.upstash.io:6379`
5. Paste it as `REDIS_URL` in your `.env`

**Note**: Upstash URLs usually start with `rediss://` (with double 's') for TLS/SSL.

## Setup Steps

### 1. Create .env file

```powershell
# Create .env file
New-Item -Path .env -ItemType File
notepad .env
```

Paste your credentials (see format above).

### 2. Install Dependencies

```powershell
npm install
```

### 3. Set Up Database Schema

```powershell
npm run setup-db
```

This will create all the required tables in your NeonDB database.

### 4. Start the Server

```powershell
npm run dev
```

## Important Notes

### Docker Still Required

Even though you're using cloud databases, **Docker is still required** for code execution. The backend uses Docker containers to safely execute user code in sandboxed environments.

Make sure Docker Desktop is running on Windows.

### SSL/TLS Connections

- **NeonDB**: Uses SSL by default (included in connection string with `?sslmode=require`)
- **Upstash**: Uses TLS/SSL (URLs start with `rediss://`)

The configuration files handle these automatically.

### Testing Connections

After starting the server, test the connections:

```powershell
# Health check
curl http://localhost:5000/api/health

# Database health
curl http://localhost:5000/api/health/db

# Redis health
curl http://localhost:5000/api/health/redis
```

## Troubleshooting

### "Cannot connect to database"

1. Check your `DATABASE_URL` is correct
2. Verify NeonDB database is active (not paused)
3. Check if your IP needs to be whitelisted in NeonDB settings
4. Ensure SSL mode is included: `?sslmode=require`

### "Redis connection failed"

1. Check your `REDIS_URL` is correct
2. Verify Upstash database is active
3. Make sure the URL uses `rediss://` (with double 's') for TLS
4. Check if password/token is correct

### "Docker not found"

Docker is still needed for code execution. Install Docker Desktop for Windows.

## No Local Services Needed

Since you're using cloud services:
- ✅ No need to run `docker-compose up -d` for database/redis
- ✅ No local PostgreSQL installation needed
- ✅ No local Redis installation needed
- ⚠️ Docker Desktop still required for code execution

## Production Ready

Your setup with NeonDB and Upstash is production-ready! These are managed cloud services that handle:
- Automatic backups
- High availability
- Scaling
- Security

Just make sure to:
- Use strong `JWT_SECRET` in production
- Set `NODE_ENV=production`
- Configure proper CORS origins
- Set up monitoring

