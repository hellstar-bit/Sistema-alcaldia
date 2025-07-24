// frontend/src/components/dashboard/Dashboard.tsx
import React, { useState } from 'react';
import {
  ChartBarIcon,
  DocumentArrowUpIcon,
  CurrencyDollarIcon,
  UsersIcon,
  ExclamationTriangleIcon,
  CalendarDaysIcon,
  DocumentTextIcon,
  BanknotesIcon,
  ClockIcon,
  SparklesIcon,
  ArrowTrendingUpIcon
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

  const changeBg = {
    positive: 'bg-success-50',
    negative: 'bg-danger-50',
    neutral: 'bg-gray-50'
  }[changeType];

  return (
    <div className="card p-4 sm:p-6 hover:shadow-elegant transition-all duration-300 border-l-4 border-primary-500">
      <div className="flex items-center justify-between min-w-0">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-gray-600 mb-2 truncate">{title}</p>
          <p className="text-2xl sm:text-3xl font-bold text-primary-900 truncate mb-2">{value}</p>
          <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${changeBg} ${changeColor}`}>
            <span className="mr-1">{changeIcon}</span>
            <span className="truncate font-medium">{change}</span>
          </div>
        </div>
        <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-primary-100 to-primary-200 rounded-xl flex items-center justify-center flex-shrink-0 ml-3 shadow-sm">
          <Icon className="w-6 h-6 sm:w-7 sm:h-7 text-primary-700" />
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
    primary: 'bg-gradient-to-br from-primary-50 to-primary-100 text-primary-800 border-primary-200 hover:from-primary-100 hover:to-primary-200 hover:shadow-md',
    secondary: 'bg-gradient-to-br from-blue-50 to-blue-100 text-blue-800 border-blue-200 hover:from-blue-100 hover:to-blue-200 hover:shadow-md',
    success: 'bg-gradient-to-br from-success-50 to-success-100 text-success-800 border-success-200 hover:from-success-100 hover:to-success-200 hover:shadow-md',
    warning: 'bg-gradient-to-br from-yellow-50 to-yellow-100 text-yellow-800 border-yellow-200 hover:from-yellow-100 hover:to-yellow-200 hover:shadow-md'
  }[color];

  const iconColor = {
    primary: 'text-primary-600',
    secondary: 'text-blue-600',
    success: 'text-success-600',
    warning: 'text-yellow-600'
  }[color];

  return (
    <a 
      href={href}
      className={`block p-4 rounded-xl border-2 transition-all duration-300 transform hover:scale-105 ${colorClasses}`}
    >
      <div className="flex items-start space-x-3">
        <div className="w-10 h-10 rounded-lg bg-white bg-opacity-70 flex items-center justify-center flex-shrink-0">
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-sm truncate mb-1">{title}</h3>
          <p className="text-xs opacity-80 line-clamp-2">{description}</p>
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
        return <ClockIcon className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />;
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
        return 'bg-gradient-to-r from-primary-50 to-primary-100';
      case 'process':
        return 'bg-gradient-to-r from-blue-50 to-blue-100';
      case 'alert':
        return 'bg-gradient-to-r from-yellow-50 to-yellow-100';
      case 'export':
        return 'bg-gradient-to-r from-success-50 to-success-100';
      default:
        return 'bg-gradient-to-r from-gray-50 to-gray-100';
    }
  };

  return (
    <div className="space-y-3">
      {activities.map((activity) => (
        <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-xl hover:bg-gray-50 transition-all duration-200 border border-transparent hover:border-gray-200">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${getActivityColor(activity.type)} flex-shrink-0 shadow-sm`}>
            {getActivityIcon(activity.type)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">{activity.title}</p>
            <p className="text-xs text-gray-600 truncate mt-1">{activity.description}</p>
            <div className="flex items-center space-x-2 mt-2">
              <span className="text-xs text-gray-500 truncate">{activity.user}</span>
              <span className="text-xs text-gray-300">•</span>
              <span className="text-xs text-gray-500 truncate">{activity.timestamp}</span>
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
    <div className="space-y-6">
      {/* Header de Bienvenida Elegante */}
      <div className="bg-gradient-to-r from-primary-900 via-primary-800 to-primary-700 rounded-2xl p-6 sm:p-8 text-white shadow-elegant relative overflow-hidden">
        {/* Pattern Background */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }} />
        </div>
        
        <div className="relative flex items-center justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex items-center space-x-2 mb-3">
              <SparklesIcon className="w-6 h-6 text-yellow-300" />
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">
                {formatGreeting()}, {user?.name?.split(' ')[0] || 'Usuario'}!
              </h1>
            </div>
            <p className="text-primary-100 text-sm sm:text-base mb-2">
              Bienvenido al Sistema de Gestión Presupuestal - Alcaldía de Barranquilla
            </p>
            <div className="flex items-center space-x-4 text-xs sm:text-sm text-primary-200">
              <span>📅 {new Date().toLocaleDateString('es-CO', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</span>
              <span>🕐 {new Date().toLocaleTimeString('es-CO', { 
                hour: '2-digit', 
                minute: '2-digit'
              })}</span>
            </div>
          </div>
          <div className="hidden sm:block flex-shrink-0 ml-6">
            <div className="w-16 h-16 lg:w-20 lg:h-20 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <ChartBarIcon className="w-8 h-8 lg:w-10 lg:h-10 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Filtros y Título */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-primary-900 flex items-center space-x-2">
            <ArrowTrendingUpIcon className="w-6 h-6 text-primary-600" />
            <span>Resumen General</span>
          </h2>
          <p className="text-gray-600 text-sm mt-1">Métricas principales del sistema en tiempo real</p>
        </div>
        <div className="flex items-center space-x-3 bg-white p-3 rounded-xl shadow-sm border border-gray-200">
          <CalendarDaysIcon className="w-5 h-5 text-primary-600" />
          <select 
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="bg-transparent border-none focus:outline-none focus:ring-0 text-sm font-medium text-primary-900"
          >
            <option value="week">Esta semana</option>
            <option value="month">Este mes</option>
            <option value="quarter">Este trimestre</option>
            <option value="year">Este año</option>
          </select>
        </div>
      </div>

      {/* Tarjetas de Estadísticas */}
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* Acciones Rápidas y Actividad Reciente */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Acciones Rápidas */}
        <div className="xl:col-span-1">
          <div className="card p-6">
            <div className="flex items-center space-x-2 mb-6">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
                <SparklesIcon className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-lg font-bold text-primary-900">Acciones Rápidas</h3>
            </div>
            <div className="space-y-4">
              {quickActions.map((action, index) => (
                <QuickAction key={index} {...action} />
              ))}
            </div>
          </div>
        </div>

        {/* Actividad Reciente */}
        <div className="xl:col-span-2">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <ClockIcon className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-lg font-bold text-primary-900">Actividad Reciente</h3>
              </div>
              <a 
                href="/activity" 
                className="text-sm text-primary-600 hover:text-primary-800 font-semibold transition-colors"
              >
                Ver todas →
              </a>
            </div>
            <RecentActivity activities={recentActivities} />
          </div>
        </div>
      </div>

      {/* Estado del Sistema */}
      <div className="card p-6">
        <div className="flex items-center space-x-2 mb-6">
          <div className="w-8 h-8 bg-gradient-to-br from-success-500 to-success-600 rounded-lg flex items-center justify-center">
            <ChartBarIcon className="w-4 h-4 text-white" />
          </div>
          <h3 className="text-lg font-bold text-primary-900">Estado del Sistema</h3>
        </div>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-success-50 to-success-100 rounded-xl border border-success-200">
            <div className="w-3 h-3 bg-success-500 rounded-full animate-pulse flex-shrink-0"></div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-success-900">Base de Datos</p>
              <p className="text-xs text-success-700">Conectada y funcionando</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-success-50 to-success-100 rounded-xl border border-success-200">
            <div className="w-3 h-3 bg-success-500 rounded-full animate-pulse flex-shrink-0"></div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-success-900">API Backend</p>
              <p className="text-xs text-success-700">Respondiendo correctamente</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-success-50 to-success-100 rounded-xl border border-success-200">
            <div className="w-3 h-3 bg-success-500 rounded-full animate-pulse flex-shrink-0"></div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-success-900">Almacenamiento</p>
              <p className="text-xs text-success-700">85% disponible</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
