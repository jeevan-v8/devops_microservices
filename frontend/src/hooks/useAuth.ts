import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getAccessToken, isTokenExpired, refreshAccessToken, removeTokens } from '@/utils/auth';

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const token = getAccessToken();
      if (token && !isTokenExpired(token)) {
        setIsAuthenticated(true);
      } else if (token && isTokenExpired(token)) {
        try {
          await refreshAccessToken();
          setIsAuthenticated(true);
        } catch (error) {
          setIsAuthenticated(false);
          removeTokens();
          router.push('/login');
        }
      } else {
        setIsAuthenticated(false);
        router.push('/login');
      }
    };

    checkAuth();
  }, [router]);

  const logout = () => {
    removeTokens();
    setIsAuthenticated(false);
    router.push('/login');
  };

  return { isAuthenticated, logout };
};