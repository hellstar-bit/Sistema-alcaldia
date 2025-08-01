// backend/src/modules/cartera/dto/cartera-filter.dto.ts - VERSIÓN CORREGIDA
import { IsOptional, IsString, IsNumber, IsBoolean } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class CarteraFilterDto {
  @IsOptional()
  @IsString()
  epsId?: string;

  @IsOptional()
  @IsString()
  periodoId?: string;

  @IsOptional()
  @IsString()
  ipsId?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined || value === null || value === '') return undefined;
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      const parsed = parseInt(value, 10);
      return isNaN(parsed) ? undefined : parsed;
    }
    return undefined;
  })
  @IsNumber()
  page?: number;

  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined || value === null || value === '') return undefined;
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      const parsed = parseInt(value, 10);
      return isNaN(parsed) ? undefined : parsed;
    }
    return undefined;
  })
  @IsNumber()
  limit?: number;

  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined || value === null || value === '') return undefined;
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') {
      const lowerValue = value.toLowerCase();
      if (lowerValue === 'true') return true;
      if (lowerValue === 'false') return false;
    }
    return undefined;
  })
  @IsBoolean()
  soloConDatos?: boolean;

  // ✅ NUEVAS PROPIEDADES AGREGADAS PARA CORREGIR EL ERROR 400
  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined || value === null || value === '') return undefined;
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') {
      const lowerValue = value.toLowerCase();
      if (lowerValue === 'true') return true;
      if (lowerValue === 'false') return false;
    }
    return undefined;
  })
  @IsBoolean()
  includeEPS?: boolean;

  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined || value === null || value === '') return undefined;
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') {
      const lowerValue = value.toLowerCase();
      if (lowerValue === 'true') return true;
      if (lowerValue === 'false') return false;
    }
    return undefined;
  })
  @IsBoolean()
  includeIPS?: boolean;

  @IsOptional()
  @IsString() 
  orderBy?: 'nombre' | 'codigo' | 'createdAt' | 'total';

  @IsOptional()
  @IsString()
  orderDirection?: 'ASC' | 'DESC';

  // ✅ PROPIEDADES ADICIONALES PARA FILTROS AVANZADOS
  @IsOptional()
  @IsString()
  epsIds?: string; // Lista separada por comas

  @IsOptional()
  @IsString()
  ipsIds?: string; // Lista separada por comas

  @IsOptional()
  @IsString()
  periodoIds?: string; // Lista separada por comas

  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined || value === null || value === '') return undefined;
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') {
      const lowerValue = value.toLowerCase();
      if (lowerValue === 'true') return true;
      if (lowerValue === 'false') return false;
    }
    return undefined;
  })
  @IsBoolean()
  includeHistorico?: boolean;

  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined || value === null || value === '') return undefined;
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') {
      const lowerValue = value.toLowerCase();
      if (lowerValue === 'true') return true;
      if (lowerValue === 'false') return false;
    }
    return undefined;
  })
  @IsBoolean()
  includeRelaciones?: boolean;
}