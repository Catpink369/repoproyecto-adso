// auth/dto/verify-code.dto.ts
import { IsNotEmpty, IsString } from 'class-validator';

export class VerifyCodeDto {
    @IsString()
    @IsNotEmpty({ message: 'El ID del usuario es obligatorio' })
    id_usuario: string;

    @IsString()
    @IsNotEmpty({ message: 'El código es obligatorio' })
    codigo: string;
}