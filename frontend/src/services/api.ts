// frontend/src/services/api.ts - VERSIÓN COMPLETA PARA PRODUCCIÓN
import axios, { AxiosResponse } from 'axios';

// Usar la URL de Render para producción
const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';

console.log('🌐 API Base URL:', API_BASE_URL);
console.log('🌍 Environment:', import.meta.env.VITE_ENV);

// Crear instancia de axios
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 300000, // Aumentar timeout para Render (servicios gratuitos pueden ser lentos)
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
      baseURL: API_BASE_URL,
      fullURL: `${API_BASE_URL}${config.url}`
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
      success: response.data?.success,
      responseTime: response.headers['x-response-time'] || 'N/A'
    });
    return response;
  },
  (error) => {
    console.error(`❌ API Response Error: ${error.config?.method?.toUpperCase()} ${error.config?.url}`, {
      status: error.response?.status,
      message: error.message,
      baseURL: API_BASE_URL,
      isNetworkError: !error.response,
      responseData: error.response?.data
    });

    // Manejar errores específicos
    if (error.code === 'ECONNABORTED') {
      console.error('⏰ Request timeout - El servidor tardó demasiado en responder');
    }

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
    try {
      const response = await api.post('/auth/login', credentials);
      console.log('✅ Login exitoso');
      return response.data;
    } catch (error) {
      console.error('❌ Error en login:', error);
      throw error;
    }
  },

  getProfile: async (): Promise<ApiResponse<{ user: User }>> => {
    console.log('👤 AuthAPI: Obteniendo perfil de usuario...');
    try {
      const response = await api.get('/auth/profile');
      return response.data;
    } catch (error) {
      console.error('❌ Error obteniendo perfil:', error);
      throw error;
    }
  },

  logout: async (): Promise<ApiResponse> => {
    console.log('🚪 AuthAPI: Notificando logout al servidor...');
    try {
      const response = await api.post('/auth/logout');
      return response.data;
    } catch (error) {
      console.error('❌ Error en logout:', error);
      // No lanzar error en logout, solo limpiar local
      return { success: true, message: 'Logout local', data: null };
    }
  },

  // Método para verificar conectividad
  healthCheck: async (): Promise<boolean> => {
    try {
      console.log('🏥 Verificando conectividad con el servidor...');
      const response = await api.get('/health', { timeout: 10000 });
      console.log('✅ Servidor conectado:', response.data);
      return true;
    } catch (error) {
      console.error('❌ Servidor no disponible:', error);
      return false;
    }
  }
};

// Función de utilidad para verificar si estamos en producción
export const isProduction = (): boolean => {
  return import.meta.env.VITE_ENV === 'production';
};

// Función de utilidad para obtener la URL base
export const getApiBaseUrl = (): string => {
  return API_BASE_URL;
};

export default api;