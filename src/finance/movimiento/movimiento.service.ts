import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between,In, Repository } from 'typeorm';
import { Movimiento } from './entity/movimiento.entity';
import { Usuario } from 'src/user/usuario/entity/usuario.entity';
import { Categoria } from '../categoria/entity/categoria.entity';
import { Moneda } from '../moneda/entity/moneda.entity';
import { Tag } from '../tag/entity/tag.entity';
import { CreateMovimientoDto } from './dto/create-movimiento.dto';
import { UpdateMovimientoDto } from './dto/update-movimiento.dto';



@Injectable()
export class MovimientoService {
  constructor(
    @InjectRepository(Movimiento)
    private readonly movimientoRepo: Repository<Movimiento>,
    @InjectRepository(Usuario)
    private readonly usuarioRepo: Repository<Usuario>,
    @InjectRepository(Categoria)
    private readonly categoriaRepo: Repository<Categoria>,
    @InjectRepository(Moneda)
    private readonly monedaRepo: Repository<Moneda>,
    @InjectRepository(Tag)
    private readonly tagRepo: Repository<Tag>,
  ) {}

  
  async create(createMovimientoDto: CreateMovimientoDto, user: Usuario) {
  const { monto, fecha, descripcion, id_categoria, id_moneda, tags, id_usuario } = createMovimientoDto;
  const currentUser = await this.usuarioRepo.findOne({
    where: { id_usuario: user.id_usuario },
    relations: ['rol'],
  });

  if (!currentUser) {
    throw new NotFoundException(`Usuario actual con ID ${user.id_usuario} no encontrado`);
  }

  let usuarioMovimiento: Usuario = currentUser;

  if (currentUser.rol?.nombre === 'admin' && id_usuario && id_usuario !== currentUser.id_usuario) {
    const userToAssign = await this.usuarioRepo.findOne({ where: { id_usuario } });
    if (!userToAssign) {
      throw new NotFoundException(`Usuario con ID ${id_usuario} no encontrado para asignar el movimiento`);
    }
    usuarioMovimiento = userToAssign;
  } else if (currentUser.rol?.nombre !== 'admin' && id_usuario && id_usuario !== currentUser.id_usuario) {
    throw new BadRequestException('No tienes permisos para asignar movimientos a otros usuarios');
  }

  const categoria = await this.categoriaRepo.findOne({ where: { id_categoria } });
  if (!categoria) {
    throw new NotFoundException(`Categoría con ID ${id_categoria} no encontrada`);
  }

  const movimiento = this.movimientoRepo.create({
    monto,
    fecha,
    descripcion,
    usuario: usuarioMovimiento,
    categoria,
  });

  if (id_moneda) {
    const moneda = await this.monedaRepo.findOne({ where: { id_moneda } });
    if (!moneda) {
      throw new NotFoundException(`Moneda con ID ${id_moneda} no encontrada`);
    }
    movimiento.moneda = moneda;
  }

  if (tags && tags.length > 0) { const tagsEntities = await this.tagRepo.find({ where: { id_tag: In(tags) } }); 
  if (tagsEntities.length !== tags.length) { 
    throw new NotFoundException('Uno o más tags no fueron encontrados'); } 
    movimiento.tags = tagsEntities; 
  }

  try {
    return await this.movimientoRepo.save(movimiento);
  } catch (error) {
    throw new BadRequestException(`Error al crear el movimiento: ${error.message}`);
  }
}



