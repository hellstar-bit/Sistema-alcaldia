// backend/src/modules/cartera/cartera.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';

// Entities
import { EPS } from './entities/eps.entity';
import { IPS } from './entities/ips.entity';
import { Periodo } from './entities/periodo.entity';
import { CarteraData } from './entities/cartera-data.entity';

// Controllers
import { CarteraController } from './cartera.controller';
import { EPSController } from './controllers/eps.controller';
import { IPSController } from './controllers/ips.controller';

// Services
import { CarteraService } from './cartera.service';
import { EPSService } from './services/eps.service';
import { IPSService } from './services/ips.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([EPS, IPS, Periodo, CarteraData]),
    MulterModule.register({
      limits: {
        fileSize: 50 * 1024 * 1024, // 50MB
      },
    }),
  ],
  controllers: [
    CarteraController,
    EPSController,
    IPSController
  ],
  providers: [
    CarteraService,
    EPSService,
    IPSService
  ],
  exports: [
    CarteraService,
    EPSService,
    IPSService
  ],
})
export class CarteraModule {}