// backend/src/modules/dashboards-eps-ips/dto/top-entidades-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class TopEntidadItemDto {
  @ApiProperty({ description: 'ID de la entidad', example: 'eps-uuid-123' })
  id: string;

  @ApiProperty({ description: 'Nombre de la entidad', example: 'EPS Sura' })
  nombre: string;

  @ApiProperty({ description: 'Cartera total de la entidad', example: 150000000 })
  carteraTotal: number;

  @ApiProperty({ description: 'Cantidad de relaciones', example: 45 })
  cantidadRelaciones: number;

  @ApiProperty({ description: 'Porcentaje del total', example: 12.5 })
  porcentajeTotal: number;
}

export class TopEntidadesResponseDto {
  @ApiProperty({ description: 'Indica si la operación fue exitosa', example: true })
  success: boolean;

  @ApiProperty({ description: 'Lista de top entidades', type: [TopEntidadItemDto] })
  data: TopEntidadItemDto[];

  @ApiProperty({ description: 'Mensaje descriptivo', example: 'Top 10 EPS obtenido correctamente' })
  message: string;
}