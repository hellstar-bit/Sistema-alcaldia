// Agregar una función helper para determinar si debe mostrar collapsed
// frontend/src/components/layout/Sidebar.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  HomeIcon,
  DocumentTextIcon,
  ChartBarIcon,
  UserGroupIcon,
  Cog6ToothIcon,
  Bars3Icon,
  XMarkIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  BuildingLibraryIcon,
  BanknotesIcon,
  ClipboardDocumentListIcon,
  DocumentArrowUpIcon,
  ArrowUpTrayIcon,
  CalendarIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

interface MenuItem {
  id: string;
  label: string;
  href?: string;
  icon: React.ComponentType<any>;
  children?: MenuItem[];
  badge?: string;
}

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  isCollapsed: boolean;
  onCollapseToggle: () => void;
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

// Hook para manejar gestos touch
const useSwipeGesture = (onSwipeLeft: () => void, onSwipeRight: () => void) => {
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.changedTouches[0].screenX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    touchEndX.current = e.changedTouches[0].screenX;
    handleSwipe();
  };

  const handleSwipe = () => {
    const swipeThreshold = 50;
    const swipeDistance = touchStartX.current - touchEndX.current;

    if (Math.abs(swipeDistance) > swipeThreshold) {
      if (swipeDistance > 0) {
        onSwipeLeft();
      } else {
        onSwipeRight();
      }
    }
  };

  return { handleTouchStart, handleTouchEnd };
};



const menuItems: MenuItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard Principal',
    href: '/dashboard',
    icon: HomeIcon,
  },
  {
    id: 'carga-informacion',
    label: 'Carga de Información',
    icon: DocumentArrowUpIcon,
    children: [
      {
        id: 'info-cartera',
        label: 'Información Cartera',
        href: '/carga/cartera',
        icon: BanknotesIcon,
      },
      {
        id: 'info-flujo',
        label: 'Información Flujo',
        href: '/carga/flujo',
        icon: BuildingLibraryIcon,
      },
      {
        id: 'info-adres',
        label: 'Información ADRES',
        href: '/carga/adres',
        icon: ArrowUpTrayIcon,
      },
    ],
  },
  {
    id: 'dashboards-eps',
    label: 'Dashboards EPS',
    icon: ChartBarIcon,
    children: [
      {
        id: 'cartera-dashboard',
        label: 'Cartera',
        icon: BanknotesIcon,
        children: [
          {
            id: 'dashboard-periodo',
            label: 'Dashboard por Período',
            href: '/dashboards/cartera/periodo',
            icon: CalendarIcon,
          },
          {
            id: 'dashboard-eps-ips',
            label: 'Dashboard EPS e IPS',
            href: '/dashboards/cartera/eps-ips',
            icon: BuildingLibraryIcon,
          },
          {
            id: 'dashboard-ips',
            label: 'Dashboard IPS',
            href: '/dashboards/cartera/ips',
            icon: BuildingLibraryIcon,
          },
          {
            id: 'dashboard-total',
            label: 'Dashboard Total',
            href: '/dashboards/cartera/total',
            icon: ChartBarIcon,
          },
        ],
      },
      {
        id: 'flujo-dashboard',
        label: 'Flujo',
        icon: ClockIcon,
        children: [
          {
            id: 'dashboard-flujo',
            label: 'Dashboard Flujo',
            href: '/dashboards/flujo',
            icon: ChartBarIcon,
          },
        ],
      },
    ],
  },
  {
    id: 'informacion-base',
    label: 'Información Base',
    icon: DocumentTextIcon,
    children: [
      {
        id: 'base-cartera',
        label: 'Cartera',
        href: '/base/cartera',
        icon: BanknotesIcon,
      },
      {
        id: 'base-adres',
        label: 'ADRES',
        href: '/base/adres',
        icon: DocumentTextIcon,
      },
      {
        id: 'base-flujo',
        label: 'Flujo',
        href: '/base/flujo',
        icon: ClockIcon,
      },
    ],
  },
  {
    id: 'reportes',
    label: 'Reportes',
    icon: DocumentTextIcon,
    children: [
      {
        id: 'reportes-mensuales',
        label: 'Reportes Mensuales',
        href: '/reportes/mensuales',
        icon: DocumentTextIcon,
      },
      {
        id: 'reportes-tendencias',
        label: 'Análisis de Tendencias',
        href: '/reportes/tendencias',
        icon: ChartBarIcon,
      },
    ],
  },
  {
    id: 'gestion',
    label: 'Gestión EPS/IPS',
    icon: UserGroupIcon,
    children: [
      {
        id: 'gestion-eps',
        label: 'Gestión EPS',
        href: '/gestion/eps',
        icon: BuildingLibraryIcon,
      },
      {
        id: 'gestion-ips',
        label: 'Gestión IPS',
        href: '/gestion/ips',
        icon: BuildingLibraryIcon,
      },
    ],
  },
  {
    id: 'configuracion',
    label: 'Configuración',
    icon: Cog6ToothIcon,
    children: [
      {
        id: 'config-usuarios',
        label: 'Gestión de Usuarios',
        href: '/config/usuarios',
        icon: UserGroupIcon,
      },
      {
        id: 'config-sistema',
        label: 'Configuración del Sistema',
        href: '/config/sistema',
        icon: Cog6ToothIcon,
      },
    ],
  },
];

