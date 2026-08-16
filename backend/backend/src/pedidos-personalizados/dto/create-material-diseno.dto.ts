import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class CreateMaterialDisenoDto {
    @IsString()
    @IsNotEmpty({ message: 'El nombre del diseño es obligatorio.' })
    @MaxLength(60, { message: 'El nombre no puede superar los 60 caracteres.' })
    nombre!: string;
}
