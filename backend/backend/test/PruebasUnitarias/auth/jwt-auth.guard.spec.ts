// pruebas que reuieren validar el guard de jwt
// RF-007.1 (CP-004)

import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtAuthGuard } from '../../../src/auth/guards/jwt-auth.guard';
import { IS_PUBLIC_KEY } from '../../../src/auth/decorators/public.decorator';

describe('Usuario sin permisos no puede realizar acciones protegidas', () => {
    let guard: JwtAuthGuard;
    let reflector: Reflector;

    beforeEach(() => {
        reflector = new Reflector();
        guard = new JwtAuthGuard(reflector);
    });

    function mockContext(url = '/pedidos/crear', isPublic = false) {
        jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(isPublic);
        return {
        switchToHttp: () => ({ getRequest: () => ({ url }) }),
        getHandler: () => ({}),
        getClass: () => ({}),
        } as unknown as ExecutionContext;
    }

    it('RF-007.1 - CP-004: Un usuario sin sesión iniciada no puede registrar un pedido', () => {
        const context = mockContext('/pedidos/crear', false);
        const superCanActivate = jest
        .spyOn(Object.getPrototypeOf(JwtAuthGuard.prototype), 'canActivate')
        .mockReturnValue(false); // simula que Passport rechaza por falta de token

        const resultado = guard.canActivate(context);

        expect(superCanActivate).toHaveBeenCalledWith(context);
        expect(resultado).toBe(false);
        superCanActivate.mockRestore();
    });

    it('una ruta marcada @Public() deja pasar sin verificar token', () => {
        const context = mockContext('/auth/login', true);
        expect(guard.canActivate(context)).toBe(true);
    });
});