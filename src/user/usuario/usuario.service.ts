import { Injectable } from '@nestjs/common';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/Update-usuario.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Usuario } from './entity/usuario.entity';
import { Repository } from 'typeorm';
import { Rol } from '../rol/entity/rol.entity';


@Injectable()
export class UsuarioService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,

    @InjectRepository(Rol)
    private readonly rolRepository: Repository<Rol>,
  ) {}

  // Crear usuario
  async create(createUsuarioDto: CreateUsuarioDto) {
    const rol = await this.rolRepository.findOne({ where: { id: createUsuarioDto.rolId } });

    if (!rol) {
      return { message: 'Rol no encontrado' };
    }

    const usuario = this.usuarioRepository.create({
      email: createUsuarioDto.email,
      password: createUsuarioDto.password,
      rol: rol,
    });

    await this.usuarioRepository.save(usuario);

    return { message: 'Usuario creado exitosamente', data: usuario };
  }

  // Listar todos
  async findAll() {
    return this.usuarioRepository.find({
      relations: ['rol', 'perfil', 'movimientos', 'presupuestos', 'notificaciones'],
    });
  }

  // Buscar uno
  async findOne(id: number) {
    return this.usuarioRepository.findOne({
      where: { id_usuario: id },
      relations: ['rol', 'perfil'],
    });
  }

  // Actualizar
  async update(id: number, updateUsuarioDto: UpdateUsuarioDto) {
    const usuario = await this.usuarioRepository.findOne({ where: { id_usuario: id } });
    if (!usuario) return { message: 'Usuario no encontrado' };

    Object.assign(usuario, updateUsuarioDto);
    return this.usuarioRepository.save(usuario);
  }

  // Eliminar
  async remove(id: number) {
    const usuario = await this.usuarioRepository.findOne({ where: { id_usuario: id } });
    if (!usuario) return { message: 'Usuario no encontrado' };

    await this.usuarioRepository.remove(usuario);
    return { message: 'Usuario eliminado correctamente' };
  }
}
