import { IsNotEmpty, IsEnum, IsNumber, IsDateString, IsOptional, IsInt, IsString } from 'class-validator';

export class CreateMovimientoDto {
  @IsNotEmpty()
  @IsNumber()
  monto: number;

  @IsNotEmpty()
  @IsEnum(['ingreso', 'gasto'])
  tipo: 'ingreso' | 'gasto';

  @IsNotEmpty()
  @IsDateString()
  fecha: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsNotEmpty()
  @IsInt()
  id_usuario: number;

  @IsNotEmpty()
  @IsInt()
  id_categoria: number;

  @IsOptional()
  @IsInt()
  id_moneda?: number;
}
