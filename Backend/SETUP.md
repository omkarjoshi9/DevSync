# How to Run the DevSync Backend

## Prerequisites

Before running the backend, make sure you have:
- **Node.js 18+** installed
- **Docker Desktop** installed (for PostgreSQL and Redis)
- **Git** (if cloning the repository)

## Step-by-Step Setup

### 1. Navigate to Backend Directory

```bash
cd Backend
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required packages from `package.json`.

### 3. Set Up Environment Variables

**Option A: Using Cloud Services (NeonDB + Upstash) - Recommended**

If you're using NeonDB and Upstash (cloud services), see [CLOUD_SETUP.md](./CLOUD_SETUP.md) for detailed instructions.

Your `.env` should include:
```env
# NeonDB PostgreSQL connection string
DATABASE_URL=postgresql://user:pass@ep-xxx.region.aws.neon.tech/dbname?sslmode=require

# Upstash Redis URL
REDIS_URL=rediss://default:password@region.upstash.io:6379

# Required - Change this!
JWT_SECRET=your-super-secret-jwt-key-change-this-to-something-random-and-secure-min-32-chars
```

**Option B: Using Local Docker Services**

**On Windows (PowerShell):**
```powershell
Copy-Item env.example .env
```

**On Mac/Linux:**
```bash
cp env.example .env
```

Then edit `.env` file with local defaults:
```env
# Database (defaults work with docker-compose)
DATABASE_URL=postgresql://devsync_user:devsync_password@localhost:5432/devsync

# Redis (defaults work with docker-compose)
REDIS_URL=redis://localhost:6379
```

**Important**: Change `JWT_SECRET` to a random secure string (at least 32 characters).

### 4. Start Local Services (Only if NOT using cloud services)

If using local Docker services instead of cloud:

```bash
docker-compose up -d
```

This will start:
- PostgreSQL on port `5432`
- Redis on port `6379`

**Note**: If using NeonDB/Upstash, skip this step!

### 5. Set Up Database Schema

Run the database setup script:

```bash
npm run setup-db
```

Or manually run the SQL file:
```bash
# Using psql (if installed)
psql -U devsync_user -d devsync -f database-schema.sql

# Or using Docker
docker exec -i devsync-postgres psql -U devsync_user -d devsync < database-schema.sql
```

### 6. Start the Backend Server

**Development mode** (with auto-reload):
```bash
npm run dev
```

**Production mode**:
```bash
npm start
```

You should see:
```
Server running on port 5000
Redis Client Connected
```

### 7. Verify It's Working

Open your browser or use curl:

```bash
# Health check
curl http://localhost:5000/api/health

# Should return:
# {"success":true,"data":{"status":"healthy","timestamp":"..."}}
```

## Common Issues & Solutions

### Issue: "Cannot connect to database"

**If using NeonDB:**
- Check your `DATABASE_URL` is correct
- Verify database is not paused in NeonDB dashboard
- Ensure connection string includes `?sslmode=require`
- Check if your IP needs whitelisting

**If using local Docker:**
- Make sure PostgreSQL is running: `docker-compose ps`
- Start it: `docker-compose up -d postgres`

### Issue: "Redis connection failed"

**If using Upstash:**
- Check your `REDIS_URL` is correct (should start with `rediss://` for TLS)
- Verify database is active in Upstash dashboard
- Check password/token is correct

**If using local Docker:**
- Make sure Redis is running: `docker-compose ps`
- Start it: `docker-compose up -d redis`

The backend will continue without Redis, but WebSocket scaling won't work.

### Issue: "Port 5000 already in use"

**Solution**: Change the port in `.env`:
```env
PORT=5001
```

### Issue: "JWT_SECRET is missing"

**Solution**: Make sure you've created `.env` file and set `JWT_SECRET`.

### Issue: "Table does not exist"

**Solution**: Run the database setup:
```bash
npm run setup-db
```

## Development Workflow

1. **Start services** (in one terminal):
   ```bash
   docker-compose up -d
   ```

2. **Run backend** (in another terminal):
   ```bash
   npm run dev
   ```

3. **Make changes** - The server will auto-reload with nodemon

4. **View logs**:
   - Backend logs: In the terminal running `npm run dev`
   - Database logs: `docker-compose logs -f postgres`
   - Redis logs: `docker-compose logs -f redis`

## Testing the API

### Register a User
```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "firstName": "Test",
    "lastName": "User"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

Save the `accessToken` from the response.

### Create a Room
```bash
curl -X POST http://localhost:5000/api/v1/rooms/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "language": "javascript"
  }'
```

## Project Structure

```
Backend/
├── src/
│   ├── config/          # Configuration files
│   ├── controllers/     # Request handlers
│   ├── models/          # Database models
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   ├── middleware/      # Express middleware
│   ├── utils/           # Utility functions
│   ├── validators/      # Input validation schemas
│   ├── queues/          # Background job queues
│   ├── app.js           # Express app setup
│   └── server.js        # Server entry point
├── scripts/              # Setup scripts
├── docker-compose.yml   # Local development services
├── .env.example         # Environment variables template
└── package.json         # Dependencies
```

## Next Steps

1. **Connect Frontend**: Update your frontend to point to `http://localhost:5000`
2. **Test WebSocket**: Connect to `ws://localhost:5000` for real-time features
3. **Configure OAuth**: Set up Google OAuth credentials in `.env`
4. **Set up Email**: Configure SMTP settings for password reset emails

## Production Deployment

For production:
1. Set `NODE_ENV=production` in `.env`
2. Use a proper database (not Docker for production)
3. Set up reverse proxy (nginx)
4. Use process manager (PM2)
5. Configure proper logging
6. Set up monitoring

## Need Help?

- Check the logs: `npm run dev` shows all server logs
- Database issues: Check `docker-compose logs postgres`
- Redis issues: Check `docker-compose logs redis`
- API testing: Use Postman or the curl examples above

