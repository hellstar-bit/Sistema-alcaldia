// frontend/src/components/dashboard/Dashboard.tsx - VERSIÓN COMPLETA SIN ERRORES
import React, { useState, useEffect } from 'react';
import {
  CurrencyDollarIcon,
  UsersIcon,
  ArrowTrendingUpIcon,
  ExclamationTriangleIcon,
  DocumentArrowUpIcon,
  BanknotesIcon,
  ChartBarIcon,
  DocumentTextIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  InformationCircleIcon,
  CalendarDaysIcon,
  BuildingLibraryIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  EyeIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  useDashboardData, 
  useDataFormatting,
  type DashboardStats,
  type ChartDataPoint,
  type EPSDistribution,
  type RecentActivity,
  type SystemStatus
} from '../../hooks/useDashboardData';

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

// Tipos de componentes
interface StatCard {
  id: string;
  title: string;
  value: string;
  change: string;
  changeType: 'positive' | 'negative' | 'neutral';
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  color: string;
}

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  href: string;
  color: string;
  count?: number;
}

// Componente de tarjeta de estadística
const StatCard: React.FC<{ stat: StatCard; screenSize: any }> = ({ stat, screenSize }) => {
  const Icon = stat.icon;
  const isPositive = stat.changeType === 'positive';
  const isNegative = stat.changeType === 'negative';

  return (
    <div className={`
      bg-white rounded-xl shadow-sm border border-gray-200 p-6 
      hover:shadow-md transition-all duration-300 group
      ${screenSize.isMobile ? 'p-4' : 'p-6'}
    `}>
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <p className={`
            text-gray-600 font-medium mb-1
            ${screenSize.isMobile ? 'text-sm' : 'text-sm'}
          `}>
            {stat.title}
          </p>
          <p className={`
            font-bold text-gray-900 mb-2
            ${screenSize.isMobile ? 'text-xl' : 'text-2xl'}
          `}>
            {stat.value}
          </p>
          <div className="flex items-center space-x-1">
            {isPositive && <ArrowUpIcon className="w-4 h-4 text-success-500" />}
            {isNegative && <ArrowDownIcon className="w-4 h-4 text-danger-500" />}
            <span className={`
              text-xs font-medium
              ${isPositive ? 'text-success-600' : isNegative ? 'text-danger-600' : 'text-gray-500'}
            `}>
              {stat.change}
            </span>
          </div>
        </div>
        <div className={`
          rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200
          ${screenSize.isMobile ? 'w-12 h-12' : 'w-14 h-14'}
          ${stat.color}
        `}>
          <Icon className={`text-white ${screenSize.isMobile ? 'w-6 h-6' : 'w-7 h-7'}`} />
        </div>
      </div>
    </div>
  );
};

// Componente de acción rápida
const QuickActionCard: React.FC<{ 
  action: QuickAction; 
  screenSize: any; 
  onNavigate: (href: string) => void;
}> = ({ action, screenSize, onNavigate }) => {
  const Icon = action.icon;

  return (
    <button
      onClick={() => onNavigate(action.href)}
      className={`
        w-full bg-white rounded-xl shadow-sm border border-gray-200 p-6 
        hover:shadow-md hover:border-primary-300 transition-all duration-300 
        text-left group focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-opacity-50
        ${screenSize.isMobile ? 'p-4' : 'p-6'}
      `}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-3 mb-3">
            <div className={`
              rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200
              ${screenSize.isMobile ? 'w-10 h-10' : 'w-12 h-12'}
              ${action.color}
            `}>
              <Icon className={`text-white ${screenSize.isMobile ? 'w-5 h-5' : 'w-6 h-6'}`} />
            </div>
            {action.count && (
              <span className="bg-danger-100 text-danger-800 text-xs font-bold px-2 py-1 rounded-full">
                {action.count}
              </span>
            )}
          </div>
          <h3 className={`
            font-semibold text-gray-900 mb-2
            ${screenSize.isMobile ? 'text-sm' : 'text-base'}
          `}>
            {action.title}
          </h3>
          <p className={`
            text-gray-600 leading-relaxed
            ${screenSize.isMobile ? 'text-xs' : 'text-sm'}
          `}>
            {action.description}
          </p>
        </div>
        <ChevronRightIcon className="w-5 h-5 text-gray-400 group-hover:text-primary-500 transition-colors duration-200 flex-shrink-0 ml-3" />
      </div>
    </button>
  );
};

