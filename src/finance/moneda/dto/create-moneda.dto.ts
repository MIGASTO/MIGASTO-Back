import { IsNotEmpty, IsString, IsNumber } from 'class-validator';

export class CreateMonedaDto {
  @IsNotEmpty()
  @IsString()
  codigo: string;

  @IsNotEmpty()
  @IsString()
  simbolo: string;

  @IsNumber()
  tasa_cambio: number;
}
