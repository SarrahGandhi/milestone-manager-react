# Quick Fix: Render Deployment for User Role Management

## 🚨 Problem
User role changes fail with "Server error" on deployed website.

## ✅ Solution
Missing environment variables on Render. Follow these steps:

---

## Step-by-Step Fix

### 1️⃣ Get Supabase API Key

1. Visit: https://supabase.com/dashboard
2. Select your project
3. Go to **Settings** → **API**
4. Copy the **anon/public** key (NOT the service_role key)

### 2️⃣ Configure Render Environment Variables

1. Go to: https://dashboard.render.com
2. Select your backend service: **milestone-manager-react**
3. Click **Environment** in the left sidebar
4. Click **Add Environment Variable**
5. Add these variables ONE BY ONE:

| Key | Value | Notes |
|-----|-------|-------|
| `SUPABASE_URL` | `https://uvonrgvmptmkgpvqnooa.supabase.co` | Your Supabase project URL |
| `SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ...` | From Step 1 (long string) |
| `JWT_SECRET` | Generate new secret (see below) | DO NOT use default! |
| `NODE_ENV` | `production` | Sets production mode |
| `PORT` | `5001` | Optional (Render uses default) |

### 3️⃣ Generate Secure JWT Secret

**IMPORTANT**: Generate a NEW secure secret (don't use the default)

**Option A - Using Terminal (Mac/Linux):**
```bash
openssl rand -base64 48
```

**Option B - Using Node.js:**
```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64'))"
```

**Option C - Online Generator:**
- Visit: https://generate-secret.vercel.app/32
- Or use any secure password generator (min 32 characters)

Copy the generated string and use it as your `JWT_SECRET` value.

### 4️⃣ Save and Deploy

1. Click **Save Changes** in Render
2. Render will automatically redeploy your backend
3. Wait 2-3 minutes for deployment to complete
4. Check the **Logs** tab for success messages:
   ```
   ✅ JWT_SECRET loaded from environment
   ✅ Connected to Supabase successfully
   🚀 Server is running on port 5001
   ```

### 5️⃣ Test Your Fix

1. Visit your deployed website
2. Login as admin
3. Go to **User Management**
4. Try changing a user's role
5. It should work now! ✅

---

## 🔍 Troubleshooting

### ❌ Backend Won't Start

**Error in logs:**
```
❌ FATAL ERROR: SUPABASE_ANON_KEY is not set in environment variables!
```

**Fix:** You forgot to add `SUPABASE_ANON_KEY` in Render. Go back to Step 2.

---

### ❌ "Invalid token" or "Unauthorized" Error

**Cause:** JWT token issues

**Fix:**
1. Make sure `JWT_SECRET` is set in Render
2. Log out and log back in to get a new token
3. Clear browser cache if needed

---

### ❌ "Database connection error"

**Cause:** Wrong Supabase credentials

**Fix:**
1. Double-check `SUPABASE_URL` (should end in `.supabase.co`)
2. Double-check `SUPABASE_ANON_KEY` (should be a long JWT string)
3. Make sure you copied the **anon** key, NOT the **service_role** key

---

### ❌ CORS Error in Browser Console

**Error:**
```
Access to fetch at '...' from origin '...' has been blocked by CORS policy
```

**Fix:**
1. Make sure your Vercel URL is in the CORS whitelist
2. Check `backend/server.js` line 16-24
3. Add your Vercel URL to the `origin` array if missing

---

## ✅ Verification Checklist

Before testing, verify these are all ✅:

- [ ] `SUPABASE_URL` is set in Render
- [ ] `SUPABASE_ANON_KEY` is set in Render (long JWT string)
- [ ] `JWT_SECRET` is set in Render (NOT the default)
- [ ] `NODE_ENV` is set to `production`
- [ ] Backend is deployed and running (check Render logs)
- [ ] Backend health endpoint works: `https://milestone-manager-react.onrender.com/api/health`
- [ ] Frontend config.js has correct backend URL

---

## 🎯 Expected Behavior After Fix

### ✅ User Management Should Work

1. **View users**: See list of all users
2. **Change roles**: Select dropdown works, no errors
3. **Add users**: Can create new users with any role
4. **Delete users**: Can remove users (except yourself)

### ✅ Backend Logs Should Show

```
2024-10-27T10:00:00.000Z - PUT /api/auth/users/abc123/role
=== Update User Role Request ===
User ID to update: abc123
New role: admin
Requesting user: xyz789 admin
Attempting to update user in database...
User role updated successfully: abc123 admin
```

---

## 📞 Still Having Issues?

1. **Check Render Logs**
   - Go to Render dashboard → Your service → Logs
   - Look for error messages
   - Share the error if you need help

2. **Check Browser Console**
   - Press F12 in browser
   - Go to Console tab
   - Look for red error messages
   - Check Network tab for failed requests

3. **Verify Environment Variables**
   - Run this command locally to test:
     ```bash
     cd backend
     npm run check-env
     ```
   - This will validate all your environment variables

4. **Test Backend Health**
   - Visit: `https://milestone-manager-react.onrender.com/api/health`
   - Should return: `{"status":"OK","database":"Connected"}`

---

## 🎓 Understanding the Fix

**Why did this happen?**

Your application uses Supabase as the database. The backend needs credentials to connect to Supabase:
- `SUPABASE_URL` - where your database is located
- `SUPABASE_ANON_KEY` - authentication key to access it

Without these, the backend can't read or write to the database, so user role changes fail.

**Why does it work locally?**

Your local `.env` file has these values, but Render doesn't have access to your local files. You must set them manually in the Render dashboard.

**Why the JWT_SECRET?**

JWT (JSON Web Tokens) are used for user authentication. The secret key is used to sign and verify these tokens. Without it, users can't log in or perform authenticated actions.

---

## 📚 Additional Resources

- [Render Environment Variables Docs](https://render.com/docs/environment-variables)
- [Supabase API Keys Guide](https://supabase.com/docs/guides/api/api-keys)
- [Full Deployment Guide](./DEPLOYMENT_GUIDE.md)

