// backend/src/modules/dashboards-eps-ips/dto/metricas-comparativas-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class MetricasEntidadDto {
  @ApiProperty({ description: 'Total de entidades registradas', example: 25 })
  total: number;

  @ApiProperty({ description: 'Entidades activas', example: 23 })
  activas: number;

  @ApiProperty({ description: 'Cartera total de la entidad', example: 1200000000 })
  carteraTotal: number;

  @ApiProperty({ description: 'Cartera promedio por entidad', example: 52173913 })
  carteraPromedio: number;
}

export class RelacionesDataDto {
  @ApiProperty({ description: 'Relaciones únicas EPS-IPS', example: 3847 })
  relacionesUnicas: number;

  @ApiProperty({ description: 'Análisis de concentración de riesgo', type: Object })
  concentracionRiesgo: {
    top3Concentracion: number;
    distribucioEquitativa: number;
  };
}

export class MetricasComparativasDataDto {
  @ApiProperty({ description: 'Métricas de EPS', type: MetricasEntidadDto })
  eps: MetricasEntidadDto;

  @ApiProperty({ description: 'Métricas de IPS', type: MetricasEntidadDto })
  ips: MetricasEntidadDto;

  @ApiProperty({ description: 'Datos de relaciones', type: RelacionesDataDto })
  relaciones: RelacionesDataDto;
}

export class MetricasComparativasResponseDto {
  @ApiProperty({ description: 'Indica si la operación fue exitosa', example: true })
  success: boolean;

  @ApiProperty({ description: 'Datos de métricas comparativas', type: MetricasComparativasDataDto })
  data: MetricasComparativasDataDto;

  @ApiProperty({ description: 'Mensaje descriptivo', example: 'Métricas comparativas calculadas exitosamente' })
  message?: string;
}