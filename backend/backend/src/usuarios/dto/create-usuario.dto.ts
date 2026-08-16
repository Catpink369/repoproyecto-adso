import { IsNotEmpty, IsString, IsEmail, IsOptional, MaxLength, MinLength, IsInt, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';
//import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUsuarioDto {

    //@ApiProperty({ example: 'Us-01', description: 'ID único del usuario', maxLength: 15 }) // para Swagger
    @IsString()
    @IsNotEmpty({ message: 'El ID es obligatorio' })
    @MaxLength(15, { message: 'El ID no puede tener más de 15 caracteres' })
    id_usuario: string;

    //@ApiProperty({ example: 'Juan', description: 'Primer nombre del usuario', maxLength: 50 }) //datos para Swagger
    @IsString()
    @IsNotEmpty({ message: 'El primer nombre es obligatorio' })
    @MaxLength(50, { message: 'El primer nombre no puede tener más de 50 caracteres' })
    nom_1: string;

    //@ApiPropertyOptional({ example: 'Carlos', description: 'Segundo nombre del usuario', maxLength: 50 }) //datos para Swagger
    @IsString()
    @IsOptional()
    @MaxLength(50, { message: 'El segundo nombre no puede tener más de 50 caracteres' })
    nom_2?: string;

    //@ApiProperty({ example: 'Pérez', description: 'Primer apellido del usuario', maxLength: 50 }) //datos para Swagger
    @IsString()
    @IsNotEmpty({ message: 'El primer apellido es obligatorio' })
    @MaxLength(50, { message: 'El primer apellido no puede tener más de 50 caracteres' })
    ape_1: string;

    //@ApiPropertyOptional({ example: 'Gómez', description: 'Segundo apellido del usuario', maxLength: 50 }) //datos para Swagger
    @IsString()
    @IsOptional()
    @MaxLength(50, { message: 'El segundo apellido no puede tener más de 50 caracteres' })
    ape_2?: string;

    //@ApiProperty({ example: 'juan.perez@example.com', description: 'Correo electrónico del usuario', maxLength: 40 }) //datos para Swagger
    @IsEmail({}, { message: 'El correo no es válido' })
    @IsNotEmpty({ message: 'El correo es obligatorio' })
    @MaxLength(40, { message: 'El correo no puede tener más de 40 caracteres' })
    correo: string;

    //@ApiProperty({ example: 1234567890, description: 'Número de teléfono del usuario' }) //datos para Swagger
    @Type(() => Number)
    @IsInt({ message: 'El teléfono debe ser un número entero' })
    @IsPositive({ message: 'El teléfono debe ser un número positivo' })
    @IsNotEmpty({ message: 'El teléfono es obligatorio' })
    telefono: number;

    //@ApiProperty({ example: 'password123', description: 'Contraseña del usuario', minLength: 6 }) //datos para Swagger
    @IsString()
    @IsNotEmpty({ message: 'La contraseña es obligatoria' })
    @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
    contrasena: string;

    @IsString()
    @IsOptional()
    codigo?: string;

    //@ApiProperty({ example: '2', description: 'ID del rol del usuario' }) //datos para Swagger
    @IsString()
    @IsNotEmpty({ message: 'El rol es obligatorio' })
    id_rol_usuario: string;

    //@ApiProperty({ example: 'CC', description: 'Tipo de documento del usuario' }) //datos para Swagger
    @IsString()
    @IsNotEmpty({ message: 'El tipo de documento es obligatorio' })
    t_doc: string;

    @IsString()
    @IsOptional()
    img_perfil?: string;

    @IsOptional()
    estado?: number
}