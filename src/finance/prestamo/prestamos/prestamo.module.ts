import { Module } from '@nestjs/common';
import { PrestamoController } from './prestamo.controller';
import { PrestamoService } from './prestamo.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Usuario } from 'src/user/usuario/entity/usuario.entity';
import { Abono } from '../abono/entity/abono.entity';
import { Prestamo } from './entity/prestamo.entity';

@Module({
  controllers: [PrestamoController],
  providers: [PrestamoService],
  imports: [TypeOrmModule.forFeature([Usuario, Abono, Prestamo])],
  
})
export class PrestamoModule {}