  async findAll(user: Usuario) {
    const currentUser = await this.usuarioRepo.findOne({
      where: { id_usuario: user.id_usuario },
      relations: ['rol'],
    });
    if (!currentUser) {
      throw new NotFoundException(`Usuario actual con ID ${user.id_usuario} no encontrado`);
    }

    let movimientos: Movimiento[];

    if (currentUser.rol && currentUser.rol.nombre === 'admin') {
      movimientos = await this.movimientoRepo.find({ relations: ['usuario', 'categoria', 'moneda', 'tags'] });
    } else {
      movimientos = await this.movimientoRepo.find({
        where: { usuario: { id_usuario: currentUser.id_usuario } },
        relations: ['categoria', 'moneda', 'tags'],
      });
    }

    if (!movimientos || movimientos.length === 0) {
      throw new NotFoundException(`No hay movimientos registrados para este usuario`);
    }
    return movimientos;
  }

  
  async findByCategoriaTipo(tipo: string, user: Usuario) {
    const currentUser = await this.usuarioRepo.findOne({
      where: { id_usuario: user.id_usuario },
      relations: ['rol'],
    });
  
    if (!currentUser) {
      throw new NotFoundException(`Usuario actual con ID ${user.id_usuario} no encontrado`);
    }
  
    const categorias = await this.categoriaRepo.find({
      where: { tipo_categoria: tipo },
    });
  
    if (!categorias || categorias.length === 0) {
      throw new NotFoundException(`No existen categorías del tipo '${tipo}'`);
    }
  
    const categoriaIds = categorias.map((c) => c.id_categoria);
  
    let movimientos: Movimiento[];
  
    if (currentUser.rol?.nombre === 'admin') {
      movimientos = await this.movimientoRepo.find({
        where: { categoria: { id_categoria: In(categoriaIds) } },
        relations: ['usuario', 'categoria', 'moneda', 'tags'],
      });
    } else {
      movimientos = await this.movimientoRepo.find({
        where: {
          categoria: { id_categoria: In(categoriaIds) },
          usuario: { id_usuario: currentUser.id_usuario },
        },
        relations: ['categoria', 'moneda', 'tags'],
      });
    }
  
    if (!movimientos || movimientos.length === 0) {
      throw new NotFoundException(`No hay movimientos registrados en la categoría '${tipo}'`);
    }
  
    return movimientos;
  }

  async findId(id: number, user: Usuario) {
    const currentUser = await this.usuarioRepo.findOne({
      where: { id_usuario: user.id_usuario },
      relations: ['rol'],
    });

    if (!currentUser) {
      throw new NotFoundException(`Usuario actual con ID ${user.id_usuario} no encontrado`);
    }

    const movimiento = await this.movimientoRepo.findOne({
      where: { id_movimiento: id },
      relations: ['usuario', 'categoria', 'moneda', 'tags'],
    });

    if (!movimiento) {
      throw new NotFoundException(`Movimiento con ID ${id} no encontrado`);
    }

    
    if (currentUser.rol?.nombre !== 'admin' && movimiento.usuario?.id_usuario !== currentUser.id_usuario) {
      throw new ForbiddenException('No tienes permiso para acceder a este movimiento');
    }

    return movimiento;
  }

