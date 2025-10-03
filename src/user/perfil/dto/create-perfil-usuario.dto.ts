import { IsOptional, IsString, IsInt, IsUrl } from 'class-validator';

export class CreatePerfilUsuarioDto {
  @IsOptional()
  @IsString()
  nombre_completo?: string;

  @IsOptional()
  @IsInt()
  edad?: number;

  @IsOptional()
  @IsUrl()
  foto_perfil?: string;

  @IsOptional()
  @IsString()
  telefono?: string;

  @IsOptional()
  @IsInt()
  id_genero?: number;
}
