// backend/src/modules/dashboards-eps-ips/dto/dashboard-filters.dto.ts
import { IsOptional, IsArray, IsString, IsEnum, IsBoolean, IsNumber, Min, Max } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export enum TipoAnalisisEnum {
  CARTERA = 'cartera',
  FLUJO = 'flujo',
  AMBOS = 'ambos'
}

export class DashboardFiltersDto {
  @ApiPropertyOptional({
    description: 'IDs de EPS a filtrar',
    type: [String],
    example: ['eps-1', 'eps-2']
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  epsIds?: string[];

  @ApiPropertyOptional({
    description: 'IDs de IPS a filtrar',
    type: [String],
    example: ['ips-1', 'ips-2']
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  ipsIds?: string[];

  @ApiPropertyOptional({
    description: 'IDs de períodos a filtrar',
    type: [String],
    example: ['periodo-1', 'periodo-2']
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  periodoIds?: string[];

  @ApiPropertyOptional({
    description: 'Fecha de inicio del filtro',
    example: '2025-01-01'
  })
  @IsOptional()
  @IsString()
  fechaInicio?: string;

  @ApiPropertyOptional({
    description: 'Fecha de fin del filtro',
    example: '2025-12-31'
  })
  @IsOptional()
  @IsString()
  fechaFin?: string;

  @ApiPropertyOptional({
    description: 'Tipo de análisis a realizar',
    enum: TipoAnalisisEnum,
    example: TipoAnalisisEnum.AMBOS
  })
  @IsOptional()
  @IsEnum(TipoAnalisisEnum)
  tipoAnalisis?: TipoAnalisisEnum;

  @ApiPropertyOptional({
    description: 'Incluir datos históricos para trazabilidad',
    example: false
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  incluirHistorico?: boolean;

  @ApiPropertyOptional({
    description: 'Número de página para paginación',
    example: 1,
    minimum: 1
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  page?: number;

  @ApiPropertyOptional({
    description: 'Cantidad de registros por página',
    example: 50,
    minimum: 1,
    maximum: 1000
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(1000)
  @Type(() => Number)
  limit?: number;
}