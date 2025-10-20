import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Req,
  UseGuards,
  ParseIntPipe,
  ValidationPipe,
} from '@nestjs/common';
import { MovimientoService } from './movimiento.service';
import { CreateMovimientoDto } from './dto/create-movimiento.dto';
import { UpdateMovimientoDto } from './dto/update-movimiento.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/jwt-auth/roles.guard';
import { Roles } from 'src/auth/decorator/roles.decorator';
import { TipoCategoria } from '../categoria/entity/categoria.entity';

@Controller('movimientos')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MovimientoController {
  constructor(private readonly movimientoService: MovimientoService) {}

  @Post()
  @Roles('admin', 'usuario')
  create(@Body(new ValidationPipe()) createMovimientoDto: CreateMovimientoDto, @Req() req) {
    return this.movimientoService.create(createMovimientoDto, req.user);
  }

  @Get()
  @Roles('admin', 'usuario')
  findAll(
    @Req() req,
    @Query('tag') tag?: string,
    @Query('fecha') fecha?: string,
    @Query('moneda') moneda?: string,
    @Query('tipo_categoria') tipoCategoria?: TipoCategoria,
  ) {
    return this.movimientoService.findAll(req.user, tag, fecha, moneda, tipoCategoria);
  }

  @Get(':id')
  @Roles('admin', 'usuario')
  findOne(@Param('id', ParseIntPipe) id: number, @Req() req) {
    return this.movimientoService.findOne(id, req.user);
  }

  @Patch(':id')
  @Roles('admin', 'usuario')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ValidationPipe()) updateMovimientoDto: UpdateMovimientoDto,
    @Req() req,
  ) {
    return this.movimientoService.update(id, updateMovimientoDto, req.user);
  }

  @Delete(':id')
  @Roles('admin', 'usuario')
  remove(@Param('id', ParseIntPipe) id: number, @Req() req) {
    return this.movimientoService.remove(id, req.user);
  }
}
