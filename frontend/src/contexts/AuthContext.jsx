import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api, { setAccessToken } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  const clearSession = useCallback(() => {
    setAccessToken(null);
    sessionStorage.removeItem('tmssa_user');
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  // Verify real session with backend on mount
  useEffect(() => {
    let active = true;
    const initAuth = async () => {
      const existingToken = sessionStorage.getItem('tmssa_access_token');
      if (!existingToken) {
        // Attempt silent refresh using HttpOnly cookie if present
        try {
          const refreshRes = await api.post('/admin/auth/refresh');
          if (!active) return;
          const newToken = refreshRes.data?.accessToken;
          if (newToken && refreshRes.data?.user) {
            setAccessToken(newToken);
            sessionStorage.setItem('tmssa_user', JSON.stringify(refreshRes.data.user));
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

  const login = async (email, password) => {
    const response = await api.post('/admin/auth/login', { email, password });
    const { accessToken, user: loggedInUser } = response.data;
    setAccessToken(accessToken);
    sessionStorage.setItem('tmssa_user', JSON.stringify(loggedInUser));
    setUser(loggedInUser);
    setIsAuthenticated(true);
    return response.data;
  };

  const logout = async () => {
    try {
      await api.post('/admin/auth/logout');
    } catch {
      // Clear local session regardless of network outcome
    } finally {
      clearSession();
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, loading, login, logout }}>
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
