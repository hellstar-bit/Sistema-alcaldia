// backend/src/modules/dashboards-eps-ips/dashboards-eps-ips.service.ts - VERSIÓN CORREGIDA
import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CarteraService } from '../cartera/cartera.service';
import { FlujoService } from '../flujo/flujo.service';
import { EPS } from '../cartera/entities/eps.entity';
import { IPS } from '../cartera/entities/ips.entity';
import { Periodo } from '../cartera/entities/periodo.entity';

// Importar DTOs creados
import { DashboardFiltersDto } from './dto/dashboard-filters.dto';
import { 
  CarteraTrazabilidadResponseDto,
  CarteraResumenResponseDto,
  TrazabilidadItemDto 
} from './dto/cartera-trazabilidad-response.dto';
import { 
  MetricasComparativasResponseDto,
  MetricasComparativasDataDto,
  MetricasEntidadDto,
  RelacionesDataDto 
} from './dto/metricas-comparativas-response.dto';
import { 
  TopEntidadesResponseDto,
  TopEntidadItemDto 
} from './dto/top-entidades-response.dto';
import { 
  TendenciasResponseDto,
  TendenciasDataDto,
  TendenciaEvolucionDto,
  ProyeccionDto,
  AlertaDto 
} from './dto/tendencias-response.dto';
import { 
  AnalisisFlujoResponseDto,
  AnalisisFlujoDataDto,
  DistribucionFlujoDto 
} from './dto/analisis-flujo-response.dto';

// Interfaces internas para trabajar con datos
interface CarteraConTrazabilidadData {
  data: any[];
  resumen: any;
  trazabilidad: any[];
}

interface ResumenPeriodoData {
  periodo: string;
  totalCartera: number;
  totalEPS: number;
  totalIPS: number;
  variacionAnterior: number;
}

@Injectable()
export class DashboardsEpsIpsService {
  constructor(
    @InjectRepository(EPS)
    private epsRepository: Repository<EPS>,
    @InjectRepository(IPS)
    private ipsRepository: Repository<IPS>,
    @InjectRepository(Periodo)
    private periodoRepository: Repository<Periodo>,
    private carteraService: CarteraService,
    private flujoService: FlujoService,
  ) {}

  // ===============================================
  // MÉTODOS PRINCIPALES CON LÓGICA CORREGIDA
  // ===============================================
  async getCarteraTrazabilidad(filters: DashboardFiltersDto): Promise<CarteraTrazabilidadResponseDto> {
    console.log('📊 DashboardsEpsIpsService: getCarteraTrazabilidad');
    
    try {
      // Usar el método corregido del CarteraService
      const resultado: CarteraConTrazabilidadData = await this.carteraService.getCarteraConTrazabilidad({
        epsId: filters.epsIds?.[0],
        ipsId: filters.ipsIds?.[0],
        periodoId: filters.periodoIds?.[0],
        incluirHistorico: filters.incluirHistorico || false,
        page: filters.page || 1,
        limit: filters.limit || 50
      });

      // Mapear a nuestros DTOs
      const resumen: CarteraResumenResponseDto = {
        totalCartera: resultado.resumen?.totalCartera || 0,
        totalEPS: resultado.resumen?.totalEPS || 0,
        totalIPS: resultado.resumen?.totalIPS || 0,
        totalRegistros: resultado.resumen?.totalRegistros || 0,
        variacionPeriodoAnterior: resultado.resumen?.variacionPeriodoAnterior,
        variacionPorcentual: resultado.resumen?.variacionPorcentual
      };

      const trazabilidad: TrazabilidadItemDto[] = resultado.trazabilidad?.map((item: any) => ({
        epsId: item.epsId,
        ipsId: item.ipsId,
        valorActual: item.valorActual || 0,
        valorAnterior: item.valorAnterior,
        variacion: item.variacion,
        variacionPorcentual: item.variacionPorcentual,
        historicoCompleto: item.historicoCompleto
      })) || [];

      const response: CarteraTrazabilidadResponseDto = {
        success: true,
        data: resultado.data || [],
        resumen,
        trazabilidad,
        message: `Cartera con trazabilidad obtenida correctamente. ${resultado.data?.length || 0} registros únicos.`
      };

      return response;

    } catch (error) {
      console.error('❌ Error en getCarteraTrazabilidad:', error);
      throw new BadRequestException(`Error al obtener cartera con trazabilidad: ${error.message}`);
    }
  }

