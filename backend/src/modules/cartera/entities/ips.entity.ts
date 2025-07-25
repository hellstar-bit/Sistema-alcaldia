// backend/src/modules/cartera/entities/ips.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToMany } from 'typeorm';
import { CarteraData } from './cartera-data.entity';
import { EPS } from './eps.entity';

@Entity('ips')
export class IPS {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  codigo: string;

  @Column()
  nombre: string;

  @Column({ nullable: true })
  descripcion: string;

  @Column({ nullable: true })
  direccion: string;

  @Column({ nullable: true })
  telefono: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  contacto: string;

  @Column({ nullable: true })
  tipoServicio: string; // Ejemplo: "Ambulatorio", "Hospitalario", "Mixto"

  @Column({ default: true })
  activa: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => CarteraData, cartera => cartera.ips)
  carteraData: CarteraData[];

  // Relación Many-to-Many con EPS
  @ManyToMany(() => EPS, eps => eps.ipsAsignadas)
  eps: EPS[];
}