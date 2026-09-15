import React, { createContext, useState, useContext } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Khởi tạo từ localStorage nếu có, mặc định là null (khách vãng lai)
  const [user, setUser] = useState(() => {
    try {
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
    try {
      localStorage.setItem('veggieai_user', JSON.stringify(finalUser));
    } catch (e) {}
  };

  const loginAsAdmin = () => {
    try {
      localStorage.setItem('veggieai_active_tab', 'admin');
    } catch (e) {}
    login({
      name: 'Admin',
      email: 'admin@veggieai.vn',
      role: 'Admin',
      roleLabel: 'Admin'
    });
  };

  const loginAsMod = () => {
    try {
      localStorage.setItem('veggieai_active_tab', 'moderation');
    } catch (e) {}
    login({
      name: 'Lê Tuệ Tâm',
      email: 'mod@veggieai.vn',
      role: 'Moderator',
      roleLabel: 'Moderator'
    });
  };

  const loginAsUser = () => {
    login({
      name: 'Thành Viên Thuần Chay',
      email: 'user@veggieai.vn',
      role: 'AuthorizedUser',
      roleLabel: 'Thành viên chính thức (User)'
    });
  };

  const logout = () => {
    setUser(null);
    try {
      localStorage.removeItem('veggieai_user');
      localStorage.removeItem('veggieai_active_tab');
    } catch (e) {}
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, loginAsAdmin, loginAsMod, loginAsUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
