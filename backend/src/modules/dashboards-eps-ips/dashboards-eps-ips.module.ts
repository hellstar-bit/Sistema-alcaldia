// backend/src/modules/dashboards-eps-ips/dashboards-eps-ips.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardsEpsIpsController } from './dashboards-eps-ips.controller';
import { DashboardsEpsIpsService } from './dashboards-eps-ips.service';

// Importar entidades necesarias
import { EPS } from '../cartera/entities/eps.entity';
import { IPS } from '../cartera/entities/ips.entity';
import { Periodo } from '../cartera/entities/periodo.entity';
import { CarteraData } from '../cartera/entities/cartera-data.entity';
import { FlujoIpsData } from '../flujo/entities/flujo-ips-data.entity';

// Importar módulos de servicios
import { CarteraModule } from '../cartera/cartera.module';
import { FlujoModule } from '../flujo/flujo.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      EPS,
      IPS, 
      Periodo,
      CarteraData,
      FlujoIpsData
    ]),
    CarteraModule,
    FlujoModule
  ],
  controllers: [DashboardsEpsIpsController],
  providers: [DashboardsEpsIpsService],
  exports: [DashboardsEpsIpsService]
})
export class DashboardsEpsIpsModule {}

