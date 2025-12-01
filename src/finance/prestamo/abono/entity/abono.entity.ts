import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { Prestamo } from '../../prestamos/entity/prestamo.entity';


@Entity()
export class Abono {
@PrimaryGeneratedColumn()
id_abono: number;


@ManyToOne(() => Prestamo, prestamo => prestamo.abonos, { onDelete: 'CASCADE' })
prestamo: Prestamo;


@Column('decimal', { precision: 18, scale: 2 })
monto: number;



@CreateDateColumn()
fecha_creacion: Date;
}
