import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
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

  const categoria = await this.categoriaRepo.findOne({
    where: { tipo_categoria: tipo },
  });

  if (!categoria) {
    throw new NotFoundException(`No existe la categoría '${tipo}'`);
  }

  let movimientos: Movimiento[];

  if (currentUser.rol?.nombre === 'admin') {
    movimientos = await this.movimientoRepo.find({
      where: { categoria: { id_categoria: categoria.id_categoria } },
      relations: ['usuario', 'categoria', 'moneda', 'tags'],
    });
  } else {
    movimientos = await this.movimientoRepo.find({
      where: {
        categoria: { id_categoria: categoria.id_categoria },
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
}