interface MenuItemComponentProps {
  item: MenuItem;
  level: number;
  currentPath: string;
  onItemClick: (item: MenuItem) => void;
  isCollapsed: boolean;
  expandedItems: Set<string>;
  setExpandedItems: React.Dispatch<React.SetStateAction<Set<string>>>;
  screenSize: any;
  shouldBeCollapsed: () => boolean;
}

const MenuItemComponent: React.FC<MenuItemComponentProps> = ({
  item,
  level,
  currentPath,
  onItemClick,
  isCollapsed,
  expandedItems,
  setExpandedItems,
  screenSize,
  shouldBeCollapsed
}) => {
  const isActive = currentPath === item.href;
  const isExpanded = expandedItems.has(item.id);
  const hasChildren = item.children && item.children.length > 0;
  const Icon = item.icon;

  const handleClick = () => {
    if (hasChildren) {
      const newExpanded = new Set(expandedItems);
      if (isExpanded) {
        newExpanded.delete(item.id);
      } else {
        newExpanded.add(item.id);
      }
      setExpandedItems(newExpanded);
    } else {
      onItemClick(item);
    }
  };

  const getItemPadding = () => {
    if (shouldBeCollapsed() && level === 0) return 'px-3';
    if (level === 0) return screenSize.isMobile ? 'px-4' : 'px-4';
    return screenSize.isMobile ? `pl-${8 + level * 4} pr-4` : `pl-${6 + level * 4} pr-4`;
  };

  const getItemHeight = () => {
    if (screenSize.isMobile) return 'h-12';
    return shouldBeCollapsed() ? 'h-11' : 'h-10';
  };

  return (
    <>
      <button
        onClick={handleClick}
        className={`
          w-full flex items-center ${getItemPadding()} ${getItemHeight()}
          text-left rounded-lg transition-all duration-200 ease-in-out
          group relative overflow-hidden
          ${isActive 
            ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-md' 
            : 'text-gray-700 hover:bg-gray-100 hover:text-primary-900'
          }
          ${screenSize.isMobile ? 'text-base' : 'text-sm'}
          ${shouldBeCollapsed() && level === 0 ? 'justify-center' : 'justify-between'}
          focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-opacity-50
        `}
        title={shouldBeCollapsed() ? item.label : undefined}
      >
        <div className="flex items-center space-x-3 min-w-0 flex-1">
          <Icon className={`
            ${screenSize.isMobile ? 'w-6 h-6' : 'w-5 h-5'} 
            flex-shrink-0
            ${isActive ? 'text-white' : 'text-gray-500 group-hover:text-primary-900'}
            transition-colors duration-200
          `} />
          
          {!shouldBeCollapsed() && (
            <span className={`
              font-medium truncate
              ${screenSize.isMobile ? 'text-base' : 'text-sm'}
            `}>
              {item.label}
            </span>
          )}
          
          {!shouldBeCollapsed() && item.badge && (
            <span className="px-2 py-1 text-xs bg-success-100 text-success-800 rounded-full font-medium">
              {item.badge}
            </span>
          )}
        </div>

        {!shouldBeCollapsed() && hasChildren && (
          <ChevronDownIcon className={`
            w-4 h-4 flex-shrink-0 transition-transform duration-200
            ${isExpanded ? 'rotate-180' : ''}
            ${isActive ? 'text-white' : 'text-gray-400'}
          `} />
        )}

        {/* Indicador de activo */}
        {isActive && (
          <div className="absolute left-0 top-0 w-1 h-full bg-white rounded-r-full" />
        )}
      </button>

      {/* Submenu */}
      {hasChildren && isExpanded && !shouldBeCollapsed() && (
        <div className={`
          space-y-1 transition-all duration-300 ease-in-out
          ${screenSize.isMobile ? 'mt-1 mb-2' : 'mt-1'}
        `}>
          {item.children!.map((child) => (
            <MenuItemComponent
              key={child.id}
              item={child}
              level={level + 1}
              currentPath={currentPath}
              onItemClick={onItemClick}
              isCollapsed={isCollapsed}
              expandedItems={expandedItems}
              setExpandedItems={setExpandedItems}
              screenSize={screenSize}
              shouldBeCollapsed={shouldBeCollapsed}
            />
          ))}
        </div>
      )}
    </>
  );
};

