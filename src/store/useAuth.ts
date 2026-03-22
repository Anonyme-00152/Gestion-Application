import { useState } from 'react';

const AUTH_STORAGE_KEY = 'mindvault_auth_v1';
const STORED_USERNAME = 'ebubekir-5267';
// SHA-256 hash of: aKq3qke$8rkGNPqD7EAXS$?BJam?#M&xo6$7f!a5
const STORED_PASSWORD_HASH = '8b66d25cb0e50ef32ba88274fab5502215e13286f5404e040fd803888abaea32';

interface AuthState {
  isAuthenticated: boolean;
  username: string | null;
}

// Synchronous SHA-256 hash function using Web Crypto API
async function sha256Hash(message: string): Promise<string> {
  try {
    console.log('[Auth] Hachage du mot de passe...');
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    console.log('[Auth] Hash calculé:', hashHex);
    return hashHex;
  } catch (err) {
    console.error('[Auth] Erreur lors du hachage:', err);
    throw err;
  }
}

function getStoredAuth(): AuthState {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return { isAuthenticated: false, username: null };
    const parsed = JSON.parse(raw);
    console.log('[Auth] Session restaurée:', parsed);
    return parsed;
  } catch (err) {
    console.error('[Auth] Erreur lors de la restauration de session:', err);
    return { isAuthenticated: false, username: null };
  }
}

function saveAuth(auth: AuthState) {
  try {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(auth));
    console.log('[Auth] Session sauvegardée:', auth);
  } catch (err) {
    console.error('[Auth] Erreur lors de la sauvegarde:', err);
  }
}

export function useAuth() {
  const [auth, setAuth] = useState<AuthState>(() => getStoredAuth());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const login = async (username: string, password: string) => {
    console.log('[Auth] Tentative de connexion:', { username });
    setLoading(true);
    setError('');

    try {
      // Trim inputs
      const trimmedUsername = username.trim();
      const trimmedPassword = password.trim();

      console.log('[Auth] Identifiant attendu:', STORED_USERNAME);
      console.log('[Auth] Identifiant reçu:', trimmedUsername);
      console.log('[Auth] Identifiant valide?', trimmedUsername === STORED_USERNAME);

      // Hash the input password
      const inputHash = await sha256Hash(trimmedPassword);
      console.log('[Auth] Hash attendu:', STORED_PASSWORD_HASH);
      console.log('[Auth] Hash reçu:', inputHash);
      console.log('[Auth] Mot de passe valide?', inputHash === STORED_PASSWORD_HASH);

      // Check credentials
      if (trimmedUsername === STORED_USERNAME && inputHash === STORED_PASSWORD_HASH) {
        console.log('[Auth] ✓ Connexion réussie!');
        const newAuth: AuthState = { isAuthenticated: true, username: trimmedUsername };
        setAuth(newAuth);
        saveAuth(newAuth);
        setLoading(false);
      } else {
        console.log('[Auth] ✗ Identifiants incorrects');
        setError('Identifiant ou mot de passe incorrect.');
        setLoading(false);
      }
    } catch (err) {
      console.error('[Auth] Erreur lors de la connexion:', err);
      setError('Erreur lors de la connexion. Veuillez réessayer.');
      setLoading(false);
    }
  };

  const logout = () => {
    console.log('[Auth] Déconnexion');
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
