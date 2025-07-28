import { IsString, IsNumber, IsOptional } from 'class-validator';

export class CreateAdresDataDto {
  @IsString()
  epsId: string;

  @IsString()
  periodoId: string;

  @IsNumber()
  upc: number;

  @IsNumber()
  valorGirado: number;

  @IsOptional()
  @IsString()
  observaciones?: string;
}
