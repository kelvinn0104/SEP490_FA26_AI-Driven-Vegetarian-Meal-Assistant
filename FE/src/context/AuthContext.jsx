import React, { createContext, useState, useContext } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState({
    name: 'Phan Văn A',
    email: 'user@veggieai.vn',
    role: 'AuthorizedUser' // AuthorizedUser, Admin, Moderator, UnauthorizedUser
  });

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
