import React, { createContext, useContext, useState } from 'react';

type Role = 'institution' | 'company' | null;

interface AuthContextType {
  role: Role;
  isLoggedIn: boolean;
  login: (role: Role) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  role: null,
  isLoggedIn: false,
  login: () => {},
  logout: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<Role>(() => {
    const stored = localStorage.getItem('userRole') as Role | null;
    return stored ?? null;
  });

  const isLoggedIn = role !== null;

  const login = (newRole: Role) => {
    setRole(newRole);
    if (newRole) localStorage.setItem('userRole', newRole);
  };

  const logout = () => {
    setRole(null);
    localStorage.removeItem('userRole');
  };

  return (
    <AuthContext.Provider value={{ role, isLoggedIn, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
