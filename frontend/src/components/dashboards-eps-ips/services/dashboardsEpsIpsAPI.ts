// frontend/src/components/dashboards-eps-ips/services/dashboardsEpsIpsAPI.ts
// ✅ DATOS SIMULADOS REALISTAS PARA EPS COLOMBIANAS

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
  valorUPCMin?: number;
  valorUPCMax?: number;
  incrementoMin?: number;
  incrementoMax?: number;
  tiposContrato?: string[];
  cumplimientoMin?: number;
  cumplimientoMax?: number;
}


// ✅ DATOS REALISTAS DE EPS COLOMBIANAS
const EPS_COLOMBIA_DATA = [
  {
    id: '1',
    nombre: 'COMPENSAR',
    codigo: 'CCF001',
    activa: true,
    participacion: 18.5,
    valorUPC: 62000000000, // $62,000M
    incrementoPromedio: 4.2,
    valorFacturado: 185000000000, // $185,000M
    reconocido: 175000000000,
    pagado: 162000000000,
    cumplimiento: 87.4,
    afiliados: 2800000,
    region: 'Bogotá-Cundinamarca',
    tipoContrato: ['Capitación', 'Evento'],
    riesgo: 'Medio'
  },
  {
    id: '2',
    nombre: 'COOSALUD',
    codigo: 'COS002',
    activa: true,
    participacion: 8.2,
    valorUPC: 28000000000, // $28,000M
    incrementoPromedio: 5.8,
    valorFacturado: 89000000000, // $89,000M
    reconocido: 82000000000,
    pagado: 76000000000,
    cumplimiento: 85.4,
    afiliados: 1200000,
    region: 'Costa Atlántica',
    tipoContrato: ['Capitación', 'Mixto'],
    riesgo: 'Medio-Alto'
  },
  {
    id: '3',
    nombre: 'FAMISANAR',
    codigo: 'FAM003',
    activa: true,
    participacion: 12.8,
    valorUPC: 45000000000, // $45,000M
    incrementoPromedio: 3.9,
    valorFacturado: 142000000000, // $142,000M
    reconocido: 138000000000,
    pagado: 135000000000,
    cumplimiento: 95.1,
    afiliados: 1850000,
    region: 'Bogotá-Cundinamarca',
    tipoContrato: ['Capitación', 'Global'],
    riesgo: 'Bajo'
  },
  {
    id: '4',
    nombre: 'MUTUALSER',
    codigo: 'MUT004',
    activa: true,
    participacion: 6.1,
    valorUPC: 22000000000, // $22,000M
    incrementoPromedio: 6.2,
    valorFacturado: 68000000000, // $68,000M
    reconocido: 62000000000,
    pagado: 55000000000,
    cumplimiento: 80.9,
    afiliados: 980000,
    region: 'Valle del Cauca',
    tipoContrato: ['Evento', 'Mixto'],
    riesgo: 'Alto'
  },
  {
    id: '5',
    nombre: 'NUEVA EPS',
    codigo: 'NEP005',
    activa: true,
    participacion: 25.3,
    valorUPC: 89000000000, // $89,000M
    incrementoPromedio: 4.7,
    valorFacturado: 298000000000, // $298,000M
    reconocido: 285000000000,
    pagado: 268000000000,
    cumplimiento: 89.8,
    afiliados: 4200000,
    region: 'Nacional',
    tipoContrato: ['Capitación', 'Evento', 'Global'],
    riesgo: 'Medio'
  },
  {
    id: '6',
    nombre: 'SALUD TOTAL',
    codigo: 'STO006',
    activa: true,
    participacion: 7.4,
    valorUPC: 26000000000, // $26,000M
    incrementoPromedio: 3.1,
    valorFacturado: 82000000000, // $82,000M
    reconocido: 79000000000,
    pagado: 77000000000,
    cumplimiento: 93.9,
    afiliados: 1100000,
    region: 'Bogotá-Antioquia',
    tipoContrato: ['Capitación', 'Global'],
    riesgo: 'Bajo'
  },
  {
    id: '7',
    nombre: 'SANITAS',
    codigo: 'SAN007',
    activa: true,
    participacion: 11.9,
    valorUPC: 42000000000, // $42,000M
    incrementoPromedio: 2.8,
    valorFacturado: 132000000000, // $132,000M
    reconocido: 129000000000,
    pagado: 126000000000,
    cumplimiento: 95.5,
    afiliados: 1650000,
    region: 'Bogotá-Nacional',
    tipoContrato: ['Capitación', 'Global'],
    riesgo: 'Bajo'
  },
  {
    id: '8',
    nombre: 'SURA',
    codigo: 'SUR008',
    activa: true,
    participacion: 9.8,
    valorUPC: 35000000000, // $35,000M
    incrementoPromedio: 3.4,
    valorFacturado: 108000000000, // $108,000M
    reconocido: 105000000000,
    pagado: 102000000000,
    cumplimiento: 94.4,
    afiliados: 1450000,
    region: 'Antioquia-Nacional',
    tipoContrato: ['Capitación', 'Global'],
    riesgo: 'Bajo'
  }
];

