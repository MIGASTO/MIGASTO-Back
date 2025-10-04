// tag.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { MovimientoTag } from '../../movimiento-tag/entity/movimiento_tag.entity';

@Entity('tag')
export class Tag {
  @PrimaryGeneratedColumn()
  id_tag: number;

  @Column({ length: 50 })
  nombre: string;

  @OneToMany(() => MovimientoTag, (movTag) => movTag.tag)
  movimientos: MovimientoTag[];
}
