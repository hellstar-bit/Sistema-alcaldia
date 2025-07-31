// frontend/src/components/layout/Header.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  Bars3Icon,
  BellIcon,
  UserCircleIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  EllipsisVerticalIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import { useSweetAlert } from '../../hooks/useSweetAlert';

interface HeaderProps {
  onMenuClick: () => void;
  onCollapseClick: () => void;
  isSidebarCollapsed: boolean;
}

// Hook personalizado para detectar el tamaño de pantalla
const useScreenSize = () => {
  const [screenSize, setScreenSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  useEffect(() => {
    const handleResize = () => {
      setScreenSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return {
    ...screenSize,
    isMobile: screenSize.width < 768,
    isTablet: screenSize.width >= 768 && screenSize.width < 1024,
    isDesktop: screenSize.width >= 1024,
    isLarge: screenSize.width >= 1280,
  };
};

// Hook para manejar clics fuera del elemento
const useClickOutside = (ref: React.RefObject<HTMLElement | null>, handler: () => void) => {
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        handler();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [ref, handler]);
};

export const Header: React.FC<HeaderProps> = ({ 
  onMenuClick, 
  onCollapseClick, 
  isSidebarCollapsed 
}) => {
  const { user, logout } = useAuth();
  const { showConfirm } = useSweetAlert();
  const screenSize = useScreenSize();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  // Cerrar menú de usuario al hacer clic fuera
  useClickOutside(userMenuRef, () => setIsUserMenuOpen(false));

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
    setIsUserMenuOpen(false);
  };

  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getBreadcrumbPath = () => {
    // Mantener el breadcrumb estático original del proyecto
    return [
      { label: 'Inicio', href: '/dashboard' },
      { label: 'Carga de Información', href: '#' },
      { label: 'Información Cartera', href: '/carga/cartera', current: true }
    ];
  };

  return (
    <header className={`
      bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10
      ${screenSize.isMobile ? 'px-4 py-3' : 'px-6 py-4'}
      transition-all duration-300 ease-in-out
    `}>
      <div className="flex items-center justify-between">
        {/* Left Section */}
        <div className="flex items-center space-x-4 flex-1 min-w-0">
          {/* Mobile Menu Button */}
          {(screenSize.isMobile || screenSize.isTablet) && (
            <button
              onClick={onMenuClick}
              className={`
                p-2 rounded-lg hover:bg-gray-100 transition-colors
                ${screenSize.isMobile ? 'w-10 h-10' : 'w-9 h-9'}
              `}
              aria-label="Abrir menú"
            >
              <Bars3Icon className={`${screenSize.isMobile ? 'w-6 h-6' : 'w-5 h-5'} text-gray-600`} />
            </button>
          )}

          {/* Desktop Collapse Button */}
          {screenSize.isDesktop && (
            <button
              onClick={onCollapseClick}
              className="flex p-2 rounded-lg hover:bg-gray-100 transition-colors items-center space-x-2"
              title={isSidebarCollapsed ? 'Expandir sidebar' : 'Contraer sidebar'}
              aria-label={isSidebarCollapsed ? 'Expandir sidebar' : 'Contraer sidebar'}
            >
              {isSidebarCollapsed ? (
                <ChevronRightIcon className="w-5 h-5 text-gray-600" />
              ) : (
                <ChevronLeftIcon className="w-5 h-5 text-gray-600" />
              )}
            </button>
          )}

          {/* Breadcrumb - Solo visible en desktop */}
          {screenSize.isDesktop && (
            <nav className="flex items-center space-x-2 text-sm min-w-0">
              {getBreadcrumbPath().map((item, index) => (
                <React.Fragment key={item.label}>
                  {index > 0 && <span className="text-gray-400">/</span>}
                  <span className={`
                    truncate
                    ${item.current 
                      ? 'text-primary-900 font-medium' 
                      : 'text-gray-500 hover:text-gray-700 cursor-pointer'
                    }
                  `}>
                    {item.label}
                  </span>
                </React.Fragment>
              ))}
            </nav>
          )}

          {/* Search Bar - Solo visible en tablet y desktop */}
          {!screenSize.isMobile && (
            <div className={`
              relative flex-1 max-w-md
              ${screenSize.isTablet ? 'max-w-xs' : ''}
            `}>
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  ref={searchRef}
                  type="text"
                  placeholder="Buscar..."
                  className={`
                    w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg
                    focus:ring-2 focus:ring-primary-500 focus:border-primary-500
                    transition-all duration-200 text-sm
                    ${isSearchFocused ? 'bg-white shadow-md' : 'bg-gray-50'}
                  `}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                />
              </div>
            </div>
          )}
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-2 md:space-x-4">
          {/* Search Button - Solo visible en mobile */}
          {screenSize.isMobile && (
            <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
              <MagnifyingGlassIcon className="w-5 h-5 text-gray-600" />
            </button>
          )}

          {/* Notifications */}
          <button className={`
            relative p-2 rounded-lg hover:bg-gray-100 transition-colors
            ${screenSize.isMobile ? 'w-10 h-10' : 'w-9 h-9'}
          `}>
            <BellIcon className={`${screenSize.isMobile ? 'w-6 h-6' : 'w-5 h-5'} text-gray-600`} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-danger-500 rounded-full animate-pulse"></span>
          </button>

          {/* User Menu */}
          <div className="flex items-center space-x-3">
            {/* User Info - Solo visible en desktop */}
            {screenSize.isDesktop && (
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900 truncate max-w-32">
                  {user?.name || 'Usuario'}
                </p>
                <p className="text-xs text-gray-500 truncate max-w-32">
                  {user?.role || 'Rol'}
                </p>
              </div>
            )}
            
            {/* User Avatar with Dropdown */}
            <div className="relative" ref={userMenuRef}>
              <button 
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className={`
                  flex items-center space-x-2 p-1 rounded-lg hover:bg-gray-100 
                  transition-colors focus:outline-none focus:ring-2 
                  focus:ring-primary-500 focus:ring-opacity-50
                  ${screenSize.isMobile ? 'p-2' : 'p-1'}
                `}
                aria-expanded={isUserMenuOpen}
                aria-haspopup="true"
              >
                <div className={`
                  bg-primary-900 rounded-full flex items-center justify-center
                  ${screenSize.isMobile ? 'w-10 h-10' : 'w-8 h-8'}
                `}>
                  <span className={`
                    text-white font-medium
                    ${screenSize.isMobile ? 'text-sm' : 'text-xs'}
                  `}>
                    {user ? getInitials(user.name) : 'U'}
                  </span>
                </div>
                
                {/* Dropdown indicator - Solo en tablet y desktop */}
                {!screenSize.isMobile && (
                  <EllipsisVerticalIcon className="w-4 h-4 text-gray-400" />
                )}
              </button>

              {/* Dropdown Menu */}
              {isUserMenuOpen && (
                <div className={`
                  absolute right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200
                  py-2 z-50 min-w-48 transform transition-all duration-200
                  ${screenSize.isMobile ? 'w-56' : 'w-48'}
                `}>
                  {/* User info en mobile */}
                  {screenSize.isMobile && (
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">
                        {user?.name || 'Usuario'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {user?.role || 'Rol'}
                      </p>
                    </div>
                  )}

                  <button
                    onClick={() => setIsUserMenuOpen(false)}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 transition-colors flex items-center space-x-3"
                  >
                    <UserCircleIcon className="w-4 h-4" />
                    <span>Mi Perfil</span>
                  </button>
                  
                  <button
                    onClick={() => setIsUserMenuOpen(false)}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 transition-colors flex items-center space-x-3"
                  >
                    <Cog6ToothIcon className="w-4 h-4" />
                    <span>Configuración</span>
                  </button>
                  
                  <div className="border-t border-gray-100 my-1"></div>
                  
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2 text-left text-sm text-danger-600 hover:bg-danger-50 transition-colors flex items-center space-x-3"
                  >
                    <ArrowRightOnRectangleIcon className="w-4 h-4" />
                    <span>Cerrar Sesión</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};