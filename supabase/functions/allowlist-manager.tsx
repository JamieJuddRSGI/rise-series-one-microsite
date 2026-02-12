/**
 * User Management Utility
 *
 * This utility manages user credentials (email + password).
 * Passwords are hashed using SHA-256 before storage.
 */
import { createHash } from 'node:crypto';
import { userCredentials } from './user-credentials.ts';

/**
 * Hash a password using SHA-256
 * @param password Plain text password
 * @returns Hashed password
 */
function hashPassword(password: string): string {
  return createHash('sha256').update(password).digest('hex');
}

interface UserCredentials {
  email: string;
  passwordHash: string;
}

function loadUserCredentials(): UserCredentials[] {
  const envUsers = Deno.env.get('USER_CREDENTIALS');

  if (envUsers) {
    try {
      const parsed = JSON.parse(envUsers);

      if (Array.isArray(parsed)) {
        const credentials = parsed
          .filter((entry) => entry?.email && entry?.password)
          .map((entry) => ({
            email: String(entry.email).toLowerCase().trim(),
            passwordHash: hashPassword(String(entry.password)),
          }));

        if (credentials.length > 0) {
          console.log(`[Users] Loaded ${credentials.length} user(s) from USER_CREDENTIALS environment variable`);
          return credentials;
        }
      }

      console.warn('[Users] USER_CREDENTIALS is set but no valid users were parsed');
    } catch (error) {
      console.error('❌ Error parsing USER_CREDENTIALS env var:', error);
      console.log('⚠️ Falling back to user-credentials.ts file');
    }
  }

  const fallbackCredentials = userCredentials.map(({ email, password }) => ({
    email: email.toLowerCase().trim(),
    passwordHash: hashPassword(password),
  }));

  console.log(`[Users] Loaded ${fallbackCredentials.length} user(s) from user-credentials.ts file`);
  return fallbackCredentials;
}

const DEFAULT_USERS = loadUserCredentials();

// User store
const USERS = new Map<string, UserCredentials>();

// Initialize default users
DEFAULT_USERS.forEach((user) => {
  USERS.set(user.email.toLowerCase(), user);
});
/**
 * Verify user credentials
 * @param email Email address
 * @param password Plain text password
 * @returns true if credentials are valid, false otherwise
 */
export function verifyCredentials(email, password) {
    const normalizedEmail = email.toLowerCase().trim();
    const user = USERS.get(normalizedEmail);
    if (!user) {
      return false;
    }
    const passwordHash = hashPassword(password);
    return user.passwordHash === passwordHash;
  }
  /**
   * Check if a user exists
   * @param email Email address to check
   * @returns true if user exists, false otherwise
   */ export function userExists(email) {
    return USERS.has(email.toLowerCase().trim());
  }
  /**
   * Add a new user programmatically
   * Note: This only affects the current runtime instance
   * @param email Email address
   * @param password Plain text password (will be hashed)
   */ export function addUser(email, password) {
    const normalizedEmail = email.toLowerCase().trim();
    if (normalizedEmail && normalizedEmail.includes('@') && password) {
      USERS.set(normalizedEmail, {
        email: normalizedEmail,
        passwordHash: hashPassword(password)
      });
      console.log(`[Users] Added user: ${normalizedEmail}`);
    }
  }
  /**
   * Remove a user programmatically
   * Note: This only affects the current runtime instance
   * @param email Email address
   */ export function removeUser(email) {
    const normalizedEmail = email.toLowerCase().trim();
    USERS.delete(normalizedEmail);
    console.log(`[Users] Removed user: ${normalizedEmail}`);
  }
  /**
   * Get the count of users (for logging/diagnostics)
   * @returns Number of users
   */ export function getUserCount() {
    return USERS.size;
  }
/**
 * Log user store information (without revealing credentials)
 */
export function logUserInfo() {
  console.log(`[Users] Total users configured: ${USERS.size}`);
  const source = Deno.env.get('USER_CREDENTIALS')
    ? 'USER_CREDENTIALS environment variable'
    : 'user-credentials.ts file';
  console.log(`[Users] Source: ${source}`);
}

// Log user info on module load
logUserInfo();