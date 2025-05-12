import axios from 'axios';
import { User, SocialAccount, Post, Analytics } from '../types';

const api = axios.create({
  baseURL: '/api',
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Auth endpoints
export const login = async (email: string, password: string) => {
  const response = await api.post('/auth/login', { email, password });
  return response.data;
};

// User endpoints
export const getCurrentUser = async (): Promise<User> => {
  const response = await api.get('/user');
  return response.data;
};

// Social accounts endpoints
export const getSocialAccounts = async (): Promise<SocialAccount[]> => {
  const response = await api.get('/accounts');
  return response.data;
};

// Posts endpoints
export const getPosts = async (): Promise<Post[]> => {
  const response = await api.get('/posts');
  return response.data;
};

export const createPost = async (postData: Omit<Post, 'id' | 'userId' | 'status'>): Promise<Post> => {
  const response = await api.post('/posts', postData);
  return response.data;
};

// Analytics endpoints
export const getAnalytics = async (): Promise<Analytics> => {
  const response = await api.get('/analytics');
  return response.data;
};

// Content suggestions endpoints
export const getContentSuggestions = async (platform: string, kpi: string, topic: string) => {
  const response = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/content-suggestions`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ platform, kpi, topic }),
    }
  );
  
  if (!response.ok) {
    throw new Error('Failed to get content suggestions');
  }
  
  return response.json();
};

export default api;