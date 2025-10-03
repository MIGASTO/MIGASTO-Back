import { Module } from '@nestjs/common';
import { PerfilController } from './perfil.controller';
import { PerfilService } from './perfil.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PerfilUsuario } from './entity/perfil_usuario.entity';
import { Usuario } from '../usuario/entity/usuario.entity';


@Module({
  imports: [TypeOrmModule.forFeature([PerfilUsuario, Usuario])],
  controllers: [PerfilController],
  providers: [PerfilService]
})
export class PerfilUsuarioModule {}
