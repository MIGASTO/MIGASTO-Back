// movimiento_tag.entity.ts
import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Movimiento } from '../../movimiento/entity/movimiento.entity';
import { Tag } from '../../tag/entity/tag.entity';

@Entity('movimiento_tag')
export class MovimientoTag {
  @PrimaryGeneratedColumn()
  id_mov_tag: number;

  @ManyToOne(() => Movimiento, (movimiento) => movimiento.tags)
  @JoinColumn({ name: 'id_movimiento' })
  movimiento: Movimiento;

  @ManyToOne(() => Tag, (tag) => tag.movimientos)
  @JoinColumn({ name: 'id_tag' })
  tag: Tag;
}
