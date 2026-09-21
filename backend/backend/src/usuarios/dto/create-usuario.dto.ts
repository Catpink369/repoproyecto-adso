import {
  IsNotEmpty,
  IsString,
  IsEmail,
  IsOptional,
  MaxLength,
  MinLength,
  IsInt,
  IsPositive,
  Matches,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';

/** Solo letras (incluye tildes y ñ) y espacios — nombres/apellidos */
const SOLO_LETRAS =
  /^[A-Za-zÁÉÍÓÚáéíóúÄËÏÖÜäëïöüÑñÜü\s]+$/;

export class CreateUsuarioDto {
  @IsString()
  @IsNotEmpty({ message: 'El número de documento es obligatorio' })
  @MaxLength(15, { message: 'El número de documento no puede tener más de 15 caracteres' })
  @Matches(/^[0-9A-Za-z-]+$/, {
    message: 'El número de documento solo puede contener números, letras y guiones',
  })
  id_usuario: string;

  @IsString()
  @IsNotEmpty({ message: 'El primer nombre es obligatorio' })
  @MaxLength(50, { message: 'El primer nombre no puede tener más de 50 caracteres' })
  @Matches(SOLO_LETRAS, {
    message: 'El primer nombre solo puede contener letras y espacios (sin números ni caracteres especiales)',
  })
  nom_1: string;

  @IsString()
  @IsOptional()
  @MaxLength(50, { message: 'El segundo nombre no puede tener más de 50 caracteres' })
  @Matches(SOLO_LETRAS, {
    message: 'El segundo nombre solo puede contener letras y espacios (sin números ni caracteres especiales)',
  })
  nom_2?: string;

  @IsString()
  @IsNotEmpty({ message: 'El primer apellido es obligatorio' })
  @MaxLength(50, { message: 'El primer apellido no puede tener más de 50 caracteres' })
  @Matches(SOLO_LETRAS, {
    message: 'El primer apellido solo puede contener letras y espacios (sin números ni caracteres especiales)',
  })
  ape_1: string;

  @IsString()
  @IsOptional()
  @MaxLength(50, { message: 'El segundo apellido no puede tener más de 50 caracteres' })
  @Matches(SOLO_LETRAS, {
    message: 'El segundo apellido solo puede contener letras y espacios (sin números ni caracteres especiales)',
  })
  ape_2?: string;

  @IsEmail({}, { message: 'El correo electrónico no es válido' })
  @IsNotEmpty({ message: 'El correo electrónico es obligatorio' })
  @MaxLength(40, { message: 'El correo no puede tener más de 40 caracteres' })
  correo: string;

  @Type(() => Number)
  @IsInt({ message: 'El teléfono debe contener solo números enteros (sin letras ni símbolos)' })
  @IsPositive({ message: 'El teléfono debe ser un número positivo' })
  @Min(1000000, { message: 'El teléfono debe tener al menos 7 dígitos' })
  @Max(999999999999999, { message: 'El teléfono no puede tener más de 15 dígitos' })
  @IsNotEmpty({ message: 'El teléfono es obligatorio' })
  telefono: number;

  @IsString()
  @IsNotEmpty({ message: 'La contraseña es obligatoria' })
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  contrasena: string;

  @IsString()
  @IsOptional()
  codigo?: string;

  @IsString()
  @IsNotEmpty({ message: 'El rol es obligatorio' })
  id_rol_usuario: string;

  @IsString()
  @IsNotEmpty({ message: 'El tipo de documento es obligatorio' })
  t_doc: string;

  @IsString()
  @IsOptional()
  img_perfil?: string;

  @IsOptional()
  estado?: number;
}
