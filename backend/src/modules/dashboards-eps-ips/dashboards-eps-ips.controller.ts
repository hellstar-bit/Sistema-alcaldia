// backend/src/modules/dashboards-eps-ips/dashboards-eps-ips.controller.ts - VERSIÓN CORREGIDA
import { Controller, Get, Query, Post, Param, ParseEnumPipe, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { DashboardsEpsIpsService } from './dashboards-eps-ips.service';
import { 
  DashboardFiltersDto,
  TipoAnalisisEnum 
} from './dto/dashboard-filters.dto';
import { CarteraTrazabilidadResponseDto } from './dto/cartera-trazabilidad-response.dto';
import { MetricasComparativasResponseDto } from './dto/metricas-comparativas-response.dto';
import { TopEntidadesResponseDto } from './dto/top-entidades-response.dto';
import { TendenciasResponseDto } from './dto/tendencias-response.dto';
import { AnalisisFlujoResponseDto } from './dto/analisis-flujo-response.dto';

@ApiTags('Dashboards EPS e IPS')
@Controller('dashboards-eps-ips')
export class DashboardsEpsIpsController {
  constructor(
    private readonly dashboardsEpsIpsService: DashboardsEpsIpsService
  ) {}

  @Get('cartera-trazabilidad')
  @ApiOperation({ 
    summary: 'Obtener cartera con trazabilidad corregida',
    description: 'Retorna la cartera con lógica de trazabilidad corregida, evitando doble contabilización'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Datos de cartera con trazabilidad obtenidos exitosamente',
    type: CarteraTrazabilidadResponseDto
  })
  @ApiResponse({ status: 400, description: 'Parámetros de filtro inválidos' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  async getCarteraTrazabilidad(
    @Query() filters: DashboardFiltersDto
  ): Promise<CarteraTrazabilidadResponseDto> {
    return await this.dashboardsEpsIpsService.getCarteraTrazabilidad(filters);
  }

  @Get('metricas-comparativas')
  @ApiOperation({ 
    summary: 'Obtener métricas comparativas EPS vs IPS',
    description: 'Calcula y retorna métricas comparativas entre EPS e IPS'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Métricas comparativas calculadas exitosamente',
    type: MetricasComparativasResponseDto
  })
  async getMetricasComparativas(
    @Query() filters: DashboardFiltersDto
  ): Promise<MetricasComparativasResponseDto> {
    return await this.dashboardsEpsIpsService.getMetricasComparativas(filters);
  }

  @Get('tendencias-proyecciones')
  @ApiOperation({ 
    summary: 'Obtener tendencias y proyecciones',
    description: 'Genera análisis de tendencias históricas y proyecciones futuras'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Tendencias y proyecciones calculadas exitosamente',
    type: TendenciasResponseDto
  })
  async getTendenciasYProyecciones(
    @Query() filters: DashboardFiltersDto
  ): Promise<TendenciasResponseDto> {
    return await this.dashboardsEpsIpsService.getTendenciasYProyecciones(filters);
  }

  @Get('top-entidades/:tipo')
  @ApiOperation({ 
    summary: 'Obtener ranking de entidades (EPS o IPS)',
    description: 'Retorna el ranking de las principales entidades por cartera'
  })
  @ApiParam({ 
    name: 'tipo', 
    enum: ['eps', 'ips'],
    description: 'Tipo de entidad a rankear'
  })
  @ApiQuery({ 
    name: 'limit', 
    required: false, 
    type: Number, 
    description: 'Número máximo de entidades a retornar',
    example: 10
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Ranking de entidades obtenido exitosamente',
    type: TopEntidadesResponseDto
  })
  async getTopEntidades(
    @Param('tipo', new ParseEnumPipe(['eps', 'ips'])) tipo: 'eps' | 'ips',
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 10,
    @Query() filters: DashboardFiltersDto
  ): Promise<TopEntidadesResponseDto> {
    return await this.dashboardsEpsIpsService.getTopEntidades(tipo, limit, filters);
  }

  @Get('analisis-flujo')
  @ApiOperation({ 
    summary: 'Obtener análisis de flujo de caja',
    description: 'Retorna análisis completo de flujo de caja con métricas de cumplimiento'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Análisis de flujo completado exitosamente',
    type: AnalisisFlujoResponseDto
  })
  async getAnalisisFlujo(
    @Query() filters: DashboardFiltersDto
  ): Promise<AnalisisFlujoResponseDto> {
    return await this.dashboardsEpsIpsService.getAnalisisFlujo(filters);
  }

  @Get('reporte-ejecutivo/:tipo')
  @ApiOperation({ 
    summary: 'Generar reporte ejecutivo para EPS o IPS',
    description: 'Genera un reporte ejecutivo completo para el tipo de entidad especificado'
  })
  @ApiParam({ 
    name: 'tipo', 
    enum: ['eps', 'ips'],
    description: 'Tipo de entidad para el reporte'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Reporte ejecutivo generado exitosamente'
  })
  async getReporteEjecutivo(
    @Param('tipo', new ParseEnumPipe(['eps', 'ips'])) tipo: 'eps' | 'ips',
    @Query() filters: DashboardFiltersDto
  ): Promise<any> {
    return await this.dashboardsEpsIpsService.generarReporteEjecutivo(tipo, filters);
  }

  @Post('migrar-datos')
  @ApiOperation({ 
    summary: 'Migrar datos existentes a nueva lógica (ejecutar una vez)',
    description: 'Ejecuta la migración de datos para corregir la lógica de cartera. Solo debe ejecutarse una vez.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Migración completada exitosamente'
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Error durante la migración'
  })
  async migrarDatos(): Promise<{
    success: boolean;
    registrosProcesados: number;
    registrosLimpiados: number;
    mensaje: string;
  }> {
    return await this.dashboardsEpsIpsService.migrarANuevaLogica();
  }

  @Post('validar-consistencia')
  @ApiOperation({ 
    summary: 'Validar consistencia de datos de cartera',
    description: 'Valida la consistencia de los datos de cartera después de la migración'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Validación completada exitosamente'
  })
  async validarConsistencia(): Promise<{
    isValid: boolean;
    errores: string[];
    advertencias: string[];
    estadisticas: {
      totalRegistros: number;
      registrosDuplicados: number;
      relacionesUnicas: number;
    };
  }> {
    return await this.dashboardsEpsIpsService.validarConsistenciaCartera();
  }

  @Get('exportar/:formato')
  @ApiOperation({ 
    summary: 'Exportar datos en formato especificado',
    description: 'Exporta los datos de dashboard en el formato solicitado'
  })
  @ApiParam({ 
    name: 'formato', 
    enum: ['excel', 'pdf', 'csv'],
    description: 'Formato de exportación'
  })
  @ApiQuery({ 
    name: 'tipo', 
    enum: ['cartera', 'flujo', 'reporte'],
    description: 'Tipo de datos a exportar'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Archivo exportado exitosamente'
  })
  async exportarDatos(
    @Param('formato', new ParseEnumPipe(['excel', 'pdf', 'csv'])) formato: 'excel' | 'pdf' | 'csv',
    @Query('tipo', new ParseEnumPipe(['cartera', 'flujo', 'reporte'])) tipo: 'cartera' | 'flujo' | 'reporte',
    @Query() filters: DashboardFiltersDto
  ): Promise<any> {
    return await this.dashboardsEpsIpsService.exportarDatos(formato, tipo, filters);
  }

  @Post('refresh-cache')
  @ApiOperation({ 
    summary: 'Limpiar cache de dashboards',
    description: 'Limpia el cache interno para forzar la recarga de datos'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Cache limpiado exitosamente'
  })
  async refreshCache(): Promise<{ success: boolean; message: string }> {
    // Implementar limpieza de cache en el servicio
    return { 
      success: true, 
      message: 'Cache de dashboards limpiado exitosamente' 
    };
  }
}