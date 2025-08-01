// frontend/src/components/dashboards-eps-ips/services/dashboardsEpsIpsAPI.ts - VERSIÓN CON DATOS MOCKEADOS
import { carteraAPI } from '../../../services/carteraApi';
import { flujoAPI } from '../../../services/flujoApi';
import { adresAPI } from '../../../services/adresApi';

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

interface TendenciasData {
  carteraEvolucion: Array<{
    periodo: string;
    carteraTotal: number;
    variacionMensual: number;
    cantidadEPS: number;
    cantidadIPS: number;
  }>;
  proyecciones: ProyeccionItem[];
  alertas: AlertaItem[];
}

interface ProyeccionItem {
  periodo: string;
  carteraProyectada: number;
  confianza: number;
}

interface AlertaItem {
  tipo: string;
  mensaje: string;
  severidad: 'alta' | 'media' | 'baja';
  entidad: string;
  valor: number;
}

interface AnalisisFlujoData {
  totalFacturado: number;
  totalReconocido: number;
  totalPagado: number;
  cumplimientoPromedio: number;
  distribuccionEPS: Array<{
    epsNombre: string;
    porcentajeCumplimiento: number;
    valorFacturado: number;
    valorReconocido: number;
  }>;
  tendenciaMensual: Array<{
    mes: string;
    cumplimiento: number;
    meta: number;
  }>;
}

// DATOS MOCKEADOS REALISTAS
const MOCK_DATA = {
  // Datos de EPS principales del sistema colombiano
  eps: [
    { id: '1', nombre: 'NUEVA EPS', activa: true, participacion: 28.5 },
    { id: '2', nombre: 'SANITAS', activa: true, participacion: 18.2 },
    { id: '3', nombre: 'SURA', activa: true, participacion: 15.8 },
    { id: '4', nombre: 'COMPENSAR', activa: true, participacion: 12.4 },
    { id: '5', nombre: 'COOMEVA', activa: true, participacion: 9.1 },
    { id: '6', nombre: 'SALUD TOTAL', activa: true, participacion: 6.8 },
    { id: '7', nombre: 'FAMISANAR', activa: true, participacion: 4.2 },
    { id: '8', nombre: 'ALIANSALUD', activa: true, participacion: 3.1 },
    { id: '9', nombre: 'MEDIMAS', activa: true, participacion: 1.9 }
  ],

  // IPS principales de Barranquilla
  ips: [
    { id: '1', nombre: 'HOSPITAL UNIVERSITARIO CARI', activa: true },
    { id: '2', nombre: 'CLINICA GENERAL DEL NORTE', activa: true },
    { id: '3', nombre: 'HOSPITAL NIÑO JESUS', activa: true },
    { id: '4', nombre: 'CLINICA LA MISERICORDIA', activa: true },
    { id: '5', nombre: 'HOSPITAL SAN ROQUE', activa: true },
    { id: '6', nombre: 'CLINICA IBEROAMERICA', activa: true },
    { id: '7', nombre: 'HOSPITAL METROPOLITANO', activa: true },
    { id: '8', nombre: 'CLINICA SANTA LUCIA', activa: true },
    { id: '9', nombre: 'CENTRO MEDICO IMBANACO', activa: true },
    { id: '10', nombre: 'HOSPITAL LA MERCED', activa: true }
  ],

  // Valores de cartera realistas (en millones COP)
  cartera: {
    total: 84573650000, // $84,573 millones
    porEPS: {
      'NUEVA EPS': 24083000000,     // $24,083 millones
      'SANITAS': 15392000000,       // $15,392 millones  
      'SURA': 13367000000,          // $13,367 millones
      'COMPENSAR': 10487000000,     // $10,487 millones
      'COOMEVA': 7696000000,        // $7,696 millones
      'SALUD TOTAL': 5751000000,    // $5,751 millones
      'FAMISANAR': 3552000000,      // $3,552 millones
      'ALIANSALUD': 2621000000,     // $2,621 millones
      'MEDIMAS': 1623000000         // $1,623 millones
    }
  },

  // Evolución mensual 2024
  evolucionMensual: [
    { mes: 'Ene', cartera: 76800, eps: 23, ips: 174, variacion: 5.2 },
    { mes: 'Feb', cartera: 77900, eps: 23, ips: 176, variacion: 1.4 },
    { mes: 'Mar', cartera: 78200, eps: 24, ips: 177, variacion: 0.4 },
    { mes: 'Abr', cartera: 79100, eps: 24, ips: 178, variacion: 1.2 },
    { mes: 'May', cartera: 80300, eps: 24, ips: 180, variacion: 1.5 },
    { mes: 'Jun', cartera: 81500, eps: 24, ips: 181, variacion: 1.5 },
    { mes: 'Jul', cartera: 78500, eps: 22, ips: 178, variacion: -3.7 },
    { mes: 'Ago', cartera: 81200, eps: 23, ips: 180, variacion: 3.4 },
    { mes: 'Sep', cartera: 79800, eps: 23, ips: 182, variacion: -1.7 },
    { mes: 'Oct', cartera: 82400, eps: 24, ips: 183, variacion: 3.3 },
    { mes: 'Nov', cartera: 83900, eps: 24, ips: 185, variacion: 1.8 },
    { mes: 'Dic', cartera: 84574, eps: 24, ips: 186, variacion: 0.8 }
  ],

  // Datos de flujo por EPS
  flujo: {
    'NUEVA EPS': { facturado: 26500, reconocido: 24800, pagado: 22300 },
    'SANITAS': { facturado: 17800, reconocido: 16900, pagado: 15200 },
    'SURA': { facturado: 15200, reconocido: 14600, pagado: 13100 },
    'COMPENSAR': { facturado: 12400, reconocido: 11200, pagado: 9800 },
    'COOMEVA': { facturado: 9800, reconocido: 8900, pagado: 7900 },
    'SALUD TOTAL': { facturado: 7200, reconocido: 6800, pagado: 6100 },
    'FAMISANAR': { facturado: 4500, reconocido: 4200, pagado: 3800 },
    'ALIANSALUD': { facturado: 3300, reconocido: 3000, pagado: 2700 },
    'MEDIMAS': { facturado: 2100, reconocido: 1900, pagado: 1700 }
  }
};

