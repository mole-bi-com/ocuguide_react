import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const login = async (username, password) => {
    try {
      setIsLoading(true);
      // Simulated login delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock login logic
      if (username === 'doc' && password === '1') {
        const mockUser = { name: '김의사', role: 'doctor' };
        setUser(mockUser);
        setIsAuthenticated(true);
        return { success: true };
      }
      
      return { 
        success: false, 
        error: '아이디 또는 비밀번호가 올바르지 않습니다.' 
      };
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      // Simulated logout delay
      await new Promise(resolve => setTimeout(resolve, 500));
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    isAuthenticated,
    user,
    isLoading,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
