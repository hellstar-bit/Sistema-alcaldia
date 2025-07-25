// backend/src/modules/cartera/dto/ips.dto.ts
import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class CreateIPSDto {
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
  @IsBoolean()
  soloActivas?: boolean;

  @IsOptional()
  @IsString()
  tipoServicio?: string;

  @IsOptional()
  @IsString()
  epsId?: string; // Para filtrar IPS asignadas a una EPS específica

  @IsOptional()
  @IsBoolean()
  sinAsignar?: boolean; // Para mostrar solo IPS no asignadas a ninguna EPS

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