// ✅ DATOS DE IPS SIMULADAS POR REGIÓN
const IPS_DATA = [
  // Bogotá
  { id: 'ips1', nombre: 'Hospital San Carlos', region: 'Bogotá', nivel: 'III', tipo: 'Público' },
  { id: 'ips2', nombre: 'Clínica Colombia', region: 'Bogotá', nivel: 'III', tipo: 'Privado' },
  { id: 'ips3', nombre: 'Hospital Kennedy', region: 'Bogotá', nivel: 'II', tipo: 'Público' },
  { id: 'ips4', nombre: 'Clínica del Country', region: 'Bogotá', nivel: 'III', tipo: 'Privado' },

  // Antioquia
  { id: 'ips5', nombre: 'Hospital Pablo Tobón', region: 'Antioquia', nivel: 'III', tipo: 'Público' },
  { id: 'ips6', nombre: 'Clínica Las Vegas', region: 'Antioquia', nivel: 'II', tipo: 'Privado' },
  { id: 'ips7', nombre: 'Hospital San Vicente', region: 'Antioquia', nivel: 'III', tipo: 'Privado' },

  // Costa Atlántica
  { id: 'ips8', nombre: 'Hospital Universitario', region: 'Atlántico', nivel: 'III', tipo: 'Público' },
  { id: 'ips9', nombre: 'Clínica Portoazul', region: 'Atlántico', nivel: 'II', tipo: 'Privado' },
  { id: 'ips10', nombre: 'Hospital Santa Mónica', region: 'Magdalena', nivel: 'II', tipo: 'Público' },

  // Valle del Cauca
  { id: 'ips11', nombre: 'Hospital Universitario del Valle', region: 'Valle', nivel: 'III', tipo: 'Público' },
  { id: 'ips12', nombre: 'Clínica Imbanaco', region: 'Valle', nivel: 'III', tipo: 'Privado' },
  { id: 'ips13', nombre: 'Hospital San Juan de Dios', region: 'Valle', nivel: 'II', tipo: 'Público' }
];

// ✅ PERÍODOS DISPONIBLES
const PERIODOS_DATA = (() => {
  interface Periodo {
    id: string;
    nombre: string;
    mes: number;
    year: number;
    activo: boolean;
  }
  
  const periodos: Periodo[] = [];
  const meses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  
  // Generar períodos para 2023, 2024, 2025
  for (let year = 2023; year <= 2025; year++) {
    const maxMes = year === 2025 ? 8 : 12; // Solo hasta agosto 2025
    for (let mes = 1; mes <= maxMes; mes++) {
      periodos.push({
        id: `${year}-${mes.toString().padStart(2, '0')}`,
        nombre: `${meses[mes - 1]} ${year}`,
        mes,
        year,
        activo: true
      });
    }
  }
  
  return periodos.reverse(); // Más recientes primero
})();

const TIPOS_CONTRATO = ['Capitación', 'Evento', 'Mixto', 'Global Prospectivo'];

// ✅ FUNCIONES AUXILIARES PARA GENERAR DATOS REALISTAS
const generarTendenciaMensual = (baseValue: number, eps: any) => {
  return PERIODOS_DATA.map((periodo, index) => {
    // Crear variación realista basada en el mes y características de la EPS
    const variacionEstacional = Math.sin((index / 12) * 2 * Math.PI) * 0.1; // Variación estacional
    const variacionAleatoria = (Math.random() - 0.5) * 0.15; // ±7.5% aleatorio
    const tendenciaAnual = index * 0.008; // Crecimiento anual del 10%

    const factorVariacion = 1 + variacionEstacional + variacionAleatoria + tendenciaAnual;

    const facturado = Math.round(baseValue * factorVariacion);
    const reconocido = Math.round(facturado * (0.88 + Math.random() * 0.1)); // 88-98% reconocido
    const pagado = Math.round(reconocido * (eps.cumplimiento / 100));

    return {
      mes: periodo.nombre,
      periodo: `${periodo.nombre} ${periodo.year}`,
      facturado,
      reconocido,
      pagado,
      cumplimiento: reconocido > 0 ? (pagado / reconocido) * 100 : 0,
      incremento: eps.incrementoPromedio + (Math.random() - 0.5) * 2,
      saldoAdeudado: facturado - pagado
    };
  });
};