class DashboardsEpsIpsAPI {
  private cache = new Map<string, any>();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutos

  /**
   * Obtener cartera con trazabilidad usando datos mockeados
   */
  async getCarteraTrazabilidad(filters: DashboardFilters): Promise<any> {
    const cacheKey = `cartera-trazabilidad-${JSON.stringify(filters)}`;
    const cached = this.cache.get(cacheKey);
    if (cached) return cached;

    console.log('🔍 Dashboard EPS-IPS: Obteniendo cartera con trazabilidad...');

    try {
      // Simular delay de carga
      await new Promise(resolve => setTimeout(resolve, 800));

      const trazabilidadData: CarteraTrazabilidadData[] = [];
      const epsActual = MOCK_DATA.eps.filter(eps => eps.activa);
      const ipsActual = MOCK_DATA.ips.filter(ips => ips.activa);

      // Generar relaciones EPS-IPS con datos realistas
      epsActual.forEach((eps, epsIndex) => {
        const numIPS = Math.min(8 + Math.floor(Math.random() * 5), ipsActual.length);
        const ipsAsignadas = ipsActual.slice(0, numIPS);

        ipsAsignadas.forEach((ips, ipsIndex) => {
          const baseCartera = (MOCK_DATA.cartera.porEPS[eps.nombre as keyof typeof MOCK_DATA.cartera.porEPS] || 1000000000) / numIPS;
          const variacionAleatoria = 0.8 + (Math.random() * 0.4); // 80% - 120%
          const valorActual = Math.floor(baseCartera * variacionAleatoria);
          const valorAnterior = Math.floor(valorActual * (0.95 + Math.random() * 0.1));
          const variacion = valorActual - valorAnterior;
          const variacionPorcentual = valorAnterior > 0 ? (variacion / valorAnterior) * 100 : 0;

          trazabilidadData.push({
            epsId: eps.id,
            epsNombre: eps.nombre,
            ipsId: ips.id,
            ipsNombre: ips.nombre,
            periodoId: '2024-12',
            periodoNombre: 'Diciembre 2024',
            valorActual,
            valorAnterior,
            variacion,
            variacionPorcentual
          });
        });
      });

      const resultado = {
        data: trazabilidadData,
        resumen: {
          totalCartera: MOCK_DATA.cartera.total,
          totalEPS: epsActual.length,
          totalIPS: ipsActual.length,
          totalRegistros: trazabilidadData.length,
          variacionPeriodoAnterior: 12400000000, // +$12,400 millones
          variacionPorcentual: 17.2
        },
        trazabilidad: trazabilidadData
      };

      this.cache.set(cacheKey, resultado);
      console.log('✅ Cartera con trazabilidad calculada:', {
        registros: trazabilidadData.length,
        totalCartera: `$${(MOCK_DATA.cartera.total / 1000000).toLocaleString()}M`
      });

      return resultado;

    } catch (error) {
      console.error('❌ Error obteniendo cartera con trazabilidad:', error);
      throw error;
    }
  }

