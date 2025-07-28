// backend/src/modules/flujo/dto/create-flujo-ips-data.dto.ts
import { IsString, IsNumber, IsOptional, IsUUID, IsDateString } from 'class-validator';

export class CreateFlujoIpsDataDto {
  @IsUUID()
  controlCargaId: string;

  @IsUUID()
  ipsId: string;

  @IsNumber()
  incremento: number;

  @IsOptional()
  @IsString()
  tipoContrato?: string;

  @IsOptional()
  @IsDateString()
  fechaContrato?: string;

  @IsNumber()
  valorFacturado: number;

  @IsNumber()
  valorGlosa: number;

  @IsNumber()
  reconocido: number;

  @IsNumber()
  valorPagado: number;

  @IsOptional()
  @IsDateString()
  fechaPago?: string;

  @IsNumber()
  saldoAdeudado: number;

  @IsNumber()
  saldoTotal: number;

  @IsOptional()
  @IsString()
  orden?: string;

  @IsOptional()
  @IsString()
  giro?: string;

  @IsOptional()
  @IsString()
  observaciones?: string;
}