const generarDatosCartera = (eps: any, ips: any) => {
  const baseCartera = eps.valorFacturado / 15; // Distribuir entre ~15 IPS por EPS

  // Generar distribución de cartera por antigüedad
  const total = baseCartera * (0.8 + Math.random() * 0.4); // Variación del ±20%

  return {
    epsId: eps.id,
    epsNombre: eps.nombre,
    ipsId: ips.id,
    ipsNombre: ips.nombre,
    valorActual: total,
    valorAnterior: total * (0.95 + Math.random() * 0.1), // Variación del mes anterior
    variacion: total * (Math.random() - 0.5) * 0.1, // ±5% variación
    variacionPorcentual: (Math.random() - 0.5) * 10, // ±5% variación porcentual
    // Distribución por antigüedad (días)
    a30: total * 0.35, // 35% cartera reciente
    a60: total * 0.25, // 25% cartera 30-60 días
    a90: total * 0.20, // 20% cartera 60-90 días
    a120: total * 0.10, // 10% cartera 90-120 días
    a180: total * 0.06, // 6% cartera 120-180 días
    a360: total * 0.03, // 3% cartera 180-360 días
    sup360: total * 0.01 // 1% cartera >360 días
  };
};

const generarDatosFlujo = (eps: any, ips: any, periodo: any) => {
  const baseFacturado = eps.valorFacturado / 12 / 15; // Mensual por IPS
  const variacionEstacional = Math.sin((periodo.mes / 12) * 2 * Math.PI) * 0.1; // Variación por mes
  const variacionAleatoria = 0.8 + Math.random() * 0.4; // ±20% variación
  
  const factorTotal = variacionAleatoria * (1 + variacionEstacional);
  const valorFacturado = Math.round(baseFacturado * factorTotal);
  const valorGlosa = Math.round(valorFacturado * (0.02 + Math.random() * 0.08)); // 2-10% glosas
  const reconocido = valorFacturado - valorGlosa;
  const valorPagado = Math.round(reconocido * (eps.cumplimiento / 100));

  return {
    epsId: eps.id,
    epsNombre: eps.nombre,
    ipsId: ips.id,
    ipsNombre: ips.nombre,
    periodoId: periodo.id,
    periodoNombre: periodo.nombre,
    año: periodo.year,
    mes: periodo.mes,
    incremento: eps.incrementoPromedio + (Math.random() - 0.5) * 2,
    tipoContrato: eps.tipoContrato[Math.floor(Math.random() * eps.tipoContrato.length)],
    valorFacturado,
    valorGlosa,
    reconocido,
    valorPagado,
    saldoAdeudado: valorFacturado - valorPagado,
    cumplimientoPagos: reconocido > 0 ? (valorPagado / reconocido) * 100 : 0
  };
};

