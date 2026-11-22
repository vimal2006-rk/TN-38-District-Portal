import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]                   = useState(null);
  const [token, setToken]                 = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading]             = useState(true);

  // Restore session from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('tn38_token');
    const storedUser  = localStorage.getItem('tn38_user');
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    const { token: newToken, user: newUser } = response.data;
    localStorage.setItem('tn38_token', newToken);
    localStorage.setItem('tn38_user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
    setIsAuthenticated(true);
    return response.data;
  };

  const logout = () => {
    localStorage.removeItem('tn38_token');
    localStorage.removeItem('tn38_user');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated, loading, login, logout }}>
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
