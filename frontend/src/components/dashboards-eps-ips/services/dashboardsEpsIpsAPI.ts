// frontend/src/components/dashboards-eps-ips/services/dashboardsEpsIpsAPI.ts - VERSIÓN COMPLETA
import { carteraAPI } from '../../../services/carteraAPI';
import { flujoAPI } from '../../../services/flujoAPI';

interface DashboardFilters {
  epsIds?: string[];
  ipsIds?: string[];
  periodoIds?: string[];
  fechaInicio?: string;
  fechaFin?: string;
  tipoAnalisis: 'cartera' | 'flujo' | 'ambos';
}

interface CarteraTrazabilidadData {
  epsId: string;
  epsNombre: string;
  ipsId: string;
  ipsNombre: string;
  periodoId: string;
  periodoNombre: string;
  valorActual: number;
  valorAnterior?: number;
  variacion?: number;
  variacionPorcentual?: number;
}

interface MetricasComparativas {
  eps: {
    total: number;
    activas: number;
    carteraTotal: number;
    carteraPromedio: number;
  };
  ips: {
    total: number;
    activas: number;
    carteraTotal: number;
    carteraPromedio: number;
  };
  relaciones: {
    relacionesUnicas: number;
    concentracionRiesgo: {
      top3Concentracion: number;
      distribucioEquitativa: number;
    };
  };
}

interface TopEntidad {
  id: string;
  nombre: string;
  carteraTotal: number;
  cantidadRelaciones: number;
  porcentajeTotal: number;
}

interface TendenciasData {
  carteraEvolucion: Array<{
    periodo: string;
    carteraTotal: number;
    variacionMensual: number;
    cantidadEPS: number;
    cantidadIPS: number;
  }>;
  proyecciones: Array<{
    periodo: string;
    carteraProyectada: number;
    confianza: number;
  }>;
  alertas: Array<{
    tipo: 'crecimiento_acelerado' | 'concentracion_riesgo' | 'eps_critica';
    mensaje: string;
    severidad: 'baja' | 'media' | 'alta';
    entidad: string;
    valor: number;
  }>;
}

interface AnalisisFlujoData {
  totalFacturado: number;
  totalReconocido: number;
  totalPagado: number;
  cumplimientoPromedio: number;
  distribuccionPorEPS: Array<{
    nombre: string;
    valor: number;
    porcentaje: number;
  }>;
  distribuccionPorIPS: Array<{
    nombre: string;
    valor: number;
    porcentaje: number;
  }>;
}

class DashboardsEpsIpsAPI {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutos
  private readonly BASE_URL = '/api/dashboards-eps-ips'; // Ajustar según tu configuración

  // ===============================================
  // MÉTODOS DE CACHE
  // ===============================================
  private setCache(key: string, data: any, ttl: number = this.CACHE_TTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  private getFromCache(key: string): any | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    const isExpired = Date.now() - cached.timestamp > cached.ttl;
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  public async refreshCache(): Promise<void> {
    this.cache.clear();
    console.log('🔄 Cache de dashboards EPS/IPS limpiado');
  }

  // ===============================================
  // MÉTODOS PRINCIPALES DE API
  // ===============================================

  /**
   * Obtener cartera con trazabilidad corregida
   */
  async getCarteraTrazabilidad(filters: DashboardFilters): Promise<CarteraTrazabilidadData[]> {
    const cacheKey = `cartera-trazabilidad-${JSON.stringify(filters)}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      console.log('📊 Obteniendo cartera con trazabilidad corregida...');
      
      const params = new URLSearchParams();
      if (filters.epsIds?.length) params.append('epsIds', filters.epsIds.join(','));
      if (filters.ipsIds?.length) params.append('ipsIds', filters.ipsIds.join(','));
      if (filters.periodoIds?.length) params.append('periodoIds', filters.periodoIds.join(','));
      if (filters.tipoAnalisis) params.append('tipoAnalisis', filters.tipoAnalisis);
      params.append('incluirHistorico', 'true');

      const response = await fetch(`${this.BASE_URL}/cartera-trazabilidad?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      // Transformar datos del backend a formato esperado
      const trazabilidadData: CarteraTrazabilidadData[] = result.trazabilidad?.map((item: any) => ({
        epsId: item.epsId,
        epsNombre: item.epsNombre || `EPS ${item.epsId.substring(0, 8)}`,
        ipsId: item.ipsId,
        ipsNombre: item.ipsNombre || `IPS ${item.ipsId.substring(0, 8)}`,
        periodoId: item.periodoId || 'current',
        periodoNombre: item.periodoNombre || 'Período Actual',
        valorActual: item.valorActual || 0,
        valorAnterior: item.valorAnterior,
        variacion: item.variacion,
        variacionPorcentual: item.variacionPorcentual
      })) || [];

      this.setCache(cacheKey, trazabilidadData);
      return trazabilidadData;

    } catch (error) {
      console.error('❌ Error obteniendo cartera con trazabilidad:', error);
      
      // Fallback con datos simulados para desarrollo
      return this.getFallbackCarteraData(filters);
    }
  }

