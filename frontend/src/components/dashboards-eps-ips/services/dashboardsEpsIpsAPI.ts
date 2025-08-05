// frontend/src/components/dashboards-eps-ips/services/dashboardsEpsIpsAPI.ts
// ✅ API MEJORADA: Soporte completo para Reporte Ejecutivo EPS con comparación
import { carteraAPI } from '../../../services/carteraApi';
import { flujoAPI } from '../../../services/flujoApi';
import { adresAPI } from '../../../services/adresApi';
import { epsAPI } from '../../../services/gestionApi';

interface DashboardFilters {
  epsIds?: string[];
  ipsIds?: string[];
  periodoIds?: string[];
  fechaInicio?: string;
  fechaFin?: string;
  tipoAnalisis: 'cartera' | 'flujo' | 'ambos';
  // ✅ Nuevos filtros para EPS
  valorUPCMin?: number;
  valorUPCMax?: number;
  incrementoMin?: number;
  incrementoMax?: number;
  tiposContrato?: string[];
  cumplimientoMin?: number;
  cumplimientoMax?: number;
}

interface EPSReporteData {
  id: string;
  nombre: string;
  valorTotalUPC: number;
  incrementoPromedio: number;
  tiposContrato: string[];
  valorFacturado: number;
  reconocido: number;
  pagado: number;
  saldoAdeudado: number;
  cumplimientoPagos: number;
  participacionMercado: number;
  tendenciaMensual: Array<{
    mes: string;
    facturado: number;
    pagado: number;
    cumplimiento: number;
  }>;
  detalleContratos: Array<{
    tipo: string;
    cantidad: number;
    valorPromedio: number;
  }>;
}

interface ComparacionEPS {
  eps: EPSReporteData[];
  metricas: {
    totalUPC: number;
    totalFacturado: number;
    promedioIncremento: number;
    promedioCumplimiento: number;
  };
  rankings: {
    mayorUPC: EPSReporteData;
    menorIncremento: EPSReporteData;
    mayorCumplimiento: EPSReporteData;
    mayorParticipacion: EPSReporteData;
  };
}

// ✅ DATOS MOCK MEJORADOS PARA DESARROLLO
const MOCK_EPS_DATA = [
  {
    id: '1',
    nombre: 'NUEVA EPS',
    codigo: 'NE001',
    activa: true,
    participacion: 28.5,
    valorUPC: 45000000000, // $45,000M
    incrementoPromedio: 4.2,
    valorFacturado: 156000000000, // $156,000M
    reconocido: 148000000000,
    pagado: 132000000000,
    cumplimiento: 89.2
  },
  {
    id: '2',
    nombre: 'SANITAS',
    codigo: 'SA002',
    activa: true,
    participacion: 18.2,
    valorUPC: 28000000000,
    incrementoPromedio: 3.8,
    valorFacturado: 98000000000,
    reconocido: 94000000000,
    pagado: 87000000000,
    cumplimiento: 92.6
  },
  {
    id: '3',
    nombre: 'SURA',
    codigo: 'SU003',
    activa: true,
    participacion: 15.8,
    valorUPC: 24000000000,
    incrementoPromedio: 3.1,
    valorFacturado: 82000000000,
    reconocido: 79000000000,
    pagado: 76000000000,
    cumplimiento: 96.2
  },
  {
    id: '4',
    nombre: 'COMPENSAR',
    codigo: 'CO004',
    activa: true,
    participacion: 12.4,
    valorUPC: 18000000000,
    incrementoPromedio: 5.7,
    valorFacturado: 64000000000,
    reconocido: 58000000000,
    pagado: 52000000000,
    cumplimiento: 89.7
  },
  {
    id: '5',
    nombre: 'COOMEVA',
    codigo: 'CV005',
    activa: true,
    participacion: 8.9,
    valorUPC: 13000000000,
    incrementoPromedio: 4.8,
    valorFacturado: 48000000000,
    reconocido: 45000000000,
    pagado: 41000000000,
    cumplimiento: 91.1
  }
];

