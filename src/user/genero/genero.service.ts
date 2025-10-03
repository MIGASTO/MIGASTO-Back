import {Injectable, NotFoundException, BadRequestException} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Genero } from './entity/genero.entity';
import { CreateGeneroDto } from './dto/create-genero.dto';
import { UpdateGeneroDto } from './dto/Update-genero.dto';


@Injectable()
export class GeneroService {
  constructor(
    @InjectRepository(Genero)
    private readonly generoRepository: Repository<Genero>,
  ) {}

  async create(createGeneroDto: CreateGeneroDto): Promise<Genero> {
    const { nombre } = createGeneroDto;

    // validar duplicados
    const exists = await this.generoRepository.findOne({ where: { nombre } });
    if (exists) {
      throw new BadRequestException(`El género "${nombre}" ya existe`);
    }

    const genero = this.generoRepository.create(createGeneroDto);
    return await this.generoRepository.save(genero);
  }

  async findAll(): Promise<Genero[]> {
    return await this.generoRepository.find({
      relations: ['perfiles'], // opcional
    });
  }

  async findOne(id: number): Promise<Genero> {
    const genero = await this.generoRepository.findOne({
      where: { id_genero: id },
      relations: ['perfiles'], // opcional
    });
    if (!genero) {
      throw new NotFoundException(`Género con id ${id} no encontrado`);
    }
    return genero;
  }

  async update(id: number, updateGeneroDto: UpdateGeneroDto): Promise<Genero> {
    const genero = await this.findOne(id);

    // Validar duplicados solo si se manda nombre nuevo
    if (updateGeneroDto.nombre && updateGeneroDto.nombre !== genero.nombre) {
      const exists = await this.generoRepository.findOne({
        where: { nombre: updateGeneroDto.nombre },
      });
      if (exists) {
        throw new BadRequestException(
          `El género "${updateGeneroDto.nombre}" ya existe`,
        );
      }
    }

    Object.assign(genero, updateGeneroDto);
    return await this.generoRepository.save(genero);
  }

  async remove(id: number): Promise<void> {
    const genero = await this.findOne(id);
    await this.generoRepository.remove(genero);
  }
}
