import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envContent = `# Server
NODE_ENV=development
PORT=5000
API_VERSION=v1

# Database
DATABASE_URL=postgresql://devsync_user:devsync_password@localhost:5432/devsync
DB_HOST=localhost
DB_PORT=5432
DB_NAME=devsync
DB_USER=devsync_user
DB_PASSWORD=devsync_password

# Redis
REDIS_URL=redis://localhost:6379
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT - CHANGE THIS TO A RANDOM SECURE STRING!
JWT_SECRET=your-super-secret-jwt-key-change-in-production-min-32-chars
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# OAuth (Optional - for Google login)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

# Email (Optional - for password reset)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=noreply@devsync.com

# Frontend
FRONTEND_URL=http://localhost:5173
CORS_ORIGIN=http://localhost:5173

# Docker
DOCKER_SOCKET_PATH=/var/run/docker.sock

# Code Execution
EXECUTION_TIMEOUT=10000
EXECUTION_MEMORY_LIMIT=128m
EXECUTION_CPU_LIMIT=1
`;

const envPath = path.join(__dirname, '..', '.env');

if (fs.existsSync(envPath)) {
  console.log('⚠️  .env file already exists!');
  console.log('   If you want to recreate it, delete the existing file first.');
  process.exit(0);
}

fs.writeFileSync(envPath, envContent);
console.log('✅ .env file created successfully!');
console.log('');
console.log('⚠️  IMPORTANT: Edit .env and change JWT_SECRET to a random secure string!');
console.log('   Minimum 32 characters required.');
console.log('');
console.log('   You can edit it with: notepad .env');

