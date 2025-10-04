import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Movimiento } from './entity/movimiento.entity';
import { CreateMovimientoDto } from './dto/create-movimiento.dto';
import { UpdateMovimientoDto } from './dto/update-movimiento.dto';

@Injectable()
export class MovimientoService {
  constructor(
    @InjectRepository(Movimiento)
    private readonly movimientoRepo: Repository<Movimiento>,
  ) {}

  async create(createMovimientoDto: CreateMovimientoDto) {
    const movimiento = this.movimientoRepo.create(createMovimientoDto);
    return await this.movimientoRepo.save(movimiento);
  }

  async findAll(filters: any) {
    const query = this.movimientoRepo.createQueryBuilder('movimiento')
      .leftJoinAndSelect('movimiento.usuario', 'usuario')
      .leftJoinAndSelect('movimiento.categoria', 'categoria')
      .leftJoinAndSelect('movimiento.moneda', 'moneda')
      .leftJoinAndSelect('movimiento.tags', 'tags')
      .leftJoinAndSelect('tags.tag', 'tag');

    if (filters.usuario) {
      query.andWhere('movimiento.usuario.id_usuario = :usuario', {
        usuario: filters.usuario,
      });
    }
    if (filters.tipo) {
      query.andWhere('movimiento.tipo = :tipo', { tipo: filters.tipo });
    }
    if (filters.mes && filters.anio) {
      query.andWhere('MONTH(movimiento.fecha) = :mes', { mes: filters.mes });
      query.andWhere('YEAR(movimiento.fecha) = :anio', { anio: filters.anio });
    }
    if (filters.categoria) {
      query.andWhere('movimiento.categoria.id_categoria = :categoria', {
        categoria: filters.categoria,
      });
    }

    return await query.getMany();
  }

  async findOne(id: number) {
    const movimiento = await this.movimientoRepo.findOne({
      where: { id_movimiento: id },
      relations: ['usuario', 'categoria', 'moneda', 'tags', 'tags.tag'],
    });
    if (!movimiento) throw new NotFoundException(`Movimiento ${id} no encontrado`);
    return movimiento;
  }

  async update(id: number, updateDto: UpdateMovimientoDto) {
    const movimiento = await this.findOne(id);
    Object.assign(movimiento, updateDto);
    return await this.movimientoRepo.save(movimiento);
  }

  async remove(id: number) {
    const movimiento = await this.findOne(id);
    return await this.movimientoRepo.remove(movimiento);
  }
}