  /**
   * Obtener métricas comparativas EPS vs IPS
   */
  async getMetricasComparativas(filters: DashboardFilters): Promise<MetricasComparativas> {
    const cacheKey = `metricas-comparativas-${JSON.stringify(filters)}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      console.log('📊 Calculando métricas comparativas EPS vs IPS...');

      const params = new URLSearchParams();
      if (filters.epsIds?.length) params.append('epsIds', filters.epsIds.join(','));
      if (filters.ipsIds?.length) params.append('ipsIds', filters.ipsIds.join(','));
      if (filters.periodoIds?.length) params.append('periodoIds', filters.periodoIds.join(','));

      const response = await fetch(`${this.BASE_URL}/metricas-comparativas?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      const metricas: MetricasComparativas = result.data;

      this.setCache(cacheKey, metricas);
      return metricas;

    } catch (error) {
      console.error('❌ Error calculando métricas comparativas:', error);
      
      // Fallback con datos simulados
      return this.getFallbackMetricasComparativas();
    }
  }

  /**
   * Obtener top entidades (EPS o IPS)
   */
  async getTopEntidades(tipo: 'eps' | 'ips', limit: number = 10, filters?: DashboardFilters): Promise<TopEntidad[]> {
    const cacheKey = `top-entidades-${tipo}-${limit}-${JSON.stringify(filters || {})}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      console.log(`📊 Obteniendo top ${limit} ${tipo.toUpperCase()}...`);

      const params = new URLSearchParams();
      params.append('limit', limit.toString());
      if (filters?.epsIds?.length) params.append('epsIds', filters.epsIds.join(','));
      if (filters?.ipsIds?.length) params.append('ipsIds', filters.ipsIds.join(','));
      if (filters?.periodoIds?.length) params.append('periodoIds', filters.periodoIds.join(','));

      const response = await fetch(`${this.BASE_URL}/top-entidades/${tipo}?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      const topEntidades: TopEntidad[] = result.data;

      this.setCache(cacheKey, topEntidades);
      return topEntidades;

    } catch (error) {
      console.error(`❌ Error obteniendo top ${tipo}:`, error);
      
      // Fallback con datos simulados
      return this.getFallbackTopEntidades(tipo, limit);
    }
  }

  /**
   * Obtener tendencias y proyecciones
   */
  async getTendenciasYProyecciones(filters: DashboardFilters): Promise<TendenciasData> {
    const cacheKey = `tendencias-${JSON.stringify(filters)}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      console.log('📈 Calculando tendencias y proyecciones...');

      const params = new URLSearchParams();
      if (filters.epsIds?.length) params.append('epsIds', filters.epsIds.join(','));
      if (filters.ipsIds?.length) params.append('ipsIds', filters.ipsIds.join(','));
      if (filters.periodoIds?.length) params.append('periodoIds', filters.periodoIds.join(','));

      const response = await fetch(`${this.BASE_URL}/tendencias-proyecciones?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      const tendencias: TendenciasData = result.data;

      this.setCache(cacheKey, tendencias);
      return tendencias;

    } catch (error) {
      console.error('❌ Error calculando tendencias:', error);
      
      // Fallback con datos simulados
      return this.getFallbackTendenciasData();
    }
  }

  /**
   * Obtener análisis de flujo
   */
  async getAnalisisFlujo(filters: DashboardFilters): Promise<AnalisisFlujoData> {
    const cacheKey = `analisis-flujo-${JSON.stringify(filters)}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      console.log('💰 Obteniendo análisis de flujo...');

      const params = new URLSearchParams();
      if (filters.epsIds?.length) params.append('epsIds', filters.epsIds.join(','));
      if (filters.ipsIds?.length) params.append('ipsIds', filters.ipsIds.join(','));
      if (filters.periodoIds?.length) params.append('periodoIds', filters.periodoIds.join(','));

      const response = await fetch(`${this.BASE_URL}/analisis-flujo?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      const analisisFlujo: AnalisisFlujoData = result.data;

      this.setCache(cacheKey, analisisFlujo);
      return analisisFlujo;

    } catch (error) {
      console.error('❌ Error obteniendo análisis de flujo:', error);
      
      // Fallback con datos simulados
      return this.getFallbackAnalisisFlujo();
    }
  }

  // ===============================================
  // MÉTODOS DE FALLBACK CON DATOS SIMULADOS
  // ===============================================
  private getFallbackCarteraData(filters: DashboardFilters): CarteraTrazabilidadData[] {
    console.log('⚠️ Usando datos simulados para cartera (modo desarrollo)');
    
    const epsNames = ['EPS Sura', 'Nueva EPS', 'Sanitas EPS', 'Salud Total', 'EPS Famisanar'];
    const ipsNames = ['Hospital Universitario', 'Clínica del Country', 'Fundación Cardioinfantil', 'Hospital San Ignacio', 'Clínica Marly'];
    
    const data: CarteraTrazabilidadData[] = [];
    
    for (let i = 0; i < 20; i++) {
      const epsName = epsNames[i % epsNames.length];
      const ipsName = ipsNames[i % ipsNames.length];
      const valorActual = Math.random() * 100000000 + 10000000; // 10M - 110M
      const valorAnterior = valorActual * (0.85 + Math.random() * 0.3); // ±15% variación
      
      data.push({
        epsId: `eps-${i + 1}`,
        epsNombre: epsName,
        ipsId: `ips-${i + 1}`,
        ipsNombre: ipsName,
        periodoId: 'periodo-actual',
        periodoNombre: 'Diciembre 2024',
        valorActual,
        valorAnterior,
        variacion: valorActual - valorAnterior,
        variacionPorcentual: ((valorActual - valorAnterior) / valorAnterior) * 100
      });
    }
    
    return data;
  }

  private getFallbackMetricasComparativas(): MetricasComparativas {
    console.log('⚠️ Usando datos simulados para métricas comparativas (modo desarrollo)');
    
    return {
      eps: {
        total: 25,
        activas: 23,
        carteraTotal: 1250000000,
        carteraPromedio: 54347826
      },
      ips: {
        total: 180,
        activas: 165,
        carteraTotal: 850000000,
        carteraPromedio: 5151515
      },
      relaciones: {
        relacionesUnicas: 3847,
        concentracionRiesgo: {
          top3Concentracion: 45.2,
          distribucioEquitativa: 32500000
        }
      }
    };
  }

  private getFallbackTopEntidades(tipo: 'eps' | 'ips', limit: number): TopEntidad[] {
    console.log(`⚠️ Usando datos simulados para top ${tipo} (modo desarrollo)`);
    
    const nombres = tipo === 'eps' 
      ? ['EPS Sura', 'Nueva EPS', 'Sanitas EPS', 'Salud Total', 'EPS Famisanar', 'Medimás EPS', 'EPS Coosalud', 'Compensar EPS', 'EPS SOSS', 'EPS Cafesalud']
      : ['Hospital Universitario', 'Clínica del Country', 'Fundación Cardioinfantil', 'Hospital San Ignacio', 'Clínica Marly', 'Hospital Pablo Tobón', 'Clínica Cardiovascular', 'Hospital San Vicente', 'Clínica Las Américas', 'Hospital General'];
    
    return nombres.slice(0, limit).map((nombre, index) => {
      const carteraBase = tipo === 'eps' ? 80000000 : 15000000;
      const carteraTotal = carteraBase * (1 - index * 0.15) + Math.random() * 10000000;
      const cantidadRelaciones = Math.floor(Math.random() * 50) + 10;
      
      return {
        id: `${tipo}-${index + 1}`,
        nombre,
        carteraTotal,
        cantidadRelaciones,
        porcentajeTotal: (carteraTotal / (carteraBase * 5)) * 100
      };
    });
  }

  private getFallbackTendenciasData(): TendenciasData {
    console.log('⚠️ Usando datos simulados para tendencias (modo desarrollo)');
    
    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const carteraEvolucion = meses.map((mes, index) => {
      const base = 1000000000;
      const variacion = (Math.random() - 0.5) * 20; // ±10%
      const carteraTotal = base + (base * variacion / 100) + (index * 50000000);
      
      return {
        periodo: `${mes} 2024`,
        carteraTotal,
        variacionMensual: variacion,
        cantidadEPS: 23 + Math.floor(Math.random() * 3),
        cantidadIPS: 165 + Math.floor(Math.random() * 10)
      };
    });

    const proyecciones = [
      { periodo: 'Proyección +1 mes', carteraProyectada: 1250000000, confianza: 85 },
      { periodo: 'Proyección +2 meses', carteraProyectada: 1280000000, confianza: 70 },
      { periodo: 'Proyección +3 meses', carteraProyectada: 1320000000, confianza: 55 }
    ];

    const alertas = [
      {
        tipo: 'crecimiento_acelerado' as const,
        mensaje: 'Crecimiento de cartera superior al 15% detectado',
        severidad: 'alta' as const,
        entidad: 'EPS Sura',
        valor: 18.5
      },
      {
        tipo: 'concentracion_riesgo' as const,
        mensaje: 'Alta concentración de cartera en top 3 EPS',
        severidad: 'media' as const,
        entidad: 'Sistema',
        valor: 65.2
      }
    ];

    return {
      carteraEvolucion,
      proyecciones,
      alertas
    };
  }

  private getFallbackAnalisisFlujo(): AnalisisFlujoData {
    console.log('⚠️ Usando datos simulados para análisis de flujo (modo desarrollo)');
    
    const totalFacturado = 800000000;
    const totalReconocido = 750000000;
    const totalPagado = 680000000;
    
    return {
      totalFacturado,
      totalReconocido,
      totalPagado,
      cumplimientoPromedio: (totalPagado / totalReconocido) * 100,
      distribuccionPorEPS: [
        { nombre: 'EPS Sura', valor: 150000000, porcentaje: 22.1 },
        { nombre: 'Nueva EPS', valor: 120000000, porcentaje: 17.6 },
        { nombre: 'Sanitas EPS', valor: 100000000, porcentaje: 14.7 },
        { nombre: 'Salud Total', valor: 85000000, porcentaje: 12.5 },
        { nombre: 'EPS Famisanar', valor: 70000000, porcentaje: 10.3 }
      ],
      distribuccionPorIPS: [
        { nombre: 'Hospital Universitario', valor: 80000000, porcentaje: 11.8 },
        { nombre: 'Clínica del Country', valor: 65000000, porcentaje: 9.6 },
        { nombre: 'Fundación Cardioinfantil', valor: 55000000, porcentaje: 8.1 },
        { nombre: 'Hospital San Ignacio', valor: 50000000, porcentaje: 7.4 },
        { nombre: 'Clínica Marly', valor: 45000000, porcentaje: 6.6 }
      ]
    };
  }
}

// Instancia singleton
export const dashboardsEpsIpsAPI = new DashboardsEpsIpsAPI();