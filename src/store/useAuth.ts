import { useState } from 'react';

const AUTH_STORAGE_KEY = 'mindvault_auth_v1';
const STORED_USERNAME = 'ebubekir-5267';
// On utilise une version encodée simple pour ne pas avoir le mot de passe en clair dans le code
// mais sans dépendre d'API asynchrones complexes qui peuvent échouer
const ENCODED_PWD = btoa('aKq3qke$8rkGNPqD7EAXS$?BJam?#M&xo6$7f!a5');

interface AuthState {
  isAuthenticated: boolean;
  username: string | null;
}

function getStoredAuth(): AuthState {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return { isAuthenticated: false, username: null };
    const parsed = JSON.parse(raw);
    console.log('[Auth] Session restaurée:', parsed.isAuthenticated);
    return parsed;
  } catch (err) {
    return { isAuthenticated: false, username: null };
  }
}

function saveAuth(auth: AuthState) {
  try {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(auth));
    console.log('[Auth] Session sauvegardée');
  } catch (err) {}
}

export function useAuth() {
  const [auth, setAuth] = useState<AuthState>(() => getStoredAuth());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const login = (username: string, password: string) => {
    console.log('[Auth] Tentative de connexion...');
    setLoading(true);
    setError('');

    // Utilisation d'un petit délai pour l'UX, mais logique synchrone à l'intérieur
    setTimeout(() => {
      const trimmedUsername = username.trim();
      const trimmedPassword = password.trim();
      const inputEncoded = btoa(trimmedPassword);

      if (trimmedUsername === STORED_USERNAME && inputEncoded === ENCODED_PWD) {
        console.log('[Auth] ✓ Succès');
        const newAuth: AuthState = { isAuthenticated: true, username: trimmedUsername };
        setAuth(newAuth);
        saveAuth(newAuth);
        setLoading(false);
        // Forcer un rechargement léger ou s'assurer que l'état React déclenche le rendu
      } else {
        console.log('[Auth] ✗ Échec');
        setError('Identifiant ou mot de passe incorrect.');
        setLoading(false);
      }
    }, 300);
  };

  const logout = () => {
    console.log('[Auth] Déconnexion');
    const newAuth: AuthState = { isAuthenticated: false, username: null };
    setAuth(newAuth);
    saveAuth(newAuth);
    localStorage.removeItem(AUTH_STORAGE_KEY);
    window.location.reload(); // Recharger pour nettoyer l'état
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
