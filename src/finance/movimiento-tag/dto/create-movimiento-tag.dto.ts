import { IsNotEmpty, IsInt } from 'class-validator';

export class CreateMovimientoTagDto {
  @IsNotEmpty()
  @IsInt()
  id_movimiento: number;

  @IsNotEmpty()
  @IsInt()
  id_tag: number;
}
