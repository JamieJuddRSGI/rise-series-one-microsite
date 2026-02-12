# Production Readiness Guide

**Last Updated:** November 17, 2025

This document consolidates all steps required to transition the Lawyer Rankings site from development to production. Follow this checklist in order to ensure a secure, production-ready deployment.

---

## Table of Contents

1. [Overview](#overview)
2. [Critical: Remove Dev Features](#critical-remove-dev-features)
3. [Authentication & Security](#authentication--security)
4. [Import Real Data](#import-real-data)
5. [Configuration Updates](#configuration-updates)
6. [Deployment Steps](#deployment-steps)
7. [Testing Checklist](#testing-checklist)
8. [Post-Deployment](#post-deployment)

---

## Overview

### Current Authentication System

**Method:** Email + Password authentication with secure session management

**Features:**
- SHA-256 password hashing
- HttpOnly secure cookies
- 24-hour session expiration
- Rate limiting (5 attempts / 15 minutes)
- IP-based and email-based rate limiting
- Audit logging

**Protected Pages:**
- All pages except the splash page require authentication
- Login required to access: Rankings, Profiles, Comparison, Insights, Individual Lawyer Pages

---


## Authentication & Security

### 1. Remove/Update Test Credentials

**⚠️ Current Issue:** Three test accounts exist with publicly-known passwords.

**File:** `/supabase/functions/server/allowlist-manager.tsx`

**Current test accounts (lines 17-30):**
- `user@example.com` / `password123`
- `admin@example.com` / `admin123`
- `test@example.com` / `test123`

**Option A - Remove Test Accounts (Recommended):**
```typescript
// CHANGE FROM:
const DEFAULT_USERS: UserCredentials[] = [
  {
    email: 'user@example.com',
    passwordHash: hashPassword('password123'),
  },
  {
    email: 'admin@example.com',
    passwordHash: hashPassword('admin123'),
  },
  {
    email: 'test@example.com',
    passwordHash: hashPassword('test123'),
  },
];

// TO:
const DEFAULT_USERS: UserCredentials[] = [];
```

**Option B - Change Test Passwords:**
```typescript
const DEFAULT_USERS: UserCredentials[] = [
  {
    email: 'user@company.com',
    passwordHash: hashPassword('NewSecurePassword123!'),
  },
  {
    email: 'admin@company.com',
    passwordHash: hashPassword('AnotherSecurePass456!'),
  },
];
```

### 2. Add Production Users

**In the same file** (`/supabase/functions/server/allowlist-manager.tsx`), at the bottom before `logUserInfo()`:

```typescript
// Add your production users here
addUser('yourname@company.com', 'SecurePassword123!');
addUser('colleague@company.com', 'AnotherSecurePass456!');
addUser('client@organization.com', 'ClientPassword789!');
```

**Password Requirements:**
- Minimum 12 characters
- Mix of uppercase and lowercase
- Include numbers
- Include special characters
- Unique per user
- Store securely in password manager

### 3. Update Test Credentials Display in Login Page **DONE**

**⚠️ Current Issue:** Login page displays test credentials to users.

**File:** `/components/LoginPage.tsx` (lines ~200-216)

**Remove or update the "Test Credentials" info box: DONE**

```typescript
// DELETE OR UPDATE THIS SECTION:
<div style={{
  backgroundColor: '#EBF5FF',
  borderLeft: '4px solid #3B82F6',
  padding: '12px 16px',
  borderRadius: '4px',
  marginTop: '12px'
}}>
  <div style={{
    color: '#1E40AF',
    fontWeight: 500,
    fontSize: '13px',
    marginBottom: '6px'
  }}>Test Credentials Available:</div>
  <div style={{
    color: '#1E3A8A',
    fontSize: '12px'
  }}>
    <p>user@example.com / password123</p>
    <p>admin@example.com / admin123</p>
    <p>test@example.com / test123</p>
  </div>
</div>
```

**Replace with:**
```typescript
<div style={{
  backgroundColor: '#F3F4F6',
  borderLeft: '4px solid #6B7280',
  padding: '12px 16px',
  borderRadius: '4px',
  marginTop: '12px'
}}>
  <div style={{
    color: '#374151',
    fontWeight: 500,
    fontSize: '13px',
    marginBottom: '6px'
  }}>Need Access?</div>
  <div style={{
    color: '#4B5563',
    fontSize: '12px'
  }}>
    <p>Contact your administrator for login credentials.</p>
  </div>
</div>
```

### 4. Environment Variables (Optional)

For managing users without code changes, set `USER_CREDENTIALS` in Supabase Dashboard:

**Format:**
```
USER_CREDENTIALS=email1@company.com:password1,email2@company.com:password2
```

**To Set:**
1. Go to Supabase Dashboard
2. Navigate to: Edge Functions → Environment Variables
3. Add new variable: `USER_CREDENTIALS`
4. Enter value with comma-separated email:password pairs

---

## Import Real Data

### Current State

**File:** `/data/siteData.ts`

Currently contains **mock/sample data** for demonstration purposes:
- 10 sample lawyer profiles
- Sample firms, specialties, scores
- Placeholder bio content
- Generic achievements and recent cases
- Sample methodology and insights articles

### Steps to Import Real Data

#### 1. Prepare Your Data

Your data should match the TypeScript interfaces defined in `siteData.ts`:

**Lawyer Interface Requirements:**
- `id`: Unique identifier (e.g., 'lawyer-1')
- `name`: Full name
- `firm`: Law firm name
- `specialty`: Array of practice areas
- `location`: City/region
- `jobTitle`: Position at firm
- `totalScore`: Overall score (0-10)
- `reputationScore`, `instructionScore`, `sophisticationScore`, `experienceScore`: Category scores (0-10)
- `breakdown`: Object containing all 19 sub-indicator scores
- `clientReferences`: Number of references
- `bio`: Professional biography (string)
- `achievements`: Array of achievement strings
- `recentCases`: Array of objects with `title` and `url`

**Article Interface Requirements:**
- `id`: Unique identifier
- `title`: Article title
- `category`: Either 'methodology' or 'insights'
- `author`: Author name
- `date`: Date string (e.g., 'January 15, 2025')
- `content`: Array of paragraph strings
- `summary`: Brief summary string

#### 2. Update `/data/siteData.ts`

**Replace the `lawyers` array (starting at line 83):**

```typescript
export const lawyers: Lawyer[] = [
  // Your real lawyer data here
  {
    id: 'lawyer-001',
    name: 'Your Real Lawyer Name',
    firm: 'Actual Law Firm',
    specialty: ['Private Equity', 'M&A'],
    location: 'Mumbai',
    jobTitle: 'Senior Partner',
    totalScore: 9.2,
    reputationScore: 9.5,
    instructionScore: 9.0,
    sophisticationScore: 9.3,
    experienceScore: 9.1,
    breakdown: {
      // All 19 sub-scores
      peerRecommendations: 9.6,
      directoryRankings: 9.5,
      mediaProfile: 9.4,
      dealVolume: 9.2,
      dealValue: 9.0,
      clients: 8.8,
      aiAndTechnology: 9.5,
      dataDrivenPractice: 9.3,
      pricingModels: 9.1,
      valueAdds: 9.2,
      numberOfReferences: 9.0,
      expertise: 9.3,
      service: 9.2,
      commerciality: 9.1,
      communication: 9.0,
      eq: 8.9,
      strategy: 9.2,
      network: 9.1,
      leadership: 9.0,
    },
    clientReferences: 45,
    bio: 'Real professional biography...',
    achievements: [
      'Real achievement 1',
      'Real achievement 2',
      // ...
    ],
    recentCases: [
      {
        title: 'Actual Deal Name',
        url: 'https://actual-source.com/deal'
      },
      // ...
    ]
  },
  // ... more lawyers
];
```

**Replace the `articles` array:**

```typescript
export const articles: Article[] = [
  {
    id: 'methodology',
    title: 'Your Actual Methodology Title',
    category: 'methodology',
    author: 'Your Name',
    date: 'January 15, 2025',
    content: [
      'Real methodology paragraph 1...',
      'Real methodology paragraph 2...',
      // ...
    ],
    summary: 'Real summary of your methodology...'
  },
  // ... more articles
];
```

#### 3. Update Report Metadata

At the bottom of `siteData.ts`, update the `reportMetadata` object with your actual report details:

```typescript
export const reportMetadata = {
  title: 'Your Actual Report Title',
  year: '2025',
  region: 'India',
  totalLawyers: 50, // Your actual number
  totalFirms: 25,   // Your actual number
  description: 'Your actual report description...'
};
```

#### 4. Validate Data Import

After updating:
1. Check TypeScript has no errors
2. Start dev server and verify pages load correctly
3. Check all lawyer profiles display properly
4. Verify scores calculate correctly
5. Test comparison functionality with real data
6. Check all links in recent cases work

---

## Configuration Updates

### 1. Update Supabase Configuration

**File:** `/utils/supabase/info.tsx`

Replace with your production Supabase project details:

```typescript
export const projectId = 'YOUR_PRODUCTION_PROJECT_ID';
export const publicAnonKey = 'YOUR_PRODUCTION_ANON_KEY';
```

**Where to find these:**
1. Go to Supabase Dashboard
2. Select your production project
3. Go to Settings → API
4. Copy: Project URL (extract ID) and anon/public key

### 2. CORS Configuration (if needed)

**File:** `/supabase/functions/server/index.tsx` (lines 15-25)

For production, consider restricting CORS origin:

```typescript
// CURRENT (allows all origins):
app.use(
  "/*",
  cors({
    origin: "*",  // ← Change this in production
    // ...
  }),
);

// PRODUCTION (restrict to your domain):
app.use(
  "/*",
  cors({
    origin: "https://yourdomain.com",  // Your actual domain
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length", "Set-Cookie"],
    credentials: true,
    maxAge: 600,
  }),
);
```

---

## Deployment Steps

### 1. Deploy Backend (Supabase Edge Function)

```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref YOUR_PROJECT_ID

# Deploy the server function
supabase functions deploy make-server-93da04dc

# Verify deployment
curl https://YOUR_PROJECT_ID.supabase.co/functions/v1/make-server-93da04dc/health
```

**Expected response:**
```json
{"status":"ok"}
```

### 2. Set Environment Variables (if using)

In Supabase Dashboard → Edge Functions → Environment Variables:

```
USER_CREDENTIALS=user1@company.com:SecurePass1!,user2@company.com:SecurePass2!
```

### 3. Deploy Frontend

**Build the application:**
```bash
npm run build
```

**Deploy to your hosting platform:**
- Vercel: `vercel --prod`
- Netlify: `netlify deploy --prod`
- Other: Follow platform-specific instructions

### 4. Verify Production Environment

1. Open production URL
2. Verify splash page loads
3. Try accessing protected page (should redirect to login)
4. Login with production credentials
5. Verify all features work
6. Check browser console for errors
7. Test logout functionality

---

## Testing Checklist

### Pre-Deployment Testing

#### Dev Feature Removal
- [ ] Search for "devBypass" returns 0 results
- [ ] Search for "🚧" returns 0 results
- [ ] Search for "onBypassAuth" returns 0 results
- [ ] No bypass button visible on splash page
- [ ] App.tsx has no dev bypass logic

#### Authentication & Security
- [ ] Test accounts removed or passwords changed
- [ ] Login page doesn't show test credentials
- [ ] Production users can login
- [ ] Wrong password shows error
- [ ] Unknown email shows error
- [ ] Rate limiting works (5 attempts)
- [ ] Session persists across refreshes
- [ ] Logout clears session

#### Data Import
- [ ] All lawyer profiles display correctly
- [ ] Scores calculate and display properly
- [ ] Rankings page shows correct order
- [ ] Individual profiles have correct data
- [ ] Comparison page works with real data
- [ ] All links in recent cases are valid
- [ ] Articles display correctly
- [ ] No placeholder/mock data visible

#### Protected Routes
- [ ] Cannot access rankings without login
- [ ] Cannot access profiles without login
- [ ] Cannot access insights without login
- [ ] Cannot access comparison without login
- [ ] Splash page accessible without login
- [ ] Login redirect works correctly

#### Error Handling
- [ ] Network errors handled gracefully
- [ ] Invalid credentials show user-friendly error
- [ ] Rate limit shows appropriate message
- [ ] Session expiry redirects to login
- [ ] No console errors on any page

### Post-Deployment Testing

- [ ] Production URL loads correctly
- [ ] HTTPS is enforced
- [ ] Login works with production credentials
- [ ] All pages render correctly
- [ ] Navigation works as expected
- [ ] Responsive design works on mobile
- [ ] Browser back/forward buttons work
- [ ] Refresh maintains session
- [ ] Logout works and redirects properly

---

## Post-Deployment

### Monitoring

**Check regularly:**
- Server logs in Supabase Dashboard
- Failed login attempts (audit logs)
- Rate limit triggers
- Session creation/expiry patterns
- Any error patterns

**Supabase Dashboard → Edge Functions → Logs**

### User Management

**To add new users after deployment:**

1. **Via Code** (requires redeployment):
   - Edit `/supabase/functions/server/allowlist-manager.tsx`
   - Add `addUser('email@company.com', 'password')`
   - Redeploy: `supabase functions deploy make-server-93da04dc`

2. **Via Environment Variable** (no redeployment):
   - Go to Supabase Dashboard
   - Update `USER_CREDENTIALS` variable
   - Format: `email1:pass1,email2:pass2`
   - Changes take effect immediately

### Documentation

Create and maintain:
- [ ] User guide (how to login, navigate site)
- [ ] Admin guide (how to add users, update data)
- [ ] Troubleshooting guide (common issues)
- [ ] Contact information for support
- [ ] Password reset process (if applicable)

### Security Best Practices

- [ ] Store all passwords in secure password manager
- [ ] Never commit passwords to git
- [ ] Rotate passwords periodically
- [ ] Monitor for suspicious login attempts
- [ ] Keep backup of user credentials in secure location
- [ ] Document who has access
- [ ] Review and remove inactive users

### Backup

**Critical files to backup:**
- `/data/siteData.ts` - All your lawyer data
- `/supabase/functions/server/allowlist-manager.tsx` - User credentials setup
- Environment variables list
- Deployment configuration
- Supabase project details

---

## Summary Checklist

### Code Changes
- [ ] ✅ Dev bypass removed from App.tsx
- [ ] ✅ Dev bypass removed from SplashPage.tsx
- [ ] ✅ Test credentials removed from allowlist-manager.tsx
- [ ] ✅ Test credentials display removed from LoginPage.tsx
- [ ] ✅ Production users added to allowlist-manager.tsx
- [ ] ✅ Real data imported to siteData.ts
- [ ] ✅ Report metadata updated
- [ ] ✅ Supabase config updated in info.tsx

### Configuration
- [ ] ✅ Server deployed to Supabase
- [ ] ✅ Environment variables set (if using)
- [ ] ✅ CORS configured for production domain
- [ ] ✅ Health check endpoint responds

### Testing Complete
- [ ] ✅ All authentication tests pass
- [ ] ✅ Protected routes require login
- [ ] ✅ All pages display real data
- [ ] ✅ No console errors
- [ ] ✅ Mobile responsive

### Documentation
- [ ] ✅ User guide created
- [ ] ✅ Admin guide created
- [ ] ✅ Passwords documented securely
- [ ] ✅ Backup created

---

## 🎉 Ready for Production!

Once all checklist items are complete, your Lawyer Rankings site is production-ready.

**Need Help?**
- Review `/guidelines/Guidelines.md` for design system details
- Check Supabase logs for backend issues
- Verify all environment variables are set correctly

**Good luck with your deployment!** 🚀
