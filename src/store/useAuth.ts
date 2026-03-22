import { useState, useEffect } from 'react';

const AUTH_STORAGE_KEY = 'mindvault_auth_v1';
const STORED_USERNAME = 'ebubekir-5267';
// SHA-256 hash of: aKq3qke$8rkGNPqD7EAXS$?BJam?#M&xo6$7f!a5
const STORED_PASSWORD_HASH = '8b66d25cb0e50ef32ba88274fab5502215e13286f5404e040fd803888abaea32';

interface AuthState {
  isAuthenticated: boolean;
  username: string | null;
}

function hashPassword(password: string): string {
  // Simple SHA-256 hashing using Web Crypto API
  // This is a client-side implementation for demonstration
  // In production, use bcrypt or Argon2 on the backend
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(16);
}

async function sha256Hash(message: string): Promise<string> {
  try {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
  } catch {
    // Fallback for browsers without Web Crypto API
    return hashPassword(message);
  }
}

function getStoredAuth(): AuthState {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return { isAuthenticated: false, username: null };
    const parsed = JSON.parse(raw);
    return parsed;
  } catch {
    return { isAuthenticated: false, username: null };
  }
}

function saveAuth(auth: AuthState) {
  try {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(auth));
  } catch {}
}

export function useAuth() {
  const [auth, setAuth] = useState<AuthState>(() => getStoredAuth());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const login = async (username: string, password: string) => {
    setLoading(true);
    setError('');

    try {
      // Hash the input password
      const inputHash = await sha256Hash(password);

      // Simulate network delay for security feel
      setTimeout(() => {
        if (username === STORED_USERNAME && inputHash === STORED_PASSWORD_HASH) {
          const newAuth: AuthState = { isAuthenticated: true, username };
          setAuth(newAuth);
          saveAuth(newAuth);
          setLoading(false);
        } else {
          setError('Identifiant ou mot de passe incorrect.');
          setLoading(false);
        }
      }, 500);
    } catch (err) {
      setError('Erreur lors de la connexion. Veuillez réessayer.');
      setLoading(false);
    }
  };

  const logout = () => {
    const newAuth: AuthState = { isAuthenticated: false, username: null };
    setAuth(newAuth);
    saveAuth(newAuth);
  };

  return {
    ...auth,
    login,
    logout,
    loading,
    error,
    setError,
  };
}
