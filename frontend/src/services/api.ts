// frontend/src/services/api.ts - VERSIÓN CORREGIDA
import axios, { AxiosResponse } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';

// Crear instancia de axios
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Variable para evitar bucles de redirección
let isRedirecting = false;

// Interceptor para agregar token automáticamente
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log(`🌐 API Request: ${config.method?.toUpperCase()} ${config.url}`, {
      hasToken: !!token,
      headers: config.headers
    });
    return config;
  },
  (error) => {
    console.error('❌ API Request Error:', error);
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas
api.interceptors.response.use(
  (response: AxiosResponse) => {
    console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, {
      status: response.status,
      success: response.data?.success
    });
    return response;
  },
  (error) => {
    console.error(`❌ API Response Error: ${error.config?.method?.toUpperCase()} ${error.config?.url}`, {
      status: error.response?.status,
      message: error.message
    });

    if (error.response?.status === 401 && !isRedirecting) {
      console.warn('🔓 Token expirado o inválido, limpiando sesión...');
      
      // Evitar bucles de redirección
      isRedirecting = true;
      
      // Limpiar almacenamiento local
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Redirigir después de un pequeño delay para evitar bucles
      setTimeout(() => {
        isRedirecting = false;
        if (window.location.pathname !== '/') {
          window.location.href = '/';
        }
      }, 100);
    }
    
    return Promise.reject(error);
  }
);

// Tipos de respuesta
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
}

export interface User {
  id: string;
  email: string;
  name: string;
  firstName: string;
  lastName: string;
  role: string;
  avatar?: string;
  lastLogin?: Date;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
}

// Servicios de autenticación
export const authAPI = {
  login: async (credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> => {
    console.log('🔐 AuthAPI: Enviando credenciales de login...');
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  getProfile: async (): Promise<ApiResponse<{ user: User }>> => {
    console.log('👤 AuthAPI: Obteniendo perfil de usuario...');
    const response = await api.get('/auth/profile');
    return response.data;
  },

  logout: async (): Promise<ApiResponse> => {
    console.log('🚪 AuthAPI: Notificando logout al servidor...');
    const response = await api.post('/auth/logout');
    return response.data;
  },
};

export default api;