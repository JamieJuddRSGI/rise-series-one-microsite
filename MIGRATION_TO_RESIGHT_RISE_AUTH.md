# Migration to resight-rise-auth Endpoint

## ✅ Changes Made

All code has been updated to use the new `resight-rise-auth` endpoint instead of `make-server-93da04dc`.

### Frontend Changes
1. ✅ **`src/utils/auth.ts`** - Updated `API_BASE` to use `resight-rise-auth`
2. ✅ **`src/components/LoginPage.tsx`** - Updated direct fetch URL to use `resight-rise-auth`

### Backend Changes
3. ✅ **`supabase/functions/resight-rise-auth/index.tsx`** - Created new function with routes using function name prefix:
   - `/resight-rise-auth/health` (was `/make-server-93da04dc/health` in old function)
   - `/resight-rise-auth/auth/login` (was `/make-server-93da04dc/auth/login` in old function)
   - `/resight-rise-auth/auth/check` (was `/make-server-93da04dc/auth/check` in old function)
   - `/resight-rise-auth/auth/logout` (was `/make-server-93da04dc/auth/logout` in old function)
   
   **Important**: Supabase Edge Functions require routes to be prefixed with the function name. So:
   - Request URL: `https://PROJECT_ID.supabase.co/functions/v1/resight-rise-auth/auth/login`
   - Route in code should be: `/resight-rise-auth/auth/login` (includes function name prefix)

### Security
4. ✅ **`vercel.json`** - CSP already allows `https://*.supabase.co` so no changes needed

## 📋 Next Steps

### 1. Deploy the Updated Supabase Function

Make sure your `resight-rise-auth` function has the updated code from `supabase/functions/index.tsx`:

```bash
# Navigate to your project directory
cd supabase/functions

# Deploy the resight-rise-auth function
supabase functions deploy resight-rise-auth
```

### 2. Verify the Function is Working

Test the health endpoint:
```bash
curl https://awkvqbmlglicoddphiyc.supabase.co/functions/v1/resight-rise-auth/health
```

Expected response:
```json
{"status":"ok"}
```

### 3. Test Authentication Flow

1. **Test Login**: Try logging in with valid credentials
2. **Test Session Check**: Verify the session check endpoint works
3. **Test Logout**: Verify logout works correctly

### 4. Deploy Frontend Changes

Deploy the updated frontend code to Vercel:
```bash
# Build and deploy
npm run build
# Then push to your git repository (Vercel will auto-deploy)
```

### 5. Verify Everything Works

After deployment:
- ✅ Login works
- ✅ Session persistence works
- ✅ Logout works
- ✅ No console errors
- ✅ Dashlane no longer flags as phishing

## 🔍 What Changed

### Before:
- Endpoint: `https://awkvqbmlglicoddphiyc.supabase.co/functions/v1/make-server-93da04dc/auth/login`
- Suspicious random hash in path: `make-server-93da04dc`

### After:
- Endpoint: `https://awkvqbmlglicoddphiyc.supabase.co/functions/v1/resight-rise-auth/auth/login`
- Clean, descriptive function name: `resight-rise-auth`

## ⚠️ Important Notes

1. **Backend Routes**: Supabase Edge Functions require routes to be prefixed with the function name. So routes should include the function name prefix like `/resight-rise-auth/auth/login`, not just `/auth/login`. This matches how the old function worked with `/make-server-93da04dc/auth/login`.

2. **CORS**: Make sure your CORS configuration in `supabase/functions/index.tsx` includes your frontend domain

3. **Old Function**: You can keep the old `make-server-93da04dc` function running during migration for safety, then delete it once everything is verified

4. **Environment Variables**: If you have any environment-specific configurations, make sure they're set for the new function

## 🐛 Troubleshooting

If you encounter issues:

1. **404 Errors**: Verify the function is deployed correctly
   ```bash
   supabase functions list
   ```

2. **CORS Errors**: Check that your frontend domain is in the CORS allowlist in `index.tsx`

3. **Authentication Fails**: Verify the function code matches what's in your repo

4. **Session Issues**: Check that cookies are being set correctly (same domain/CORS settings)
