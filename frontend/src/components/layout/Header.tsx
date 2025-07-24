// frontend/src/components/layout/Header.tsx
import React from 'react';
import {
  Bars3Icon,
  BellIcon,
  UserCircleIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import { useSweetAlert } from '../../hooks/useSweetAlert';

interface HeaderProps {
  onMenuClick: () => void;
  onCollapseClick: () => void;
  isSidebarCollapsed: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick, onCollapseClick, isSidebarCollapsed }) => {
  const { user, logout } = useAuth();
  const { showConfirm } = useSweetAlert();

  const handleLogout = async () => {
    const result = await showConfirm({
      title: '¿Cerrar Sesión?',
      text: '¿Estás seguro que deseas salir del sistema?',
      icon: 'question',
      confirmButtonText: 'Sí, cerrar sesión',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      logout();
    }
  };

  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Left Section */}
        <div className="flex items-center space-x-4">
          {/* Mobile Menu Button */}
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Bars3Icon className="w-6 h-6 text-gray-600" />
          </button>

          {/* Desktop Collapse Button */}
          <button
            onClick={onCollapseClick}
            className="hidden lg:flex p-2 rounded-lg hover:bg-gray-100 transition-colors items-center space-x-2"
            title={isSidebarCollapsed ? 'Expandir sidebar' : 'Contraer sidebar'}
          >
            {isSidebarCollapsed ? (
              <ChevronRightIcon className="w-5 h-5 text-gray-600" />
            ) : (
              <ChevronLeftIcon className="w-5 h-5 text-gray-600" />
            )}
          </button>

          {/* Breadcrumb */}
          <nav className="hidden md:flex items-center space-x-2 text-sm">
            <span className="text-gray-500">Inicio</span>
            <span className="text-gray-400">/</span>
            <span className="text-gray-500">Carga de Información</span>
            <span className="text-gray-400">/</span>
            <span className="text-primary-900 font-medium">Información Cartera</span>
          </nav>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <button className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <BellIcon className="w-6 h-6 text-gray-600" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-danger-500 rounded-full"></span>
          </button>

          {/* User Menu */}
          <div className="flex items-center space-x-3">
            <div className="hidden md:block text-right">
              <p className="text-sm font-medium text-gray-900">{user?.name}</p>
              <p className="text-xs text-gray-500">{user?.role}</p>
            </div>
            
            {/* User Avatar with Dropdown */}
            <div className="relative group">
              <button className="flex items-center space-x-2 p-1 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="w-8 h-8 bg-primary-900 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {user ? getInitials(user.name) : 'U'}
                  </span>
                </div>
              </button>

              {/* Dropdown Menu */}
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="py-2">
                  <a href="#" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    <UserCircleIcon className="w-4 h-4 mr-3" />
                    Mi Perfil
                  </a>
                  <a href="#" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    <Cog6ToothIcon className="w-4 h-4 mr-3" />
                    Configuración
                  </a>
                  <hr className="my-2" />
                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center px-4 py-2 text-sm text-danger-600 hover:bg-danger-50"
                  >
                    <ArrowRightOnRectangleIcon className="w-4 h-4 mr-3" />
                    Cerrar Sesión
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
