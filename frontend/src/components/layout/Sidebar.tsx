// frontend/src/components/layout/Sidebar.tsx
// MODIFICACIÓN: Cambiar "Dashboards EPS" por "Dashboards EPS/IPS" como enlace directo

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
  ClockIcon,
  DocumentChartBarIcon
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

// ✅ MODIFICACIÓN: Estructura de menú actualizada
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
    id: 'dashboards-eps-ips',
    label: 'Dashboards EPS/IPS',
    href: '/dashboards/eps-ips',
    icon: ChartBarIcon,
  },
  // ✅ NUEVA SECCIÓN DE REPORTES AVANZADOS
  {
    id: 'reportes-avanzados',
    label: 'Reportes Avanzados',
    icon: DocumentChartBarIcon,
    children: [
      {
        id: 'reporte-eps-avanzado',
        label: 'Reporte EPS Comparativo',
        href: '/reportes/eps-avanzado',
        icon: BuildingLibraryIcon,
        badge: 'Nuevo', // Badge para destacar
      },
      {
        id: 'reporte-tendencias',
        label: 'Análisis de Tendencias',
        href: '/reportes/tendencias',
        icon: ChartBarIcon,
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
        id: 'config-sistema',
        label: 'Sistema',
        href: '/configuracion/sistema',
        icon: Cog6ToothIcon,
      },
      {
        id: 'config-usuarios',
        label: 'Usuarios',
        href: '/configuracion/usuarios',
        icon: UserGroupIcon,
      },
    ],
  },
];

// Componente para renderizar cada item del menú
interface MenuItemComponentProps {
  item: MenuItem;
  level: number;
  currentPath: string;
  onItemClick: (item: MenuItem) => void;
  isCollapsed: boolean;
  expandedItems: Set<string>;
  setExpandedItems: React.Dispatch<React.SetStateAction<Set<string>>>;
  screenSize: ReturnType<typeof useScreenSize>;
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
  const hasChildren = item.children && item.children.length > 0;
  const isExpanded = expandedItems.has(item.id);
  const isActive = item.href === currentPath || (item.children && item.children.some(child => child.href === currentPath));

  const handleClick = () => {
    if (hasChildren && !shouldBeCollapsed()) {
      const newExpanded = new Set(expandedItems);
      if (isExpanded) {
        newExpanded.delete(item.id);
      } else {
        newExpanded.add(item.id);
      }
      setExpandedItems(newExpanded);
    } else if (item.href) {
      onItemClick(item);
    }
  };

  const paddingLeft = shouldBeCollapsed() ? 'pl-4' : level === 0 ? 'pl-4' : level === 1 ? 'pl-8' : 'pl-12';

  return (
    <>
      <button
        onClick={handleClick}
        className={`
          w-full flex items-center justify-between rounded-lg transition-all duration-200 relative
          ${paddingLeft} pr-4
          ${screenSize.isMobile ? 'py-3' : 'py-2'}
          ${isActive 
            ? 'bg-primary-900 text-white shadow-lg' 
            : 'text-gray-300 hover:bg-primary-800 hover:text-white'
          }
          ${shouldBeCollapsed() ? 'justify-center' : ''}
        `}
        title={shouldBeCollapsed() ? item.label : undefined}
      >
        <div className="flex items-center space-x-3 min-w-0">
          <item.icon className={`
            flex-shrink-0
            ${screenSize.isMobile ? 'w-6 h-6' : 'w-5 h-5'}
            ${isActive ? 'text-white' : 'text-gray-400'}
          `} />
          
          {!shouldBeCollapsed() && (
            <div className="flex items-center space-x-2 min-w-0 flex-1">
              <span className={`
                font-medium truncate
                ${screenSize.isMobile ? 'text-sm' : 'text-xs'}
                ${isActive ? 'text-white' : 'text-gray-300'}
              `}>
                {item.label}
              </span>
              
              {/* Badge para elementos nuevos o destacados */}
              {item.badge && (
                <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                  {item.badge}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Icono de expansión solo para items con children */}
        {hasChildren && !shouldBeCollapsed() && (
          <ChevronDownIcon className={`
            w-4 h-4 transition-transform duration-200
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

  // Función helper para determinar si debe estar colapsado
  const shouldBeCollapsed = () => {
    return (screenSize.isDesktop && isCollapsed) || screenSize.isTablet;
  };

  // Calcular ancho del sidebar basado en el tamaño de pantalla
  const getSidebarWidth = () => {
    if (screenSize.isMobile) return 'w-80';
    if (screenSize.isTablet) return isCollapsed ? 'w-16' : 'w-72';
    return isCollapsed ? 'w-16' : 'w-72';
  };

  return (
    <>
      {/* Overlay para mobile */}
      {screenSize.isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div
        ref={sidebarRef}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className={`
          fixed left-0 top-0 h-full bg-gradient-to-b from-primary-900 via-primary-800 to-primary-900 
          text-white shadow-2xl transition-all duration-300 ease-in-out z-50 flex flex-col
          ${getSidebarWidth()}
          ${screenSize.isMobile 
            ? (isOpen ? 'translate-x-0' : '-translate-x-full')
            : 'translate-x-0'
          }
        `}
      >
        {/* Header del Sidebar */}
        <div className={`
          flex items-center justify-between border-b border-primary-700 flex-shrink-0
          ${screenSize.isMobile ? 'px-6 py-4' : 'px-4 py-3'}
        `}>
          {/* Logo/Título */}
          {!shouldBeCollapsed() && (
            <div className="flex items-center space-x-3">
              <div className={`
                bg-white rounded-lg p-2 flex items-center justify-center
                ${screenSize.isMobile ? 'w-10 h-10' : 'w-8 h-8'}
              `}>
                <ChartBarIcon className={`
                  text-primary-900
                  ${screenSize.isMobile ? 'w-6 h-6' : 'w-5 h-5'}
                `} />
              </div>
              <div>
                <h1 className={`
                  font-bold text-white
                  ${screenSize.isMobile ? 'text-lg' : 'text-sm'}
                `}>
                  Sistema
                </h1>
                <p className={`
                  text-primary-300
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
                isCollapsed={isCollapsed}
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
                      ${screenSize.isMobile ? 'text-sm' : 'text-xs'}
                    `}>
                      Admin Sistema
                    </p>
                    <p className={`
                      text-primary-700
                      ${screenSize.isMobile ? 'text-sm' : 'text-xs'}
                    `}>
                      En línea
                    </p>
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