const TIPOS_CONTRATO = ['Capitación', 'Evento', 'Mixto', 'Global Prospectivo'];

const generarTendenciaMensual = (base: number) => {
  const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  return meses.map((mes, index) => {
    const variacion = (Math.random() - 0.5) * 0.2; // ±10% variación
    const facturado = base * (1 + variacion);
    const pagado = facturado * (0.8 + Math.random() * 0.15); // 80-95% de lo facturado
    const cumplimiento = (pagado / facturado) * 100;
    
    return {
      mes,
      facturado: Math.round(facturado),
      pagado: Math.round(pagado),
      cumplimiento: Math.round(cumplimiento * 100) / 100
    };
  });
};

const generarDetalleContratos = () => {
  return TIPOS_CONTRATO.map(tipo => ({
    tipo,
    cantidad: Math.floor(Math.random() * 50) + 10,
    valorPromedio: Math.floor(Math.random() * 5000000) + 1000000
  }));
};

export const dashboardsEpsIpsAPI = {
  
  // ✅ NUEVO: Obtener lista de EPS disponibles
  async getEPSList(): Promise<any[]> {
    try {
      // En producción, usar la API real
      // const response = await epsAPI.getAll({ soloActivas: true });
      // return response.data?.data || [];
      
      // Por ahora, devolver datos mock
      return MOCK_EPS_DATA;
    } catch (error) {
      console.error('❌ Error obteniendo lista de EPS:', error);
      return MOCK_EPS_DATA; // Fallback a datos mock
    }
  },

  // ✅ NUEVO: Obtener lista de períodos disponibles
  async getPeriodos(): Promise<any[]> {
    try {
      const response = await adresAPI.getPeriodos();
      return response.data || [];
    } catch (error) {
      console.error('❌ Error obteniendo períodos:', error);
      // Datos mock de períodos
      return [
        { id: '1', nombre: 'Enero', year: 2024, mes: 1 },
        { id: '2', nombre: 'Febrero', year: 2024, mes: 2 },
        { id: '3', nombre: 'Marzo', year: 2024, mes: 3 },
        { id: '4', nombre: 'Abril', year: 2024, mes: 4 },
        { id: '5', nombre: 'Mayo', year: 2024, mes: 5 },
        { id: '6', nombre: 'Junio', year: 2024, mes: 6 }
      ];
    }
  },

  // ✅ NUEVO: Obtener datos completos de una EPS específica
  async getEPSReporteData(epsId: string, filters: DashboardFilters = { tipoAnalisis: 'ambos' }): Promise<EPSReporteData> {
    try {
      console.log(`📊 Obteniendo datos de reporte para EPS: ${epsId}`);
      
      // Datos base de la EPS
      const epsData = MOCK_EPS_DATA.find(eps => eps.id === epsId);
      if (!epsData) {
        throw new Error('EPS no encontrada');
      }

      // En producción, estas serían llamadas reales a la API
      const [carteraData, flujoData, adresData] = await Promise.all([
        this.getCarteraTrazabilidad({ epsIds: [epsId], ...filters }),
        this.getAnalisisFlujo({ epsIds: [epsId], ...filters }),
        this.getEPSAdresInfo(epsId)
      ]);

      // Generar datos completos del reporte
      const reporteData: EPSReporteData = {
        id: epsData.id,
        nombre: epsData.nombre,
        valorTotalUPC: epsData.valorUPC,
        incrementoPromedio: epsData.incrementoPromedio,
        tiposContrato: TIPOS_CONTRATO.slice(0, Math.floor(Math.random() * 3) + 2), // 2-4 tipos
        valorFacturado: epsData.valorFacturado,
        reconocido: epsData.reconocido,
        pagado: epsData.pagado,
        saldoAdeudado: epsData.valorFacturado - epsData.pagado,
        cumplimientoPagos: epsData.cumplimiento,
        participacionMercado: epsData.participacion,
        tendenciaMensual: generarTendenciaMensual(epsData.valorFacturado / 12),
        detalleContratos: generarDetalleContratos()
      };

      console.log(`✅ Datos de reporte generados para ${epsData.nombre}`);
      return reporteData;

    } catch (error) {
      console.error(`❌ Error obteniendo datos de EPS ${epsId}:`, error);
      throw error;
    }
  },

  // ✅ NUEVO: Comparar múltiples EPS
  async compararEPS(epsIds: string[], filters: DashboardFilters = { tipoAnalisis: 'ambos' }): Promise<ComparacionEPS> {
    try {
      console.log(`📊 Comparando ${epsIds.length} EPS:`, epsIds);
      
      // Obtener datos de cada EPS
      const promesasEPS = epsIds.map(epsId => this.getEPSReporteData(epsId, filters));
      const datosEPS = await Promise.all(promesasEPS);

      // Calcular métricas agregadas
      const totalUPC = datosEPS.reduce((sum, eps) => sum + eps.valorTotalUPC, 0);
      const totalFacturado = datosEPS.reduce((sum, eps) => sum + eps.valorFacturado, 0);
      const promedioIncremento = datosEPS.reduce((sum, eps) => sum + eps.incrementoPromedio, 0) / datosEPS.length;
      const promedioCumplimiento = datosEPS.reduce((sum, eps) => sum + eps.cumplimientoPagos, 0) / datosEPS.length;

      // Calcular rankings
      const mayorUPC = datosEPS.reduce((max, eps) => eps.valorTotalUPC > max.valorTotalUPC ? eps : max);
      const menorIncremento = datosEPS.reduce((min, eps) => eps.incrementoPromedio < min.incrementoPromedio ? eps : min);
      const mayorCumplimiento = datosEPS.reduce((max, eps) => eps.cumplimientoPagos > max.cumplimientoPagos ? eps : max);
      const mayorParticipacion = datosEPS.reduce((max, eps) => eps.participacionMercado > max.participacionMercado ? eps : max);

      const comparacion: ComparacionEPS = {
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
      };

      console.log(`✅ Comparación completada para ${epsIds.length} EPS`);
      return comparacion;

    } catch (error) {
      console.error('❌ Error en comparación de EPS:', error);
      throw error;
    }
  },

  // ✅ MEJORADO: Obtener información de ADRES para una EPS específica
  async getEPSAdresInfo(epsId: string): Promise<any[]> {
    try {
      console.log(`📋 Obteniendo información ADRES para EPS: ${epsId}`);
      
      // En desarrollo, usar datos mock realistas
      const epsData = MOCK_EPS_DATA.find(eps => eps.id === epsId);
      if (!epsData) return [];

      // Simular datos de ADRES mensuales
      const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio'];
      return meses.map((mes, index) => ({
        periodo: `${mes} 2024`,
        upc: epsData.valorUPC / 12, // UPC mensual
        upc92: (epsData.valorUPC / 12) * 0.92,
        upc60: (epsData.valorUPC / 12) * 0.60,
        valorGirado: (epsData.valorUPC / 12) * (0.95 + Math.random() * 0.05), // 95-100% del UPC
        pagos: epsData.pagado / 12, // Pago mensual promedio
        cumplimientoPagos: epsData.cumplimiento + (Math.random() - 0.5) * 10 // Variación ±5%
      }));

    } catch (error) {
      console.error(`❌ Error obteniendo ADRES para EPS ${epsId}:`, error);
      return [];
    }
  },

  // ✅ NUEVO: Obtener tipos de contrato disponibles
  async getTiposContrato(): Promise<string[]> {
    return TIPOS_CONTRATO;
  },

  // ✅ MEJORADO: Filtrar EPS por criterios específicos
  async filtrarEPS(filtros: {
    valorUPCMin?: number;
    valorUPCMax?: number;
    incrementoMin?: number;
    incrementoMax?: number;
    cumplimientoMin?: number;
    cumplimientoMax?: number;
    tiposContrato?: string[];
  }): Promise<any[]> {
    try {
      console.log('🔍 Filtrando EPS con criterios:', filtros);
      
      const todasLasEPS = await this.getEPSList();
      
      return todasLasEPS.filter(eps => {
        // Filtro por valor UPC
        if (filtros.valorUPCMin !== undefined && eps.valorUPC < filtros.valorUPCMin) return false;
        if (filtros.valorUPCMax !== undefined && eps.valorUPC > filtros.valorUPCMax) return false;
        
        // Filtro por incremento
        if (filtros.incrementoMin !== undefined && eps.incrementoPromedio < filtros.incrementoMin) return false;
        if (filtros.incrementoMax !== undefined && eps.incrementoPromedio > filtros.incrementoMax) return false;
        
        // Filtro por cumplimiento
        if (filtros.cumplimientoMin !== undefined && eps.cumplimiento < filtros.cumplimientoMin) return false;
        if (filtros.cumplimientoMax !== undefined && eps.cumplimiento > filtros.cumplimientoMax) return false;
        
        return true;
      });

    } catch (error) {
      console.error('❌ Error filtrando EPS:', error);
      return [];
    }
  },

  // ✅ MÉTODOS EXISTENTES MEJORADOS
  async getCarteraTrazabilidad(filters: DashboardFilters): Promise<any> {
    try {
      console.log('📊 Obteniendo trazabilidad de cartera:', filters);
      
      // Si hay EPS específicas seleccionadas, filtrar por ellas
      if (filters.epsIds && filters.epsIds.length > 0) {
        // En producción, usar la API real con filtros
        // const response = await carteraAPI.getCarteraConTrazabilidad(filters);
        
        // Por ahora, simular datos filtrados
        const datosMock = filters.epsIds.map(epsId => {
          const eps = MOCK_EPS_DATA.find(e => e.id === epsId);
          if (!eps) return null;
          
          return {
            epsId: eps.id,
            epsNombre: eps.nombre,
            ipsId: `ips_${epsId}_1`,
            ipsNombre: `IPS Principal ${eps.nombre}`,
            valorActual: eps.valorFacturado / 10, // Simular valor por IPS
            valorAnterior: eps.valorFacturado / 10 * 0.95,
            variacion: eps.valorFacturado / 10 * 0.05,
            variacionPorcentual: 5.0
          };
        }).filter(Boolean);
        
        return datosMock;
      }
      
      return [];
    } catch (error) {
      console.error('❌ Error en getCarteraTrazabilidad:', error);
      return [];
    }
  },

  async getTendenciasYProyecciones(filters: DashboardFilters): Promise<any> {
    try {
      console.log('📈 Obteniendo tendencias y proyecciones:', filters);
      
      // Simular evolución de cartera
      const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
      const carteraEvolucion = meses.map((mes, index) => {
        const baseValue = 80000 + (index * 2000) + (Math.random() - 0.5) * 5000;
        return {
          periodo: `${mes} 2024`,
          carteraTotal: Math.round(baseValue),
          variacionMensual: (Math.random() - 0.5) * 10, // ±5%
          cantidadEPS: 24 + Math.floor(Math.random() * 3), // 24-26 EPS
          cantidadIPS: 180 + Math.floor(Math.random() * 20) // 180-200 IPS
        };
      });

      // Simular proyecciones futuras
      const proyecciones = ['Ene 2025', 'Feb 2025', 'Mar 2025'].map(periodo => ({
        periodo,
        carteraProyectada: 85000 + Math.random() * 10000,
        confianza: 70 + Math.random() * 25 // 70-95% confianza
      }));

      return {
        carteraEvolucion,
        proyecciones,
        alertas: [
          {
            tipo: 'tendencia_creciente',
            mensaje: 'La cartera muestra tendencia creciente del 2.5% mensual',
            severidad: 'media',
            valor: 2.5
          }
        ]
      };
    } catch (error) {
      console.error('❌ Error en getTendenciasYProyecciones:', error);
      return null;
    }
  },

  async getMetricasComparativas(filters: DashboardFilters): Promise<any> {
    try {
      console.log('📊 Obteniendo métricas comparativas:', filters);
      
      const epsSeleccionadas = filters.epsIds && filters.epsIds.length > 0 
        ? MOCK_EPS_DATA.filter(eps => filters.epsIds!.includes(eps.id))
        : MOCK_EPS_DATA;

      const totalCartera = epsSeleccionadas.reduce((sum, eps) => sum + eps.valorFacturado, 0);
      const totalUPC = epsSeleccionadas.reduce((sum, eps) => sum + eps.valorUPC, 0);

      return {
        eps: {
          total: epsSeleccionadas.length,
          activas: epsSeleccionadas.filter(eps => eps.activa).length,
          carteraTotal: totalCartera,
          carteraPromedio: totalCartera / epsSeleccionadas.length
        },
        ips: {
          total: epsSeleccionadas.length * 15, // Aproximadamente 15 IPS por EPS
          activas: epsSeleccionadas.length * 14,
          carteraTotal: totalCartera,
          carteraPromedio: totalCartera / (epsSeleccionadas.length * 15)
        },
        relaciones: {
          relacionesUnicas: epsSeleccionadas.length * 15,
          concentracionRiesgo: {
            top3Concentracion: 65.5, // % concentrado en top 3
            distribucioEquitativa: 34.5
          }
        }
      };
    } catch (error) {
      console.error('❌ Error en getMetricasComparativas:', error);
      return null;
    }
  },

  async getAnalisisFlujo(filters: DashboardFilters): Promise<any> {
    try {
      console.log('💰 Obteniendo análisis de flujo:', filters);
      
      const epsSeleccionadas = filters.epsIds && filters.epsIds.length > 0 
        ? MOCK_EPS_DATA.filter(eps => filters.epsIds!.includes(eps.id))
        : MOCK_EPS_DATA;

      const totalFacturado = epsSeleccionadas.reduce((sum, eps) => sum + eps.valorFacturado, 0);
      const totalReconocido = epsSeleccionadas.reduce((sum, eps) => sum + eps.reconocido, 0);
      const totalPagado = epsSeleccionadas.reduce((sum, eps) => sum + eps.pagado, 0);
      const cumplimientoPromedio = epsSeleccionadas.reduce((sum, eps) => sum + eps.cumplimiento, 0) / epsSeleccionadas.length;

      return {
        totalFacturado,
        totalReconocido,
        totalPagado,
        cumplimientoPromedio,
        incrementoPromedio: epsSeleccionadas.reduce((sum, eps) => sum + eps.incrementoPromedio, 0) / epsSeleccionadas.length,
        tiposContrato: TIPOS_CONTRATO,
        distribuccionPorEPS: epsSeleccionadas.map(eps => ({
          nombre: eps.nombre,
          valorFacturado: eps.valorFacturado,
          valorReconocido: eps.reconocido,
          porcentajeCumplimiento: eps.cumplimiento,
          porcentaje: (eps.valorFacturado / totalFacturado) * 100
        })),
        tendenciaMensual: generarTendenciaMensual(totalFacturado / 12).map(item => ({
          mes: item.mes,
          cumplimiento: item.cumplimiento,
          meta: 92,
          facturado: item.facturado,
          reconocido: item.facturado * 0.92,
          pagado: item.pagado
        }))
      };
    } catch (error) {
      console.error('❌ Error en getAnalisisFlujo:', error);
      return null;
    }
  },

  async getTopEntidades(tipo: 'eps' | 'ips', limit: number = 10, filters: DashboardFilters = { tipoAnalisis: 'ambos' }): Promise<any> {
    try {
      console.log(`🏆 Obteniendo top ${limit} ${tipo.toUpperCase()}:`, filters);
      
      if (tipo === 'eps') {
        const epsOrdenadas = [...MOCK_EPS_DATA]
          .sort((a, b) => b.valorFacturado - a.valorFacturado)
          .slice(0, limit)
          .map((eps, index) => ({
            posicion: index + 1,
            id: eps.id,
            nombre: eps.nombre,
            valor: eps.valorFacturado,
            cumplimiento: eps.cumplimiento,
            participacion: eps.participacion,
            tendencia: Math.random() > 0.5 ? 'up' : 'down'
          }));
        
        return epsOrdenadas;
      } else {
        // Simular datos de IPS
        const ipsMock = Array.from({ length: limit }, (_, index) => ({
          posicion: index + 1,
          id: `ips_${index + 1}`,
          nombre: `IPS ${['Central', 'Norte', 'Sur', 'Oriente', 'Occidente', 'Metropolitana', 'Regional', 'Especializada'][index % 8]} ${index + 1}`,
          valor: Math.floor(Math.random() * 5000000000) + 1000000000, // 1-6 mil millones
          cumplimiento: 70 + Math.random() * 25, // 70-95%
          epsAsociada: MOCK_EPS_DATA[index % MOCK_EPS_DATA.length].nombre,
          tendencia: Math.random() > 0.5 ? 'up' : 'down'
        }));
        
        return ipsMock.sort((a, b) => b.valor - a.valor);
      }
    } catch (error) {
      console.error(`❌ Error obteniendo top ${tipo}:`, error);
      return [];
    }
  },

  // ✅ NUEVO: Generar reporte ejecutivo completo para una EPS
  async generarReporteEjecutivoEPS(epsId: string, filters: DashboardFilters = { tipoAnalisis: 'ambos' }): Promise<any> {
    try {
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
      type Riesgo = {
        tipo: string;
        nivel: string;
        descripcion: string;
        recomendacion: string;
      };
      const riesgos: Riesgo[] = [];
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
      type Oportunidad = {
        tipo: string;
        descripcion: string;
        accion: string;
      };
      const oportunidades: Oportunidad[] = [];
      if (datosEPS.cumplimientoPagos > 95) {
        oportunidades.push({
          tipo: 'cumplimiento_excelente',
          descripcion: 'Excelente cumplimiento de pagos, referente para otras EPS',
          accion: 'Documentar mejores prácticas para replicar'
        });
      }

      return {
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
        periodo: filters.periodoIds || ['2024']
      };

    } catch (error) {
      console.error(`❌ Error generando reporte ejecutivo para EPS ${epsId}:`, error);
      throw error;
    }
  },

  // ✅ NUEVO: Exportar datos de comparación a Excel
  async exportarComparacionEPS(epsIds: string[], formato: 'excel' | 'pdf' = 'excel'): Promise<Blob> {
    try {
      console.log(`📤 Exportando comparación de ${epsIds.length} EPS en formato ${formato}`);
      
      const comparacion = await this.compararEPS(epsIds);
      
      if (formato === 'excel') {
        // Simular generación de Excel
        const datosExcel = comparacion.eps.map(eps => ({
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
        
        // En producción, usar una librería como xlsx para generar el archivo real
        const csvContent = [
          Object.keys(datosExcel[0]).join(','),
          ...datosExcel.map(row => Object.values(row).join(','))
        ].join('\n');
        
        return new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      } else {
        // Para PDF, devolver blob simulado
        return new Blob(['PDF Content Simulado'], { type: 'application/pdf' });
      }

    } catch (error) {
      console.error('❌ Error exportando comparación:', error);
      throw error;
    }
  }
};

// ✅ Exportar como default
export default dashboardsEpsIpsAPI;