import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { authAPI } from '../api/auth.api';
import type { SignupData, LoginData } from '../api/auth.api';
import Toast from '../components/notifications/Toast';

interface User {
  id: string;
  email: string;
  name: string;
  profilePicture: string | null;
  authProvider: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (data: LoginData) => Promise<void>;
  signup: (data: SignupData) => Promise<void>;
  loginWithGoogle: () => void;
  logout: () => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Check if user is logged in on mount
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await authAPI.getMe();
          setUser(response.user);
        } catch (err) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  // Handle Google OAuth callback
  useEffect(() => {
    const handleOAuthCallback = async () => {
      const params = new URLSearchParams(window.location.search);
      const token = params.get('token');

      if (token && window.location.pathname === '/auth/callback') {
        localStorage.setItem('token', token);
        try {
          const response = await authAPI.getMe();
          setUser(response.user);
          window.history.replaceState({}, '', '/');
        } catch (err) {
          setError('Failed to authenticate with Google');
          localStorage.removeItem('token');
        }
      }
    };

    handleOAuthCallback();
  }, []);

  const signup = async (data: SignupData) => {
    try {
      setError(null);
      setLoading(true);
      const response = await authAPI.signup(data);
      localStorage.setItem('token', response.token);
      setUser(response.user);
      setToast({ message: 'Account created successfully!', type: 'success' });
    } catch (err: any) {
      const message = err.response?.data?.message || 'Signup failed';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  const login = async (data: LoginData) => {
    try {
      setError(null);
      setLoading(true);
      const response = await authAPI.login(data);
      localStorage.setItem('token', response.token);
      setUser(response.user);
      setToast({ message: 'Welcome back!', type: 'success' });
    } catch (err: any) {
      const message = err.response?.data?.message || 'Login failed';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = () => {
    window.location.href = authAPI.getGoogleAuthUrl();
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    authAPI.logout().catch(() => {});
  };

  const clearError = () => {
    setError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        signup,
        loginWithGoogle,
        logout,
        clearError,
      }}
    >
      {children}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
