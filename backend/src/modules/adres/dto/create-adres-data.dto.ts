// backend/src/modules/adres/dto/create-adres-data.dto.ts - DTO CORREGIDO

import { IsString, IsNumber, IsOptional, IsUUID, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateAdresDataDto {
  @IsUUID('4', { message: 'epsId debe ser un UUID válido' })
  @IsString({ message: 'epsId debe ser un string' })
  epsId: string;

  @IsUUID('4', { message: 'periodoId debe ser un UUID válido' })
  @IsString({ message: 'periodoId debe ser un string' })
  periodoId: string;

  @IsNumber({}, { message: 'upc debe ser un número' })
  @Min(0, { message: 'upc debe ser mayor o igual a 0' })
  @Type(() => Number)
  upc: number;

  @IsNumber({}, { message: 'valorGirado debe ser un número' })
  @Min(0, { message: 'valorGirado debe ser mayor o igual a 0' })
  @Type(() => Number)
  valorGirado: number;

  @IsOptional()
  @IsString({ message: 'observaciones debe ser un string' })
  observaciones?: string;
}