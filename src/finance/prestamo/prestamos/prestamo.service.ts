import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Prestamo } from './entity/prestamo.entity';
import { CreatePrestamoDto } from './dto/create-prestamo.dto';
import { UpdatePrestamoDto } from './dto/update-prestamo.dto';
import { Usuario } from 'src/user/usuario/entity/usuario.entity';


@Injectable()
export class PrestamoService {
  constructor(
    @InjectRepository(Prestamo)
    private readonly prestamoRepo: Repository<Prestamo>,
    @InjectRepository(Usuario)
    private readonly usuarioRepo: Repository<Usuario>,
  ) {}


  async findAll(user: Usuario): Promise<Prestamo[] | string> {
    const whereCondition = user.rol?.nombre === 'admin'
      ? {} 
      : { usuario: { id_usuario: user.id_usuario } };
    const prestamos = await this.prestamoRepo.find({ 
      where: whereCondition,
      loadEagerRelations: false 
    });

    if (!prestamos || prestamos.length === 0) {
      return "No hay prestamos registrados";
    }
    return prestamos;
  }

  async findOne(id_prestamo: number, user: Usuario): Promise<Prestamo> {
    const whereCondition = user.rol?.nombre === 'admin'
      ? { id_prestamo }
      : { id_prestamo, usuario: { id_usuario: user.id_usuario } };
    const prestamo = await this.prestamoRepo.findOne({ 
      where: whereCondition,
      relations: ['abonos'],
      loadEagerRelations: false 
    });
    if (!prestamo) {
      throw new NotFoundException('Préstamo no encontrado');
    }
    return prestamo;
  }



async create(createPrestamoDto: CreatePrestamoDto, user: Usuario): Promise<string> {
    const isAdmin = user.rol?.nombre === 'admin';
    

    let idUsuarioDestino = user.id_usuario;

 
    if (isAdmin && createPrestamoDto.id_usuario) {
      idUsuarioDestino = createPrestamoDto.id_usuario;
    }


    const usuario = await this.usuarioRepo.findOne({ where: { id_usuario: idUsuarioDestino } });
    
    if (!usuario) {
      throw new NotFoundException(`El usuario con ID ${idUsuarioDestino} no existe.`);
    }
    
    
    const newPrestamo = this.prestamoRepo.create({
      ...createPrestamoDto,
      usuario,
    });

    await this.prestamoRepo.save(newPrestamo);
    
    return "Prestamo agregado exitosamente";
  }

  async update(id_prestamo: number, updatePrestamoDto: UpdatePrestamoDto, user: Usuario): Promise<Prestamo> {
    const prestamo = await this.findOne(id_prestamo, user);
    this.prestamoRepo.merge(prestamo, updatePrestamoDto);
    return this.prestamoRepo.save(prestamo);
  }

  async remove(id_prestamo: number, user: Usuario): Promise<string> {
    await this.findOne(id_prestamo, user);
    await this.prestamoRepo.delete(id_prestamo);
    return "Préstamo eliminado exitosamente";
  }

  async getPrestamoDetails(user: Usuario): Promise<any[]> {
    const whereCondition = user.rol?.nombre === 'admin'
      ? {} 
      : { usuario: { id_usuario: user.id_usuario } };

    const prestamos = await this.prestamoRepo.find({ where: whereCondition });
    return prestamos.map(p => ({
      prestamista: p.prestamista,
      monto_total: p.monto_total,
      monto_pagado: p.monto_pagado,
      monto_restante: (Number(p.monto_total) - Number(p.monto_pagado)),
      estado: p.estado
    }));
  }
}