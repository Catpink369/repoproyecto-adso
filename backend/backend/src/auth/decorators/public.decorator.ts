import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

SetMetadata        //función de NestJS que pega una etiqueta a una ruta
IS_PUBLIC_KEY      // nombre de la etiqueta, es una constante para evitar errores de tipeo
Public             //es el decorador que usarás en los controllers: @Public()s