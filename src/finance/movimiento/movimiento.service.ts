import { Injectable, NotFoundException, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Movimiento } from './entity/movimiento.entity';
import { CreateMovimientoDto } from './dto/create-movimiento.dto';
import { UpdateMovimientoDto } from './dto/update-movimiento.dto';
import { Usuario } from 'src/user/usuario/entity/usuario.entity';
import { Categoria, TipoCategoria } from '../categoria/entity/categoria.entity';
import { Moneda } from '../moneda/entity/moneda.entity';
import { Tag } from '../tag/entity/tag.entity';

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

  async create(createMovimientoDto: CreateMovimientoDto, user: Usuario): Promise<Movimiento> {
    const { id_categoria, id_moneda, id_tag } = createMovimientoDto;

    try {
      const categoria = await this.categoriaRepo.findOne({ where: { id_categoria } });
      if (!categoria) {
        throw new NotFoundException(`Categoría con ID ${id_categoria} no encontrada.`);
      }

      const movimiento = this.movimientoRepo.create({
        ...createMovimientoDto,
        usuario: user,
        categoria,
      });

      if (id_moneda) {
        const moneda = await this.monedaRepo.findOne({ where: { id_moneda } });
        if (!moneda) {
          throw new NotFoundException(`Moneda con ID ${id_moneda} no encontrada.`);
        }
        movimiento.moneda = moneda;
      }

      if (id_tag) {
        const tag = await this.tagRepo.findOne({ where: { id_tag } });
        if (!tag) {
          throw new NotFoundException(`Tag con ID ${id_tag} no encontrado.`);
        }
        movimiento.tags = [tag];
      }

      return await this.movimientoRepo.save(movimiento);
    } catch (error) {
      throw new BadRequestException(`Error al crear el movimiento: ${error.message}`);
    }
  }

  async findAll(
    user: Usuario,
    tag?: string,
    fecha?: string,
    moneda?: string,
    tipoCategoria?: TipoCategoria,
  ): Promise<Movimiento[]> {
    try {
      const query = this.movimientoRepo.createQueryBuilder('movimiento')
        .leftJoinAndSelect('movimiento.usuario', 'usuario')
        .leftJoinAndSelect('movimiento.categoria', 'categoria')
        .leftJoinAndSelect('movimiento.moneda', 'moneda')
        .leftJoinAndSelect('movimiento.tags', 'tags');

      if (user.rol.nombre !== 'admin') {
        query.where('movimiento.id_usuario = :id_usuario', { id_usuario: user.id_usuario });
      }

      if (tag) {
        query.andWhere('tags.nombre_tag = :tag', { tag });
      }

      if (fecha) {
        query.andWhere('movimiento.fecha = :fecha', { fecha });
      }

      if (moneda) {
        query.andWhere('moneda.nombre_moneda = :moneda', { moneda });
      }

      if (tipoCategoria) {
        query.andWhere('categoria.tipo_categoria = :tipoCategoria', { tipoCategoria });
      }

      return await query.getMany();
    } catch (error) {
      throw new BadRequestException(`Error al buscar movimientos: ${error.message}`);
    }
  }

  async findOne(id_movimiento: number, user: Usuario): Promise<Movimiento> {
    try {
      const movimiento = await this.movimientoRepo.findOne({
        where: { id_movimiento },
        relations: ['usuario', 'categoria', 'moneda', 'tags'],
      });

      if (!movimiento) {
        throw new NotFoundException(`Movimiento con ID ${id_movimiento} no encontrado.`);
      }

      if (user.rol.nombre !== 'admin' && movimiento.usuario.id_usuario !== user.id_usuario) {
        throw new UnauthorizedException('No tienes permiso para acceder a este movimiento.');
      }

      return movimiento;
    } catch (error) {
      throw new BadRequestException(`Error al buscar el movimiento: ${error.message}`);
    }
  }

  async update(id_movimiento: number, updateMovimientoDto: UpdateMovimientoDto, user: Usuario): Promise<Movimiento> {
    const { id_categoria, id_moneda, id_tag } = updateMovimientoDto;

    try {
      const movimiento = await this.findOne(id_movimiento, user);

      if (id_categoria) {
        const categoria = await this.categoriaRepo.findOne({ where: { id_categoria } });
        if (!categoria) {
          throw new NotFoundException(`Categoría con ID ${id_categoria} no encontrada.`);
        }
        movimiento.categoria = categoria;
      }

      if (id_moneda) {
        const moneda = await this.monedaRepo.findOne({ where: { id_moneda } });
        if (!moneda) {
          throw new NotFoundException(`Moneda con ID ${id_moneda} no encontrada.`);
        }
        movimiento.moneda = moneda;
      }

      if (id_tag) {
        const tag = await this.tagRepo.findOne({ where: { id_tag } });
        if (!tag) {
          throw new NotFoundException(`Tag con ID ${id_tag} no encontrado.`);
        }
        movimiento.tags = [tag];
      }

      Object.assign(movimiento, updateMovimientoDto);
      return await this.movimientoRepo.save(movimiento);
    } catch (error) {
      throw new BadRequestException(`Error al actualizar el movimiento: ${error.message}`);
    }
  }

  async remove(id_movimiento: number, user: Usuario): Promise<void> {
    try {
      const movimiento = await this.findOne(id_movimiento, user);
      await this.movimientoRepo.remove(movimiento);
    } catch (error) {
      throw new BadRequestException(`Error al eliminar el movimiento: ${error.message}`);
    }
  }
}
