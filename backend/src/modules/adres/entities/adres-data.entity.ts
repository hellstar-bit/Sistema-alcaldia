// backend/src/modules/adres/entities/adres-data.entity.ts - ENTIDAD CORREGIDA SEGÚN TU TABLA

import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { EPS } from '../../cartera/entities/eps.entity';
import { Periodo } from '../../cartera/entities/periodo.entity';

@Entity('adres_data')  // ✅ Nombre exacto de tu tabla
export class AdresData {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // ✅ RELACIONES CON FOREIGN KEYS - nombres exactos de tu tabla
  @ManyToOne(() => EPS, { eager: true })
  @JoinColumn({ name: 'epsId' })    // ✅ Nombre exacto: epsId
  eps: EPS;

  @Column({ name: 'epsId' })        // ✅ Nombre exacto: epsId
  epsId: string;

  @ManyToOne(() => Periodo, { eager: true })
  @JoinColumn({ name: 'periodoId' }) // ✅ Nombre exacto: periodoId
  periodo: Periodo;

  @Column({ name: 'periodoId' })     // ✅ Nombre exacto: periodoId
  periodoId: string;

  // ✅ CAMPOS DE DATOS - exactos según tu tabla
  @Column({ 
    type: 'decimal', 
    precision: 15, 
    scale: 2,
    name: 'upc'                      // ✅ Nombre exacto: upc
  })
  upc: number;

  @Column({ 
    type: 'decimal', 
    precision: 15, 
    scale: 2,
    name: 'valorGirado'              // ✅ Nombre exacto: valorGirado
  })
  valorGirado: number;

  @Column({ 
    type: 'text', 
    nullable: true,
    name: 'observaciones'            // ✅ Nombre exacto: observaciones
  })
  observaciones?: string;

  // ✅ CAMPOS DE CONTROL - exactos según tu tabla
  @Column({ 
  type: 'boolean',
  default: true,
  name: 'activo'
})
activo: boolean;

  @CreateDateColumn({ 
    type: 'timestamp',
    precision: 6,
    name: 'createdAt'                // ✅ Nombre exacto: createdAt
  })
  createdAt: Date;

  @UpdateDateColumn({ 
    type: 'timestamp', 
    precision: 6,
    name: 'updatedAt'                // ✅ Nombre exacto: updatedAt
  })
  updatedAt: Date;
}