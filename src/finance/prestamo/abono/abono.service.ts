import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Abono } from './entity/abono.entity';
import { CreateAbonoDto } from './dto/create-abono.dto';
import { UpdateAbonoDto } from './dto/update-abono.dto';
import { Usuario } from 'src/user/usuario/entity/usuario.entity';
import { Prestamo } from '../prestamos/entity/prestamo.entity';

@Injectable()
export class AbonoService {
  constructor(
    @InjectRepository(Abono)
    private readonly abonoRepo: Repository<Abono>,
    @InjectRepository(Prestamo)
    private readonly prestamoRepo: Repository<Prestamo>,
  ) {}

  async findAll(user: Usuario): Promise<Abono[] | string> {
    const whereCondition = user.rol?.nombre === 'admin'
      ? {}
      : { prestamo: { usuario: { id_usuario: user.id_usuario } } };
    const abonos = await this.abonoRepo.find({
      where: whereCondition,
      relations: ['prestamo'],
      order: { fecha_creacion: 'DESC' },
      loadEagerRelations: false 
    });

    if (!abonos || abonos.length === 0) {
      return "No hay abonos registrados";
    }
    return abonos;
  }

  async findOne(id_abono: number, user: Usuario): Promise<Abono> {
    const abono = await this.abonoRepo.findOne({
      where: { id_abono },
      relations: ['prestamo', 'prestamo.usuario'],
      loadEagerRelations: false 
    });

    if (!abono) {
      throw new NotFoundException('Abono no encontrado');
    }

    const isAdmin = user.rol?.nombre === 'admin';

    if (!isAdmin && abono.prestamo.usuario.id_usuario !== user.id_usuario) {
       throw new NotFoundException('Abono no encontrado o sin permisos');
    }
    abono.prestamo.usuario = undefined as any; 
    return abono;
  }



  async create(id_prestamo: number, createAbonoDto: CreateAbonoDto, user: Usuario): Promise<String> {
    const whereCondition = user.rol?.nombre === 'admin'
        ? { id_prestamo }
        : { id_prestamo, usuario: { id_usuario: user.id_usuario } };
    const prestamo = await this.prestamoRepo.findOne({ 
        where: whereCondition 
    });

    if (!prestamo) throw new NotFoundException('Préstamo no encontrado');

    const montoAbono = Number(createAbonoDto.monto);
    if (montoAbono <= 0) throw new BadRequestException('El monto debe ser positivo.');

    const montoPagado = Number(prestamo.monto_pagado);
    const montoTotal = Number(prestamo.monto_total);

    if (montoPagado + montoAbono > montoTotal) {
      throw new BadRequestException('El abono excede la deuda total.');
    }

    const newAbono = this.abonoRepo.create({ ...createAbonoDto, prestamo });
    await this.abonoRepo.save(newAbono);

    prestamo.monto_pagado = montoPagado + montoAbono;
    if (prestamo.monto_pagado >= montoTotal) prestamo.estado = 'pagado';
    
    await this.prestamoRepo.save(prestamo);
    return 'Abono agregado exitosamente';
  }

  async update(id_abono: number, updateAbonoDto: UpdateAbonoDto, user: Usuario): Promise<Abono> {
    const abono = await this.findOne(id_abono, user);
    const prestamo = abono.prestamo;

    if (updateAbonoDto.monto) {
      const diff = Number(updateAbonoDto.monto) - Number(abono.monto);
      const nuevoTotal = Number(prestamo.monto_pagado) + diff;

      if (nuevoTotal > Number(prestamo.monto_total)) {
        throw new BadRequestException('El monto excede la deuda total.');
      }

      prestamo.monto_pagado = nuevoTotal;
      abono.monto = updateAbonoDto.monto;
    }

    prestamo.estado = (Number(prestamo.monto_pagado) < Number(prestamo.monto_total)) 
      ? 'pendiente' : 'pagado';

    await this.prestamoRepo.save(prestamo);
    return await this.abonoRepo.save(abono);
  }

  async remove(id_abono: number, user: Usuario): Promise<string> {
    const abono = await this.findOne(id_abono, user);
    const prestamo = abono.prestamo;

    prestamo.monto_pagado = Number(prestamo.monto_pagado) - Number(abono.monto);
    
    if (Number(prestamo.monto_pagado) < Number(prestamo.monto_total)) {
      prestamo.estado = 'pendiente';
    }

    await this.prestamoRepo.save(prestamo);
    await this.abonoRepo.remove(abono);
    return 'Abono eliminado';
  }
}