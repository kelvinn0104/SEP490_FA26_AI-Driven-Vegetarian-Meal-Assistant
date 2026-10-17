import React, { createContext, useState, useContext, useEffect } from 'react';
import { getStoredUser, setStoredUser, getAuthToken, setAuthToken } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = getStoredUser();
      if (stored) return stored;
      const saved = localStorage.getItem('veggieai_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const login = (userData) => {
    const finalUser = userData || {
      name: 'Người dùng VeggieAI',
      email: 'user@veggieai.vn',
      role: 'AuthorizedUser',
      roleLabel: 'Thành viên chính thức'
    };
    setUser(finalUser);
    setStoredUser(finalUser);
    try {
      localStorage.setItem('veggieai_user', JSON.stringify(finalUser));
    } catch (e) {}
  };

  const logout = () => {
    setUser(null);
    setStoredUser(null);
    setAuthToken(null);
    try {
      localStorage.removeItem('veggieai_user');
      localStorage.removeItem('veggieai_active_tab');
    } catch (e) {}
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    return {
      user: null,
      login: () => {},
      logout: () => {},
    };
  }
  return context;
}
