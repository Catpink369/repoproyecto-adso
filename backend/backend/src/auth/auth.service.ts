import { Injectable, UnauthorizedException, BadRequestException, ForbiddenException } from '@nestjs/common';
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

        // 1. Verificar si la cuenta está desactivada
        if (user.estado === 0) {
            throw new ForbiddenException('Tu cuenta se encuentra desactivada. Contacta al administrador.');
        }

        // 2. Verificar si el usuario se encuentra temporalmente bloqueado por intentos
        if (user.bloqueado_hasta) {
            const bloqueadoHastaDate = new Date(user.bloqueado_hasta);
            if (bloqueadoHastaDate > new Date()) {
                const segundosRestantes = Math.ceil(
                    (bloqueadoHastaDate.getTime() - Date.now()) / 1000,
                );
                throw new BadRequestException(
                    `Demasiados intentos fallidos. Intenta de nuevo en ${segundosRestantes} segundos.`,
                );
            }
        }

        // 3. Validar la contraseña
        const passwordValid = await bcrypt.compare(contrasena, user.contrasena);

        if (!passwordValid) {
            const intentosActuales = user.intentos_fallidos ?? 0;
            const nuevosIntentos = intentosActuales + 1;

            // Si llega a 5 intentos fallidos -> Bloqueo por 60 segundos
            if (nuevosIntentos >= 5) {
                const tiempoBloqueo = new Date(Date.now() + 60 * 1000);
                await this.prisma.usuario.update({
                    where: { id_usuario: user.id_usuario },
                    data: {
                        intentos_fallidos: 0,
                        bloqueado_hasta: tiempoBloqueo,
                    },
                });

                throw new BadRequestException(
                    'Has ingresado la contraseña incorrecta 5 veces. Cuenta bloqueada por 60 segundos.',
                );
            }

            // Registrar intento fallido
            await this.prisma.usuario.update({
                where: { id_usuario: user.id_usuario },
                data: { intentos_fallidos: nuevosIntentos },
            });

            const intentosRestantes = 5 - nuevosIntentos;
            throw new UnauthorizedException(
                `Contraseña incorrecta. Te quedan ${intentosRestantes} intento(s) antes del bloqueo.`,
            );
        }

        // 4. Si la contraseña es correcta, reiniciar contadores de bloqueo
        await this.prisma.usuario.update({
            where: { id_usuario: user.id_usuario },
            data: {
                intentos_fallidos: 0,
                bloqueado_hasta: null,
            },
        });

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

        // Validar si la cuenta está desactivada
        if (user.estado === 0) {
            throw new ForbiddenException('Tu cuenta se encuentra desactivada. Contacta al administrador.');
        }

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