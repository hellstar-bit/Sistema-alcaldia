// backend/src/modules/flujo/dto/create-flujo-eps-data.dto.ts
import { IsString, IsNumber, IsOptional, IsUUID } from 'class-validator';

export class CreateFlujoEpsDataDto {
  @IsUUID()
  controlCargaId: string;

  @IsNumber()
  upc: number;

  @IsNumber()
  porcentaje92: number;

  @IsNumber()
  pagosCumplimiento: number;

  @IsNumber()
  pagos60: number;

  @IsNumber()
  girado: number;

  @IsNumber()
  cumplimientoRed: number;

  @IsOptional()
  @IsString()
  observaciones?: string;
}
