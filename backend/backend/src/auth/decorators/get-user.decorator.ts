import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GetUser = createParamDecorator(
    (data: unknown, ctx: ExecutionContext) => { // ctx representa la petición HTTP actual
        const request = ctx.switchToHttp().getRequest(); // obtiene la petición completa
        return request.user; // devuelve el usuario que está dentro de la petición
    },
);