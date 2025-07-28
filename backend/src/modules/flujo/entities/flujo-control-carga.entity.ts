// backend/src/modules/flujo/entities/flujo-control-carga.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { EPS } from '../../cartera/entities/eps.entity';
import { Periodo } from '../../cartera/entities/periodo.entity';
import { FlujoIpsData } from './flujo-ips-data.entity';
import { FlujoEpsData } from './flujo-eps-data.entity';

@Entity('flujo_control_carga')
export class FlujoControlCarga {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => EPS, { eager: true })
  @JoinColumn({ name: 'eps_id' })
  eps: EPS;

  @Column({ name: 'eps_id' })
  epsId: string;

  @ManyToOne(() => Periodo, { eager: true })
  @JoinColumn({ name: 'periodo_id' })
  periodo: Periodo;

  @Column({ name: 'periodo_id' })
  periodoId: string;

  @Column({ default: true })
  activo: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relaciones con las otras tablas
  @OneToMany(() => FlujoIpsData, flujoIps => flujoIps.controlCarga)
  ipsData: FlujoIpsData[];

  @OneToMany(() => FlujoEpsData, flujoEps => flujoEps.controlCarga)
  epsData: FlujoEpsData[];
}
