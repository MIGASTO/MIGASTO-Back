import { IsNotEmpty, IsString, IsInt, IsOptional } from 'class-validator';

export class CreateGeneroDto {
  @IsNotEmpty()
  @IsString()
  nombre: string;

  @IsOptional()
  @IsNotEmpty()
  @IsInt()
  id_perfil: number;
}
