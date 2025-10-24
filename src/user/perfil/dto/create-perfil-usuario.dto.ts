import { IsNotEmpty, IsString, IsInt, IsUrl, IsOptional, Length, Min } from 'class-validator';



export class CreatePerfilUsuarioDto {
  @IsOptional()
  @IsString()
  @Length(3, 150)
  nombre_completo?: string;

  @IsOptional()
  @IsString()
  //@Min(18)
  edad?: string;

  @IsOptional()
  @IsUrl()
  foto_perfil?: string;

  @IsOptional()
  @IsString()
  @Length(7, 20)
  telefono?: string;

  @IsOptional()
  @IsInt()
  id_genero?: number;
}
