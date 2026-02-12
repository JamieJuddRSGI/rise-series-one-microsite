import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { setCookie, getCookie, deleteCookie } from "npm:hono/cookie";
import * as auth from "./auth.tsx";
const app = new Hono();
// Enable logger
app.use('*', logger(console.log));
// Enable CORS for all routes and methods
// In production, restrict origin to your domain
app.use("/*", cors({
  origin: [
    'https://resight-india-pc-vercel-test.vercel.app',
    'https://privatecapital.resightindia.com'
  ],
  allowHeaders: [
    "Content-Type",
    "Authorization",
    "X-Session-Token"
  ],
  allowMethods: [
    "GET",
    "POST",
    "PUT",
    "DELETE",
    "OPTIONS"
  ],
  exposeHeaders: [
    "Content-Length",
    "Set-Cookie"
  ],
  credentials: true,
  maxAge: 600
}));
// Helper to get client IP
function getClientIP(c) {
  return c.req.header('x-forwarded-for')?.split(',')[0].trim() || c.req.header('x-real-ip') || 'unknown';
}
// Helper to get user agent
function getUserAgent(c) {
  return c.req.header('user-agent') || undefined;
}
// Health check endpoint
app.get("/resight-rise-auth/health", (c)=>{
  return c.json({
    status: "ok"
  });
});
// Auth endpoints
// Login with email and password
app.post("/resight-rise-auth/auth/login", async (c)=>{
  try {
    const body = await c.req.json();
    const { email, password } = body;
    if (!email || typeof email !== 'string') {
      return c.json({
        success: false,
        error: 'Email is required'
      }, 400);
    }
    if (!password || typeof password !== 'string') {
      return c.json({
        success: false,
        error: 'Password is required'
      }, 400);
    }
    const ip = getClientIP(c);
    const userAgent = getUserAgent(c);
    const result = await auth.loginWithEmailPassword(email, password, ip, userAgent);
    if (result.success && result.sessionToken) {
      // Set HttpOnly, Secure, SameSite cookie
      // Safari on iOS requires explicit domain and SameSite=None with Secure
      const origin = c.req.header('origin');
      const cookieOptions = {
        httpOnly: true,
        secure: true,
        sameSite: 'None' as const,
        maxAge: 24 * 60 * 60,
        path: '/'
      };
      
      // Extract domain from origin if available (for better Safari compatibility)
      // Note: Don't set domain if it's localhost or IP address
      if (origin) {
        try {
          const url = new URL(origin);
          const hostname = url.hostname;
          // Only set domain for proper domains (not localhost or IPs)
          if (!hostname.includes('localhost') && !/^\d+\.\d+\.\d+\.\d+$/.test(hostname)) {
            // Extract root domain (e.g., .vercel.app or .resightindia.com)
            const parts = hostname.split('.');
            if (parts.length >= 2) {
              const rootDomain = '.' + parts.slice(-2).join('.');
              // Only set if it's a valid root domain
              if (rootDomain.length > 1 && rootDomain !== '.localhost') {
                cookieOptions.domain = rootDomain;
              }
            }
          }
        } catch (e) {
          // Invalid origin, skip domain setting
          console.warn('Could not parse origin for cookie domain:', origin);
        }
      }
      
      setCookie(c, 'session_token', result.sessionToken, cookieOptions);
      
      // Log cookie setting for debugging Safari issues
      console.log(`[COOKIE SET] User: ${email.substring(0, 10)}..., IP: ${ip}, UA: ${userAgent?.substring(0, 50)}..., Domain: ${cookieOptions.domain || 'not set'}`);
      
      return c.json({
        success: true,
        // Also return token in response for fallback (client can use localStorage)
        sessionToken: result.sessionToken,
        // Return normalized email so client can set auth state immediately without checking
        email: result.email || email
      });
    }
    return c.json(result, 400);
  } catch (error) {
    console.error('Error in /auth/login:', error);
    return c.json({
      success: false,
      error: 'An error occurred'
    }, 500);
  }
});
// Check session validity
app.get("/resight-rise-auth/auth/check", async (c)=>{  
  try {
    // Try to get session token from cookie first
    let sessionToken = getCookie(c, 'session_token');
    
    // Fallback: check X-Session-Token header (for Safari cookie issues)
    if (!sessionToken) {
      sessionToken = c.req.header('x-session-token') || undefined;
    }
    
    // Fallback: check query parameter as last resort (less secure but works around Safari)
    if (!sessionToken) {
      sessionToken = c.req.query('token') || undefined;
    }
    
    if (!sessionToken) {
      const ip = getClientIP(c);
      const userAgent = getUserAgent(c);
      console.log(`[AUTH CHECK FAILED] No token found - IP: ${ip}, UA: ${userAgent?.substring(0, 50)}..., Cookie present: ${!!getCookie(c, 'session_token')}`);
      return c.json({
        authenticated: false
      }, 200);
    }
    
    const ip = getClientIP(c);
    const userAgent = getUserAgent(c);
    const result = await auth.checkSession(sessionToken, ip, userAgent);
    
    // If session is valid but cookie wasn't found, try to set it again
    if (result.valid && !getCookie(c, 'session_token')) {
      const origin = c.req.header('origin');
      const cookieOptions = {
        httpOnly: true,
        secure: true,
        sameSite: 'None' as const,
        maxAge: 24 * 60 * 60,
        path: '/'
      };
      
      if (origin) {
        try {
          const url = new URL(origin);
          const hostname = url.hostname;
          if (!hostname.includes('localhost') && !/^\d+\.\d+\.\d+\.\d+$/.test(hostname)) {
            const parts = hostname.split('.');
            if (parts.length >= 2) {
              const rootDomain = '.' + parts.slice(-2).join('.');
              if (rootDomain.length > 1 && rootDomain !== '.localhost') {
                cookieOptions.domain = rootDomain;
              }
            }
          }
        } catch (e) {
          // Ignore
        }
      }
      
      setCookie(c, 'session_token', sessionToken, cookieOptions);
      console.log(`[COOKIE RE-SET] Re-setting cookie for valid session - Email: ${result.email?.substring(0, 10)}...`);
    }
    
    return c.json({
      authenticated: result.valid,
      email: result.email
    }, 200);
  } catch (error) {
    console.error('Error in /auth/check:', error);
    return c.json({
      authenticated: false
    }, 200);
  }
});
// Logout
app.post("/resight-rise-auth/auth/logout", async (c)=>{
  try {
    const sessionToken = getCookie(c, 'session_token');
    const ip = getClientIP(c);
    if (sessionToken) {
      await auth.logout(sessionToken, ip);
    }
    // Delete cookie
    deleteCookie(c, 'session_token', {
      path: '/'
    });
    return c.json({
      success: true
    });
  } catch (error) {
    console.error('Error in /auth/logout:', error);
    return c.json({
      success: false,
      error: 'An error occurred'
    }, 500);
  }
});
// Log server startup information
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🚀 Authentication Server Started');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(`📅 Started at: ${new Date().toISOString()}`);
console.log(`🌍 Environment: ${Deno.env.get('DENO_DEPLOYMENT_ID') ? 'Production' : 'Development'}`);
console.log(`🔐 Authentication: Email + Password`);
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('Available endpoints:');
console.log('  POST /resight-rise-auth/auth/login');
console.log('  GET  /resight-rise-auth/auth/check');
console.log('  POST /resight-rise-auth/auth/logout');
console.log('  GET  /resight-rise-auth/health');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
Deno.serve(app.fetch);
