// frontend/src/hooks/useDashboardData.ts
import { useState, useEffect } from 'react';
import { dashboardAPI } from '../services/dashboardAPI';

// Tipos de datos del dashboard
export interface DashboardStats {
  carteraTotal: {
    value: number;
    change: number;
    changeType: 'positive' | 'negative' | 'neutral';
  };
  epsActivas: {
    value: number;
    change: number;
    changeType: 'positive' | 'negative' | 'neutral';
  };
  ipsRegistradas: {
    value: number;
    change: number;
    changeType: 'positive' | 'negative' | 'neutral';
  };
  alertasPendientes: {
    value: number;
    change: number;
    changeType: 'positive' | 'negative' | 'neutral';
  };
}

export interface ChartDataPoint {
  month: string;
  cartera: number;
  flujo: number;
  eps_activas: number;
  ips_registradas: number;
}

export interface EPSDistribution {
  name: string;
  value: number;
  color: string;
  cartera: number;
}

export interface RecentActivity {
  id: string;
  type: 'upload' | 'process' | 'validation' | 'report' | 'system';
  title: string;
  description: string;
  timestamp: string;
  status: 'success' | 'error' | 'warning' | 'info';
  user: string;
  metadata?: {
    fileSize?: string;
    recordCount?: number;
    eps?: string;
    period?: string;
  };
}

export interface SystemStatus {
  database: {
    status: 'online' | 'offline' | 'warning';
    message: string;
    lastCheck: string;
  };
  api: {
    status: 'online' | 'offline' | 'warning';
    message: string;
    responseTime: number;
  };
  storage: {
    status: 'online' | 'offline' | 'warning';
    message: string;
    usagePercentage: number;
  };
}

// Hook principal para datos del dashboard usando APIs reales
export const useDashboardData = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [epsDistribution, setEpsDistribution] = useState<EPSDistribution[]>([]);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('📊 Dashboard Hook: Iniciando carga de datos reales...');
      
      // Obtener todos los datos del dashboard usando los APIs reales
      const dashboardData = await dashboardAPI.getDashboardData();
      
      console.log('✅ Dashboard Hook: Datos cargados exitosamente:', {
        stats: !!dashboardData.stats,
        chartData: dashboardData.chartData.length,
        epsDistribution: dashboardData.epsDistribution.length,
        recentActivities: dashboardData.recentActivities.length,
        systemStatus: !!dashboardData.systemStatus
      });
      
      setStats(dashboardData.stats);
      setChartData(dashboardData.chartData);
      setEpsDistribution(dashboardData.epsDistribution);
      setRecentActivities(dashboardData.recentActivities);
      setSystemStatus(dashboardData.systemStatus);
      
    } catch (err) {
      console.error('❌ Dashboard Hook: Error cargando datos:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar datos del dashboard');
      
      // En caso de error, establecer valores por defecto para que la UI no falle
      setStats({
        carteraTotal: { value: 0, change: 0, changeType: 'neutral' },
        epsActivas: { value: 0, change: 0, changeType: 'neutral' },
        ipsRegistradas: { value: 0, change: 0, changeType: 'neutral' },
        alertasPendientes: { value: 0, change: 0, changeType: 'neutral' }
      });
      setChartData([]);
      setEpsDistribution([]);
      setRecentActivities([]);
      setSystemStatus({
        database: { status: 'offline', message: 'Sin conexión', lastCheck: new Date().toISOString() },
        api: { status: 'offline', message: 'Sin conexión', responseTime: -1 },
        storage: { status: 'offline', message: 'Sin conexión', usagePercentage: 0 }
      });
    } finally {
      setLoading(false);
    }
  };

  const refreshData = () => {
    console.log('🔄 Dashboard Hook: Refrescando datos...');
    fetchDashboardData();
  };

  const refreshStats = async () => {
    try {
      console.log('📊 Dashboard Hook: Refrescando solo estadísticas...');
      const newStats = await dashboardAPI.getStats();
      setStats(newStats);
    } catch (err) {
      console.error('❌ Error refrescando estadísticas:', err);
    }
  };

  const refreshSystemStatus = async () => {
    try {
      console.log('🔧 Dashboard Hook: Refrescando estado del sistema...');
      const newStatus = await dashboardAPI.getSystemStatus();
      setSystemStatus(newStatus);
    } catch (err) {
      console.error('❌ Error refrescando estado del sistema:', err);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return {
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
  };
};

// Hook para formateo de datos
export const useDataFormatting = () => {
  const formatCurrency = (value: number, compact: boolean = false): string => {
    if (compact && value >= 1000000000) {
      return `${(value / 1000000000).toFixed(1)}B`;
    } else if (compact && value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    } else if (compact && value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }

    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatNumber = (value: number, compact: boolean = false): string => {
    if (compact && value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    } else if (compact && value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }

    return new Intl.NumberFormat('es-CO').format(value);
  };

  const formatPercentage = (value: number, decimals: number = 1): string => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(decimals)}%`;
  };

  const formatTimeAgo = (timestamp: string): string => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'ahora mismo';
    if (diffInMinutes < 60) return `hace ${diffInMinutes} minuto${diffInMinutes > 1 ? 's' : ''}`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `hace ${diffInHours} hora${diffInHours > 1 ? 's' : ''}`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `hace ${diffInDays} día${diffInDays > 1 ? 's' : ''}`;
    
    const diffInWeeks = Math.floor(diffInDays / 7);
    return `hace ${diffInWeeks} semana${diffInWeeks > 1 ? 's' : ''}`;
  };

  const formatDate = (date: Date | string, format: 'short' | 'long' | 'time' = 'long'): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;

    switch (format) {
      case 'short':
        return dateObj.toLocaleDateString('es-CO', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        });
      case 'time':
        return dateObj.toLocaleTimeString('es-CO', {
          hour: '2-digit',
          minute: '2-digit'
        });
      case 'long':
      default:
        return dateObj.toLocaleDateString('es-CO', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
    }
  };

  const formatChangeText = (value: number, type: 'positive' | 'negative' | 'neutral'): string => {
    if (type === 'neutral' || value === 0) return 'Sin cambios';
    
    const prefix = value > 0 ? '+' : '';
    const suffix = Math.abs(value) === 1 ? '' : '';
    
    return `${prefix}${value}${suffix} vs período anterior`;
  };

  const formatCarteraValue = (value: number): string => {
    if (value === 0) return '$0';
    return formatCurrency(value, true);
  };

  return {
    formatCurrency,
    formatNumber,
    formatPercentage,
    formatTimeAgo,
    formatDate,
    formatCarteraValue,
    formatChangeText
  };
};

// Hook para animaciones y transiciones
export const useAnimations = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  };

  const staggerChildren = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const slideInFromLeft = {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.3 }
  };

  const scaleIn = {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.2 }
  };

  return {
    isVisible,
    fadeInUp,
    staggerChildren,
    slideInFromLeft,
    scaleIn
  };
};

// Hook para manejo de estados de carga específicos
export const useLoadingStates = () => {
  const [loadingStates, setLoadingStates] = useState({
    stats: false,
    charts: false,
    activities: false,
    system: false
  });

  const setLoading = (key: keyof typeof loadingStates, isLoading: boolean) => {
    setLoadingStates(prev => ({
      ...prev,
      [key]: isLoading
    }));
  };

  const isAnyLoading = Object.values(loadingStates).some(loading => loading);

  return {
    loadingStates,
    setLoading,
    isAnyLoading
  };
};