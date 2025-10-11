import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { MovimientoService } from './movimiento.service';
import { CreateMovimientoDto } from './dto/create-movimiento.dto';
import { UpdateMovimientoDto } from './dto/update-movimiento.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/jwt-auth/roles.guard';
import { Roles } from 'src/auth/guards/roles.decorator';

@Controller('movimientos')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MovimientoController {
  constructor(private readonly movimientoService: MovimientoService) {}

  @Post()
  @Roles('admin', 'usuario')
  create(@Body() createMovimientoDto: CreateMovimientoDto) {
    return this.movimientoService.create(createMovimientoDto);
  }

  @Get()
  @Roles('admin', 'usuario')
  findAll(
    @Query('id_usuario') id_usuario?: number,
    @Query('mes') mes?: number,
    @Query('anio') anio?: number,
    @Query('id_categoria') id_categoria?: number,
  ) {
    return this.movimientoService.findAll({ id_usuario, mes, anio, id_categoria });
  }

  @Get(':id')
  @Roles('admin', 'usuario')
  findOne(@Param('id') id: string) {
    return this.movimientoService.findOne(+id);
  }

  @Patch(':id')
  @Roles('admin', 'usuario')
  update(@Param('id') id: string, @Body() updateMovimientoDto: UpdateMovimientoDto) {
    return this.movimientoService.update(+id, updateMovimientoDto);
  }

  @Delete(':id')
  @Roles('admin', 'usuario')
  remove(@Param('id') id: string) {
    return this.movimientoService.remove(+id);
  }
}
