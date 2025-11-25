# Frontend-Backend Integration Guide

## Setup Steps

### 1. Install Backend Dependencies

```bash
cd Backend
npm install
```

This installs the `google-auth-library` package needed for Google OAuth.

### 2. Configure Frontend Environment

Create a `.env` file in the `Frontend` directory:

```env
# API Configuration
VITE_API_URL=http://localhost:5000/api/v1

# Google OAuth Client ID (get from Google Cloud Console)
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

**Important**: The `VITE_` prefix is required for Vite to expose these variables to the frontend.

### 3. Set Up Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a project or select existing one
3. Enable Google+ API
4. Create OAuth 2.0 credentials:
   - Type: Web application
   - Authorized JavaScript origins: `http://localhost:5173`
   - Authorized redirect URIs: `http://localhost:5173`
5. Copy the Client ID
6. Add to both:
   - Frontend `.env`: `VITE_GOOGLE_CLIENT_ID=...`
   - Backend `.env`: `GOOGLE_CLIENT_ID=...`

### 4. Start Backend

```bash
cd Backend
npm run dev
```

Backend should run on `http://localhost:5000`

### 5. Start Frontend

```bash
cd Frontend
npm run dev
```

Frontend should run on `http://localhost:5173`

## What's Been Integrated

### ✅ Authentication
- **Login form**: Email/password login
- **Signup form**: User registration
- **Google OAuth**: Sign in/up with Google
- **Token management**: Automatic token storage and refresh
- **User state**: Global auth state with `useAuth` hook

### ✅ API Client
- Centralized API client in `src/lib/api.ts`
- Automatic token injection in requests
- Error handling
- TypeScript types

### ✅ Components Updated
- `LoginForm`: Full authentication with error handling
- `SignupForm`: Registration with validation
- `Header`: Shows user avatar when logged in, logout functionality

## Features

### Login/Signup Flow
1. User enters credentials or clicks Google button
2. Frontend sends request to backend
3. Backend validates and returns tokens
4. Frontend stores tokens in localStorage
5. User is redirected to home page
6. Header shows user avatar

### Google OAuth Flow
1. User clicks "Sign in/up with Google"
2. Google Identity Services opens popup
3. User authenticates with Google
4. Google returns ID token
5. Frontend sends ID token to backend
6. Backend verifies token and creates/logs in user
7. Backend returns JWT tokens
8. Frontend stores tokens and redirects

## API Endpoints Used

- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/google` - Google OAuth
- `GET /api/v1/auth/me` - Get current user
- `POST /api/v1/auth/logout` - Logout

## Testing

### Test Regular Login
1. Go to `/signup`
2. Fill in form and submit
3. Should redirect to home page
4. Header should show your avatar

### Test Google OAuth
1. Make sure `VITE_GOOGLE_CLIENT_ID` is set in Frontend `.env`
2. Make sure `GOOGLE_CLIENT_ID` is set in Backend `.env`
3. Go to `/login` or `/signup`
4. Click "Sign in/up with Google"
5. Complete Google authentication
6. Should redirect to home page

## Troubleshooting

### "Google button not showing"
- Check that Google Identity Services script is loaded (check browser console)
- Verify `VITE_GOOGLE_CLIENT_ID` is set correctly
- Check browser console for errors

### "Network error" or CORS issues
- Make sure backend is running on `http://localhost:5000`
- Check `CORS_ORIGIN` in backend `.env` matches frontend URL
- Verify `VITE_API_URL` in frontend `.env`

### "Authentication failed"
- Check backend logs for errors
- Verify `GOOGLE_CLIENT_ID` in backend `.env`
- Make sure Google OAuth credentials are correct

### "Token not found" errors
- Clear localStorage and try logging in again
- Check browser DevTools > Application > Local Storage

## Next Steps

After authentication works, you can:
1. Add protected routes (redirect to login if not authenticated)
2. Implement room creation/joining
3. Add WebSocket connection for real-time collaboration
4. Add code execution functionality

## File Structure

```
Frontend/
├── src/
│   ├── lib/
│   │   ├── api.ts          # API client
│   │   └── utils.ts
│   ├── hooks/
│   │   └── useAuth.ts      # Authentication hook
│   ├── components/
│   │   ├── login-form.tsx  # Updated with API integration
│   │   ├── signup-form.tsx # Updated with API integration
│   │   └── Header.tsx      # Updated with user display
│   └── ...
├── .env                    # Frontend environment variables
└── index.html              # Updated with Google script
```

