// frontend/src/components/layout/Sidebar.tsx
import React, { useState } from 'react';
import {
  HomeIcon,
  DocumentArrowUpIcon,
  ChartBarIcon,
  InformationCircleIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  XMarkIcon,
  CreditCardIcon,
  BanknotesIcon,
  BuildingLibraryIcon,
  ChartPieIcon,
  DocumentTextIcon,
  TableCellsIcon,
  CogIcon,
  UserGroupIcon,
  DocumentChartBarIcon,
  ClockIcon,
  ServerIcon
} from '@heroicons/react/24/outline';

interface MenuItem {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  href?: string;
  children?: MenuItem[];
  badge?: string | number;
}

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const menuItems: MenuItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard Principal',
    icon: HomeIcon,
    href: '/dashboard'
  },
  {
    id: 'carga-informacion',
    label: 'Carga de Información',
    icon: DocumentArrowUpIcon,
    children: [
      {
        id: 'info-cartera',
        label: 'Información Cartera',
        icon: CreditCardIcon,
        href: '/carga/cartera',
        badge: 'Activo'
      },
      {
        id: 'info-flujo',
        label: 'Información Flujo',
        icon: BanknotesIcon,
        href: '/carga/flujo'
      }
    ]
  },
  {
    id: 'dashboards-eps',
    label: 'Dashboards EPS',
    icon: ChartBarIcon,
    children: [
      {
        id: 'cartera-dashboard',
        label: 'Cartera',
        icon: ChartPieIcon,
        children: [
          {
            id: 'dashboard-periodo',
            label: 'Dashboard por Período',
            icon: TableCellsIcon,
            href: '/dashboards/cartera/periodo'
          },
          {
            id: 'dashboard-eps-ips',
            label: 'Dashboard EPS e IPS',
            icon: BuildingLibraryIcon,
            href: '/dashboards/cartera/eps-ips'
          },
          {
            id: 'dashboard-ips',
            label: 'Dashboard IPS',
            icon: BuildingLibraryIcon,
            href: '/dashboards/cartera/ips'
          },
          {
            id: 'dashboard-total',
            label: 'Dashboard Total',
            icon: ChartBarIcon,
            href: '/dashboards/cartera/total'
          }
        ]
      },
      {
        id: 'flujo-dashboard',
        label: 'Flujo',
        icon: BanknotesIcon,
        children: [
          {
            id: 'dashboard-flujo',
            label: 'Dashboard Flujo',
            icon: ChartBarIcon,
            href: '/dashboards/flujo'
          }
        ]
      }
    ]
  },
  {
    id: 'informacion-base',
    label: 'Información Base',
    icon: InformationCircleIcon,
    children: [
      {
        id: 'base-cartera',
        label: 'Cartera',
        icon: CreditCardIcon,
        href: '/base/cartera'
      },
      {
        id: 'base-adres',
        label: 'ADRES',
        icon: DocumentTextIcon,
        href: '/base/adres'
      },
      {
        id: 'base-flujo',
        label: 'Flujo',
        icon: BanknotesIcon,
        href: '/base/flujo'
      }
    ]
  },
  // NUEVOS ITEMS PARA LLENAR ESPACIO
  {
    id: 'reportes',
    label: 'Reportes y Análisis',
    icon: DocumentChartBarIcon,
    children: [
      {
        id: 'reportes-mensuales',
        label: 'Reportes Mensuales',
        icon: DocumentTextIcon,
        href: '/reportes/mensuales'
      },
      {
        id: 'analisis-tendencias',
        label: 'Análisis de Tendencias',
        icon: ChartBarIcon,
        href: '/reportes/tendencias'
      }
    ]
  },
  {
    id: 'configuracion',
    label: 'Configuración',
    icon: CogIcon,
    children: [
      {
        id: 'usuarios',
        label: 'Gestión de Usuarios',
        icon: UserGroupIcon,
        href: '/config/usuarios'
      },
      {
        id: 'parametros',
        label: 'Parámetros del Sistema',
        icon: CogIcon,
        href: '/config/parametros'
      }
    ]
  }
];

