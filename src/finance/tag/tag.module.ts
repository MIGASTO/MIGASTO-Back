import { Module } from '@nestjs/common';
import { TagController } from './tag.controller';
import { TagService } from './tag.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tag } from './entity/tag.entity';
import { MovimientoTag } from '../movimiento-tag/entity/movimiento_tag.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Tag, MovimientoTag])],
  controllers: [TagController],
  providers: [TagService]
})
export class TagModule {}
