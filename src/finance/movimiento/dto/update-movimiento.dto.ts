import { PartialType } from '@nestjs/mapped-types';
import { Type } from 'class-transformer';
import {
  IsOptional,
  IsNumber,
  IsDateString,
  IsInt,
  IsString,
  Min,
  Length,
  ValidateIf,
} from 'class-validator';
import { CreateMovimientoDto } from './create-movimiento.dto';

export class UpdateMovimientoDto extends PartialType(CreateMovimientoDto) {
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'El campo "monto" debe ser un número válido.' })
  @Min(0, { message: 'El monto no puede ser negativo.' })
  monto?: number;

  @IsOptional()
  @IsDateString({}, { message: 'El campo "fecha" debe tener un formato de fecha válido (YYYY-MM-DD).' })
  fecha?: string;

  @IsOptional()
  @IsString({ message: 'El campo "descripcion" debe ser una cadena de texto.' })
  @Length(3, 200, { message: 'La descripción debe tener entre 3 y 200 caracteres.' })
  descripcion?: string;

  
  @ValidateIf((o) => o.id_usuario !== undefined)
  @IsInt({ message: 'El campo "id_usuario" debe ser un número entero.' })
  id_usuario?: number;

  
  @ValidateIf((o) => o.id_categoria !== undefined)
  @IsInt({ message: 'El campo "id_categoria" debe ser un número entero.' })
  id_categoria?: number;

  
  @ValidateIf((o) => o.id_moneda !== undefined)
  @IsInt({ message: 'El campo "id_moneda" debe ser un número entero.' })
  id_moneda?: number;

  @ValidateIf((o) => o.id_tag !== undefined)
  @IsInt({ message: 'El campo "id_tag" debe ser un número entero.' })
  id_tag?: number;
}