  async findOne(id_movimiento: number) {
    const movimiento = await this.movimientoRepo.findOne({
      where: { id_movimiento },
    });
    if (!movimiento) {
      throw new NotFoundException(`Movimiento con ID ${id_movimiento} no encontrado`);
    }
    return movimiento;
  }

  
  async update(id: number, updateDto: UpdateMovimientoDto, user: Usuario) {
    const movimiento = await this.movimientoRepo.findOne({
      where: { id_movimiento: id },
      relations: ['usuario', 'categoria', 'moneda', 'tags'],
    });

    if (!movimiento) {
      throw new NotFoundException(`Movimiento con ID ${id} no encontrado`);
    }

    const currentUser = await this.usuarioRepo.findOne({
      where: { id_usuario: user.id_usuario },
      relations: ['rol'],
    });

    if (!currentUser) {
      throw new NotFoundException(`Usuario actual con ID ${user.id_usuario} no encontrado`);
    }

    if (currentUser.rol?.nombre !== 'admin' && movimiento.usuario?.id_usuario !== currentUser.id_usuario) {
      throw new ForbiddenException('No tienes permiso para actualizar este movimiento');
    }

    
    if (updateDto.monto !== undefined) movimiento.monto = updateDto.monto;
    if (updateDto.fecha !== undefined) movimiento.fecha = new Date(updateDto.fecha);
    if (updateDto.descripcion !== undefined) movimiento.descripcion = updateDto.descripcion;

    if (updateDto.id_categoria !== undefined) {
      const categoria = await this.categoriaRepo.findOne({ where: { id_categoria: updateDto.id_categoria } });
      if (!categoria) throw new NotFoundException(`Categoría con ID ${updateDto.id_categoria} no encontrada`);
      movimiento.categoria = categoria;
    }

    if (updateDto.id_moneda !== undefined) {
      if (updateDto.id_moneda === null) {
        movimiento.moneda = null;
      } else {
        const moneda = await this.monedaRepo.findOne({ where: { id_moneda: updateDto.id_moneda } });
        if (!moneda) throw new NotFoundException(`Moneda con ID ${updateDto.id_moneda} no encontrada`);
        movimiento.moneda = moneda;
      }
    }

    if (updateDto.tags !== undefined) {
      if (!updateDto.tags || updateDto.tags.length === 0) {
        movimiento.tags = [];
      } else {
        const tagsEntities = await this.tagRepo.find({ where: { id_tag: In(updateDto.tags) } });
        if (tagsEntities.length !== updateDto.tags.length) {
          throw new NotFoundException('Uno o más tags no fueron encontrados');
        }
        movimiento.tags = tagsEntities;
      }
    }

    try {
      return await this.movimientoRepo.save(movimiento);
    } catch (error) {
      throw new BadRequestException(`Error al actualizar el movimiento: ${error.message}`);
    }
  }

  
  async delete(id: number, user: Usuario) {
    const movimiento = await this.movimientoRepo.findOne({
      where: { id_movimiento: id },
      relations: ['usuario'],
    });

    if (!movimiento) {
      throw new NotFoundException(`Movimiento con ID ${id} no encontrado`);
    }

    const currentUser = await this.usuarioRepo.findOne({
      where: { id_usuario: user.id_usuario },
      relations: ['rol'],
    });

    if (!currentUser) {
      throw new NotFoundException(`Usuario actual con ID ${user.id_usuario} no encontrado`);
    }

    if (currentUser.rol?.nombre !== 'admin' && movimiento.usuario?.id_usuario !== currentUser.id_usuario) {
      throw new ForbiddenException('No tienes permiso para eliminar este movimiento');
    }

    await this.movimientoRepo.remove(movimiento);
    return { message: `Movimiento con ID ${id} eliminado correctamente` };
  }

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
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
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

  
  const respuesta = {
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

  return respuesta;
}


async obtenerHistorialBalance(user: Usuario, anio: number) {
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
    const mes = new Date(mov.fecha).getMonth() + 1; // 1–12
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


async obtenerEstadisticas(
  tipo: 'ingreso' | 'gasto',
  user: Usuario,
  mes?: number,
  anio?: number,
) {
  try {
    const currentUser = await this.usuarioRepo.findOne({
      where: { id_usuario: user.id_usuario },
      relations: ['rol']
    });

    if (!currentUser) {
      throw new NotFoundException(`Usuario con ID ${user.id_usuario} no encontrado`);
    }

    const categorias = await this.categoriaRepo.find({
      where: { tipo_categoria: tipo }
    });

    if (!categorias.length) {
      throw new NotFoundException(`No existen categorías tipo ${tipo}`);
    }

    const categoriaIds = categorias.map(c => c.id_categoria);

    const where: any = { categoria: { id_categoria: In(categoriaIds) } };

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
      relations: ['categoria', 'tags']
    });

    if (!movimientos.length) {
      let filtroTxt = '';
      if (mes && anio) filtroTxt = `en ${mes}/${anio}`;
      else if (anio) filtroTxt = `en el año ${anio}`;
      else filtroTxt = 'para las estadísticas seleccionadas';

      throw new NotFoundException(`No existen movimientos registrados ${filtroTxt}.`);
    }

    const montos = movimientos.map(m => Number(m.monto));
    const total = montos.reduce((a, b) => a + b, 0);
    const cantidad = movimientos.length;
    const promedio = total / cantidad;
    const max = Math.max(...montos);

    
    const tagMap = new Map<string, number>();
    for (const mov of movimientos) {
      if (mov.tags) {
        for (const tag of mov.tags) {
          const nombre = tag.nombre;
          tagMap.set(nombre, (tagMap.get(nombre) || 0) + Number(mov.monto));
        }
      }
    }
    const graficoTags = Array.from(tagMap.entries()).map(([tag, total]) => ({ tag, total }));

    
    const mensualMap = new Map<number, number>();
    for (const mov of movimientos) {
      const mes = new Date(mov.fecha).getMonth() + 1;
      mensualMap.set(mes, (mensualMap.get(mes) || 0) + Number(mov.monto));
    }

    const graficoMensual = Array.from(mensualMap.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([mes, total]) => ({ mes, total }));

    
    const top5 = movimientos
      .sort((a, b) => Number(b.monto) - Number(a.monto))
      .slice(0, 5)
      .map(m => ({
        descripcion: m.descripcion,
        monto: Number(m.monto)
      }));

    return {
      total,
      promedio,
      cantidad,
      max,
      graficoTags,
      graficoMensual,
      top5,
      filtrosAplicados: {
        mes: mes ?? 'Todos',
        anio: anio ?? 'Todos',
      },
    };

  } catch (error) {
    throw new BadRequestException(`Error al obtener estadísticas: ${error.message}`);
  }
}


}
