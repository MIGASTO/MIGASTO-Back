import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { MonedaService } from './moneda.service';
import { CreateMonedaDto } from './dto/create-moneda.dto';
import { UpdateMonedaDto } from './dto/update-moneda.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/jwt-auth/roles.guard';
import { Roles } from 'src/auth/guards/roles.decorator';

@Controller('monedas')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MonedaController {
  constructor(private readonly monedaService: MonedaService) {}

  @Post()
  @Roles('admin')
  create(@Body() createMonedaDto: CreateMonedaDto) {
    return this.monedaService.create(createMonedaDto);
  }

  @Get()
  @Roles('admin', 'usuario')
  findAll() {
    return this.monedaService.findAll();
  }

  @Get(':id')
  @Roles('admin', 'usuario')
  findOne(@Param('id') id: string) {
    return this.monedaService.findOne(+id);
  }

  @Patch(':id')
  @Roles('admin')
  update(@Param('id') id: string, @Body() updateMonedaDto: UpdateMonedaDto) {
    return this.monedaService.update(+id, updateMonedaDto);
  }

  @Delete(':id')
  @Roles('admin')
  remove(@Param('id') id: string) {
    return this.monedaService.remove(+id);
  }
}
