import { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext();

export function AuthProvider({children}) {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordRequired, setPasswordRequired] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      await checkPasswordRequired();
      const savedAuth = localStorage.getItem('cloud_dock_auth');
      const savedPassword = localStorage.getItem('cloud_dock_password');

      if (savedAuth === 'true' && savedPassword) {
        setIsAuthenticated(true);
        setPassword(savedPassword);
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const checkPasswordRequired = async () => {
    try {
      const response = await fetch('/api/check-password');
      const data = await response.json();
      setPasswordRequired(data.required);
      if (!data.required) {
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Error checking password requirement:', error);
      setPasswordRequired(false);
      setIsAuthenticated(true);
    }
  };

  const login = (userPassword) => {
    setPassword(userPassword);
    setIsAuthenticated(true);
    localStorage.setItem('cloud_dock_auth', 'true');
    localStorage.setItem('cloud_dock_password', userPassword);
  };

  const logout = () => {
    setPassword('');
    setIsAuthenticated(false);
    localStorage.removeItem('cloud_dock_auth');
    localStorage.removeItem('cloud_dock_password');
  };

  return (
    <AuthContext.Provider value={{
      password,
      isAuthenticated,
      passwordRequired,
      isLoading,
      login,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}