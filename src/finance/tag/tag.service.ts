import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Tag } from './entity/tag.entity';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { Usuario } from 'src/user/usuario/entity/usuario.entity';

@Injectable()
export class TagService {
  constructor(
    @InjectRepository(Tag)
    private readonly tagRepository: Repository<Tag>,
  ) {}

  async create(createTagDto: CreateTagDto, user: Usuario): Promise<{ id_tag: number; nombre: string }> {
    try {
      const isAdmin = user.rol?.nombre === 'admin';
      const whereCondition = isAdmin 
        ? { nombre: createTagDto.nombre, usuario: IsNull() }
        : { nombre: createTagDto.nombre, usuario: { id_usuario: user.id_usuario } };

      const existingTag = await this.tagRepository.findOne({ 
        where: whereCondition 
      });

      if (existingTag) {
        throw new BadRequestException(`Ya tienes un tag llamado "${createTagDto.nombre}".`);
      }


      const newTag = this.tagRepository.create({
        ...createTagDto,
        usuario: isAdmin ? undefined : user 
      });

      const savedTag = await this.tagRepository.save(newTag);
      return {
        id_tag: savedTag.id_tag,
        nombre: savedTag.nombre,
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async findAll(user: Usuario): Promise<Tag[]> {
    try {

      const tags = await this.tagRepository.find({
        where: [
          { usuario: IsNull() },                       
          { usuario: { id_usuario: user.id_usuario } } 
        ],
        order: { nombre: 'ASC' }
      });

      if (!tags.length) {

        return []; 
      }
      return tags;
    } catch (error) {
      throw new BadRequestException(`Error al buscar los tags: ${error.message}`);
    }
  }

  private async findTagById(id_tag: number, user: Usuario): Promise<Tag> {
    const tag = await this.tagRepository.findOne({ 
      where: { id_tag },
      relations: ['usuario'] ,
      loadEagerRelations: false 
    });

    if (!tag) {
      throw new NotFoundException(`Tag no encontrado.`);
    }

    const isGlobal = tag.usuario === null;
    const isMine = tag.usuario?.id_usuario === user.id_usuario;

    if (!isGlobal && !isMine) {
      throw new NotFoundException(`Tag no encontrado.`); 
    }
    return tag;
  }
  
  async findOne(id_tag: number, user: Usuario): Promise<{ id_tag: number; nombre: string }> {
    const tag = await this.findTagById(id_tag, user);
    return {
      id_tag: tag.id_tag,
      nombre: tag.nombre,
    };
  }

  async update(id_tag: number, updateTagDto: UpdateTagDto, user: Usuario): Promise<{ id_tag: number; nombre: string }> {
    const tag = await this.findTagById(id_tag, user); 
    const isAdmin = user.rol?.nombre === 'admin';
    const isGlobal = tag.usuario === null;

    if (isGlobal && !isAdmin) {
      throw new ForbiddenException('No puedes editar un tag global.');
    }

    if (!isGlobal && tag.usuario.id_usuario !== user.id_usuario) {
       throw new ForbiddenException('No puedes editar tags de otros usuarios.');
    }


    if (updateTagDto.nombre) {
      const whereCondition = isGlobal 
        ? { nombre: updateTagDto.nombre, usuario: IsNull() }
        : { nombre: updateTagDto.nombre, usuario: { id_usuario: user.id_usuario } };

      const duplicate = await this.tagRepository.findOne({ where: whereCondition });
      
      if (duplicate && duplicate.id_tag !== id_tag) {
        throw new BadRequestException(`Ya existe un tag con el nombre "${updateTagDto.nombre}".`);
      }
    }

    this.tagRepository.merge(tag, updateTagDto);
    const updatedTag = await this.tagRepository.save(tag);
    return {
      id_tag: updatedTag.id_tag,
      nombre: updatedTag.nombre,
    };
  }

  async remove(id_tag: number, user: Usuario): Promise<{ message: string }> {
    const tag = await this.findTagById(id_tag, user);
    const isAdmin = user.rol?.nombre === 'admin';
    const isGlobal = tag.usuario === null;

    if (isGlobal && !isAdmin) {
      throw new ForbiddenException('No puedes eliminar un tag global.');
    }

    if (!isGlobal && tag.usuario.id_usuario !== user.id_usuario) {
       throw new ForbiddenException('No puedes eliminar tags de otros usuarios.');
    }

    await this.tagRepository.remove(tag);
    return { message: "Tag eliminado correctamente" };
  }
}
