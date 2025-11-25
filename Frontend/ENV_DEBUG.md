# Debugging Environment Variables in Vite

## Common Issues

### 1. File Location
The `.env` file **MUST** be in the `Frontend` directory (same level as `package.json`), NOT in the `Backend` directory.

```
Frontend/
├── .env          ← HERE!
├── package.json
├── src/
└── ...
```

### 2. Variable Naming
Environment variables **MUST** start with `VITE_` to be exposed to the frontend:

```env
# ✅ Correct
VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
VITE_API_URL=http://localhost:5000/api/v1

# ❌ Wrong (won't work)
GOOGLE_CLIENT_ID=your-client-id
API_URL=http://localhost:5000/api/v1
```

### 3. Restart Required
After adding/changing `.env` variables, you **MUST** restart the Vite dev server:

```bash
# Stop the server (Ctrl+C)
# Then restart
npm run dev
```

### 4. No Quotes Needed
Don't use quotes around values in `.env`:

```env
# ✅ Correct
VITE_GOOGLE_CLIENT_ID=123456789-abc.apps.googleusercontent.com

# ❌ Wrong
VITE_GOOGLE_CLIENT_ID="123456789-abc.apps.googleusercontent.com"
```

## Debugging Steps

### Step 1: Check File Location
```bash
# In Frontend directory
ls -la .env
# Should show the file exists
```

### Step 2: Check File Contents
```bash
# In Frontend directory
cat .env
# Should show VITE_GOOGLE_CLIENT_ID=...
```

### Step 3: Check Browser Console
Open browser DevTools (F12) → Console tab. You should see:
```
Google Client ID: Set
All env vars: { VITE_GOOGLE_CLIENT_ID: "...", ... }
```

### Step 4: Verify in Code
Add this temporarily to see what's being read:
```typescript
console.log('Env check:', {
  clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID,
  allEnv: import.meta.env
})
```

## Quick Fix Checklist

- [ ] `.env` file is in `Frontend/` directory (not `Backend/`)
- [ ] Variable name starts with `VITE_`
- [ ] No quotes around the value
- [ ] Dev server was restarted after adding the variable
- [ ] No typos in variable name
- [ ] File is saved

## Example .env File

Create `Frontend/.env`:

```env
# API Configuration
VITE_API_URL=http://localhost:5000/api/v1

# Google OAuth
VITE_GOOGLE_CLIENT_ID=123456789-abcdefghijklmnop.apps.googleusercontent.com
```

## Still Not Working?

1. **Clear browser cache** and hard refresh (Ctrl+Shift+R)
2. **Delete `.env` and recreate it** (sometimes encoding issues)
3. **Check for hidden characters** - make sure there are no spaces before/after the `=`
4. **Verify the file is actually `.env`** and not `.env.txt` or similar

