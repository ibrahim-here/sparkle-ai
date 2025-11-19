import api from './axios';

export interface SignupData {
  email: string;
  password: string;
  name: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    profilePicture: string | null;
    authProvider: string;
  };
}

export interface UserResponse {
  success: boolean;
  user: {
    id: string;
    email: string;
    name: string;
    profilePicture: string | null;
    authProvider: string;
    createdAt: string;
    lastLogin: string;
  };
}

export const authAPI = {
  signup: async (data: SignupData): Promise<AuthResponse> => {
    const response = await api.post('/api/auth/signup', data);
    return response.data;
  },

  login: async (data: LoginData): Promise<AuthResponse> => {
    const response = await api.post('/api/auth/login', data);
    return response.data;
  },

  getMe: async (): Promise<UserResponse> => {
    const response = await api.get('/api/auth/me');
    return response.data;
  },

  logout: async (): Promise<void> => {
    await api.post('/api/auth/logout');
  },

  getGoogleAuthUrl: (): string => {
    return `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/google`;
  },
};
