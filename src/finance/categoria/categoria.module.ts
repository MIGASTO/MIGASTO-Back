import { Module } from '@nestjs/common';
import { CategoriaController } from './categoria.controller';
import { CategoriaService } from './categoria.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Categoria } from './entity/categoria.entity';
import { Movimiento } from '../movimiento/entity/movimiento.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Categoria, Movimiento])],
  controllers: [CategoriaController],
  providers: [CategoriaService]
})
export class CategoriaModule {}
