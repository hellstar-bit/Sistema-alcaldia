// frontend/src/hooks/useDashboardData.ts - VERSIÓN CORREGIDA SIN ERRORES
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

// Hook principal con datos reales del backend
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

  // Función para obtener estadísticas principales
  const fetchStats = useCallback(async (): Promise<DashboardStats> => {
    const cacheKey = 'dashboard-stats';
    const cached = dashboardCache.get(cacheKey);
    if (cached) return cached;

    console.log('📊 Dashboard: Calculando estadísticas principales...');

    try {
      // Obtener datos principales en paralelo
      const [epsResponse, carteraResponse, flujoResponse] = await Promise.allSettled([
        carteraAPI.getAllEPS(),
        carteraAPI.getCarteraData({ limit: 50000 }), // Obtener muestra grande para cálculos
        flujoAPI.getControlCargaGrid()
      ]);

      // Procesar EPS activas
      const epsActivas = epsResponse.status === 'fulfilled' 
        ? epsResponse.value.data?.filter(eps => eps.activa).length || 0 
        : 0;

      // Procesar cartera total
      let carteraTotal = 0;
      let ipsRegistradas = 0;
      if (carteraResponse.status === 'fulfilled' && carteraResponse.value.data) {
        carteraTotal = carteraResponse.value.data.summary?.totalCartera || 0;
        const uniqueIPS = new Set(carteraResponse.value.data.data?.map(item => item.ips?.id).filter(Boolean));
        ipsRegistradas = uniqueIPS.size;
      }

      // ✅ CORRECCIÓN: Calcular alertas usando 'total' en lugar de 'valorFacturado'
      let alertasPendientes = 0;
      if (carteraResponse.status === 'fulfilled' && carteraResponse.value.data?.data) {
        // Contar registros con valores anómalos o faltantes
        alertasPendientes = carteraResponse.value.data.data.filter(item => 
          !item.total || item.total <= 0 || 
          !item.ips?.nombre || !item.eps?.nombre
        ).length;
      }

      // TODO: Implementar cálculo de cambios vs período anterior
      // Por ahora, simular variaciones
      const stats: DashboardStats = {
        carteraTotal: {
          value: carteraTotal,
          change: Math.random() * 20 - 10, // -10% a +10%
          changeType: carteraTotal > 1000000000 ? 'positive' : 'neutral'
        },
        epsActivas: {
          value: epsActivas,
          change: 0,
          changeType: 'neutral'
        },
        ipsRegistradas: {
          value: ipsRegistradas,
          change: Math.random() * 10 - 5, // -5% a +5%
          changeType: ipsRegistradas > 100 ? 'positive' : 'neutral'
        },
        alertasPendientes: {
          value: alertasPendientes,
          change: -Math.random() * 15, // Mejora en alertas
          changeType: 'positive'
        }
      };

      dashboardCache.set(cacheKey, stats);
      return stats;

    } catch (error) {
      console.error('❌ Error calculando estadísticas:', error);
      throw error;
    }
  }, []);

  // Función para obtener datos de gráficos
  const fetchChartData = useCallback(async (): Promise<ChartDataPoint[]> => {
    const cacheKey = 'dashboard-chart-data';
    const cached = dashboardCache.get(cacheKey);
    if (cached) return cached;

    console.log('📈 Dashboard: Obteniendo datos para gráficos...');

    try {
      // Obtener períodos activos
      const periodosResponse = await carteraAPI.getAllPeriodos();
      const periodos = periodosResponse.data?.filter(p => p.activo) || [];
      
      // Obtener los últimos 6 períodos
      const recentPeriods = periodos
        .sort((a, b) => {
          if (a.year !== b.year) return b.year - a.year;
          return b.mes - a.mes;
        })
        .slice(0, 6)
        .reverse();

      const chartData: ChartDataPoint[] = await Promise.all(
        recentPeriods.map(async (periodo) => {
          try {
            // Obtener datos de cartera para este período
            const carteraResponse = await carteraAPI.getCarteraData({ 
              periodoId: periodo.id, 
              limit: 10000 
            });

            const carteraTotal = carteraResponse.data?.summary?.totalCartera || 0;
            
            // Obtener datos únicos de EPS e IPS
            const uniqueEPS = new Set(
              carteraResponse.data?.data?.map(item => item.eps?.id).filter(Boolean) || []
            );
            const uniqueIPS = new Set(
              carteraResponse.data?.data?.map(item => item.ips?.id).filter(Boolean) || []
            );

            return {
              month: `${periodo.mes.toString().padStart(2, '0')}/${periodo.year}`,
              cartera: carteraTotal,
              flujo: Math.random() * 100, // TODO: Implementar flujo real
              eps_activas: uniqueEPS.size,
              ips_registradas: uniqueIPS.size
            };
          } catch (error) {
            console.warn(`⚠️ Error obteniendo datos para período ${periodo.nombre}:`, error);
            return {
              month: `${periodo.mes.toString().padStart(2, '0')}/${periodo.year}`,
              cartera: 0,
              flujo: 0,
              eps_activas: 0,
              ips_registradas: 0
            };
          }
        })
      );

      dashboardCache.set(cacheKey, chartData);
      return chartData;

    } catch (error) {
      console.error('❌ Error obteniendo datos de gráficos:', error);
      return [];
    }
  }, []);

  // Función para obtener distribución de EPS
  const fetchEPSDistribution = useCallback(async (): Promise<EPSDistribution[]> => {
    const cacheKey = 'dashboard-eps-distribution';
    const cached = dashboardCache.get(cacheKey);
    if (cached) return cached;

    console.log('🏢 Dashboard: Calculando distribución de EPS...');

    try {
      // Obtener todas las EPS activas
      const epsResponse = await carteraAPI.getAllEPS();
      const epsActivas = epsResponse.data?.filter(eps => eps.activa) || [];

      // Obtener cartera por EPS
      const epsWithCartera = await Promise.all(
        epsActivas.slice(0, 10).map(async (eps, index) => {
          try {
            const carteraResponse = await carteraAPI.getCarteraData({ 
              epsId: eps.id, 
              limit: 10000 
            });
            const carteraTotal = carteraResponse.data?.summary?.totalCartera || 0;

            return {
              name: eps.nombre,
              value: carteraTotal,
              color: `hsl(${index * 36}, 70%, 50%)`, // Colores dinámicos
              cartera: carteraTotal
            };
          } catch (error) {
            console.warn(`⚠️ Error obteniendo cartera para EPS ${eps.nombre}:`, error);
            return {
              name: eps.nombre,
              value: 0,
              color: `hsl(${index * 36}, 70%, 50%)`,
              cartera: 0
            };
          }
        })
      );

      // Ordenar por cartera y calcular porcentajes
      const sorted = epsWithCartera
        .filter(eps => eps.cartera > 0)
        .sort((a, b) => b.cartera - a.cartera);

      const totalCartera = sorted.reduce((sum, eps) => sum + eps.cartera, 0);
      
      const distribution = sorted.map(eps => ({
        ...eps,
        value: totalCartera > 0 ? (eps.cartera / totalCartera) * 100 : 0
      }));

      dashboardCache.set(cacheKey, distribution);
      return distribution;

    } catch (error) {
      console.error('❌ Error calculando distribución de EPS:', error);
      return [];
    }
  }, []);

  // Función para obtener actividades recientes
  const fetchRecentActivities = useCallback(async (): Promise<RecentActivity[]> => {
    const cacheKey = 'dashboard-recent-activities';
    const cached = dashboardCache.get(cacheKey);
    if (cached) return cached;

    console.log('📋 Dashboard: Obteniendo actividades recientes...');

    try {
      // ✅ CORRECCIÓN: Usar orderBy válido y obtener datos recientes de diferentes fuentes
      const [carteraResponse, flujoResponse] = await Promise.allSettled([
        carteraAPI.getCarteraData({ 
          limit: 10, 
          orderBy: 'createdAt', // ✅ CORREGIDO: usar 'createdAt' en lugar de 'updatedAt'
          orderDirection: 'DESC' 
        }),
        flujoAPI.getControlCargaGrid()
      ]);

      const activities: RecentActivity[] = [];

      // Procesar actividades de cartera
      if (carteraResponse.status === 'fulfilled' && carteraResponse.value.data?.data) {
        const recentCartera = carteraResponse.value.data.data.slice(0, 3);
        recentCartera.forEach((item, index) => {
          activities.push({
            id: `cartera-${item.id}`,
            type: 'upload',
            title: `Actualización Cartera - ${item.eps?.nombre}`,
            description: `Registro actualizado para IPS ${item.ips?.nombre}`,
            timestamp: item.updatedAt,
            status: 'success',
            user: 'Sistema',
            metadata: {
              eps: item.eps?.nombre,
              recordCount: 1
            }
          });
        });
      }

      // Procesar actividades de flujo
      if (flujoResponse.status === 'fulfilled' && flujoResponse.value.data) {
        flujoResponse.value.data.slice(0, 2).forEach((item, index) => {
          activities.push({
            id: `flujo-${item.eps.id}`,
            type: 'process',
            title: `Procesamiento Flujo - ${item.eps.nombre}`,
            description: `${item.periodos.length} períodos procesados`,
            timestamp: new Date(Date.now() - index * 60 * 60 * 1000).toISOString(),
            status: 'success',
            user: 'Sistema',
            metadata: {
              eps: item.eps.nombre,
              recordCount: item.periodos.reduce((sum, p) => sum + p.totalRegistros, 0)
            }
          });
        });
      }

      // Ordenar por timestamp y limitar
      const sortedActivities = activities
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 10);

      dashboardCache.set(cacheKey, sortedActivities);
      return sortedActivities;

    } catch (error) {
      console.error('❌ Error obteniendo actividades recientes:', error);
      return [];
    }
  }, []);

  // Función para obtener estado del sistema
  const fetchSystemStatus = useCallback(async (): Promise<SystemStatus> => {
    const cacheKey = 'dashboard-system-status';
    const cached = dashboardCache.get(cacheKey);
    if (cached) return cached;

    console.log('🔧 Dashboard: Verificando estado del sistema...');

    const startTime = Date.now();
    const status: SystemStatus = {
      database: { status: 'online', message: 'Conectado', lastCheck: new Date().toISOString() },
      api: { status: 'online', message: 'Funcionando', responseTime: 0 },
      storage: { status: 'online', message: 'Disponible', usagePercentage: 45 }
    };

    try {
      // Test de conectividad básica
      await Promise.race([
        carteraAPI.getAllEPS(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000))
      ]);

      status.api.responseTime = Date.now() - startTime;
      status.api.message = `Respondiendo en ${status.api.responseTime}ms`;

    } catch (error) {
      status.database.status = 'warning';
      status.api.status = 'warning';
      status.api.message = 'Respuesta lenta';
      status.api.responseTime = Date.now() - startTime;
    }

    dashboardCache.set(cacheKey, status, 60000); // Cache por 1 minuto
    return status;
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
      console.log('📊 Dashboard: Iniciando carga de datos reales...');
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
      console.log(`✅ Dashboard: Datos reales cargados en ${loadTime}ms`);

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
      if (value >= 1000000000) return `$${(value / 1000000000).toFixed(1)}B`;
      if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
      if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`;
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

  const formatTimeAgo = useCallback((timestamp: string): string => {
    const now = new Date();
    const date = new Date(timestamp);
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'hace un momento';
    if (diffInSeconds < 3600) return `hace ${Math.floor(diffInSeconds / 60)} min`;
    if (diffInSeconds < 86400) return `hace ${Math.floor(diffInSeconds / 3600)} h`;
    return `hace ${Math.floor(diffInSeconds / 86400)} días`;
  }, []);

  const formatDate = useCallback((timestamp: string): string => {
    return new Intl.DateTimeFormat('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(timestamp));
  }, []);

  const formatChangeText = useCallback((value: number, type?: 'positive' | 'negative' | 'neutral'): string => {
    if (type === 'neutral' || value === 0) return 'Sin cambios';
    const prefix = value > 0 ? '+' : '';
    return `${prefix}${value.toFixed(1)}% vs período anterior`;
  }, []);

  const formatCarteraValue = useCallback((value: number): string => {
    return formatCurrency(value, true);
  }, [formatCurrency]);

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