// Componente de actividad reciente
const RecentActivityItem: React.FC<{ 
  activity: RecentActivity; 
  screenSize: any; 
}> = ({ activity, screenSize }) => {
  const getStatusColor = () => {
    switch (activity.status) {
      case 'success': return 'bg-success-100 text-success-800';
      case 'error': return 'bg-danger-100 text-danger-800';
      case 'warning': return 'bg-warning-100 text-warning-800';
      default: return 'bg-primary-100 text-primary-800';
    }
  };

  const getStatusIcon = () => {
    switch (activity.status) {
      case 'success': return <CheckCircleIcon className="w-4 h-4" />;
      case 'error': return <XCircleIcon className="w-4 h-4" />;
      case 'warning': return <ExclamationTriangleIcon className="w-4 h-4" />;
      default: return <InformationCircleIcon className="w-4 h-4" />;
    }
  };

  return (
    <div className={`
      flex items-start space-x-4 p-4 hover:bg-gray-50 rounded-lg transition-colors duration-200
      ${screenSize.isMobile ? 'p-3' : 'p-4'}
    `}>
      <div className={`
        flex items-center justify-center rounded-full flex-shrink-0
        ${screenSize.isMobile ? 'w-8 h-8' : 'w-10 h-10'}
        ${getStatusColor()}
      `}>
        {getStatusIcon()}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`
          font-medium text-gray-900
          ${screenSize.isMobile ? 'text-sm' : 'text-sm'}
        `}>
          {activity.title}
        </p>
        <p className={`
          text-gray-600 mt-1
          ${screenSize.isMobile ? 'text-xs' : 'text-sm'}
        `}>
          {activity.description}
        </p>
        <div className="flex items-center space-x-2 mt-2">
          <span className={`
            text-gray-500
            ${screenSize.isMobile ? 'text-xs' : 'text-xs'}
          `}>
            {activity.timestamp}
          </span>
          <span className="text-gray-400">•</span>
          <span className={`
            text-gray-500 font-medium
            ${screenSize.isMobile ? 'text-xs' : 'text-xs'}
          `}>
            {activity.user}
          </span>
        </div>
      </div>
    </div>
  );
};

