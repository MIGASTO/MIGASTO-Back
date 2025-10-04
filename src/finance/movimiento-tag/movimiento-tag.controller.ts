import { Controller, Post, Delete, Get, Param, Body } from '@nestjs/common';
import { MovimientoTagService } from './movimiento-tag.service';
import { CreateMovimientoTagDto } from './dto/create-movimiento-tag.dto';

@Controller('movimientos/:id/tags')
export class MovimientoTagController {
  constructor(private readonly movimientoTagService: MovimientoTagService) {}


  @Post()
  create(
    @Param('id') id_movimiento: number,
    @Body() createDto: CreateMovimientoTagDto,
  ) {
    return this.movimientoTagService.create(+id_movimiento, createDto);
  }

  @Get()
  findAll(@Param('id') id_movimiento: number) {
    return this.movimientoTagService.findAll(+id_movimiento);
  }

  @Delete(':idTag')
  remove(
    @Param('id') id_movimiento: number,
    @Param('idTag') id_tag: number,
  ) {
    return this.movimientoTagService.remove(+id_movimiento, +id_tag);
  }
}

