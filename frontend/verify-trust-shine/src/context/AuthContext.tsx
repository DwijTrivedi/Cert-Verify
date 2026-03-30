import React, { createContext, useContext, useState } from 'react';

type Role = 'institution' | 'company' | null;

interface AuthContextType {
  role: Role;
  token: string | null;
  isLoggedIn: boolean;
  login: (role: Role, token: string) => void;
  logout: () => void;
  authHeader: () => { Authorization: string } | {};
}

const AuthContext = createContext<AuthContextType>({
  role: null,
  token: null,
  isLoggedIn: false,
  login: () => {},
  logout: () => {},
  authHeader: () => ({}),
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<Role>(() => {
    return (localStorage.getItem('userRole') as Role) ?? null;
  });
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('authToken') ?? null;
  });

  const isLoggedIn = role !== null && token !== null;

  const login = (newRole: Role, newToken: string) => {
    setRole(newRole);
    setToken(newToken);
    if (newRole) localStorage.setItem('userRole', newRole);
    if (newToken) localStorage.setItem('authToken', newToken);
  };

  const logout = () => {
    setRole(null);
    setToken(null);
    localStorage.removeItem('userRole');
    localStorage.removeItem('authToken');
  };

  /** Returns the Authorization header object for use in axios calls */
  const authHeader = () => {
    if (token) return { Authorization: `Bearer ${token}` };
    return {};
  };

  return (
    <AuthContext.Provider value={{ role, token, isLoggedIn, login, logout, authHeader }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
