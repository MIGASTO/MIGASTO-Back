import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Moneda } from './entity/moneda.entity';
import { CreateMonedaDto } from './dto/create-moneda.dto';
import { UpdateMonedaDto } from './dto/update-moneda.dto';

@Injectable()
export class MonedaService {
  constructor(
    @InjectRepository(Moneda)
    private readonly monedaRepository: Repository<Moneda>,
  ) {}

  async create(createMonedaDto: CreateMonedaDto) {
    const moneda = this.monedaRepository.create(createMonedaDto);
    await this.monedaRepository.save(moneda);
    return { message: 'Moneda creada', data: moneda };
  }

  async findAll() {
    const monedas = await this.monedaRepository.find();
    return { message: 'Lista de monedas', data: monedas };
  }

  async findOne(id: number) {
    const moneda = await this.monedaRepository.findOne({ where: { id_moneda: id } });
    if (!moneda) throw new NotFoundException(`Moneda con id ${id} no encontrada`);
    return moneda;
  }

  async update(id: number, updateMonedaDto: UpdateMonedaDto) {
    const moneda = await this.monedaRepository.findOne({ where: { id_moneda: id } });
    if (!moneda) throw new NotFoundException(`Moneda con id ${id} no encontrada`);

    Object.assign(moneda, updateMonedaDto);
    await this.monedaRepository.save(moneda);

    return { message: 'Moneda actualizada', data: moneda };
  }

  async remove(id: number) {
    const moneda = await this.monedaRepository.findOne({ where: { id_moneda: id } });
    if (!moneda) throw new NotFoundException(`Moneda con id ${id} no encontrada`);

    await this.monedaRepository.remove(moneda);
    return { message: 'Moneda eliminada' };
  }
}
