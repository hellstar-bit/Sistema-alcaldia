// frontend/src/hooks/useDashboardData.ts - VERSIÓN CON DATOS MOCKEADOS
import { useState, useEffect, useCallback, useRef } from 'react';
import { carteraAPI } from '../services/carteraApi';
import { flujoAPI } from '../services/flujoApi';
import { adresAPI } from '../services/adresApi';

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

// DATOS MOCKEADOS REALISTAS PARA EL DASHBOARD
const MOCK_DASHBOARD_DATA = {
  // Estadísticas principales
  stats: {
    carteraTotal: {
      value: 84573650000, // $84,573 millones
      change: 12.4,
      changeType: 'positive' as const
    },
    epsActivas: {
      value: 8,
      change: 0,
      changeType: 'neutral' as const
    },
    ipsRegistradas: {
      value: 186,
      change: 5.2,
      changeType: 'positive' as const
    },
    alertasPendientes: {
      value: 12,
      change: -15.8,
      changeType: 'positive' as const
    }
  },

  // Datos de evolución mensual
  chartData: [
    { month: 'Jul', cartera: 78500, flujo: 45200, eps_activas: 22, ips_registradas: 178 },
    { month: 'Ago', cartera: 81200, flujo: 48100, eps_activas: 23, ips_registradas: 180 },
    { month: 'Sep', cartera: 79800, flujo: 46800, eps_activas: 23, ips_registradas: 182 },
    { month: 'Oct', cartera: 82400, flujo: 49500, eps_activas: 24, ips_registradas: 183 },
    { month: 'Nov', cartera: 83900, flujo: 50800, eps_activas: 24, ips_registradas: 185 },
    { month: 'Dic', cartera: 84574, flujo: 52100, eps_activas: 24, ips_registradas: 186 }
  ],

  // Distribución por EPS
  epsDistribution: [
    { name: 'NUEVA EPS', value: 28.5, color: '#3B82F6', cartera: 24083 },
    { name: 'SANITAS', value: 18.2, color: '#10B981', cartera: 15392 },
    { name: 'SURA', value: 15.8, color: '#F59E0B', cartera: 13367 },
    { name: 'COMPENSAR', value: 12.4, color: '#EF4444', cartera: 10487 },
    { name: 'COOMEVA', value: 9.1, color: '#8B5CF6', cartera: 7696 },
    { name: 'OTRAS', value: 16.0, color: '#6B7280', cartera: 13548 }
  ],

  // Actividades recientes
  recentActivities: [
    {
      id: '1',
      type: 'upload' as const,
      title: 'Carga de archivo de cartera',
      description: 'Archivo NUEVA EPS - Diciembre 2025 procesado exitosamente',
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 min ago
      status: 'success' as const,
      user: 'María González',
      metadata: { fileSize: '2.4 MB', recordCount: 1247, eps: 'NUEVA EPS', period: 'Dic 2025' }
    },
    {
      id: '2',
      type: 'process' as const,
      title: 'Procesamiento de flujo completado',
      description: 'Datos de flujo SANITAS validados y actualizados',
      timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // 45 min ago
      status: 'success' as const,
      user: 'Carlos Mendoza',
      metadata: { recordCount: 892, eps: 'SANITAS' }
    },
    {
      id: '3',
      type: 'validation' as const,
      title: 'Validación con advertencias',
      description: 'Archivo COMPENSAR procesado con 3 registros inconsistentes',
      timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(), // 1 hour ago
      status: 'warning' as const,
      user: 'Ana Rodríguez',
      metadata: { recordCount: 654, eps: 'COMPENSAR' }
    },
    {
      id: '4',
      type: 'report' as const,
      title: 'Reporte mensual generado',
      description: 'Informe ejecutivo de Noviembre 2025 disponible',
      timestamp: new Date(Date.now() - 1000 * 60 * 90).toISOString(), // 1.5 hours ago
      status: 'info' as const,
      user: 'Sistema',
      metadata: { period: 'Nov 2025' }
    },
    {
      id: '5',
      type: 'system' as const,
      title: 'Respaldo automático',
      description: 'Respaldo de base de datos completado exitosamente',
      timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(), // 2 hours ago
      status: 'success' as const,
      user: 'Sistema',
      metadata: {}
    }
  ],

  // Estado del sistema
  systemStatus: {
    database: {
      status: 'online' as const,
      message: 'Base de datos funcionando correctamente',
      lastCheck: new Date().toISOString()
    },
    api: {
      status: 'online' as const,
      message: 'API respondiendo normalmente',
      responseTime: 245
    },
    storage: {
      status: 'online' as const,
      message: 'Almacenamiento disponible',
      usagePercentage: 68
    }
  }
};