  async getMetricasComparativas(filters: DashboardFiltersDto): Promise<MetricasComparativasResponseDto> {
    console.log('📊 DashboardsEpsIpsService: getMetricasComparativas');

    try {
      // Obtener datos corregidos de cartera
      const { trazabilidad }: CarteraConTrazabilidadData = await this.carteraService.getCarteraConTrazabilidad({
        incluirHistorico: false
      });

      // Calcular métricas por EPS
      const epsMetricas = new Map<string, { cartera: number; cantidadIPS: number }>();
      const ipsMetricas = new Map<string, { cartera: number; cantidadEPS: number }>();

      trazabilidad.forEach((item: any) => {
        // Métricas EPS
        if (!epsMetricas.has(item.epsId)) {
          epsMetricas.set(item.epsId, { cartera: 0, cantidadIPS: 0 });
        }
        const epsMetrica = epsMetricas.get(item.epsId)!;
        epsMetrica.cartera += item.valorActual || 0;
        epsMetrica.cantidadIPS += 1;

        // Métricas IPS
        if (!ipsMetricas.has(item.ipsId)) {
          ipsMetricas.set(item.ipsId, { cartera: 0, cantidadEPS: 0 });
        }
        const ipsMetrica = ipsMetricas.get(item.ipsId)!;
        ipsMetrica.cartera += item.valorActual || 0;
        ipsMetrica.cantidadEPS += 1;
      });

      const eps = await this.epsRepository.find({ where: { activa: true } });
      const ips = await this.ipsRepository.find({ where: { activa: true } });

      const carteraTotalEPS = Array.from(epsMetricas.values()).reduce((sum, m) => sum + m.cartera, 0);
      const carteraTotalIPS = Array.from(ipsMetricas.values()).reduce((sum, m) => sum + m.cartera, 0);

      const epsData: MetricasEntidadDto = {
        total: eps.length,
        activas: eps.length,
        carteraTotal: carteraTotalEPS,
        carteraPromedio: carteraTotalEPS / (eps.length || 1)
      };

      const ipsData: MetricasEntidadDto = {
        total: ips.length,
        activas: ips.length,
        carteraTotal: carteraTotalIPS,
        carteraPromedio: carteraTotalIPS / (ips.length || 1)
      };

      const relacionesData: RelacionesDataDto = {
        relacionesUnicas: trazabilidad.length,
        concentracionRiesgo: this.calcularConcentracionRiesgo(trazabilidad)
      };

      const dataResponse: MetricasComparativasDataDto = {
        eps: epsData,
        ips: ipsData,
        relaciones: relacionesData
      };

      const response: MetricasComparativasResponseDto = {
        success: true,
        data: dataResponse,
        message: 'Métricas comparativas calculadas exitosamente'
      };

      return response;

    } catch (error) {
      console.error('❌ Error en getMetricasComparativas:', error);
      throw new BadRequestException(`Error al calcular métricas comparativas: ${error.message}`);
    }
  }

  async getTendenciasYProyecciones(filters: DashboardFiltersDto): Promise<TendenciasResponseDto> {
    console.log('📊 DashboardsEpsIpsService: getTendenciasYProyecciones');

    try {
      // Obtener resumen por períodos usando lógica corregida
      const resumenPorPeriodo: ResumenPeriodoData[] = await this.carteraService.getResumenPorPeriodo();

      // Calcular tendencias
      const tendencias: TendenciaEvolucionDto[] = resumenPorPeriodo.map((periodo) => ({
        periodo: periodo.periodo,
        carteraTotal: periodo.totalCartera,
        variacionMensual: periodo.variacionAnterior,
        cantidadEPS: periodo.totalEPS,
        cantidadIPS: periodo.totalIPS
      }));

      // Generar proyecciones simples
      const proyecciones: ProyeccionDto[] = this.calcularProyecciones(tendencias);

      // Generar alertas basadas en tendencias
      const alertas: AlertaDto[] = this.generarAlertas(tendencias);

      const dataResponse: TendenciasDataDto = {
        carteraEvolucion: tendencias,
        proyecciones,
        alertas
      };

      const response: TendenciasResponseDto = {
        success: true,
        data: dataResponse,
        message: 'Tendencias y proyecciones calculadas exitosamente'
      };

      return response;

    } catch (error) {
      console.error('❌ Error en getTendenciasYProyecciones:', error);
      throw new BadRequestException(`Error al calcular tendencias: ${error.message}`);
    }
  }

  async getTopEntidades(tipo: 'eps' | 'ips', limit: number = 10, filters: DashboardFiltersDto): Promise<TopEntidadesResponseDto> {
    console.log(`📊 DashboardsEpsIpsService: getTopEntidades - ${tipo}`);

    try {
      // Usar método corregido del CarteraService
      const topEntidades: any[] = await this.carteraService.getTopEntidades(tipo, limit);

      const data: TopEntidadItemDto[] = topEntidades.map((entidad: any) => ({
        id: entidad.id,
        nombre: entidad.nombre,
        carteraTotal: entidad.carteraTotal,
        cantidadRelaciones: entidad.cantidadRelaciones,
        porcentajeTotal: entidad.porcentajeTotal
      }));

      const response: TopEntidadesResponseDto = {
        success: true,
        data,
        message: `Top ${limit} ${tipo.toUpperCase()} obtenido correctamente`
      };

      return response;

    } catch (error) {
      console.error(`❌ Error en getTopEntidades ${tipo}:`, error);
      throw new BadRequestException(`Error al obtener top ${tipo}: ${error.message}`);
    }
  }

