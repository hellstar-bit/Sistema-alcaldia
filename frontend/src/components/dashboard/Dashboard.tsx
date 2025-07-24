// frontend/src/components/dashboard/Dashboard.tsx
import React, { useState } from 'react';
import {
  ChartBarIcon,
  DocumentArrowUpIcon,
  CurrencyDollarIcon,
  UsersIcon,
  ArrowTrendingUpIcon,
  ExclamationTriangleIcon,
  CalendarDaysIcon,
  DocumentTextIcon,
  BanknotesIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  changeType: 'positive' | 'negative' | 'neutral';
  icon: React.ComponentType<any>;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, change, changeType, icon: Icon }) => {
  const changeColor = {
    positive: 'text-success-600',
    negative: 'text-danger-600',
    neutral: 'text-gray-600'
  }[changeType];

  const changeIcon = {
    positive: '↗️',
    negative: '↘️',
    neutral: '➡️'
  }[changeType];

  return (
    <div className="card p-4 sm:p-6 hover:shadow-card-hover transition-shadow duration-200">
      <div className="flex items-center justify-between min-w-0">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1 truncate">{title}</p>
          <p className="text-xl sm:text-2xl font-bold text-primary-900 truncate">{value}</p>
          <p className={`text-xs sm:text-sm ${changeColor} flex items-center mt-1`}>
            <span className="mr-1">{changeIcon}</span>
            <span className="truncate">{change}</span>
          </p>
        </div>
        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0 ml-3">
          <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-primary-600" />
        </div>
      </div>
    </div>
  );
};

interface QuickActionProps {
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  href: string;
  color: 'primary' | 'secondary' | 'success' | 'warning';
}

const QuickAction: React.FC<QuickActionProps> = ({ title, description, icon: Icon, href, color }) => {
  const colorClasses = {
    primary: 'bg-primary-50 text-primary-700 border-primary-200 hover:bg-primary-100',
    secondary: 'bg-secondary-50 text-secondary-700 border-secondary-200 hover:bg-secondary-100',
    success: 'bg-success-50 text-success-700 border-success-200 hover:bg-success-100',
    warning: 'bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100'
  }[color];

  return (
    <a 
      href={href}
      className={`block p-3 sm:p-4 rounded-lg border-2 transition-colors duration-200 ${colorClasses}`}
    >
      <div className="flex items-start space-x-3">
        <Icon className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0 mt-1" />
        <div className="min-w-0">
          <h3 className="font-medium text-xs sm:text-sm truncate">{title}</h3>
          <p className="text-xs opacity-75 mt-1 line-clamp-2">{description}</p>
        </div>
      </div>
    </a>
  );
};

interface RecentActivityItem {
  id: string;
  type: 'upload' | 'process' | 'alert' | 'export';
  title: string;
  description: string;
  timestamp: string;
  user: string;
}