// Cache para optimizar rendimiento
class DashboardCache {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutos

  set(key: string, data: any, ttl: number = this.DEFAULT_TTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  get(key: string): any | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    if (Date.now() - cached.timestamp > cached.ttl) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  clear(): void {
    this.cache.clear();
  }
}

// Instancia global del cache
const dashboardCache = new DashboardCache();

// Hook principal con datos mockeados realistas
export const useDashboardData = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [epsDistribution, setEpsDistribution] = useState<EPSDistribution[]>([]);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Control de estado y ciclo de vida
  const mountedRef = useRef(true);
  const loadingRef = useRef(false);
  const hasLoadedRef = useRef(false);

  // Cleanup al desmontar
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      loadingRef.current = false;
    };
  }, []);

  // Función para obtener estadísticas principales (con datos mockeados)
  const fetchStats = useCallback(async (): Promise<DashboardStats> => {
    const cacheKey = 'dashboard-stats';
    const cached = dashboardCache.get(cacheKey);
    if (cached) return cached;

    console.log('📊 Dashboard: Obteniendo estadísticas mockeadas...');

    try {
      // Simular delay de red
      await new Promise(resolve => setTimeout(resolve, 800));

      // Añadir pequeñas variaciones aleatorias para simular datos vivos
      const baseStats = MOCK_DASHBOARD_DATA.stats;
      const stats: DashboardStats = {
        carteraTotal: {
          ...baseStats.carteraTotal,
          value: baseStats.carteraTotal.value + (Math.random() - 0.5) * 100000000 // ±100M variación
        },
        epsActivas: baseStats.epsActivas,
        ipsRegistradas: {
          ...baseStats.ipsRegistradas,
          value: baseStats.ipsRegistradas.value + Math.floor(Math.random() * 3 - 1) // ±1 IPS
        },
        alertasPendientes: {
          ...baseStats.alertasPendientes,
          value: Math.max(0, baseStats.alertasPendientes.value + Math.floor(Math.random() * 5 - 2)) // ±2 alertas
        }
      };

      dashboardCache.set(cacheKey, stats);
      return stats;

    } catch (error) {
      console.error('❌ Error obteniendo estadísticas:', error);
      throw error;
    }
  }, []);

  // Función para obtener datos de gráficos (con datos mockeados)
  const fetchChartData = useCallback(async (): Promise<ChartDataPoint[]> => {
    const cacheKey = 'dashboard-chart-data';
    const cached = dashboardCache.get(cacheKey);
    if (cached) return cached;

    console.log('📈 Dashboard: Obteniendo datos de gráficos mockeados...');

    try {
      await new Promise(resolve => setTimeout(resolve, 600));

      // Añadir pequeñas variaciones a los datos base
      const chartData: ChartDataPoint[] = MOCK_DASHBOARD_DATA.chartData.map(item => ({
        ...item,
        cartera: item.cartera + (Math.random() - 0.5) * 1000, // ±500M variación
        flujo: item.flujo + (Math.random() - 0.5) * 500 // ±250M variación
      }));

      dashboardCache.set(cacheKey, chartData);
      return chartData;

    } catch (error) {
      console.error('❌ Error obteniendo datos de gráficos:', error);
      throw error;
    }
  }, []);

  // Función para obtener distribución EPS (con datos mockeados)
  const fetchEPSDistribution = useCallback(async (): Promise<EPSDistribution[]> => {
    const cacheKey = 'dashboard-eps-distribution';
    const cached = dashboardCache.get(cacheKey);
    if (cached) return cached;

    console.log('🏢 Dashboard: Obteniendo distribución EPS mockeada...');

    try {
      await new Promise(resolve => setTimeout(resolve, 400));

      const epsDistribution = MOCK_DASHBOARD_DATA.epsDistribution.map(eps => ({
        ...eps,
        cartera: eps.cartera + (Math.random() - 0.5) * 100 // ±50M variación
      }));

      dashboardCache.set(cacheKey, epsDistribution);
      return epsDistribution;

    } catch (error) {
      console.error('❌ Error obteniendo distribución EPS:', error);
      throw error;
    }
  }, []);

  // Función para obtener actividades recientes (con datos mockeados)
  const fetchRecentActivities = useCallback(async (): Promise<RecentActivity[]> => {
    const cacheKey = 'dashboard-recent-activities';
    const cached = dashboardCache.get(cacheKey);
    if (cached) return cached;

    console.log('📋 Dashboard: Obteniendo actividades recientes mockeadas...');

    try {
      await new Promise(resolve => setTimeout(resolve, 300));

      // Actualizar timestamps para que sean recientes
      const activities = MOCK_DASHBOARD_DATA.recentActivities.map((activity, index) => ({
        ...activity,
        timestamp: new Date(Date.now() - (index + 1) * 30 * 60 * 1000).toISOString() // Cada 30 min
      }));

      dashboardCache.set(cacheKey, activities);
      return activities;

    } catch (error) {
      console.error('❌ Error obteniendo actividades recientes:', error);
      throw error;
    }
  }, []);

  // Función para obtener estado del sistema (con datos mockeados)
  const fetchSystemStatus = useCallback(async (): Promise<SystemStatus> => {
    const cacheKey = 'dashboard-system-status';
    const cached = dashboardCache.get(cacheKey);
    if (cached) return cached;

    console.log('⚡ Dashboard: Verificando estado del sistema...');

    try {
      await new Promise(resolve => setTimeout(resolve, 200));

      const status: SystemStatus = {
        ...MOCK_DASHBOARD_DATA.systemStatus,
        database: {
          ...MOCK_DASHBOARD_DATA.systemStatus.database,
          lastCheck: new Date().toISOString()
        },
        api: {
          ...MOCK_DASHBOARD_DATA.systemStatus.api,
          responseTime: 200 + Math.floor(Math.random() * 100) // 200-300ms
        },
        storage: {
          ...MOCK_DASHBOARD_DATA.systemStatus.storage,
          usagePercentage: Math.min(95, MOCK_DASHBOARD_DATA.systemStatus.storage.usagePercentage + Math.random() * 5)
        }
      };

      dashboardCache.set(cacheKey, status, 60000); // Cache por 1 minuto
      return status;

    } catch (error) {
      console.error('❌ Error verificando estado del sistema:', error);
      // Retornar estado de fallback
      return {
        database: { status: 'warning', message: 'Error de conexión', lastCheck: new Date().toISOString() },
        api: { status: 'warning', message: 'Respuesta lenta', responseTime: 5000 },
        storage: { status: 'online', message: 'Disponible', usagePercentage: 50 }
      };
    }
  }, []);

  // Función principal de carga de datos
  const fetchDashboardData = useCallback(async () => {
    if (loadingRef.current || !mountedRef.current || hasLoadedRef.current) {
      console.log('📊 Dashboard: Carga ya en progreso o completada');
      return;
    }

    loadingRef.current = true;
    hasLoadedRef.current = true;
    setLoading(true);
    setError(null);

    try {
      console.log('📊 Dashboard: Iniciando carga de datos mockeados...');
      const startTime = Date.now();

      // Cargar datos en paralelo con Promise.allSettled para mejor rendimiento
      const [
        statsResult,
        chartDataResult,
        epsDistributionResult,
        activitiesResult,
        systemStatusResult
      ] = await Promise.allSettled([
        fetchStats(),
        fetchChartData(),
        fetchEPSDistribution(),
        fetchRecentActivities(),
        fetchSystemStatus()
      ]);

      if (!mountedRef.current) return;

      // Procesar resultados
      if (statsResult.status === 'fulfilled') {
        setStats(statsResult.value);
      } else {
        console.error('❌ Error cargando estadísticas:', statsResult.reason);
      }

      if (chartDataResult.status === 'fulfilled') {
        setChartData(chartDataResult.value);
      } else {
        console.error('❌ Error cargando datos de gráficos:', chartDataResult.reason);
      }

      if (epsDistributionResult.status === 'fulfilled') {
        setEpsDistribution(epsDistributionResult.value);
      } else {
        console.error('❌ Error cargando distribución EPS:', epsDistributionResult.reason);
      }

      if (activitiesResult.status === 'fulfilled') {
        setRecentActivities(activitiesResult.value);
      } else {
        console.error('❌ Error cargando actividades:', activitiesResult.reason);
      }

      if (systemStatusResult.status === 'fulfilled') {
        setSystemStatus(systemStatusResult.value);
      } else {
        console.error('❌ Error verificando estado del sistema:', systemStatusResult.reason);
      }

      const loadTime = Date.now() - startTime;
      console.log(`✅ Dashboard: Datos mockeados cargados en ${loadTime}ms`);

    } catch (error) {
      console.error('❌ Dashboard: Error general cargando datos:', error);
      if (mountedRef.current) {
        setError(error instanceof Error ? error.message : 'Error desconocido');
      }
    } finally {
      loadingRef.current = false;
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [fetchStats, fetchChartData, fetchEPSDistribution, fetchRecentActivities, fetchSystemStatus]);

  // Función de refresco
  const refreshData = useCallback(() => {
    if (!mountedRef.current) return;

    console.log('🔄 Dashboard: Refrescando datos y limpiando cache...');
    dashboardCache.clear();
    hasLoadedRef.current = false;
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Funciones específicas de refresco
  const refreshStats = useCallback(async () => {
    if (!mountedRef.current) return;

    try {
      dashboardCache.clear();
      const newStats = await fetchStats();
      setStats(newStats);
    } catch (error) {
      console.error('❌ Error refrescando estadísticas:', error);
    }
  }, [fetchStats]);

  const refreshSystemStatus = useCallback(async () => {
    if (!mountedRef.current) return;

    try {
      const newStatus = await fetchSystemStatus();
      setSystemStatus(newStatus);
    } catch (error) {
      console.error('❌ Error refrescando estado del sistema:', error);
    }
  }, [fetchSystemStatus]);

  // Effect principal - SE EJECUTA SOLO UNA VEZ
  useEffect(() => {
    fetchDashboardData();
  }, []); // Dependencias vacías = solo al montar

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

// Hook para formateo de datos - MEMOIZADO
export const useDataFormatting = () => {
  const formatCurrency = useCallback((value: number, compact: boolean = false): string => {
    if (!value && value !== 0) return '$0';

    if (compact) {
      if (value >= 1000000000) return `${(value / 1000000000).toFixed(1)}B`;
      if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
      if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
    }

    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  }, []);

  const formatNumber = useCallback((value: number, compact: boolean = false): string => {
    if (!value && value !== 0) return '0';

    if (compact) {
      if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
      if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
    }

    return new Intl.NumberFormat('es-CO').format(value);
  }, []);

  const formatPercentage = useCallback((value: number, decimals: number = 1): string => {
    if (!value && value !== 0) return '0%';
    return `${value >= 0 ? '+' : ''}${value.toFixed(decimals)}%`;
  }, []);

  const formatDate = useCallback((dateString: string): string => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }, []);

  const formatRelativeTime = useCallback((dateString: string): string => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Ahora';
    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffHours < 24) return `Hace ${diffHours}h`;
    if (diffDays < 7) return `Hace ${diffDays} días`;

    return formatDate(dateString);
  }, [formatDate]);

  return {
    formatCurrency,
    formatNumber,
    formatPercentage,
    formatDate,
    formatRelativeTime
  };
};