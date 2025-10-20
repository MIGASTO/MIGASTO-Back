import { Controller, Get, Post, Body, Param, Delete, UseGuards } from '@nestjs/common';
import { CategoriaService } from './categoria.service';
import { CreateCategoriaDto } from './dto/create-categoria.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/jwt-auth/roles.guard';
import { Roles } from 'src/auth/guards/roles.decorator';
import { TipoCategoria } from './entity/categoria.entity';

@Controller('categorias')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CategoriaController {
  constructor(private readonly categoriaService: CategoriaService) {}

  @Roles('admin')
  @Post()
  create(@Body() createCategoriaDto: CreateCategoriaDto) {
    return this.categoriaService.create(createCategoriaDto);
  }

  @Roles('admin', 'usuario')
  @Get()
  findAll() {
    return this.categoriaService.findAll();
  }

  @Roles('admin', 'usuario')
  @Get('tipo/:tipo')
  findByTipo(@Param('tipo') tipo: TipoCategoria) {
    return this.categoriaService.findByTipo(tipo);
  }

  @Roles('admin')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.categoriaService.remove(+id);
  }
}
