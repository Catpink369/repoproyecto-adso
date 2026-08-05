import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
    ) {}

    // LOGIN 
    async login(correo: string, contrasena: string) {
        const user = await this.prisma.usuario.findFirst({
            where: { correo },
        });

        if (!user || !user.contrasena) throw new UnauthorizedException('Credenciales inválidas');

        const passwordValid = await bcrypt.compare(contrasena, user.contrasena);
        if (!passwordValid) throw new UnauthorizedException('Credenciales inválidas');

        // Admin o trabajador = necesita código
        if (user.id_rol_usuario === '1' || user.id_rol_usuario === '3') {
            return { needs_code: true, user: this._safeUser(user) };
        }

        // Cliente
        return {
            success: true,
            user: this._safeUser(user),
        };
    }

    // VERIFICAR CÓDIGO (admin y trabajador)
    async verifyCode(id_usuario: string, codigo: string) {
        const user = await this.prisma.usuario.findUnique({
            where: { id_usuario },
        });

        if (!user || !user.codigo) throw new UnauthorizedException('Usuario no encontrado');

        const codeValid = await bcrypt.compare(codigo, user.codigo);
        if (!codeValid) throw new UnauthorizedException('Código incorrecto');

        return {
            success: true,
            user: this._safeUser(user),
        };
    }

    generateToken(user: any) {
        const payload = {
            sub: user.id_usuario,
            rol: user.id_rol_usuario,
        };
        return this.jwtService.sign(payload);
    }

    private _safeUser(user: any) {
        const { contrasena, codigo, ...safeUser } = user;
        return safeUser;
    }
}