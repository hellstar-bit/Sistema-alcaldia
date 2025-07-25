// backend/src/modules/cartera/entities/eps.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToMany, JoinTable } from 'typeorm';
import { CarteraData } from './cartera-data.entity';
import { IPS } from './ips.entity';

@Entity('eps')
export class EPS {
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

  @Column({ default: true })
  activa: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => CarteraData, cartera => cartera.eps)
  carteraData: CarteraData[];

  // Relación Many-to-Many con IPS
  @ManyToMany(() => IPS, ips => ips.eps, { cascade: true })
  @JoinTable({
    name: 'eps_ips',
    joinColumn: { name: 'eps_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'ips_id', referencedColumnName: 'id' }
  })
  ipsAsignadas: IPS[];
}