const MenuItemComponent: React.FC<{
  item: MenuItem;
  level: number;
  currentPath: string;
  onItemClick: (item: MenuItem) => void;
}> = ({ item, level, currentPath, onItemClick }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasChildren = item.children && item.children.length > 0;
  const isActive = currentPath === item.href;
  const isParentActive = item.children?.some(child => 
    child.href === currentPath || 
    child.children?.some(grandChild => grandChild.href === currentPath)
  );

  const handleClick = () => {
    if (hasChildren) {
      setIsExpanded(!isExpanded);
    } else {
      onItemClick(item);
    }
  };

  const paddingLeft = level === 0 ? 'pl-4' : level === 1 ? 'pl-8' : 'pl-12';
  const textSize = level === 0 ? 'text-sm' : 'text-xs';

  return (
    <>
      <button
        onClick={handleClick}
        className={`
          w-full flex items-center justify-between px-3 py-3 rounded-lg text-left transition-all duration-200 group
          ${paddingLeft} ${textSize}
          ${isActive 
            ? 'bg-primary-900 text-white shadow-md' 
            : isParentActive 
              ? 'bg-primary-50 text-primary-900 border border-primary-200' 
              : 'text-gray-700 hover:bg-gray-100 hover:text-primary-900'
          }
        `}
      >
        <div className="flex items-center space-x-3 min-w-0 flex-1">
          <item.icon 
            className={`
              flex-shrink-0 w-4 h-4 sm:w-5 sm:h-5 transition-colors duration-200
              ${isActive ? 'text-white' : isParentActive ? 'text-primary-900' : 'text-gray-500 group-hover:text-primary-900'}
            `}
          />
          <span className="font-medium truncate">{item.label}</span>
          {item.badge && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-success-100 text-success-800">
              {item.badge}
            </span>
          )}
        </div>
        
        {hasChildren && (
          <div className="flex-shrink-0 ml-2">
            {isExpanded ? (
              <ChevronDownIcon className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronRightIcon className="w-4 h-4 text-gray-400" />
            )}
          </div>
        )}
      </button>

      {hasChildren && isExpanded && (
        <div className="mt-1 space-y-1">
          {item.children!.map((child) => (
            <MenuItemComponent
              key={child.id}
              item={child}
              level={level + 1}
              currentPath={currentPath}
              onItemClick={onItemClick}
            />
          ))}
        </div>
      )}
    </>
  );
};

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle }) => {
  const [currentPath, setCurrentPath] = useState('/dashboard');

  const handleItemClick = (item: MenuItem) => {
    if (item.href) {
      setCurrentPath(item.href);
      console.log('Navigating to:', item.href);
      if (window.innerWidth < 1024) {
        onToggle();
      }
    }
  };

  return (
    <>
      {/* Overlay para mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar Principal - REDISTRIBUCIÓN DE ESPACIO */}
      <div className={`
        fixed top-0 left-0 h-full bg-white shadow-xl z-30 transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        w-80 lg:translate-x-0 lg:static lg:z-auto
        flex flex-col
      `}>
        {/* Header del Sidebar - MAS COMPACTO */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-primary-900 to-primary-800 text-white flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <span className="text-primary-900 font-bold text-sm">A</span>
            </div>
            <div>
              <h2 className="text-base font-bold">SGP</h2>
              <p className="text-xs text-primary-200">Sistema de Gestión</p>
            </div>
          </div>
          
          <button
            onClick={onToggle}
            className="lg:hidden p-2 rounded-lg hover:bg-primary-800 transition-colors"
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>

        {/* Navegación - EXPANDIDA PARA LLENAR ESPACIO */}
        <nav className="flex-1 overflow-y-auto py-4">
          <div className="space-y-2 px-4">
            {menuItems.map((item) => (
              <MenuItemComponent
                key={item.id}
                item={item}
                level={0}
                currentPath={currentPath}
                onItemClick={handleItemClick}
              />
            ))}
          </div>
        </nav>

        {/* Información del Usuario - SECCIÓN MEDIA */}
        <div className="px-4 py-3 border-t border-gray-200 flex-shrink-0">
          <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-lg p-3 border border-primary-200">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary-900 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-medium">AS</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-primary-900 truncate">Admin Sistema</p>
                <p className="text-xs text-primary-700">Administrador</p>
              </div>
            </div>
          </div>
        </div>

        {/* Estadísticas Rápidas - NUEVA SECCIÓN */}
        <div className="px-4 py-3 border-t border-gray-100 flex-shrink-0">
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Estadísticas Rápidas</h4>
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

        {/* Footer del Sidebar - MEJORADO */}
        <div className="px-4 py-3 border-t border-gray-200 flex-shrink-0">
          <div className="bg-gradient-to-br from-success-50 to-success-100 rounded-lg p-3 border border-success-200">
            <div className="flex items-center space-x-2 text-xs">
              <div className="w-2 h-2 bg-success-500 rounded-full animate-pulse"></div>
              <span className="text-success-800 font-medium">Sistema Online</span>
            </div>
            <div className="mt-2 space-y-1 text-xs text-success-700">
              <div className="flex items-center justify-between">
                <span>Base de Datos</span>
                <span className="font-medium">✓ OK</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Última Sync</span>
                <span className="font-medium">{new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Accesos Rápidos - NUEVA SECCIÓN FINAL */}
        <div className="px-4 py-3 border-t border-gray-100 flex-shrink-0">
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Accesos Rápidos</h4>
          <div className="grid grid-cols-2 gap-2">
            <button className="flex flex-col items-center p-2 rounded-lg hover:bg-gray-50 transition-colors">
              <DocumentArrowUpIcon className="w-4 h-4 text-primary-600 mb-1" />
              <span className="text-xs text-gray-600">Cargar</span>
            </button>
            <button className="flex flex-col items-center p-2 rounded-lg hover:bg-gray-50 transition-colors">
              <ChartBarIcon className="w-4 h-4 text-primary-600 mb-1" />
              <span className="text-xs text-gray-600">Reportes</span>
            </button>
            <button className="flex flex-col items-center p-2 rounded-lg hover:bg-gray-50 transition-colors">
              <CogIcon className="w-4 h-4 text-primary-600 mb-1" />
              <span className="text-xs text-gray-600">Config</span>
            </button>
            <button className="flex flex-col items-center p-2 rounded-lg hover:bg-gray-50 transition-colors">
              <ServerIcon className="w-4 h-4 text-primary-600 mb-1" />
              <span className="text-xs text-gray-600">Sistema</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
