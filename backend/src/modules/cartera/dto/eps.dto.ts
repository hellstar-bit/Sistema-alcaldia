// backend/src/modules/cartera/dto/eps.dto.ts
import { IsString, IsOptional, IsBoolean, IsArray, IsUUID } from 'class-validator';

export class CreateEPSDto {
  @IsString()
  nombre: string;

  @IsOptional()
  @IsString()
  codigo?: string; // Se generará automáticamente si no se proporciona

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
  @IsBoolean()
  activa?: boolean = true;
}

export class UpdateEPSDto {
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
  @IsBoolean()
  activa?: boolean;
}

export class AssignIPSToEPSDto {
  @IsUUID()
  epsId: string;

  @IsArray()
  @IsUUID('4', { each: true })
  ipsIds: string[];
}

export class EPSFilterDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsBoolean()
  soloActivas?: boolean;

  @IsOptional()
  @IsString()
  orderBy?: 'nombre' | 'codigo' | 'createdAt';

  @IsOptional()
  @IsString()
  orderDirection?: 'ASC' | 'DESC';

  @IsOptional()
  page?: number;

  @IsOptional()
  limit?: number;
}