import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tag } from './entity/tag.entity';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';

@Injectable()
export class TagService {
  constructor(
    @InjectRepository(Tag)
    private readonly tagRepository: Repository<Tag>,
  ) {}

  async create(createTagDto: CreateTagDto): Promise<Tag> {
  
    const existente = await this.tagRepository.findOne({
      where: { nombre: createTagDto.nombre },
    });
    if (existente)
      throw new BadRequestException(`El tag "${createTagDto.nombre}" ya existe.`);

    const tag = this.tagRepository.create(createTagDto);
    return await this.tagRepository.save(tag);
  }

  async findAll() {
    return await this.tagRepository.find();
  }

  async findOne(id: number) {
    const tag = await this.tagRepository.findOne({ where: { id_tag: id } });
    if (!tag) throw new NotFoundException(`Tag con id ${id} no encontrado`);
    return tag;
  }

  async update(id: number, updateTagDto: UpdateTagDto): Promise<Tag> {
    const tag = await this.findOne(id);

    
    if (updateTagDto.nombre && updateTagDto.nombre !== tag.nombre) {
      const duplicado = await this.tagRepository.findOne({
        where: { nombre: updateTagDto.nombre },
      });
      if (duplicado)
        throw new BadRequestException(`El nombre "${updateTagDto.nombre}" ya está en uso.`);
    }

    Object.assign(tag, updateTagDto);
    return await this.tagRepository.save(tag);
  }

  async remove(id: number) {
    const tag = await this.findOne(id);
    return await this.tagRepository.remove(tag);
  }
}