  /**
   * Obtener métricas comparativas EPS vs IPS
   */
  async getMetricasComparativas(filters: DashboardFilters): Promise<MetricasComparativas> {
    const cacheKey = `metricas-comparativas-${JSON.stringify(filters)}`;
    const cached = this.cache.get(cacheKey);
    if (cached) return cached;

    console.log('📊 Dashboard EPS-IPS: Calculando métricas comparativas...');

    try {
      await new Promise(resolve => setTimeout(resolve, 600));

      const epsActivas = MOCK_DATA.eps.filter(eps => eps.activa);
      const ipsActivas = MOCK_DATA.ips.filter(ips => ips.activa);
      const carteraTotal = MOCK_DATA.cartera.total;

      // Calcular concentración de riesgo (top 3 EPS)
      const topEPS = Object.entries(MOCK_DATA.cartera.porEPS)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3);
      
      const top3Concentracion = topEPS.reduce((sum, [, valor]) => sum + valor, 0) / carteraTotal * 100;

      const metricas: MetricasComparativas = {
        eps: {
          total: MOCK_DATA.eps.length,
          activas: epsActivas.length,
          carteraTotal: carteraTotal,
          carteraPromedio: carteraTotal / epsActivas.length
        },
        ips: {
          total: MOCK_DATA.ips.length,
          activas: ipsActivas.length,
          carteraTotal: carteraTotal,
          carteraPromedio: carteraTotal / ipsActivas.length
        },
        relaciones: {
          relacionesUnicas: epsActivas.length * Math.floor(ipsActivas.length * 0.7), // 70% de IPS por EPS
          concentracionRiesgo: {
            top3Concentracion: top3Concentracion,
            distribucioEquitativa: 100 / epsActivas.length // Distribución ideal
          }
        }
      };

      this.cache.set(cacheKey, metricas);
      console.log('✅ Métricas comparativas calculadas:', {
        eps: metricas.eps.activas,
        ips: metricas.ips.activas,
        concentracionTop3: `${top3Concentracion.toFixed(1)}%`
      });

      return metricas;

    } catch (error) {
      console.error('❌ Error calculando métricas comparativas:', error);
      throw error;
    }
  }

  /**
   * Obtener top entidades (EPS o IPS)
   */
  async getTopEntidades(tipo: 'eps' | 'ips', limit: number = 10): Promise<any[]> {
    const cacheKey = `top-${tipo}-${limit}`;
    const cached = this.cache.get(cacheKey);
    if (cached) return cached;

    console.log(`🏆 Dashboard EPS-IPS: Obteniendo top ${limit} ${tipo.toUpperCase()}...`);

    try {
      await new Promise(resolve => setTimeout(resolve, 400));

      let resultado: any[] = [];

      if (tipo === 'eps') {
        resultado = Object.entries(MOCK_DATA.cartera.porEPS)
          .map(([nombre, cartera], index) => {
            const eps = MOCK_DATA.eps.find(e => e.nombre === nombre);
            return {
              id: eps?.id || String(index + 1),
              nombre,
              carteraTotal: cartera,
              cantidadRelaciones: Math.floor(MOCK_DATA.ips.length * 0.6 + Math.random() * MOCK_DATA.ips.length * 0.3),
              porcentajeTotal: (cartera / MOCK_DATA.cartera.total) * 100,
              activa: eps?.activa || true
            };
          })
          .sort((a, b) => b.carteraTotal - a.carteraTotal)
          .slice(0, limit);
      } else {
        // Para IPS, distribuir la cartera de manera realista
        resultado = MOCK_DATA.ips.slice(0, limit).map((ips, index) => {
          const carteraBase = MOCK_DATA.cartera.total / MOCK_DATA.ips.length;
          const factor = Math.pow(0.8, index) * (1 + Math.random() * 0.5);
          const carteraTotal = Math.floor(carteraBase * factor);

          return {
            id: ips.id,
            nombre: ips.nombre,
            carteraTotal,
            cantidadRelaciones: Math.floor(2 + Math.random() * 6), // 2-8 EPS por IPS
            porcentajeTotal: (carteraTotal / MOCK_DATA.cartera.total) * 100,
            activa: ips.activa
          };
        }).sort((a, b) => b.carteraTotal - a.carteraTotal);
      }

      this.cache.set(cacheKey, resultado);
      console.log(`✅ Top ${tipo.toUpperCase()} obtenido:`, resultado.length);

      return resultado;

    } catch (error) {
      console.error(`❌ Error obteniendo top ${tipo}:`, error);
      throw error;
    }
  }

  /**
   * Obtener tendencias y proyecciones
   */
  async getTendenciasYProyecciones(filters: DashboardFilters): Promise<TendenciasData> {
    const cacheKey = `tendencias-proyecciones-${JSON.stringify(filters)}`;
    const cached = this.cache.get(cacheKey);
    if (cached) return cached;

    console.log('📈 Dashboard EPS-IPS: Calculando tendencias y proyecciones...');

    try {
      await new Promise(resolve => setTimeout(resolve, 700));

      // Generar evolución de cartera basada en datos históricos
      const carteraEvolucion = MOCK_DATA.evolucionMensual.map(item => ({
        periodo: `${item.mes} 2024`,
        carteraTotal: item.cartera * 1000000, // Convertir a pesos
        variacionMensual: item.variacion,
        cantidadEPS: item.eps,
        cantidadIPS: item.ips
      }));

      // Calcular proyecciones futuras
      const ultimosPeridos = carteraEvolucion.slice(-3);
      const promedioVariacion = ultimosPeridos.reduce((sum, item) => sum + item.variacionMensual, 0) / ultimosPeridos.length;
      const ultimaCartera = carteraEvolucion[carteraEvolucion.length - 1].carteraTotal;

      const proyecciones: ProyeccionItem[] = [];
      let carteraBase = ultimaCartera;
      let confianzaBase = 85;

      for (let i = 1; i <= 3; i++) {
        carteraBase = carteraBase * (1 + promedioVariacion / 100);
        confianzaBase = Math.max(30, confianzaBase - i * 15);

        proyecciones.push({
          periodo: `${i === 1 ? 'Ene' : i === 2 ? 'Feb' : 'Mar'} 2025`,
          carteraProyectada: carteraBase,
          confianza: confianzaBase
        });
      }

      // Generar alertas basadas en tendencias
      const alertas: AlertaItem[] = [];
      
      // Alerta por crecimiento acelerado
      if (promedioVariacion > 10) {
        alertas.push({
          tipo: 'crecimiento_acelerado',
          mensaje: 'Crecimiento promedio superior al 10% detectado',
          severidad: 'alta',
          entidad: 'Sistema General',
          valor: promedioVariacion
        });
      }

      // Alerta por EPS con bajo cumplimiento
      Object.entries(MOCK_DATA.flujo).forEach(([eps, datos]) => {
        const cumplimiento = (datos.reconocido / datos.facturado) * 100;
        if (cumplimiento < 85) {
          alertas.push({
            tipo: 'cumplimiento_bajo',
            mensaje: `${eps}: Cumplimiento por debajo del 85%`,
            severidad: cumplimiento < 75 ? 'alta' : 'media',
            entidad: eps,
            valor: cumplimiento
          });
        }
      });

      // Alerta por concentración de riesgo
      const concentracionTop3 = Object.values(MOCK_DATA.cartera.porEPS)
        .sort((a, b) => b - a)
        .slice(0, 3)
        .reduce((sum, val) => sum + val, 0) / MOCK_DATA.cartera.total * 100;

      if (concentracionTop3 > 65) {
        alertas.push({
          tipo: 'concentracion_riesgo',
          mensaje: `Alta concentración: Top 3 EPS representan ${concentracionTop3.toFixed(1)}% del total`,
          severidad: 'media',
          entidad: 'Distribución',
          valor: concentracionTop3
        });
      }

      const tendenciasData: TendenciasData = {
        carteraEvolucion,
        proyecciones,
        alertas
      };

      this.cache.set(cacheKey, tendenciasData);
      console.log('✅ Tendencias calculadas:', {
        periodos: carteraEvolucion.length,
        proyecciones: proyecciones.length,
        alertas: alertas.length
      });

      return tendenciasData;

    } catch (error) {
      console.error('❌ Error calculando tendencias:', error);
      throw error;
    }
  }

  /**
   * Obtener análisis de flujo
   */
  async getAnalisisFlujo(filters: DashboardFilters): Promise<AnalisisFlujoData> {
    const cacheKey = `analisis-flujo-${JSON.stringify(filters)}`;
    const cached = this.cache.get(cacheKey);
    if (cached) return cached;

    console.log('💰 Dashboard EPS-IPS: Obteniendo análisis de flujo...');

    try {
      await new Promise(resolve => setTimeout(resolve, 500));

      let totalFacturado = 0;
      let totalReconocido = 0;
      let totalPagado = 0;
      const distribuccionEPS: Array<{
        epsNombre: string;
        porcentajeCumplimiento: number;
        valorFacturado: number;
        valorReconocido: number;
      }> = [];

      // Procesar datos de flujo por EPS
      Object.entries(MOCK_DATA.flujo).forEach(([epsNombre, datos]) => {
        const valorFacturado = datos.facturado * 1000000; // Convertir a pesos
        const valorReconocido = datos.reconocido * 1000000;
        const valorPagado = datos.pagado * 1000000;

        totalFacturado += valorFacturado;
        totalReconocido += valorReconocido;
        totalPagado += valorPagado;

        const porcentajeCumplimiento = valorFacturado > 0 
          ? (valorReconocido / valorFacturado) * 100 
          : 0;

        distribuccionEPS.push({
          epsNombre,
          porcentajeCumplimiento,
          valorFacturado,
          valorReconocido
        });
      });

      // Calcular cumplimiento promedio
      const cumplimientoPromedio = distribuccionEPS.length > 0
        ? distribuccionEPS.reduce((sum, eps) => sum + eps.porcentajeCumplimiento, 0) / distribuccionEPS.length
        : 0;

      // Generar tendencia mensual (últimos 6 meses)
      const tendenciaMensual = [
        { mes: 'Jul', cumplimiento: 88.5, meta: 92 },
        { mes: 'Ago', cumplimiento: 90.2, meta: 92 },
        { mes: 'Sep', cumplimiento: 87.8, meta: 92 },
        { mes: 'Oct', cumplimiento: 91.5, meta: 92 },
        { mes: 'Nov', cumplimiento: 93.2, meta: 92 },
        { mes: 'Dic', cumplimiento: cumplimientoPromedio, meta: 92 }
      ];

      const analisisFlujo: AnalisisFlujoData = {
        totalFacturado,
        totalReconocido,
        totalPagado,
        cumplimientoPromedio,
        distribuccionEPS: distribuccionEPS.sort((a, b) => b.valorFacturado - a.valorFacturado),
        tendenciaMensual
      };

      this.cache.set(cacheKey, analisisFlujo);
      console.log('✅ Análisis de flujo calculado:', {
        totalFacturado: `$${(totalFacturado / 1000000000).toFixed(1)}B`,
        cumplimientoPromedio: `${cumplimientoPromedio.toFixed(1)}%`,
        epsAnalizadas: distribuccionEPS.length
      });

      return analisisFlujo;

    } catch (error) {
      console.error('❌ Error obteniendo análisis de flujo:', error);
      throw error;
    }
  }

  /**
   * Limpiar cache
   */
  async refreshCache(): Promise<void> {
    console.log('🧹 Dashboard EPS-IPS: Limpiando cache...');
    this.cache.clear();
  }
}

// Instancia exportada
export const dashboardsEpsIpsAPI = new DashboardsEpsIpsAPI();