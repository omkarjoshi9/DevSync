import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, setAuthTokens, clearAuthTokens, isAuthenticated, getAuthTokens } from '../lib/api';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  subscriptionTier: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    if (!isAuthenticated()) {
      setLoading(false);
      return;
    }

    try {
      const response = await api.getCurrentUser();
      if (response.success && response.data) {
        setUser(response.data.user);
      } else {
        clearAuthTokens();
      }
    } catch (error) {
      // Silently fail - user might not be authenticated
      clearAuthTokens();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const response = await api.login({ email, password });
    if (response.success && response.data) {
      setAuthTokens(response.data.accessToken, response.data.refreshToken);
      setUser(response.data.user);
      navigate('/');
      return { success: true };
    }
    return { success: false, error: response.error?.message || 'Login failed' };
  };

  const register = async (email: string, password: string, firstName: string, lastName: string) => {
    const response = await api.register({ email, password, firstName, lastName });
    if (response.success && response.data) {
      setAuthTokens(response.data.accessToken, response.data.refreshToken);
      setUser(response.data.user);
      navigate('/');
      return { success: true };
    }
    return { success: false, error: response.error?.message || 'Registration failed' };
  };

  const googleAuth = async (idToken: string) => {
    const response = await api.googleAuth(idToken);
    if (response.success && response.data) {
      setAuthTokens(response.data.accessToken, response.data.refreshToken);
      setUser(response.data.user);
      navigate('/');
      return { success: true };
    }
    return { success: false, error: response.error?.message || 'Google authentication failed' };
  };

  const logout = async () => {
    const { refreshToken } = getAuthTokens();
    if (refreshToken) {
      await api.logout(refreshToken);
    }
    clearAuthTokens();
    setUser(null);
    navigate('/login');
  };

  return {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    register,
    googleAuth,
    logout,
  };
};

