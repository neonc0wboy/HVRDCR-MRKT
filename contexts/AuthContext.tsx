import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import type { User } from '../types';

interface AuthContextType {
  user: User | null;
  login: (email: string) => void;
  logout: () => void;
  register: (email: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const item = window.localStorage.getItem('hvrdcr-market-user');
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('Error reading user from localStorage', error);
      return null;
    }
  });

  useEffect(() => {
    try {
      if (user) {
        window.localStorage.setItem('hvrdcr-market-user', JSON.stringify(user));
      } else {
        window.localStorage.removeItem('hvrdcr-market-user');
      }
    } catch (error) {
      console.error('Error writing user to localStorage', error);
    }
  }, [user]);

  const login = (email: string) => {
    // In a real app, this would involve a password and API call
    setUser({ email });
  };

  const logout = () => {
    setUser(null);
  };
  
  const register = (email: string) => {
    // In a real app, this would involve a password and API call
    setUser({ email });
  };


  return (
    <AuthContext.Provider value={{ user, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};