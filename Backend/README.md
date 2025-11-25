# DevSync Backend

Backend API for DevSync - A real-time collaborative code editor platform.

## Features

- 🔐 User authentication (email/password, Google OAuth)
- 🏠 Room management (create, join, password protection)
- 💻 Real-time code collaboration via WebSocket
- 🚀 Code execution in sandboxed Docker containers
- 📊 Support for 10+ programming languages
- 🔒 Security features (rate limiting, input validation, JWT)

## Tech Stack

- **Runtime**: Node.js with Express.js
- **Database**: PostgreSQL
- **Cache/Pub-Sub**: Redis
- **Real-time**: Socket.io
- **Code Execution**: Docker
- **Queue**: Bull (Redis-based)

## Prerequisites

- Node.js 18+ 
- Docker and Docker Compose
- PostgreSQL 16+ (or use Docker Compose)
- Redis 7+ (or use Docker Compose)

## Quick Start

### 1. Install Dependencies
```bash
cd Backend
npm install
```

### 2. Set Up Environment
```bash
# Windows PowerShell:
Copy-Item env.example .env

# Mac/Linux:
cp env.example .env

# Then edit .env and set JWT_SECRET (required!)
```

### 3. Start Services

**If using cloud services (NeonDB + Upstash):**
- Skip this step! Your credentials are in `.env`
- See [CLOUD_SETUP.md](./CLOUD_SETUP.md) for details

**If using local Docker:**
```bash
docker-compose up -d
```

### 4. Set Up Database
```bash
npm run setup-db
```

### 5. Start Server
```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

The server will run on `http://localhost:5000`

**For detailed setup instructions, see [SETUP.md](./SETUP.md)**

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login
- `POST /api/v1/auth/logout` - Logout
- `POST /api/v1/auth/refresh` - Refresh access token
- `POST /api/v1/auth/google` - Google OAuth
- `POST /api/v1/auth/forgot-password` - Request password reset
- `POST /api/v1/auth/reset-password` - Reset password
- `GET /api/v1/auth/me` - Get current user

### Rooms
- `POST /api/v1/rooms/create` - Create room
- `POST /api/v1/rooms/join` - Join room
- `GET /api/v1/rooms/:roomId` - Get room details
- `POST /api/v1/rooms/:roomId/validate` - Validate room password
- `DELETE /api/v1/rooms/:roomId` - Delete room
- `POST /api/v1/rooms/:roomId/leave` - Leave room
- `GET /api/v1/rooms/user/active` - Get user's active rooms
- `GET /api/v1/rooms/:roomId/participants` - Get room participants

### Code Execution
- `POST /api/v1/execute` - Execute code
- `GET /api/v1/execute/:executionId` - Get execution result
- `GET /api/v1/execute/rooms/:roomId/executions` - Get room executions

### Health Checks
- `GET /api/health` - Server health
- `GET /api/health/db` - Database health
- `GET /api/health/redis` - Redis health

## WebSocket Events

### Client → Server
- `room:join` - Join a room
- `room:leave` - Leave a room
- `code:change` - Code change
- `cursor:move` - Cursor movement
- `selection:change` - Selection change
- `language:change` - Language change
- `presence:update` - Update presence

### Server → Client
- `room:joined` - Room joined confirmation
- `room:left` - Room left confirmation
- `code:updated` - Code update broadcast
- `cursor:moved` - Cursor position broadcast
- `selection:changed` - Selection broadcast
- `language:changed` - Language change broadcast
- `user:joined` - User joined room
- `user:left` - User left room
- `presence:updated` - Presence update
- `error` - Error message

## Database Schema

See the implementation prompt for complete database schema.

## Environment Variables

See `.env.example` for all required environment variables.

## Security

- JWT-based authentication
- Password hashing with bcrypt
- Rate limiting on sensitive endpoints
- Input validation with Joi
- CORS configuration
- Helmet for security headers
- Docker container isolation for code execution

## Development

```bash
# Run in development mode
npm run dev

# Run linter
npm run lint

# Run tests (when implemented)
npm test
```

## Production Deployment

1. Set `NODE_ENV=production`
2. Use environment variables for all secrets
3. Set up proper database backups
4. Configure reverse proxy (nginx)
5. Use process manager (PM2)
6. Set up monitoring and logging

## License

ISC

