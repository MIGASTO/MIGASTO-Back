import { PartialType } from '@nestjs/mapped-types';
import { CreateTagDto } from './create-tag.dto';
import { IsNotEmpty, IsString, Matches, MaxLength } from 'class-validator';

export class UpdateTagDto extends PartialType(CreateTagDto) {
    @IsNotEmpty({ message: 'El nombre del tag es obligatorio.' })
      @IsString({ message: 'El nombre debe ser una cadena de texto.' })
      @MaxLength(50, { message: 'El nombre no puede tener más de 50 caracteres.' })
      @Matches(/^[a-zA-ZÀ-ÿ\u00f1\u00d1\s]+$/, {
        message: 'El nombre solo puede contener letras y espacios.',
      })
      nombre: string;
}

