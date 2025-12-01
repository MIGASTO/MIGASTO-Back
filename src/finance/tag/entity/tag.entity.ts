import { Movimiento } from 'src/finance/movimiento/entity/movimiento.entity';
import { Usuario } from 'src/user/usuario/entity/usuario.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, ManyToOne, JoinColumn } from 'typeorm';

@Entity('tag')
export class Tag {
  @PrimaryGeneratedColumn()
  id_tag: number;

  @Column({ length: 50})
  nombre: string;

  @ManyToMany(() => Movimiento, (movimiento) => movimiento.tags)
  movimientos: Movimiento[];

  @ManyToOne(() => Usuario, { nullable: true })
  @JoinColumn({ name: 'id_usuario' })
  usuario: Usuario;
}
