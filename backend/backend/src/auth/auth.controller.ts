import { Controller, Post, Body, Res } from '@nestjs/common';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { Public } from './decorators/public.decorator';
import { LoginDto } from './dto/login.dto';
import { VerifyCodeDto } from './dto/verify-code.dto';
//import { EnableCors } from './decorators/cors.decorator';

@Controller('auth') 
//@EnableCors()

export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Public()
    @Post('login')
    async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
        const result = await this.authService.login(dto.correo, dto.contrasena);

        // Si necesita código (admin/trabajador), no seteamos cookie aún
        if (result.needs_code) {
        return { needs_code: true, user: result.user };
        }

        res.cookie('access_token', this.authService.generateToken(result.user), {
            httpOnly: true,    
            secure: false,        // false en desarrollo (localhost no tiene HTTPS)
            sameSite: 'lax', 
            maxAge: 8 * 60 * 60 * 1000,
        });

        return { 
            success: true, 
            user: result.user,
            token: this.authService.generateToken(result.user), // devuelve el tocken para postman y swagger
        };
    }

    @Public()
    @Post('verify-code')
    async verifyCode(@Body() dto: VerifyCodeDto, @Res({ passthrough: true }) res: Response) {
        const result = await this.authService.verifyCode(dto.id_usuario, dto.codigo);

        res.cookie('access_token', this.authService.generateToken(result.user), {
            httpOnly: true,    
            secure: false,        // false en desarrollo (localhost no tiene HTTPS)
            sameSite: 'lax', 
            maxAge: 8 * 60 * 60 * 1000,
        });

        return { 
            success: true, 
            user: result.user,
            token: this.authService.generateToken(result.user),
        };
    }

    @Public()
    @Post('logout')
    logout(@Res({ passthrough: true }) res: Response) {
        res.clearCookie('access_token');
        return { success: true };
    }
}