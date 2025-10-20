import { Movimiento } from 'src/finance/movimiento/entity/movimiento.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from 'typeorm';

@Entity('tag')
export class Tag {
  @PrimaryGeneratedColumn()
  id_tag: number;

  @Column({ length: 50, unique: true })
  nombre: string;

  @ManyToMany(() => Movimiento, (movimiento) => movimiento.tags)
  movimientos: Movimiento[];
}
