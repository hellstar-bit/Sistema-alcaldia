// backend/src/modules/adres/dto/adres-filter.dto.ts - DTO DE FILTROS

import { IsOptional, IsString, IsNumber, IsUUID, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class AdresFilterDto {
  @IsOptional()
  @IsUUID('4', { message: 'epsId debe ser un UUID válido' })
  epsId?: string;

  @IsOptional()
  @IsUUID('4', { message: 'periodoId debe ser un UUID válido' })
  periodoId?: string;

  @IsOptional()
  @IsString({ message: 'search debe ser un string' })
  search?: string;

  @IsOptional()
  @IsNumber({}, { message: 'page debe ser un número' })
  @Min(1, { message: 'page debe ser mayor a 0' })
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @IsNumber({}, { message: 'limit debe ser un número' })
  @Min(1, { message: 'limit debe ser mayor a 0' })
  @Max(100, { message: 'limit no puede ser mayor a 100' })
  @Type(() => Number)
  limit?: number = 10;
}