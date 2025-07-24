// frontend/src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  firstName: string;
  lastName: string;
  role: string;
  avatar?: string;
  lastLogin?: Date;
}

interface LoginRequest {
  email: string;
  password: string;
}

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

  const checkStoredSession = () => {
    console.log('🔍 AuthProvider: Verificando sesión almacenada...');
    
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    
    if (storedUser && storedToken) {
      try {
        const userData = JSON.parse(storedUser);
        console.log('✅ AuthProvider: Sesión encontrada:', userData);
        setUser(userData);
      } catch (error) {
        console.error('❌ AuthProvider: Error parsing stored user data:', error);
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
    console.log('🔐 AuthProvider: Intentando login con:', credentials.email);
    setIsLoading(true);
    
    try {
      // Simulación de llamada a API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (credentials.email === 'admin@barranquilla.gov.co' && credentials.password === 'admin123') {
        const userData: User = {
          id: '1',
          email: credentials.email,
          name: 'Administrador Sistema',
          firstName: 'Administrador',
          lastName: 'Sistema',
          role: 'ADMIN',
          avatar: '',
          lastLogin: new Date()
        };

        const token = 'fake-jwt-token-' + Date.now();
        
        // Guardar en localStorage
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', token);
        
        setUser(userData);
        console.log('✅ AuthProvider: Login exitoso:', userData);
      } else {
        throw new Error('Credenciales inválidas');
      }
    } catch (error) {
      console.error('❌ AuthProvider: Error en login:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    console.log('🚪 AuthProvider: Cerrando sesión...');
    clearStoredSession();
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
    userName: user?.name || 'No user'
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
