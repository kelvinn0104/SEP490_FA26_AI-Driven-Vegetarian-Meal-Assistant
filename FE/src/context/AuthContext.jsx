import React, { createContext, useState, useContext } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Mặc định khách vãng lai là CHƯA ĐĂNG NHẬP (null)
  const [user, setUser] = useState(null);

  const login = (userData) => {
    setUser(userData || {
      name: 'Người dùng VeggieAI',
      email: 'user@veggieai.vn',
      role: 'AuthorizedUser'
    });
  };

  const loginAsAdmin = () => {
    setUser({
      name: 'Quản trị viên',
      email: 'admin@veggieai.vn',
      role: 'Admin'
    });
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, setUser, login, loginAsAdmin, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
