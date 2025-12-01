import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { Usuario } from './entity/usuario.entity';
import { Rol } from '../rol/entity/rol.entity';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/Update-usuario.dto';

@Injectable()
export class UsuarioService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
    @InjectRepository(Rol)
    private readonly rolRepository: Repository<Rol>,
  ) {}

  async create(createUsuarioDto: CreateUsuarioDto) {
    const rol = await this.rolRepository.findOne({ where: { id: createUsuarioDto.rolId } });
    if (!rol) throw new BadRequestException('Rol no encontrado');
    const hashedPassword = await bcrypt.hash(createUsuarioDto.password, 10);

    const usuario = this.usuarioRepository.create({
      email: createUsuarioDto.email,
      password: hashedPassword,
      rol: rol,
    });

    await this.usuarioRepository.save(usuario);
    const { password, ...result } = usuario;
    return { message: 'Usuario creado', user: result };
  }

  async findAll() {
    const usuarios = await this.usuarioRepository.find({
      relations: ['rol', 'perfil'],
      select: {
        id_usuario: true,
        email: true,
        rol: {
          id: true,
          nombre: true
        },
        perfil: {
          nombre_completo: true,
          foto_perfil: true,
          telefono: true,
          edad: true
        }
      }
    });
    return usuarios;
  }


  async findOne(id: number) {
    const usuario = await this.usuarioRepository.findOne({
      where: { id_usuario: id },
      relations: ['rol', 'perfil'],
      select: {
        id_usuario: true,
        email: true,
        rol: { id: true, nombre: true },
        perfil: { nombre_completo: true, edad: true, foto_perfil: true, telefono: true }
      }
    });

    if (!usuario) throw new NotFoundException('Usuario no encontrado');
    return usuario;
  }


  async update(id: number, updateUsuarioDto: UpdateUsuarioDto) {
    const usuario = await this.usuarioRepository.findOne({ 
        where: { id_usuario: id },
        relations: ['rol'] 
    });
    
    if (!usuario) throw new NotFoundException('Usuario no encontrado');

    // 2. Si viene password, la encriptamos
    if (updateUsuarioDto.password) {
      usuario.password = await bcrypt.hash(updateUsuarioDto.password, 10);
    }


    if (updateUsuarioDto.email) {
      if (!updateUsuarioDto.email.includes('@')) {
        throw new BadRequestException('Email inválido');
      }
      if(usuario.email !== updateUsuarioDto.email) {
        const emailExistente = await this.usuarioRepository.findOne({ where: { email: updateUsuarioDto.email } });
        if (emailExistente) {
          throw new BadRequestException('El email ya está en uso por otro usuario');
        }
      usuario.email = updateUsuarioDto.email;
    }
  }


    if (updateUsuarioDto.rolId) {
      const nuevoRol = await this.rolRepository.findOne({ where: { id: updateUsuarioDto.rolId } });
      if (!nuevoRol) throw new BadRequestException('El Rol especificado no existe');
      usuario.rol = nuevoRol; 
    }

    await this.usuarioRepository.save(usuario);
    return {
      message: 'Usuario actualizado correctamente',
      usuario: {
        id: usuario.id_usuario,
        email: usuario.email,
        rol: usuario.rol.nombre
      }
    };
  }


  async remove(id: number) {
    const usuario = await this.usuarioRepository.findOne({ where: { id_usuario: id } });
    if (!usuario) throw new NotFoundException('Usuario no encontrado');

    await this.usuarioRepository.remove(usuario);
    return { message: 'Usuario eliminado correctamente' };
  }
}