  async getAnalisisFlujo(filters: DashboardFiltersDto): Promise<AnalisisFlujoResponseDto> {
    console.log('📊 DashboardsEpsIpsService: getAnalisisFlujo');

    try {
      // Obtener datos de flujo
      const flujoData = await this.flujoService.getFlujoIpsData({
        epsId: filters.epsIds?.[0],
        periodoId: filters.periodoIds?.[0],
        page: 1,
        limit: 10000
      });

      // Procesar datos para análisis
      const totalFacturado = flujoData.data?.reduce((sum: number, item: any) => sum + (item.valorFacturado || 0), 0) || 0;
      const totalReconocido = flujoData.data?.reduce((sum: number, item: any) => sum + (item.reconocido || 0), 0) || 0;
      const totalPagado = flujoData.data?.reduce((sum: number, item: any) => sum + (item.valorPagado || 0), 0) || 0;

      const cumplimientoPromedio = totalReconocido > 0 ? (totalPagado / totalReconocido) * 100 : 0;

      // Calcular distribuciones
      const distribuccionPorEPS: DistribucionFlujoDto[] = this.calcularDistribucionFlujo(flujoData.data || [], 'eps');
      const distribuccionPorIPS: DistribucionFlujoDto[] = this.calcularDistribucionFlujo(flujoData.data || [], 'ips');

      const dataResponse: AnalisisFlujoDataDto = {
        totalFacturado,
        totalReconocido,
        totalPagado,
        cumplimientoPromedio,
        distribuccionPorEPS,
        distribuccionPorIPS
      };

      const response: AnalisisFlujoResponseDto = {
        success: true,
        data: dataResponse,
        message: 'Análisis de flujo completado exitosamente'
      };

      return response;

    } catch (error) {
      console.error('❌ Error en getAnalisisFlujo:', error);
      throw new BadRequestException(`Error al analizar flujo: ${error.message}`);
    }
  }

  // ===============================================
  // MÉTODOS AUXILIARES
  // ===============================================
  private calcularConcentracionRiesgo(trazabilidad: any[]): { top3Concentracion: number; distribucioEquitativa: number } {
    const epsCartera = new Map<string, number>();
    
    trazabilidad.forEach(item => {
      epsCartera.set(item.epsId, (epsCartera.get(item.epsId) || 0) + (item.valorActual || 0));
    });

    const total = Array.from(epsCartera.values()).reduce((sum, val) => sum + val, 0);
    const sorted = Array.from(epsCartera.entries()).sort((a, b) => b[1] - a[1]);

    return {
      top3Concentracion: total > 0 ? (sorted.slice(0, 3).reduce((sum, [_, val]) => sum + val, 0) / total * 100) : 0,
      distribucioEquitativa: epsCartera.size > 0 ? (total / epsCartera.size) : 0
    };
  }

  private calcularProyecciones(tendencias: TendenciaEvolucionDto[]): ProyeccionDto[] {
    if (tendencias.length < 3) return [];

    const ultimos3 = tendencias.slice(-3);
    const promedioVariacion = ultimos3.reduce((sum, t) => sum + (t.variacionMensual || 0), 0) / 3;
    const ultimoValor = tendencias[tendencias.length - 1]?.carteraTotal || 0;

    const proyecciones: ProyeccionDto[] = [];
    
    for (let i = 0; i < 3; i++) {
      proyecciones.push({
        periodo: `Proyección +${i + 1}`,
        carteraProyectada: ultimoValor * Math.pow(1 + promedioVariacion / 100, i + 1),
        confianza: Math.max(50, 90 - (i * 15))
      });
    }

    return proyecciones;
  }

  private generarAlertas(tendencias: TendenciaEvolucionDto[]): AlertaDto[] {
    const alertas: AlertaDto[] = [];

    tendencias.forEach(tendencia => {
      if ((tendencia.variacionMensual || 0) > 15) {
        alertas.push({
          tipo: 'crecimiento_acelerado',
          mensaje: `Crecimiento de cartera superior al 15% en ${tendencia.periodo}`,
          severidad: 'alta',
          entidad: 'Sistema',
          valor: tendencia.variacionMensual || 0
        });
      }

      if ((tendencia.variacionMensual || 0) < -10) {
        alertas.push({
          tipo: 'decrecimiento_significativo',
          mensaje: `Decrecimiento de cartera superior al 10% en ${tendencia.periodo}`,
          severidad: 'media',
          entidad: 'Sistema',
          valor: Math.abs(tendencia.variacionMensual || 0)
        });
      }
    });

    return alertas;
  }

