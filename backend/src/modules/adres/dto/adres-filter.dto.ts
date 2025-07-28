import { IsString, IsNumber, IsOptional } from 'class-validator';

export class AdresFilterDto {
  @IsOptional()
  @IsString()
  epsId?: string;

  @IsOptional()
  @IsString()
  periodoId?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsNumber()
  page?: number;

  @IsOptional()
  @IsNumber()
  limit?: number;
}
