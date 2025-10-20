import { IsNotEmpty, IsString, IsInt, IsUrl, IsOptional, Length, Min } from 'class-validator';

export class CreatePerfilUsuarioDto {
  @IsNotEmpty({ message: 'El nombre completo es obligatorio.' })
  @IsString({ message: 'El nombre completo debe ser una cadena de texto.' })
  @Length(3, 150, { message: 'El nombre completo debe tener entre 3 y 150 caracteres.' })
  nombre_completo: string;

  @IsNotEmpty({ message: 'La edad es obligatoria.' })
  @IsInt({ message: 'La edad debe ser un número entero.' })
  @Min(18, { message: 'Debes ser mayor de 18 años.' })
  edad: number;

  @IsOptional()
  @IsUrl({}, { message: 'La foto de perfil debe ser una URL válida.' })
  foto_perfil?: string;

  @IsNotEmpty({ message: 'El teléfono es obligatorio.' })
  @IsString({ message: 'El teléfono debe ser una cadena de texto.' })
  @Length(7, 20, { message: 'El teléfono debe tener entre 7 y 20 caracteres.' })
  telefono: string;

  @IsNotEmpty({ message: 'El género es obligatorio.' })
  @IsInt({ message: 'El ID del género debe ser un número entero.' })
  id_genero: number;
}