// ✅ API PRINCIPAL CON DATOS REALISTAS
export const dashboardsEpsIpsAPI = {

  // Obtener lista de EPS
  async getEPSList(): Promise<any[]> {
    return new Promise(resolve => {
      setTimeout(() => {
        console.log('📋 Cargando EPS colombianas...');
        resolve(EPS_COLOMBIA_DATA);
      }, 300);
    });
  },

  // Obtener períodos disponibles
  async getPeriodos(): Promise<any[]> {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(PERIODOS_DATA);
      }, 200);
    });
  },

  // Obtener trazabilidad de cartera con datos realistas
  async getCarteraTrazabilidad(filters: DashboardFilters = { tipoAnalisis: 'cartera' }): Promise<any> {
  return new Promise(resolve => {
    setTimeout(() => {
      console.log('📊 Generando trazabilidad de cartera con filtros:', filters);

      // Filtrar EPS según selección
      const epsSeleccionadas = filters.epsIds?.length
        ? EPS_COLOMBIA_DATA.filter(eps => filters.epsIds!.includes(eps.id))
        : EPS_COLOMBIA_DATA;

      // Filtrar períodos según selección
      const periodosSeleccionados = filters.periodoIds?.length
        ? PERIODOS_DATA.filter(periodo => filters.periodoIds!.includes(periodo.id))
        : PERIODOS_DATA.slice(0, 6); // Últimos 6 meses por defecto

      console.log('✅ Aplicando filtros:', {
        epsOriginal: EPS_COLOMBIA_DATA.length,
        epsSeleccionadas: epsSeleccionadas.length,
        periodosOriginales: PERIODOS_DATA.length,
        periodosSeleccionados: periodosSeleccionados.length
      });

      const trazabilidadData: any[] = [];

      epsSeleccionadas.forEach(eps => {
        periodosSeleccionados.forEach(periodo => {
          // Generar 8-15 IPS por EPS
          const numIPS = 8 + Math.floor(Math.random() * 8);
          const ipsParaEPS = IPS_DATA.slice(0, numIPS);

          ipsParaEPS.forEach(ips => {
            const datos = generarDatosCartera(eps, ips);
            trazabilidadData.push({
              ...datos,
              periodoId: periodo.id,
              periodoNombre: periodo.nombre,
              año: periodo.year,
              mes: periodo.mes
            });
          });
        });
      });

      console.log('✅ Datos de cartera generados:', {
        total: trazabilidadData.length,
        porEPS: trazabilidadData.length / epsSeleccionadas.length,
        porPeriodo: trazabilidadData.length / periodosSeleccionados.length
      });

      resolve(trazabilidadData);
    }, 500);
  });
},
  // Obtener análisis de flujo con datos realistas
  async getAnalisisFlujo(filters: DashboardFilters = { tipoAnalisis: 'flujo' }): Promise<any> {
  return new Promise(resolve => {
    setTimeout(() => {
      console.log('💰 Generando análisis de flujo con filtros:', filters);

      // Filtrar EPS según selección
      const epsSeleccionadas = filters.epsIds?.length
        ? EPS_COLOMBIA_DATA.filter(eps => filters.epsIds!.includes(eps.id))
        : EPS_COLOMBIA_DATA;

      // Filtrar períodos según selección
      const periodosSeleccionados = filters.periodoIds?.length
        ? PERIODOS_DATA.filter(periodo => filters.periodoIds!.includes(periodo.id))
        : PERIODOS_DATA.slice(0, 6);

      const totalFacturado = epsSeleccionadas.reduce((sum, eps) => sum + eps.valorFacturado, 0);
      const totalReconocido = epsSeleccionadas.reduce((sum, eps) => sum + eps.reconocido, 0);
      const totalPagado = epsSeleccionadas.reduce((sum, eps) => sum + eps.pagado, 0);
      const cumplimientoPromedio = epsSeleccionadas.reduce((sum, eps) => sum + eps.cumplimiento, 0) / epsSeleccionadas.length;
      const incrementoPromedio = epsSeleccionadas.reduce((sum, eps) => sum + eps.incrementoPromedio, 0) / epsSeleccionadas.length;

      // Generar distribución por EPS (solo las seleccionadas)
      const distribuccionPorEPS = epsSeleccionadas.map((eps, index) => ({
        nombre: eps.nombre,
        valor: eps.valorFacturado,
        porcentaje: (eps.valorFacturado / totalFacturado) * 100,
        cumplimiento: eps.cumplimiento,
        color: `hsl(${index * 45}, 70%, 60%)`
      }));

      // Generar tendencia mensual (solo períodos seleccionados)
      const tendenciaMensual = periodosSeleccionados.map((periodo, index) => {
        const base = totalFacturado / periodosSeleccionados.length;
        const variacion = Math.sin((index / 12) * 2 * Math.PI) * 0.1 + (Math.random() - 0.5) * 0.1;
        const facturado = base * (1 + variacion);
        const pagado = facturado * (cumplimientoPromedio / 100);

        return {
          mes: periodo.nombre.split(' ')[0], // Solo el mes
          periodo: periodo.nombre,
          cumplimiento: 75 + Math.random() * 20,
          meta: 92,
          facturado: Math.round(facturado),
          reconocido: Math.round(facturado * 0.93),
          pagado: Math.round(pagado)
        };
      });

      // Generar datos de flujo detallados
      const flujoDetallado: any[] = [];
      epsSeleccionadas.forEach(eps => {
        periodosSeleccionados.forEach(periodo => {
          const numIPS = 8 + Math.floor(Math.random() * 8);
          const ipsParaEPS = IPS_DATA.slice(0, numIPS);
          
          ipsParaEPS.forEach(ips => {
            flujoDetallado.push(generarDatosFlujo(eps, ips, periodo));
          });
        });
      });

      resolve({
        totalFacturado,
        totalReconocido,
        totalPagado,
        cumplimientoPromedio,
        incrementoPromedio,
        tiposContrato: TIPOS_CONTRATO,
        distribuccionPorEPS,
        tendenciaMensual,
        flujoData: flujoDetallado, // Agregar datos detallados
        resumen: {
          epsAnalizadas: epsSeleccionadas.length,
          periodosAnalizados: periodosSeleccionados.length,
          registrosGenerados: flujoDetallado.length
        }
      });
    }, 600);
  });
},

  // Obtener tendencias y proyecciones
  async getTendenciasYProyecciones(filters: DashboardFilters = { tipoAnalisis: 'ambos' }): Promise<any> {
  return new Promise(resolve => {
    setTimeout(() => {
      console.log('📈 Generando tendencias y proyecciones con filtros:', filters);

      const epsSeleccionadas = filters.epsIds?.length
        ? EPS_COLOMBIA_DATA.filter(eps => filters.epsIds!.includes(eps.id))
        : EPS_COLOMBIA_DATA;

      const periodosSeleccionados = filters.periodoIds?.length
        ? PERIODOS_DATA.filter(periodo => filters.periodoIds!.includes(periodo.id))
        : PERIODOS_DATA.slice(0, 12); // Último año por defecto

      // Evolución de cartera mensual (solo períodos seleccionados)
      const carteraEvolucion = periodosSeleccionados.map((periodo, index) => {
        const baseCartera = epsSeleccionadas.reduce((sum, eps) => sum + eps.valorFacturado, 0) / periodosSeleccionados.length;
        const variacion = Math.sin((index / 12) * 2 * Math.PI) * 0.08 + (Math.random() - 0.5) * 0.05;
        const tendencia = index * 0.01;

        return {
          periodo: periodo.nombre,
          periodoId: periodo.id,
          carteraTotal: Math.round(baseCartera * (1 + variacion + tendencia) / 1000000), // En millones
          variacionMensual: (variacion + tendencia) * 100,
          cantidadEPS: epsSeleccionadas.length,
          cantidadIPS: epsSeleccionadas.length * 12,
          año: periodo.year,
          mes: periodo.mes
        };
      });

      // Proyecciones futuras basadas en EPS seleccionadas
      const ultimoValor = carteraEvolucion[carteraEvolucion.length - 1]?.carteraTotal || 0;
      const proyecciones = [
        { periodo: 'Próximo mes', carteraProyectada: ultimoValor * 1.03, confianza: 85 },
        { periodo: 'Próximo trimestre', carteraProyectada: ultimoValor * 1.08, confianza: 78 },
        { periodo: 'Próximo semestre', carteraProyectada: ultimoValor * 1.15, confianza: 65 }
      ];

      // Alertas específicas para EPS seleccionadas
      const alertas: Array<{
        tipo: string;
        mensaje: string;
        severidad: string;
        entidad: string;
        valor: number;
      }> = [];

      epsSeleccionadas.forEach(eps => {
        if (eps.cumplimiento < 85) {
          alertas.push({
            tipo: 'cumplimiento_bajo',
            mensaje: `${eps.nombre} tiene cumplimiento del ${eps.cumplimiento.toFixed(1)}%`,
            severidad: eps.cumplimiento < 80 ? 'alta' : 'media',
            entidad: eps.nombre,
            valor: eps.cumplimiento
          });
        }

        if (eps.incrementoPromedio > 5) {
          alertas.push({
            tipo: 'incremento_alto',
            mensaje: `${eps.nombre} tiene incremento del ${eps.incrementoPromedio.toFixed(1)}%`,
            severidad: 'media',
            entidad: eps.nombre,
            valor: eps.incrementoPromedio
          });
        }
      });

      resolve({
        carteraEvolucion,
        proyecciones,
        alertas,
        filtrosAplicados: {
          eps: epsSeleccionadas.length,
          periodos: periodosSeleccionados.length
        }
      });
    }, 400);
  });
},

  // Obtener métricas comparativas
  async getMetricasComparativas(filters: DashboardFilters): Promise<any> {
    return new Promise(resolve => {
      setTimeout(() => {
        const epsSeleccionadas = filters.epsIds?.length
          ? EPS_COLOMBIA_DATA.filter(eps => filters.epsIds!.includes(eps.id))
          : EPS_COLOMBIA_DATA;

        const totalCartera = epsSeleccionadas.reduce((sum, eps) => sum + eps.valorFacturado, 0);
        const totalUPC = epsSeleccionadas.reduce((sum, eps) => sum + eps.valorUPC, 0);
        const totalIPS = epsSeleccionadas.length * 12; // Promedio 12 IPS por EPS

        resolve({
          eps: {
            total: epsSeleccionadas.length,
            activas: epsSeleccionadas.filter(eps => eps.activa).length,
            carteraTotal: totalCartera,
            carteraPromedio: totalCartera / epsSeleccionadas.length
          },
          ips: {
            total: totalIPS,
            activas: Math.round(totalIPS * 0.95), // 95% activas
            carteraTotal: totalCartera,
            carteraPromedio: totalCartera / totalIPS
          },
          relaciones: {
            relacionesUnicas: epsSeleccionadas.length * 12,
            concentracionRiesgo: {
              top3Concentracion: 45.2, // Top 3 EPS concentran 45.2%
              distribucioEquitativa: 54.8
            }
          }
        });
      }, 300);
    });
  },

  async getEPSById(epsId: string): Promise<any> {
  return new Promise(resolve => {
    setTimeout(() => {
      const eps = EPS_COLOMBIA_DATA.find(e => e.id === epsId);
      resolve(eps || null);
    }, 100);
  });
},

