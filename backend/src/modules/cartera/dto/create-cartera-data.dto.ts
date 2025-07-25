// backend/src/modules/cartera/dto/create-cartera-data.dto.ts
import { IsString, IsNumber, IsOptional, IsUUID, Min } from 'class-validator';

export class CreateCarteraDataDto {
  @IsUUID()
  epsId: string;

  @IsUUID()
  ipsId: string;

  @IsUUID()
  periodoId: string;

  @IsNumber()
  @Min(0)
  a30: number;

  @IsNumber()
  @Min(0)
  a60: number;

  @IsNumber()
  @Min(0)
  a90: number;

  @IsNumber()
  @Min(0)
  a120: number;

  @IsNumber()
  @Min(0)
  a180: number;

  @IsNumber()
  @Min(0)
  a360: number;

  @IsNumber()
  @Min(0)
  sup360: number;

  @IsOptional()
  @IsString()
  observaciones?: string;
}
