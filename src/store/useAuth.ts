import { useState, useEffect } from 'react';

const AUTH_STORAGE_KEY = 'mindvault_auth_v1';
const DEFAULT_USERNAME = 'mindvault';
const DEFAULT_PASSWORD = 'SecurePass2026';

interface AuthState {
  isAuthenticated: boolean;
  username: string | null;
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

  const login = (username: string, password: string) => {
    setLoading(true);
    setError('');

    // Simulate network delay for security feel
    setTimeout(() => {
      if (username === DEFAULT_USERNAME && password === DEFAULT_PASSWORD) {
        const newAuth: AuthState = { isAuthenticated: true, username };
        setAuth(newAuth);
        saveAuth(newAuth);
        setLoading(false);
      } else {
        setError('Identifiant ou mot de passe incorrect.');
        setLoading(false);
      }
    }, 500);
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
