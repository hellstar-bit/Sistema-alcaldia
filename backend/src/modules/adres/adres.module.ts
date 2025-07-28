// backend/src/modules/adres/adres.module.ts - VERSIÓN COMPLETA
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdresController } from './adres.controller';
import { AdresService } from './adres.service';
import { AdresData } from './entities/adres-data.entity';
import { EPS } from '../cartera/entities/eps.entity';
import { Periodo } from '../cartera/entities/periodo.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AdresData,
      EPS,
      Periodo,
    ])
  ],
  controllers: [AdresController],
  providers: [AdresService],
  exports: [AdresService]
})
export class AdresModule {}
