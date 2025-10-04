import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MovimientoTag } from './entity/movimiento_tag.entity';
import { CreateMovimientoTagDto } from './dto/create-movimiento-tag.dto';
import { Movimiento } from '../movimiento/entity/movimiento.entity';
import { Tag } from '../tag/entity/tag.entity';

@Injectable()
export class MovimientoTagService {
  constructor(
    @InjectRepository(MovimientoTag)
    private readonly movTagRepo: Repository<MovimientoTag>,
    @InjectRepository(Movimiento)
    private readonly movimientoRepo: Repository<Movimiento>,
    @InjectRepository(Tag)
    private readonly tagRepo: Repository<Tag>,
  ) {}

  async create(id_movimiento: number, createDto: CreateMovimientoTagDto) {
    const movimiento = await this.movimientoRepo.findOne({
      where: { id_movimiento },
    });
    if (!movimiento)
      throw new NotFoundException(`Movimiento ${id_movimiento} no encontrado`);

    const tag = await this.tagRepo.findOne({
      where: { id_tag: createDto.id_tag },
    });
    if (!tag)
      throw new NotFoundException(`Tag ${createDto.id_tag} no encontrado`);

    const movTag = this.movTagRepo.create({
      movimiento,
      tag,
    });
    return this.movTagRepo.save(movTag);
  }

  async findAll(id_movimiento: number) {
    return this.movTagRepo.find({
      where: { movimiento: { id_movimiento } },
      relations: ['tag'],
    });
  }

  async remove(id_movimiento: number, id_tag: number) {
    const movTag = await this.movTagRepo.findOne({
      where: { movimiento: { id_movimiento }, tag: { id_tag } },
      relations: ['movimiento', 'tag'],
    });

    if (!movTag)
      throw new NotFoundException(
        `Relación Movimiento ${id_movimiento} con Tag ${id_tag} no encontrada`,
      );

    return this.movTagRepo.remove(movTag);
  }
}
