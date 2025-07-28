// backend/src/modules/flujo/entities/flujo-ips-data.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { FlujoControlCarga } from './flujo-control-carga.entity';
import { IPS } from '../../cartera/entities/ips.entity';

@Entity('flujo_ips_data')
export class FlujoIpsData {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => FlujoControlCarga, control => control.ipsData)
  @JoinColumn({ name: 'control_carga_id' })
  controlCarga: FlujoControlCarga;

  @Column({ name: 'control_carga_id' })
  controlCargaId: string;

  @ManyToOne(() => IPS, { eager: true })
  @JoinColumn({ name: 'ips_id' })
  ips: IPS;

  @Column({ name: 'ips_id' })
  ipsId: string;

  // Campos específicos del flujo
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  incremento: number;

  @Column({ nullable: true })
  tipoContrato: string;

  @Column({ type: 'date', nullable: true })
  fechaContrato: Date;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  valorFacturado: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  valorGlosa: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  reconocido: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  valorPagado: number;

  @Column({ type: 'date', nullable: true })
  fechaPago: Date;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  saldoAdeudado: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  saldoTotal: number;

  @Column({ nullable: true })
  orden: string;

  @Column({ nullable: true })
  giro: string;

  @Column({ nullable: true })
  observaciones: string;

  @Column({ default: true })
  activo: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