const formatChangeText = (change: number, changeType: 'positive' | 'negative' | 'neutral'): string => {
  if (changeType === 'neutral') return 'Sin cambios';
  const prefix = change >= 0 ? '+' : '';
  return `${prefix}${change}%`;
};

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const screenSize = useScreenSize();
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  
  // Usar datos reales del dashboard
  const {
    stats,
    chartData,
    epsDistribution,
    recentActivities,
    systemStatus,
    loading,
    error,
    refreshData,
    refreshStats,
    refreshSystemStatus
  } = useDashboardData();

   const { 
    formatCurrency, 
    formatNumber, 
    formatRelativeTime
  } = useDataFormatting();

  // Datos principales del dashboard usando datos reales
  const statsCards: StatCard[] = [
    {
      id: 'cartera-total',
      title: 'Cartera Total',
      value: stats ? formatCurrency(stats.carteraTotal.value) : '$0',
      change: stats ? `${stats.carteraTotal.change >= 0 ? '+' : ''}${stats.carteraTotal.change}%` : 'Cargando...',
      changeType: stats?.carteraTotal.changeType || 'neutral',
      icon: CurrencyDollarIcon,
      color: 'bg-primary-500'
    },
    {
      id: 'eps-activas',
      title: 'EPS Activas',
      value: stats ? formatNumber(stats.epsActivas.value) : '8',
      change: stats ? formatChangeText(stats.epsActivas.change, stats.epsActivas.changeType) : 'Cargando...',
      changeType: stats?.epsActivas.changeType || 'neutral',
      icon: BuildingLibraryIcon,
      color: 'bg-success-500'
    },
    {
      id: 'ips-registradas',
      title: 'IPS Registradas',
      value: stats ? formatNumber(stats.ipsRegistradas.value) : '0',
      change: stats ? formatChangeText(stats.ipsRegistradas.change, stats.ipsRegistradas.changeType) : 'Cargando...',
      changeType: stats?.ipsRegistradas.changeType || 'neutral',
      icon: UsersIcon,
      color: 'bg-warning-500'
    },
    {
      id: 'alertas-pendientes',
      title: 'Alertas Pendientes',
      value: stats ? formatNumber(stats.alertasPendientes.value) : '0',
      change: stats ? formatChangeText(stats.alertasPendientes.change, stats.alertasPendientes.changeType) : 'Cargando...',
      changeType: stats?.alertasPendientes.changeType || 'neutral',
      icon: ExclamationTriangleIcon,
      color: 'bg-danger-500'
    }
  ];

  const quickActions: QuickAction[] = [
  {
    id: 'cargar-cartera',
    title: 'Cargar Información Cartera',
    description: 'Subir archivo Excel con datos de cartera mensual',
    icon: DocumentArrowUpIcon,
    href: '/carga/cartera',
    color: 'bg-primary-500'
  },
  {
    id: 'cargar-flujo',
    title: 'Cargar Información Flujo',
    description: 'Subir archivo Excel con datos de flujo de caja',
    icon: BanknotesIcon,
    href: '/carga/flujo',
    color: 'bg-success-500'
  },
  {
    id: 'cargar-adres',
    title: 'Cargar Información ADRES',
    description: 'Subir archivo Excel con datos de ADRES',
    icon: DocumentTextIcon,
    href: '/carga/adres',
    color: 'bg-purple-500'
  },
  {
    id: 'ver-dashboards',
    title: 'Ver Dashboards EPS/IPS', // ✅ ACTUALIZADO: Nuevo nombre
    description: 'Analizar datos consolidados de EPS e IPS', // ✅ ACTUALIZADO: Nueva descripción
    icon: ChartBarIcon,
    href: '/dashboards/eps-ips', // ✅ ACTUALIZADO: Nueva ruta directa
    color: 'bg-warning-500'
  },
  {
    id: 'gestion-eps',
    title: 'Gestión EPS/IPS',
    description: 'Administrar entidades y sus datos maestros',
    icon: BuildingLibraryIcon,
    href: '/gestion/eps',
    color: 'bg-indigo-500',
    count: stats?.alertasPendientes.value || undefined
  },
  {
    id: 'informacion-base',
    title: 'Información Base',
    description: 'Consultar datos maestros y configuraciones',
    icon: DocumentTextIcon,
    href: '/base/cartera',
    color: 'bg-gray-500'
  }
];

  const handleNavigate = (href: string) => {
    navigate(href);
  };

  const handleRefresh = () => {
    refreshData();
  };

  const getGridCols = () => {
    if (screenSize.isMobile) return 'grid-cols-1';
    if (screenSize.isTablet) return 'grid-cols-2';
    return 'grid-cols-4';
  };

  const getQuickActionCols = () => {
    if (screenSize.isMobile) return 'grid-cols-1';
    if (screenSize.isTablet) return 'grid-cols-2';
    return 'grid-cols-3';
  };

  // Componente de estado de carga
  if (loading) {
    return (
      <div className={`
        min-h-screen bg-gray-50
        ${screenSize.isMobile ? 'p-4' : screenSize.isTablet ? 'p-6' : 'p-8'}
      `}>
        {/* Header skeleton */}
        <div className="mb-8">
          <div className="h-8 bg-gray-200 rounded-lg w-64 mb-2 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded-lg w-96 animate-pulse"></div>
        </div>

        {/* Stats skeleton */}
        <div className={`grid gap-6 mb-8 ${getGridCols()}`}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-xl animate-pulse"></div>
          ))}
        </div>

        {/* Charts skeleton */}
        <div className={`
          grid gap-6 mb-8
          ${screenSize.isMobile ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-2'}
        `}>
          <div className="h-80 bg-gray-200 rounded-xl animate-pulse"></div>
          <div className="h-80 bg-gray-200 rounded-xl animate-pulse"></div>
        </div>
      </div>
    );
  }

  // Componente de error
  if (error) {
    return (
      <div className={`
        min-h-screen bg-gray-50 flex items-center justify-center
        ${screenSize.isMobile ? 'p-4' : 'p-8'}
      `}>
        <div className="text-center">
          <ExclamationTriangleIcon className="w-16 h-16 text-danger-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error al cargar el dashboard</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={handleRefresh}
            className="bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`
      min-h-screen bg-gray-50
      ${screenSize.isMobile ? 'p-4' : screenSize.isTablet ? 'p-6' : 'p-8'}
    `}>
      {/* Header del Dashboard */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h1 className={`
            font-bold text-gray-900
            ${screenSize.isMobile ? 'text-2xl' : 'text-3xl'}
          `}>
            Dashboard Principal
          </h1>
          <div className="flex items-center space-x-4">
            {/* Botón de refresh */}
            <button
              onClick={handleRefresh}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              title="Actualizar datos"
            >
              <ArrowUpIcon className="w-5 h-5 text-gray-600" />
            </button>
            
            <div className="flex items-center space-x-2">
              <CalendarDaysIcon className="w-5 h-5 text-gray-400" />
              <span className="text-sm text-gray-600">
                {new Date().toLocaleDateString('es-CO', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            </div>
          </div>
        </div>
        <p className={`
          text-gray-600
          ${screenSize.isMobile ? 'text-sm' : 'text-base'}
        `}>
          Bienvenido de vuelta, <span className="font-semibold">{user?.name}</span>. 
          Aquí tienes un resumen de la actividad de la plataforma.
        </p>
      </div>

      {/* Tarjetas de Estadísticas */}
      <div className={`grid gap-6 mb-8 ${getGridCols()}`}>
        {statsCards.map((stat) => (
          <StatCard key={stat.id} stat={stat} screenSize={screenSize} />
        ))}
      </div>

      {/* Gráficos Principales */}
      <div className={`
        grid gap-6 mb-8
        ${screenSize.isMobile ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-2'}
      `}>
        {/* Gráfico de Evolución de Cartera */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className={`
              font-semibold text-gray-900
              ${screenSize.isMobile ? 'text-lg' : 'text-xl'}
            `}>
              Evolución de Cartera 2025
            </h3>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="text-sm border border-gray-300 rounded-lg px-3 py-1 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="month">Último año</option>
              <option value="quarter">Último trimestre</option>
              <option value="year">Últimos 3 años</option>
            </select>
          </div>
          <div className={`${screenSize.isMobile ? 'h-64' : 'h-80'}`}>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorCartera" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="month" 
                    tick={{ fontSize: screenSize.isMobile ? 10 : 12 }}
                    stroke="#6b7280"
                  />
                  <YAxis 
                    tick={{ fontSize: screenSize.isMobile ? 10 : 12 }}
                    stroke="#6b7280"
                    tickFormatter={(value) => formatCurrency(value, true)}
                  />
                  <Tooltip 
                    formatter={(value: number) => [formatCurrency(value), 'Cartera']}
                    labelStyle={{ color: '#374151' }}
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: screenSize.isMobile ? '12px' : '14px'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="cartera" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorCartera)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <ChartBarIcon className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>No hay datos disponibles</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Distribución por EPS */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className={`
            font-semibold text-gray-900 mb-6
            ${screenSize.isMobile ? 'text-lg' : 'text-xl'}
          `}>
            Distribución por EPS
          </h3>
          <div className={`${screenSize.isMobile ? 'h-64' : 'h-80'}`}>
            {epsDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={epsDistribution}
                    cx="50%"
                    cy="50%"
                    outerRadius={screenSize.isMobile ? 60 : 80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }: { name?: string; percent?: number }) => 
                      `${name || 'N/A'} ${((percent || 0) * 100).toFixed(0)}%`
                    }
                    labelLine={false}
                    fontSize={screenSize.isMobile ? 10 : 12}
                  >
                    {epsDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number, name) => [
                      `${value}%`, 
                      'Participación'
                    ]}
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: screenSize.isMobile ? '12px' : '14px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <BuildingLibraryIcon className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>No hay datos de EPS disponibles</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Acciones Rápidas */}
      <div className="mb-8">
        <h2 className={`
          font-semibold text-gray-900 mb-6
          ${screenSize.isMobile ? 'text-xl' : 'text-2xl'}
        `}>
          Acciones Rápidas
        </h2>
        <div className={`grid gap-4 ${getQuickActionCols()}`}>
          {quickActions.map((action) => (
            <QuickActionCard 
              key={action.id} 
              action={action} 
              screenSize={screenSize}
              onNavigate={handleNavigate}
            />
          ))}
        </div>
      </div>

      {/* Actividad Reciente */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className={`
              font-semibold text-gray-900
              ${screenSize.isMobile ? 'text-xl' : 'text-2xl'}
            `}>
              Actividad Reciente
            </h2>
            <div className="flex items-center space-x-2">
              <button 
                onClick={refreshData}
                className="text-sm text-gray-500 hover:text-primary-600 font-medium flex items-center space-x-1"
                title="Actualizar actividades"
              >
                <ArrowUpIcon className="w-4 h-4" />
              </button>
              <button 
                onClick={() => navigate('/reportes/mensuales')}
                className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center space-x-1"
              >
                <span>Ver todo</span>
                <EyeIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
        <div className="divide-y divide-gray-100">
          {recentActivities.length > 0 ? (
            recentActivities.map((activity) => (
              <RecentActivityItem 
                key={activity.id} 
                activity={{
                  ...activity,
                  timestamp: formatRelativeTime(activity.timestamp)
                }} 
                screenSize={screenSize}
              />
            ))
          ) : (
            <div className="p-8 text-center text-gray-500">
              <ClockIcon className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>No hay actividades recientes</p>
            </div>
          )}
        </div>
      </div>

      {/* Estado del Sistema */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className={`
              font-semibold text-gray-900
              ${screenSize.isMobile ? 'text-lg' : 'text-xl'}
            `}>
              Estado del Sistema
            </h3>
            <button
              onClick={refreshSystemStatus}
              className="text-sm text-gray-500 hover:text-primary-600 font-medium flex items-center space-x-1"
              title="Actualizar estado"
            >
              <ArrowUpIcon className="w-4 h-4" />
              <span>Actualizar</span>
            </button>
          </div>
        </div>
        <div className="p-6">
          <div className={`
            grid gap-4
            ${screenSize.isMobile ? 'grid-cols-1' : 'grid-cols-2 lg:grid-cols-3'}
          `}>
            {systemStatus && (
              <>
                <div className={`
                  flex items-center space-x-3 p-4 rounded-xl border
                  ${systemStatus.database.status === 'online' 
                    ? 'bg-gradient-to-r from-success-50 to-success-100 border-success-200' 
                    : systemStatus.database.status === 'warning'
                    ? 'bg-gradient-to-r from-warning-50 to-warning-100 border-warning-200'
                    : 'bg-gradient-to-r from-danger-50 to-danger-100 border-danger-200'
                  }
                `}>
                  <div className={`
                    w-3 h-3 rounded-full flex-shrink-0
                    ${systemStatus.database.status === 'online' 
                      ? 'bg-success-500 animate-pulse' 
                      : systemStatus.database.status === 'warning'
                      ? 'bg-warning-500'
                      : 'bg-danger-500'
                    }
                  `}></div>
                  <div className="min-w-0">
                    <p className={`
                      font-semibold
                      ${screenSize.isMobile ? 'text-sm' : 'text-sm'}
                      ${systemStatus.database.status === 'online' 
                        ? 'text-success-900' 
                        : systemStatus.database.status === 'warning'
                        ? 'text-warning-900'
                        : 'text-danger-900'
                      }
                    `}>
                      Base de Datos
                    </p>
                    <p className={`
                      ${screenSize.isMobile ? 'text-xs' : 'text-xs'}
                      ${systemStatus.database.status === 'online' 
                        ? 'text-success-700' 
                        : systemStatus.database.status === 'warning'
                        ? 'text-warning-700'
                        : 'text-danger-700'
                      }
                    `}>
                      {systemStatus.database.message}
                    </p>
                  </div>
                </div>

                <div className={`
                  flex items-center space-x-3 p-4 rounded-xl border
                  ${systemStatus.api.status === 'online' 
                    ? 'bg-gradient-to-r from-success-50 to-success-100 border-success-200' 
                    : systemStatus.api.status === 'warning'
                    ? 'bg-gradient-to-r from-warning-50 to-warning-100 border-warning-200'
                    : 'bg-gradient-to-r from-danger-50 to-danger-100 border-danger-200'
                  }
                `}>
                  <div className={`
                    w-3 h-3 rounded-full flex-shrink-0
                    ${systemStatus.api.status === 'online' 
                      ? 'bg-success-500 animate-pulse' 
                      : systemStatus.api.status === 'warning'
                      ? 'bg-warning-500'
                      : 'bg-danger-500'
                    }
                  `}></div>
                  <div className="min-w-0">
                    <p className={`
                      font-semibold
                      ${screenSize.isMobile ? 'text-sm' : 'text-sm'}
                      ${systemStatus.api.status === 'online' 
                        ? 'text-success-900' 
                        : systemStatus.api.status === 'warning'
                        ? 'text-warning-900'
                        : 'text-danger-900'
                      }
                    `}>
                      API Backend
                    </p>
                    <p className={`
                      ${screenSize.isMobile ? 'text-xs' : 'text-xs'}
                      ${systemStatus.api.status === 'online' 
                        ? 'text-success-700' 
                        : systemStatus.api.status === 'warning'
                        ? 'text-warning-700'
                        : 'text-danger-700'
                      }
                    `}>
                      {systemStatus.api.message}
                      {systemStatus.api.responseTime > 0 && (
                        <span className="ml-1">({systemStatus.api.responseTime}ms)</span>
                      )}
                    </p>
                  </div>
                </div>

                <div className={`
                  flex items-center space-x-3 p-4 rounded-xl border
                  ${systemStatus.storage.status === 'online' 
                    ? 'bg-gradient-to-r from-success-50 to-success-100 border-success-200' 
                    : systemStatus.storage.status === 'warning'
                    ? 'bg-gradient-to-r from-warning-50 to-warning-100 border-warning-200'
                    : 'bg-gradient-to-r from-danger-50 to-danger-100 border-danger-200'
                  }
                `}>
                  <div className={`
                    w-3 h-3 rounded-full flex-shrink-0
                    ${systemStatus.storage.status === 'online' 
                      ? 'bg-success-500 animate-pulse' 
                      : systemStatus.storage.status === 'warning'
                      ? 'bg-warning-500'
                      : 'bg-danger-500'
                    }
                  `}></div>
                  <div className="min-w-0">
                    <p className={`
                      font-semibold
                      ${screenSize.isMobile ? 'text-sm' : 'text-sm'}
                      ${systemStatus.storage.status === 'online' 
                        ? 'text-success-900' 
                        : systemStatus.storage.status === 'warning'
                        ? 'text-warning-900'
                        : 'text-danger-900'
                      }
                    `}>
                      Almacenamiento
                    </p>
                    <p className={`
                      ${screenSize.isMobile ? 'text-xs' : 'text-xs'}
                      ${systemStatus.storage.status === 'online' 
                        ? 'text-success-700' 
                        : systemStatus.storage.status === 'warning'
                        ? 'text-warning-700'
                        : 'text-danger-700'
                      }
                    `}>
                      {systemStatus.storage.message}
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};