// Obtener período específico por ID
async getPeriodoById(periodoId: string): Promise<any> {
  return new Promise(resolve => {
    setTimeout(() => {
      const periodo = PERIODOS_DATA.find(p => p.id === periodoId);
      resolve(periodo || null);
    }, 100);
  });
},

  // Obtener top entidades
  async getTopEntidades(tipo: 'eps' | 'ips', limit: number = 10, filters: DashboardFilters = { tipoAnalisis: 'ambos' }): Promise<any> {
    return new Promise(resolve => {
      setTimeout(() => {
        if (tipo === 'eps') {
          const topEPS = [...EPS_COLOMBIA_DATA]
            .sort((a, b) => b.valorFacturado - a.valorFacturado)
            .slice(0, limit)
            .map((eps, index) => ({
              posicion: index + 1,
              id: eps.id,
              nombre: eps.nombre,
              valor: eps.valorFacturado,
              cumplimiento: eps.cumplimiento,
              participacion: eps.participacion,
              tendencia: eps.cumplimiento > 90 ? 'up' : eps.cumplimiento < 85 ? 'down' : 'neutral',
              afiliados: eps.afiliados,
              region: eps.region
            }));

          resolve(topEPS);
        } else {
          // Generar top IPS
          const topIPS = IPS_DATA.slice(0, limit).map((ips, index) => {
            const epsAsociada = EPS_COLOMBIA_DATA[index % EPS_COLOMBIA_DATA.length];
            const valor = (epsAsociada.valorFacturado / 12) * (0.8 + Math.random() * 0.4);

            return {
              posicion: index + 1,
              id: ips.id,
              nombre: ips.nombre,
              valor: Math.round(valor),
              cumplimiento: 70 + Math.random() * 25, // 70-95%
              epsAsociada: epsAsociada.nombre,
              region: ips.region,
              nivel: ips.nivel,
              tipo: ips.tipo,
              tendencia: Math.random() > 0.5 ? 'up' : 'down'
            };
          }).sort((a, b) => b.valor - a.valor);

          resolve(topIPS);
        }
      }, 400);
    });
  },

  // Obtener información específica de ADRES para una EPS
  async getEPSAdresInfo(epsId: string): Promise<any[]> {
    return new Promise(resolve => {
      setTimeout(() => {
        console.log(`📋 Generando información ADRES para EPS: ${epsId}`);

        const eps = EPS_COLOMBIA_DATA.find(e => e.id === epsId);
        if (!eps) {
          resolve([]);
          return;
        }

        const adresData = PERIODOS_DATA.map(periodo => {
          const upcMensual = eps.valorUPC / 12;
          const variacion = (Math.random() - 0.5) * 0.1; // ±5% variación
          const upc = Math.round(upcMensual * (1 + variacion));
          const valorGirado = Math.round(upc * (0.95 + Math.random() * 0.05)); // 95-100% del UPC
          const pagos = Math.round(valorGirado * (eps.cumplimiento / 100));

          return {
            periodo: `${periodo.nombre} ${periodo.year}`,
            eps: eps.nombre,
            upc,
            upc92: Math.round(upc * 0.92),
            upc60: Math.round(upc * 0.60),
            valorGirado,
            pagos,
            cumplimientoPagos: valorGirado > 0 ? (pagos / valorGirado) * 100 : 0
          };
        });

        resolve(adresData);
      }, 300);
    });
  },

  // Funciones específicas para el nuevo reporte EPS
  async getEPSReporteData(epsId: string, filters: DashboardFilters = { tipoAnalisis: 'ambos' }): Promise<any> {
    const eps = EPS_COLOMBIA_DATA.find(e => e.id === epsId);
    if (!eps) throw new Error('EPS no encontrada');

    return new Promise(resolve => {
      setTimeout(() => {
        const tendenciaMensual = generarTendenciaMensual(eps.valorFacturado / 12, eps);

        resolve({
          id: eps.id,
          nombre: eps.nombre,
          valorTotalUPC: eps.valorUPC,
          incrementoPromedio: eps.incrementoPromedio,
          tiposContrato: eps.tipoContrato,
          valorFacturado: eps.valorFacturado,
          reconocido: eps.reconocido,
          pagado: eps.pagado,
          saldoAdeudado: eps.valorFacturado - eps.pagado,
          cumplimientoPagos: eps.cumplimiento,
          participacionMercado: eps.participacion,
          tendenciaMensual,
          detalleContratos: eps.tipoContrato.map(tipo => ({
            tipo,
            cantidad: Math.floor(Math.random() * 50) + 10,
            valorPromedio: Math.floor(Math.random() * 5000000) + 1000000
          }))
        });
      }, 400);
    });
  },

  async compararEPS(epsIds: string[], filters: DashboardFilters = { tipoAnalisis: 'ambos' }): Promise<any> {
    return new Promise(resolve => {
      setTimeout(() => {
        console.log(`📊 Comparando ${epsIds.length} EPS:`, epsIds);

        // Obtener datos de cada EPS seleccionada
        const datosEPS = epsIds.map(epsId => {
          const eps = EPS_COLOMBIA_DATA.find(e => e.id === epsId);
          if (!eps) return null;

          return {
            id: eps.id,
            nombre: eps.nombre,
            valorTotalUPC: eps.valorUPC,
            incrementoPromedio: eps.incrementoPromedio,
            tiposContrato: eps.tipoContrato,
            valorFacturado: eps.valorFacturado,
            reconocido: eps.reconocido,
            pagado: eps.pagado,
            saldoAdeudado: eps.valorFacturado - eps.pagado,
            cumplimientoPagos: eps.cumplimiento,
            participacionMercado: eps.participacion,
            tendenciaMensual: generarTendenciaMensual(eps.valorFacturado / 12, eps)
          };
        }).filter(Boolean);

        // Calcular métricas agregadas
        const totalUPC = datosEPS.reduce((sum, eps) => sum + (eps?.valorTotalUPC || 0), 0);
        const totalFacturado = datosEPS.reduce((sum, eps) => sum + (eps?.valorFacturado || 0), 0);
        const promedioIncremento = datosEPS.reduce((sum, eps) => sum + (eps?.incrementoPromedio || 0), 0) / datosEPS.length;
        const promedioCumplimiento = datosEPS.reduce((sum, eps) => sum + (eps?.cumplimientoPagos || 0), 0) / (datosEPS.length || 1);

        // Calcular rankings
        const mayorUPC = datosEPS.reduce((max: any, eps: any) => (max?.valorTotalUPC || 0) > (eps?.valorTotalUPC || 0) ? max : eps, datosEPS[0]);
        const menorIncremento = datosEPS.reduce((min: any, eps: any) => (eps?.incrementoPromedio || Infinity) < (min?.incrementoPromedio || Infinity) ? eps : min, datosEPS[0]);
        const mayorCumplimiento = datosEPS.reduce((max: any, eps: any) => (eps?.cumplimientoPagos || -Infinity) > (max?.cumplimientoPagos || -Infinity) ? eps : max, datosEPS[0]);
        const mayorParticipacion = datosEPS.filter(eps => eps !== null).reduce((max: any, eps: any) => eps.participacionMercado > max.participacionMercado ? eps : max);

        resolve({
          eps: datosEPS,
          metricas: {
            totalUPC,
            totalFacturado,
            promedioIncremento,
            promedioCumplimiento
          },
          rankings: {
            mayorUPC,
            menorIncremento,
            mayorCumplimiento,
            mayorParticipacion
          }
        });
      }, 500);
    });
  },

  // Obtener tipos de contrato disponibles
  async getTiposContrato(): Promise<string[]> {
    return TIPOS_CONTRATO;
  },

  // Filtrar EPS por criterios específicos
  async filtrarEPS(filtros: {
    valorUPCMin?: number;
    valorUPCMax?: number;
    incrementoMin?: number;
    incrementoMax?: number;
    cumplimientoMin?: number;
    cumplimientoMax?: number;
    tiposContrato?: string[];
  }): Promise<any[]> {
    return new Promise(resolve => {
      setTimeout(() => {
        console.log('🔍 Filtrando EPS con criterios:', filtros);

        const filtered = EPS_COLOMBIA_DATA.filter(eps => {
          // Filtro por valor UPC
          if (filtros.valorUPCMin !== undefined && eps.valorUPC < filtros.valorUPCMin) return false;
          if (filtros.valorUPCMax !== undefined && eps.valorUPC > filtros.valorUPCMax) return false;

          // Filtro por incremento
          if (filtros.incrementoMin !== undefined && eps.incrementoPromedio < filtros.incrementoMin) return false;
          if (filtros.incrementoMax !== undefined && eps.incrementoPromedio > filtros.incrementoMax) return false;

          // Filtro por cumplimiento
          if (filtros.cumplimientoMin !== undefined && eps.cumplimiento < filtros.cumplimientoMin) return false;
          if (filtros.cumplimientoMax !== undefined && eps.cumplimiento > filtros.cumplimientoMax) return false;

          // Filtro por tipos de contrato
          if (filtros.tiposContrato && filtros.tiposContrato.length > 0) {
            const tieneContrato = eps.tipoContrato.some(tipo => filtros.tiposContrato!.includes(tipo));
            if (!tieneContrato) return false;
          }

          return true;
        });

        resolve(filtered);
      }, 300);
    });
  },

  // Generar reporte ejecutivo completo para una EPS
  async generarReporteEjecutivoEPS(epsId: string, filters: DashboardFilters = { tipoAnalisis: 'ambos' }): Promise<any> {
    return new Promise(async resolve => {
      setTimeout(async () => {
        console.log(`📋 Generando reporte ejecutivo para EPS: ${epsId}`);

        const [
          datosEPS,
          carteraData,
          flujoData,
          adresData,
          tendenciasData
        ] = await Promise.all([
          this.getEPSReporteData(epsId, filters),
          this.getCarteraTrazabilidad({ epsIds: [epsId], ...filters }),
          this.getAnalisisFlujo({ epsIds: [epsId], ...filters }),
          this.getEPSAdresInfo(epsId),
          this.getTendenciasYProyecciones({ epsIds: [epsId], ...filters })
        ]);

        // Análisis de riesgos
        const riesgos: Array<{
          tipo: string;
          nivel: string;
          descripcion: string;
          recomendacion: string;
        }> = [];
        if (datosEPS.cumplimientoPagos < 80) {
          riesgos.push({
            tipo: 'cumplimiento_bajo',
            nivel: 'alto',
            descripcion: `Cumplimiento de pagos del ${datosEPS.cumplimientoPagos.toFixed(1)}% está por debajo del objetivo del 90%`,
            recomendacion: 'Implementar plan de mejora en procesos de pago'
          });
        }

        if (datosEPS.incrementoPromedio > 5) {
          riesgos.push({
            tipo: 'incremento_alto',
            nivel: 'medio',
            descripcion: `Incremento promedio del ${datosEPS.incrementoPromedio.toFixed(1)}% supera límites recomendados`,
            recomendacion: 'Revisar estructura de costos y negociaciones'
          });
        }

        // Oportunidades
        const oportunidades: Array<{
          tipo: string;
          descripcion: string;
          accion: string;
        }> = [];
        if (datosEPS.cumplimientoPagos > 95) {
          oportunidades.push({
            tipo: 'cumplimiento_excelente',
            descripcion: 'Excelente cumplimiento de pagos, referente para otras EPS',
            accion: 'Documentar mejores prácticas para replicar'
          });
        }

        resolve({
          eps: datosEPS,
          cartera: carteraData,
          flujo: flujoData,
          adres: adresData,
          tendencias: tendenciasData,
          analisis: {
            riesgos,
            oportunidades,
            recomendaciones: [
              'Mantener seguimiento mensual de indicadores clave',
              'Implementar alertas tempranas para desviaciones',
              'Fortalecer comunicación con IPS de mayor volumen'
            ]
          },
          timestamp: new Date().toISOString(),
          periodo: filters.periodoIds || ['2025']
        });
      }, 600);
    });
  },

  // Exportar datos de comparación
  async exportarComparacionEPS(epsIds: string[], formato: 'excel' | 'pdf' = 'excel'): Promise<Blob> {
    return new Promise(async resolve => {
      setTimeout(async () => {
        console.log(`📤 Exportando comparación de ${epsIds.length} EPS en formato ${formato}`);

        const comparacion = await this.compararEPS(epsIds);

        if (formato === 'excel') {
          // Simular generación de Excel
          const datosExcel = comparacion.eps.map((eps: any) => ({
            'EPS': eps.nombre,
            'Valor UPC': eps.valorTotalUPC,
            'Incremento %': eps.incrementoPromedio,
            'Valor Facturado': eps.valorFacturado,
            'Reconocido': eps.reconocido,
            'Pagado': eps.pagado,
            'Saldo Adeudado': eps.saldoAdeudado,
            'Cumplimiento %': eps.cumplimientoPagos,
            'Participación %': eps.participacionMercado
          }));

          // Crear CSV simulado
          const csvContent = [
            Object.keys(datosExcel[0]).join(','),
            ...datosExcel.map(row => Object.values(row).join(','))
          ].join('\n');

          resolve(new Blob([csvContent], { type: 'text/csv;charset=utf-8;' }));
        } else {
          // Para PDF, devolver blob simulado
          resolve(new Blob(['PDF Content Simulado'], { type: 'application/pdf' }));
        }
      }, 400);
    });
  }
  
};

