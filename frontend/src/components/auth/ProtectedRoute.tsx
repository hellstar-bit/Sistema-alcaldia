// frontend/src/components/auth/ProtectedRoute.tsx
import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Login } from './Login';

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  fallback 
}) => {
  const { isAuthenticated, isLoading } = useAuth();

  // Mostrar spinner mientras se verifica la autenticación
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg font-medium">Verificando sesión...</p>
          <p className="text-primary-200 text-sm mt-2">Sistema de Gestión Presupuestal</p>
        </div>
      </div>
    );
  }

  // Si no está autenticado, mostrar login o fallback
  if (!isAuthenticated) {
    return fallback || <Login onLoginSuccess={() => {}} />;
  }

  // Si está autenticado, mostrar el contenido protegido
  return <>{children}</>;
};