import { Injectable, NestMiddleware, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
    use(req: Request, res: Response, next: NextFunction) {
        const apiKey = req.headers['x-api-key']; 

        if (!apiKey) {
            throw new HttpException('No autorizado', HttpStatus.UNAUTHORIZED);
        }

        if (apiKey !== process.env.API_KEY) {
            throw new HttpException('Acceso denegado', HttpStatus.FORBIDDEN);
        }

        next();
    }
} 