import { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

interface DecodedToken {
  id: number;
  role: string;
  email: string;
  username: string;
  iat: number;
  exp: number;
}

const useAuth = () => {
  const [user, setUser] = useState<{ id: number; role: string; email: string; username: string; } | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decodedToken: DecodedToken = jwtDecode(token);
        if (decodedToken.exp * 1000 > Date.now()) {
          setUser({ id: decodedToken.id, role: decodedToken.role, email: decodedToken.email, username: decodedToken.username });
          setIsAuthenticated(true);
        } else {
          localStorage.removeItem('token');
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Invalid token:', error);
        setUser(null);
        setIsAuthenticated(false);
      }
    }
    setLoading(false);
  }, []);

  const login = (token: string) => {
    try {
      const decodedToken: DecodedToken = jwtDecode(token);
      setUser({ id: decodedToken.id, role: decodedToken.role, email: decodedToken.email, username: decodedToken.username });
      setIsAuthenticated(true);
      localStorage.setItem('token', token);
    } catch (error) {
      console.error('Invalid token:', error);
      logout();
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setIsAuthenticated(false);
  };

  const hasRole = (roles: string[]) => {
    return user && roles.includes(user.role);
  };

  return { user, isAuthenticated, loading, login, logout, hasRole };
};

export default useAuth; 