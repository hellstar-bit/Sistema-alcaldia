// backend/src/modules/cartera/entities/periodo.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { CarteraData } from './cartera-data.entity';

@Entity('periodos')
export class Periodo {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  year: number;

  @Column()
  mes: number; // 1-12

  @Column()
  nombre: string; // "Enero", "Febrero", etc.

  @Column({ type: 'date' })
  fechaInicio: Date;

  @Column({ type: 'date' })
  fechaFin: Date;

  @Column({ default: true })
  activo: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => CarteraData, cartera => cartera.periodo)
  carteraData: CarteraData[];
}