  private calcularDistribucionFlujo(flujoData: any[], tipo: 'eps' | 'ips'): DistribucionFlujoDto[] {
    const agrupacion = new Map<string, number>();
    
    flujoData.forEach(item => {
      const entidad = tipo === 'eps' ? item.controlCarga?.eps : item.ips;
      if (entidad && entidad.nombre) {
        const nombre = entidad.nombre;
        agrupacion.set(nombre, (agrupacion.get(nombre) || 0) + (item.valorPagado || 0));
      }
    });

    const total = Array.from(agrupacion.values()).reduce((sum, val) => sum + val, 0);
    
    return Array.from(agrupacion.entries())
      .map(([nombre, valor]): DistribucionFlujoDto => ({
        nombre,
        valor,
        porcentaje: total > 0 ? (valor / total) * 100 : 0
      }))
      .sort((a, b) => b.valor - a.valor)
      .slice(0, 10);
  }

  // ===============================================
  // MÉTODOS ADICIONALES
  // ===============================================
  async generarReporteEjecutivo(tipo: 'eps' | 'ips', filters: DashboardFiltersDto): Promise<any> {
    console.log(`📊 Generando reporte ejecutivo para ${tipo}`);
    
    try {
      // Obtener datos necesarios para el reporte
      const [topEntidades, metricas, tendencias] = await Promise.all([
        this.getTopEntidades(tipo, 10, filters),
        this.getMetricasComparativas(filters),
        this.getTendenciasYProyecciones(filters)
      ]);

      return {
        success: true,
        data: {
          tipo,
          topEntidades: topEntidades.data,
          metricas: metricas.data[tipo],
          tendencias: tendencias.data.carteraEvolucion,
          alertas: tendencias.data.alertas.filter(a => a.severidad === 'alta'),
          generadoEn: new Date().toISOString()
        },
        message: `Reporte ejecutivo ${tipo.toUpperCase()} generado exitosamente`
      };
    } catch (error) {
      console.error(`❌ Error generando reporte ejecutivo ${tipo}:`, error);
      throw new BadRequestException(`Error al generar reporte ejecutivo: ${error.message}`);
    }
  }

  async migrarANuevaLogica(): Promise<{
    success: boolean;
    registrosProcesados: number;
    registrosLimpiados: number;
    mensaje: string;
  }> {
    try {
      console.log('🔄 Iniciando migración a nueva lógica...');
      
      // Usar método de migración del CarteraService
      const resultado = await this.carteraService.migrarANuevaLogica();
      
      return {
        success: resultado.success,
        registrosProcesados: resultado.registrosProcesados,
        registrosLimpiados: resultado.registrosLimpiados,
        mensaje: resultado.mensaje
      };
    } catch (error) {
      console.error('❌ Error en migración:', error);
      throw new BadRequestException(`Error en migración: ${error.message}`);
    }
  }

  async validarConsistenciaCartera(): Promise<{
    isValid: boolean;
    errores: string[];
    advertencias: string[];
    estadisticas: {
      totalRegistros: number;
      registrosDuplicados: number;
      relacionesUnicas: number;
    };
  }> {
    try {
      console.log('🔍 Validando consistencia de cartera...');
      
      // Usar método de validación del CarteraService
      const resultado = await this.carteraService.validarConsistenciaCartera();
      
      return {
        isValid: resultado.isValid,
        errores: resultado.errores,
        advertencias: resultado.advertencias,
        estadisticas: resultado.estadisticas
      };
    } catch (error) {
      console.error('❌ Error en validación:', error);
      throw new BadRequestException(`Error en validación: ${error.message}`);
    }
  }

  async exportarDatos(formato: 'excel' | 'pdf' | 'csv', tipo: 'cartera' | 'flujo' | 'reporte', filters: DashboardFiltersDto): Promise<any> {
    console.log(`📊 Exportando datos en formato ${formato} para tipo ${tipo}`);
    
    try {
      let datos: any;
      
      switch (tipo) {
        case 'cartera':
          datos = await this.getCarteraTrazabilidad(filters);
          break;
        case 'flujo':
          datos = await this.getAnalisisFlujo(filters);
          break;
        case 'reporte':
          datos = await this.generarReporteEjecutivo('eps', filters);
          break;
        default:
          throw new BadRequestException(`Tipo de exportación no válido: ${tipo}`);
      }
      
      return {
        success: true,
        formato,
        tipo,
        datos,
        message: `Datos exportados exitosamente en formato ${formato}`,
        exportadoEn: new Date().toISOString()
      };
    } catch (error) {
      console.error(`❌ Error exportando datos:`, error);
      throw new BadRequestException(`Error al exportar datos: ${error.message}`);
    }
  }
}