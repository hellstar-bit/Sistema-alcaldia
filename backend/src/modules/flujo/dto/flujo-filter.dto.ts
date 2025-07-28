// backend/src/modules/flujo/dto/flujo-filter.dto.ts
import { IsOptional, IsString, IsNumber, IsBoolean } from 'class-validator';

export class FlujoFilterDto {
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
  @IsNumber()
  page?: number;

  @IsOptional()
  @IsNumber()
  limit?: number;

  @IsOptional()
  @IsBoolean()
  soloConDatos?: boolean;
}
