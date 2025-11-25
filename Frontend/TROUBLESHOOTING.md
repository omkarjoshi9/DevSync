# Troubleshooting White Screen

## Quick Fixes

### 1. Check Browser Console
Open browser DevTools (F12) and check the Console tab for errors. Common issues:
- Import errors
- TypeScript errors
- API connection errors

### 2. Check Terminal
Look at the terminal where you ran `npm run dev` for compilation errors.

### 3. Clear Cache and Restart
```bash
# Stop the dev server (Ctrl+C)
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### 4. Check Environment Variables
Make sure `.env` file exists in Frontend directory:
```env
VITE_API_URL=http://localhost:5000/api/v1
VITE_GOOGLE_CLIENT_ID=your-client-id (optional)
```

### 5. Common Issues

#### Issue: "Cannot find module '@/hooks/useAuth'"
**Fix**: Make sure the file exists at `Frontend/src/hooks/useAuth.ts`

#### Issue: "useNavigate must be used within Router"
**Fix**: All pages using `useAuth` must be inside `<Router>` in App.tsx

#### Issue: API connection errors
**Fix**: Make sure backend is running on port 5000

#### Issue: TypeScript errors
**Fix**: Run `npm run build` to see detailed TypeScript errors

## Debug Steps

1. **Check if React is loading**:
   - Open browser console
   - Look for React errors
   - Check Network tab for failed requests

2. **Check if components are rendering**:
   - Add `console.log('Component rendered')` in App.tsx
   - Check if it appears in console

3. **Check API connection**:
   - Open Network tab in DevTools
   - Try accessing `http://localhost:5000/api/health`
   - Should return JSON response

4. **Check for syntax errors**:
   - Look for red errors in terminal
   - Check for missing imports
   - Verify all files are saved

## Still Not Working?

1. Check the exact error message in browser console
2. Check terminal for compilation errors
3. Verify all files are saved correctly
4. Try restarting both frontend and backend servers

