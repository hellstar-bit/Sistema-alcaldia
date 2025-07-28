// backend/src/modules/flujo/flujo.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';

// Entities
import { FlujoControlCarga } from './entities/flujo-control-carga.entity';
import { FlujoIpsData } from './entities/flujo-ips-data.entity';
import { FlujoEpsData } from './entities/flujo-eps-data.entity';
import { EPS } from '../cartera/entities/eps.entity';
import { IPS } from '../cartera/entities/ips.entity';
import { Periodo } from '../cartera/entities/periodo.entity';

// Controllers
import { FlujoController } from './flujo.controller';

// Services
import { FlujoService } from './flujo.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      FlujoControlCarga,
      FlujoIpsData,
      FlujoEpsData,
      EPS,
      IPS,
      Periodo
    ]),
    MulterModule.register({
      limits: {
        fileSize: 50 * 1024 * 1024, // 50MB
      },
    }),
  ],
  controllers: [FlujoController],
  providers: [FlujoService],
  exports: [FlujoService],
})
export class FlujoModule {}
