import { Injectable, NotFoundException, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PerfilUsuario } from './entity/perfil_usuario.entity';
import { Usuario } from '../usuario/entity/usuario.entity';
import { CreatePerfilUsuarioDto } from './dto/create-perfil-usuario.dto';
import { UpdatePerfilUsuarioDto } from './dto/update-perfil-usuario.dto';
import { Genero } from '../genero/entity/genero.entity';

@Injectable()
export class PerfilService {
  constructor(
    @InjectRepository(PerfilUsuario)
    private readonly perfilRepository: Repository<PerfilUsuario>,
    @InjectRepository(Usuario)
    //private readonly usuarioRepository: Repository<Usuario>,
    @InjectRepository(Genero)
    private readonly generoRepository: Repository<Genero>,
  ) {}

  async create(createPerfilDto: CreatePerfilUsuarioDto, user: Usuario): Promise<PerfilUsuario> {
    try {
      const perfilExistente = await this.perfilRepository.findOne({
        where: { usuario: { id_usuario: user.id_usuario } },
      });
      if (perfilExistente) {
        throw new BadRequestException('Este usuario ya tiene un perfil.');
      }

      const perfil = this.perfilRepository.create({
        ...createPerfilDto,
        usuario: user,
      });

      if (createPerfilDto.id_genero) {
        const genero = await this.generoRepository.findOne({ where: { id_genero: createPerfilDto.id_genero } });
        if (!genero) {
          throw new NotFoundException(`Género con ID ${createPerfilDto.id_genero} no encontrado.`);
        }
        perfil.genero = genero;
      }

      return await this.perfilRepository.save(perfil);
    } catch (error) {
      throw new BadRequestException(`Error al crear el perfil: ${error.message}`);
    }
  }

  async findAll(): Promise<PerfilUsuario[]> {
    try {
      return await this.perfilRepository.find({ relations: ['usuario', 'genero'] });
    } catch (error) {
      throw new BadRequestException(`Error al buscar los perfiles: ${error.message}`);
    }
  }

  async findOne(id_perfil: number, user: Usuario): Promise<PerfilUsuario> {
    try {
      const perfil = await this.perfilRepository.findOne({
        where: { id_perfil },
        relations: ['usuario', 'genero'],
      });

      if (!perfil) {
        throw new NotFoundException(`Perfil con ID ${id_perfil} no encontrado.`);
      }

      if (user.rol.nombre !== 'admin' && perfil.usuario.id_usuario !== user.id_usuario) {
        throw new UnauthorizedException('No tienes permiso para acceder a este perfil.');
      }

      return perfil;
    } catch (error) {
      throw new BadRequestException(`Error al buscar el perfil: ${error.message}`);
    }
  }

  async update(id_perfil: number, updatePerfilDto: UpdatePerfilUsuarioDto, user: Usuario): Promise<PerfilUsuario> {
    try {
      const perfil = await this.findOne(id_perfil, user);

      if (updatePerfilDto.id_genero) {
        const genero = await this.generoRepository.findOne({ where: { id_genero: updatePerfilDto.id_genero } });
        if (!genero) {
          throw new NotFoundException(`Género con ID ${updatePerfilDto.id_genero} no encontrado.`);
        }
        perfil.genero = genero;
      }

      Object.assign(perfil, updatePerfilDto);
      return await this.perfilRepository.save(perfil);
    } catch (error) {
      throw new BadRequestException(`Error al actualizar el perfil: ${error.message}`);
    }
  }

  async remove(id_perfil: number, user: Usuario): Promise<void> {
    try {
      const perfil = await this.findOne(id_perfil, user);
      await this.perfilRepository.remove(perfil);
    } catch (error) {
      throw new BadRequestException(`Error al eliminar el perfil: ${error.message}`);
    }
  }
}
