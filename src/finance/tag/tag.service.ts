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
    try {
      const existingTag = await this.tagRepository.findOne({ where: { nombre: createTagDto.nombre } });
      if (existingTag) {
        throw new BadRequestException(`El tag "${createTagDto.nombre}" ya existe.`);
      }
      const newTag = this.tagRepository.create(createTagDto);
      return await this.tagRepository.save(newTag);
    } catch (error) {
      throw new BadRequestException(`Error al crear el tag: ${error.message}`);
    }
  }

  async findAll(): Promise<Tag[]> {
    try {
      if ((await this.tagRepository.count()) === 0) {
        throw new NotFoundException('No se encontraron tags');
      }
      return await this.tagRepository.find();
    } catch (error) {
      throw new BadRequestException(`Error al buscar los tags: ${error.message}`);
    }
  }

  async findOne(id_tag: number): Promise<Tag> {
    try {
      const tag = await this.tagRepository.findOne({ where: { id_tag } });
      if (!tag) {
        throw new NotFoundException(`Tag con ID ${id_tag} no encontrado.`);
      }
      return tag;
    } catch (error) {
      throw new BadRequestException(`Error al buscar el tag: ${error.message}`);
    }
  }

  async update(id_tag: number, updateTagDto: UpdateTagDto): Promise<Tag> {
    try {
      const tag = await this.findOne(id_tag);
      if (updateTagDto.nombre) {
        const existingTag = await this.tagRepository.findOne({ where: { nombre: updateTagDto.nombre } });
        if (existingTag && existingTag.id_tag !== id_tag) {
          throw new BadRequestException(`El tag "${updateTagDto.nombre}" ya existe.`);
        }
      }
      this.tagRepository.merge(tag, updateTagDto);
      return await this.tagRepository.save(tag);
    } catch (error) {
      throw new BadRequestException(`Error al actualizar el tag: ${error.message}`);
    }
  }

  async remove(id_tag: number): Promise<void> {
    try {
      const tag = await this.findOne(id_tag);
      await this.tagRepository.remove(tag);
    } catch (error) {
      throw new BadRequestException(`Error al eliminar el tag: ${error.message}`);
    }
  }
}