export const filtrosUtils = {
  
  // Validar si los filtros están aplicados
  hayFiltrosAplicados: (filters: DashboardFilters): boolean => {
    return ((filters.epsIds?.length ?? 0) > 0) ||
           ((filters.periodoIds?.length ?? 0) > 0) ||
           ((filters.ipsIds?.length ?? 0) > 0);
  },

  // Obtener resumen de filtros aplicados
  obtenerResumenFiltros: (filters: DashboardFilters): string => {
    const resumen: string[] = [];
    
    if (filters.epsIds && filters.epsIds.length > 0) {
      resumen.push(`${filters.epsIds.length} EPS`);
    }
    
    if (filters.periodoIds && filters.periodoIds.length > 0) {
      resumen.push(`${filters.periodoIds.length} períodos`);
    }
    
    if (filters.ipsIds && filters.ipsIds.length > 0) {
      resumen.push(`${filters.ipsIds.length} IPS`);
    }
    
    if (filters.tipoAnalisis !== 'ambos') {
      resumen.push(`análisis: ${filters.tipoAnalisis}`);
    }
    
    return resumen.length > 0 ? resumen.join(' • ') : 'Sin filtros aplicados';
  },

  // Limpiar filtros
  limpiarFiltros: (): DashboardFilters => ({
    epsIds: [],
    ipsIds: [],
    periodoIds: [],
    fechaInicio: '',
    fechaFin: '',
    tipoAnalisis: 'ambos'
  }),

  // Aplicar filtro rápido
  aplicarFiltroRapido: (tipo: 'top-eps' | 'ultimo-trimestre' | 'ultimo-semestre' | 'año-actual'): Partial<DashboardFilters> => {
    switch (tipo) {
      case 'top-eps':
        return { epsIds: EPS_COLOMBIA_DATA.slice(0, 5).map(eps => eps.id) };
      
      case 'ultimo-trimestre':
        return { periodoIds: PERIODOS_DATA.slice(0, 3).map(p => p.id) };
      
      case 'ultimo-semestre':
        return { periodoIds: PERIODOS_DATA.slice(0, 6).map(p => p.id) };
      
      case 'año-actual':
        return { 
          periodoIds: PERIODOS_DATA.filter(p => p.year === 2025).map(p => p.id) 
        };
      
      default:
        return {};
    }
  }
};

// ✅ Exportar como default
export default dashboardsEpsIpsAPI;