const RecentActivity: React.FC<{ activities: RecentActivityItem[] }> = ({ activities }) => {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'upload':
        return <DocumentArrowUpIcon className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600" />;
      case 'process':
        return <ClockIcon className="w-4 h-4 sm:w-5 sm:h-5 text-secondary-600" />;
      case 'alert':
        return <ExclamationTriangleIcon className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600" />;
      case 'export':
        return <DocumentTextIcon className="w-4 h-4 sm:w-5 sm:h-5 text-success-600" />;
      default:
        return <ChartBarIcon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'upload':
        return 'bg-primary-50';
      case 'process':
        return 'bg-secondary-50';
      case 'alert':
        return 'bg-yellow-50';
      case 'export':
        return 'bg-success-50';
      default:
        return 'bg-gray-50';
    }
  };

  return (
    <div className="space-y-2 sm:space-y-3">
      {activities.map((activity) => (
        <div key={activity.id} className="flex items-start space-x-3 p-2 sm:p-3 rounded-lg hover:bg-gray-50 transition-colors duration-150">
          <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center ${getActivityColor(activity.type)} flex-shrink-0`}>
            {getActivityIcon(activity.type)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">{activity.title}</p>
            <p className="text-xs text-gray-500 truncate">{activity.description}</p>
            <div className="flex items-center space-x-2 mt-1">
              <span className="text-xs text-gray-400 truncate">{activity.user}</span>
              <span className="text-xs text-gray-300">•</span>
              <span className="text-xs text-gray-400 truncate">{activity.timestamp}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  const stats = [
    {
      title: 'Cartera Total',
      value: '$2.456.789.123',
      change: '+12.5% vs mes anterior',
      changeType: 'positive' as const,
      icon: CurrencyDollarIcon
    },
    {
      title: 'EPS Activas',
      value: '24',
      change: 'Sin cambios',
      changeType: 'neutral' as const,
      icon: UsersIcon
    },
    {
      title: 'IPS Registradas',
      value: '156',
      change: '+3 nuevas este mes',
      changeType: 'positive' as const,
      icon: ArrowTrendingUpIcon
    },
    {
      title: 'Alertas Pendientes',
      value: '8',
      change: '-2 vs semana anterior',
      changeType: 'positive' as const,
      icon: ExclamationTriangleIcon
    }
  ];

  const quickActions = [
    {
      title: 'Cargar Información Cartera',
      description: 'Subir archivo Excel con datos de cartera',
      icon: DocumentArrowUpIcon,
      href: '/cartera/upload',
      color: 'primary' as const
    },
    {
      title: 'Cargar Información Flujo',
      description: 'Subir archivo Excel con datos de flujo',
      icon: BanknotesIcon,
      href: '/flujo/upload',
      color: 'secondary' as const
    },
    {
      title: 'Ver Dashboards EPS',
      description: 'Analizar datos por entidades promotoras',
      icon: ChartBarIcon,
      href: '/dashboards/eps',
      color: 'success' as const
    },
    {
      title: 'Información Base',
      description: 'Gestionar datos maestros del sistema',
      icon: DocumentTextIcon,
      href: '/base',
      color: 'warning' as const
    }
  ];

  const recentActivities: RecentActivityItem[] = [
    {
      id: '1',
      type: 'upload',
      title: 'Archivo de cartera cargado',
      description: 'COMPENSAR - Enero 2024 (1,250 registros)',
      timestamp: 'hace 15 minutos',
      user: user?.name || 'Usuario'
    },
    {
      id: '2',
      type: 'process',
      title: 'Procesamiento completado',
      description: 'Dashboard EPS actualizado correctamente',
      timestamp: 'hace 1 hora',
      user: 'Sistema'
    },
    {
      id: '3',
      type: 'alert',
      title: 'Alerta de vencimiento',
      description: 'SURA - Cartera vencida mayor a 360 días',
      timestamp: 'hace 2 horas',
      user: 'Sistema'
    },
    {
      id: '4',
      type: 'export',
      title: 'Reporte exportado',
      description: 'Dashboard Total - Febrero 2024.xlsx',
      timestamp: 'hace 3 horas',
      user: 'Admin'
    },
    {
      id: '5',
      type: 'upload',
      title: 'Archivo de flujo cargado',
      description: 'FAMISANAR - Febrero 2024 (892 registros)',
      timestamp: 'hace 4 horas',
      user: 'Ana García'
    }
  ];

  const formatGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 18) return 'Buenas tardes';
    return 'Buenas noches';
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header de Bienvenida - RESPONSIVO */}
      <div className="bg-gradient-to-r from-primary-900 to-primary-800 rounded-xl p-4 sm:p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="min-w-0 flex-1">
            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold mb-2">
              {formatGreeting()}, {user?.name?.split(' ')[0] || 'Usuario'}! 👋
            </h1>
            <p className="text-primary-200 text-sm sm:text-base">
              Bienvenido al Sistema de Gestión Presupuestal - Alcaldía de Barranquilla
            </p>
            <p className="text-primary-300 text-xs sm:text-sm mt-1">
              Última conexión: {new Date().toLocaleDateString('es-CO', { 
                weekday: 'short', 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric' 
              })}
            </p>
          </div>
          <div className="hidden sm:block flex-shrink-0 ml-4">
            <div className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <ChartBarIcon className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Filtros de período - RESPONSIVO */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-semibold text-primary-900">Resumen General</h2>
          <p className="text-gray-600 text-sm">Métricas principales del sistema</p>
        </div>
        <div className="flex items-center space-x-2">
          <CalendarDaysIcon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
          <select 
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="week">Esta semana</option>
            <option value="month">Este mes</option>
            <option value="quarter">Este trimestre</option>
            <option value="year">Este año</option>
          </select>
        </div>
      </div>

      {/* Tarjetas de Estadísticas - GRID RESPONSIVO */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* Acciones Rápidas y Actividad Reciente - RESPONSIVO */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Acciones Rápidas */}
        <div className="lg:col-span-1">
          <div className="card p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-primary-900 mb-4">
              ⚡ Acciones Rápidas
            </h3>
            <div className="grid grid-cols-1 gap-3">
              {quickActions.map((action, index) => (
                <QuickAction key={index} {...action} />
              ))}
            </div>
          </div>
        </div>

        {/* Actividad Reciente */}
        <div className="lg:col-span-2">
          <div className="card p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base sm:text-lg font-semibold text-primary-900">
                📈 Actividad Reciente
              </h3>
              <a 
                href="/activity" 
                className="text-sm text-primary-600 hover:text-primary-800 font-medium"
              >
                Ver todas →
              </a>
            </div>
            <RecentActivity activities={recentActivities} />
          </div>
        </div>
      </div>

      {/* Estado del Sistema - RESPONSIVO */}
      <div className="card p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold text-primary-900 mb-4">
          🖥️ Estado del Sistema
        </h3>
        <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          <div className="flex items-center space-x-3 p-3 bg-success-50 rounded-lg">
            <div className="w-3 h-3 bg-success-500 rounded-full animate-pulse flex-shrink-0"></div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-success-800">Base de Datos</p>
              <p className="text-xs text-success-600">Conectada y funcionando</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-success-50 rounded-lg">
            <div className="w-3 h-3 bg-success-500 rounded-full animate-pulse flex-shrink-0"></div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-success-800">API Backend</p>
              <p className="text-xs text-success-600">Respondiendo correctamente</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-success-50 rounded-lg">
            <div className="w-3 h-3 bg-success-500 rounded-full animate-pulse flex-shrink-0"></div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-success-800">Almacenamiento</p>
              <p className="text-xs text-success-600">85% disponible</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
