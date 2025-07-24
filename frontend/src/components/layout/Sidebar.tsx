// frontend/src/components/layout/Sidebar.tsx
import React, { useState } from 'react';
import {
  HomeIcon,
  DocumentArrowUpIcon,
  ChartBarIcon,
  InformationCircleIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  Bars3Icon,
  XMarkIcon,
  CreditCardIcon,
  BanknotesIcon,
  BuildingLibraryIcon,
  ChartPieIcon,
  DocumentTextIcon,
  TableCellsIcon
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
          w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left transition-all duration-200 group
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
              flex-shrink-0 w-5 h-5 transition-colors duration-200
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
  const [currentPath, setCurrentPath] = useState('/carga/cartera'); // Simular ruta actual

  const handleItemClick = (item: MenuItem) => {
    if (item.href) {
      setCurrentPath(item.href);
      // Aquí iría la navegación real: navigate(item.href)
      console.log('Navigating to:', item.href);
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

      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 h-full bg-white shadow-xl z-30 transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        w-80 lg:translate-x-0 lg:static lg:z-auto
      `}>
        {/* Header del Sidebar */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary-900 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">A</span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-primary-900">SGP</h2>
              <p className="text-xs text-gray-500">Sistema de Gestión</p>
            </div>
          </div>
          
          <button
            onClick={onToggle}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <XMarkIcon className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Navegación */}
        <nav className="p-4 h-full overflow-y-auto">
          <div className="space-y-2">
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

          {/* Footer del Sidebar */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="bg-primary-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 text-sm">
                <div className="w-2 h-2 bg-success-500 rounded-full animate-pulse"></div>
                <span className="text-primary-900 font-medium">Sistema Online</span>
              </div>
              <p className="text-xs text-primary-700 mt-1">
                Conectado a la base de datos
              </p>
            </div>
          </div>
        </nav>
      </div>
    </>
  );
};