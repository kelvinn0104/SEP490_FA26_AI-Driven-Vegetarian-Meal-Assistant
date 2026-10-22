import React, { createContext, useState, useContext, useEffect } from 'react';
import { getStoredUser, setStoredUser, getAuthToken, setAuthToken, authService } from '../api';

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

  // Check token validity on mount
  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      authService.getMe()
        .then(u => {
          if (u) {
            const normalized = {
              name: u.displayName || u.name || u.email,
              email: u.email,
              role: (u.role || '').toLowerCase() === 'admin' ? 'Admin' : (u.role || '').toLowerCase() === 'moderator' ? 'Moderator' : 'AuthorizedUser',
              roleLabel: (u.role || '').toLowerCase() === 'admin' ? 'Admin' : (u.role || '').toLowerCase() === 'moderator' ? 'Moderator' : 'Thành viên chính thức',
              hasHealthProfile: u.hasHealthProfile !== false,
              ...u
            };
            setUser(normalized);
            setStoredUser(normalized);
          }
        })
        .catch(err => {
          if (err.status === 401) {
            setAuthToken(null);
            setStoredUser(null);
            setUser(null);
          }
        });
    }
  }, []);

  const login = (userData, token = null) => {
    if (token) {
      setAuthToken(token);
    }
    const finalUser = userData || {
      name: 'Người dùng VeggieAI',
      email: 'user@veggieai.vn',
      role: 'AuthorizedUser',
      roleLabel: 'Thành viên chính thức',
      hasHealthProfile: true
    };
    setUser(finalUser);
    setStoredUser(finalUser);
    try {
      localStorage.setItem('veggieai_user', JSON.stringify(finalUser));
    } catch (e) {}
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (e) {}
    setUser(null);
    setStoredUser(null);
    setAuthToken(null);
    try {
      localStorage.removeItem('veggieai_user');
      localStorage.removeItem('veggieai_active_tab');
      localStorage.removeItem('token');
      localStorage.removeItem('veggie_token');
      localStorage.removeItem('veggie_user_profile');
      localStorage.removeItem('veggie_weekly_plan');
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
