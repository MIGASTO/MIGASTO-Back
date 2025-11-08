import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  ValidationPipe,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { MovimientoService } from './movimiento.service';
import { CreateMovimientoDto } from './dto/create-movimiento.dto';
import { UpdateMovimientoDto } from './dto/update-movimiento.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/jwt-auth/roles.guard';
import { Roles } from 'src/auth/decorator/roles.decorator';
import { CurrentUser } from 'src/auth/decorator/user.decorator';
import { Usuario } from 'src/user/usuario/entity/usuario.entity';

@Controller('movimientos')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MovimientoController {
  constructor(private readonly movimientoService: MovimientoService) {}


  @Post()
  @Roles('admin', 'usuario')
  create(
    @Body(new ValidationPipe()) createMovimientoDto: CreateMovimientoDto,
    @CurrentUser() user: Usuario,
  ) {
    return this.movimientoService.create(createMovimientoDto, user);
  }

  @Get()
  @Roles('admin', 'usuario')
  findAll(@CurrentUser() user: Usuario) {
    return this.movimientoService.findAll(user);
  }

  @Get('ingresos')
  @Roles('admin', 'usuario')
  findIngresos(@CurrentUser() user: Usuario) {
    return this.movimientoService.findByCategoriaTipo('ingreso', user);
  }

  @Get('gastos')
  @Roles('admin', 'usuario')
  findGastos(@CurrentUser() user: Usuario) {
    return this.movimientoService.findByCategoriaTipo('gasto', user);
  }

  @Get('balance')
  @Roles('admin', 'usuario')
  obtenerBalance(
  @CurrentUser() user: Usuario,
  @Query('mes') mes?: number,
  @Query('anio') anio?: number,
  ) {
  return this.movimientoService.obtenerBalance(user, mes ? Number(mes) : undefined, anio ? Number(anio) : undefined)
  }

  @Get('balance/historial/:anio')
  @Roles('admin', 'usuario')
  obtenerHistorialBalance(
  @CurrentUser() user: Usuario,
  @Param('anio', ParseIntPipe) anio: number,
  ) {
  return this.movimientoService.obtenerHistorialBalance(user, anio);
  }


  @Get(':id')
  @Roles('admin', 'usuario')
  findById(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: Usuario,
  ) {
    return this.movimientoService.findId(id, user);
  }


  @Patch(':id')
  @Roles('admin', 'usuario')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ValidationPipe({ whitelist: true })) updateMovimientoDto: UpdateMovimientoDto,
    @CurrentUser() user: Usuario,
  ) {
    return this.movimientoService.update(id, updateMovimientoDto, user);
  }

 
  @Delete(':id')
  @Roles('admin', 'usuario')
  remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: Usuario,
  ) {
    return this.movimientoService.delete(id, user);
  }
}
