import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';

@Injectable()
export class FcmPushService {
    private readonly logger = new Logger(FcmPushService.name);

    constructor(private prisma: PrismaService) {
        if (!getApps().length) {
            initializeApp({
            credential: cert({
                projectId:   process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey:  process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
            }),
            });
        }
        }

        async enviarAToken(token: string, titulo: string, cuerpo: string, data?: Record<string, string>) {
        try {
            await getMessaging().send({
            token,
            notification: { title: titulo, body: cuerpo },
            data: data ?? {},
            android: { priority: 'high' },
            apns: { payload: { aps: { sound: 'default' } } },
            });
        } catch (error: any) {
            this.logger.warn(`Error enviando push a token: ${error.message}`);
        }
    }

    // ── Enviar a todos los admins y trabajadores (rol 1 y 3)
    async notificarAdmins(titulo: string, cuerpo: string, data?: Record<string, string>) {
        const admins = await this.prisma.usuario.findMany({
        where: {
            id_rol_usuario: { in: ['1', '3'] },
            fcm_token: { not: null },
            estado: 1,
        },
        select: { fcm_token: true },
        });

        for (const u of admins) {
        if (u.fcm_token) {
            await this.enviarAToken(u.fcm_token, titulo, cuerpo, data);
        }
        }
    }

    // ── Enviar a un usuario específico (para notificar al cliente)
    async notificarUsuario(id_usuario: string, titulo: string, cuerpo: string, data?: Record<string, string>) {
        const usuario = await this.prisma.usuario.findUnique({
        where: { id_usuario },
        select: { fcm_token: true },
        });

        if (usuario?.fcm_token) {
        await this.enviarAToken(usuario.fcm_token, titulo, cuerpo, data);
        }
    }
}