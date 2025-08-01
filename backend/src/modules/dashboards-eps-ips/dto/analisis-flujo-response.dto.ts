// backend/src/modules/dashboards-eps-ips/dto/analisis-flujo-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class DistribucionFlujoDto {
  @ApiProperty({ description: 'Nombre de la entidad', example: 'EPS Sura' })
  nombre: string;

  @ApiProperty({ description: 'Valor de flujo', example: 85000000 })
  valor: number;

  @ApiProperty({ description: 'Porcentaje del total', example: 15.3 })
  porcentaje: number;
}

export class AnalisisFlujoDataDto {
  @ApiProperty({ description: 'Total facturado', example: 800000000 })
  totalFacturado: number;

  @ApiProperty({ description: 'Total reconocido', example: 750000000 })
  totalReconocido: number;

  @ApiProperty({ description: 'Total pagado', example: 680000000 })
  totalPagado: number;

  @ApiProperty({ description: 'Cumplimiento promedio porcentual', example: 90.67 })
  cumplimientoPromedio: number;

  @ApiProperty({ description: 'Distribución por EPS', type: [DistribucionFlujoDto] })
  distribuccionPorEPS: DistribucionFlujoDto[];

  @ApiProperty({ description: 'Distribución por IPS', type: [DistribucionFlujoDto] })
  distribuccionPorIPS: DistribucionFlujoDto[];
}

export class AnalisisFlujoResponseDto {
  @ApiProperty({ description: 'Indica si la operación fue exitosa', example: true })
  success: boolean;

  @ApiProperty({ description: 'Datos de análisis de flujo', type: AnalisisFlujoDataDto })
  data: AnalisisFlujoDataDto;

  @ApiProperty({ description: 'Mensaje descriptivo', example: 'Análisis de flujo completado' })
  message?: string;
}
