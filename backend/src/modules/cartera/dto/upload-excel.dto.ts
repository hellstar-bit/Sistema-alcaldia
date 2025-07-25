// backend/src/modules/cartera/dto/upload-excel.dto.ts
import { IsString, IsOptional } from 'class-validator';

export class UploadExcelDto {
  @IsString()
  epsId: string;

  @IsString()
  periodoId: string;

  @IsOptional()
  @IsString()
  observaciones?: string;
}