import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Usuario } from '../../../user/usuario/entity/usuario.entity';
import { Categoria } from '../../categoria/entity/categoria.entity';
import { Moneda } from '../../moneda/entity/moneda.entity';
import { MovimientoTag } from '../../movimiento-tag/entity/movimiento_tag.entity';


@Entity('movimiento')
export class Movimiento {
  @PrimaryGeneratedColumn()
  id_movimiento: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  monto: number;


  @Column({ type: 'date' })
  fecha: Date;

  @Column({ length: 255, nullable: true })
  descripcion: string;

  @ManyToOne(() => Usuario, (usuario) => usuario.movimientos)
  @JoinColumn({ name: 'id_usuario' })
  usuario: Usuario;

  @ManyToOne(() => Categoria, (categoria) => categoria.movimientos)
  @JoinColumn({ name: 'id_categoria' })
  categoria: Categoria;


  @ManyToOne(() => Moneda, (moneda) => moneda.movimientos, { nullable: true })
  @JoinColumn({ name: 'id_moneda' })
  moneda: Moneda;

  @OneToMany(() => MovimientoTag, (movTag) => movTag.movimiento)
  tags: MovimientoTag[];
}
