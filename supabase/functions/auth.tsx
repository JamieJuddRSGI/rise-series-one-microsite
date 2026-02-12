import { createClient } from 'npm:@supabase/supabase-js@2';
import * as kv from './kv_store.tsx';
import { createHash, randomBytes } from 'node:crypto';
import { verifyCredentials, userExists } from './allowlist-manager.tsx';
import { recordUserActivity } from './user-activity.tsx';
const supabase = createClient(Deno.env.get('SUPABASE_URL'), Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'));
// Constants
const SESSION_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes
// Utility functions
function hashValue(value) {
  return createHash('sha256').update(value).digest('hex');
}
function generateSessionToken() {
  return randomBytes(32).toString('hex');
}
// Rate limiting helpers
async function checkRateLimit(key, maxAttempts, windowMs) {
  const data = await kv.get(`ratelimit:${key}`);
  const now = Date.now();
  if (!data) {
    await kv.set(`ratelimit:${key}`, JSON.stringify({
      count: 1,
      resetAt: now + windowMs
    }));
    return {
      allowed: true,
      remaining: maxAttempts - 1
    };
  }
  const parsed = JSON.parse(data);
  // Reset if window expired
  if (now > parsed.resetAt) {
    await kv.set(`ratelimit:${key}`, JSON.stringify({
      count: 1,
      resetAt: now + windowMs
    }));
    return {
      allowed: true,
      remaining: maxAttempts - 1
    };
  }
  // Check if over limit
  if (parsed.count >= maxAttempts) {
    return {
      allowed: false,
      remaining: 0
    };
  }
  // Increment counter
  parsed.count += 1;
  await kv.set(`ratelimit:${key}`, JSON.stringify(parsed));
  return {
    allowed: true,
    remaining: maxAttempts - parsed.count
  };
}
// Audit logging (without sensitive data)
async function logAuthEvent(event, email, ip, success, metadata) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    event,
    email: hashValue(email),
    ip: hashValue(ip),
    success,
    metadata
  };
  console.log(`[AUTH EVENT] ${JSON.stringify(logEntry)}`);
  // Store in KV for audit trail
  const key = `audit:${Date.now()}:${randomBytes(8).toString('hex')}`;
  await kv.set(key, JSON.stringify(logEntry));
}
// Login with email and password
export async function loginWithEmailPassword(email, password, ip, userAgent) {
  try {
    // Normalize email
    const normalizedEmail = email.toLowerCase().trim();
    // Check rate limit for this IP
    const ipRateLimit = await checkRateLimit(`login:ip:${ip}`, MAX_LOGIN_ATTEMPTS, LOCKOUT_DURATION_MS);
    if (!ipRateLimit.allowed) {
      await logAuthEvent('login', normalizedEmail, ip, false, {
        reason: 'ip_rate_limit'
      });
      return {
        success: false,
        error: 'Too many login attempts. Please try again later.'
      };
    }
    // Check rate limit for this email
    const emailRateLimit = await checkRateLimit(`login:email:${normalizedEmail}`, MAX_LOGIN_ATTEMPTS, LOCKOUT_DURATION_MS);
    if (!emailRateLimit.allowed) {
      await logAuthEvent('login', normalizedEmail, ip, false, {
        reason: 'email_rate_limit'
      });
      return {
        success: false,
        error: 'Too many login attempts for this email. Please try again later.'
      };
    }
    // Check if user exists
    if (!userExists(normalizedEmail)) {
      await logAuthEvent('login', normalizedEmail, ip, false, {
        reason: 'user_not_found'
      });
      return {
        success: false,
        error: 'Invalid email or password.'
      };
    }
    // Verify credentials
    const credentialsValid = verifyCredentials(normalizedEmail, password);
    if (!credentialsValid) {
      await logAuthEvent('login', normalizedEmail, ip, false, {
        reason: 'invalid_password'
      });
      return {
        success: false,
        error: 'Invalid email or password.'
      };
    }
    // Credentials are valid - create session
    const sessionToken = generateSessionToken();
    const hashedSessionToken = hashValue(sessionToken);
    const sessionData = {
      email: normalizedEmail,
      createdAt: Date.now(),
      expiresAt: Date.now() + SESSION_EXPIRY_MS,
      ip
    };
    await kv.set(`session:${hashedSessionToken}`, JSON.stringify(sessionData));
    // Clear rate limits for successful login
    await kv.del(`ratelimit:login:ip:${ip}`);
    await kv.del(`ratelimit:login:email:${normalizedEmail}`);
    await logAuthEvent('login', normalizedEmail, ip, true);
    // Record user activity (non-blocking)
    recordUserActivity(normalizedEmail, 'login', ip, userAgent).catch(err => {
      console.error('Failed to record user activity:', err);
    });
    return {
      success: true,
      sessionToken,
      email: normalizedEmail // Return email so client can set auth state immediately
    };
  } catch (error) {
    console.error('Error in loginWithEmailPassword:', error);
    return {
      success: false,
      error: 'An error occurred. Please try again.'
    };
  }
}
// Check session validity
export async function checkSession(sessionToken, ip, userAgent) {
  try {
    if (!sessionToken) {
      return {
        valid: false
      };
    }
    const hashedToken = hashValue(sessionToken);
    const sessionData = await kv.get(`session:${hashedToken}`);
    if (!sessionData) {
      return {
        valid: false
      };
    }
    const session = JSON.parse(sessionData);
    // Check expiry
    if (Date.now() > session.expiresAt) {
      await kv.del(`session:${hashedToken}`);
      return {
        valid: false
      };
    }
    // Record user activity for valid token check (non-blocking)
    if (ip) {
      recordUserActivity(session.email, 'token_check', ip, userAgent).catch(err => {
        console.error('Failed to record user activity:', err);
      });
    }
    return {
      valid: true,
      email: session.email
    };
  } catch (error) {
    console.error('Error in checkSession:', error);
    return {
      valid: false
    };
  }
}
// Logout (invalidate session)
export async function logout(sessionToken, ip) {
  try {
    if (!sessionToken) {
      return {
        success: false
      };
    }
    const hashedToken = hashValue(sessionToken);
    const sessionData = await kv.get(`session:${hashedToken}`);
    if (sessionData) {
      const session = JSON.parse(sessionData);
      await logAuthEvent('logout', session.email, ip, true);
    }
    await kv.del(`session:${hashedToken}`);
    return {
      success: true
    };
  } catch (error) {
    console.error('Error in logout:', error);
    return {
      success: false
    };
  }
}
