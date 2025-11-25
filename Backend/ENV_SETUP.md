# Environment Variables Setup Guide

## Quick Setup (Windows PowerShell)

### Step 1: Copy the example file
```powershell
Copy-Item .env.example .env
```

### Step 2: Open and edit the file
```powershell
notepad .env
```

### Step 3: Change the JWT_SECRET

Find this line:
```
JWT_SECRET=your-super-secret-jwt-key-change-in-production-min-32-chars
```

Replace it with a random secure string (at least 32 characters). Examples:
```
JWT_SECRET=devsync-secret-key-2024-abc123xyz789-random-string-min-32-chars
```

Or generate a random one:
```powershell
# Generate a random string (PowerShell)
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 40 | ForEach-Object {[char]$_})
```

### Step 4: Save and close

Press `Ctrl+S` to save, then close Notepad.

## Required Variables

You **MUST** change these:

1. **JWT_SECRET** - A random secure string (minimum 32 characters)
   - Used to sign and verify JWT tokens
   - Keep this secret! Never commit it to git.

## Optional Variables (can leave as default for now)

- **GOOGLE_CLIENT_ID** / **GOOGLE_CLIENT_SECRET** - Only needed if using Google OAuth
- **SMTP_*** - Only needed for password reset emails
- **DOCKER_SOCKET_PATH** - Only change if Docker socket is in different location

## Default Values (work out of the box)

These work with `docker-compose.yml`:
- `DATABASE_URL` - PostgreSQL connection
- `REDIS_URL` - Redis connection
- `PORT` - Server port (5000)
- `FRONTEND_URL` - Frontend URL (5173 is Vite default)

## Verification

After creating `.env`, verify it exists:
```powershell
Test-Path .env
# Should return: True
```

## Example .env File

Here's what your `.env` should look like (with your own JWT_SECRET):

```env
# Server
NODE_ENV=development
PORT=5000
API_VERSION=v1

# Database (works with docker-compose)
DATABASE_URL=postgresql://devsync_user:devsync_password@localhost:5432/devsync

# Redis (works with docker-compose)
REDIS_URL=redis://localhost:6379

# JWT - YOUR SECRET KEY HERE
JWT_SECRET=my-super-secret-random-key-12345-abcdef-67890-xyz-98765

# Frontend
FRONTEND_URL=http://localhost:5173
CORS_ORIGIN=http://localhost:5173
```

## Troubleshooting

### "Missing required environment variables" error

Make sure:
1. `.env` file exists in the `Backend` folder
2. `JWT_SECRET` is set and at least 32 characters
3. `DATABASE_URL` is set
4. `REDIS_URL` is set

### File not found error

Make sure you're in the `Backend` directory:
```powershell
cd Backend
Get-Location  # Should show: E:\Projects\DevSync\Backend
```

### Permission denied

If you can't create the file, run PowerShell as Administrator.

