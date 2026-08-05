//verifica si el usuario tiene un token JWT válido, excepto en las rutas marcadas como públicas

import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
    constructor(private reflector: Reflector) {
        super();
    }

    canActivate(context: ExecutionContext) {

        const request = context.switchToHttp().getRequest();
        if (request.url.startsWith('/uploads')) return true;
        
        // revisa si la ruta tiene el decorador @Public()
        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
        context.getHandler(),
        context.getClass(),
        ]);

        // si es pública deja pasar sin verificar token
        if (isPublic) return true;

        // si no es pública verifica el token JWT
        return super.canActivate(context);
    }
}