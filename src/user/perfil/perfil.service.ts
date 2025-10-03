import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PerfilUsuario } from './entity/perfil_usuario.entity';
import { Usuario } from '../usuario/entity/usuario.entity';
import { CreatePerfilUsuarioDto } from './dto/create-perfil-usuario.dto';
import { UpdatePerfilUsuarioDto } from './dto/update-perfil-usuario.dto';

@Injectable()
export class PerfilService {
  constructor(
    @InjectRepository(PerfilUsuario)
    private readonly perfilRepository: Repository<PerfilUsuario>,

    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
  ) {}

  // Crear perfil para un usuario
  async create(usuarioId: number, createPerfilDto: CreatePerfilUsuarioDto) {
    const usuario = await this.usuarioRepository.findOne({ where: { id_usuario: usuarioId } });
    if (!usuario) return { message: 'Usuario no encontrado' };

    // Validar que el usuario no tenga ya un perfil
    const perfilExistente = await this.perfilRepository.findOne({
      where: { usuario: { id_usuario: usuarioId } },
    });
    if (perfilExistente) return { message: 'Este usuario ya tiene un perfil' };

    const perfil = this.perfilRepository.create({
      ...createPerfilDto,
      usuario,
    });

    await this.perfilRepository.save(perfil);
    return { message: 'Perfil creado exitosamente', data: perfil };
  }

  // Obtener perfil por usuario
  async findOne(usuarioId: number) {
    const perfil = await this.perfilRepository.findOne({
      where: { usuario: { id_usuario: usuarioId } },
      relations: ['usuario'],
    });
    if (!perfil) return { message: 'Perfil no encontrado' };
    return perfil;
  }

  // Actualizar perfil
  async update(usuarioId: number, updatePerfilDto: UpdatePerfilUsuarioDto) {
    const perfil = await this.perfilRepository.findOne({
      where: { usuario: { id_usuario: usuarioId } },
      relations: ['usuario'],
    });
    if (!perfil) return { message: 'Perfil no encontrado' };

    Object.assign(perfil, updatePerfilDto);
    await this.perfilRepository.save(perfil);
    return { message: 'Perfil actualizado exitosamente', data: perfil };
  }

  // Eliminar perfil
  async remove(usuarioId: number) {
    const perfil = await this.perfilRepository.findOne({
      where: { usuario: { id_usuario: usuarioId } },
    });
    if (!perfil) return { message: 'Perfil no encontrado' };

    await this.perfilRepository.remove(perfil);
    return { message: 'Perfil eliminado correctamente' };
  }
}
