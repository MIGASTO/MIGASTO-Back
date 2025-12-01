import { Controller, Post, Get, Param, Body, Delete, Patch, UseGuards, ValidationPipe } from '@nestjs/common';
import { PrestamoService } from './prestamo.service';
import { CreatePrestamoDto } from './dto/create-prestamo.dto';
import { UpdatePrestamoDto } from './dto/update-prestamo.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/jwt-auth/roles.guard';
import { Roles } from 'src/auth/decorator/roles.decorator';
import { CurrentUser } from 'src/auth/decorator/user.decorator';
import { Usuario } from 'src/user/usuario/entity/usuario.entity';

@Controller('prestamos')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PrestamoController {
  constructor(private readonly prestamoService: PrestamoService) {}

  @Post()
  @Roles('admin', 'usuario')
  create(
    @Body(new ValidationPipe()) createPrestamoDto: CreatePrestamoDto,
    @CurrentUser() user: Usuario,
  ) {
    return this.prestamoService.create(createPrestamoDto, user);
  }

  @Get()
  @Roles('admin', 'usuario')
  findAll(@CurrentUser() user: Usuario) {
    return this.prestamoService.findAll(user);
  }

  @Get('details')
  @Roles('admin', 'usuario')
  getPrestamoDetails(@CurrentUser() user: Usuario) {
    return this.prestamoService.getPrestamoDetails(user);
  }


  @Get(':id')
  @Roles('admin', 'usuario')
  findOne(@Param('id') id: string, @CurrentUser() user: Usuario) {
    return this.prestamoService.findOne(+id, user);
  }

  @Patch(':id')
  @Roles('admin', 'usuario')
  update(
    @Param('id') id: string,
    @Body(new ValidationPipe()) updatePrestamoDto: UpdatePrestamoDto,
    @CurrentUser() user: Usuario,
  ) {
    return this.prestamoService.update(+id, updatePrestamoDto, user);
  }

  @Delete(':id')
  @Roles('admin', 'usuario')
  remove(@Param('id') id: string, @CurrentUser() user: Usuario) {
    return this.prestamoService.remove(+id, user);
  }
}