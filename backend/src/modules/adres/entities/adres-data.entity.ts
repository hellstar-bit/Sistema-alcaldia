import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, Unique, Index } from 'typeorm';
import { EPS } from '../../cartera/entities/eps.entity';
import { Periodo } from '../../cartera/entities/periodo.entity';

@Entity('adres_data')
// ✅ QUITAR o COMENTAR esta línea si existe:
// @Unique(['epsId', 'periodoId'])  // <-- ESTA LÍNEA CAUSA EL PROBLEMA
export class AdresData {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => EPS, { eager: false })
  @JoinColumn({ name: 'epsId' })
  eps: EPS;

  @Column({ name: 'epsId' })
  epsId: string;

  @ManyToOne(() => Periodo, { eager: false })
  @JoinColumn({ name: 'periodoId' })
  periodo: Periodo;

  @Column({ name: 'periodoId' })
  periodoId: string;

  @Column('decimal', { precision: 15, scale: 2 })
  upc: number;

  @Column('decimal', { precision: 15, scale: 2 })
  valorGirado: number;

  @Column('text', { nullable: true })
  observaciones: string;

  @Column({ default: true })
  activo: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}