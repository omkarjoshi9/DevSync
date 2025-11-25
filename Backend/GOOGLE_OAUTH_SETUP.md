# Google OAuth Setup Guide

## Backend Setup

### 1. Get Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable **Google+ API**:
   - Go to "APIs & Services" > "Library"
   - Search for "Google+ API" and enable it
4. Create OAuth 2.0 credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - Choose "Web application"
   - Add authorized JavaScript origins:
     - `http://localhost:5173` (for development)
     - Your production domain (for production)
   - Add authorized redirect URIs:
     - `http://localhost:5173` (for development)
     - Your production domain (for production)
5. Copy the **Client ID** and **Client Secret**

### 2. Add to .env

Add these to your `.env` file:

```env
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
```

### 3. Install Dependencies

The backend already includes `google-auth-library`. If you need to reinstall:

```bash
npm install google-auth-library
```

## Frontend Setup

### 1. Install Google Identity Services

Add this script to your `index.html`:

```html
<script src="https://accounts.google.com/gsi/client" async defer></script>
```

### 2. Add Google OAuth Button Handler

Update your login/signup forms to handle Google OAuth. The frontend needs to:

1. Load Google Identity Services
2. Initialize the Google Sign-In button
3. Get the ID token from Google
4. Send it to your backend at `/api/v1/auth/google`

### Example Frontend Implementation

```typescript
// In your login/signup form component
const handleGoogleSignIn = () => {
  // Initialize Google Sign-In
  window.google.accounts.id.initialize({
    client_id: 'YOUR_GOOGLE_CLIENT_ID',
    callback: handleCredentialResponse,
  });

  window.google.accounts.id.renderButton(
    document.getElementById('google-signin-button'),
    { theme: 'outline', size: 'large' }
  );
};

const handleCredentialResponse = async (response: any) => {
  try {
    const res = await fetch('http://localhost:5000/api/v1/auth/google', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ idToken: response.credential }),
    });

    const data = await res.json();
    
    if (data.success) {
      // Store tokens
      localStorage.setItem('accessToken', data.data.accessToken);
      localStorage.setItem('refreshToken', data.data.refreshToken);
      
      // Redirect to home or dashboard
      window.location.href = '/';
    }
  } catch (error) {
    console.error('Google sign-in failed:', error);
  }
};
```

## Testing

1. Make sure your backend has `GOOGLE_CLIENT_ID` set
2. Start the backend: `npm run dev`
3. Test the endpoint:
   ```bash
   curl -X POST http://localhost:5000/api/v1/auth/google \
     -H "Content-Type: application/json" \
     -d '{"idToken":"test-token"}'
   ```
   (This will fail with invalid token, but confirms the endpoint is working)

## Troubleshooting

### "Google OAuth is not configured"
- Make sure `GOOGLE_CLIENT_ID` is set in your `.env` file
- Restart the backend server after adding it

### "Invalid Google token"
- Make sure you're sending a valid ID token from Google
- Check that the Client ID matches between frontend and backend

### CORS errors
- Make sure your frontend URL is in the authorized origins in Google Cloud Console
- Check CORS_ORIGIN in backend `.env` matches your frontend URL

## Security Notes

- Never expose your `GOOGLE_CLIENT_SECRET` in the frontend
- The frontend only needs the `GOOGLE_CLIENT_ID`
- The backend verifies the ID token server-side
- Always use HTTPS in production

