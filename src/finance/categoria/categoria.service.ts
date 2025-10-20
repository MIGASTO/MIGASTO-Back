import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Categoria, TipoCategoria } from './entity/categoria.entity';
import { CreateCategoriaDto } from './dto/create-categoria.dto';
import { UpdateCategoriaDto } from './dto/update-categoria.dto';

@Injectable()
export class CategoriaService {
  constructor(
    @InjectRepository(Categoria)
    private readonly categoriaRepository: Repository<Categoria>,
  ) {}

  async create(createCategoriaDto: CreateCategoriaDto) {
    try {
      const existe = await this.categoriaRepository.findOne({
        where: { tipo_categoria: createCategoriaDto.tipo_categoria },
      });

      if (existe)
        throw new InternalServerErrorException(
          `La categoría ${createCategoriaDto.tipo_categoria} ya existe.`,
        );

      const categoria = this.categoriaRepository.create(createCategoriaDto);
      await this.categoriaRepository.save(categoria);
      return { message: 'Categoría creada correctamente', data: categoria };
    } catch (error) {
      throw new InternalServerErrorException('Error al crear la categoría');
    }
  }

  async findAll() {
    try {
      const categorias = await this.categoriaRepository.find();
      return { message: 'Lista de categorías', data: categorias };
    } catch (error) {
      throw new InternalServerErrorException('Error al obtener las categorías');
    }
  }

  async findOne(id: number) {
    try {
      const categoria = await this.categoriaRepository.findOne({ where: { id_categoria: id } });
      if (!categoria) throw new NotFoundException(`Categoría con id ${id} no encontrada`);
      return { message: 'Categoría encontrada', data: categoria };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Error al buscar la categoría');
    }
  }

  async findByTipo(tipo: TipoCategoria) {
    try {
      const categoria = await this.categoriaRepository.findOne({
        where: { tipo_categoria: tipo },
      });
      if (!categoria) throw new NotFoundException(`Categoría tipo ${tipo} no encontrada`);
      return { message: `Categoría tipo ${tipo}`, data: categoria };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Error al filtrar categoría por tipo');
    }
  }

  async remove(id: number) {
    try {
      const categoria = await this.categoriaRepository.findOne({ where: { id_categoria: id } });
      if (!categoria) throw new NotFoundException(`Categoría con id ${id} no encontrada`);
      await this.categoriaRepository.remove(categoria);
      return { message: 'Categoría eliminada correctamente' };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Error al eliminar la categoría');
    }
  }
}
