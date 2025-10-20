import { Type } from 'class-transformer';
import { 
  IsNotEmpty, 
  IsNumber, 
  IsDateString, 
  IsOptional, 
  IsInt, 
  IsString, 
  Min, 
  Length 
} from 'class-validator';

export class CreateMovimientoDto {
  @IsNotEmpty({ message: 'El campo "monto" es obligatorio.' })
  @Type(() => Number)
  @IsNumber({}, { message: 'El campo "monto" debe ser un número válido.' })
  @Min(0, { message: 'El monto no puede ser negativo.' })
  monto: number;

  @IsNotEmpty({ message: 'El campo "fecha" es obligatorio.' })
  @IsDateString({}, { message: 'El campo "fecha" debe tener un formato de fecha válido (YYYY-MM-DD).' })
  fecha: string;

  @IsOptional()
  @IsString({ message: 'El campo "descripcion" debe ser una cadena de texto.' })
  @Length(3, 200, { message: 'La descripción debe tener entre 3 y 200 caracteres.' })
  descripcion?: string;

  @IsNotEmpty({ message: 'El campo "id_usuario" es obligatorio.' })
  @IsInt({ message: 'El campo "id_usuario" debe ser un número entero.' })
  id_usuario: number;

  @IsNotEmpty({ message: 'El campo "id_categoria" es obligatorio.' })
  @IsInt({ message: 'El campo "id_categoria" debe ser un número entero.' })
  id_categoria: number;

  @IsOptional()
  @IsInt({ message: 'El campo "id_moneda" debe ser un número entero.' })
  id_moneda?: number;

  @IsOptional()
  @IsInt({ message: 'El campo "id_tag" debe ser un número entero.' })
  id_tag?: number;
}
