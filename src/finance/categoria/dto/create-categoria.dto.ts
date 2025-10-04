import { IsNotEmpty, IsString, IsEnum } from 'class-validator';

export class CreateCategoriaDto {
  @IsNotEmpty()
  @IsString()
  nombre_categoria: string;

  @IsNotEmpty()
  @IsEnum(['ingreso', 'gasto'])
  tipo: 'ingreso' | 'gasto';
}
