# Same-Domain Auth Proxy — Fixing Cross-Domain Credential Submission

## The Problem

Currently, when a user logs in on your site (e.g. `privatecapital.resightindia.com`), the browser sends their email and password directly to a different domain (`awkvqbmlglicoddphiyc.supabase.co`). This cross-domain credential submission is the classic pattern that phishing detectors like Dashlane flag: a form on Domain A sending passwords to Domain B.

```
CURRENT FLOW (flagged as suspicious):

Browser (privatecapital.resightindia.com)
   │
   │  POST email + password
   │
   └──► awkvqbmlglicoddphiyc.supabase.co  ← different domain
```

## The Solution

Use Vercel rewrites to proxy auth requests through your own domain. The browser never sees the Supabase URL — it thinks it's talking to your own server.

```
NEW FLOW (same domain):

Browser (privatecapital.resightindia.com)
   │
   │  POST email + password
   │
   └──► privatecapital.resightindia.com/api/auth/login  ← same domain
          │
          │  (Vercel proxies behind the scenes)
          │
          └──► awkvqbmlglicoddphiyc.supabase.co/functions/v1/resight-rise-auth/auth/login
```

## What Needs to Change

There are 3 files to change, plus 1 config file to update.

---

### Step 1: Update `vercel.json` — Add Rewrite Rules

Add a `rewrites` section to proxy `/api/auth/*` requests to Supabase.

**File:** `vercel.json`

**Current:**
```json
{
  "headers": [ ... ]
}
```

**Change to:**
```json
{
  "rewrites": [
    {
      "source": "/api/auth/:path*",
      "destination": "https://awkvqbmlglicoddphiyc.supabase.co/functions/v1/resight-rise-auth/auth/:path*"
    },
    {
      "source": "/api/health",
      "destination": "https://awkvqbmlglicoddphiyc.supabase.co/functions/v1/resight-rise-auth/health"
    }
  ],
  "headers": [ ... existing headers stay the same ... ]
}
```

This tells Vercel: "When the browser requests `/api/auth/login`, forward it to Supabase behind the scenes and return the response."

---

### Step 2: Update `src/utils/auth.ts` — Point to Same-Domain Proxy

Change `API_BASE` to use the local proxy path instead of the direct Supabase URL.

**File:** `src/utils/auth.ts`

**Current (line 3):**
```typescript
const API_BASE = `https://${projectId}.supabase.co/functions/v1/resight-rise-auth`;
```

**Change to:**
```typescript
const API_BASE = '/api';
```

Also remove the `Authorization` header and `credentials: 'include'` from the fetch calls, since the request now stays on the same domain. The rewrite handles forwarding.

**Current `checkAuth` (lines 45-58):**
```typescript
const headers: HeadersInit = {
  'Authorization': `Bearer ${publicAnonKey}`,
};
if (storedToken) {
  headers['X-Session-Token'] = storedToken;
}
const response = await fetch(`${API_BASE}/auth/check`, {
  method: 'GET',
  headers,
  credentials: 'include',
});
```

**Change to:**
```typescript
const headers: HeadersInit = {};
if (storedToken) {
  headers['X-Session-Token'] = storedToken;
}
const response = await fetch(`${API_BASE}/auth/check`, {
  method: 'GET',
  headers,
});
```

**Current `logout` (lines 83-89):**
```typescript
const response = await fetch(`${API_BASE}/auth/logout`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${publicAnonKey}`,
  },
  credentials: 'include',
});
```

**Change to:**
```typescript
const response = await fetch(`${API_BASE}/auth/logout`, {
  method: 'POST',
});
```

You can also remove the unused imports at the top:
```typescript
// REMOVE this line:
import { projectId, publicAnonKey } from './supabase/info';
```

---

### Step 3: Update `src/components/LoginPage.tsx` — Point to Same-Domain Proxy

Change the login fetch to use the local proxy.

**File:** `src/components/LoginPage.tsx`

**Current (lines 22-33):**
```typescript
const response = await fetch(
  `https://${projectId}.supabase.co/functions/v1/resight-rise-auth/auth/login`,
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${publicAnonKey}`,
    },
    credentials: 'include',
    body: JSON.stringify({ email, password }),
  }
);
```

**Change to:**
```typescript
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ email, password }),
});
```

Also remove the unused import at the top:
```typescript
// REMOVE this line:
import { projectId, publicAnonKey } from '../utils/supabase/info';
```

---

### Step 4: Update `vercel.json` CSP — Allow Same-Domain Only

Since auth requests now stay on the same domain, you can tighten the CSP `connect-src` directive. However, keep the Supabase entries in case other parts of the app use Supabase directly.

No changes needed here unless you want to tighten it later.

---

## Important: Authorization Header

The Supabase `Authorization: Bearer <anon_key>` header is currently sent from the browser. With the rewrite proxy, Vercel forwards the request as-is, so the Supabase function will no longer receive this header unless you add it.

**Two options:**

**Option A (Simpler):** Remove the Authorization check from the Supabase Edge Function. Since requests are now proxied through your own domain, the function is effectively private to your Vercel deployment.

**Option B (More Secure):** Add the Authorization header in the Supabase Edge Function itself, or configure it as a Vercel environment variable and inject it via middleware. This is more complex and probably not needed for this use case.

For now, **Option A is recommended**. The Supabase function already has rate limiting and session management, and the rewrite proxy means the function URL isn't exposed in the browser.

---

## Testing

After making these changes:

1. **Build locally:**
   ```bash
   npm run build
   ```

2. **Test the proxy endpoint:**
   After deploying to Vercel, test:
   ```bash
   curl https://privatecapital.resightindia.com/api/health
   ```
   Should return: `{"status":"ok"}`

3. **Test login:**
   Open the site, go to login, and verify:
   - Browser DevTools Network tab shows requests going to `/api/auth/login` (same domain)
   - No requests to `supabase.co` visible in the Network tab
   - Login works as before

4. **Test with Dashlane:**
   The phishing warning should be gone since credentials never leave your domain from the browser's perspective.

---

## Summary of Changes

| File | Change |
|---|---|
| `vercel.json` | Add `rewrites` section to proxy `/api/auth/*` to Supabase |
| `src/utils/auth.ts` | Change `API_BASE` to `/api`, remove Authorization header |
| `src/components/LoginPage.tsx` | Change fetch URL to `/api/auth/login`, remove Authorization header |
| Supabase Edge Function | Consider removing Authorization check (optional) |

## Risks

- **Vercel rewrite latency**: Adds a small amount of latency (~10-50ms) since requests go through Vercel's proxy. Negligible for auth operations.
- **Vercel free tier limits**: Rewrites count towards serverless function invocations on some plans. Check your Vercel plan.
- **Cookie behavior**: Since requests are now same-domain, cookies should work more reliably (no more Safari cross-domain cookie issues). You may be able to simplify the localStorage fallback logic later.
