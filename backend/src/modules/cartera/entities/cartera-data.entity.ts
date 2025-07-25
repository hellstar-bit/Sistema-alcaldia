// backend/src/modules/cartera/entities/cartera-data.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { EPS } from './eps.entity';
import { IPS } from './ips.entity';
import { Periodo } from './periodo.entity';

@Entity('cartera_data')
@Index(['eps', 'ips', 'periodo'], { unique: true })
export class CarteraData {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => EPS, eps => eps.carteraData)
  @JoinColumn({ name: 'eps_id' })
  eps: EPS;

  @Column({ name: 'eps_id' })
  epsId: string;

  @ManyToOne(() => IPS, ips => ips.carteraData)
  @JoinColumn({ name: 'ips_id' })
  ips: IPS;

  @Column({ name: 'ips_id' })
  ipsId: string;

  @ManyToOne(() => Periodo, periodo => periodo.carteraData)
  @JoinColumn({ name: 'periodo_id' })
  periodo: Periodo;

  @Column({ name: 'periodo_id' })
  periodoId: string;

  // Rangos de cartera por días
  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  a30: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  a60: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  a90: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  a120: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  a180: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  a360: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  sup360: number;

  // Total calculado automáticamente
  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  total: number;

  @Column({ nullable: true })
  observaciones: string;

  @Column({ default: true })
  activo: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Método para calcular el total automáticamente
  calcularTotal(): void {
    this.total = Number(this.a30) + Number(this.a60) + Number(this.a90) + 
                 Number(this.a120) + Number(this.a180) + Number(this.a360) + Number(this.sup360);
  }
}