export const Sidebar: React.FC<SidebarProps> = ({ 
  isOpen, 
  onToggle, 
  isCollapsed, 
  onCollapseToggle 
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const screenSize = useScreenSize();
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Gestión de swipe para mobile
  const { handleTouchStart, handleTouchEnd } = useSwipeGesture(
    () => {
      if (screenSize.isMobile && isOpen) {
        onToggle();
      }
    },
    () => {
      if (screenSize.isMobile && !isOpen) {
        onToggle();
      }
    }
  );

  // Auto-expandir elementos activos
  useEffect(() => {
    const findActiveParents = (items: MenuItem[], path: string, parents: string[] = []): string[] => {
      for (const item of items) {
        if (item.href === path) {
          return parents;
        }
        if (item.children) {
          const found = findActiveParents(item.children, path, [...parents, item.id]);
          if (found.length > 0) {
            return found;
          }
        }
      }
      return [];
    };

    const activeParents = findActiveParents(menuItems, location.pathname);
    if (activeParents.length > 0) {
      setExpandedItems(new Set(activeParents));
    }
  }, [location.pathname]);

  // Cerrar sidebar en mobile cuando cambia la ruta
  useEffect(() => {
    if (screenSize.isMobile && isOpen) {
      onToggle();
    }
  }, [location.pathname]);

  // Auto-colapsar en tablet si está expandido
  useEffect(() => {
    if (screenSize.isTablet && !isCollapsed) {
      onCollapseToggle();
    }
  }, [screenSize.isTablet]);

  const handleItemClick = (item: MenuItem) => {
    if (item.href) {
      navigate(item.href);
    }
  };

  // Calcular ancho del sidebar basado en el tamaño de pantalla
  const getSidebarWidth = () => {
    if (screenSize.isMobile) return 'w-80'; // Siempre 320px en mobile, sin colapsar
    if (screenSize.isTablet) return isCollapsed ? 'w-16' : 'w-72'; // 288px en tablet
    return isCollapsed ? 'w-16' : 'w-80'; // 320px en desktop
  };

  // Determinar si el sidebar debe estar colapsado (solo en desktop/tablet)
  const shouldBeCollapsed = () => {
    if (screenSize.isMobile) return false; // Nunca colapsado en móvil
    return isCollapsed;
  };

  const getSidebarClasses = () => {
    const baseClasses = `
      fixed top-0 left-0 h-full bg-white shadow-xl z-30 
      transition-all duration-300 ease-in-out flex flex-col
      ${getSidebarWidth()}
    `;

    if (screenSize.isMobile) {
      return `${baseClasses} ${isOpen ? 'translate-x-0' : '-translate-x-full'}`;
    }

    if (screenSize.isTablet) {
      return `${baseClasses} ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:static md:z-auto`;
    }

    return `${baseClasses} translate-x-0 static z-auto`;
  };

  return (
    <>
      {/* Overlay para mobile y tablet */}
      {isOpen && (screenSize.isMobile || screenSize.isTablet) && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar Principal */}
      <div 
        ref={sidebarRef}
        className={getSidebarClasses()}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Header del Sidebar */}
        <div className={`
          flex items-center py-4 border-b border-gray-200 
          bg-gradient-to-r from-primary-900 to-primary-800 text-white flex-shrink-0
          ${shouldBeCollapsed() ? 'justify-center px-2' : 'justify-between px-4'}
          ${screenSize.isMobile ? 'h-16' : 'h-14'}
        `}>
          {!shouldBeCollapsed() && (
            <div className="flex items-center space-x-3">
              <div className={`
                bg-white rounded-lg flex items-center justify-center
                ${screenSize.isMobile ? 'w-10 h-10' : 'w-8 h-8'}
              `}>
                <span className={`
                  text-primary-900 font-bold
                  ${screenSize.isMobile ? 'text-base' : 'text-sm'}
                `}>
                  SGP
                </span>
              </div>
              <div>
                <h2 className={`
                  font-bold
                  ${screenSize.isMobile ? 'text-lg' : 'text-base'}
                `}>
                  Sistema de Gestión
                </h2>
                <p className={`
                  text-primary-200
                  ${screenSize.isMobile ? 'text-sm' : 'text-xs'}
                `}>
                  Presupuestal
                </p>
              </div>
            </div>
          )}
          
          {/* Botón de colapsar para desktop */}
          {screenSize.isDesktop && (
            <button
              onClick={onCollapseToggle}
              className="p-2 rounded-lg hover:bg-primary-800 transition-colors"
              title={isCollapsed ? 'Expandir sidebar' : 'Contraer sidebar'}
            >
              <Bars3Icon className="w-4 h-4" />
            </button>
          )}

          {/* Botón de cerrar para mobile/tablet */}
          {(screenSize.isMobile || screenSize.isTablet) && (
            <button
              onClick={onToggle}
              className="p-2 rounded-lg hover:bg-primary-800 transition-colors"
            >
              <XMarkIcon className={`${screenSize.isMobile ? 'w-6 h-6' : 'w-5 h-5'}`} />
            </button>
          )}
        </div>

        {/* Navegación */}
        <nav className="flex-1 overflow-y-auto py-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
          <div className={`space-y-1 ${shouldBeCollapsed() ? 'px-2' : 'px-4'}`}>
            {menuItems.map((item) => (
              <MenuItemComponent
                key={item.id}
                item={item}
                level={0}
                currentPath={location.pathname}
                onItemClick={handleItemClick}
                isCollapsed={shouldBeCollapsed()}
                expandedItems={expandedItems}
                setExpandedItems={setExpandedItems}
                screenSize={screenSize}
                shouldBeCollapsed={shouldBeCollapsed}
              />
            ))}
          </div>
        </nav>

        {/* Información adicional (solo visible cuando no está colapsado) */}
        {!shouldBeCollapsed() && (
          <>
            {/* Información del Usuario */}
            <div className="px-4 py-3 border-t border-gray-200 flex-shrink-0">
              <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-lg p-3 border border-primary-200">
                <div className="flex items-center space-x-3">
                  <div className={`
                    bg-primary-900 rounded-full flex items-center justify-center
                    ${screenSize.isMobile ? 'w-10 h-10' : 'w-8 h-8'}
                  `}>
                    <span className={`
                      text-white font-medium
                      ${screenSize.isMobile ? 'text-sm' : 'text-xs'}
                    `}>
                      AS
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`
                      font-medium text-primary-900 truncate
                      ${screenSize.isMobile ? 'text-base' : 'text-sm'}
                    `}>
                      Admin Sistema
                    </p>
                    <p className={`
                      text-primary-700
                      ${screenSize.isMobile ? 'text-sm' : 'text-xs'}
                    `}>
                      Administrador
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Estadísticas Rápidas (solo en desktop y tablet expandido) */}
            {!screenSize.isMobile && (
              <div className="px-4 py-3 border-t border-gray-100 flex-shrink-0">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Estadísticas Rápidas
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600">EPS Activas</span>
                    <span className="font-medium text-primary-900">24</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600">IPS Registradas</span>
                    <span className="font-medium text-primary-900">156</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600">Última Carga</span>
                    <span className="font-medium text-success-600">Hace 2h</span>
                  </div>
                </div>
              </div>
            )}

            {/* Footer del Sidebar */}
            <div className="px-4 py-3 border-t border-gray-200 flex-shrink-0">
              <div className="bg-gradient-to-br from-success-50 to-success-100 rounded-lg p-3 border border-success-200">
                <div className="flex items-center space-x-2 text-xs">
                  <div className="w-2 h-2 bg-success-500 rounded-full animate-pulse"></div>
                  <span className="text-success-800 font-medium">Sistema Online</span>
                </div>
                <div className={`mt-2 space-y-1 text-xs text-success-700 ${screenSize.isMobile ? 'text-sm' : ''}`}>
                  <div className="flex items-center justify-between">
                    <span>Base de Datos</span>
                    <span className="font-medium">✓ OK</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Última Sync</span>
                    <span className="font-medium">
                      {new Date().toLocaleTimeString('es-CO', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
};