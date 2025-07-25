// backend/src/modules/cartera/cartera.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { CarteraController } from './cartera.controller';
import { CarteraService } from './cartera.service';
import { EPS } from './entities/eps.entity';
import { IPS } from './entities/ips.entity';
import { Periodo } from './entities/periodo.entity';
import { CarteraData } from './entities/cartera-data.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([EPS, IPS, Periodo, CarteraData]),
    MulterModule.register({
      limits: {
        fileSize: 50 * 1024 * 1024, // 50MB
      },
    }),
  ],
  controllers: [CarteraController],
  providers: [CarteraService],
  exports: [CarteraService],
})
export class CarteraModule {}