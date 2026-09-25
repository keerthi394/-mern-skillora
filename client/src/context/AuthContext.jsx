import { createContext, useContext, useState, useCallback } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('ml_user');
      return stored ? JSON.parse(stored) : null;
    } catch { return null; }
  });

  const saveSession = useCallback((token, userData) => {
    localStorage.setItem('ml_token', token);
    localStorage.setItem('ml_user', JSON.stringify(userData));
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('ml_token');
    localStorage.removeItem('ml_user');
    setUser(null);
  }, []);

  const login = useCallback(async (credentials) => {
    const response = await authAPI.login(credentials);
    const { token, user: userData, message } = response.data;
    saveSession(token, userData);
    return { message, user: userData };
  }, [saveSession]);

  const register = useCallback(async (data) => {
    const response = await authAPI.register(data);
    const { token, user: userData, message } = response.data;
    saveSession(token, userData);
    return { message, user: userData };
  }, [saveSession]);

  const updateUser = useCallback((userData) => {
    localStorage.setItem('ml_user', JSON.stringify(userData));
    setUser(userData);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateUser, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
