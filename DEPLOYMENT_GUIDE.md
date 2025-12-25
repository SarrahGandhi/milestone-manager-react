# Deployment Guide - Milestone Manager

## Critical Environment Variables for Production

Your deployment is failing because **required environment variables are not set**. Follow these steps to fix it:

## For Render.com Deployment

### Step 1: Get Your Supabase Credentials

1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Select your project: `https://uvonrgvmptmkgpvqnooa.supabase.co`
3. Navigate to **Settings** → **API**
4. Copy the following:
   - **Project URL** (e.g., `https://uvonrgvmptmkgpvqnooa.supabase.co`)
   - **anon/public key** (this is your `SUPABASE_ANON_KEY`)

### Step 2: Set Environment Variables on Render

1. Go to your Render dashboard: https://dashboard.render.com
2. Select your backend service: `milestone-manager-react`
3. Navigate to **Environment** tab
4. Add the following environment variables:

```
PORT=5001
NODE_ENV=production
JWT_SECRET=your_secure_random_jwt_secret_key_min_32_characters
SUPABASE_URL=https://uvonrgvmptmkgpvqnooa.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key_from_step_1
```

### Step 3: Generate a Secure JWT Secret

**IMPORTANT**: Do NOT use the default JWT secret in production!

Generate a secure random string (at least 32 characters). You can use:

```bash
# On Mac/Linux
openssl rand -base64 32

# Or use an online generator (make sure it's secure)
```

### Step 4: Redeploy

After adding all environment variables:

1. Click **Save Changes** on Render
2. The service will automatically redeploy
3. Wait for deployment to complete (check the logs)

## Verifying the Deployment

### Check Backend Health

Visit your backend URL:
```
https://milestone-manager-react.onrender.com/api/health
```

You should see:
```json
{
  "status": "OK",
  "timestamp": "...",
  "database": "Connected"
}
```

### Check Backend Logs

In Render dashboard:
1. Go to your backend service
2. Click on **Logs**
3. Look for these success messages:
   ```
   ✅ JWT_SECRET loaded from environment
   ✅ Connected to Supabase successfully
   🚀 Server is running on port 5001
   ```

### Common Error Messages

❌ **"SUPABASE_ANON_KEY is not set"**
- Solution: Add `SUPABASE_ANON_KEY` environment variable on Render

❌ **"Invalid token" or "Token expired"**
- Solution: Make sure `JWT_SECRET` is set and matches between deployments

❌ **"Database connection error"**
- Solution: Verify `SUPABASE_URL` and `SUPABASE_ANON_KEY` are correct

## Frontend Configuration

Your frontend is already configured to use the production backend:
```javascript
// src/config.js
const API_BASE_URL = "https://milestone-manager-react.onrender.com/api";
```

Make sure this matches your actual Render backend URL.

## Testing Role Changes After Deployment

1. Login as an admin user
2. Navigate to **User Management** page
3. Try changing a user's role
4. If you get an error:
   - Open browser console (F12)
   - Check the error message
   - Check Render logs for backend errors
   - Verify all environment variables are set

## Security Checklist

- [ ] `JWT_SECRET` is set to a secure random value (NOT the default)
- [ ] `SUPABASE_ANON_KEY` is set correctly
- [ ] `NODE_ENV` is set to `production`
- [ ] Backend URL in frontend config matches your Render URL
- [ ] CORS origins in `backend/server.js` includes your Vercel URL

## Additional Resources

- Render Environment Variables: https://render.com/docs/environment-variables
- Supabase API Keys: https://supabase.com/docs/guides/api/api-keys
- JWT Best Practices: https://auth0.com/blog/a-look-at-the-latest-draft-for-jwt-bcp/

## Need Help?

If you're still experiencing issues:

1. **Check Render Logs**: Look for specific error messages
2. **Check Browser Console**: Check for CORS or network errors
3. **Verify Supabase**: Make sure your Supabase project is active
4. **Test Health Endpoint**: Visit `/api/health` to verify backend is running

## Quick Fix Command

If your backend won't start, check for the fatal error message:
```
❌ FATAL ERROR: SUPABASE_ANON_KEY is not set in environment variables!
```

This means you MUST set the `SUPABASE_ANON_KEY` environment variable on Render before the backend will work.

