import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Movimiento } from '../../movimiento/entity/movimiento.entity';

export enum TipoCategoria {
  INGRESO = 'INGRESO',
  GASTO = 'GASTO',
}

@Entity('categoria')
export class Categoria {
  @PrimaryGeneratedColumn()
  id_categoria: number;

  @Column({
    type: 'enum',
    enum: TipoCategoria,
    unique: true,
  })

  tipo_categoria: TipoCategoria;

  @OneToMany(() => Movimiento, (movimiento) => movimiento.categoria)
  movimientos: Movimiento[];
}
 