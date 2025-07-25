// frontend/src/contexts/AuthContext.tsx - VERSIÓN CORREGIDA CON API REAL
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI, type User, type LoginRequest } from '../services/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('🔄 AuthProvider: Iniciando verificación de sesión...');
    checkStoredSession();
  }, []);

  const checkStoredSession = async () => {
    console.log('🔍 AuthProvider: Verificando sesión almacenada...');
    
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    
    console.log('📊 AuthProvider: Estado localStorage:', {
      hasUser: !!storedUser,
      hasToken: !!storedToken,
      userPreview: storedUser ? JSON.parse(storedUser).name : 'N/A',
      tokenPreview: storedToken ? storedToken.substring(0, 20) + '...' : 'N/A'
    });
    
    if (storedUser && storedToken) {
      try {
        // Verificar si el token sigue siendo válido
        console.log('🔐 AuthProvider: Verificando token con el backend...');
        const profileResponse = await authAPI.getProfile();
        
        if (profileResponse.success) {
          console.log('✅ AuthProvider: Token válido, sesión restaurada:', profileResponse.data.user);
          setUser(profileResponse.data.user);
        } else {
          console.log('❌ AuthProvider: Token inválido, limpiando sesión');
          clearStoredSession();
        }
      } catch (error: any) {
        console.error('❌ AuthProvider: Error verificando token:', error);
        clearStoredSession();
      }
    } else {
      console.log('ℹ️ AuthProvider: No hay sesión almacenada');
    }
    
    setIsLoading(false);
    console.log('✅ AuthProvider: Verificación completada, isLoading = false');
  };

  const clearStoredSession = () => {
    console.log('🧹 AuthProvider: Limpiando sesión...');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const login = async (credentials: LoginRequest): Promise<void> => {
    console.log('🔐 AuthProvider: Intentando login con API real:', credentials.email);
    setIsLoading(true);
    
    try {
      const response = await authAPI.login(credentials);
      
      if (response.success && response.data) {
        const { user: userData, token } = response.data;
        
        // Guardar en localStorage
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', token);
        
        setUser(userData);
        console.log('✅ AuthProvider: Login exitoso con API real:', userData);
        console.log('🎟️ AuthProvider: Token real recibido:', token.substring(0, 30) + '...');
      } else {
        throw new Error(response.message || 'Credenciales inválidas');
      }
    } catch (error: any) {
      console.error('❌ AuthProvider: Error en login:', error);
      
      // Mensaje de error más específico
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Error de conexión con el servidor';
      
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    console.log('🚪 AuthProvider: Cerrando sesión...');
    
    try {
      // Notificar al backend sobre el logout
      await authAPI.logout();
    } catch (error) {
      console.warn('⚠️ AuthProvider: Error al notificar logout al backend:', error);
    } finally {
      clearStoredSession();
    }
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      console.log('📝 AuthProvider: Usuario actualizado:', updatedUser);
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    updateUser
  };

  console.log('🔄 AuthProvider: Estado actual:', {
    isAuthenticated: !!user,
    isLoading,
    userName: user?.name || 'No user',
    hasToken: !!localStorage.getItem('token')
  });

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};