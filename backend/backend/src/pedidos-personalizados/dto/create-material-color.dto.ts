import { IsString, IsNotEmpty, MaxLength, IsOptional, Matches } from 'class-validator';

export class CreateMaterialColorDto {
    @IsString()
    @IsNotEmpty({ message: 'El nombre del color es obligatorio.' })
    @MaxLength(40, { message: 'El nombre no puede superar los 40 caracteres.' })
    nombre!: string;

    @IsOptional()
    @IsString()
    @Matches(/^#([0-9A-Fa-f]{6})$/, {
        message: 'codigo_hex debe tener el formato #RRGGBB.',
    })
    codigo_hex?: string;
}
