import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Movimiento } from '../../movimiento/entity/movimiento.entity';


@Entity('categoria')
export class Categoria {
  @PrimaryGeneratedColumn()
  id_categoria: number;

  @Column({ length: 100 })
  nombre_categoria: string;

  @Column({ type: 'enum', enum: ['ingreso', 'gasto'] })
  tipo: string;

  @OneToMany(() => Movimiento, (movimiento) => movimiento.categoria)
  movimientos: Movimiento[];
}
 