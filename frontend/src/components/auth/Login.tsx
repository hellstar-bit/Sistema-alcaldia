// frontend/src/components/auth/Login.tsx
import React, { useState } from 'react';
import {
  EyeIcon,
  EyeSlashIcon,
  UserIcon,
  LockClosedIcon,
  BuildingLibraryIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import { useSweetAlert } from '../../hooks/useSweetAlert';

interface LoginForm {
  email: string;
  password: string;
  rememberMe: boolean;
}

export const Login: React.FC = () => {
  console.log('🔐 Login: Componente renderizado - VERSIÓN COMPLETA');
  
  const [formData, setFormData] = useState<LoginForm>({
    email: '',
    password: '',
    rememberMe: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Partial<LoginForm>>({});

  const { login, isLoading } = useAuth();
  const { showSuccess, showError, showLoading, close } = useSweetAlert();

  const validateForm = (): boolean => {
    const newErrors: Partial<LoginForm> = {};

    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'El email no es válido';
    }

    if (!formData.password.trim()) {
      newErrors.password = 'La contraseña es requerida';
    } else if (formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('🚀 Login: Enviando formulario completo...');
    
    if (!validateForm()) {
      return;
    }

    showLoading('Verificando credenciales...', 'Conectando con el servidor');

    try {
      await login({
        email: formData.email,
        password: formData.password
      });
      
      close();
      showSuccess('¡Bienvenido al Sistema!', {
        title: '¡Bienvenido al Sistema!',
        text: 'Acceso autorizado correctamente'
      });
    } catch (error: any) {
      close();
      showError({
        title: 'Error de Autenticación',
        text: error.message
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    if (errors[name as keyof LoginForm]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div 
          className="absolute inset-0" 
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} 
        />
      </div>

      {/* Contenedor Principal Responsive */}
      <div className="relative w-full max-w-md mx-auto">
        {/* Logo y Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-full flex items-center justify-center mb-4 shadow-elegant">
            <BuildingLibraryIcon className="w-10 h-10 sm:w-12 sm:h-12 text-primary-900" />
          </div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-2">
            SIstema de gestión de cartera
          </h1>
          <p className="text-primary-100 text-sm sm:text-base">
            Alcaldía de Barranquilla - Sector Salud
          </p>
        </div>

        {/* Card de Login Responsive */}
        <div className="card p-6 sm:p-8">
          <div className="text-center mb-6">
            <h2 className="text-lg sm:text-xl font-bold text-primary-900 mb-2">
              Iniciar Sesión
            </h2>
            <p className="text-gray-600 text-sm">
              Ingresa tus credenciales para acceder al sistema
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Correo Electrónico
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`
                    block w-full pl-8 sm:pl-10 pr-3 py-2.5 sm:py-3 border rounded-lg 
                    focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent 
                    transition-all duration-200 text-sm sm:text-base
                    ${errors.email 
                      ? 'border-danger-500 bg-danger-50' 
                      : 'border-gray-300 hover:border-gray-400'
                    }
                  `}
                  placeholder="admin@barranquilla.gov.co"
                  disabled={isLoading}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-danger-600 flex items-center">
                  <span className="mr-1">⚠️</span> {errors.email}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LockClosedIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`
                    block w-full pl-8 sm:pl-10 pr-10 py-2.5 sm:py-3 border rounded-lg 
                    focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent 
                    transition-all duration-200 text-sm sm:text-base
                    ${errors.password 
                      ? 'border-danger-500 bg-danger-50' 
                      : 'border-gray-300 hover:border-gray-400'
                    }
                  `}
                  placeholder="••••••••"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                  ) : (
                    <EyeIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-danger-600 flex items-center">
                  <span className="mr-1">⚠️</span> {errors.password}
                </p>
              )}
            </div>

            {/* Remember Me */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
              <div className="flex items-center">
                <input
                  id="rememberMe"
                  name="rememberMe"
                  type="checkbox"
                  checked={formData.rememberMe}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  disabled={isLoading}
                />
                <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-700">
                  Recordar sesión
                </label>
              </div>
              <button
                type="button"
                className="text-sm text-primary-600 hover:text-primary-500 font-medium transition-colors"
                disabled={isLoading}
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary py-2.5 sm:py-3 text-sm sm:text-base"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Verificando...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <ShieldCheckIcon className="w-4 w-4 sm:w-5 sm:h-5 mr-2" />
                  Iniciar Sesión
                </div>
              )}
            </button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-info-50 border border-info-200 rounded-lg">
            <h4 className="text-sm font-medium text-info-800 mb-2">
              🔑 Credenciales de Prueba:
            </h4>
            <div className="text-xs sm:text-sm text-info-700 space-y-1">
              <p><strong>Email:</strong> admin@barranquilla.gov.co</p>
              <p><strong>Contraseña:</strong> admin123</p>
            </div>
          </div>
        </div>

        {/* Footer Responsive */}
        <div className="text-center mt-6 sm:mt-8">
          <p className="text-primary-100 text-xs sm:text-sm">
            © 2025 Alcaldía de Barranquilla. Todos los derechos reservados.
          </p>
          <div className="mt-2 flex flex-wrap items-center justify-center gap-2 sm:space-x-4 text-xs text-primary-200">
            <span>Seguridad SSL</span>
            <span className="hidden sm:inline">•</span>
            <span>Protección de Datos</span>
            <span className="hidden sm:inline">•</span>
            <span>Soporte 24/7</span>
          </div>
        </div>
      </div>
    </div>
  );
};
