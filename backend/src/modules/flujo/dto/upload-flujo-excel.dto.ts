// backend/src/modules/flujo/dto/upload-flujo-excel.dto.ts
import { IsString, IsOptional } from 'class-validator';

export class UploadFlujoExcelDto {
  @IsString()
  epsId: string;

  @IsString()
  periodoId: string;

  @IsOptional()
  @IsString()
  observaciones?: string;
}
