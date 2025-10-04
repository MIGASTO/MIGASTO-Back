import { Module } from '@nestjs/common';
import { MovimientoTagController } from './movimiento-tag.controller';
import { MovimientoTagService } from './movimiento-tag.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MovimientoTag } from './entity/movimiento_tag.entity';
import { Movimiento } from '../movimiento/entity/movimiento.entity';
import { Tag } from '../tag/entity/tag.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MovimientoTag, Movimiento, Tag])],
  controllers: [MovimientoTagController],
  providers: [MovimientoTagService]
})
export class MovimientoTagModule {}
