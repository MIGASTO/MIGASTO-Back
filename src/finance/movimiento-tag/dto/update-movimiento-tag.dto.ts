import { PartialType } from '@nestjs/mapped-types';
import { CreateMovimientoTagDto } from './create-movimiento-tag.dto';

export class UpdateMovimientoTagDto extends PartialType(CreateMovimientoTagDto) {}
