import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FlujoController } from './flujo.controller';
import { FlujoService } from './flujo.service';
import { FlujoControlCarga } from './entities/flujo-control-carga.entity';
import { FlujoIpsData } from './entities/flujo-ips-data.entity';
import { FlujoEpsData } from './entities/flujo-eps-data.entity';
import { EPS } from '../cartera/entities/eps.entity';
import { IPS } from '../cartera/entities/ips.entity';
import { Periodo } from '../cartera/entities/periodo.entity';
import { AdresData } from '../adres/entities/adres-data.entity'; // NUEVO IMPORT

@Module({
  imports: [
    TypeOrmModule.forFeature([
      FlujoControlCarga,
      FlujoIpsData,
      FlujoEpsData,
      EPS,
      IPS,
      Periodo,
      AdresData // NUEVO: Asegúrate de que esté incluido
    ])
  ],
  controllers: [FlujoController],
  providers: [FlujoService],
  exports: [FlujoService]
})
export class FlujoModule {}
