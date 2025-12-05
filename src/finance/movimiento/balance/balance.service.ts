import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Movimiento } from '../movimiento/entity/movimiento.entity';
import { Usuario } from 'src/user/usuario/entity/usuario.entity';

@Injectable()
export class BalanceService {
  constructor(
    @InjectRepository(Movimiento)
    private readonly movimientoRepo: Repository<Movimiento>,
    @InjectRepository(Usuario)
    private readonly usuarioRepo: Repository<Usuario>,
  ) {}

  async obtenerBalance(user: Usuario, mes?: number, anio?: number) {
    const currentUser = await this.usuarioRepo.findOne({
      where: { id_usuario: user.id_usuario },
      relations: ['rol'],
    });

    if (!currentUser) {
      throw new NotFoundException(`Usuario con ID ${user.id_usuario} no encontrado`);
    }

    const where: any = {};
    if (currentUser.rol?.nombre !== 'admin') {
      where.usuario = { id_usuario: currentUser.id_usuario };
    }

    if (mes && anio) {
      const inicioMes = new Date(anio, mes - 1, 1);
      const finMes = new Date(anio, mes, 0);
      where.fecha = Between(inicioMes, finMes);
    } else if (anio) {
      where.fecha = Between(new Date(anio, 0, 1), new Date(anio, 11, 31));
    }

    const movimientos = await this.movimientoRepo.find({
      where,
      relations: ['categoria'],
    });

    const mesesNombre = [
      'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
      'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
    ];

    if (!movimientos || movimientos.length === 0) {
      if (mes && anio) {
        throw new NotFoundException(`No existen movimientos registrados en ${mesesNombre[mes - 1]} de ${anio}.`);
      } else if (anio) {
        throw new NotFoundException(`No existen movimientos registrados en el año ${anio}.`);
      } else {
        throw new NotFoundException('No existen movimientos registrados.');
      }
    }

    let totalGastos = 0;
    let totalIngresos = 0;

    for (const mov of movimientos) {
      if (mov.categoria?.tipo_categoria === 'gasto') {
        totalGastos += Number(mov.monto);
      } else if (mov.categoria?.tipo_categoria === 'ingreso') {
        totalIngresos += Number(mov.monto);
      }
    }

    const balance = totalIngresos - totalGastos;

    return {
      totalGastos,
      totalIngresos,
      balance,
      resumen: balance >= 0 ? 'Saldo positivo' : 'Saldo negativo',
      filtrosAplicados: {
        mes: mes ? mesesNombre[mes - 1] : 'Todos',
        anio: anio ?? 'Todos',
      },
      rango: {
        desde: movimientos[0].fecha,
        hasta: movimientos[movimientos.length - 1].fecha,
      },
    };
  }

  async obtenerHistorialBalance(user: Usuario, anio: number) {
    const currentUser = await this.usuarioRepo.findOne({
      where: { id_usuario: user.id_usuario },
      relations: ['rol'],
    });

    if (!currentUser) throw new NotFoundException(`Usuario con ID ${user.id_usuario} no encontrado`);

    const where: any = {};
    if (currentUser.rol?.nombre !== 'admin') {
      where.usuario = { id_usuario: currentUser.id_usuario };
    }

    where.fecha = Between(new Date(anio, 0, 1), new Date(anio, 11, 31));

    const movimientos = await this.movimientoRepo.find({
      where,
      relations: ['categoria'],
    });

    if (!movimientos || movimientos.length === 0) {
      throw new NotFoundException(`No hay movimientos registrados en el año ${anio}`);
    }

    const historialMap = new Map<number, { mes: number; totalIngresos: number; totalGastos: number; balance: number }>();

    for (const mov of movimientos) {
      const mes = new Date(mov.fecha).getMonth() + 1;
      if (!historialMap.has(mes)) {
        historialMap.set(mes, { mes, totalIngresos: 0, totalGastos: 0, balance: 0 });
      }

      const registro = historialMap.get(mes)!;
      if (mov.categoria?.tipo_categoria === 'gasto') {
        registro.totalGastos += Number(mov.monto);
      } else if (mov.categoria?.tipo_categoria === 'ingreso') {
        registro.totalIngresos += Number(mov.monto);
      }
    }

    for (const reg of historialMap.values()) {
      reg.balance = reg.totalIngresos - reg.totalGastos;
    }

    const detalleMensual = Array.from(historialMap.values()).sort((a, b) => a.mes - b.mes);
    const totalIngresos = detalleMensual.reduce((sum, h) => sum + h.totalIngresos, 0);
    const totalGastos = detalleMensual.reduce((sum, h) => sum + h.totalGastos, 0);
    const balanceAnual = totalIngresos - totalGastos;

    return {
      anio,
      totalIngresos,
      totalGastos,
      balanceAnual,
      resumen: balanceAnual >= 0 ? 'Saldo positivo' : 'Saldo negativo',
      detalleMensual,
    };
  }
}