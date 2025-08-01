// backend/src/modules/dashboards-eps-ips/dto/cartera-trazabilidad-response.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CarteraResumenResponseDto {
  @ApiProperty({ description: 'Cartera total calculada', example: 1500000000 })
  totalCartera: number;

  @ApiProperty({ description: 'Número total de EPS activas', example: 25 })
  totalEPS: number;

  @ApiProperty({ description: 'Número total de IPS con cartera', example: 150 })
  totalIPS: number;

  @ApiProperty({ description: 'Cantidad de registros únicos', example: 3750 })
  totalRegistros: number;

  @ApiPropertyOptional({ description: 'Variación vs período anterior', example: 5.2 })
  variacionPeriodoAnterior?: number;

  @ApiPropertyOptional({ description: 'Variación porcentual', example: 5.2 })
  variacionPorcentual?: number;
}

export class TrazabilidadItemDto {
  @ApiProperty({ description: 'ID de la EPS', example: 'eps-uuid-123' })
  epsId: string;

  @ApiProperty({ description: 'ID de la IPS', example: 'ips-uuid-456' })
  ipsId: string;

  @ApiProperty({ description: 'Valor actual de la cartera', example: 50000000 })
  valorActual: number;

  @ApiPropertyOptional({ description: 'Valor del período anterior', example: 47500000 })
  valorAnterior?: number;

  @ApiPropertyOptional({ description: 'Variación absoluta', example: 2500000 })
  variacion?: number;

  @ApiPropertyOptional({ description: 'Variación porcentual', example: 5.26 })
  variacionPorcentual?: number;

  @ApiPropertyOptional({ description: 'Histórico completo si se solicita', type: [Object] })
  historicoCompleto?: any[];
}

export class CarteraTrazabilidadResponseDto {
  @ApiProperty({ description: 'Indica si la operación fue exitosa', example: true })
  success: boolean;

  @ApiProperty({ description: 'Datos paginados de cartera', type: [Object] })
  data: any[];

  @ApiProperty({ description: 'Resumen ejecutivo', type: CarteraResumenResponseDto })
  resumen: CarteraResumenResponseDto;

  @ApiProperty({ description: 'Datos de trazabilidad', type: [TrazabilidadItemDto] })
  trazabilidad: TrazabilidadItemDto[];

  @ApiProperty({ description: 'Mensaje descriptivo del resultado', example: 'Cartera con trazabilidad obtenida correctamente' })
  message: string;
}



