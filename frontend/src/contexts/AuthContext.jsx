import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import api, { setAccessToken } from '../services/api';

const AuthContext = createContext(null);
const ADMIN_HINT_KEY = 'tmssa_admin_hint';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  const clearSession = useCallback(() => {
    setAccessToken(null);
    sessionStorage.removeItem('tmssa_user');
    localStorage.removeItem(ADMIN_HINT_KEY);
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  // Verify real session with backend only when needed (avoids spurious 401 refresh calls for public visitors)
  useEffect(() => {
    let active = true;
    const initAuth = async () => {
      const existingToken = sessionStorage.getItem('tmssa_access_token');
      const isAdminRoute = window.location.pathname.startsWith('/admin');
      const hasAdminHint = localStorage.getItem(ADMIN_HINT_KEY) === '1';

      if (!existingToken) {
        if (!isAdminRoute && !hasAdminHint) {
          setLoading(false);
          return;
        }
        // Attempt silent refresh using HttpOnly cookie if on admin route or returning admin
        try {
          const refreshRes = await api.post('/admin/auth/refresh');
          if (!active) return;
          const newToken = refreshRes.data?.accessToken;
          if (newToken && refreshRes.data?.user) {
            setAccessToken(newToken);
            sessionStorage.setItem('tmssa_user', JSON.stringify(refreshRes.data.user));
            localStorage.setItem(ADMIN_HINT_KEY, '1');
            setUser(refreshRes.data.user);
            setIsAuthenticated(true);
          } else {
            clearSession();
          }
        } catch {
          if (active) clearSession();
        } finally {
          if (active) setLoading(false);
        }
        return;
      }

      try {
        const res = await api.get('/admin/auth/me');
        if (!active) return;
        if (res.data?.user) {
          sessionStorage.setItem('tmssa_user', JSON.stringify(res.data.user));
          localStorage.setItem(ADMIN_HINT_KEY, '1');
          setUser(res.data.user);
          setIsAuthenticated(true);
        } else {
          clearSession();
        }
      } catch {
        if (active) clearSession();
      } finally {
        if (active) setLoading(false);
      }
    };

    initAuth();
    return () => {
      active = false;
    };
  }, [clearSession]);

  const login = useCallback(async (email, password) => {
    const response = await api.post('/admin/auth/login', { email, password });
    const { accessToken, user: loggedInUser } = response.data;
    setAccessToken(accessToken);
    sessionStorage.setItem('tmssa_user', JSON.stringify(loggedInUser));
    localStorage.setItem(ADMIN_HINT_KEY, '1');
    setUser(loggedInUser);
    setIsAuthenticated(true);
    return response.data;
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post('/admin/auth/logout');
    } catch {
      // Clear local session regardless of network outcome
    } finally {
      clearSession();
    }
  }, [clearSession]);

  const value = useMemo(
    () => ({ user, isAuthenticated, loading, login, logout }),
    [user, isAuthenticated, loading, login, logout]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
