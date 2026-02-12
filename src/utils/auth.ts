import { publicAnonKey } from './supabase/info';

const API_BASE = '/api';
const SESSION_TOKEN_KEY = 'resight_session_token';

export interface AuthState {
  authenticated: boolean;
  email?: string;
  loading: boolean;
}

// Get session token from localStorage (fallback for Safari cookie issues)
function getStoredSessionToken(): string | null {
  try {
    return localStorage.getItem(SESSION_TOKEN_KEY);
  } catch (e) {
    return null;
  }
}

// Store session token in localStorage (fallback for Safari cookie issues)
function storeSessionToken(token: string): void {
  try {
    localStorage.setItem(SESSION_TOKEN_KEY, token);
  } catch (e) {
    console.warn('Failed to store session token in localStorage:', e);
  }
}

// Remove session token from localStorage
function removeStoredSessionToken(): void {
  try {
    localStorage.removeItem(SESSION_TOKEN_KEY);
  } catch (e) {
    // Ignore
  }
}

// Check if user is authenticated
export async function checkAuth(): Promise<AuthState> {
  try {
    // Get token from localStorage as fallback
    const storedToken = getStoredSessionToken();
    
    const headers: HeadersInit = {
      'Authorization': `Bearer ${publicAnonKey}`,
    };
    
    // Add stored token to header if available (for Safari cookie fallback)
    if (storedToken) {
      headers['X-Session-Token'] = storedToken;
    }
    
    const response = await fetch(`${API_BASE}/auth/check`, {
      method: 'GET',
      headers,
    });

    const data = await response.json();

    return {
      authenticated: data.authenticated || false,
      email: data.email,
      loading: false,
    };
  } catch (error) {
    console.error('Error checking auth:', error);
    return {
      authenticated: false,
      loading: false,
    };
  }
}

// Logout user
export async function logout(): Promise<boolean> {
  try {
    // Remove stored token
    removeStoredSessionToken();
    
    const response = await fetch(`${API_BASE}/auth/logout`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
      },
    });

    const data = await response.json();
    return data.success || false;
  } catch (error) {
    console.error('Error logging out:', error);
    return false;
  }
}

// Export function to store session token (called after successful login)
export function setSessionToken(token: string): void {
  storeSessionToken(token);
}
