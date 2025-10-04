import { Injectable, NotFoundException } from '@nestjs/common';
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

  async create(createCategoriaDto: CreateCategoriaDto) {
    const categoria = this.categoriaRepository.create(createCategoriaDto);
    await this.categoriaRepository.save(categoria);
    return { message: 'Categoría creada', data: categoria };
  }

  async findAll() {
    const categorias = await this.categoriaRepository.find();
    return { message: 'Lista de categorías', data: categorias };
  }

  async findOne(id: number) {
    const categoria = await this.categoriaRepository.findOne({ where: { id_categoria: id } });
    if (!categoria) throw new NotFoundException(`Categoría con id ${id} no encontrada`);
    return categoria;
  }

  async update(id: number, updateCategoriaDto: UpdateCategoriaDto) {
    const categoria = await this.categoriaRepository.findOne({ where: { id_categoria: id } });
    if (!categoria) throw new NotFoundException(`Categoría con id ${id} no encontrada`);

    Object.assign(categoria, updateCategoriaDto);
    await this.categoriaRepository.save(categoria);

    return { message: 'Categoría actualizada', data: categoria };
  }

  async remove(id: number) {
    const categoria = await this.categoriaRepository.findOne({ where: { id_categoria: id } });
    if (!categoria) throw new NotFoundException(`Categoría con id ${id} no encontrada`);

    await this.categoriaRepository.remove(categoria);
    return { message: 'Categoría eliminada' };
  }
}
