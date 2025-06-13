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

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decodedToken: DecodedToken = jwtDecode(token);
        setUser({ id: decodedToken.id, role: decodedToken.role, email: decodedToken.email, username: decodedToken.username });
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Invalid token:', error);
        setUser(null);
        setIsAuthenticated(false);
      }
    }
  }, []);

  return { user, isAuthenticated };
};

export default useAuth; 