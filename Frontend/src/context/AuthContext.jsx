import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authMe, authLogout } from '../api/auth';

const AuthContext = createContext(null);

/**
 * AuthProvider – wraps the app and provides:
 *   { user, isLoading, login, logout, isAuthenticated }
 */
export function AuthProvider({ children }) {
  const [user, setUser]         = useState(null);
  const [isLoading, setLoading] = useState(true);

  // On mount, try to restore session from the httpOnly cookie
  useEffect(() => {
    authMe()
      .then((res) => setUser(res.data.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback((userData) => {
    setUser(userData);
  }, []);

  const logout = useCallback(async () => {
    await authLogout().catch(() => {});
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
};
