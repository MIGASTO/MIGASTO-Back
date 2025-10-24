import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Categoria } from './entity/categoria.entity';
import { CreateCategoriaDto } from './dto/create-categoria.dto';
import { UpdateCategoriaDto } from './dto/update-categoria.dto';

@Injectable()
export class CategoriaService {
  constructor(
    @InjectRepository(Categoria)
    private readonly categoriaRepository: Repository<Categoria>,
  ) {}

  async create(createCategoriaDto: CreateCategoriaDto): Promise<Categoria> {
    try {
      const categoria = this.categoriaRepository.create(createCategoriaDto);
      return await this.categoriaRepository.save(categoria);
    } catch (error) {
      throw new InternalServerErrorException('Error al crear la categoría');
    }
  }

  async findAll(): Promise<Categoria[]> {
    try {
      return await this.categoriaRepository.find();
    } catch (error) {
      throw new InternalServerErrorException('Error al obtener las categorías');
    }
  }

  async findOne(id: number): Promise<Categoria> {
    try {
      const categoria = await this.categoriaRepository.findOne({ where: { id_categoria: id } });
      if (!categoria) {
        throw new NotFoundException(`Categoría con ID ${id} no encontrada`);
      }
      return categoria;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al obtener la categoría');
    }
  }

  async update(id: number, updateCategoriaDto: UpdateCategoriaDto): Promise<Categoria> {
    try {
      const categoria = await this.findOne(id);
      this.categoriaRepository.merge(categoria, updateCategoriaDto);
      return await this.categoriaRepository.save(categoria);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al actualizar la categoría');
    }
  }

  async remove(id: number): Promise<void> {
    try {
      const result = await this.categoriaRepository.delete(id);
      if (result.affected === 0) {
        throw new NotFoundException(`Categoría con ID ${id} no encontrada`);
      }
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al eliminar la categoría');
    }
  }
}
