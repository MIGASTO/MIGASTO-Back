import { IsNotEmpty, IsEnum } from 'class-validator';
import { TipoCategoria } from '../entity/categoria.entity';

export class CreateCategoriaDto {
  @IsNotEmpty()
  @IsEnum(TipoCategoria, { message: 'El tipo debe ser INGRESO o GASTO' })
  tipo_categoria: TipoCategoria;
}
