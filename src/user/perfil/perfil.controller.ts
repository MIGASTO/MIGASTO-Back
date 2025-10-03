import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PerfilService } from './perfil.service';
import { CreatePerfilUsuarioDto } from './dto/create-perfil-usuario.dto';
import { UpdatePerfilUsuarioDto } from './dto/update-perfil-usuario.dto';


@Controller('usuarios/:usuarioId/perfil')
export class PerfilController {
  constructor(private readonly perfilService: PerfilService) {}

  @Post()
  create(@Param('usuarioId') usuarioId: string, @Body() createPerfilDto: CreatePerfilUsuarioDto) {
    return this.perfilService.create(+usuarioId, createPerfilDto);
  }

  @Get()
  findOne(@Param('usuarioId') usuarioId: string) {
    return this.perfilService.findOne(+usuarioId);
  }

  @Patch()
  update(
    @Param('usuarioId') usuarioId: string,
    @Body() updatePerfilDto: UpdatePerfilUsuarioDto,
  ) {
    return this.perfilService.update(+usuarioId, updatePerfilDto);
  }

  @Delete()
  remove(@Param('usuarioId') usuarioId: string) {
    return this.perfilService.remove(+usuarioId);
  }
}
