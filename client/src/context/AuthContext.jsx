import { createContext, useContext, useState, useCallback } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('skillora_user');
    return stored ? JSON.parse(stored) : null;
  });

  const saveSession = useCallback((token, userData) => {
    localStorage.setItem('skillora_token', token);
    localStorage.setItem('skillora_user', JSON.stringify(userData));
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('skillora_token');
    localStorage.removeItem('skillora_user');
    setUser(null);
  }, []);

  const login = useCallback(async (credentials) => {
    const response = await authAPI.login(credentials);
    const { token, user: userData, message } = response.data;
    saveSession(token, userData);
    return { message };
  }, [saveSession]);

  const register = useCallback(async (data) => {
    const response = await authAPI.register(data);
    const { token, user: userData, message } = response.data;
    saveSession(token, userData);
    return { message };
  }, [saveSession]);

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
