// backend/src/modules/dashboards-eps-ips/dto/tendencias-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class TendenciaEvolucionDto {
  @ApiProperty({ description: 'Período', example: 'Enero 2025' })
  periodo: string;

  @ApiProperty({ description: 'Cartera total del período', example: 1200000000 })
  carteraTotal: number;

  @ApiProperty({ description: 'Variación mensual porcentual', example: 3.2 })
  variacionMensual: number;

  @ApiProperty({ description: 'Cantidad de EPS activas', example: 25 })
  cantidadEPS: number;

  @ApiProperty({ description: 'Cantidad de IPS con cartera', example: 150 })
  cantidadIPS: number;
}

export class ProyeccionDto {
  @ApiProperty({ description: 'Período proyectado', example: 'Proyección +1 mes' })
  periodo: string;

  @ApiProperty({ description: 'Cartera proyectada', example: 1250000000 })
  carteraProyectada: number;

  @ApiProperty({ description: 'Nivel de confianza de la proyección', example: 85 })
  confianza: number;
}

export class AlertaDto {
  @ApiProperty({ description: 'Tipo de alerta', example: 'crecimiento_acelerado' })
  tipo: string;

  @ApiProperty({ description: 'Mensaje de la alerta', example: 'Crecimiento superior al 15% detectado' })
  mensaje: string;

  @ApiProperty({ description: 'Severidad de la alerta', example: 'alta' })
  severidad: 'baja' | 'media' | 'alta';

  @ApiProperty({ description: 'Entidad relacionada', example: 'EPS Sura' })
  entidad: string;

  @ApiProperty({ description: 'Valor asociado', example: 18.5 })
  valor: number;
}

export class TendenciasDataDto {
  @ApiProperty({ description: 'Evolución histórica de cartera', type: [TendenciaEvolucionDto] })
  carteraEvolucion: TendenciaEvolucionDto[];

  @ApiProperty({ description: 'Proyecciones futuras', type: [ProyeccionDto] })
  proyecciones: ProyeccionDto[];

  @ApiProperty({ description: 'Alertas generadas', type: [AlertaDto] })
  alertas: AlertaDto[];
}

export class TendenciasResponseDto {
  @ApiProperty({ description: 'Indica si la operación fue exitosa', example: true })
  success: boolean;

  @ApiProperty({ description: 'Datos de tendencias y proyecciones', type: TendenciasDataDto })
  data: TendenciasDataDto;

  @ApiProperty({ description: 'Mensaje descriptivo', example: 'Tendencias calculadas exitosamente' })
  message?: string;
}