// NOTA: implemetar validaciones y http status

import { IsNotEmpty, IsString, Min} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCategoriaDto {

        @IsString()
        @IsNotEmpty({ message: 'El nombre de la categoría es obligatorio' })
        @Min(1, { message: 'El nombre de la categoría debe tener al menos 1 caracteres' })
        @Type(() => String)
        nombre_c: string;

        @IsString()
        @IsNotEmpty({ message: 'La descripción de la categoría es obligatoria' })
        @Min(1, { message: 'La descripción de la categoría debe tener al menos 1 caracteres' })
        @Type(() => String)
        descripcion?: string;
}
