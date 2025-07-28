// backend/src/modules/flujo/entities/flujo-eps-data.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { FlujoControlCarga } from './flujo-control-carga.entity';

@Entity('flujo_eps_data')
export class FlujoEpsData {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => FlujoControlCarga, control => control.epsData)
  @JoinColumn({ name: 'control_carga_id' })
  controlCarga: FlujoControlCarga;

  @Column({ name: 'control_carga_id' })
  controlCargaId: string;

  // Campos específicos de EPS/período
  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  upc: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  porcentaje92: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  pagosCumplimiento: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  pagos60: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  girado: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  cumplimientoRed: number;

  @Column({ nullable: true })
  observaciones: string;

  @Column({ default: true })
  activo: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
