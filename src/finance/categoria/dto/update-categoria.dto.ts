import { PartialType } from '@nestjs/mapped-types';
import { CreateCategoriaDto } from './create-categoria.dto';
import { IsEnum, IsOptional } from 'class-validator';
import { TipoCategoria } from '../entity/categoria.entity';

export class UpdateCategoriaDto extends PartialType(CreateCategoriaDto) {
  @IsOptional()
  @IsEnum(TipoCategoria, { message: 'El tipo debe ser INGRESO o GASTO' })
  tipo_categoria?: TipoCategoria;
}
