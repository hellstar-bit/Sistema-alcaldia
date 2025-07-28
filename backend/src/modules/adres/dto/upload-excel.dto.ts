import { IsString, IsOptional, IsArray } from 'class-validator';

export class UploadExcelDto {
  @IsString()
  epsId: string;

  @IsString()
  periodoId: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  selectedFields?: string[];  // e.g., ['eps', 'upc', 'valorGirado'] para selección en modal

  @IsOptional()
  @IsString()
  observaciones?: string;
}
