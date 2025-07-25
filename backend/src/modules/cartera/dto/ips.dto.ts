// backend/src/modules/cartera/dto/ips.dto.ts
import { IsString, IsOptional, IsBoolean, IsNumber } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class CreateIPSDto {
  @IsString()
  nombre: string;

  @IsOptional()
  @IsString()
  codigo?: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsString()
  direccion?: string;

  @IsOptional()
  @IsString()
  telefono?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  contacto?: string;

  @IsOptional()
  @IsString()
  tipoServicio?: string;

  @IsOptional()
  @IsBoolean()
  activa?: boolean = true;
}

export class UpdateIPSDto {
  @IsOptional()
  @IsString()
  nombre?: string;

  @IsOptional()
  @IsString()
  codigo?: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsString()
  direccion?: string;

  @IsOptional()
  @IsString()
  telefono?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  contacto?: string;

  @IsOptional()
  @IsString()
  tipoServicio?: string;

  @IsOptional()
  @IsBoolean()
  activa?: boolean;
}

export class IPSFilterDto {
  @IsOptional()
  @IsString()
  search?: string;

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
  soloActivas?: boolean;

  @IsOptional()
  @IsString()
  tipoServicio?: string;

  @IsOptional()
  @IsString()
  epsId?: string;

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
  sinAsignar?: boolean;

  @IsOptional()
  @IsString()
  orderBy?: 'nombre' | 'codigo' | 'createdAt';

  @IsOptional()
  @IsString()
  orderDirection?: 'ASC' | 'DESC';

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
}